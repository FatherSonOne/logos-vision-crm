// Pulse Contact Service - API client for Pulse contact intelligence
// Handles REST API calls to Pulse Communication App for contact enrichment

import type {
  RelationshipProfile,
  RelationshipProfilesResponse,
  AIInsights,
  RecentInteractionsResponse,
  GoogleSyncTriggerResponse,
  GoogleSyncJob,
  GoogleSyncOptions,
  RecommendedAction,
} from '../types/pulseContacts';

// Import mock data as values (not types)
import {
  MOCK_RELATIONSHIP_PROFILES,
  MOCK_AI_INSIGHTS,
  MOCK_RECENT_INTERACTIONS
} from '../types/pulseContacts';

import { MOCK_RECOMMENDED_ACTIONS } from './mockPulseData';
import { logger } from '../utils/logger';

// ============================================
// CONFIGURATION
// ============================================

const PULSE_API_URL = import.meta.env.VITE_PULSE_API_URL;
const PULSE_API_KEY = import.meta.env.VITE_PULSE_API_KEY;

// Use mock data if API not configured
const USE_MOCK_DATA = !PULSE_API_URL || PULSE_API_URL === '';

if (USE_MOCK_DATA) {
  logger.warn('Pulse Contact Service: API URL not configured, using mock data for development');
}

// ============================================
// API CLIENT HELPERS
// ============================================

interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function fetchPulseAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  if (USE_MOCK_DATA) {
    // Return mock data for development
    return getMockData<T>(endpoint);
  }

  const url = `${PULSE_API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(PULSE_API_KEY && { 'Authorization': `Bearer ${PULSE_API_KEY}` }),
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    ...(options.body && { body: JSON.stringify(options.body) }),
  };

  try {
    logger.debug(`Pulse API: ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, fetchOptions);

    // Check rate limits
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    if (rateLimitRemaining) {
      logger.debug(`Pulse API: Rate limit remaining: ${rateLimitRemaining}`);
    }

    if (!response.ok) {
      // 404 is acceptable for some endpoints (e.g., no AI insights available)
      if (response.status === 404) {
        logger.debug(`Pulse API: 404 Not Found: ${endpoint}`);
        return null as T;
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limit exceeded. Retry after ${retryAfter || 60} seconds.`);
      }

      throw new Error(`Pulse API error (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Pulse API error:', error);
    throw error;
  }
}

function getMockData<T>(endpoint: string): Promise<T> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint.includes('/relationship-profiles')) {
        resolve({
          data: MOCK_RELATIONSHIP_PROFILES,
          pagination: {
            total: MOCK_RELATIONSHIP_PROFILES.length,
            limit: 100,
            offset: 0,
            has_more: false,
          },
        } as any);
      } else if (endpoint.includes('/ai-insights')) {
        resolve(MOCK_AI_INSIGHTS as any);
      } else if (endpoint.includes('/interactions')) {
        resolve({
          profile_id: 'profile-1',
          interactions: MOCK_RECENT_INTERACTIONS,
          summary: {
            total_interactions: MOCK_RECENT_INTERACTIONS.length,
            by_type: {
              email_sent: 1,
              meeting: 1,
            },
            average_sentiment: 0.85,
            top_topics: ['pricing', 'API integration', 'product demo'],
          },
        } as any);
      } else if (endpoint.includes('/google-sync/trigger')) {
        resolve({
          sync_job_id: `sync-${Date.now()}`,
          status: 'queued',
          estimated_duration_seconds: 120,
          message: 'Google Contacts sync initiated (MOCK)',
        } as any);
      } else if (endpoint.includes('/google-sync/status')) {
        resolve({
          sync_job_id: 'sync-123',
          status: 'completed',
          progress: {
            total_contacts: 100,
            processed: 100,
            created: 10,
            updated: 80,
            skipped: 10,
            errors: 0,
          },
          started_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          completed_at: new Date().toISOString(),
        } as any);
      } else if (endpoint.includes('/recommended-actions')) {
        resolve(MOCK_RECOMMENDED_ACTIONS as any);
      } else {
        resolve([] as any);
      }
    }, 300); // 300ms delay to simulate network
  });
}

// ============================================
// PULSE CONTACT SERVICE
// ============================================

export const pulseContactService = {
  /**
   * Fetch relationship profiles (bulk contacts)
   * Used for initial import and incremental sync
   */
  async fetchRelationshipProfiles(options?: {
    limit?: number;
    offset?: number;
    modifiedSince?: string;
    email?: string;
    includeAnnotations?: boolean;
  }): Promise<RelationshipProfile[]> {
    const params = new URLSearchParams();

    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    if (options?.modifiedSince) params.append('modified_since', options.modifiedSince);
    if (options?.email) params.append('email', options.email);
    if (options?.includeAnnotations !== false) params.append('include_annotations', 'true');

    const queryString = params.toString();
    const endpoint = `/api/contacts/relationship-profiles${queryString ? `?${queryString}` : ''}`;

    const response = await fetchPulseAPI<RelationshipProfilesResponse>(endpoint);

    if (!response) return [];

    logger.info(`Pulse Contact Service: Fetched ${response.data.length} relationship profiles`);

    return response.data;
  },

  /**
   * Get AI insights for a specific contact
   * Fetched on-demand when viewing contact details
   */
  async getAIInsights(profileId: string): Promise<AIInsights | null> {
    const endpoint = `/api/contacts/${profileId}/ai-insights`;

    try {
      const insights = await fetchPulseAPI<AIInsights>(endpoint);

      if (insights) {
        logger.debug(`Pulse Contact Service: Loaded AI insights for ${profileId}`);
      }

      return insights;
    } catch (error) {
      logger.error(`Pulse Contact Service: Failed to load AI insights for ${profileId}`, error);
      return null;
    }
  },

  /**
   * Get recent interactions for a contact
   * Returns unified interaction log from Pulse
   */
  async getRecentInteractions(profileId: string, options?: {
    limit?: number;
    days?: number;
    types?: string[];
  }): Promise<RecentInteractionsResponse> {
    const params = new URLSearchParams();

    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.days) params.append('days', String(options.days));
    if (options?.types) params.append('types', options.types.join(','));

    const queryString = params.toString();
    const endpoint = `/api/contacts/${profileId}/interactions${queryString ? `?${queryString}` : ''}`;

    const response = await fetchPulseAPI<RecentInteractionsResponse>(endpoint);

    if (!response) {
      return {
        profile_id: profileId,
        interactions: [],
        summary: {
          total_interactions: 0,
          by_type: {} as any,
          average_sentiment: 0,
          top_topics: [],
        },
      };
    }

    logger.info(`Pulse Contact Service: Loaded ${response.interactions.length} interactions for ${profileId}`);

    return response;
  },

  /**
   * Get recommended actions for priorities feed
   * AI-generated action queue based on relationship health
   */
  async getRecommendedActions(): Promise<RecommendedAction[]> {
    const endpoint = '/api/contacts/recommended-actions';

    try {
      const actions = await fetchPulseAPI<RecommendedAction[]>(endpoint);

      if (!actions) return [];

      logger.info(`Pulse Contact Service: Loaded ${actions.length} recommended actions`);

      return actions;
    } catch (error) {
      logger.error('Pulse Contact Service: Failed to load recommended actions', error);
      return [];
    }
  },

  /**
   * Trigger Google Contacts sync via Pulse proxy
   * Returns job ID for tracking progress
   */
  async triggerGoogleSync(options: GoogleSyncOptions): Promise<GoogleSyncTriggerResponse> {
    const endpoint = '/api/contacts/google-sync/trigger';

    const response = await fetchPulseAPI<GoogleSyncTriggerResponse>(endpoint, {
      method: 'POST',
      body: {
        sync_type: options.sync_type,
        options: {
          enrich_contacts: options.enrich_contacts ?? true,
          sync_photos: options.sync_photos ?? true,
          sync_groups: options.sync_groups ?? false,
        },
      },
    });

    logger.info(`Pulse Contact Service: Triggered Google sync: ${response.sync_job_id}`);

    return response;
  },

  /**
   * Get Google Contacts sync status
   * Poll this endpoint to track sync progress
   */
  async getGoogleSyncStatus(syncJobId: string): Promise<GoogleSyncJob> {
    const endpoint = `/api/contacts/google-sync/status/${syncJobId}`;

    const response = await fetchPulseAPI<GoogleSyncJob>(endpoint);

    if (!response) {
      throw new Error(`Sync job ${syncJobId} not found`);
    }

    logger.info(`Pulse Contact Service: Sync job ${syncJobId}: ${response.status} (${response.progress.processed}/${response.progress.total_contacts})`);

    return response;
  },

  /**
   * Search contacts by query
   * Convenience method for autocomplete/search
   */
  async searchContacts(query: string, limit: number = 20): Promise<RelationshipProfile[]> {
    // For now, fetch all and filter client-side
    // TODO: Implement server-side search when Pulse API supports it
    const profiles = await this.fetchRelationshipProfiles({ limit: 1000 });

    const queryLower = query.toLowerCase();
    const filtered = profiles.filter(p =>
      p.display_name.toLowerCase().includes(queryLower) ||
      p.canonical_email.toLowerCase().includes(queryLower) ||
      p.company?.toLowerCase().includes(queryLower)
    );

    return filtered.slice(0, limit);
  },

  /**
   * Check if Pulse API is configured and available
   */
  async checkHealth(): Promise<boolean> {
    if (USE_MOCK_DATA) {
      logger.info('Pulse Contact Service: Using mock data (API not configured)');
      return true;
    }

    try {
      const endpoint = '/health';
      await fetchPulseAPI(endpoint);
      logger.info('Pulse Contact Service: Health check passed');
      return true;
    } catch (error) {
      logger.error('Pulse Contact Service: Health check failed', error);
      return false;
    }
  },

  /**
   * Get configuration status
   */
  getConfigStatus(): {
    configured: boolean;
    usingMockData: boolean;
    apiUrl: string | undefined;
    hasApiKey: boolean;
  } {
    return {
      configured: !USE_MOCK_DATA,
      usingMockData: USE_MOCK_DATA,
      apiUrl: PULSE_API_URL,
      hasApiKey: !!PULSE_API_KEY,
    };
  },

  /**
   * Get count of pending priority actions
   * Used for displaying badge count on Priorities tab
   */
  async getPendingActionsCount(): Promise<number> {
    try {
      const actions = await this.getRecommendedActions();
      // Count actions that are not marked as completed
      // For now, return total count since we don't track completion in mock data
      return actions.length;
    } catch (error) {
      logger.error('Pulse Contact Service: Failed to get pending actions count', error);
      return 0;
    }
  },
};

export default pulseContactService;
