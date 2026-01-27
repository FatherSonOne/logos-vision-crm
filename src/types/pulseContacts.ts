// Pulse Contact Integration Types for Logos Vision CRM
// Based on PULSE_LV_CONTACTS_INTEGRATION_PLAN.md

// ============================================
// RELATIONSHIP PROFILE (Core Contact Data)
// ============================================

export interface RelationshipProfile {
  id: string;
  user_id: string;
  canonical_email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  company?: string;
  title?: string;
  linkedin_url?: string;
  timezone?: string;
  avatar_url?: string;

  // Relationship intelligence
  relationship_score: number; // 0-100
  total_interactions: number;
  last_interaction_date: string;
  communication_frequency: CommunicationFrequency;
  preferred_channel: PreferredChannel;

  // User annotations
  tags?: string[];
  notes?: string;
  is_favorite: boolean;
  is_blocked: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export type CommunicationFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'rare';
export type PreferredChannel = 'email' | 'slack' | 'phone' | 'meeting' | 'sms';
export type RelationshipTrend = 'rising' | 'stable' | 'falling' | 'new' | 'dormant';

// ============================================
// AI INSIGHTS (On-demand API data)
// ============================================

export interface AIInsights {
  profile_id: string;

  // AI-generated insights
  ai_communication_style: string;
  ai_topics: string[];
  ai_sentiment_average: number; // -1 to +1
  ai_relationship_summary: string;
  ai_talking_points: string[];
  ai_next_actions: NextAction[];

  // Metadata
  confidence_score: number; // 0-1
  last_analyzed_at: string;
}

export interface NextAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
}

// ============================================
// CONTACT INTERACTIONS (Recent Activity)
// ============================================

export interface ContactInteraction {
  id: string;
  profile_id: string;

  // Interaction details
  interaction_type: InteractionType;
  interaction_date: string;
  subject?: string;
  snippet?: string; // First 200 chars

  // AI analysis
  sentiment_score?: number; // -1 to +1
  ai_topics?: string[];
  ai_action_items?: string[];
  ai_summary?: string;

  // Channel metadata
  channel_metadata?: Record<string, any>;
  duration_minutes?: number; // For meetings/calls

  // Sync tracking
  synced_at: string;
  created_at: string;
}

export type InteractionType =
  | 'email_sent'
  | 'email_received'
  | 'meeting'
  | 'call'
  | 'slack_message'
  | 'slack_received'
  | 'sms_sent'
  | 'sms_received'
  | 'linkedin'
  | 'other';

// ============================================
// RECOMMENDED ACTIONS (Priorities Feed)
// ============================================

export interface RecommendedAction {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_score: number;
  contact_trend: RelationshipTrend;
  contact_company?: string;

  // Action details
  priority: ActionPriority;
  reason: string;
  suggested_actions: string[];
  due_date?: string;

  // Context
  value_indicator: string; // e.g., "Major Donor - $50k lifetime"
  last_interaction_date: string;
  sentiment: number;

  // Donor data (LV-specific)
  donor_stage?: string;
  lifetime_giving?: number;
}

export type ActionPriority = 'high' | 'medium' | 'low' | 'opportunity';

// ============================================
// GOOGLE SYNC (via Pulse proxy)
// ============================================

export interface GoogleSyncJob {
  sync_job_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: GoogleSyncProgress;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface GoogleSyncProgress {
  total_contacts: number;
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface GoogleSyncOptions {
  sync_type: 'full' | 'incremental';
  enrich_contacts?: boolean;
  sync_photos?: boolean;
  sync_groups?: boolean;
}

// ============================================
// API RESPONSES
// ============================================

export interface RelationshipProfilesResponse {
  data: RelationshipProfile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface RecentInteractionsResponse {
  profile_id: string;
  interactions: ContactInteraction[];
  summary: {
    total_interactions: number;
    by_type: Record<InteractionType, number>;
    average_sentiment: number;
    top_topics: string[];
  };
}

export interface GoogleSyncTriggerResponse {
  sync_job_id: string;
  status: 'queued' | 'in_progress';
  estimated_duration_seconds: number;
  message: string;
}

// ============================================
// BULK IMPORT RESULT
// ============================================

export interface BulkImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: number;
  duration?: number;
  error_messages?: string[];
}

// ============================================
// SYNC STATUS TRACKING
// ============================================

export interface PulseSyncStatus {
  last_sync_timestamp: string;
  contacts_synced: number;
  contacts_pending: number;
  contacts_failed: number;
  next_sync_at: string;
  is_syncing: boolean;
  errors: string[];
}

// ============================================
// MOCK DATA HELPERS (Development)
// ============================================

export const MOCK_RELATIONSHIP_PROFILES: RelationshipProfile[] = [
  {
    id: 'profile-1',
    user_id: 'user-1',
    canonical_email: 'sarah.johnson@acme.com',
    display_name: 'Sarah Johnson',
    first_name: 'Sarah',
    last_name: 'Johnson',
    phone_number: '(555) 123-4567',
    company: 'Acme Corporation',
    title: 'VP of Operations',
    linkedin_url: 'https://linkedin.com/in/sarahjohnson',
    timezone: 'America/New_York',
    avatar_url: 'https://i.pravatar.cc/150?img=5',
    relationship_score: 92,
    total_interactions: 45,
    last_interaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    communication_frequency: 'weekly',
    preferred_channel: 'email',
    tags: ['major-donor', 'board-member'],
    notes: 'Major donor - $125k lifetime giving. Strong relationship.',
    is_favorite: true,
    is_blocked: false,
    created_at: '2025-06-01T12:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'profile-2',
    user_id: 'user-1',
    canonical_email: 'michael@techstartup.io',
    display_name: 'Michael Chen',
    first_name: 'Michael',
    last_name: 'Chen',
    phone_number: '(555) 234-5678',
    company: 'TechStartup Inc.',
    title: 'CEO & Founder',
    linkedin_url: 'https://linkedin.com/in/michaelchen',
    timezone: 'America/Los_Angeles',
    avatar_url: 'https://i.pravatar.cc/150?img=12',
    relationship_score: 78,
    total_interactions: 28,
    last_interaction_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    communication_frequency: 'monthly',
    preferred_channel: 'phone',
    tags: ['donor', 'tech'],
    notes: 'Repeat donor. Prefers phone calls.',
    is_favorite: false,
    is_blocked: false,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'profile-3',
    user_id: 'user-1',
    canonical_email: 'jmartinez@foundations.org',
    display_name: 'Jennifer Martinez',
    first_name: 'Jennifer',
    last_name: 'Martinez',
    phone_number: '(555) 345-6789',
    company: 'Community Foundation',
    title: 'Program Director',
    linkedin_url: 'https://linkedin.com/in/jennifermartinez',
    timezone: 'America/Chicago',
    avatar_url: 'https://i.pravatar.cc/150?img=9',
    relationship_score: 65,
    total_interactions: 15,
    last_interaction_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    communication_frequency: 'quarterly',
    preferred_channel: 'meeting',
    tags: ['donor'],
    notes: 'First-time donor. Relationship declining.',
    is_favorite: false,
    is_blocked: false,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'profile-4',
    user_id: 'user-1',
    canonical_email: 'rwilliams@consulting.com',
    display_name: 'Robert Williams',
    first_name: 'Robert',
    last_name: 'Williams',
    phone_number: '(555) 456-7890',
    company: 'Williams Consulting',
    title: 'Managing Partner',
    linkedin_url: 'https://linkedin.com/in/robertwilliams',
    timezone: 'America/New_York',
    avatar_url: 'https://i.pravatar.cc/150?img=14',
    relationship_score: 42,
    total_interactions: 8,
    last_interaction_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    communication_frequency: 'rare',
    preferred_channel: 'email',
    tags: ['prospect'],
    notes: 'Dormant relationship. Last contact 4 months ago.',
    is_favorite: false,
    is_blocked: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'profile-5',
    user_id: 'user-1',
    canonical_email: 'emily@innovate.co',
    display_name: 'Emily Thompson',
    first_name: 'Emily',
    last_name: 'Thompson',
    phone_number: '(555) 567-8901',
    company: 'Innovate Co.',
    title: 'Head of Partnerships',
    linkedin_url: 'https://linkedin.com/in/emilythompson',
    timezone: 'America/Los_Angeles',
    avatar_url: 'https://i.pravatar.cc/150?img=10',
    relationship_score: 88,
    total_interactions: 52,
    last_interaction_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    communication_frequency: 'weekly',
    preferred_channel: 'slack',
    tags: ['major-donor', 'tech'],
    notes: 'Major donor - $85k lifetime. Very engaged.',
    is_favorite: true,
    is_blocked: false,
    created_at: '2023-12-01T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'profile-6',
    user_id: 'user-1',
    canonical_email: 'david@growth.ventures',
    display_name: 'David Lee',
    first_name: 'David',
    last_name: 'Lee',
    phone_number: '(555) 678-9012',
    company: 'Growth Ventures',
    title: 'Investment Director',
    linkedin_url: 'https://linkedin.com/in/davidlee',
    timezone: 'America/New_York',
    avatar_url: 'https://i.pravatar.cc/150?img=8',
    relationship_score: 15,
    total_interactions: 2,
    last_interaction_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    communication_frequency: 'rare',
    preferred_channel: 'email',
    tags: ['prospect'],
    notes: 'New contact. Very early stage.',
    is_favorite: false,
    is_blocked: false,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_AI_INSIGHTS: AIInsights = {
  profile_id: 'profile-1',
  ai_communication_style: 'Professional and detail-oriented, prefers data-driven discussions',
  ai_topics: ['API integration', 'enterprise pricing', 'security compliance', 'technical architecture'],
  ai_sentiment_average: 0.72,
  ai_relationship_summary: 'Strong technical relationship. John is the key decision-maker for API tooling at Acme Corp. Has expressed interest in our enterprise plan but needs buy-in from his VP of Product. Responds well to technical demos and case studies.',
  ai_talking_points: [
    'Follow up on enterprise demo scheduled for next Tuesday',
    'Share case study from similar fintech company',
    'Discuss API rate limits and custom SLA options',
    'Ask about their Q2 budget timeline',
  ],
  ai_next_actions: [
    {
      action: 'Send enterprise pricing proposal',
      priority: 'high',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      action: 'Schedule technical deep-dive with their engineering team',
      priority: 'medium',
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  confidence_score: 0.89,
  last_analyzed_at: new Date().toISOString(),
};

export const MOCK_RECENT_INTERACTIONS: ContactInteraction[] = [
  {
    id: 'interaction-1',
    profile_id: 'profile-1',
    interaction_type: 'email_sent',
    interaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    subject: 'Re: Enterprise API Pricing Discussion',
    snippet: 'Thanks for the detailed questions. Here\'s our enterprise pricing structure...',
    sentiment_score: 0.8,
    ai_topics: ['pricing', 'enterprise features'],
    ai_action_items: ['Schedule follow-up call'],
    ai_summary: 'Positive email discussing enterprise pricing options. Customer is interested but needs more details on custom SLAs.',
    channel_metadata: {
      email_id: 'msg_abc123',
      thread_id: 'thread_xyz789',
      recipients: ['john@example.com'],
      cc: ['sarah@example.com'],
    },
    synced_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'interaction-2',
    profile_id: 'profile-1',
    interaction_type: 'meeting',
    interaction_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    subject: 'Product Demo - Acme Corp',
    snippet: 'Conducted live demo of API platform. John asked excellent technical questions about...',
    sentiment_score: 0.9,
    ai_topics: ['product demo', 'API integration', 'technical requirements'],
    ai_action_items: [
      'Send follow-up with answers to technical questions',
      'Schedule deeper technical dive with engineering team',
    ],
    ai_summary: 'Very positive demo. John was highly engaged and asked detailed technical questions. Strong buying signals. Ready to move to enterprise pricing discussion.',
    channel_metadata: {
      meeting_id: 'mtg_def456',
      calendar_event_id: 'cal_ghi789',
      attendees: ['john@example.com', 'sarah@example.com', 'me@mycompany.com'],
    },
    duration_minutes: 45,
    synced_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
