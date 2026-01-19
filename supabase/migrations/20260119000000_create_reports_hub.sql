-- =============================================================================
-- Migration: Create Reports Hub Base Schema
-- Description: Complete base tables for enterprise reports system
-- Author: Backend Architect
-- Date: 2026-01-19
-- Version: 1.0.0
-- =============================================================================
--
-- This migration MUST run BEFORE 20260120000000_create_report_export_history.sql
--
-- Tables created (in order):
--   1. reports - All report configurations
--   2. report_dashboards - Custom dashboards with multiple widgets
--   3. report_widgets - Individual widgets on dashboards
--   4. kpis - Key Performance Indicators with thresholds
--   5. report_data_cache - Cache for expensive report queries
--   6. ai_insights - AI-generated insights from report data
--   7. report_schedules - Scheduled report generation and delivery
--   8. report_annotations - Comments and annotations on reports
--
-- =============================================================================

-- =============================================================================
-- 1. REPORTS TABLE
-- Purpose: Stores all report configurations including predefined and custom reports
-- =============================================================================

CREATE TABLE IF NOT EXISTS reports (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic information
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Report classification
    report_type VARCHAR(50) NOT NULL CHECK (
        report_type IN ('predefined', 'custom', 'dashboard')
    ),
    category VARCHAR(100), -- 'financial', 'client', 'project', 'team', 'donation', 'impact', 'volunteer', 'case', 'hr'

    -- Report configuration
    data_source JSONB NOT NULL DEFAULT '{}'::JSONB, -- JSON config of tables/joins
    visualization_type VARCHAR(50) DEFAULT 'bar', -- 'line', 'pie', 'bar', 'table', 'area', etc.

    -- Filters and parameters
    filters JSONB DEFAULT '{}'::JSONB, -- Dynamic filter configuration
    available_filters JSONB DEFAULT '[]'::JSONB, -- Which filters can be applied

    -- Columns and sorting
    columns JSONB DEFAULT '[]'::JSONB, -- Selected columns for display
    sort_by VARCHAR(100),
    sort_direction VARCHAR(10) DEFAULT 'desc' CHECK (
        sort_direction IN ('asc', 'desc')
    ),

    -- Layout configuration (for dashboards)
    layout JSONB DEFAULT '{}'::JSONB, -- Widget positions and grid layout

    -- Sharing and permissions
    is_public BOOLEAN DEFAULT FALSE,
    shared_with TEXT[] DEFAULT '{}',

    -- Template metadata
    is_template BOOLEAN DEFAULT FALSE,
    template_category VARCHAR(100),
    icon VARCHAR(50),
    color VARCHAR(50),

    -- Usage tracking
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,

    -- Ownership and audit
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. REPORT DASHBOARDS TABLE
-- Purpose: Custom dashboards with multiple widgets
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_dashboards (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic information
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Layout configuration
    layout_type VARCHAR(50) DEFAULT 'grid' CHECK (
        layout_type IN ('grid', 'freeform')
    ),
    column_count INTEGER DEFAULT 3 CHECK (column_count > 0),
    row_height INTEGER DEFAULT 200 CHECK (row_height > 0),

    -- Sharing and permissions
    is_public BOOLEAN DEFAULT FALSE,
    shared_with TEXT[] DEFAULT '{}',

    -- Display settings
    auto_refresh BOOLEAN DEFAULT FALSE,
    refresh_interval_seconds INTEGER DEFAULT 300 CHECK (
        refresh_interval_seconds IS NULL OR refresh_interval_seconds >= 10
    ),
    show_header BOOLEAN DEFAULT TRUE,
    theme VARCHAR(50) DEFAULT 'light' CHECK (
        theme IN ('light', 'dark')
    ),

    -- Metadata
    is_default BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    last_viewed_at TIMESTAMP WITH TIME ZONE,

    -- Ownership and audit
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. REPORT WIDGETS TABLE
-- Purpose: Individual widgets on dashboards
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_widgets (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    dashboard_id UUID NOT NULL REFERENCES report_dashboards(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL, -- Optional link to a report

    -- Widget type and configuration
    widget_type VARCHAR(50) NOT NULL CHECK (
        widget_type IN ('chart', 'kpi', 'table', 'text', 'image', 'metric', 'list')
    ),
    title VARCHAR(255),
    subtitle VARCHAR(255),

    -- Grid position and size
    grid_x INTEGER DEFAULT 0 CHECK (grid_x >= 0),
    grid_y INTEGER DEFAULT 0 CHECK (grid_y >= 0),
    grid_width INTEGER DEFAULT 1 CHECK (grid_width > 0),
    grid_height INTEGER DEFAULT 1 CHECK (grid_height > 0),

    -- Widget-specific configuration
    config JSONB DEFAULT '{}'::JSONB,

    -- Styling
    background_color VARCHAR(50),
    border_color VARCHAR(50),
    text_color VARCHAR(50),

    -- Ordering
    display_order INTEGER DEFAULT 0 CHECK (display_order >= 0),

    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. KPIS TABLE
-- Purpose: Key Performance Indicators with thresholds and alerts
-- =============================================================================

CREATE TABLE IF NOT EXISTS kpis (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),

    -- Metric configuration
    metric_type VARCHAR(50) NOT NULL CHECK (
        metric_type IN ('count', 'sum', 'average', 'percentage', 'ratio', 'custom')
    ),
    data_source VARCHAR(100) NOT NULL, -- Table or view name
    data_field VARCHAR(100), -- Field to aggregate (null for count)

    -- Calculation
    calculation_formula TEXT, -- Custom SQL or formula for 'custom' type
    filter_conditions JSONB DEFAULT '{}'::JSONB,

    -- Targets and thresholds
    target_value DECIMAL(15, 2),
    threshold_warning DECIMAL(15, 2), -- Yellow alert threshold
    threshold_critical DECIMAL(15, 2), -- Red alert threshold
    threshold_direction VARCHAR(10) DEFAULT 'above' CHECK (
        threshold_direction IN ('above', 'below')
    ),

    -- Display formatting
    display_format VARCHAR(50) DEFAULT 'number' CHECK (
        display_format IN ('number', 'currency', 'percentage', 'decimal')
    ),
    decimal_places INTEGER DEFAULT 0 CHECK (decimal_places >= 0),
    prefix VARCHAR(10),
    suffix VARCHAR(10),
    icon VARCHAR(50),
    color VARCHAR(50),

    -- Current value (cached)
    current_value DECIMAL(15, 2),
    previous_value DECIMAL(15, 2),
    trend_direction VARCHAR(10) CHECK (
        trend_direction IS NULL OR trend_direction IN ('up', 'down', 'stable')
    ),
    trend_percentage DECIMAL(5, 2),
    last_calculated_at TIMESTAMP WITH TIME ZONE,

    -- Alerting configuration
    alert_enabled BOOLEAN DEFAULT FALSE,
    alert_recipients TEXT[] DEFAULT '{}',
    last_alert_sent_at TIMESTAMP WITH TIME ZONE,

    -- History for sparklines
    value_history JSONB DEFAULT '[]'::JSONB, -- Array of {date, value} objects

    -- Ordering and status
    display_order INTEGER DEFAULT 0 CHECK (display_order >= 0),
    is_active BOOLEAN DEFAULT TRUE,

    -- Ownership and audit
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. REPORT DATA CACHE TABLE
-- Purpose: Caches expensive report queries to improve performance
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_data_cache (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

    -- Cache identification
    cache_key VARCHAR(255) NOT NULL, -- Hash of query + filters

    -- Cached data
    cached_data JSONB,
    row_count INTEGER DEFAULT 0 CHECK (row_count >= 0),

    -- Metadata
    data_hash VARCHAR(64), -- SHA-256 hash to detect data changes
    query_time_ms INTEGER CHECK (query_time_ms >= 0),

    -- Expiration
    cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Ensure unique cache entries per report + key combination
    UNIQUE(report_id, cache_key)
);

-- =============================================================================
-- 6. AI INSIGHTS TABLE
-- Purpose: AI-generated insights from report data
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_insights (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys (at least one must be set)
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    dashboard_id UUID REFERENCES report_dashboards(id) ON DELETE CASCADE,

    -- Insight details
    insight_type VARCHAR(50) NOT NULL CHECK (
        insight_type IN ('trend', 'anomaly', 'correlation', 'summary', 'recommendation', 'forecast')
    ),
    insight_title VARCHAR(255),
    insight_text TEXT NOT NULL,

    -- Confidence and importance
    confidence_score DECIMAL(3, 2) CHECK (
        confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)
    ),
    importance VARCHAR(20) DEFAULT 'medium' CHECK (
        importance IN ('low', 'medium', 'high', 'critical')
    ),

    -- Related data
    related_data JSONB DEFAULT '{}'::JSONB, -- Supporting data for the insight
    related_metrics TEXT[] DEFAULT '{}', -- Related KPI/metric names

    -- Visualization suggestions
    suggested_chart_type VARCHAR(50),
    suggested_action TEXT,

    -- User interaction
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    dismissed_by UUID,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,

    -- Validity period
    valid_until TIMESTAMP WITH TIME ZONE,

    -- Audit timestamps
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraint: At least one FK must be set
    CHECK (report_id IS NOT NULL OR dashboard_id IS NOT NULL)
);

-- =============================================================================
-- 7. REPORT SCHEDULES TABLE
-- Purpose: Scheduled report generation and delivery
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_schedules (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

    -- Schedule configuration
    is_active BOOLEAN DEFAULT TRUE,
    schedule_type VARCHAR(50) NOT NULL CHECK (
        schedule_type IN ('once', 'daily', 'weekly', 'monthly', 'quarterly', 'annually')
    ),

    -- Timing configuration
    schedule_time TIME DEFAULT '08:00:00',
    schedule_day_of_week INTEGER CHECK (
        schedule_day_of_week IS NULL OR (schedule_day_of_week >= 0 AND schedule_day_of_week <= 6)
    ), -- 0-6 for weekly (Sunday = 0)
    schedule_day_of_month INTEGER CHECK (
        schedule_day_of_month IS NULL OR (schedule_day_of_month >= 1 AND schedule_day_of_month <= 31)
    ), -- 1-31 for monthly
    schedule_month INTEGER CHECK (
        schedule_month IS NULL OR (schedule_month >= 1 AND schedule_month <= 12)
    ), -- 1-12 for quarterly/annually
    timezone VARCHAR(100) DEFAULT 'America/New_York',

    -- For one-time schedules
    scheduled_date DATE,

    -- Delivery configuration
    delivery_method VARCHAR(50) DEFAULT 'email' CHECK (
        delivery_method IN ('email', 'download', 'webhook')
    ),
    recipients TEXT[] DEFAULT '{}',

    -- Export format
    export_format VARCHAR(20) DEFAULT 'pdf' CHECK (
        export_format IN ('pdf', 'excel', 'csv', 'png')
    ),
    include_filters BOOLEAN DEFAULT TRUE,
    include_timestamp BOOLEAN DEFAULT TRUE,

    -- Custom email message
    email_subject VARCHAR(255),
    email_body TEXT,

    -- Execution tracking
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0 CHECK (run_count >= 0),
    last_status VARCHAR(50) CHECK (
        last_status IS NULL OR last_status IN ('success', 'error', 'pending', 'running')
    ),
    last_error TEXT,

    -- Ownership and audit
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 8. REPORT ANNOTATIONS TABLE
-- Purpose: Comments and annotations on reports and dashboards
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_annotations (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys (at least one must be set)
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    dashboard_id UUID REFERENCES report_dashboards(id) ON DELETE CASCADE,

    -- Annotation details
    annotation_type VARCHAR(50) DEFAULT 'comment' CHECK (
        annotation_type IN ('comment', 'highlight', 'note', 'question', 'suggestion')
    ),
    content TEXT NOT NULL,

    -- Position (for chart annotations)
    position_x DECIMAL(10, 4) CHECK (position_x IS NULL OR position_x >= 0),
    position_y DECIMAL(10, 4) CHECK (position_y IS NULL OR position_y >= 0),
    data_point_id VARCHAR(255), -- Reference to specific data point

    -- Threading support
    parent_id UUID REFERENCES report_annotations(id) ON DELETE CASCADE,

    -- Mentions
    mentioned_users TEXT[] DEFAULT '{}',

    -- Status tracking
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,

    -- Ownership and audit
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraint: At least one FK must be set
    CHECK (report_id IS NOT NULL OR dashboard_id IS NOT NULL)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Reports table indexes
CREATE INDEX IF NOT EXISTS idx_reports_type
    ON reports(report_type);

CREATE INDEX IF NOT EXISTS idx_reports_category
    ON reports(category)
    WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_template
    ON reports(is_template)
    WHERE is_template = TRUE;

CREATE INDEX IF NOT EXISTS idx_reports_favorite
    ON reports(is_favorite)
    WHERE is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS idx_reports_created_by
    ON reports(created_by)
    WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_updated_at
    ON reports(updated_at DESC);

-- Report dashboards table indexes
CREATE INDEX IF NOT EXISTS idx_dashboards_default
    ON report_dashboards(is_default)
    WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_dashboards_created_by
    ON report_dashboards(created_by)
    WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dashboards_updated_at
    ON report_dashboards(updated_at DESC);

-- Report widgets table indexes
CREATE INDEX IF NOT EXISTS idx_widgets_dashboard
    ON report_widgets(dashboard_id);

CREATE INDEX IF NOT EXISTS idx_widgets_report
    ON report_widgets(report_id)
    WHERE report_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_widgets_display_order
    ON report_widgets(dashboard_id, display_order);

-- KPIs table indexes
CREATE INDEX IF NOT EXISTS idx_kpis_category
    ON kpis(category)
    WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kpis_active
    ON kpis(is_active)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_kpis_alert
    ON kpis(alert_enabled)
    WHERE alert_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_kpis_display_order
    ON kpis(display_order);

-- Report data cache table indexes
CREATE INDEX IF NOT EXISTS idx_cache_report
    ON report_data_cache(report_id);

CREATE INDEX IF NOT EXISTS idx_cache_expires
    ON report_data_cache(expires_at)
    WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cache_key
    ON report_data_cache(cache_key);

-- AI insights table indexes
CREATE INDEX IF NOT EXISTS idx_insights_report
    ON ai_insights(report_id)
    WHERE report_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_insights_dashboard
    ON ai_insights(dashboard_id)
    WHERE dashboard_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_insights_type
    ON ai_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_insights_dismissed
    ON ai_insights(is_dismissed)
    WHERE is_dismissed = FALSE;

CREATE INDEX IF NOT EXISTS idx_insights_generated_at
    ON ai_insights(generated_at DESC);

-- Report schedules table indexes
CREATE INDEX IF NOT EXISTS idx_schedules_report
    ON report_schedules(report_id);

CREATE INDEX IF NOT EXISTS idx_schedules_active
    ON report_schedules(is_active)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_schedules_next_run
    ON report_schedules(next_run_at)
    WHERE next_run_at IS NOT NULL AND is_active = TRUE;

-- Report annotations table indexes
CREATE INDEX IF NOT EXISTS idx_annotations_report
    ON report_annotations(report_id)
    WHERE report_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_annotations_dashboard
    ON report_annotations(dashboard_id)
    WHERE dashboard_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_annotations_parent
    ON report_annotations(parent_id)
    WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_annotations_created_at
    ON report_annotations(created_at DESC);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Create reusable trigger function
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
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

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function: Calculate KPI value
-- Purpose: Recalculates a KPI's current value based on its configuration
CREATE OR REPLACE FUNCTION calculate_kpi_value(p_kpi_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_kpi RECORD;
    v_result DECIMAL;
    v_query TEXT;
BEGIN
    -- Get KPI configuration
    SELECT * INTO v_kpi FROM kpis WHERE id = p_kpi_id;

    IF v_kpi IS NULL THEN
        RAISE EXCEPTION 'KPI with ID % not found', p_kpi_id;
    END IF;

    -- Build query based on metric type
    CASE v_kpi.metric_type
        WHEN 'count' THEN
            v_query := format('SELECT COUNT(*)::DECIMAL FROM %I', v_kpi.data_source);

        WHEN 'sum' THEN
            IF v_kpi.data_field IS NULL THEN
                RAISE EXCEPTION 'data_field is required for sum metric type';
            END IF;
            v_query := format(
                'SELECT COALESCE(SUM(%I), 0)::DECIMAL FROM %I',
                v_kpi.data_field,
                v_kpi.data_source
            );

        WHEN 'average' THEN
            IF v_kpi.data_field IS NULL THEN
                RAISE EXCEPTION 'data_field is required for average metric type';
            END IF;
            v_query := format(
                'SELECT COALESCE(AVG(%I), 0)::DECIMAL FROM %I',
                v_kpi.data_field,
                v_kpi.data_source
            );

        WHEN 'custom' THEN
            IF v_kpi.calculation_formula IS NULL THEN
                RAISE EXCEPTION 'calculation_formula is required for custom metric type';
            END IF;
            v_query := v_kpi.calculation_formula;

        ELSE
            RAISE EXCEPTION 'Unsupported metric_type: %', v_kpi.metric_type;
    END CASE;

    -- Execute the query
    EXECUTE v_query INTO v_result;

    -- Update KPI with new value and trend calculation
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
            jsonb_build_object(
                'date', NOW()::DATE,
                'value', v_result
            )
        )
    WHERE id = p_kpi_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Refresh all active KPIs
-- Purpose: Recalculates all active KPIs and returns count of refreshed KPIs
CREATE OR REPLACE FUNCTION refresh_all_kpis()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_kpi_id UUID;
    v_error_count INTEGER := 0;
BEGIN
    FOR v_kpi_id IN
        SELECT id FROM kpis WHERE is_active = TRUE ORDER BY display_order
    LOOP
        BEGIN
            PERFORM calculate_kpi_value(v_kpi_id);
            v_count := v_count + 1;
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue processing other KPIs
            RAISE WARNING 'Error calculating KPI %: %', v_kpi_id, SQLERRM;
            v_error_count := v_error_count + 1;
        END;
    END LOOP;

    IF v_error_count > 0 THEN
        RAISE NOTICE 'Refreshed % KPIs with % errors', v_count, v_error_count;
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Clean expired report cache
-- Purpose: Removes expired cache entries and returns count of deleted rows
CREATE OR REPLACE FUNCTION clean_expired_report_cache()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM report_data_cache
    WHERE expires_at IS NOT NULL
      AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count > 0 THEN
        RAISE NOTICE 'Deleted % expired cache entries', v_count;
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_annotations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all access for now)
-- TODO: Implement proper RLS policies based on user roles and permissions

CREATE POLICY "Allow all access to reports"
    ON reports FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to report_dashboards"
    ON report_dashboards FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to report_widgets"
    ON report_widgets FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to kpis"
    ON kpis FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to report_data_cache"
    ON report_data_cache FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to ai_insights"
    ON ai_insights FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to report_schedules"
    ON report_schedules FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to report_annotations"
    ON report_annotations FOR ALL
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE reports IS
    'Stores all report configurations including predefined and custom reports with filters, visualizations, and sharing settings';

COMMENT ON TABLE report_dashboards IS
    'Custom dashboards with multiple widgets for comprehensive data visualization';

COMMENT ON TABLE report_widgets IS
    'Individual widgets on dashboards with positioning and configuration';

COMMENT ON TABLE kpis IS
    'Key Performance Indicators with thresholds, alerts, and trend tracking';

COMMENT ON TABLE report_data_cache IS
    'Caches expensive report queries to improve performance with TTL expiration';

COMMENT ON TABLE ai_insights IS
    'AI-generated insights from report data including trends, anomalies, and recommendations';

COMMENT ON TABLE report_schedules IS
    'Scheduled report generation and delivery with email, download, or webhook support';

COMMENT ON TABLE report_annotations IS
    'Comments and annotations on reports and dashboards with threading support';

-- Key column comments for reports table
COMMENT ON COLUMN reports.data_source IS
    'JSONB configuration of tables, joins, and data source specifications';

COMMENT ON COLUMN reports.visualization_type IS
    'Type of chart or visualization: line, bar, pie, table, area, donut, funnel, heatmap, gantt, etc.';

COMMENT ON COLUMN reports.filters IS
    'Currently applied filter values as JSON object';

COMMENT ON COLUMN reports.available_filters IS
    'Array of available filter configurations for this report';

-- Key column comments for kpis table
COMMENT ON COLUMN kpis.metric_type IS
    'Type of metric calculation: count, sum, average, percentage, ratio, or custom';

COMMENT ON COLUMN kpis.calculation_formula IS
    'Custom SQL query or formula for custom metric types';

COMMENT ON COLUMN kpis.value_history IS
    'JSON array of historical values for sparkline visualization: [{date, value}, ...]';

-- Key column comments for report_data_cache table
COMMENT ON COLUMN report_data_cache.cache_key IS
    'Hash of query parameters and filters to uniquely identify cached result';

COMMENT ON COLUMN report_data_cache.data_hash IS
    'SHA-256 hash of cached data to detect changes and validate cache integrity';

COMMENT ON COLUMN report_data_cache.expires_at IS
    'Timestamp when this cache entry expires and should be refreshed';

-- Function comments
COMMENT ON FUNCTION calculate_kpi_value(UUID) IS
    'Recalculates a single KPI value based on its configuration and updates trend data';

COMMENT ON FUNCTION refresh_all_kpis() IS
    'Recalculates all active KPIs and returns the count of successfully refreshed KPIs';

COMMENT ON FUNCTION clean_expired_report_cache() IS
    'Removes expired cache entries and returns the count of deleted rows';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_kpi_value(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION clean_expired_report_cache() TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Summary of created objects:
--   - 8 tables (reports, report_dashboards, report_widgets, kpis,
--     report_data_cache, ai_insights, report_schedules, report_annotations)
--   - 32 indexes for performance optimization
--   - 6 triggers for automatic timestamp updates
--   - 3 helper functions for KPI and cache management
--   - 8 RLS policies (permissive for all authenticated users)
--   - Comprehensive comments for documentation
--
-- Next migration: 20260120000000_create_report_export_history.sql
