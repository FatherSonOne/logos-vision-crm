// This file contains all the core type definitions for the application.

export enum ProjectStatus {
  Planning = 'Planning',
  InProgress = 'In Progress',
  Completed = 'Completed',
  OnHold = 'On Hold',
  Active = 'Active',
  Cancelled = 'Cancelled',
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

// Custom field types for team members (similar to Google Contacts)
export type CustomFieldType =
  // Phone types
  | 'mobile' | 'work_phone' | 'home_phone' | 'fax' | 'other_phone'
  // Social profiles
  | 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'website'
  // Work details
  | 'department' | 'title' | 'manager' | 'start_date' | 'location' | 'employee_id'
  // Personal info
  | 'birthday' | 'anniversary' | 'nickname' | 'notes';

export interface CustomField {
  id: string;
  type: CustomFieldType;
  value: string;
  label?: string; // Optional custom label
}

// Team member permission level (like Google Drive)
export type TeamMemberPermission = 'admin' | 'editor' | 'viewer';

// Shared item permissions for team collaboration
export interface SharePermission {
  memberId: string;
  permission: TeamMemberPermission;
  sharedAt: string;
  sharedBy: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string; // Job title/position
  profilePicture?: string | null; // URL or base64 data
  permission?: TeamMemberPermission; // Global permission level (default: 'viewer')
  customFields?: CustomField[];
  isActive?: boolean;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PreferredContactMethod = 'email' | 'phone' | 'text' | 'mail';

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  organization?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  householdId?: string | null;
  preferredContactMethod?: PreferredContactMethod;
  doNotEmail?: boolean;
  doNotCall?: boolean;
  doNotMail?: boolean;
  doNotText?: boolean;
  emailOptIn?: boolean;
  newsletterSubscriber?: boolean;
  communicationNotes?: string | null;
}

// ============================================
// COMMUNICATION TRACKING TYPES
// ============================================

export interface CommunicationLog {
  id: string;
  clientId: string;
  type: 'email' | 'call' | 'text' | 'mail' | 'meeting';
  direction: 'inbound' | 'outbound';
  subject?: string | null;
  content?: string | null;
  sentAt: string;
  deliveredAt?: string | null;
  openedAt?: string | null;
  clickedAt?: string | null;
  bounced: boolean;
  bounceReason?: string | null;
  campaignId?: string | null;
  userId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface CommunicationSummary {
  clientId: string;
  clientName: string;
  preferredContactMethod?: PreferredContactMethod;
  doNotEmail: boolean;
  doNotCall: boolean;
  doNotMail: boolean;
  doNotText: boolean;
  emailOptIn: boolean;
  newsletterSubscriber: boolean;
  totalCommunications: number;
  emailCount: number;
  callCount: number;
  textCount: number;
  lastContacted?: string | null;
  lastInbound?: string | null;
  lastOutbound?: string | null;
}

// ============================================
// HOUSEHOLD MANAGEMENT TYPES
// ============================================

export type RelationshipType =
  | 'Head of Household'
  | 'Spouse'
  | 'Child'
  | 'Parent'
  | 'Sibling'
  | 'Other'
  | 'Member';

export interface Household {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  primaryContactId?: string | null;
  isActive: boolean;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  clientId: string;
  relationshipType: RelationshipType;
  isPrimary: boolean;
  createdAt: string; // ISO String
}

export interface HouseholdWithMembers extends Household {
  members: (Client & { relationshipType: RelationshipType; isPrimary: boolean })[];
  memberCount: number;
  totalDonated: number;
  lastDonationDate?: string | null;
}

export interface HouseholdTotals {
  householdId: string;
  householdName: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  primaryContactId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  totalDonated: number;
  lastDonationDate?: string | null;
}

// ============================================
// PLEDGE & RECURRING DONATION TYPES
// ============================================

export type PledgeFrequency = 'monthly' | 'quarterly' | 'annually' | 'one-time';
export type PledgeStatus = 'active' | 'completed' | 'cancelled' | 'paused';

export interface Pledge {
  id: string;
  clientId: string;
  pledgeAmount: number;
  frequency: PledgeFrequency;
  startDate: string; // ISO date string
  endDate?: string | null; // ISO date string, null for ongoing
  totalPledged: number;
  totalFulfilled: number;
  status: PledgeStatus;
  campaign?: string | null;
  fund?: string | null;
  notes?: string | null;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  lastReminderSent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PledgePayment {
  id: string;
  pledgeId: string;
  donationId: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

export interface PledgeSummary extends Pledge {
  clientName: string;
  clientEmail?: string | null;
  fulfillmentPercentage: number;
  remainingAmount: number;
  nextPaymentDue?: string | null;
  paymentCount: number;
}

export interface PledgeWithPayments extends Pledge {
  client?: Client;
  payments: PledgePayment[];
}

export interface PledgeSchedule {
  id: string;
  pledgeId: string;
  scheduledDate: string;
  scheduledAmount: number;
  isPaid: boolean;
  paidDate?: string | null;
  paymentId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DONOR ENGAGEMENT SCORING TYPES
// ============================================

export type EngagementLevel = 'Highly Engaged' | 'Engaged' | 'Moderate' | 'Low Engagement' | 'At Risk';

export interface EngagementScore {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string | null;
  overallScore: number;
  engagementLevel: EngagementLevel;
  // Component scores (0-100)
  donationFrequencyScore: number;
  donationRecencyScore: number;
  donationAmountScore: number;
  pledgeFulfillmentScore: number;
  communicationScore: number;
  // Donation metrics
  totalDonations: number;
  totalDonated: number;
  lastDonationDate?: string | null;
  daysSinceLastDonation?: number | null;
  averageDonation: number;
  // History for trends
  scoreHistory: Array<{ date: string; score: number }>;
  // Timestamps
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementStats {
  totalDonors: number;
  scoredDonors: number;
  averageScore: number;
  highlyEngaged: number;
  engaged: number;
  moderate: number;
  lowEngagement: number;
  atRisk: number;
}

export interface EngagementScoreBreakdown {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface Task {
  id: string;
  title?: string;
  description: string;
  teamMemberId: string;
  dueDate: string;
  status: TaskStatus;
  sharedWithClient?: boolean;
  notes?: string;
  phase?: string;
  projectId?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  teamMemberIds: string[];
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  tasks: Task[];
  notes?: string | null;
  pinned?: boolean;
  starred?: boolean;
  tags?: string[];
  archived?: boolean;
  budget?: number;
  budgetSpent?: number;
  fundraisingGoal?: number;
  fundraisingRaised?: number;
  isTemplate?: boolean;
  templateName?: string;
  createdAt?: string;
  updatedAt?: string;
  // Grant & Milestone tracking
  milestones?: ProjectMilestone[];
  grantId?: string;
  // Dependencies
  dependsOn?: string[]; // Array of project IDs this project depends on
  blockedBy?: string[]; // Array of project IDs blocking this project
  // Volunteer tracking
  volunteerIds?: string[];
  volunteerHours?: VolunteerHourLog[];
  // Automations
  automations?: ProjectAutomation[];
  // Portal settings
  portalEnabled?: boolean;
  portalAccessCode?: string;
}

// Milestone types for grant tracking
export enum MilestoneType {
  Deliverable = 'Deliverable',
  Reporting = 'Reporting',
  Financial = 'Financial',
  Progress = 'Progress',
  Custom = 'Custom'
}

export enum MilestoneStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Overdue = 'Overdue',
  Blocked = 'Blocked'
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: MilestoneType;
  status: MilestoneStatus;
  dueDate: string;
  completedDate?: string;
  amount?: number; // For financial milestones (grant disbursements)
  deliverables?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Volunteer hour tracking
export interface VolunteerHourLog {
  id: string;
  volunteerId: string;
  projectId: string;
  taskId?: string;
  hours: number;
  date: string;
  description?: string;
  approved?: boolean;
  approvedBy?: string;
  hourlyValue?: number; // Monetary value of volunteer time
  createdAt?: string;
}

// Project automation rules
export enum AutomationTrigger {
  ProjectCreated = 'project_created',
  ProjectCompleted = 'project_completed',
  MilestoneCompleted = 'milestone_completed',
  TaskCompleted = 'task_completed',
  DeadlineApproaching = 'deadline_approaching',
  BudgetThreshold = 'budget_threshold',
  DonationReceived = 'donation_received',
  VolunteerHoursLogged = 'volunteer_hours_logged'
}

export enum AutomationAction {
  SendEmail = 'send_email',
  CreateTask = 'create_task',
  UpdateStatus = 'update_status',
  NotifyTeam = 'notify_team',
  GenerateReport = 'generate_report',
  SendThankYou = 'send_thank_you'
}

export interface ProjectAutomation {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  triggerConditions?: Record<string, any>;
  action: AutomationAction;
  actionConfig?: Record<string, any>;
  enabled: boolean;
  lastTriggered?: string;
  createdAt?: string;
}

export interface EnrichedTask extends Task {
  projectName: string;
  projectId: string;
}

export enum ActivityType {
  Call = 'Call',
  Email = 'Email',
  Meeting = 'Meeting',
  Note = 'Note',
}

export enum ActivityStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  projectId?: string | null;
  clientId?: string | null;
  caseId?: string | null;
  activityDate: string; // YYYY-MM-DD
  activityTime?: string; // HH:mm
  status: ActivityStatus;
  notes?: string;
  createdById: string; // TeamMember ID
  sharedWithClient?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string; // TeamMember ID or 'USER' or 'AI'
  text: string;
  timestamp: string; // ISO string
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail?: string | null;
  clientId?: string | null;
  amount: number;
  donationDate: string;
  campaign: string;
  paymentMethod?: string | null;
  isRecurring?: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  availability: string;
  assignedProjectIds: string[];
  assignedClientIds: string[];
}

export enum CaseStatus {
  New = 'New',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export enum CasePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface CaseComment {
  id: string;
  authorId: string; // TeamMember ID
  text: string;
  timestamp: string; // ISO String
}


export interface Case {
  id: string;
  title: string;
  description: string;
  clientId: string;
  assignedToId: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string; // ISO String
  lastUpdatedAt: string; // ISO String
  activityIds?: string[];
  documentIds?: string[];
  comments?: CaseComment[];
}

export enum DocumentCategory {
    Client = 'Client',
    Project = 'Project',
    Internal = 'Internal',
    Template = 'Template',
}

export interface Document {
    id: string;
    name: string;
    category: DocumentCategory;
    relatedId: string; // Can be clientId or projectId, or teamId for internal
    fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'other';
    size: string; // e.g., "2.5 MB"
    lastModified: string; // ISO String
    uploadedById: string; // TeamMember ID
}

export enum WebpageStatus {
    Published = 'Published',
    Draft = 'Draft',
    Archived = 'Archived',
}

export interface WebpageComponentStyles {
  backgroundColor?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string; 
  fontWeight?: 'normal' | 'bold';
  padding?: string;
  margin?: string;
}

export type WebpageComponentType = 'headline' | 'paragraph' | 'image' | 'button' | 'spacer' | 'hero' | 'video' | 'columns';

export interface WebpageComponent {
  id: string;
  type: WebpageComponentType;
  content: { [key: string]: any };
  styles?: WebpageComponentStyles;
  children?: WebpageComponent[][]; // Array of columns, each column is an array of components
}


export interface Webpage {
    id: string;
    relatedId: string; // Client ID
    title: string;
    status: WebpageStatus;
    lastUpdated: string; // ISO String
    visits: number;
    engagementScore: number; // 0-100
    content?: WebpageComponent[];
    colorPalette?: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
    }
}

export interface ScheduleItem {
    id: string;
    time: string; // e.g., "09:00 AM"
    title: string;
    description?: string;
}

export interface TicketType {
    id: string;
    name: string;
    price: number;
    description?: string;
}

export interface Event {
  id: string;
  title: string;
  clientId?: string | null;
  eventDate: string; // ISO String for date and time
  location: string;
  description: string;
  bannerImageUrl?: string;
  isPublished: boolean;
  schedule: ScheduleItem[];
  ticketTypes: TicketType[];
  volunteerIds: string[];
}

export type PortalWidgetType = 
    | 'welcome' 
    | 'projects' 
    | 'tasks' 
    | 'activities' 
    | 'documents'
    | 'team'
    | 'calendar'
    | 'events'
    | 'volunteers'
    | 'donations'
    | 'charity-tracker'
    | 'live-chat'
    | 'video-conference'
    | 'ai-chat-bot';

export interface PortalComponent {
    id: string;
    type: PortalWidgetType;
    settings: {
        title?: string;
        itemLimit?: number;
        [key: string]: any;
    };
}

export interface PortalLayout {
    clientId: string;
    components: PortalComponent[];
}

export interface EmailCampaignStats {
    sent: number;
    opened: number;
    clicked: number;
    unsubscribes: number;
}

export interface EmailCampaign {
    id: string;
    name: string;
    status: 'Sent' | 'Draft' | 'Scheduled';
    subject: string;
    subjectLineB?: string; // For A/B testing
    body: string;
    headerImageUrl?: string;
    ctaButtonText?: string;
    ctaButtonUrl?: string;
    recipientSegment: string;
    recipientCount?: number;
    sentDate?: string; // ISO String - becomes defined when sent
    scheduleDate?: string; // ISO String - for scheduled campaigns
    stats: EmailCampaignStats;
    performance?: {
        opensOverTime: { hour: number, count: number }[];
    }
}

export interface WebSearchResult {
  name: string;
  description: string;
  url?: string;
  source: string;
}

// Navigation search result for app pages/features
export interface NavSearchResult {
  type: 'navigation';
  pageId: Page;
  label: string;
  section: string;
  keywords: string[];
}

// Feature/action search result for quick actions
export interface FeatureSearchResult {
  type: 'feature';
  label: string;
  description: string;
  action: string;
  keywords: string[];
}

// Metadata about search execution for UI indicators
export interface SearchMeta {
    localSearchComplete: boolean;
    aiSearchComplete: boolean;
    aiSearchEnabled: boolean;
    aiSearchError?: string;
    searchStartTime: number;
    localSearchTime?: number;
    aiSearchTime?: number;
}

export interface SearchResults {
    projects: Project[];
    clients: Client[];
    tasks: EnrichedTask[];
    teamMembers: TeamMember[];
    activities: Activity[];
    volunteers: Volunteer[];
    cases: Case[];
    documents: Document[];
    webResults: WebSearchResult[];
    // Navigation and feature results
    navigation: NavSearchResult[];
    features: FeatureSearchResult[];
    // Search metadata for UI indicators
    meta?: SearchMeta;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    teamMemberId?: string;
    color?: { bg: string; text: string; border: string };
    type?: 'project' | 'task' | 'activity';
    // Optional properties for calendar provider integration
    provider?: 'google' | 'microsoft' | 'apple' | 'outlook';
    calendarId?: string;
    description?: string;
    location?: string;
    attendees?: string[] | { email: string; displayName?: string; responseStatus?: string }[];
    organizer?: { email: string; displayName?: string };
    hangoutLink?: string;
    htmlLink?: string;
}

export interface RecommendedVolunteer {
  volunteerId: string;
  name: string;
  justification: string;
  matchScore: number; // A score from 0-100 indicating match quality
}

export interface AiPhase {
    phaseName: string;
    tasks: string[];
}
export interface AiProjectPlan {
    projectName: string;
    description: string;
    phases: AiPhase[];
    error?: string;
}

export interface ActionItemSuggestion {
  taskDescription: string;
  suggestedAssignee?: string;
}

export interface MeetingAnalysisResult {
  summary: string;
  actionItems: ActionItemSuggestion[];
  error?: string;
}

// ============================================
// STEWARDSHIP AUTOMATION TYPES
// ============================================

export type TriggerType =
  | 'donation_created'
  | 'pledge_created'
  | 'pledge_payment_due'
  | 'large_donation'
  | 'engagement_dropped'
  | 'birthday'
  | 'anniversary'
  | 'manual';

export type ActionType =
  | 'send_email'
  | 'create_task'
  | 'send_sms'
  | 'log_communication'
  | 'update_engagement';

export type ExecutionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string | null;
  subject: string;
  body: string;
  category: string;
  availableMergeFields: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string | null;
  triggerType: TriggerType;
  triggerConditions: Record<string, any>;
  actionType: ActionType;
  actionConfig: Record<string, any>;
  delayMinutes: number;
  templateId?: string | null;
  assignToUserId?: string | null;
  isActive: boolean;
  priority: number;
  executionCount: number;
  lastExecutedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  templateName?: string;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName?: string;
  clientId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  triggerType: TriggerType;
  triggerData: Record<string, any>;
  triggerEntityId?: string | null;
  scheduledFor: string;
  status: ExecutionStatus;
  executedAt?: string | null;
  resultData: Record<string, any>;
  errorMessage?: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationStats {
  totalRules: number;
  activeRules: number;
  pendingExecutions: number;
  completedToday: number;
  failedToday: number;
  totalExecutions: number;
}

// ============================================
// CAMPAIGN MANAGEMENT TYPES
// ============================================

export type CampaignType =
  | 'annual_fund'
  | 'specific_project'
  | 'emergency_appeal'
  | 'peer_to_peer'
  | 'monthly_giving'
  | 'capital_campaign'
  | 'matching_gift'
  | 'crowdfunding';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type CampaignContactStatus =
  | 'pending'
  | 'contacted'
  | 'responded'
  | 'donated'
  | 'declined'
  | 'unsubscribed';

export type EngagementTier = 'champion' | 'core' | 'emerging' | 'at_risk' | 'lapsed';

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  campaignType: CampaignType;
  status: CampaignStatus;
  // Financial goals
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  // Timing
  startDate?: string | null;
  endDate?: string | null;
  // Targeting
  targetEngagementTiers: EngagementTier[];
  minEngagementScore?: number | null;
  maxEngagementScore?: number | null;
  // Content
  appealMessage?: string | null;
  thankYouMessage?: string | null;
  // Settings
  useSuggestedAsks: boolean;
  allowRecurring: boolean;
  // Email statistics
  emailSentCount: number;
  emailOpenedCount: number;
  emailClickedCount: number;
  // Metadata
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSegment {
  id: string;
  campaignId: string;
  name: string;
  engagementTier: EngagementTier;
  minScore: number;
  maxScore: number;
  suggestedAskMultiplier: number;
  expectedResponseRate: number;
  // Results
  contactCount: number;
  respondedCount: number;
  donatedCount: number;
  totalRaised: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignContact {
  id: string;
  campaignId: string;
  segmentId?: string | null;
  clientId: string;
  // Contact info at time of campaign
  engagementScore?: number | null;
  engagementTier?: EngagementTier | null;
  // Ask strategy
  suggestedAsk?: number | null;
  actualAsk?: number | null;
  // Status
  status: CampaignContactStatus;
  // Communication tracking
  emailSentAt?: string | null;
  emailOpenedAt?: string | null;
  emailClickedAt?: string | null;
  // Response tracking
  respondedAt?: string | null;
  responseNotes?: string | null;
  // Donation tracking
  donationId?: string | null;
  donationAmount?: number | null;
  donatedAt?: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Joined fields
  clientName?: string;
  clientEmail?: string;
}

export interface CampaignPerformance extends Campaign {
  progressPercentage: number;
  totalContacts: number;
  contactedCount: number;
  respondedCount: number;
  donationsCount: number;
  responseRate: number;
  openRate: number;
  clickRate: number;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalGoal: number;
  totalRaised: number;
  totalDonors: number;
  averageResponseRate: number;
}

export const ENGAGEMENT_TIER_CONFIG: Record<EngagementTier, {
  label: string;
  minScore: number;
  maxScore: number;
  askMultiplier: number;
  expectedResponseRate: number;
  color: string;
}> = {
  champion: {
    label: 'Champion',
    minScore: 85,
    maxScore: 100,
    askMultiplier: 1.5,
    expectedResponseRate: 0.35,
    color: '#10b981', // green
  },
  core: {
    label: 'Core',
    minScore: 70,
    maxScore: 84,
    askMultiplier: 1.2,
    expectedResponseRate: 0.25,
    color: '#3b82f6', // blue
  },
  emerging: {
    label: 'Emerging',
    minScore: 50,
    maxScore: 69,
    askMultiplier: 1.0,
    expectedResponseRate: 0.15,
    color: '#f59e0b', // amber
  },
  at_risk: {
    label: 'At Risk',
    minScore: 30,
    maxScore: 49,
    askMultiplier: 0.8,
    expectedResponseRate: 0.10,
    color: '#f97316', // orange
  },
  lapsed: {
    label: 'Lapsed',
    minScore: 0,
    maxScore: 29,
    askMultiplier: 0.6,
    expectedResponseRate: 0.05,
    color: '#ef4444', // red
  },
};

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  annual_fund: 'Annual Fund',
  specific_project: 'Specific Project',
  emergency_appeal: 'Emergency Appeal',
  peer_to_peer: 'Peer-to-Peer',
  monthly_giving: 'Monthly Giving',
  capital_campaign: 'Capital Campaign',
  matching_gift: 'Matching Gift',
  crowdfunding: 'Crowdfunding',
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ============================================
// ANALYTICS & REPORTING TYPES
// ============================================

export interface DonorCohort {
  id: string;
  cohortYear: number;
  cohortName: string;
  description?: string | null;
  totalDonors: number;
  totalFirstYearValue: number;
  avgFirstGift: number;
  createdAt: string;
  updatedAt: string;
}

export interface CohortMember {
  id: string;
  cohortId: string;
  clientId: string;
  firstDonationDate: string;
  firstDonationAmount: number;
  acquisitionSource?: string | null;
  createdAt: string;
  // Joined fields
  clientName?: string;
  clientEmail?: string;
}

export interface LifetimeValue {
  id: string;
  clientId: string;
  // Actual values
  totalLifetimeValue: number;
  totalDonations: number;
  avgDonation: number;
  largestDonation: number;
  firstDonationDate?: string | null;
  lastDonationDate?: string | null;
  donorTenureMonths: number;
  // Projected values
  projectedAnnualValue: number;
  projected5YrValue: number;
  // RFM Scores (0-100 each)
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  rfmScore: number;
  // Timestamps
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  clientName?: string;
  clientEmail?: string;
}

export interface RetentionMetric {
  id: string;
  cohortId: string;
  metricYear: number;
  yearsSinceAcquisition: number;
  // Counts
  donorsStartOfYear: number;
  donorsRetained: number;
  donorsLapsed: number;
  donorsReactivated: number;
  // Rates
  retentionRate: number;
  lapseRate: number;
  // Values
  totalValue: number;
  avgGift: number;
  // Timestamps
  calculatedAt: string;
  createdAt: string;
  // Joined fields
  cohortYear?: number;
  cohortName?: string;
}

export interface GivingProgression {
  id: string;
  clientId: string;
  year: number;
  // Giving metrics
  giftCount: number;
  giftTotal: number;
  avgGift: number;
  largestGift: number;
  // Year-over-year changes
  yoyGiftCountChange: number;
  yoyTotalChange: number;
  yoyTotalChangePct: number;
  // Tier tracking
  engagementTierStart?: string | null;
  engagementTierEnd?: string | null;
  tierChanged: boolean;
  tierImproved: boolean;
  createdAt: string;
  // Joined fields
  clientName?: string;
}

export type ReportType = 'cohort' | 'ltv' | 'retention' | 'progression' | 'custom';
export type ChartType = 'bar' | 'line' | 'pie' | 'table' | 'area';
export type DateRangeType = 'all_time' | 'this_year' | 'last_year' | 'custom';

export interface SavedReport {
  id: string;
  name: string;
  description?: string | null;
  reportType: ReportType;
  // Configuration
  filters: Record<string, any>;
  columns: string[];
  sortBy?: string | null;
  sortDirection: 'asc' | 'desc';
  // Display
  chartType?: ChartType | null;
  dateRangeType?: DateRangeType | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  // Metadata
  createdBy?: string | null;
  isFavorite: boolean;
  lastRunAt?: string | null;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CohortRetentionSummary {
  cohortId: string;
  cohortYear: number;
  cohortName: string;
  originalDonors: number;
  totalFirstYearValue: number;
  avgFirstGift: number;
  metricYear: number;
  yearsSinceAcquisition: number;
  donorsRetained: number;
  retentionRate: number;
  yearValue: number;
  yearAvgGift: number;
  cumulativeRetentionRate: number;
}

export interface DonorAnalyticsSummary {
  clientId: string;
  clientName: string;
  clientEmail?: string | null;
  // Cohort
  cohortYear?: number | null;
  cohortName?: string | null;
  firstDonationDate?: string | null;
  firstDonationAmount?: number | null;
  // LTV
  totalLifetimeValue?: number | null;
  totalDonations?: number | null;
  avgDonation?: number | null;
  largestDonation?: number | null;
  donorTenureMonths?: number | null;
  projectedAnnualValue?: number | null;
  projected5YrValue?: number | null;
  rfmScore?: number | null;
  // Engagement
  engagementScore?: number | null;
  engagementLevel?: string | null;
  // Progression
  latestYear?: number | null;
  latestGiftCount?: number | null;
  latestGiftTotal?: number | null;
  yoyTotalChangePct?: number | null;
  tierImproved?: boolean | null;
}

export interface AnalyticsStats {
  totalDonors: number;
  totalLifetimeValue: number;
  avgLifetimeValue: number;
  avgRfmScore: number;
  totalCohorts: number;
  avgRetentionRate: number;
  donorsWithProgression: number;
  avgYoyGrowth: number;
}

export interface AnalyticsRefreshResult {
  cohortsRefreshed: number;
  ltvCalculated: number;
  retentionCalculated: number;
  progressionCalculated: number;
}

// ============================================
// OUTCOME MEASUREMENT TYPES
// ============================================

export type ProgramCategory = 'employment' | 'housing' | 'education' | 'health' | 'financial' | 'family' | 'other';
export type ProgramType = 'one-time' | 'ongoing' | 'cohort' | 'drop-in';
export type ServiceStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type ServiceType = 'session' | 'class' | 'meeting' | 'workshop' | 'assessment' | 'follow-up';
export type ProgressStage = 'enrolled' | 'active' | 'completing' | 'completed' | 'graduated' | 'withdrawn' | 'on-hold';
export type CompletionStatus = 'completed' | 'graduated' | 'withdrawn' | 'transferred' | 'inactive';
export type OutcomeCategory = 'employment' | 'housing' | 'education' | 'health' | 'financial' | 'family' | 'other';

export interface Program {
  id: string;
  name: string;
  description?: string | null;
  category: ProgramCategory;
  programType: ProgramType;
  durationWeeks?: number | null;
  costPerParticipant: number;
  maxParticipants?: number | null;
  trackAttendance: boolean;
  trackOutcomes: boolean;
  outcomeTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  clientId: string;
  programId: string;
  serviceDate: string;
  serviceType: ServiceType;
  durationMinutes: number;
  status: ServiceStatus;
  notes?: string | null;
  providerId?: string | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  clientName?: string;
  programName?: string;
  providerName?: string;
}

export interface Outcome {
  id: string;
  clientId: string;
  programId?: string | null;
  outcomeType: string;
  outcomeCategory?: OutcomeCategory | null;
  beforeValue?: number | null;
  afterValue?: number | null;
  beforeStatus?: string | null;
  afterStatus?: string | null;
  impactValue: number;
  impactDescription?: string | null;
  outcomeDate: string;
  verified: boolean;
  verifiedBy?: string | null;
  verifiedDate?: string | null;
  evidenceNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  clientName?: string;
  programName?: string;
}

export interface ClientProgress {
  id: string;
  clientId: string;
  programId: string;
  enrollmentDate: string;
  enrollmentSource?: string | null;
  currentStage: ProgressStage;
  stageUpdatedAt: string;
  sessionsAttended: number;
  sessionsScheduled: number;
  attendanceRate: number;
  lastAttendanceDate?: string | null;
  completionDate?: string | null;
  completionStatus?: CompletionStatus | null;
  withdrawalReason?: string | null;
  outcomesAchieved: number;
  primaryOutcomeId?: string | null;
  atRisk: boolean;
  riskFactors: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  clientName?: string;
  programName?: string;
}

export interface ProgramResult {
  id: string;
  programId: string;
  periodType: 'monthly' | 'quarterly' | 'yearly';
  periodStart: string;
  periodEnd: string;
  enrolledCount: number;
  activeCount: number;
  completedCount: number;
  withdrawnCount: number;
  totalServices: number;
  avgAttendanceRate: number;
  totalServiceHours: number;
  outcomeCount: number;
  totalImpactValue: number;
  avgImpactPerClient: number;
  costPerOutcome: number;
  costPerClient: number;
  roiPercentage: number;
  completionRate: number;
  avgTimeToCompletion?: number | null;
  calculatedAt: string;
  createdAt: string;
  // Joined fields
  programName?: string;
}

export interface ImpactSnapshot {
  id: string;
  snapshotDate: string;
  snapshotType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  totalServices: number;
  totalServiceHours: number;
  uniqueClientsServed: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completionsThisPeriod: number;
  totalOutcomes: number;
  outcomesThisPeriod: number;
  totalImpactValue: number;
  impactThisPeriod: number;
  employmentOutcomes: number;
  housingOutcomes: number;
  educationOutcomes: number;
  healthOutcomes: number;
  financialOutcomes: number;
  avgCostPerOutcome: number;
  overallCompletionRate: number;
  summaryMetrics: Record<string, any>;
  createdAt: string;
}

export interface ClientOutcomeSummary {
  clientId: string;
  clientName: string;
  clientEmail?: string | null;
  programsEnrolled: number;
  programsCompleted: number;
  totalServices: number;
  totalServiceHours: number;
  lastServiceDate?: string | null;
  totalOutcomes: number;
  totalImpactValue: number;
  clientStatus: 'active' | 'graduated' | 'inactive';
  firstEnrollmentDate?: string | null;
  lastCompletionDate?: string | null;
}

export interface ProgramImpactSummary {
  programId: string;
  programName: string;
  programCategory: ProgramCategory;
  costPerParticipant: number;
  isActive: boolean;
  totalEnrolled: number;
  currentlyActive: number;
  totalCompleted: number;
  avgAttendanceRate: number;
  totalServices: number;
  totalServiceHours: number;
  totalOutcomes: number;
  totalImpactValue: number;
  completionRate: number;
  outcomesPerGraduate: number;
  costPerOutcome: number;
  roiPercentage: number;
}

export interface ImpactStats {
  totalPrograms: number;
  activePrograms: number;
  totalClientsServed: number;
  activeClients: number;
  totalServicesDelivered: number;
  totalServiceHours: number;
  totalOutcomes: number;
  totalImpactValue: number;
  avgCompletionRate: number;
  avgCostPerOutcome: number;
  overallROI: number;
}

export const PROGRAM_CATEGORY_LABELS: Record<ProgramCategory, string> = {
  employment: 'Employment',
  housing: 'Housing',
  education: 'Education',
  health: 'Health & Wellness',
  financial: 'Financial',
  family: 'Family',
  other: 'Other',
};

export const PROGRAM_CATEGORY_COLORS: Record<ProgramCategory, string> = {
  employment: '#3b82f6', // blue
  housing: '#10b981', // green
  education: '#8b5cf6', // purple
  health: '#f43f5e', // rose
  financial: '#f59e0b', // amber
  family: '#ec4899', // pink
  other: '#6b7280', // gray
};

export const PROGRESS_STAGE_LABELS: Record<ProgressStage, string> = {
  enrolled: 'Enrolled',
  active: 'Active',
  completing: 'Completing',
  completed: 'Completed',
  graduated: 'Graduated',
  withdrawn: 'Withdrawn',
  'on-hold': 'On Hold',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  session: 'Session',
  class: 'Class',
  meeting: 'Meeting',
  workshop: 'Workshop',
  assessment: 'Assessment',
  'follow-up': 'Follow-up',
};

// ============================================
// MOVES MANAGEMENT / DONOR CULTIVATION TYPES
// ============================================

export type DonorStage =
  | 'identification'
  | 'qualification'
  | 'cultivation'
  | 'solicitation'
  | 'stewardship'
  | 'lapsed';

export type DonorType =
  | 'prospect'
  | 'first-time'
  | 'repeat'
  | 'major'
  | 'legacy'
  | 'corporate'
  | 'foundation';

export type GivingCapacity = 'low' | 'medium' | 'high' | 'major';

export type MovePriority = 'low' | 'medium' | 'high' | 'urgent';

export type TargetGiftType =
  | 'one-time'
  | 'recurring'
  | 'pledge'
  | 'planned-gift'
  | 'in-kind';

export interface DonorMove {
  id: string;
  clientId: string;
  currentStage: DonorStage;
  stageEnteredAt: string;
  previousStage?: DonorStage | null;
  donorType: DonorType;
  givingCapacity?: GivingCapacity | null;
  affinityScore: number; // 0-100
  assignedTo?: string | null;
  targetGiftAmount?: number | null;
  targetGiftDate?: string | null;
  targetGiftType?: TargetGiftType | null;
  isActive: boolean;
  priority: MovePriority;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CultivationPlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export type CultivationGoalType =
  | 'first-gift'
  | 'upgrade'
  | 'major-gift'
  | 'recurring'
  | 'planned-gift'
  | 'retention';

export interface CultivationPlan {
  id: string;
  donorMoveId: string;
  clientId: string;
  name: string;
  description?: string | null;
  strategy?: string | null;
  startDate: string;
  targetCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  goalDescription?: string | null;
  goalAmount?: number | null;
  goalType?: CultivationGoalType | null;
  status: CultivationPlanStatus;
  successCriteria?: string | null;
  outcomeNotes?: string | null;
  wasSuccessful?: boolean | null;
  createdBy?: string | null;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CultivationTaskType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'event-invite'
  | 'tour'
  | 'gift'
  | 'research'
  | 'proposal'
  | 'follow-up'
  | 'other';

export type CultivationTaskStatus =
  | 'pending'
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'deferred';

export interface CultivationTask {
  id: string;
  cultivationPlanId: string;
  title: string;
  description?: string | null;
  taskType: CultivationTaskType;
  dueDate?: string | null;
  scheduledDate?: string | null;
  completedDate?: string | null;
  status: CultivationTaskStatus;
  priority: MovePriority;
  assignedTo?: string | null;
  sequenceOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type TouchpointType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'event'
  | 'tour'
  | 'gift-sent'
  | 'letter'
  | 'social-media'
  | 'visit'
  | 'thank-you'
  | 'proposal'
  | 'other';

export type TouchpointDirection = 'inbound' | 'outbound';

export type TouchpointSentiment = 'positive' | 'neutral' | 'negative';

export type TouchpointEngagementLevel = 'high' | 'medium' | 'low' | 'none';

export interface Touchpoint {
  id: string;
  clientId: string;
  donorMoveId?: string | null;
  cultivationPlanId?: string | null;
  cultivationTaskId?: string | null;
  touchpointType: TouchpointType;
  touchpointDate: string;
  direction: TouchpointDirection;
  subject?: string | null;
  description?: string | null;
  outcome?: string | null;
  sentiment?: TouchpointSentiment | null;
  engagementLevel?: TouchpointEngagementLevel | null;
  followUpRequired: boolean;
  followUpDate?: string | null;
  followUpNotes?: string | null;
  recordedBy?: string | null;
  relatedDonationId?: string | null;
  relatedActivityId?: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Donor Pipeline Summary (from view)
export interface DonorPipelineSummary {
  currentStage: DonorStage;
  donorType: DonorType;
  givingCapacity?: GivingCapacity | null;
  priority: MovePriority;
  donorCount: number;
  totalTargetAmount: number;
  activePlans: number;
  pendingTasks: number;
  overdueTasks: number;
  totalTouchpoints: number;
  lastTouchpointDate?: string | null;
}

// Cultivation Activity Summary (from view)
export interface CultivationActivitySummary {
  clientId: string;
  clientName: string;
  clientEmail?: string | null;
  currentStage: DonorStage;
  donorType: DonorType;
  givingCapacity?: GivingCapacity | null;
  targetGiftAmount?: number | null;
  targetGiftDate?: string | null;
  assignedTo?: string | null;
  priority: MovePriority;
  activePlanName?: string | null;
  planGoal?: number | null;
  planTargetDate?: string | null;
  pendingTasks: number;
  completedTasks: number;
  totalTouchpoints: number;
  lastTouchpoint?: string | null;
  touchpointsLast30Days: number;
  nextTaskDue?: string | null;
}

// Label mappings for display
export const DONOR_STAGE_LABELS: Record<DonorStage, string> = {
  identification: 'Identification',
  qualification: 'Qualification',
  cultivation: 'Cultivation',
  solicitation: 'Solicitation',
  stewardship: 'Stewardship',
  lapsed: 'Lapsed',
};

export const DONOR_STAGE_COLORS: Record<DonorStage, string> = {
  identification: '#94a3b8', // slate
  qualification: '#3b82f6', // blue
  cultivation: '#8b5cf6', // purple
  solicitation: '#f59e0b', // amber
  stewardship: '#10b981', // green
  lapsed: '#ef4444', // red
};

export const DONOR_TYPE_LABELS: Record<DonorType, string> = {
  prospect: 'Prospect',
  'first-time': 'First-Time Donor',
  repeat: 'Repeat Donor',
  major: 'Major Donor',
  legacy: 'Legacy Donor',
  corporate: 'Corporate',
  foundation: 'Foundation',
};

export const GIVING_CAPACITY_LABELS: Record<GivingCapacity, string> = {
  low: 'Low (<$1K)',
  medium: 'Medium ($1K-$10K)',
  high: 'High ($10K-$100K)',
  major: 'Major (>$100K)',
};

export const TOUCHPOINT_TYPE_LABELS: Record<TouchpointType, string> = {
  call: 'Phone Call',
  email: 'Email',
  meeting: 'Meeting',
  event: 'Event',
  tour: 'Tour/Visit',
  'gift-sent': 'Gift Sent',
  letter: 'Letter/Mail',
  'social-media': 'Social Media',
  visit: 'Site Visit',
  'thank-you': 'Thank You',
  proposal: 'Proposal',
  other: 'Other',
};

export const CULTIVATION_TASK_TYPE_LABELS: Record<CultivationTaskType, string> = {
  call: 'Phone Call',
  email: 'Send Email',
  meeting: 'Schedule Meeting',
  'event-invite': 'Event Invitation',
  tour: 'Facility Tour',
  gift: 'Send Gift',
  research: 'Research',
  proposal: 'Prepare Proposal',
  'follow-up': 'Follow Up',
  other: 'Other',
};

// Keep the existing Page type definition
export type Page =
  | 'dashboard'
  | 'organizations'
  | 'contacts'
  | 'clients'
  | 'households'
  | 'projects'
  | 'project-hub'
  | 'team'
  | 'activities'
  | 'calendar'
  | 'calendar-settings'
  | 'volunteers'
  | 'charity'
  | 'case'
  | 'cases'
  | 'chat'
  | 'video'
  | 'tasks'
  | 'email'
  | 'events'
  | 'documents'
  | 'donations'
  | 'pledges'
  | 'reports'
  | 'form-generator'
  | 'web-management'
  | 'portal-builder'
  | 'client-portal'
  | 'ai-tools'
  | 'grant-assistant'
  | 'live-chat'
  | 'stewardship'
  | 'campaigns'
  | 'analytics'
  | 'impact'
  | 'impact-reports'
  | 'donor-pipeline'
  | 'cultivation'
  | 'touchpoints'
  | 'relationship-timeline'
  | 'search-results'
  | 'pulse-settings'
  | 'entomate-sync'
  | 'settings'
  | 'outreach-hub'
  | 'forge'
  | 'connect'
  | 'design-preview';

// ============================================
// NAVIGATION TYPES
// ============================================

/**
 * Represents a recently visited page/record for the Recent Items sidebar widget
 */
export interface RecentItem {
  page: Page;
  label: string;
  timestamp: number;
  detailId?: string;  // For detail views (e.g., specific contact/project ID)
}

// ============================================
// ENTOMATE INTEGRATION TYPES
// ============================================

export type EntomateSyncStatus = 'pending' | 'synced' | 'failed';
export type EntomatePriority = 'high' | 'medium' | 'low';

/**
 * Represents an action item from Entomate meetings
 */
export interface EntoamteActionItem {
  id: string;
  meeting_id: string;
  task_description: string;
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
  assigned_to_user_id?: string | null;
  due_date?: string | null;
  priority: EntomatePriority;
  status: 'pending' | 'in_progress' | 'complete';
  crm_sync_status: EntomateSyncStatus;
  crm_task_id?: string | null;
  last_sync_attempt?: string | null;
  last_sync_error?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a meeting from Entomate
 */
export interface EntomateMeeting {
  id: string;
  title: string;
  description?: string | null;
  transcript?: string | null;
  summary?: string | null;
  key_points?: string[] | null;
  decisions?: string[] | null;
  sentiment_score?: number | null;
  sentiment_label?: string | null;
  crm_deal_id?: string | null;
  attendees?: string[] | null;
  duration_minutes?: number | null;
  meeting_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a project from Entomate
 */
export interface EntoamteProject {
  id: string;
  name: string;
  status: string;
  logos_project_id?: string | null;
  crm_deal_id?: string | null;
  deal_value?: number | null;
  owner_id?: string | null;
  team_ids?: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Result of syncing an action item to Logos Vision
 */
export interface EntomateSyncResult {
  success: boolean;
  actionItemId: string;
  crmTaskId?: string;
  error?: string;
}

/**
 * Sync status summary for Entomate data
 */
export interface EntomateSyncSummary {
  total: number;
  synced: number;
  pending: number;
  failed: number;
  lastSyncAt?: string | null;
}

/**
 * Configuration for Entomate integration
 */
export interface EntoamteIntegrationConfig {
  enabled: boolean;
  autoSync: boolean;
  syncFrequency: 'realtime' | '5min' | '15min' | '30min' | 'hourly';
  defaultTeamMemberId?: string | null;
  syncActionItems: boolean;
  syncMeetings: boolean;
  syncProjects: boolean;
  createActivitiesFromMeetings: boolean;
}

/**
 * Log entry for Entomate sync operations
 */
export interface EntomateSyncLog {
  id: string;
  source_type: 'action_item' | 'meeting' | 'project';
  source_id: string;
  destination_type: 'task' | 'activity' | 'project';
  destination_id?: string | null;
  status: EntomateSyncStatus;
  error_message?: string | null;
  retry_count: number;
  created_at: string;
}

// ============================================
// CRM CONTACTS & ORGANIZATIONS (Separate from Case Management)
// ============================================

/**
 * Contact - CRM contact for donor/volunteer management
 * Separate from Client which is used for Case Management
 */
export interface Contact {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  type: 'individual' | 'organization_contact';
  engagementScore: 'low' | 'medium' | 'high';
  donorStage: string;
  totalLifetimeGiving: number;
  lastGiftDate?: string | null;
  notes?: string | null;
  preferredContactMethod?: PreferredContactMethod | null;
  doNotEmail?: boolean;
  doNotCall?: boolean;
  doNotMail?: boolean;
  doNotText?: boolean;
  emailOptIn?: boolean;
  newsletterSubscriber?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationType = 'nonprofit' | 'foundation' | 'corporation' | 'government' | 'other';

/**
 * Organization - CRM organization entity
 * Separate from Client used in Case Management
 */
export interface Organization {
  id: string;
  name: string;
  orgType: OrganizationType;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  ein?: string | null;
  missionStatement?: string | null;
  primaryContactId?: string | null;
  parentOrgId?: string | null;
  totalDonations: number;
  contactCount: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined fields for display
  primaryContact?: Contact | null;
  parentOrg?: Organization | null;
}

/**
 * Organization-Contact relationship (many-to-many junction)
 */
export interface OrganizationContactRelation {
  id: string;
  organizationId: string;
  contactId: string;
  relationshipType: OrganizationRelationshipType;
  roleTitle?: string | null;
  department?: string | null;
  isPrimaryContact: boolean;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  organization?: Organization;
  contact?: Contact;
}

/**
 * Contact with their organization affiliations
 */
export interface ContactWithAffiliations extends Contact {
  affiliations: OrganizationContactRelation[];
}

/**
 * Organization with detailed info including contacts
 */
export interface OrganizationWithDetails extends Organization {
  contacts: OrganizationContactRelation[];
  childOrganizations: Organization[];
  parentOrganization?: Organization | null;
  donationStats?: {
    totalAmount: number;
    donationCount: number;
    uniqueDonors: number;
    lastDonationDate?: string | null;
    averageDonation: number;
  };
}

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  nonprofit: 'Nonprofit',
  foundation: 'Foundation',
  corporation: 'Corporation',
  government: 'Government',
  other: 'Other',
};

export const ORGANIZATION_TYPE_COLORS: Record<OrganizationType, string> = {
  nonprofit: '#10b981', // green
  foundation: '#8b5cf6', // purple
  corporation: '#3b82f6', // blue
  government: '#f59e0b', // amber
  other: '#6b7280', // gray
};

export const ENGAGEMENT_SCORE_LABELS: Record<'low' | 'medium' | 'high', string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const ENGAGEMENT_SCORE_COLORS: Record<'low' | 'medium' | 'high', string> = {
  low: '#6b7280', // gray
  medium: '#f59e0b', // amber
  high: '#10b981', // green
};

// ============================================
// ORGANIZATION RELATIONSHIP TYPES
// ============================================

export type OrganizationRelationshipType =
  | 'employee'
  | 'board_member'
  | 'volunteer'
  | 'donor'
  | 'partner'
  | 'consultant'
  | 'vendor'
  | 'member';

export type OrganizationHierarchyType =
  | 'subsidiary'
  | 'chapter'
  | 'affiliate'
  | 'division'
  | 'department'
  | 'branch'
  | 'region';

export type ClientType = 'individual' | 'organization' | 'nonprofit';

export interface OrganizationContact {
  id: string;
  organizationId: string;
  contactId: string;
  relationshipType: OrganizationRelationshipType;
  roleTitle?: string | null;
  isPrimaryContact: boolean;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  organizationName?: string;
  contactName?: string;
  contactEmail?: string;
}

export interface OrganizationHierarchy {
  id: string;
  parentOrgId: string;
  childOrgId: string;
  relationshipType: OrganizationHierarchyType;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  parentOrgName?: string;
  childOrgName?: string;
}

export interface OrganizationSummary {
  organizationId: string;
  organizationName: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  clientType: ClientType;
  isActive: boolean;
  createdAt: string;
  affiliatedContactsCount: number;
  primaryContactsCount: number;
  childOrgsCount: number;
  parentOrgId?: string | null;
}

export interface ContactAffiliation {
  contactId: string;
  contactName: string;
  contactEmail?: string | null;
  organizationId: string;
  organizationName: string;
  relationshipType: OrganizationRelationshipType;
  roleTitle?: string | null;
  isPrimaryContact: boolean;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
}

export interface OrganizationDonationRollup {
  organizationId: string;
  organizationName: string;
  totalDonations: number;
  totalAmount: number;
  uniqueDonors: number;
  lastDonationDate?: string | null;
  averageDonation: number;
}

export interface OrganizationWithContacts extends OrganizationSummary {
  contacts: (OrganizationContact & { contact?: Client })[];
  childOrganizations: OrganizationHierarchy[];
  parentOrganization?: OrganizationHierarchy | null;
  donationRollup?: OrganizationDonationRollup | null;
}

export const ORGANIZATION_RELATIONSHIP_LABELS: Record<OrganizationRelationshipType, string> = {
  employee: 'Employee',
  board_member: 'Board Member',
  volunteer: 'Volunteer',
  donor: 'Donor',
  partner: 'Partner',
  consultant: 'Consultant',
  vendor: 'Vendor',
  member: 'Member',
};

export const ORGANIZATION_HIERARCHY_LABELS: Record<OrganizationHierarchyType, string> = {
  subsidiary: 'Subsidiary',
  chapter: 'Chapter',
  affiliate: 'Affiliate',
  division: 'Division',
  department: 'Department',
  branch: 'Branch',
  region: 'Region',
};

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  individual: 'Individual',
  organization: 'Organization',
  nonprofit: 'Nonprofit',
};

// ============================================
// RELATIONSHIP TIMELINE TYPES
// ============================================

export type TimelineEventSource =
  | 'activity'           // calls, emails, meetings, notes
  | 'touchpoint'         // donor cultivation interactions
  | 'task'               // task created/completed/updated
  | 'project_milestone'  // project milestones
  | 'calendar_event'     // calendar integration
  | 'communication_log'  // email/call/text tracking
  | 'donation';          // donation records

export interface UnifiedTimelineEvent {
  // Core identification
  id: string;              // Composite: "activity-123"
  eventId: string;         // Original ID in source table
  source: TimelineEventSource;

  // Display
  title: string;
  description?: string;
  timestamp: Date;

  // Relationships
  clientId?: string;
  projectId?: string;
  donorMoveId?: string;

  // Classification
  eventType: string;       // call, email, meeting, task_created, etc.
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';

  // People
  createdBy?: string;
  createdByName?: string;
  participants?: string[];

  // Rich metadata
  attachments?: number;
  comments?: number;
  amount?: number;         // For donations
  sentiment?: TouchpointSentiment;
  engagementLevel?: TouchpointEngagementLevel;

  // UI hints
  color?: string;
  icon?: string;
}

export interface TimelineFilters {
  entityType: 'contact' | 'organization' | 'project';
  entityId: string;
  eventSources: TimelineEventSource[];
  eventTypes: string[];
  dateFrom?: Date;
  dateTo?: Date;
  teamMemberIds?: string[];
  projectIds?: string[];
  statusFilters?: string[];
  priorityFilters?: string[];
  searchQuery?: string;
}

export interface TimelinePaginationCursor {
  timestamp: Date;
  eventId: string;
}

export interface TimelinePageResult {
  events: UnifiedTimelineEvent[];
  nextCursor?: TimelinePaginationCursor;
  hasMore: boolean;
  totalCount: number;
}

export interface TimelineSummaryStats {
  totalEvents: number;
  eventCounts: Record<TimelineEventSource, number>;
  dateRange: { earliest: Date; latest: Date };
  topParticipants: { id: string; name: string; count: number }[];
  recentActivity: number; // Events in last 30 days
}

export const TIMELINE_EVENT_SOURCE_LABELS: Record<TimelineEventSource, string> = {
  activity: 'Activities',
  touchpoint: 'Touchpoints',
  task: 'Tasks',
  project_milestone: 'Milestones',
  calendar_event: 'Calendar Events',
  communication_log: 'Communications',
  donation: 'Donations',
};

export const TIMELINE_EVENT_SOURCE_COLORS: Record<TimelineEventSource, string> = {
  activity: '#3b82f6',        // blue
  touchpoint: '#8b5cf6',      // purple
  task: '#f59e0b',            // amber
  project_milestone: '#10b981', // green
  calendar_event: '#06b6d4',  // cyan
  communication_log: '#ec4899', // pink
  donation: '#22c55e',        // green
};
