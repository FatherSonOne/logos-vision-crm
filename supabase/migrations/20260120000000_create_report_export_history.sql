-- Migration: Create report export history and analytics
-- Description: Tracks all report exports with performance metrics and creates analytics views
-- Author: Backend Architect
-- Date: 2026-01-20

-- =============================================================================
-- Table: report_export_history
-- Purpose: Track all report exports with metadata and performance metrics
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_export_history (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    exported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Export metadata
    export_format TEXT NOT NULL CHECK (
        export_format IN ('pdf', 'excel', 'csv', 'png', 'jpeg', 'webp')
    ),
    exported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Performance metrics
    file_size_bytes INTEGER CHECK (file_size_bytes >= 0),
    row_count INTEGER CHECK (row_count >= 0),
    execution_time_ms INTEGER CHECK (execution_time_ms >= 0),

    -- Status tracking
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,

    -- Additional export configuration
    options JSONB,

    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Indexes for Performance Optimization
-- =============================================================================

-- Index for querying exports by report
CREATE INDEX idx_export_history_report
    ON report_export_history(report_id);

-- Index for querying exports by user
CREATE INDEX idx_export_history_user
    ON report_export_history(exported_by);

-- Index for analytics by format
CREATE INDEX idx_export_history_format
    ON report_export_history(export_format);

-- Index for time-based queries (most recent first)
CREATE INDEX idx_export_history_date
    ON report_export_history(exported_at DESC);

-- Composite index for user + date queries (common pattern)
CREATE INDEX idx_export_history_user_date
    ON report_export_history(exported_by, exported_at DESC);

-- Index for filtering successful exports
CREATE INDEX idx_export_history_success
    ON report_export_history(success, exported_at DESC);

-- =============================================================================
-- Trigger: Update timestamp on modification
-- =============================================================================

CREATE OR REPLACE FUNCTION update_export_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_export_history_timestamp
    BEFORE UPDATE ON report_export_history
    FOR EACH ROW
    EXECUTE FUNCTION update_export_history_updated_at();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS on the table
ALTER TABLE report_export_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own export history
CREATE POLICY "Users can view their own export history"
    ON report_export_history
    FOR SELECT
    USING (auth.uid() = exported_by);

-- Policy: Users can insert their own export history
CREATE POLICY "Users can insert their own export history"
    ON report_export_history
    FOR INSERT
    WITH CHECK (auth.uid() = exported_by);

-- Policy: Users cannot update export history (audit trail integrity)
-- No update policy = no updates allowed

-- Policy: Users cannot delete export history (audit trail integrity)
-- No delete policy = no deletes allowed

-- =============================================================================
-- Analytics View: export_analytics
-- Purpose: Aggregated export statistics by format
-- =============================================================================

CREATE OR REPLACE VIEW export_analytics AS
SELECT
    export_format,
    COUNT(*) AS total_exports,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) AS successful_exports,
    SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) AS failed_exports,
    ROUND(AVG(execution_time_ms)::NUMERIC, 2) AS avg_execution_time_ms,
    ROUND(AVG(file_size_bytes)::NUMERIC, 2) AS avg_file_size_bytes,
    ROUND(AVG(row_count)::NUMERIC, 2) AS avg_row_count,
    MIN(exported_at) AS first_export_date,
    MAX(exported_at) AS last_export_date,
    SUM(file_size_bytes) AS total_bytes_exported,
    ROUND(
        (SUM(CASE WHEN success THEN 1 ELSE 0 END)::NUMERIC /
         NULLIF(COUNT(*), 0) * 100),
        2
    ) AS success_rate_percent
FROM report_export_history
GROUP BY export_format
ORDER BY total_exports DESC;

-- =============================================================================
-- Analytics View: export_analytics_by_user
-- Purpose: Export statistics per user for usage tracking
-- =============================================================================

CREATE OR REPLACE VIEW export_analytics_by_user AS
SELECT
    exported_by AS user_id,
    COUNT(*) AS total_exports,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) AS successful_exports,
    COUNT(DISTINCT report_id) AS unique_reports_exported,
    COUNT(DISTINCT export_format) AS formats_used,
    ROUND(AVG(execution_time_ms)::NUMERIC, 2) AS avg_execution_time_ms,
    SUM(file_size_bytes) AS total_bytes_exported,
    MIN(exported_at) AS first_export_date,
    MAX(exported_at) AS last_export_date
FROM report_export_history
GROUP BY exported_by
ORDER BY total_exports DESC;

-- =============================================================================
-- Analytics View: export_analytics_by_report
-- Purpose: Export statistics per report for popularity tracking
-- =============================================================================

CREATE OR REPLACE VIEW export_analytics_by_report AS
SELECT
    reh.report_id,
    r.name AS report_name,
    r.report_type AS report_type,
    COUNT(*) AS total_exports,
    COUNT(DISTINCT reh.exported_by) AS unique_exporters,
    COUNT(DISTINCT reh.export_format) AS formats_used,
    ROUND(AVG(reh.execution_time_ms)::NUMERIC, 2) AS avg_execution_time_ms,
    MAX(reh.exported_at) AS last_exported_at
FROM report_export_history reh
JOIN reports r ON r.id = reh.report_id
GROUP BY reh.report_id, r.name, r.report_type
ORDER BY total_exports DESC;

-- =============================================================================
-- Analytics View: export_analytics_daily
-- Purpose: Daily export trends for monitoring
-- =============================================================================

CREATE OR REPLACE VIEW export_analytics_daily AS
SELECT
    DATE(exported_at) AS export_date,
    export_format,
    COUNT(*) AS total_exports,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) AS successful_exports,
    ROUND(AVG(execution_time_ms)::NUMERIC, 2) AS avg_execution_time_ms,
    SUM(file_size_bytes) AS total_bytes_exported
FROM report_export_history
WHERE exported_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(exported_at), export_format
ORDER BY export_date DESC, export_format;

-- =============================================================================
-- Helper Function: Get user export statistics
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_export_stats(user_id UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_exports BIGINT,
    successful_exports BIGINT,
    failed_exports BIGINT,
    most_used_format TEXT,
    total_size_mb NUMERIC,
    avg_execution_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_exports,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) AS successful_exports,
        SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) AS failed_exports,
        MODE() WITHIN GROUP (ORDER BY export_format) AS most_used_format,
        ROUND((SUM(file_size_bytes) / 1048576.0)::NUMERIC, 2) AS total_size_mb,
        ROUND(AVG(execution_time_ms)::NUMERIC, 2) AS avg_execution_time_ms
    FROM report_export_history
    WHERE exported_by = user_id
      AND exported_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Helper Function: Get report export statistics
-- =============================================================================

CREATE OR REPLACE FUNCTION get_report_export_stats(p_report_id UUID)
RETURNS TABLE (
    total_exports BIGINT,
    unique_users BIGINT,
    most_popular_format TEXT,
    last_exported_at TIMESTAMP WITH TIME ZONE,
    avg_execution_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_exports,
        COUNT(DISTINCT exported_by) AS unique_users,
        MODE() WITHIN GROUP (ORDER BY export_format) AS most_popular_format,
        MAX(exported_at) AS last_exported_at,
        ROUND(AVG(execution_time_ms)::NUMERIC, 2) AS avg_execution_time_ms
    FROM report_export_history
    WHERE report_id = p_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE report_export_history IS 'Audit trail of all report exports with performance metrics';
COMMENT ON COLUMN report_export_history.id IS 'Unique identifier for each export record';
COMMENT ON COLUMN report_export_history.report_id IS 'Reference to the exported report';
COMMENT ON COLUMN report_export_history.exported_by IS 'User who performed the export';
COMMENT ON COLUMN report_export_history.export_format IS 'Format of the export (pdf, excel, csv, png, jpeg, webp)';
COMMENT ON COLUMN report_export_history.exported_at IS 'Timestamp when export was performed';
COMMENT ON COLUMN report_export_history.file_size_bytes IS 'Size of exported file in bytes';
COMMENT ON COLUMN report_export_history.row_count IS 'Number of data rows in the export';
COMMENT ON COLUMN report_export_history.execution_time_ms IS 'Time taken to generate export in milliseconds';
COMMENT ON COLUMN report_export_history.success IS 'Whether the export completed successfully';
COMMENT ON COLUMN report_export_history.error_message IS 'Error details if export failed';
COMMENT ON COLUMN report_export_history.options IS 'JSON object containing export configuration options';

COMMENT ON VIEW export_analytics IS 'Aggregated export statistics by format';
COMMENT ON VIEW export_analytics_by_user IS 'Export statistics per user for usage tracking';
COMMENT ON VIEW export_analytics_by_report IS 'Export statistics per report for popularity tracking';
COMMENT ON VIEW export_analytics_daily IS 'Daily export trends for the last 90 days';

-- =============================================================================
-- Grant Permissions
-- =============================================================================

-- Grant read access to analytics views for authenticated users
GRANT SELECT ON export_analytics TO authenticated;
GRANT SELECT ON export_analytics_by_user TO authenticated;
GRANT SELECT ON export_analytics_by_report TO authenticated;
GRANT SELECT ON export_analytics_daily TO authenticated;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_user_export_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_report_export_stats(UUID) TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
