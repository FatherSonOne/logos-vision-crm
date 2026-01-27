/**
 * Mock Recommended Actions Data for Priorities Feed
 * Phase 2: Priorities Feed Implementation
 */

import type { RecommendedAction } from '../types/pulseContacts';

export const mockRecommendedActions: RecommendedAction[] = [
  {
    id: 'action-1',
    contact_id: 'c-1',
    contact_name: 'Sarah Mitchell',
    contact_score: 45,
    contact_trend: 'falling',
    contact_company: 'Tech Innovators Inc',
    donor_stage: 'Major Donor',
    lifetime_giving: 125000,
    priority: 'high',
    reason: 'Re-engage dormant major donor - last contact 67 days ago',
    suggested_actions: [
      'Send personalized thank you note referencing their impact on the Tech Education program',
      'Schedule coffee meeting to discuss their interests and future involvement',
      'Share recent program success story featuring student outcomes they helped fund'
    ],
    due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    value_indicator: 'High Value',
    last_interaction_date: new Date(Date.now() - 67 * 86400000).toISOString(),
    sentiment: 0.75
  },
  {
    id: 'action-2',
    contact_id: 'c-2',
    contact_name: 'Robert Chen',
    contact_score: 88,
    contact_trend: 'rising',
    contact_company: 'Global Finance Partners',
    donor_stage: 'Major Donor',
    lifetime_giving: 250000,
    priority: 'high',
    reason: 'Perfect timing - recent positive engagement and approaching year-end giving season',
    suggested_actions: [
      'Present the new Capital Campaign opportunity aligned with their interests',
      'Invite to exclusive donor reception with program beneficiaries',
      'Discuss legacy giving options and planned giving benefits'
    ],
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(), // 2 days
    value_indicator: 'Very High Value',
    last_interaction_date: new Date(Date.now() - 12 * 86400000).toISOString(),
    sentiment: 0.92
  },
  {
    id: 'action-3',
    contact_id: 'c-3',
    contact_name: 'Jennifer Lopez',
    contact_score: 32,
    contact_trend: 'dormant',
    contact_company: 'Community Foundation',
    donor_stage: 'Lapsed Donor',
    lifetime_giving: 45000,
    priority: 'medium',
    reason: 'Lapsed donor - no contact in 4 months, previously gave annually',
    suggested_actions: [
      'Send re-engagement campaign highlighting new programs',
      'Request feedback on their experience with our organization',
      'Offer personalized tour of new facilities or program site'
    ],
    due_date: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days
    value_indicator: 'Medium Value',
    last_interaction_date: new Date(Date.now() - 120 * 86400000).toISOString(),
    sentiment: 0.55
  },
  {
    id: 'action-4',
    contact_id: 'c-4',
    contact_name: 'David Kim',
    contact_score: 15,
    contact_trend: 'new',
    contact_company: 'Startup Ventures LLC',
    donor_stage: 'New Prospect',
    lifetime_giving: 0,
    priority: 'opportunity',
    reason: 'New high-potential prospect - expressed interest at recent event',
    suggested_actions: [
      'Send welcome package with organization overview and impact stories',
      'Schedule introductory call to understand their philanthropic interests',
      'Connect them with similar donors in their industry for peer engagement'
    ],
    due_date: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days
    value_indicator: 'Potential High Value',
    last_interaction_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    sentiment: 0.82
  },
  {
    id: 'action-5',
    contact_id: 'c-5',
    contact_name: 'Emily Thompson',
    contact_score: 78,
    contact_trend: 'stable',
    contact_company: 'Healthcare Solutions Inc',
    donor_stage: 'Repeat Donor',
    lifetime_giving: 85000,
    priority: 'medium',
    reason: 'Birthday this week - opportunity for personal touch',
    suggested_actions: [
      'Send personalized birthday card with handwritten note',
      'Include update on program they sponsored last year',
      'Mention upcoming volunteer opportunity they might enjoy'
    ],
    due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday (overdue)
    value_indicator: 'High Value',
    last_interaction_date: new Date(Date.now() - 30 * 86400000).toISOString(),
    sentiment: 0.85
  },
  {
    id: 'action-6',
    contact_id: 'c-6',
    contact_name: 'Michael Rodriguez',
    contact_score: 92,
    contact_trend: 'rising',
    contact_company: 'Rodriguez Family Foundation',
    donor_stage: 'Major Donor',
    lifetime_giving: 500000,
    priority: 'high',
    reason: 'Grant renewal deadline approaching - maintain strong relationship',
    suggested_actions: [
      'Submit comprehensive impact report for last grant cycle',
      'Schedule site visit to showcase program outcomes',
      'Present renewal proposal with expanded scope options'
    ],
    due_date: new Date().toISOString(), // Today
    value_indicator: 'Very High Value',
    last_interaction_date: new Date(Date.now() - 18 * 86400000).toISOString(),
    sentiment: 0.95
  },
  {
    id: 'action-7',
    contact_id: 'c-7',
    contact_name: 'Amanda Foster',
    contact_score: 55,
    contact_trend: 'falling',
    contact_company: 'Foster & Associates',
    donor_stage: 'Mid-Level Donor',
    lifetime_giving: 28000,
    priority: 'medium',
    reason: 'Engagement score declining - last three emails unopened',
    suggested_actions: [
      'Switch communication channel - try phone call instead of email',
      'Survey their communication preferences and interests',
      'Invite to upcoming event in their area'
    ],
    due_date: new Date(Date.now() + 7 * 86400000).toISOString(), // 1 week
    value_indicator: 'Medium Value',
    last_interaction_date: new Date(Date.now() - 45 * 86400000).toISOString(),
    sentiment: 0.62
  },
  {
    id: 'action-8',
    contact_id: 'c-8',
    contact_name: 'James Wilson',
    contact_score: 68,
    contact_trend: 'stable',
    contact_company: 'Wilson Tech Group',
    donor_stage: 'Repeat Donor',
    lifetime_giving: 52000,
    priority: 'low',
    reason: 'Regular check-in - maintain steady relationship',
    suggested_actions: [
      'Send quarterly impact newsletter',
      'Share relevant industry news or article they might find interesting',
      'Update on mutual connection or shared interest area'
    ],
    due_date: new Date(Date.now() + 10 * 86400000).toISOString(), // 10 days
    value_indicator: 'Medium Value',
    last_interaction_date: new Date(Date.now() - 60 * 86400000).toISOString(),
    sentiment: 0.72
  },
  {
    id: 'action-9',
    contact_id: 'c-9',
    contact_name: 'Lisa Anderson',
    contact_score: 25,
    contact_trend: 'new',
    contact_company: 'Anderson Consulting',
    donor_stage: 'Prospect',
    lifetime_giving: 0,
    priority: 'opportunity',
    reason: 'Referred by existing major donor - warm introduction',
    suggested_actions: [
      'Send thank you to referring donor',
      'Reach out with personalized introduction mentioning mutual connection',
      'Offer coffee chat to learn about their interests and values'
    ],
    due_date: new Date(Date.now() + 4 * 86400000).toISOString(), // 4 days
    value_indicator: 'Potential Medium Value',
    last_interaction_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    sentiment: 0.78
  },
  {
    id: 'action-10',
    contact_id: 'c-10',
    contact_name: 'Thomas Brown',
    contact_score: 82,
    contact_trend: 'rising',
    contact_company: 'Brown Industries',
    donor_stage: 'Major Donor',
    lifetime_giving: 175000,
    priority: 'high',
    reason: 'Anniversary of first gift - celebrate milestone relationship',
    suggested_actions: [
      'Send anniversary celebration package with timeline of their impact',
      'Create personalized video message from program beneficiaries',
      'Propose naming opportunity for upcoming project'
    ],
    due_date: new Date().toISOString(), // Today
    value_indicator: 'Very High Value',
    last_interaction_date: new Date(Date.now() - 21 * 86400000).toISOString(),
    sentiment: 0.89
  },
  {
    id: 'action-11',
    contact_id: 'c-11',
    contact_name: 'Rachel Green',
    contact_score: 48,
    contact_trend: 'falling',
    contact_company: 'Green Energy Solutions',
    donor_stage: 'Mid-Level Donor',
    lifetime_giving: 32000,
    priority: 'medium',
    reason: 'Communication preferences changed - adapt outreach strategy',
    suggested_actions: [
      'Update contact preferences in database',
      'Send re-permission email to confirm communication channels',
      'Personalize future communications based on stated preferences'
    ],
    due_date: new Date(Date.now() + 6 * 86400000).toISOString(), // 6 days
    value_indicator: 'Medium Value',
    last_interaction_date: new Date(Date.now() - 38 * 86400000).toISOString(),
    sentiment: 0.68
  },
  {
    id: 'action-12',
    contact_id: 'c-12',
    contact_name: 'Christopher Lee',
    contact_score: 70,
    contact_trend: 'stable',
    contact_company: 'Lee Family Office',
    donor_stage: 'Repeat Donor',
    lifetime_giving: 95000,
    priority: 'low',
    reason: 'Consistent supporter - nurture with personalized updates',
    suggested_actions: [
      'Share exclusive behind-the-scenes content from recent program',
      'Invite to donor advisory council or feedback session',
      'Send handwritten note acknowledging their consistent support'
    ],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString(), // 2 weeks
    value_indicator: 'High Value',
    last_interaction_date: new Date(Date.now() - 28 * 86400000).toISOString(),
    sentiment: 0.80
  }
];

// Helper function to filter actions by various criteria
export function filterActionsByPriority(actions: RecommendedAction[], priority?: string): RecommendedAction[] {
  if (!priority || priority === 'all') {
    return actions;
  }
  return actions.filter(action => action.priority === priority);
}

export function filterActionsByDueDate(actions: RecommendedAction[], filter: 'overdue' | 'today' | 'week' | 'all'): RecommendedAction[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekFromNow = new Date(today.getTime() + 7 * 86400000);

  switch (filter) {
    case 'overdue':
      return actions.filter(action => {
        if (!action.due_date) return false;
        return new Date(action.due_date) < today;
      });
    case 'today':
      return actions.filter(action => {
        if (!action.due_date) return false;
        const dueDate = new Date(action.due_date);
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        return dueDateOnly.getTime() === today.getTime();
      });
    case 'week':
      return actions.filter(action => {
        if (!action.due_date) return false;
        const dueDate = new Date(action.due_date);
        return dueDate >= today && dueDate <= weekFromNow;
      });
    default:
      return actions;
  }
}

export function filterActionsByValue(actions: RecommendedAction[], highValueOnly: boolean): RecommendedAction[] {
  if (!highValueOnly) {
    return actions;
  }
  return actions.filter(action =>
    action.value_indicator.includes('High') || action.value_indicator.includes('Very High')
  );
}

// Sort actions by priority (high > medium > low > opportunity) and then by due date
export function sortActionsByPriority(actions: RecommendedAction[]): RecommendedAction[] {
  const priorityOrder = { high: 0, medium: 1, low: 2, opportunity: 3 };

  return [...actions].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then sort by due date (earliest first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });
}
