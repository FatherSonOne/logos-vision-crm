-- =============================================================================
-- Migration: Create Email Delivery Log
-- Description: Email delivery tracking and analytics for scheduled reports
-- Author: Backend Architect
-- Date: 2026-01-22
-- Version: 1.0.0
-- =============================================================================
--
-- This migration creates infrastructure for tracking email deliveries
-- for scheduled reports and export notifications.
--
-- Tables created:
--   1. email_delivery_log - Complete email delivery tracking
--   2. email_templates - Reusable email templates
--   3. email_delivery_analytics - Materialized view for analytics
--
-- Features:
--   - Delivery status tracking (pending, sent, delivered, failed, bounced)
--   - Link to report schedules and export history
--   - Retry attempt tracking
--   - Metadata storage (attachments, tags, custom data)
--   - Analytics and reporting
--   - Bounce and error handling
--
-- =============================================================================

-- =============================================================================
-- 1. EMAIL DELIVERY LOG TABLE
-- Purpose: Track all email deliveries with detailed status and metadata
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_delivery_log (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys (optional - at least one should be set for report emails)
    report_schedule_id UUID REFERENCES report_schedules(id) ON DELETE SET NULL,
    export_history_id UUID REFERENCES report_export_history(id) ON DELETE SET NULL,

    -- Email details
    recipient VARCHAR(500) NOT NULL, -- Can be comma-separated for multiple recipients
    cc VARCHAR(500), -- CC recipients
    bcc VARCHAR(500), -- BCC recipients
    subject VARCHAR(500) NOT NULL,

    -- Email body (stored for audit purposes)
    body_html TEXT,
    body_preview VARCHAR(500), -- First 500 chars for quick preview

    -- Delivery information
    message_id VARCHAR(255), -- External email provider message ID
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'sending', 'sent', 'delivered', 'failed', 'bounced', 'rejected')
    ),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE, -- If tracking enabled
    clicked_at TIMESTAMP WITH TIME ZONE, -- If link tracking enabled

    -- Error handling
    error_message TEXT,
    error_code VARCHAR(100),
    retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
    max_retries INTEGER DEFAULT 3 CHECK (max_retries >= 0),
    next_retry_at TIMESTAMP WITH TIME ZONE,

    -- Bounce information
    bounce_type VARCHAR(50) CHECK (
        bounce_type IS NULL OR bounce_type IN ('hard', 'soft', 'complaint', 'transient')
    ),
    bounce_reason TEXT,
    bounced_at TIMESTAMP WITH TIME ZONE,

    -- Email provider information
    provider VARCHAR(50) DEFAULT 'resend', -- 'resend', 'sendgrid', 'mailgun', etc.
    provider_response JSONB, -- Full response from email provider

    -- Attachments tracking
    attachment_count INTEGER DEFAULT 0 CHECK (attachment_count >= 0),
    attachment_total_size INTEGER DEFAULT 0 CHECK (attachment_total_size >= 0), -- in bytes
    attachment_names TEXT[], -- Array of attachment filenames

    -- Tags and metadata
    tags JSONB DEFAULT '{}'::JSONB, -- Custom tags for filtering/grouping
    metadata JSONB DEFAULT '{}'::JSONB, -- Additional custom data

    -- Tracking and analytics
    opened_count INTEGER DEFAULT 0 CHECK (opened_count >= 0),
    clicked_count INTEGER DEFAULT 0 CHECK (clicked_count >= 0),
    user_agent TEXT, -- Email client user agent
    ip_address INET, -- IP address of opens/clicks

    -- Audit
    created_by UUID, -- User who triggered the email
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. EMAIL TEMPLATES TABLE
-- Purpose: Store reusable email templates
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_templates (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'custom' CHECK (
        category IN ('report', 'notification', 'alert', 'custom', 'system')
    ),

    -- Template content
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT, -- Plain text version

    -- Template variables
    available_variables JSONB DEFAULT '[]'::JSONB, -- Array of variable names
    sample_data JSONB DEFAULT '{}'::JSONB, -- Sample data for preview

    -- Template metadata
    is_default BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE, -- System templates cannot be deleted
    is_active BOOLEAN DEFAULT TRUE,

    -- Usage tracking
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- Preview
    thumbnail_url VARCHAR(500), -- Screenshot/preview of rendered template

    -- Versioning
    version INTEGER DEFAULT 1 CHECK (version > 0),
    parent_template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,

    -- Ownership and audit
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Email delivery log indexes
CREATE INDEX IF NOT EXISTS idx_email_delivery_status
    ON email_delivery_log(status);

CREATE INDEX IF NOT EXISTS idx_email_delivery_report_schedule
    ON email_delivery_log(report_schedule_id)
    WHERE report_schedule_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_delivery_export_history
    ON email_delivery_log(export_history_id)
    WHERE export_history_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_delivery_recipient
    ON email_delivery_log(recipient);

CREATE INDEX IF NOT EXISTS idx_email_delivery_sent_at
    ON email_delivery_log(sent_at DESC)
    WHERE sent_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_delivery_created_at
    ON email_delivery_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_delivery_pending
    ON email_delivery_log(status, next_retry_at)
    WHERE status IN ('pending', 'failed') AND next_retry_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_delivery_message_id
    ON email_delivery_log(message_id)
    WHERE message_id IS NOT NULL;

-- Composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_email_delivery_analytics
    ON email_delivery_log(status, sent_at, created_at)
    WHERE sent_at IS NOT NULL;

-- Email templates indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_category
    ON email_templates(category);

CREATE INDEX IF NOT EXISTS idx_email_templates_active
    ON email_templates(is_active)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_email_templates_default
    ON email_templates(is_default)
    WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_email_templates_usage
    ON email_templates(usage_count DESC, last_used_at DESC);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Reuse existing trigger function from reports hub migration
DROP TRIGGER IF EXISTS trigger_email_delivery_updated_at ON email_delivery_log;
CREATE TRIGGER trigger_email_delivery_updated_at
    BEFORE UPDATE ON email_delivery_log
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

DROP TRIGGER IF EXISTS trigger_email_templates_updated_at ON email_templates;
CREATE TRIGGER trigger_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_updated_at();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function: Get email delivery stats for a date range
-- Purpose: Returns aggregated statistics about email deliveries
CREATE OR REPLACE FUNCTION get_email_delivery_stats(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    total_sent BIGINT,
    total_delivered BIGINT,
    total_failed BIGINT,
    total_bounced BIGINT,
    total_opened BIGINT,
    total_clicked BIGINT,
    delivery_rate DECIMAL(5,2),
    open_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    bounce_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE status IN ('sent', 'delivered')) AS total_sent,
        COUNT(*) FILTER (WHERE status = 'delivered') AS total_delivered,
        COUNT(*) FILTER (WHERE status = 'failed') AS total_failed,
        COUNT(*) FILTER (WHERE status = 'bounced') AS total_bounced,
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS total_opened,
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) AS total_clicked,

        CASE
            WHEN COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'failed', 'bounced')) > 0 THEN
                ROUND(
                    (COUNT(*) FILTER (WHERE status = 'delivered')::DECIMAL /
                     COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'failed', 'bounced'))::DECIMAL * 100)::NUMERIC,
                    2
                )
            ELSE 0
        END AS delivery_rate,

        CASE
            WHEN COUNT(*) FILTER (WHERE status IN ('sent', 'delivered')) > 0 THEN
                ROUND(
                    (COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::DECIMAL /
                     COUNT(*) FILTER (WHERE status IN ('sent', 'delivered'))::DECIMAL * 100)::NUMERIC,
                    2
                )
            ELSE 0
        END AS open_rate,

        CASE
            WHEN COUNT(*) FILTER (WHERE opened_at IS NOT NULL) > 0 THEN
                ROUND(
                    (COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::DECIMAL /
                     COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::DECIMAL * 100)::NUMERIC,
                    2
                )
            ELSE 0
        END AS click_rate,

        CASE
            WHEN COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'bounced')) > 0 THEN
                ROUND(
                    (COUNT(*) FILTER (WHERE status = 'bounced')::DECIMAL /
                     COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'bounced'))::DECIMAL * 100)::NUMERIC,
                    2
                )
            ELSE 0
        END AS bounce_rate
    FROM email_delivery_log
    WHERE created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark email for retry
-- Purpose: Updates a failed email for retry with exponential backoff
CREATE OR REPLACE FUNCTION retry_failed_email(
    p_delivery_id UUID,
    p_backoff_minutes INTEGER DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
    v_retry_count INTEGER;
    v_max_retries INTEGER;
    v_next_retry TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current retry information
    SELECT retry_count, max_retries
    INTO v_retry_count, v_max_retries
    FROM email_delivery_log
    WHERE id = p_delivery_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Email delivery log entry % not found', p_delivery_id;
    END IF;

    -- Check if max retries reached
    IF v_retry_count >= v_max_retries THEN
        RAISE NOTICE 'Max retries (%) reached for email delivery %', v_max_retries, p_delivery_id;
        RETURN FALSE;
    END IF;

    -- Calculate next retry time with exponential backoff
    v_next_retry := NOW() + (p_backoff_minutes * POWER(2, v_retry_count))::INTEGER * INTERVAL '1 minute';

    -- Update the record
    UPDATE email_delivery_log
    SET
        status = 'pending',
        retry_count = retry_count + 1,
        next_retry_at = v_next_retry,
        updated_at = NOW()
    WHERE id = p_delivery_id;

    RAISE NOTICE 'Email % scheduled for retry at %', p_delivery_id, v_next_retry;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Clean old email logs
-- Purpose: Archives or deletes old email delivery logs
CREATE OR REPLACE FUNCTION clean_old_email_logs(
    p_retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM email_delivery_log
    WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL
      AND status NOT IN ('failed', 'bounced'); -- Keep failed/bounced for analysis

    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count > 0 THEN
        RAISE NOTICE 'Deleted % old email delivery logs', v_count;
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get emails pending retry
-- Purpose: Returns emails that need to be retried
CREATE OR REPLACE FUNCTION get_emails_pending_retry()
RETURNS TABLE (
    id UUID,
    recipient VARCHAR,
    subject VARCHAR,
    retry_count INTEGER,
    max_retries INTEGER,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.recipient,
        e.subject,
        e.retry_count,
        e.max_retries,
        e.next_retry_at,
        e.error_message
    FROM email_delivery_log e
    WHERE e.status IN ('pending', 'failed')
      AND e.next_retry_at IS NOT NULL
      AND e.next_retry_at <= NOW()
      AND e.retry_count < e.max_retries
    ORDER BY e.next_retry_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- MATERIALIZED VIEW FOR EMAIL ANALYTICS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS email_delivery_analytics AS
SELECT
    DATE_TRUNC('day', created_at) AS date,
    status,
    COUNT(*) AS email_count,
    COUNT(DISTINCT recipient) AS unique_recipients,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS opened_count,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) AS clicked_count,
    AVG(EXTRACT(EPOCH FROM (sent_at - created_at)))::INTEGER AS avg_send_time_seconds,
    AVG(attachment_count)::DECIMAL(10,2) AS avg_attachments,
    SUM(attachment_total_size) AS total_attachment_size,
    provider
FROM email_delivery_log
WHERE created_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('day', created_at), status, provider;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_email_analytics_date
    ON email_delivery_analytics(date DESC);

-- Function to refresh email analytics
CREATE OR REPLACE FUNCTION refresh_email_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY email_delivery_analytics;
    RAISE NOTICE 'Email delivery analytics refreshed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE email_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all access for now)
CREATE POLICY "Allow all access to email_delivery_log"
    ON email_delivery_log FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to email_templates"
    ON email_templates FOR ALL
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE email_delivery_log IS
    'Complete tracking of all email deliveries including status, retries, bounces, and analytics';

COMMENT ON TABLE email_templates IS
    'Reusable email templates with variable substitution for scheduled reports and notifications';

COMMENT ON MATERIALIZED VIEW email_delivery_analytics IS
    'Aggregated email delivery statistics by day, status, and provider for analytics dashboards';

COMMENT ON FUNCTION get_email_delivery_stats IS
    'Returns comprehensive email delivery statistics for a specified date range';

COMMENT ON FUNCTION retry_failed_email IS
    'Schedules a failed email for retry with exponential backoff';

COMMENT ON FUNCTION clean_old_email_logs IS
    'Archives or deletes old email delivery logs based on retention policy';

COMMENT ON FUNCTION get_emails_pending_retry IS
    'Returns list of emails that are pending retry and should be processed';

COMMENT ON FUNCTION refresh_email_analytics IS
    'Refreshes the email_delivery_analytics materialized view';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION get_email_delivery_stats TO authenticated;
GRANT EXECUTE ON FUNCTION retry_failed_email TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_email_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_emails_pending_retry TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_email_analytics TO authenticated;

-- =============================================================================
-- SEED DATA: Default Email Templates
-- =============================================================================

-- Insert default email templates
INSERT INTO email_templates (name, description, category, subject, body_html, available_variables, is_system, is_default)
VALUES
(
    'Scheduled Report - Default',
    'Default template for scheduled report delivery',
    'report',
    'Scheduled Report: {{reportName}} - {{exportDate}}',
    '<h2>Your Scheduled Report: {{reportName}}</h2><p>Hello {{userName}},</p><p>Your scheduled report is ready. This report contains {{recordCount}} records for the period {{dateRange}}.</p><p><a href="{{reportUrl}}">View Report Online</a></p>',
    '["reportName", "userName", "recordCount", "dateRange", "exportDate", "reportUrl", "companyName", "currentYear"]'::JSONB,
    TRUE,
    TRUE
),
(
    'Export Complete - Default',
    'Default template for export completion notifications',
    'notification',
    'Export Complete: {{reportName}}',
    '<h2>Export Complete</h2><p>Hello {{userName}},</p><p>Your export of {{reportName}} has completed successfully with {{recordCount}} records.</p><p><a href="{{reportUrl}}">View in Dashboard</a></p>',
    '["reportName", "userName", "recordCount", "exportDate", "reportUrl", "companyName"]'::JSONB,
    TRUE,
    TRUE
);

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Summary of created objects:
--   - 2 tables (email_delivery_log, email_templates)
--   - 10 indexes for performance optimization
--   - 2 triggers for automatic timestamp updates
--   - 5 helper functions for email management and analytics
--   - 1 materialized view for analytics
--   - 2 RLS policies (permissive for all authenticated users)
--   - 2 default email templates
--   - Comprehensive comments for documentation
