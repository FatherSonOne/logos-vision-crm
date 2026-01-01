/**
 * Entomate Webhook Handler
 *
 * This module handles incoming webhooks from Entomate for real-time sync.
 * In a production environment, these handlers would be called by a backend API.
 *
 * Webhook Types:
 * - action_item.created: New action item from a meeting
 * - action_item.updated: Action item status/details changed
 * - action_item.deleted: Action item removed
 * - meeting.completed: Meeting finished with summary/action items
 * - project.created: New project in Entomate
 * - project.updated: Project details changed
 */

import { entomateService } from './entomateService';
import type {
  EntoamteActionItem,
  EntomateMeeting,
  EntoamteProject,
  EntomateSyncResult,
} from '../types';

// ============================================
// WEBHOOK PAYLOAD TYPES
// ============================================

export type WebhookEventType =
  | 'action_item.created'
  | 'action_item.updated'
  | 'action_item.deleted'
  | 'action_item.batch'
  | 'meeting.completed'
  | 'meeting.updated'
  | 'project.created'
  | 'project.updated'
  | 'project.linked';

export interface WebhookPayload<T = unknown> {
  event: WebhookEventType;
  timestamp: string;
  data: T;
  metadata?: {
    source: 'entomate';
    version: string;
    correlationId?: string;
  };
}

export interface ActionItemPayload {
  actionItem: EntoamteActionItem;
  meetingId?: string;
  meetingTitle?: string;
}

export interface ActionItemBatchPayload {
  actionItems: EntoamteActionItem[];
  meetingId: string;
  meetingTitle?: string;
}

export interface MeetingPayload {
  meeting: EntomateMeeting;
  actionItems?: EntoamteActionItem[];
  teamMemberId: string;
}

export interface ProjectPayload {
  project: EntoamteProject;
  clientId?: string;
  linkToProjectId?: string;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  results?: EntomateSyncResult[];
  error?: string;
}

// ============================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================

/**
 * Verify webhook signature (HMAC-SHA256)
 * In production, use a proper crypto library
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Use Web Crypto API for signature verification
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// ============================================
// WEBHOOK EVENT HANDLERS
// ============================================

/**
 * Handle action_item.created event
 */
async function handleActionItemCreated(
  payload: ActionItemPayload
): Promise<WebhookResponse> {
  const { actionItem, meetingTitle } = payload;

  const result = await entomateService.syncActionItem(actionItem, meetingTitle);

  return {
    success: result.success,
    message: result.success
      ? `Task created: ${result.crmTaskId}`
      : `Failed to create task: ${result.error}`,
    results: [result],
  };
}

/**
 * Handle action_item.updated event
 */
async function handleActionItemUpdated(
  payload: ActionItemPayload
): Promise<WebhookResponse> {
  const { actionItem, meetingTitle } = payload;

  // Find existing task
  const existingTask = await entomateService.findTaskByEntoamteId(actionItem.id);

  if (existingTask) {
    const updated = await entomateService.updateTaskFromActionItem(
      existingTask.id,
      actionItem
    );
    return {
      success: updated,
      message: updated ? 'Task updated successfully' : 'Failed to update task',
    };
  }

  // Create new if doesn't exist
  const result = await entomateService.syncActionItem(actionItem, meetingTitle);
  return {
    success: result.success,
    message: result.success ? 'Task created (not found for update)' : result.error || 'Failed',
    results: [result],
  };
}

/**
 * Handle action_item.deleted event
 */
async function handleActionItemDeleted(
  payload: ActionItemPayload
): Promise<WebhookResponse> {
  const { actionItem } = payload;

  const result = await entomateService.handleActionItemWebhook({
    action: 'delete',
    actionItem,
  });

  return {
    success: result.success,
    message: result.success ? 'Task marked as deleted' : result.error || 'Failed',
    results: [result],
  };
}

/**
 * Handle action_item.batch event (multiple action items from one meeting)
 */
async function handleActionItemBatch(
  payload: ActionItemBatchPayload
): Promise<WebhookResponse> {
  const { actionItems, meetingTitle } = payload;

  const results = await entomateService.syncActionItems(actionItems, meetingTitle);

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return {
    success: failCount === 0,
    message: `Synced ${successCount}/${results.length} action items${failCount > 0 ? ` (${failCount} failed)` : ''}`,
    results,
  };
}

/**
 * Handle meeting.completed event
 */
async function handleMeetingCompleted(
  payload: MeetingPayload
): Promise<WebhookResponse> {
  const { meeting, actionItems, teamMemberId } = payload;
  const results: EntomateSyncResult[] = [];

  // Check if activity already exists
  const existingActivity = await entomateService.findActivityByEntomateMeetingId(meeting.id);

  if (!existingActivity) {
    // Create activity from meeting
    const activity = await entomateService.createActivityFromMeeting(meeting, teamMemberId);
    if (!activity) {
      return {
        success: false,
        message: 'Failed to create activity from meeting',
        error: 'Activity creation failed',
      };
    }
  }

  // Sync action items if provided
  if (actionItems && actionItems.length > 0) {
    const actionResults = await entomateService.syncActionItems(actionItems, meeting.title);
    results.push(...actionResults);
  }

  const successCount = results.filter(r => r.success).length;

  return {
    success: true,
    message: `Meeting synced. ${results.length > 0 ? `${successCount}/${results.length} action items synced.` : ''}`,
    results,
  };
}

/**
 * Handle meeting.updated event
 */
async function handleMeetingUpdated(
  payload: MeetingPayload
): Promise<WebhookResponse> {
  const { meeting, teamMemberId } = payload;

  const result = await entomateService.handleMeetingWebhook({
    action: 'update',
    meeting,
    teamMemberId,
  });

  return {
    success: result.success,
    message: result.success ? 'Meeting activity updated' : result.error || 'Failed',
  };
}

/**
 * Handle project.created event
 */
async function handleProjectCreated(
  payload: ProjectPayload
): Promise<WebhookResponse> {
  const { project, clientId } = payload;

  // Check if already linked
  const existing = await entomateService.findProjectByEntoamteId(project.id);
  if (existing) {
    return {
      success: true,
      message: `Project already linked: ${existing.id}`,
    };
  }

  const created = await entomateService.createProjectFromEntomate(project, clientId);

  return {
    success: !!created,
    message: created ? `Project created: ${created.id}` : 'Failed to create project',
  };
}

/**
 * Handle project.updated event
 */
async function handleProjectUpdated(
  payload: ProjectPayload
): Promise<WebhookResponse> {
  const { project } = payload;

  const existing = await entomateService.findProjectByEntoamteId(project.id);

  if (!existing) {
    return {
      success: false,
      message: 'Project not found in Logos Vision',
      error: 'Project not linked',
    };
  }

  // Update project would go here
  // For now, just acknowledge
  return {
    success: true,
    message: `Project ${existing.id} acknowledged for update`,
  };
}

/**
 * Handle project.linked event (manual linking)
 */
async function handleProjectLinked(
  payload: ProjectPayload
): Promise<WebhookResponse> {
  const { project, linkToProjectId } = payload;

  if (!linkToProjectId) {
    return {
      success: false,
      message: 'linkToProjectId required for project.linked event',
      error: 'Missing linkToProjectId',
    };
  }

  const linked = await entomateService.linkEntoamteProject(project.id, linkToProjectId);

  return {
    success: linked,
    message: linked ? 'Project linked successfully' : 'Failed to link project',
  };
}

// ============================================
// MAIN WEBHOOK PROCESSOR
// ============================================

/**
 * Process incoming webhook from Entomate
 */
export async function processWebhook(
  payload: WebhookPayload
): Promise<WebhookResponse> {
  console.log(`[Entomate Webhook] Processing event: ${payload.event}`);

  try {
    switch (payload.event) {
      case 'action_item.created':
        return handleActionItemCreated(payload.data as ActionItemPayload);

      case 'action_item.updated':
        return handleActionItemUpdated(payload.data as ActionItemPayload);

      case 'action_item.deleted':
        return handleActionItemDeleted(payload.data as ActionItemPayload);

      case 'action_item.batch':
        return handleActionItemBatch(payload.data as ActionItemBatchPayload);

      case 'meeting.completed':
        return handleMeetingCompleted(payload.data as MeetingPayload);

      case 'meeting.updated':
        return handleMeetingUpdated(payload.data as MeetingPayload);

      case 'project.created':
        return handleProjectCreated(payload.data as ProjectPayload);

      case 'project.updated':
        return handleProjectUpdated(payload.data as ProjectPayload);

      case 'project.linked':
        return handleProjectLinked(payload.data as ProjectPayload);

      default:
        return {
          success: false,
          message: `Unknown event type: ${payload.event}`,
          error: 'UNKNOWN_EVENT',
        };
    }
  } catch (error) {
    console.error('[Entomate Webhook] Error processing webhook:', error);
    return {
      success: false,
      message: 'Internal error processing webhook',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// WEBHOOK ENDPOINT SIMULATOR (for testing)
// ============================================

/**
 * Simulate receiving a webhook (for testing without a backend)
 */
export async function simulateWebhook(
  event: WebhookEventType,
  data: unknown
): Promise<WebhookResponse> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
    metadata: {
      source: 'entomate',
      version: '1.0',
      correlationId: crypto.randomUUID(),
    },
  };

  return processWebhook(payload);
}

// Export for use in components
export const entomateWebhookHandler = {
  processWebhook,
  simulateWebhook,
  verifyWebhookSignature,
};

export default entomateWebhookHandler;
