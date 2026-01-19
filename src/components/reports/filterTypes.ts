// Filter builder type definitions

export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi-select';

export type TextOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'regex' | 'is_empty' | 'is_not_empty';
export type NumberOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal' | 'between' | 'is_empty' | 'is_not_empty';
export type DateOperator = 'equals' | 'not_equals' | 'before' | 'after' | 'between' | 'is_empty' | 'is_not_empty' | 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' | 'last_year';
export type BooleanOperator = 'is_true' | 'is_false';
export type SelectOperator = 'equals' | 'not_equals' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty';

export type FilterOperator = TextOperator | NumberOperator | DateOperator | BooleanOperator | SelectOperator;

export type LogicOperator = 'AND' | 'OR';

export interface FilterField {
  id: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[]; // For select/multi-select fields
  tableName?: string; // For SQL generation
  columnName?: string; // For SQL generation
}

export interface FilterCondition {
  id: string;
  fieldId: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operators
}

export interface FilterGroup {
  id: string;
  logic: LogicOperator;
  conditions: FilterCondition[];
  groups: FilterGroup[];
}

export interface FilterTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'common' | 'custom' | 'shared';
  filter: FilterGroup;
  createdAt: string;
  createdBy?: string;
  isPublic?: boolean;
}

export interface FilterValidationError {
  conditionId?: string;
  groupId?: string;
  field: string;
  message: string;
}

// Available fields for different report types
export const DONOR_FIELDS: FilterField[] = [
  { id: 'name', label: 'Name', type: 'text', tableName: 'clients', columnName: 'name' },
  { id: 'email', label: 'Email', type: 'text', tableName: 'clients', columnName: 'email' },
  { id: 'location', label: 'Location', type: 'text', tableName: 'clients', columnName: 'location' },
  { id: 'total_donated', label: 'Total Donated', type: 'number', tableName: 'donations', columnName: 'amount' },
  { id: 'last_donation_date', label: 'Last Donation Date', type: 'date', tableName: 'donations', columnName: 'donation_date' },
  { id: 'donation_count', label: 'Number of Donations', type: 'number', tableName: 'donations', columnName: 'COUNT(*)' },
  { id: 'engagement_level', label: 'Engagement Level', type: 'select', options: [
    { value: 'Highly Engaged', label: 'Highly Engaged' },
    { value: 'Engaged', label: 'Engaged' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Low Engagement', label: 'Low Engagement' },
    { value: 'At Risk', label: 'At Risk' },
  ]},
  { id: 'engagement_score', label: 'Engagement Score', type: 'number', tableName: 'engagement_scores', columnName: 'overall_score' },
  { id: 'preferred_contact_method', label: 'Preferred Contact', type: 'select', options: [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'text', label: 'Text' },
    { value: 'mail', label: 'Mail' },
  ]},
  { id: 'email_opt_in', label: 'Email Opt-In', type: 'boolean' },
  { id: 'newsletter_subscriber', label: 'Newsletter Subscriber', type: 'boolean' },
  { id: 'do_not_email', label: 'Do Not Email', type: 'boolean' },
  { id: 'created_at', label: 'Date Added', type: 'date', tableName: 'clients', columnName: 'created_at' },
];

export const PROJECT_FIELDS: FilterField[] = [
  { id: 'name', label: 'Project Name', type: 'text', tableName: 'projects', columnName: 'name' },
  { id: 'description', label: 'Description', type: 'text', tableName: 'projects', columnName: 'description' },
  { id: 'status', label: 'Status', type: 'select', options: [
    { value: 'Planning', label: 'Planning' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Active', label: 'Active' },
    { value: 'Cancelled', label: 'Cancelled' },
  ], tableName: 'projects', columnName: 'status' },
  { id: 'start_date', label: 'Start Date', type: 'date', tableName: 'projects', columnName: 'start_date' },
  { id: 'end_date', label: 'End Date', type: 'date', tableName: 'projects', columnName: 'end_date' },
  { id: 'budget', label: 'Budget', type: 'number', tableName: 'projects', columnName: 'budget' },
  { id: 'budget_spent', label: 'Budget Spent', type: 'number', tableName: 'projects', columnName: 'budget_spent' },
  { id: 'fundraising_goal', label: 'Fundraising Goal', type: 'number', tableName: 'projects', columnName: 'fundraising_goal' },
  { id: 'fundraising_raised', label: 'Fundraising Raised', type: 'number', tableName: 'projects', columnName: 'fundraising_raised' },
  { id: 'pinned', label: 'Pinned', type: 'boolean', tableName: 'projects', columnName: 'pinned' },
  { id: 'starred', label: 'Starred', type: 'boolean', tableName: 'projects', columnName: 'starred' },
  { id: 'archived', label: 'Archived', type: 'boolean', tableName: 'projects', columnName: 'archived' },
];

export const DONATION_FIELDS: FilterField[] = [
  { id: 'donor_name', label: 'Donor Name', type: 'text', tableName: 'donations', columnName: 'donor_name' },
  { id: 'amount', label: 'Amount', type: 'number', tableName: 'donations', columnName: 'amount' },
  { id: 'donation_date', label: 'Donation Date', type: 'date', tableName: 'donations', columnName: 'donation_date' },
  { id: 'campaign', label: 'Campaign', type: 'text', tableName: 'donations', columnName: 'campaign' },
  { id: 'payment_method', label: 'Payment Method', type: 'select', options: [
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Check', label: 'Check' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'PayPal', label: 'PayPal' },
    { value: 'Other', label: 'Other' },
  ], tableName: 'donations', columnName: 'payment_method' },
  { id: 'is_recurring', label: 'Recurring', type: 'boolean', tableName: 'donations', columnName: 'is_recurring' },
];

export const TASK_FIELDS: FilterField[] = [
  { id: 'title', label: 'Title', type: 'text', tableName: 'tasks', columnName: 'title' },
  { id: 'description', label: 'Description', type: 'text', tableName: 'tasks', columnName: 'description' },
  { id: 'status', label: 'Status', type: 'select', options: [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' },
  ], tableName: 'tasks', columnName: 'status' },
  { id: 'due_date', label: 'Due Date', type: 'date', tableName: 'tasks', columnName: 'due_date' },
  { id: 'assigned_to', label: 'Assigned To', type: 'text', tableName: 'tasks', columnName: 'assigned_to' },
  { id: 'phase', label: 'Phase', type: 'text', tableName: 'tasks', columnName: 'phase' },
];

// Operator labels and icons
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  // Text
  equals: 'equals',
  not_equals: 'does not equal',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  regex: 'matches regex',
  // Number
  greater_than: 'greater than',
  less_than: 'less than',
  greater_than_or_equal: 'greater than or equal to',
  less_than_or_equal: 'less than or equal to',
  between: 'between',
  // Date
  before: 'before',
  after: 'after',
  last_7_days: 'last 7 days',
  last_30_days: 'last 30 days',
  this_month: 'this month',
  this_year: 'this year',
  last_year: 'last year',
  // Boolean
  is_true: 'is true',
  is_false: 'is false',
  // Select
  in: 'is one of',
  not_in: 'is not one of',
  // Common
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
};

export const OPERATOR_ICONS: Record<FilterOperator, string> = {
  equals: '=',
  not_equals: '≠',
  contains: '⊃',
  not_contains: '⊅',
  starts_with: '^',
  ends_with: '$',
  regex: '.*',
  greater_than: '>',
  less_than: '<',
  greater_than_or_equal: '≥',
  less_than_or_equal: '≤',
  between: '↔',
  before: '<',
  after: '>',
  last_7_days: '7d',
  last_30_days: '30d',
  this_month: 'M',
  this_year: 'Y',
  last_year: 'Y-1',
  is_true: '✓',
  is_false: '✗',
  in: '∈',
  not_in: '∉',
  is_empty: '∅',
  is_not_empty: '∄',
};

// Get operators for field type
export function getOperatorsForType(type: FieldType): FilterOperator[] {
  switch (type) {
    case 'text':
      return ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'regex', 'is_empty', 'is_not_empty'];
    case 'number':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'between', 'is_empty', 'is_not_empty'];
    case 'date':
      return ['equals', 'not_equals', 'before', 'after', 'between', 'last_7_days', 'last_30_days', 'this_month', 'this_year', 'last_year', 'is_empty', 'is_not_empty'];
    case 'boolean':
      return ['is_true', 'is_false'];
    case 'select':
    case 'multi-select':
      return ['equals', 'not_equals', 'in', 'not_in', 'is_empty', 'is_not_empty'];
    default:
      return ['equals', 'not_equals'];
  }
}

// Check if operator requires a value input
export function operatorNeedsValue(operator: FilterOperator): boolean {
  return !['is_empty', 'is_not_empty', 'is_true', 'is_false', 'last_7_days', 'last_30_days', 'this_month', 'this_year', 'last_year'].includes(operator);
}

// Check if operator requires two values (for 'between')
export function operatorNeedsTwoValues(operator: FilterOperator): boolean {
  return operator === 'between';
}
