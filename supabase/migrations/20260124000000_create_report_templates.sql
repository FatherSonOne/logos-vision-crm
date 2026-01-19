-- ============================================
-- REPORT TEMPLATES MIGRATION
-- ============================================
-- This migration creates 3 pre-configured report templates
-- that power the Quick Actions buttons in ReportsHub
-- Templates are read-only and users create copies from them

-- ============================================
-- FINANCIAL SUMMARY TEMPLATE
-- ============================================
INSERT INTO reports (
  name,
  description,
  report_type,
  category,
  data_source,
  visualization_type,
  filters,
  available_filters,
  columns,
  sort_by,
  sort_direction,
  layout,
  is_template,
  template_category,
  icon,
  color,
  is_public,
  shared_with,
  is_favorite,
  is_pinned
) VALUES (
  'Financial Summary',
  'Comprehensive overview of revenue, expenses, and donations over time with trend analysis',
  'predefined',
  'financial',
  jsonb_build_object(
    'table', 'donations',
    'aggregation', jsonb_build_object(
      'method', 'sum',
      'field', 'amount',
      'groupBy', 'month'
    )
  ),
  'bar',
  jsonb_build_object(
    'dateStart', (CURRENT_DATE - INTERVAL '30 days')::text,
    'dateEnd', CURRENT_DATE::text,
    'groupBy', 'month',
    'metric', 'sum:amount'
  ),
  ARRAY['dateStart', 'dateEnd', 'campaign', 'payment_method', 'groupBy'],
  ARRAY['donation_date', 'amount', 'campaign', 'donor_name', 'payment_method'],
  'donation_date',
  'desc',
  jsonb_build_object(
    'chartConfig', jsonb_build_object(
      'xAxis', 'donation_date',
      'yAxis', 'amount',
      'showLegend', true,
      'showGrid', true,
      'color', '#10b981'
    ),
    'metrics', jsonb_build_array(
      'Total Revenue',
      'Monthly Trends',
      'Revenue by Source',
      'Year-over-Year Comparison'
    )
  ),
  true,
  'financial',
  '💰',
  'green',
  true,
  ARRAY[]::text[],
  false,
  false
);

-- ============================================
-- DONATION REPORT TEMPLATE
-- ============================================
INSERT INTO reports (
  name,
  description,
  report_type,
  category,
  data_source,
  visualization_type,
  filters,
  available_filters,
  columns,
  sort_by,
  sort_direction,
  layout,
  is_template,
  template_category,
  icon,
  color,
  is_public,
  shared_with,
  is_favorite,
  is_pinned
) VALUES (
  'Donation Report',
  'Detailed breakdown of donations by campaign, donor, and date range with donor insights',
  'predefined',
  'donation',
  jsonb_build_object(
    'table', 'donations',
    'aggregation', jsonb_build_object(
      'method', 'sum',
      'field', 'amount',
      'groupBy', 'campaign'
    ),
    'joins', jsonb_build_array(
      jsonb_build_object(
        'table', 'clients',
        'on', 'donations.client_id = clients.id',
        'type', 'left'
      )
    )
  ),
  'line',
  jsonb_build_object(
    'dateStart', (CURRENT_DATE - INTERVAL '90 days')::text,
    'dateEnd', CURRENT_DATE::text,
    'groupBy', 'week',
    'metric', 'sum:amount'
  ),
  ARRAY['dateStart', 'dateEnd', 'campaign', 'client_id', 'groupBy', 'payment_method'],
  ARRAY['donation_date', 'amount', 'campaign', 'donor_name', 'client_id', 'payment_method'],
  'donation_date',
  'desc',
  jsonb_build_object(
    'chartConfig', jsonb_build_object(
      'xAxis', 'donation_date',
      'yAxis', 'amount',
      'showLegend', true,
      'showGrid', true,
      'showTrendLine', true,
      'color', '#ec4899'
    ),
    'metrics', jsonb_build_array(
      'Total Donations',
      'Donations by Campaign',
      'Top Donors',
      'Average Donation Amount',
      'Donor Retention Rate'
    )
  ),
  true,
  'donation',
  '❤️',
  'pink',
  true,
  ARRAY[]::text[],
  false,
  false
);

-- ============================================
-- IMPACT REPORT TEMPLATE
-- ============================================
INSERT INTO reports (
  name,
  description,
  report_type,
  category,
  data_source,
  visualization_type,
  filters,
  available_filters,
  columns,
  sort_by,
  sort_direction,
  layout,
  is_template,
  template_category,
  icon,
  color,
  is_public,
  shared_with,
  is_favorite,
  is_pinned
) VALUES (
  'Impact Report',
  'Track beneficiaries served, program outcomes, and measurable impact metrics across all programs',
  'predefined',
  'impact',
  jsonb_build_object(
    'table', 'outcomes',
    'aggregation', jsonb_build_object(
      'method', 'count',
      'field', 'id',
      'groupBy', 'outcome_category'
    ),
    'joins', jsonb_build_array(
      jsonb_build_object(
        'table', 'programs',
        'on', 'outcomes.program_id = programs.id',
        'type', 'left'
      ),
      jsonb_build_object(
        'table', 'clients',
        'on', 'outcomes.client_id = clients.id',
        'type', 'left'
      )
    )
  ),
  'area',
  jsonb_build_object(
    'dateStart', (CURRENT_DATE - INTERVAL '1 year')::text,
    'dateEnd', CURRENT_DATE::text,
    'groupBy', 'month',
    'metric', 'count:id',
    'verified', true
  ),
  ARRAY['dateStart', 'dateEnd', 'program_id', 'outcome_category', 'verified', 'groupBy'],
  ARRAY['outcome_date', 'outcome_type', 'outcome_category', 'impact_value', 'client_id', 'program_id'],
  'outcome_date',
  'desc',
  jsonb_build_object(
    'chartConfig', jsonb_build_object(
      'xAxis', 'outcome_date',
      'yAxis', 'count',
      'showLegend', true,
      'showGrid', true,
      'stacked', true,
      'color', '#10b981',
      'fillOpacity', 0.6
    ),
    'metrics', jsonb_build_array(
      'Total Outcomes Achieved',
      'Beneficiaries Served',
      'Program Success Rate',
      'Impact Value Generated',
      'Outcomes by Category'
    )
  ),
  true,
  'impact',
  '📊',
  'emerald',
  true,
  ARRAY[]::text[],
  false,
  false
);

-- ============================================
-- CREATE INDEX FOR TEMPLATE QUERIES
-- ============================================
-- Optimize queries that fetch templates
CREATE INDEX IF NOT EXISTS idx_reports_is_template ON reports(is_template) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_reports_template_category ON reports(template_category) WHERE template_category IS NOT NULL;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Uncomment to verify templates were created:
-- SELECT id, name, category, visualization_type, is_template
-- FROM reports
-- WHERE is_template = true;
