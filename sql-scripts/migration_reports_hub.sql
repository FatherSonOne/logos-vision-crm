-- ============================================
-- PHASE 8: ENTERPRISE REPORTS HUB
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this AFTER migration_analytics_reporting.sql

-- 0. DROP EXISTING OBJECTS (to ensure clean state)
DROP TABLE IF EXISTS report_annotations CASCADE;
DROP TABLE IF EXISTS report_schedules CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS report_data_cache CASCADE;
DROP TABLE IF EXISTS kpis CASCADE;
DROP TABLE IF EXISTS report_widgets CASCADE;
DROP TABLE IF EXISTS report_dashboards CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- 1. REPORTS TABLE
-- Stores all report configurations
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- 'predefined', 'custom', 'dashboard'
    category VARCHAR(100), -- 'financial', 'client', 'project', 'team', 'donation', 'impact', 'volunteer', 'case', 'hr'

    -- Report Configuration
    data_source JSONB NOT NULL DEFAULT '{}'::JSONB, -- JSON config of tables/joins
    visualization_type VARCHAR(50) DEFAULT 'bar', -- 'line', 'pie', 'bar', 'table', 'area', etc.

    -- Filters
    filters JSONB DEFAULT '{}'::JSONB, -- Dynamic filter configuration
    available_filters JSONB DEFAULT '[]'::JSONB, -- Which filters can be applied

    -- Columns/Fields
    columns JSONB DEFAULT '[]'::JSONB, -- Selected columns
    sort_by VARCHAR(100),
    sort_direction VARCHAR(10) DEFAULT 'desc',

    -- Layout (for dashboards)
    layout JSONB DEFAULT '{}'::JSONB, -- Widget positions

    -- Sharing
    is_public BOOLEAN DEFAULT FALSE,
    shared_with TEXT[] DEFAULT '{}',

    -- Metadata
    is_template BOOLEAN DEFAULT FALSE,
    template_category VARCHAR(100),
    icon VARCHAR(50),
    color VARCHAR(50),

    -- Usage tracking
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,

    -- Ownership
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. REPORT DASHBOARDS TABLE
-- Custom dashboards with multiple widgets
CREATE TABLE report_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Layout configuration
    layout_type VARCHAR(50) DEFAULT 'grid', -- 'grid', 'freeform'
    column_count INTEGER DEFAULT 3,
    row_height INTEGER DEFAULT 200,

    -- Sharing
    is_public BOOLEAN DEFAULT FALSE,
    shared_with TEXT[] DEFAULT '{}',

    -- Display settings
    auto_refresh BOOLEAN DEFAULT FALSE,
    refresh_interval_seconds INTEGER DEFAULT 300,
    show_header BOOLEAN DEFAULT TRUE,
    theme VARCHAR(50) DEFAULT 'light',

    -- Metadata
    is_default BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,

    -- Ownership
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REPORT WIDGETS TABLE
-- Individual widgets on dashboards
CREATE TABLE report_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID NOT NULL REFERENCES report_dashboards(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL, -- Optional link to a report

    -- Widget type and configuration
    widget_type VARCHAR(50) NOT NULL, -- 'chart', 'kpi', 'table', 'text', 'image'
    title VARCHAR(255),
    subtitle VARCHAR(255),

    -- Position in grid
    grid_x INTEGER DEFAULT 0,
    grid_y INTEGER DEFAULT 0,
    grid_width INTEGER DEFAULT 1,
    grid_height INTEGER DEFAULT 1,

    -- Widget-specific configuration
    config JSONB DEFAULT '{}'::JSONB,

    -- Styling
    background_color VARCHAR(50),
    border_color VARCHAR(50),
    text_color VARCHAR(50),

    -- Ordering
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. KPIs TABLE
-- Key Performance Indicators with thresholds
CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),

    -- Metric configuration
    metric_type VARCHAR(50) NOT NULL, -- 'count', 'sum', 'average', 'percentage', 'ratio', 'custom'
    data_source VARCHAR(100) NOT NULL, -- Table name
    data_field VARCHAR(100), -- Field to aggregate

    -- Calculation
    calculation_formula TEXT, -- Custom SQL or formula
    filter_conditions JSONB DEFAULT '{}'::JSONB,

    -- Targets and thresholds
    target_value DECIMAL(15, 2),
    threshold_warning DECIMAL(15, 2), -- Yellow alert
    threshold_critical DECIMAL(15, 2), -- Red alert
    threshold_direction VARCHAR(10) DEFAULT 'above', -- 'above' or 'below'

    -- Display
    display_format VARCHAR(50) DEFAULT 'number', -- 'number', 'currency', 'percentage'
    decimal_places INTEGER DEFAULT 0,
    prefix VARCHAR(10),
    suffix VARCHAR(10),
    icon VARCHAR(50),
    color VARCHAR(50),

    -- Current value (cached)
    current_value DECIMAL(15, 2),
    previous_value DECIMAL(15, 2),
    trend_direction VARCHAR(10), -- 'up', 'down', 'stable'
    trend_percentage DECIMAL(5, 2),
    last_calculated_at TIMESTAMP WITH TIME ZONE,

    -- Alerting
    alert_enabled BOOLEAN DEFAULT FALSE,
    alert_recipients TEXT[] DEFAULT '{}',
    last_alert_sent_at TIMESTAMP WITH TIME ZONE,

    -- History for sparklines
    value_history JSONB DEFAULT '[]'::JSONB, -- Array of {date, value}

    -- Ordering
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    -- Ownership
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. REPORT DATA CACHE TABLE
-- Caches expensive report queries
CREATE TABLE report_data_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

    -- Cache key (hash of query + filters)
    cache_key VARCHAR(255) NOT NULL,

    -- Cached data
    cached_data JSONB,
    row_count INTEGER DEFAULT 0,

    -- Metadata
    data_hash VARCHAR(64), -- To detect changes
    query_time_ms INTEGER,

    -- Expiration
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(report_id, cache_key)
);

-- 6. AI INSIGHTS TABLE
-- AI-generated insights from report data
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    dashboard_id UUID REFERENCES report_dashboards(id) ON DELETE CASCADE,

    -- Insight details
    insight_type VARCHAR(50) NOT NULL, -- 'trend', 'anomaly', 'correlation', 'summary', 'recommendation', 'forecast'
    insight_title VARCHAR(255),
    insight_text TEXT NOT NULL,

    -- Confidence and importance
    confidence_score DECIMAL(3, 2), -- 0.00 - 1.00
    importance VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

    -- Related data
    related_data JSONB DEFAULT '{}'::JSONB, -- Supporting data for the insight
    related_metrics TEXT[] DEFAULT '{}', -- Related KPI/metric names

    -- Visualization suggestion
    suggested_chart_type VARCHAR(50),
    suggested_action TEXT,

    -- User interaction
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    dismissed_by UUID,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,

    -- Validity
    valid_until TIMESTAMP WITH TIME ZONE,

    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REPORT SCHEDULES TABLE
-- Scheduled report generation and delivery
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

    -- Schedule configuration
    is_active BOOLEAN DEFAULT TRUE,
    schedule_type VARCHAR(50) NOT NULL, -- 'once', 'daily', 'weekly', 'monthly', 'quarterly', 'annually'

    -- Timing
    schedule_time TIME DEFAULT '08:00:00',
    schedule_day_of_week INTEGER, -- 0-6 for weekly
    schedule_day_of_month INTEGER, -- 1-31 for monthly
    schedule_month INTEGER, -- 1-12 for quarterly/annually
    timezone VARCHAR(100) DEFAULT 'America/New_York',

    -- For one-time schedules
    scheduled_date DATE,

    -- Delivery
    delivery_method VARCHAR(50) DEFAULT 'email', -- 'email', 'download', 'webhook'
    recipients TEXT[] DEFAULT '{}',

    -- Export format
    export_format VARCHAR(20) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv', 'png'
    include_filters BOOLEAN DEFAULT TRUE,
    include_timestamp BOOLEAN DEFAULT TRUE,

    -- Custom message
    email_subject VARCHAR(255),
    email_body TEXT,

    -- Tracking
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    last_status VARCHAR(50),
    last_error TEXT,

    -- Ownership
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. REPORT ANNOTATIONS TABLE
-- Comments and annotations on reports
CREATE TABLE report_annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    dashboard_id UUID REFERENCES report_dashboards(id) ON DELETE CASCADE,

    -- Annotation details
    annotation_type VARCHAR(50) DEFAULT 'comment', -- 'comment', 'highlight', 'note', 'question'
    content TEXT NOT NULL,

    -- Position (for chart annotations)
    position_x DECIMAL(10, 4),
    position_y DECIMAL(10, 4),
    data_point_id VARCHAR(255), -- Reference to specific data point

    -- Threading
    parent_id UUID REFERENCES report_annotations(id) ON DELETE CASCADE,

    -- Mentions
    mentioned_users TEXT[] DEFAULT '{}',

    -- Status
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,

    -- Ownership
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_template ON reports(is_template) WHERE is_template = TRUE;
CREATE INDEX IF NOT EXISTS idx_reports_favorite ON reports(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);

CREATE INDEX IF NOT EXISTS idx_dashboards_default ON report_dashboards(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_dashboards_created_by ON report_dashboards(created_by);

CREATE INDEX IF NOT EXISTS idx_widgets_dashboard ON report_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_widgets_report ON report_widgets(report_id);

CREATE INDEX IF NOT EXISTS idx_kpis_category ON kpis(category);
CREATE INDEX IF NOT EXISTS idx_kpis_active ON kpis(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_kpis_alert ON kpis(alert_enabled) WHERE alert_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_cache_report ON report_data_cache(report_id);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON report_data_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_key ON report_data_cache(cache_key);

CREATE INDEX IF NOT EXISTS idx_insights_report ON ai_insights(report_id);
CREATE INDEX IF NOT EXISTS idx_insights_dashboard ON ai_insights(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_dismissed ON ai_insights(is_dismissed) WHERE is_dismissed = FALSE;

CREATE INDEX IF NOT EXISTS idx_schedules_report ON report_schedules(report_id);
CREATE INDEX IF NOT EXISTS idx_schedules_active ON report_schedules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_schedules_next_run ON report_schedules(next_run_at);

CREATE INDEX IF NOT EXISTS idx_annotations_report ON report_annotations(report_id);
CREATE INDEX IF NOT EXISTS idx_annotations_dashboard ON report_annotations(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_annotations_parent ON report_annotations(parent_id);

-- 10. ADD TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reports_updated_at ON reports;
CREATE TRIGGER trigger_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

DROP TRIGGER IF EXISTS trigger_dashboards_updated_at ON report_dashboards;
CREATE TRIGGER trigger_dashboards_updated_at
    BEFORE UPDATE ON report_dashboards
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

DROP TRIGGER IF EXISTS trigger_widgets_updated_at ON report_widgets;
CREATE TRIGGER trigger_widgets_updated_at
    BEFORE UPDATE ON report_widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

DROP TRIGGER IF EXISTS trigger_kpis_updated_at ON kpis;
CREATE TRIGGER trigger_kpis_updated_at
    BEFORE UPDATE ON kpis
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

DROP TRIGGER IF EXISTS trigger_schedules_updated_at ON report_schedules;
CREATE TRIGGER trigger_schedules_updated_at
    BEFORE UPDATE ON report_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

DROP TRIGGER IF EXISTS trigger_annotations_updated_at ON report_annotations;
CREATE TRIGGER trigger_annotations_updated_at
    BEFORE UPDATE ON report_annotations
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

-- 11. FUNCTION TO CALCULATE KPI VALUES
CREATE OR REPLACE FUNCTION calculate_kpi_value(p_kpi_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_kpi RECORD;
    v_result DECIMAL;
    v_query TEXT;
BEGIN
    SELECT * INTO v_kpi FROM kpis WHERE id = p_kpi_id;

    IF v_kpi IS NULL THEN
        RETURN NULL;
    END IF;

    -- Build query based on metric type
    CASE v_kpi.metric_type
        WHEN 'count' THEN
            v_query := format('SELECT COUNT(*)::DECIMAL FROM %I', v_kpi.data_source);
        WHEN 'sum' THEN
            v_query := format('SELECT COALESCE(SUM(%I), 0)::DECIMAL FROM %I', v_kpi.data_field, v_kpi.data_source);
        WHEN 'average' THEN
            v_query := format('SELECT COALESCE(AVG(%I), 0)::DECIMAL FROM %I', v_kpi.data_field, v_kpi.data_source);
        WHEN 'custom' THEN
            IF v_kpi.calculation_formula IS NOT NULL THEN
                v_query := v_kpi.calculation_formula;
            ELSE
                RETURN NULL;
            END IF;
        ELSE
            RETURN NULL;
    END CASE;

    EXECUTE v_query INTO v_result;

    -- Update KPI with new value
    UPDATE kpis SET
        previous_value = current_value,
        current_value = v_result,
        trend_direction = CASE
            WHEN current_value IS NULL THEN 'stable'
            WHEN v_result > current_value THEN 'up'
            WHEN v_result < current_value THEN 'down'
            ELSE 'stable'
        END,
        trend_percentage = CASE
            WHEN current_value IS NULL OR current_value = 0 THEN 0
            ELSE ROUND(((v_result - current_value) / current_value * 100)::NUMERIC, 2)
        END,
        last_calculated_at = NOW(),
        value_history = COALESCE(value_history, '[]'::JSONB) || jsonb_build_array(
            jsonb_build_object('date', NOW()::DATE, 'value', v_result)
        )
    WHERE id = p_kpi_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 12. FUNCTION TO REFRESH ALL KPIs
CREATE OR REPLACE FUNCTION refresh_all_kpis()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_kpi_id UUID;
BEGIN
    FOR v_kpi_id IN
        SELECT id FROM kpis WHERE is_active = TRUE
    LOOP
        PERFORM calculate_kpi_value(v_kpi_id);
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 13. FUNCTION TO CLEAN EXPIRED CACHE
CREATE OR REPLACE FUNCTION clean_expired_report_cache()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM report_data_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 14. ENABLE ROW LEVEL SECURITY
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_annotations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all access to reports"
ON reports FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to report_dashboards"
ON report_dashboards FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to report_widgets"
ON report_widgets FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to kpis"
ON kpis FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to report_data_cache"
ON report_data_cache FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to ai_insights"
ON ai_insights FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to report_schedules"
ON report_schedules FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to report_annotations"
ON report_annotations FOR ALL USING (true) WITH CHECK (true);

-- 15. INSERT PREDEFINED REPORTS
INSERT INTO reports (name, description, report_type, category, visualization_type, data_source, is_template, template_category, icon, color) VALUES
-- Financial Reports
('Revenue Overview', 'Monthly, quarterly, and yearly revenue trends', 'predefined', 'financial', 'line', '{"table": "donations", "aggregation": "sum", "field": "amount", "groupBy": "month"}', TRUE, 'financial', 'currency-dollar', 'green'),
('Expense Breakdown', 'Expense distribution by category', 'predefined', 'financial', 'pie', '{"table": "expenses", "aggregation": "sum", "field": "amount", "groupBy": "category"}', TRUE, 'financial', 'chart-pie', 'red'),
('Budget vs Actual', 'Compare budgeted amounts to actual spending', 'predefined', 'financial', 'bar', '{"table": "budgets", "compare": "actual"}', TRUE, 'financial', 'scale', 'blue'),

-- Donation Reports
('Donation Trends', 'Donation amounts over time', 'predefined', 'donation', 'area', '{"table": "donations", "aggregation": "sum", "field": "amount", "groupBy": "month"}', TRUE, 'donation', 'heart', 'pink'),
('Top Donors', 'Highest value donors ranked by total giving', 'predefined', 'donation', 'table', '{"table": "donations", "aggregation": "sum", "field": "amount", "groupBy": "client_id", "orderBy": "amount", "limit": 20}', TRUE, 'donation', 'star', 'amber'),
('Campaign Performance', 'Donation performance by campaign', 'predefined', 'donation', 'bar', '{"table": "donations", "aggregation": "sum", "field": "amount", "groupBy": "campaign"}', TRUE, 'donation', 'megaphone', 'purple'),
('Donor Retention', 'Year-over-year donor retention rates', 'predefined', 'donation', 'line', '{"view": "cohort_retention_summary", "field": "retention_rate", "groupBy": "cohort_year"}', TRUE, 'donation', 'users', 'indigo'),

-- Client/Contact Reports
('Client Growth', 'New clients over time', 'predefined', 'client', 'line', '{"table": "clients", "aggregation": "count", "groupBy": "month"}', TRUE, 'client', 'user-plus', 'blue'),
('Client Distribution', 'Clients by location', 'predefined', 'client', 'pie', '{"table": "clients", "aggregation": "count", "groupBy": "location"}', TRUE, 'client', 'map', 'teal'),
('Engagement Levels', 'Client engagement score distribution', 'predefined', 'client', 'bar', '{"table": "engagement_scores", "aggregation": "count", "groupBy": "engagement_level"}', TRUE, 'client', 'chart-bar', 'violet'),

-- Project Reports
('Project Status', 'Projects by status', 'predefined', 'project', 'donut', '{"table": "projects", "aggregation": "count", "groupBy": "status"}', TRUE, 'project', 'folder', 'cyan'),
('Project Timeline', 'Active projects on timeline', 'predefined', 'project', 'gantt', '{"table": "projects", "fields": ["name", "start_date", "end_date"]}', TRUE, 'project', 'calendar', 'orange'),
('Task Completion', 'Task completion rates by project', 'predefined', 'project', 'bar', '{"table": "tasks", "aggregation": "percentage", "groupBy": "project_id"}', TRUE, 'project', 'check-circle', 'green'),

-- Team Reports
('Team Productivity', 'Tasks completed by team member', 'predefined', 'team', 'bar', '{"table": "tasks", "aggregation": "count", "field": "status", "filter": {"status": "Done"}, "groupBy": "team_member_id"}', TRUE, 'team', 'users', 'indigo'),
('Workload Balance', 'Task distribution across team', 'predefined', 'team', 'pie', '{"table": "tasks", "aggregation": "count", "groupBy": "team_member_id"}', TRUE, 'team', 'scale', 'purple'),

-- Impact Reports
('Lives Impacted', 'Total impact metrics over time', 'predefined', 'impact', 'area', '{"table": "outcomes", "aggregation": "sum", "field": "impact_value", "groupBy": "month"}', TRUE, 'impact', 'heart', 'rose'),
('Program Effectiveness', 'Outcomes by program', 'predefined', 'impact', 'bar', '{"table": "outcomes", "aggregation": "count", "groupBy": "program_id"}', TRUE, 'impact', 'trending-up', 'emerald'),

-- Volunteer Reports
('Volunteer Hours', 'Hours contributed over time', 'predefined', 'volunteer', 'line', '{"table": "services", "aggregation": "sum", "field": "duration_minutes", "groupBy": "month"}', TRUE, 'volunteer', 'clock', 'amber'),
('Volunteer Distribution', 'Volunteers by skill', 'predefined', 'volunteer', 'pie', '{"table": "volunteers", "aggregation": "count", "groupBy": "skills"}', TRUE, 'volunteer', 'users', 'cyan'),

-- Case Reports
('Case Status', 'Cases by status', 'predefined', 'case', 'donut', '{"table": "cases", "aggregation": "count", "groupBy": "status"}', TRUE, 'case', 'briefcase', 'slate'),
('Case Resolution Time', 'Average resolution time by priority', 'predefined', 'case', 'bar', '{"table": "cases", "aggregation": "average", "field": "resolution_time", "groupBy": "priority"}', TRUE, 'case', 'clock', 'red')

ON CONFLICT DO NOTHING;

-- 16. INSERT DEFAULT KPIs
INSERT INTO kpis (name, description, category, metric_type, data_source, data_field, display_format, icon, color, display_order) VALUES
('Total Donations', 'Total donation amount this year', 'financial', 'sum', 'donations', 'amount', 'currency', 'currency-dollar', 'green', 1),
('Donor Count', 'Number of unique donors', 'financial', 'count', 'donations', NULL, 'number', 'users', 'blue', 2),
('Average Donation', 'Average donation amount', 'financial', 'average', 'donations', 'amount', 'currency', 'trending-up', 'purple', 3),
('Active Projects', 'Number of projects in progress', 'operations', 'count', 'projects', NULL, 'number', 'folder', 'cyan', 4),
('Task Completion Rate', 'Percentage of tasks completed', 'operations', 'percentage', 'tasks', 'status', 'percentage', 'check-circle', 'emerald', 5),
('Client Count', 'Total number of clients', 'engagement', 'count', 'clients', NULL, 'number', 'users', 'indigo', 6),
('Open Cases', 'Number of unresolved cases', 'operations', 'count', 'cases', NULL, 'number', 'briefcase', 'amber', 7),
('Lives Impacted', 'Total impact value', 'impact', 'sum', 'outcomes', 'impact_value', 'number', 'heart', 'rose', 8)
ON CONFLICT DO NOTHING;

-- 17. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE reports IS 'Stores all report configurations including predefined and custom reports';
COMMENT ON TABLE report_dashboards IS 'Custom dashboards with multiple widgets';
COMMENT ON TABLE report_widgets IS 'Individual widgets on dashboards';
COMMENT ON TABLE kpis IS 'Key Performance Indicators with thresholds and alerts';
COMMENT ON TABLE report_data_cache IS 'Caches expensive report queries';
COMMENT ON TABLE ai_insights IS 'AI-generated insights from report data';
COMMENT ON TABLE report_schedules IS 'Scheduled report generation and delivery';
COMMENT ON TABLE report_annotations IS 'Comments and annotations on reports';
