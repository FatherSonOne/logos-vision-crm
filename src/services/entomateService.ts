/**
 * Entomate Integration Service
 *
 * This service handles bidirectional sync between Logos Vision CRM and Entomate.
 * Entomate syncs meeting action items, meetings, and projects to Logos Vision.
 *
 * Data Flow:
 * - Entomate Action Items → Logos Vision Tasks
 * - Entomate Meetings → Logos Vision Activities
 * - Entomate Projects → Logos Vision Projects (linked)
 */

import { supabase } from './supabaseClient';
import type {
  Task,
  TaskStatus,
  Activity,
  ActivityType,
  Project,
  TeamMember,
  EntoamteActionItem,
  EntomateMeeting,
  EntoamteProject,
  EntomateSyncResult,
  EntomateSyncSummary,
  EntomateSyncLog,
  EntoamteIntegrationConfig,
  EntomatePriority,
} from '../types';

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CONFIG: EntoamteIntegrationConfig = {
  enabled: true,
  autoSync: true,
  syncFrequency: '5min',
  defaultTeamMemberId: null,
  syncActionItems: true,
  syncMeetings: true,
  syncProjects: true,
  createActivitiesFromMeetings: true,
};

/**
 * Get current Entomate integration configuration
 */
export async function getConfig(): Promise<EntoamteIntegrationConfig> {
  try {
    const stored = localStorage.getItem('entomate_integration_config');
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading Entomate config:', error);
  }
  return DEFAULT_CONFIG;
}

/**
 * Save Entomate integration configuration
 */
export async function saveConfig(config: Partial<EntoamteIntegrationConfig>): Promise<void> {
  const current = await getConfig();
  const updated = { ...current, ...config };
  localStorage.setItem('entomate_integration_config', JSON.stringify(updated));
}

// ============================================
// TEAM MEMBER LOOKUP
// ============================================

/**
 * Find a team member by name (fuzzy match)
 */
export async function findTeamMemberByName(name: string): Promise<TeamMember | null> {
  if (!name) return null;

  // Try exact match first (case-insensitive)
  const { data: exactMatch, error: exactError } = await supabase
    .from('team_members')
    .select('id, name, email, role')
    .ilike('name', name)
    .limit(1)
    .single();

  if (exactMatch && !exactError) {
    return exactMatch as TeamMember;
  }

  // Try partial match (contains search term)
  const { data: partialMatches, error: partialError } = await supabase
    .from('team_members')
    .select('id, name, email, role')
    .ilike('name', `%${name}%`)
    .limit(5);

  if (partialError) {
    console.error('Error searching team members:', partialError);
    return null;
  }

  if (partialMatches && partialMatches.length > 0) {
    // Return best match (shortest name containing search term)
    return partialMatches.sort((a, b) => a.name.length - b.name.length)[0] as TeamMember;
  }

  return null;
}

/**
 * Find a team member by email
 */
export async function findTeamMemberByEmail(email: string): Promise<TeamMember | null> {
  if (!email) return null;

  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, email, role')
    .ilike('email', email)
    .limit(1)
    .single();

  if (error) {
    console.error('Error finding team member by email:', error);
    return null;
  }

  return data as TeamMember;
}

/**
 * Get all team members
 */
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, email, role')
    .order('name');

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  return (data || []) as TeamMember[];
}

// ============================================
// PRIORITY MAPPING
// ============================================

function mapPriorityToLogos(priority: EntomatePriority): string {
  switch (priority) {
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    default: return 'Medium';
  }
}

function mapStatusToLogos(status: string): TaskStatus {
  switch (status) {
    case 'complete': return 'Done' as TaskStatus;
    case 'in_progress': return 'In Progress' as TaskStatus;
    case 'pending':
    default: return 'To Do' as TaskStatus;
  }
}

// ============================================
// ACTION ITEM → TASK SYNC
// ============================================

/**
 * Create a task in Logos Vision from an Entomate action item
 */
export async function createTaskFromActionItem(
  actionItem: EntoamteActionItem,
  meetingTitle?: string
): Promise<{ id: string } | null> {
  try {
    // Find team member by name or email
    let teamMemberId: string | null = null;

    if (actionItem.assigned_to_email) {
      const member = await findTeamMemberByEmail(actionItem.assigned_to_email);
      if (member) teamMemberId = member.id;
    }

    if (!teamMemberId && actionItem.assigned_to_name) {
      const member = await findTeamMemberByName(actionItem.assigned_to_name);
      if (member) teamMemberId = member.id;
    }

    // Build notes with Entomate reference for traceability
    const noteParts: string[] = [];
    if (meetingTitle) {
      noteParts.push(`📋 From Entomate Meeting: ${meetingTitle}`);
    } else {
      noteParts.push('📋 Synced from Entomate');
    }
    noteParts.push(`Priority: ${mapPriorityToLogos(actionItem.priority)}`);
    noteParts.push(`Entomate ID: ${actionItem.id}`);
    if (actionItem.meeting_id) {
      noteParts.push(`Meeting ID: ${actionItem.meeting_id}`);
    }

    const taskData = {
      description: actionItem.task_description,
      team_member_id: teamMemberId,
      due_date: actionItem.due_date || null,
      status: mapStatusToLogos(actionItem.status),
      notes: noteParts.join('\n'),
      // Store Entomate reference for bidirectional sync
      entomate_action_item_id: actionItem.id,
      entomate_meeting_id: actionItem.meeting_id,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating task from action item:', error);
      return null;
    }

    // Log the sync operation
    await logSyncOperation({
      source_type: 'action_item',
      source_id: actionItem.id,
      destination_type: 'task',
      destination_id: data.id,
      status: 'synced',
    });

    return data;
  } catch (error) {
    console.error('Error creating task from action item:', error);
    return null;
  }
}

/**
 * Update an existing task from an Entomate action item
 */
export async function updateTaskFromActionItem(
  taskId: string,
  actionItem: EntoamteActionItem
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        description: actionItem.task_description,
        due_date: actionItem.due_date || null,
        status: mapStatusToLogos(actionItem.status),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating task from action item:', error);
    return false;
  }
}

/**
 * Sync a single action item from Entomate to Logos Vision
 */
export async function syncActionItem(
  actionItem: EntoamteActionItem,
  meetingTitle?: string
): Promise<EntomateSyncResult> {
  try {
    // Check if already synced (has existing task)
    if (actionItem.crm_task_id) {
      // Update existing task
      const updated = await updateTaskFromActionItem(actionItem.crm_task_id, actionItem);
      return {
        success: updated,
        actionItemId: actionItem.id,
        crmTaskId: actionItem.crm_task_id,
        error: updated ? undefined : 'Failed to update existing task',
      };
    }

    // Create new task
    const task = await createTaskFromActionItem(actionItem, meetingTitle);

    if (!task) {
      return {
        success: false,
        actionItemId: actionItem.id,
        error: 'Failed to create task in Logos Vision',
      };
    }

    return {
      success: true,
      actionItemId: actionItem.id,
      crmTaskId: task.id,
    };
  } catch (error) {
    return {
      success: false,
      actionItemId: actionItem.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// MEETING → ACTIVITY SYNC
// ============================================

/**
 * Create an activity in Logos Vision from an Entomate meeting
 */
export async function createActivityFromMeeting(
  meeting: EntomateMeeting,
  teamMemberId: string
): Promise<{ id: string } | null> {
  try {
    // Build notes with meeting summary and key points
    const noteParts: string[] = [];
    noteParts.push('📋 Synced from Entomate');
    noteParts.push(`Entomate Meeting ID: ${meeting.id}`);

    if (meeting.summary) {
      noteParts.push('\n--- Summary ---');
      noteParts.push(meeting.summary);
    }

    if (meeting.key_points && meeting.key_points.length > 0) {
      noteParts.push('\n--- Key Points ---');
      meeting.key_points.forEach((point, i) => {
        noteParts.push(`${i + 1}. ${point}`);
      });
    }

    if (meeting.decisions && meeting.decisions.length > 0) {
      noteParts.push('\n--- Decisions ---');
      meeting.decisions.forEach((decision, i) => {
        noteParts.push(`${i + 1}. ${decision}`);
      });
    }

    if (meeting.attendees && meeting.attendees.length > 0) {
      noteParts.push(`\nAttendees: ${meeting.attendees.join(', ')}`);
    }

    const activityData = {
      type: 'Meeting' as ActivityType,
      title: meeting.title,
      activity_date: meeting.meeting_date.split('T')[0], // YYYY-MM-DD
      activity_time: meeting.meeting_date.includes('T')
        ? meeting.meeting_date.split('T')[1]?.substring(0, 5)
        : undefined,
      status: 'Completed',
      notes: noteParts.join('\n'),
      created_by_id: teamMemberId,
      // Store Entomate reference
      entomate_meeting_id: meeting.id,
    };

    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating activity from meeting:', error);
      return null;
    }

    // Log the sync operation
    await logSyncOperation({
      source_type: 'meeting',
      source_id: meeting.id,
      destination_type: 'activity',
      destination_id: data.id,
      status: 'synced',
    });

    return data;
  } catch (error) {
    console.error('Error creating activity from meeting:', error);
    return null;
  }
}

// ============================================
// PROJECT SYNC
// ============================================

/**
 * Link an Entomate project to a Logos Vision project
 */
export async function linkEntoamteProject(
  entoamteProjectId: string,
  logosProjectId: string
): Promise<boolean> {
  try {
    // Update the Logos Vision project with the Entomate reference
    const { error } = await supabase
      .from('projects')
      .update({
        entomate_project_id: entoamteProjectId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', logosProjectId);

    if (error) {
      console.error('Error linking Entomate project:', error);
      return false;
    }

    // Log the sync operation
    await logSyncOperation({
      source_type: 'project',
      source_id: entoamteProjectId,
      destination_type: 'project',
      destination_id: logosProjectId,
      status: 'synced',
    });

    return true;
  } catch (error) {
    console.error('Error linking Entomate project:', error);
    return false;
  }
}

/**
 * Create a Logos Vision project from an Entomate project
 */
export async function createProjectFromEntomate(
  entoamteProject: EntoamteProject,
  clientId?: string
): Promise<{ id: string } | null> {
  try {
    const projectData = {
      name: entoamteProject.name,
      description: `Synced from Entomate. Deal Value: ${entoamteProject.deal_value ? `$${entoamteProject.deal_value}` : 'N/A'}`,
      client_id: clientId || null,
      status: entoamteProject.status || 'Planning',
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      entomate_project_id: entoamteProject.id,
      entomate_deal_id: entoamteProject.crm_deal_id,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating project from Entomate:', error);
      return null;
    }

    // Log the sync operation
    await logSyncOperation({
      source_type: 'project',
      source_id: entoamteProject.id,
      destination_type: 'project',
      destination_id: data.id,
      status: 'synced',
    });

    return data;
  } catch (error) {
    console.error('Error creating project from Entomate:', error);
    return null;
  }
}

// ============================================
// SYNC LOGGING
// ============================================

/**
 * Log a sync operation for audit trail
 */
async function logSyncOperation(log: Omit<EntomateSyncLog, 'id' | 'retry_count' | 'created_at'>): Promise<void> {
  try {
    await supabase.from('entomate_sync_logs').insert([{
      ...log,
      retry_count: 0,
      created_at: new Date().toISOString(),
    }]);
  } catch (error) {
    console.error('Error logging sync operation:', error);
  }
}

/**
 * Get sync logs for debugging
 */
export async function getSyncLogs(limit: number = 50): Promise<EntomateSyncLog[]> {
  const { data, error } = await supabase
    .from('entomate_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sync logs:', error);
    return [];
  }

  return data || [];
}

// ============================================
// SYNC STATUS
// ============================================

/**
 * Get overall sync status summary
 */
export async function getSyncSummary(): Promise<EntomateSyncSummary> {
  try {
    const { data: logs, error } = await supabase
      .from('entomate_sync_logs')
      .select('status, created_at')
      .order('created_at', { ascending: false });

    if (error || !logs) {
      return { total: 0, synced: 0, pending: 0, failed: 0, lastSyncAt: null };
    }

    const synced = logs.filter(l => l.status === 'synced').length;
    const pending = logs.filter(l => l.status === 'pending').length;
    const failed = logs.filter(l => l.status === 'failed').length;
    const lastSyncAt = logs.length > 0 ? logs[0].created_at : null;

    return {
      total: logs.length,
      synced,
      pending,
      failed,
      lastSyncAt,
    };
  } catch (error) {
    console.error('Error getting sync summary:', error);
    return { total: 0, synced: 0, pending: 0, failed: 0, lastSyncAt: null };
  }
}

// ============================================
// BULK SYNC OPERATIONS
// ============================================

/**
 * Sync multiple action items from Entomate
 */
export async function syncActionItems(
  actionItems: EntoamteActionItem[],
  meetingTitle?: string
): Promise<EntomateSyncResult[]> {
  const results: EntomateSyncResult[] = [];

  for (const actionItem of actionItems) {
    const result = await syncActionItem(actionItem, meetingTitle);
    results.push(result);
  }

  return results;
}

/**
 * Find existing task by Entomate action item ID
 */
export async function findTaskByEntoamteId(actionItemId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('entomate_action_item_id', actionItemId)
    .single();

  if (error) {
    return null;
  }

  return data as Task;
}

/**
 * Find existing activity by Entomate meeting ID
 */
export async function findActivityByEntomateMeetingId(meetingId: string): Promise<Activity | null> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('entomate_meeting_id', meetingId)
    .single();

  if (error) {
    return null;
  }

  return data as Activity;
}

/**
 * Find existing project by Entomate project ID
 */
export async function findProjectByEntoamteId(entoamteProjectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('entomate_project_id', entoamteProjectId)
    .single();

  if (error) {
    return null;
  }

  return data as Project;
}

// ============================================
// WEBHOOK HANDLERS (for real-time sync)
// ============================================

/**
 * Handle incoming webhook from Entomate for action item sync
 */
export async function handleActionItemWebhook(payload: {
  action: 'create' | 'update' | 'delete';
  actionItem: EntoamteActionItem;
  meetingTitle?: string;
}): Promise<EntomateSyncResult> {
  const { action, actionItem, meetingTitle } = payload;

  switch (action) {
    case 'create':
    case 'update':
      return syncActionItem(actionItem, meetingTitle);

    case 'delete':
      // Find and optionally delete the linked task
      const task = await findTaskByEntoamteId(actionItem.id);
      if (task) {
        // Mark task as cancelled or delete based on config
        await supabase
          .from('tasks')
          .update({ status: 'Done', notes: `${task.notes}\n\n[Deleted in Entomate]` })
          .eq('id', task.id);
      }
      return { success: true, actionItemId: actionItem.id };

    default:
      return { success: false, actionItemId: actionItem.id, error: `Unknown action: ${action}` };
  }
}

/**
 * Handle incoming webhook from Entomate for meeting sync
 */
export async function handleMeetingWebhook(payload: {
  action: 'create' | 'update' | 'complete';
  meeting: EntomateMeeting;
  teamMemberId: string;
}): Promise<{ success: boolean; activityId?: string; error?: string }> {
  const { action, meeting, teamMemberId } = payload;

  try {
    const existingActivity = await findActivityByEntomateMeetingId(meeting.id);

    if (existingActivity) {
      // Update existing activity
      await supabase
        .from('activities')
        .update({
          title: meeting.title,
          notes: meeting.summary || existingActivity.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingActivity.id);

      return { success: true, activityId: existingActivity.id };
    }

    if (action === 'complete') {
      // Create new activity for completed meeting
      const activity = await createActivityFromMeeting(meeting, teamMemberId);
      return { success: !!activity, activityId: activity?.id };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Export service object for convenience
export const entomateService = {
  // Configuration
  getConfig,
  saveConfig,

  // Team member lookup
  findTeamMemberByName,
  findTeamMemberByEmail,
  getAllTeamMembers,

  // Action item sync
  createTaskFromActionItem,
  updateTaskFromActionItem,
  syncActionItem,
  syncActionItems,
  findTaskByEntoamteId,

  // Meeting sync
  createActivityFromMeeting,
  findActivityByEntomateMeetingId,

  // Project sync
  linkEntoamteProject,
  createProjectFromEntomate,
  findProjectByEntoamteId,

  // Sync status
  getSyncLogs,
  getSyncSummary,

  // Webhooks
  handleActionItemWebhook,
  handleMeetingWebhook,
};

export default entomateService;
