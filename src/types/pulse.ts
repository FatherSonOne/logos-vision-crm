// Pulse Integration Types for Logos Vision CRM

// Core Pulse entities synced from pulse.logosvision.org
export interface PulseThread {
  id: string;
  contactId?: string;
  title: string;
  source: 'email' | 'sms' | 'slack' | 'pulse' | 'discord' | 'teams';
  participants: PulseParticipant[];
  lastMessageAt: Date;
  unreadCount: number;
  outcomeId?: string;
  linkedProjectId?: string;
  linkedCaseId?: string;
  aiSummary?: string;
  tags: string[];
}

export interface PulseParticipant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: 'team' | 'client' | 'volunteer' | 'donor';
}

export interface PulseMessage {
  id: string;
  threadId: string;
  source: 'email' | 'sms' | 'slack' | 'pulse' | 'discord' | 'teams';
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  attachments?: PulseAttachment[];
  reactions?: PulseReaction[];
  aiAnalysis?: PulseAIAnalysis;
}

export interface PulseAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface PulseReaction {
  emoji: string;
  userId: string;
  userName: string;
}

// AI Analysis extracted from conversations
export interface PulseAIAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  sentimentScore: number; // -1 to 1
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priorityScore: number; // 0-100
  category: string;
  actionItems: PulseActionItem[];
  decisions: PulseDecision[];
  entities: PulseEntity[];
  keyTopics: string[];
  suggestedFollowUp?: string;
}

export interface PulseActionItem {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  sourceMessageId: string;
  extractedAt: Date;
}

export interface PulseDecision {
  id: string;
  title: string;
  description: string;
  status: 'proposed' | 'voting' | 'decided' | 'implemented';
  proposedBy: string;
  proposedAt: Date;
  decidedAt?: Date;
  outcome?: string;
  votes: PulseVote[];
  linkedProjectId?: string;
}

export interface PulseVote {
  userId: string;
  userName: string;
  vote: 'approve' | 'reject' | 'abstain' | 'concern';
  comment?: string;
  timestamp: Date;
}

export interface PulseEntity {
  type: 'person' | 'organization' | 'date' | 'money' | 'location' | 'project';
  value: string;
  confidence: number;
}

// Outcomes / Goals (bidirectional sync)
export interface PulseOutcome {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'achieved' | 'blocked' | 'cancelled';
  progress: number; // 0-100
  targetDate?: Date;
  keyResults: PulseKeyResult[];
  blockers: PulseBlocker[];
  linkedProjectId?: string;
  linkedGoalId?: string; // Logos Vision goal ID
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PulseKeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
}

export interface PulseBlocker {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  reportedBy: string;
  reportedAt: Date;
  resolution?: string;
  resolvedAt?: Date;
}

// Integration Configuration
export interface PulseIntegrationConfig {
  enabled: boolean;
  apiKey?: string;
  baseUrl: string;
  lastSyncAt?: Date;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  syncError?: string;

  // Channel sync settings
  channels: {
    email: PulseChannelConfig;
    sms: PulseChannelConfig;
    slack: PulseChannelConfig;
    pulse: PulseChannelConfig;
    discord: PulseChannelConfig;
    teams: PulseChannelConfig;
  };

  // AI settings
  aiAnalysis: {
    enabled: boolean;
    extractTasks: boolean;
    extractDecisions: boolean;
    analyzeSentiment: boolean;
    detectPriority: boolean;
    autoLinkContacts: boolean;
    autoLinkProjects: boolean;
  };

  // Sync settings
  sync: {
    contactsToActivities: boolean; // Log Pulse activities as CRM activities
    threadToProject: boolean; // Link threads to projects
    outcomesToGoals: boolean; // Bidirectional outcome/goal sync
    realTimeSync: boolean;
    syncInterval: number; // minutes
  };

  // Field mappings
  fieldMappings: PulseFieldMapping[];
}

export interface PulseChannelConfig {
  enabled: boolean;
  syncDirection: 'incoming' | 'outgoing' | 'bidirectional';
  autoLinkToContacts: boolean;
  logAsActivity: boolean;
  activityType?: 'email' | 'call' | 'message' | 'meeting' | 'note';
}

export interface PulseFieldMapping {
  pulseField: string;
  logosField: string;
  direction: 'pulse_to_logos' | 'logos_to_pulse' | 'bidirectional';
  transform?: 'direct' | 'uppercase' | 'lowercase' | 'date' | 'custom';
}

// Sync events and webhooks
export interface PulseSyncEvent {
  id: string;
  type: 'thread_created' | 'message_received' | 'decision_made' | 'task_extracted' | 'outcome_updated' | 'contact_linked';
  timestamp: Date;
  data: Record<string, unknown>;
  processedAt?: Date;
  status: 'pending' | 'processed' | 'failed';
  error?: string;
}

// Activity log entry synced from Pulse
export interface PulseActivityLog {
  id: string;
  contactId: string;
  type: 'email' | 'sms' | 'call' | 'message' | 'meeting' | 'task' | 'decision';
  source: 'email' | 'sms' | 'slack' | 'pulse' | 'discord' | 'teams';
  title: string;
  description: string;
  timestamp: Date;
  participants: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  linkedThreadId?: string;
  linkedProjectId?: string;
  metadata?: Record<string, unknown>;
}

// Dashboard metrics from Pulse AI
export interface PulseMetrics {
  period: 'day' | 'week' | 'month' | 'quarter';
  startDate: Date;
  endDate: Date;

  communication: {
    totalThreads: number;
    totalMessages: number;
    byChannel: Record<string, number>;
    responseTimeAvg: number; // hours
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };

  productivity: {
    tasksExtracted: number;
    tasksCompleted: number;
    decisionsTracked: number;
    decisionsMade: number;
    avgDecisionTime: number; // hours
  };

  engagement: {
    activeContacts: number;
    newContacts: number;
    engagementScore: number; // 0-100
    topContacts: Array<{
      contactId: string;
      name: string;
      interactions: number;
    }>;
  };

  outcomes: {
    active: number;
    achieved: number;
    blocked: number;
    avgProgress: number;
  };
}

// Default configuration
export const DEFAULT_PULSE_CONFIG: PulseIntegrationConfig = {
  enabled: false,
  baseUrl: 'https://pulse.logosvision.org',
  syncStatus: 'idle',

  channels: {
    email: { enabled: true, syncDirection: 'bidirectional', autoLinkToContacts: true, logAsActivity: true, activityType: 'email' },
    sms: { enabled: true, syncDirection: 'bidirectional', autoLinkToContacts: true, logAsActivity: true, activityType: 'message' },
    slack: { enabled: true, syncDirection: 'incoming', autoLinkToContacts: false, logAsActivity: true, activityType: 'message' },
    pulse: { enabled: true, syncDirection: 'bidirectional', autoLinkToContacts: true, logAsActivity: true, activityType: 'message' },
    discord: { enabled: false, syncDirection: 'incoming', autoLinkToContacts: false, logAsActivity: false },
    teams: { enabled: false, syncDirection: 'incoming', autoLinkToContacts: false, logAsActivity: false },
  },

  aiAnalysis: {
    enabled: true,
    extractTasks: true,
    extractDecisions: true,
    analyzeSentiment: true,
    detectPriority: true,
    autoLinkContacts: true,
    autoLinkProjects: true,
  },

  sync: {
    contactsToActivities: true,
    threadToProject: true,
    outcomesToGoals: true,
    realTimeSync: true,
    syncInterval: 5,
  },

  fieldMappings: [
    { pulseField: 'contact.name', logosField: 'contact.name', direction: 'bidirectional' },
    { pulseField: 'contact.email', logosField: 'contact.email', direction: 'bidirectional' },
    { pulseField: 'outcome.title', logosField: 'goal.name', direction: 'bidirectional' },
    { pulseField: 'outcome.progress', logosField: 'goal.progress', direction: 'pulse_to_logos' },
    { pulseField: 'thread.project', logosField: 'project.id', direction: 'logos_to_pulse' },
  ],
};
