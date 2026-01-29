/**
 * Pulse API Service
 *
 * Integrates Logos Vision CRM with Pulse API for:
 * - AI relationship intelligence
 * - Google Contacts sync
 * - Contact enrichment with AI insights
 */

import { logger } from '../utils/logger';

const PULSE_API_URL = import.meta.env.VITE_PULSE_API_URL || 'http://localhost:3003';
const PULSE_API_KEY = import.meta.env.VITE_PULSE_API_KEY || 'logos_vision_pulse_shared_secret_2026';

export interface PulseContact {
  id: string;
  email: string;
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  relationship_score?: number;
  relationship_trend?: 'rising' | 'stable' | 'falling' | 'new' | 'dormant';
  communication_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  preferred_channel?: 'email' | 'phone' | 'slack' | 'meeting' | 'sms';
  last_interaction_date?: string;
  total_interactions?: number;
  tags?: string[];
  ai_insights?: {
    talking_points?: string[];
    next_best_action?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

export interface PulseEnrichment {
  email: string;
  enrichment: {
    relationship_score: number;
    relationship_trend: 'rising' | 'stable' | 'falling' | 'new' | 'dormant';
    communication_frequency: string;
    preferred_channel: string;
    last_interaction_date?: string;
    total_interactions: number;
    tags: string[];
    ai_insights: {
      talking_points: string[];
      next_best_action: string;
      sentiment: string;
    };
  };
}

export interface SyncJob {
  sync_id: string;
  status: 'in_progress' | 'completed' | 'failed';
  total_contacts: number;
  synced: number;
  failed?: number;
  skipped_no_identifier?: number;
  failed_database_error?: number;
  completed_at?: string;
  message?: string;
}

/**
 * Fetch contacts from Pulse with relationship intelligence
 */
export async function fetchContactsFromPulse(options: {
  email?: string;
  limit?: number;
  offset?: number;
  includeScore?: boolean;
  includeTrends?: boolean;
  includeInsights?: boolean;
} = {}): Promise<{ contacts: PulseContact[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (options.email) params.append('email', options.email);
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.includeScore !== undefined) params.append('includeScore', String(options.includeScore));
    if (options.includeTrends !== undefined) params.append('includeTrends', String(options.includeTrends));
    if (options.includeInsights !== undefined) params.append('includeInsights', String(options.includeInsights));

    logger.info(`[PulseAPI] Fetching contacts from Pulse: ${PULSE_API_URL}/api/logos-vision/contacts`);

    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/contacts?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    logger.info(`[PulseAPI] Fetched ${data.contacts.length} contacts from Pulse`);

    return {
      contacts: data.contacts,
      total: data.total
    };
  } catch (error) {
    logger.error('[PulseAPI] Error fetching contacts from Pulse:', error);
    throw error;
  }
}

/**
 * Enrich a single contact with AI intelligence
 */
export async function enrichContact(
  email: string,
  data?: { name?: string; company?: string }
): Promise<PulseEnrichment> {
  try {
    logger.info(`[PulseAPI] Enriching contact: ${email}`);

    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/contacts/${encodeURIComponent(email)}/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const enrichment = await response.json();
    logger.info(`[PulseAPI] Successfully enriched contact: ${email}`);

    return enrichment;
  } catch (error) {
    logger.error(`[PulseAPI] Error enriching contact ${email}:`, error);
    throw error;
  }
}

/**
 * Get Google OAuth authorization URL
 */
export async function getGoogleAuthUrl(workspaceId: string): Promise<{ auth_url: string; state: string }> {
  try {
    logger.info('[PulseAPI] Getting Google OAuth URL');

    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/auth/url?workspace_id=${encodeURIComponent(workspaceId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    logger.info('[PulseAPI] Got OAuth URL');

    return data;
  } catch (error) {
    logger.error('[PulseAPI] Error getting OAuth URL:', error);
    throw error;
  }
}

/**
 * Check if user has Google OAuth authorization
 */
export async function checkGoogleAuthorization(workspaceId: string): Promise<boolean> {
  try {
    // Try to trigger a sync - if it fails with auth error, user needs to authorize
    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        sync_type: 'contacts',
        filter: {}
      }),
    });

    const data = await response.json();

    // If we get an auth-related error, return false
    if (data.error && data.error.includes('OAuth')) {
      return false;
    }

    return response.ok;
  } catch (error) {
    logger.error('[PulseAPI] Error checking authorization:', error);
    return false;
  }
}

/**
 * Trigger Google Contacts sync
 */
export async function triggerPulseSync(options: {
  workspace_id: string;
  sync_type?: 'contacts';
  filter?: {
    label?: string;
    domain?: string;
  };
}): Promise<SyncJob> {
  try {
    logger.info('[PulseAPI] Triggering Pulse sync');

    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const syncJob = await response.json();
    logger.info(`[PulseAPI] Sync job created: ${syncJob.sync_id}`);

    return syncJob;
  } catch (error) {
    logger.error('[PulseAPI] Error triggering sync:', error);
    throw error;
  }
}

/**
 * Check sync job status
 */
export async function checkSyncStatus(syncId: string): Promise<SyncJob> {
  try {
    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/sync/${syncId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const status = await response.json();
    return status;
  } catch (error) {
    logger.error(`[PulseAPI] Error checking sync status for ${syncId}:`, error);
    throw error;
  }
}

/**
 * Poll sync status until completion
 */
export async function pollSyncStatus(
  syncId: string,
  onProgress?: (job: SyncJob) => void,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<SyncJob> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await checkSyncStatus(syncId);

    if (onProgress) {
      onProgress(status);
    }

    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Sync polling timed out');
}

/**
 * Get auto-sync configuration for a user
 */
export async function getAutoSyncConfig(workspaceId: string): Promise<{
  enabled: boolean;
  interval_hours: number;
  last_sync_at: string | null;
  next_sync_at: string | null;
  auto_label_enabled: boolean;
}> {
  try {
    logger.info('[PulseAPI] Getting auto-sync config');

    const response = await fetch(
      `${PULSE_API_URL}/api/logos-vision/auto-sync/config?workspace_id=${encodeURIComponent(workspaceId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': PULSE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    logger.info('[PulseAPI] Got auto-sync config:', data);

    return data;
  } catch (error) {
    logger.error('[PulseAPI] Error getting auto-sync config:', error);
    throw error;
  }
}

/**
 * Update auto-sync configuration for a user
 */
export async function updateAutoSyncConfig(
  workspaceId: string,
  config: {
    enabled: boolean;
    interval_hours: number;
    auto_label_enabled?: boolean;
  }
): Promise<{
  enabled: boolean;
  interval_hours: number;
  last_sync_at: string | null;
  next_sync_at: string | null;
  auto_label_enabled: boolean;
}> {
  try {
    logger.info('[PulseAPI] Updating auto-sync config:', config);

    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/auto-sync/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        ...config,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    logger.info('[PulseAPI] Auto-sync config updated:', data);

    return data;
  } catch (error) {
    logger.error('[PulseAPI] Error updating auto-sync config:', error);
    throw error;
  }
}

/**
 * Preview contact from Google Contacts interface
 */
export interface PreviewContact {
  resourceName: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  hasIdentifier: boolean;
}

/**
 * Preview Google Contacts (fetch without importing)
 */
export async function previewGoogleContacts(workspaceId: string): Promise<{
  total: number;
  contacts: PreviewContact[];
}> {
  try {
    logger.info('[PulseAPI] Previewing Google Contacts');

    const response = await fetch(
      `${PULSE_API_URL}/api/logos-vision/contacts/preview?workspace_id=${encodeURIComponent(workspaceId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': PULSE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    logger.info(`[PulseAPI] Previewed ${data.total} Google Contacts`);

    return data;
  } catch (error) {
    logger.error('[PulseAPI] Error previewing Google Contacts:', error);
    throw error;
  }
}

/**
 * Import selected Google Contacts
 */
export async function importSelectedContacts(
  workspaceId: string,
  resourceNames: string[]
): Promise<{
  total_selected: number;
  imported: number;
  failed: number;
  skipped_no_identifier: number;
  failed_database_error: number;
}> {
  try {
    logger.info(`[PulseAPI] Importing ${resourceNames.length} selected contacts`);

    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/contacts/import-selected`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        resource_names: resourceNames,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    logger.info(`[PulseAPI] Successfully imported ${data.imported} contacts`);

    return data;
  } catch (error) {
    logger.error('[PulseAPI] Error importing selected contacts:', error);
    throw error;
  }
}

/**
 * Push Logos Vision contacts to Google Contacts (Bidirectional Sync)
 */
export async function pushContactsToGoogle(workspaceId: string): Promise<{
  total: number;
  created: number;
  updated: number;
  failed: number;
}> {
  try {
    logger.info('[PulseAPI] Pushing Logos Vision contacts to Google');

    const response = await fetch(`${PULSE_API_URL}/api/logos-vision/contacts/push-to-google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Pulse API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    logger.info(`[PulseAPI] Successfully pushed contacts: ${data.created} created, ${data.updated} updated`);

    return data;
  } catch (error) {
    logger.error('[PulseAPI] Error pushing contacts to Google:', error);
    throw error;
  }
}
