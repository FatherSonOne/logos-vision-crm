import { Report, ReportCategory, VisualizationType } from '../services/reportService';

// ============================================
// TYPES
// ============================================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: string;
  color: string;
  dataSource: {
    table: string;
  };
  visualizationType: VisualizationType;
  columns: string[];
  filters: Record<string, any>;
  metrics: string[];
  defaultDateRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'ytd' | 'all_time';
  tags: string[];
}

// ============================================
// TEMPLATE DEFINITIONS
// ============================================

export const reportTemplates: ReportTemplate[] = [
  // Financial Summary
  {
    id: 'financial-summary',
    name: 'Financial Summary',
    description: 'Comprehensive overview of revenue, expenses, and donations over time with trend analysis',
    category: 'financial',
    icon: '💰',
    color: 'green',
    dataSource: {
      table: 'donations',
    },
    visualizationType: 'line',
    columns: ['donation_date', 'amount', 'campaign', 'donor_name', 'payment_method'],
    filters: {
      groupBy: 'month',
      metric: 'sum:amount',
      dateStart: null,
      dateEnd: null,
    },
    metrics: [
      'Total Revenue',
      'Monthly Trends',
      'Revenue by Source',
      'Year-over-Year Comparison',
    ],
    defaultDateRange: 'ytd',
    tags: ['financial', 'revenue', 'trending', 'overview'],
  },

  // Donation Report
  {
    id: 'donation-report',
    name: 'Donation Report',
    description: 'Detailed breakdown of donations by campaign, donor, and date range with donor insights',
    category: 'donation',
    icon: '❤️',
    color: 'pink',
    dataSource: {
      table: 'donations',
    },
    visualizationType: 'bar',
    columns: ['donation_date', 'amount', 'campaign', 'donor_name', 'client_id'],
    filters: {
      groupBy: 'campaign',
      metric: 'sum:amount',
      dateStart: null,
      dateEnd: null,
    },
    metrics: [
      'Total Donations',
      'Donations by Campaign',
      'Top Donors',
      'Average Donation Amount',
      'Donor Retention Rate',
    ],
    defaultDateRange: 'last_90_days',
    tags: ['donations', 'campaigns', 'donors', 'fundraising'],
  },

  // Impact Report
  {
    id: 'impact-report',
    name: 'Impact Report',
    description: 'Track beneficiaries served, program outcomes, and measurable impact metrics',
    category: 'impact',
    icon: '📊',
    color: 'emerald',
    dataSource: {
      table: 'outcomes',
    },
    visualizationType: 'bar',
    columns: ['outcome_date', 'outcome_type', 'impact_value', 'program_id', 'client_id'],
    filters: {
      groupBy: 'outcome_type',
      metric: 'sum:impact_value',
      dateStart: null,
      dateEnd: null,
    },
    metrics: [
      'Total Impact Value',
      'Beneficiaries Served',
      'Outcome Types',
      'Program Effectiveness',
      'Impact per Dollar',
    ],
    defaultDateRange: 'last_year',
    tags: ['impact', 'outcomes', 'programs', 'beneficiaries', 'metrics'],
  },

  // Client Engagement Report
  {
    id: 'client-engagement',
    name: 'Client Engagement Report',
    description: 'Analyze client activity, engagement scores, and interaction patterns over time',
    category: 'client',
    icon: '👥',
    color: 'blue',
    dataSource: {
      table: 'engagement_scores',
    },
    visualizationType: 'area',
    columns: ['calculated_at', 'overall_score', 'engagement_level', 'client_id'],
    filters: {
      groupBy: 'engagement_level',
      metric: 'count',
      dateStart: null,
      dateEnd: null,
    },
    metrics: [
      'Active Clients',
      'Engagement Levels',
      'Average Engagement Score',
      'Engagement Trends',
      'At-Risk Clients',
    ],
    defaultDateRange: 'last_30_days',
    tags: ['clients', 'engagement', 'activity', 'retention'],
  },

  // Project Status Dashboard
  {
    id: 'project-status',
    name: 'Project Status Dashboard',
    description: 'Real-time overview of project progress, status distribution, and completion rates',
    category: 'project',
    icon: '📁',
    color: 'cyan',
    dataSource: {
      table: 'projects',
    },
    visualizationType: 'pie',
    columns: ['name', 'status', 'start_date', 'end_date', 'budget', 'client_id'],
    filters: {
      groupBy: 'status',
      metric: 'count',
      dateStart: null,
      dateEnd: null,
    },
    metrics: [
      'Total Projects',
      'Projects by Status',
      'Completion Rate',
      'On-Time Performance',
      'Budget Utilization',
    ],
    defaultDateRange: 'all_time',
    tags: ['projects', 'status', 'progress', 'management'],
  },

  // Volunteer Hours Report
  {
    id: 'volunteer-hours',
    name: 'Volunteer Hours Report',
    description: 'Track volunteer participation, hours contributed, and volunteer engagement metrics',
    category: 'volunteer',
    icon: '✋',
    color: 'amber',
    dataSource: {
      table: 'activities',
    },
    visualizationType: 'bar',
    columns: ['activity_date', 'type', 'title', 'client_id', 'created_by_id'],
    filters: {
      groupBy: 'month',
      metric: 'count',
      dateStart: null,
      dateEnd: null,
      type: 'volunteer',
    },
    metrics: [
      'Total Volunteer Hours',
      'Active Volunteers',
      'Hours by Program',
      'Volunteer Retention',
      'Impact per Volunteer',
    ],
    defaultDateRange: 'last_90_days',
    tags: ['volunteers', 'hours', 'engagement', 'impact'],
  },

  // Donor Lifetime Value Report
  {
    id: 'donor-lifetime-value',
    name: 'Donor Lifetime Value',
    description: 'Analyze donor lifetime value, RFM scores, and donation patterns for strategic insights',
    category: 'donation',
    icon: '💎',
    color: 'purple',
    dataSource: {
      table: 'lifetime_values',
    },
    visualizationType: 'scatter',
    columns: ['total_lifetime_value', 'rfm_score', 'total_donations', 'avg_donation'],
    filters: {
      groupBy: 'rfm_tier',
      metric: 'sum:total_lifetime_value',
      dateStart: null,
      dateEnd: null,
    },
    metrics: [
      'Total Lifetime Value',
      'High-Value Donors',
      'RFM Distribution',
      'Average Donation Size',
      'Donor Segments',
    ],
    defaultDateRange: 'all_time',
    tags: ['donors', 'ltv', 'rfm', 'segmentation', 'analytics'],
  },

  // Case Management Report
  {
    id: 'case-management',
    name: 'Case Management Report',
    description: 'Monitor case volume, resolution times, priority distribution, and team performance',
    category: 'case',
    icon: '💼',
    color: 'slate',
    dataSource: {
      table: 'cases',
    },
    visualizationType: 'bar',
    columns: ['title', 'status', 'priority', 'created_at', 'assigned_to_id', 'client_id'],
    filters: {
      groupBy: 'status',
      metric: 'count',
      dateStart: null,
      dateEnd: null,
    },
    metrics: [
      'Total Cases',
      'Cases by Status',
      'Cases by Priority',
      'Average Resolution Time',
      'Team Workload Distribution',
    ],
    defaultDateRange: 'last_30_days',
    tags: ['cases', 'management', 'status', 'priority', 'performance'],
  },

  // Team Performance Report
  {
    id: 'team-performance',
    name: 'Team Performance',
    description: 'Track team member productivity, task completion rates, and workload distribution',
    category: 'team',
    icon: '👨‍💼',
    color: 'indigo',
    dataSource: {
      table: 'tasks',
    },
    visualizationType: 'bar',
    columns: ['description', 'status', 'due_date', 'team_member_id', 'project_id'],
    filters: {
      groupBy: 'team_member_id',
      metric: 'count',
      dateStart: null,
      dateEnd: null,
    },
    metrics: [
      'Total Tasks',
      'Completion Rate',
      'Tasks by Team Member',
      'On-Time Delivery Rate',
      'Workload Balance',
    ],
    defaultDateRange: 'last_30_days',
    tags: ['team', 'performance', 'tasks', 'productivity'],
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getTemplateById(id: string): ReportTemplate | undefined {
  return reportTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: ReportCategory): ReportTemplate[] {
  return reportTemplates.filter(t => t.category === category);
}

export function getTemplatesByTag(tag: string): ReportTemplate[] {
  return reportTemplates.filter(t => t.tags.includes(tag));
}

export function searchTemplates(query: string): ReportTemplate[] {
  const lowerQuery = query.toLowerCase();
  return reportTemplates.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function convertTemplateToReport(template: ReportTemplate): Partial<Report> {
  return {
    name: template.name,
    description: template.description,
    reportType: 'custom',
    category: template.category,
    dataSource: template.dataSource,
    visualizationType: template.visualizationType,
    filters: template.filters,
    columns: template.columns,
    icon: template.icon,
    color: template.color,
    isTemplate: false,
  };
}

export function getDateRangeFilter(range: ReportTemplate['defaultDateRange']): { dateStart: string | null; dateEnd: string | null } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'last_7_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return {
        dateStart: start.toISOString().split('T')[0],
        dateEnd: today.toISOString().split('T')[0],
      };
    }
    case 'last_30_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return {
        dateStart: start.toISOString().split('T')[0],
        dateEnd: today.toISOString().split('T')[0],
      };
    }
    case 'last_90_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return {
        dateStart: start.toISOString().split('T')[0],
        dateEnd: today.toISOString().split('T')[0],
      };
    }
    case 'last_year': {
      const start = new Date(today);
      start.setFullYear(start.getFullYear() - 1);
      return {
        dateStart: start.toISOString().split('T')[0],
        dateEnd: today.toISOString().split('T')[0],
      };
    }
    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1);
      return {
        dateStart: start.toISOString().split('T')[0],
        dateEnd: today.toISOString().split('T')[0],
      };
    }
    case 'all_time':
    default:
      return {
        dateStart: null,
        dateEnd: null,
      };
  }
}
