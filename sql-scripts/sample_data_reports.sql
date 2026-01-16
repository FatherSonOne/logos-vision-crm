-- Sample Data: Reports, KPIs, and AI Insights
-- This populates the Reports Hub with useful pre-built reports

-- ============================================
-- SAMPLE REPORTS
-- ============================================

INSERT INTO reports (
    name, description, report_type, category, visualization_type,
    data_source, filters, available_filters, columns,
    sort_by, sort_direction, layout,
    is_template, is_public, icon, color
) VALUES
-- Financial Reports
(
    'Monthly Donation Summary',
    'Overview of all donations received in the current month, broken down by campaign and donor type.',
    'predefined', 'financial', 'bar',
    '{"table": "donations", "aggregation": "sum", "groupBy": "campaign"}',
    '{}', '["date_range", "campaign", "donor_type"]',
    '["campaign", "total_amount", "donor_count", "average_gift"]',
    'total_amount', 'desc',
    '{"chartHeight": 400, "showLegend": true}',
    true, true, 'currency-dollar', 'emerald'
),
(
    'Year-over-Year Comparison',
    'Compare donation totals and donor counts across fiscal years to identify trends.',
    'predefined', 'financial', 'line',
    '{"table": "donations", "aggregation": "sum", "groupBy": "fiscal_year"}',
    '{}', '["fiscal_year"]',
    '["year", "total_donations", "donor_count", "growth_rate"]',
    'year', 'asc',
    '{"chartHeight": 350, "showDataLabels": true}',
    true, true, 'trending-up', 'blue'
),
(
    'Donation Pipeline',
    'Track pledges and expected donations through different stages of commitment.',
    'predefined', 'financial', 'funnel',
    '{"table": "pledges", "aggregation": "count", "groupBy": "status"}',
    '{}', '["status", "campaign", "expected_date"]',
    '["stage", "count", "total_value", "conversion_rate"]',
    'display_order', 'asc',
    '{"showPercentages": true}',
    true, true, 'funnel', 'violet'
),
-- Donor Reports
(
    'Donor Retention Analysis',
    'Analyze donor retention rates and identify lapsed donors for re-engagement.',
    'predefined', 'client', 'donut',
    '{"table": "clients", "aggregation": "count", "groupBy": "donor_status"}',
    '{}', '["donor_status", "last_gift_date", "lifetime_value"]',
    '["status", "count", "percentage", "avg_lifetime_value"]',
    'count', 'desc',
    '{"showPercentages": true, "innerRadius": 60}',
    true, true, 'users', 'rose'
),
(
    'Major Donor Report',
    'List of major donors with giving history and engagement metrics.',
    'predefined', 'client', 'table',
    '{"table": "clients", "filter": {"donor_tier": "major"}}',
    '{"donor_tier": "major"}', '["donor_tier", "date_range", "engagement_level"]',
    '["name", "total_given", "last_gift_date", "engagement_score", "next_contact"]',
    'total_given', 'desc',
    '{"pageSize": 25, "showPagination": true}',
    true, true, 'star', 'amber'
),
(
    'New Donor Acquisition',
    'Track new donors acquired over time and their initial gift amounts.',
    'predefined', 'client', 'area',
    '{"table": "clients", "aggregation": "count", "groupBy": "month_acquired"}',
    '{}', '["date_range", "acquisition_source"]',
    '["month", "new_donors", "total_first_gifts", "avg_first_gift"]',
    'month', 'asc',
    '{"chartHeight": 350, "fillOpacity": 0.3}',
    true, true, 'user-plus', 'cyan'
),
-- Project Reports
(
    'Project Status Overview',
    'Dashboard view of all active projects with status, budget, and timeline information.',
    'predefined', 'project', 'table',
    '{"table": "projects", "filter": {"status": ["active", "in_progress"]}}',
    '{}', '["status", "priority", "project_manager", "client"]',
    '["name", "client", "status", "budget", "spent", "due_date", "progress"]',
    'due_date', 'asc',
    '{"showProgressBars": true, "highlightOverdue": true}',
    true, true, 'folder', 'indigo'
),
(
    'Project Timeline (Gantt)',
    'Visual timeline of project milestones and deadlines.',
    'predefined', 'project', 'gantt',
    '{"table": "projects", "includeRelations": ["tasks", "milestones"]}',
    '{}', '["date_range", "project_manager", "client"]',
    '["name", "start_date", "end_date", "progress", "dependencies"]',
    'start_date', 'asc',
    '{"showMilestones": true, "showDependencies": true}',
    true, true, 'calendar', 'purple'
),
-- Team Reports
(
    'Team Productivity',
    'Measure team member productivity through completed tasks and hours logged.',
    'predefined', 'team', 'bar',
    '{"table": "team_members", "aggregation": "sum", "groupBy": "member"}',
    '{}', '["date_range", "team_member", "department"]',
    '["member", "tasks_completed", "hours_logged", "efficiency_score"]',
    'tasks_completed', 'desc',
    '{"orientation": "horizontal", "showValues": true}',
    true, true, 'users', 'orange'
),
(
    'Team Workload Distribution',
    'Visualize how work is distributed across team members.',
    'predefined', 'team', 'pie',
    '{"table": "tasks", "aggregation": "count", "groupBy": "assignee"}',
    '{}', '["status", "priority", "project"]',
    '["assignee", "task_count", "percentage"]',
    'task_count', 'desc',
    '{"showLegend": true, "showPercentages": true}',
    true, true, 'chart-pie', 'teal'
),
-- Impact Reports
(
    'Program Impact Summary',
    'Measure the impact of programs through outcome metrics and beneficiary data.',
    'predefined', 'impact', 'kpi',
    '{"table": "programs", "aggregation": "sum"}',
    '{}', '["program", "date_range", "region"]',
    '["beneficiaries_served", "outcomes_achieved", "cost_per_outcome", "satisfaction_score"]',
    'beneficiaries_served', 'desc',
    '{"showTrends": true, "showComparison": true}',
    true, true, 'heart', 'pink'
),
(
    'Impact Trends Over Time',
    'Track how program impact metrics have evolved over time.',
    'predefined', 'impact', 'line',
    '{"table": "outcomes", "aggregation": "sum", "groupBy": "month"}',
    '{}', '["date_range", "program", "outcome_type"]',
    '["period", "total_impact", "beneficiaries", "efficiency"]',
    'period', 'asc',
    '{"showDataPoints": true, "showTrendLine": true}',
    true, true, 'trending-up', 'emerald'
),
-- Volunteer Reports
(
    'Volunteer Hours Summary',
    'Track volunteer hours by individual, program, and time period.',
    'predefined', 'volunteer', 'bar',
    '{"table": "volunteers", "aggregation": "sum", "groupBy": "volunteer"}',
    '{}', '["date_range", "program", "skill"]',
    '["volunteer", "hours", "value", "programs_supported"]',
    'hours', 'desc',
    '{"showValues": true, "maxBars": 15}',
    true, true, 'clock', 'cyan'
),
(
    'Volunteer Engagement',
    'Analyze volunteer engagement levels and identify opportunities for growth.',
    'predefined', 'volunteer', 'heatmap',
    '{"table": "volunteer_activities", "aggregation": "count"}',
    '{}', '["date_range", "activity_type"]',
    '["week", "day", "activity_count", "intensity"]',
    'week', 'asc',
    '{"colorScale": "blues", "showLabels": true}',
    true, true, 'fire', 'orange'
),
-- Case Management Reports
(
    'Case Status Dashboard',
    'Overview of all cases by status, priority, and age.',
    'predefined', 'case', 'bar',
    '{"table": "cases", "aggregation": "count", "groupBy": "status"}',
    '{}', '["status", "priority", "assigned_to", "case_type"]',
    '["status", "count", "avg_age_days", "overdue_count"]',
    'count', 'desc',
    '{"showStacked": true, "colorByPriority": true}',
    true, true, 'briefcase', 'slate'
),
(
    'Case Resolution Time',
    'Analyze how long cases take to resolve by type and priority.',
    'predefined', 'case', 'histogram',
    '{"table": "cases", "field": "resolution_days"}',
    '{"status": "closed"}', '["case_type", "priority", "assigned_to"]',
    '["resolution_days_bucket", "count", "percentage"]',
    'resolution_days_bucket', 'asc',
    '{"bucketSize": 7, "showCumulative": true}',
    true, true, 'clock', 'gray'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE KPIs
-- ============================================

INSERT INTO kpis (
    name, description, category, metric_type,
    data_source, data_field, calculation_formula,
    target_value, threshold_warning, threshold_critical, threshold_direction,
    display_format, prefix, suffix, icon, color,
    current_value, previous_value, trend_direction, trend_percentage,
    display_order, is_active
) VALUES
(
    'Total Donations (MTD)',
    'Total donation amount received month-to-date',
    'financial', 'sum',
    'donations', 'amount', NULL,
    100000, 75000, 50000, 'above',
    'currency', '$', NULL, 'currency-dollar', 'emerald',
    87500, 82000, 'up', 6.7,
    1, true
),
(
    'Active Donors',
    'Number of donors who have given in the past 12 months',
    'donors', 'count',
    'clients', NULL, 'COUNT(DISTINCT donor_id) WHERE last_gift_date > NOW() - INTERVAL ''12 months''',
    500, 400, 300, 'above',
    'number', NULL, ' donors', 'users', 'blue',
    456, 445, 'up', 2.5,
    2, true
),
(
    'Donor Retention Rate',
    'Percentage of donors who gave again this year',
    'donors', 'percentage',
    'clients', NULL, '(repeat_donors / total_donors) * 100',
    75, 60, 50, 'above',
    'percentage', NULL, '%', 'refresh', 'violet',
    68.5, 65.2, 'up', 5.1,
    3, true
),
(
    'Average Gift Size',
    'Average donation amount per gift',
    'financial', 'average',
    'donations', 'amount', NULL,
    250, 175, 125, 'above',
    'currency', '$', NULL, 'gift', 'rose',
    215.50, 198.75, 'up', 8.4,
    4, true
),
(
    'Open Cases',
    'Number of cases currently open and in progress',
    'cases', 'count',
    'cases', NULL, 'COUNT(*) WHERE status IN (''open'', ''in_progress'')',
    20, 35, 50, 'below',
    'number', NULL, ' cases', 'folder-open', 'amber',
    28, 32, 'down', 12.5,
    5, true
),
(
    'Volunteer Hours (MTD)',
    'Total volunteer hours logged this month',
    'volunteers', 'sum',
    'volunteer_hours', 'hours', NULL,
    500, 350, 200, 'above',
    'number', NULL, ' hrs', 'clock', 'cyan',
    425, 380, 'up', 11.8,
    6, true
),
(
    'Project Completion Rate',
    'Percentage of projects completed on time',
    'projects', 'percentage',
    'projects', NULL, '(completed_on_time / total_completed) * 100',
    90, 75, 60, 'above',
    'percentage', NULL, '%', 'check-circle', 'green',
    82, 78, 'up', 5.1,
    7, true
),
(
    'Lives Impacted',
    'Total number of beneficiaries served this year',
    'impact', 'sum',
    'outcomes', 'beneficiaries', NULL,
    10000, 7500, 5000, 'above',
    'number', NULL, NULL, 'heart', 'pink',
    8750, 7200, 'up', 21.5,
    8, true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE AI INSIGHTS
-- ============================================

INSERT INTO ai_insights (
    insight_type, insight_title, insight_text,
    confidence_score, importance,
    related_data, related_metrics,
    suggested_chart_type, suggested_action,
    is_pinned, is_read, generated_at
) VALUES
(
    'trend',
    'Donation Growth Accelerating',
    'Monthly donations have increased by 15% compared to the same period last year. The growth rate has accelerated in the past 3 months, suggesting successful campaign strategies.',
    0.92, 'high',
    '{"growth_rate": 15, "comparison_period": "YoY", "acceleration": true}',
    '["total_donations", "monthly_growth_rate"]',
    'line', 'Consider increasing campaign investment to maintain momentum',
    true, false, NOW()
),
(
    'anomaly',
    'Unusual Spike in New Donors',
    'New donor acquisitions increased 45% last week compared to the monthly average. This coincides with the email campaign launched on March 15th.',
    0.88, 'high',
    '{"increase": 45, "trigger": "email_campaign", "campaign_date": "2024-03-15"}',
    '["new_donors", "acquisition_rate"]',
    'bar', 'Analyze the successful email campaign and replicate its elements',
    false, false, NOW()
),
(
    'recommendation',
    'Lapsed Donor Re-engagement Opportunity',
    'Analysis shows 127 donors who gave last year have not donated this year. Based on historical patterns, 35% of these donors typically respond to personalized outreach.',
    0.85, 'medium',
    '{"lapsed_count": 127, "expected_recovery_rate": 0.35, "potential_value": 28500}',
    '["donor_retention", "lapsed_donors"]',
    'table', 'Launch targeted re-engagement campaign for lapsed donors',
    false, false, NOW()
),
(
    'correlation',
    'Event Attendance Linked to Major Gifts',
    'Donors who attended at least 2 events are 3.5x more likely to make major gifts ($1,000+). Consider prioritizing event invitations for mid-level donors.',
    0.91, 'high',
    '{"correlation_factor": 3.5, "event_threshold": 2, "gift_threshold": 1000}',
    '["event_attendance", "major_gifts"]',
    'scatter', 'Create VIP event track for mid-level donors',
    true, true, NOW() - INTERVAL '2 days'
),
(
    'forecast',
    'Q4 Donation Forecast',
    'Based on historical trends and current trajectory, Q4 donations are projected to reach $425,000, exceeding the annual goal by 8%.',
    0.78, 'medium',
    '{"forecast_amount": 425000, "goal_variance": 0.08, "confidence_range": [395000, 455000]}',
    '["quarterly_donations", "annual_goal"]',
    'area', 'Prepare stewardship plan for year-end giving season',
    false, false, NOW() - INTERVAL '1 day'
),
(
    'summary',
    'Weekly Performance Summary',
    'This week: 23 new donations ($12,450 total), 5 new donors acquired, 89% email open rate on Tuesday campaign. Volunteer hours: 156 across 12 volunteers.',
    0.95, 'low',
    '{"donations": 23, "total_amount": 12450, "new_donors": 5, "email_open_rate": 0.89, "volunteer_hours": 156}',
    '["weekly_donations", "new_donors", "volunteer_hours"]',
    'kpi', NULL,
    false, true, NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE REPORT DASHBOARD
-- ============================================

INSERT INTO report_dashboards (
    name, description, layout_type, column_count, row_height,
    is_public, auto_refresh, refresh_interval_seconds,
    show_header, theme, is_default
) VALUES
(
    'Executive Dashboard',
    'High-level overview of key metrics for leadership review',
    'grid', 3, 250,
    true, true, 300,
    true, 'light', true
)
ON CONFLICT DO NOTHING;
