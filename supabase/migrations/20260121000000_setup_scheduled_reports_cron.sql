-- =============================================================================
-- Migration: Setup Scheduled Reports with pg_cron
-- Description: Install pg_cron extension and create cron job for report execution
-- Author: Backend Architect
-- Date: 2026-01-21
-- Version: 1.0.0
-- =============================================================================
--
-- This migration sets up automated execution of scheduled reports using pg_cron.
-- The cron job runs every 15 minutes to check for and execute due report schedules.
--
-- Prerequisites:
--   - PostgreSQL 12+ with pg_cron extension available
--   - Supabase Edge Function 'execute-scheduled-reports' deployed
--   - report_schedules table exists (created in 20260119000000_create_reports_hub.sql)
--
-- =============================================================================

-- =============================================================================
-- 1. INSTALL PG_CRON EXTENSION
-- =============================================================================

-- Enable pg_cron extension
-- Note: On Supabase, pg_cron runs in a separate database and requires special setup
-- This extension allows scheduling recurring jobs directly in PostgreSQL

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to postgres role (required for cron jobs)
GRANT USAGE ON SCHEMA cron TO postgres;

-- =============================================================================
-- 2. CREATE HELPER FUNCTION TO INVOKE EDGE FUNCTION
-- =============================================================================

-- Function to call the execute-scheduled-reports edge function
-- This function uses http extension to invoke the Supabase Edge Function

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION invoke_scheduled_reports_execution()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_supabase_url TEXT;
    v_anon_key TEXT;
    v_function_url TEXT;
    v_response TEXT;
BEGIN
    -- Get Supabase URL from environment
    -- In production, these would be set via Supabase dashboard or vault
    v_supabase_url := current_setting('app.settings.supabase_url', true);
    v_anon_key := current_setting('app.settings.supabase_anon_key', true);

    IF v_supabase_url IS NULL THEN
        RAISE WARNING 'Supabase URL not configured. Skipping scheduled report execution.';
        RETURN;
    END IF;

    -- Construct edge function URL
    v_function_url := v_supabase_url || '/functions/v1/execute-scheduled-reports';

    -- Call the edge function using HTTP POST
    -- Note: This requires the http extension
    BEGIN
        SELECT content::text INTO v_response
        FROM http((
            'POST',
            v_function_url,
            ARRAY[
                http_header('Authorization', 'Bearer ' || COALESCE(v_anon_key, '')),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            '{}'
        )::http_request);

        RAISE NOTICE 'Scheduled reports execution response: %', v_response;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error invoking scheduled reports execution: %', SQLERRM;
    END;
END;
$$;

COMMENT ON FUNCTION invoke_scheduled_reports_execution() IS
    'Invokes the execute-scheduled-reports Supabase Edge Function via HTTP to process due report schedules';

-- =============================================================================
-- 3. ALTERNATIVE: DIRECT DATABASE TRIGGER APPROACH
-- =============================================================================

-- For environments where HTTP extension is not available or edge function
-- invocation is restricted, we can use a simpler approach with a database function
-- that marks schedules as "pending" and relies on application-level polling

CREATE OR REPLACE FUNCTION mark_due_schedules_for_execution()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Update all active schedules that are due to run
    WITH due_schedules AS (
        UPDATE report_schedules
        SET last_status = 'pending'
        WHERE is_active = TRUE
          AND next_run_at IS NOT NULL
          AND next_run_at <= NOW()
          AND (last_status IS NULL OR last_status != 'pending')
        RETURNING id
    )
    SELECT COUNT(*) INTO v_updated_count FROM due_schedules;

    IF v_updated_count > 0 THEN
        RAISE NOTICE 'Marked % schedules as pending execution', v_updated_count;
    END IF;

    RETURN v_updated_count;
END;
$$;

COMMENT ON FUNCTION mark_due_schedules_for_execution() IS
    'Marks all active schedules that are due for execution as pending. Application should poll for pending schedules and execute them.';

-- =============================================================================
-- 4. CREATE CRON JOBS
-- =============================================================================

-- Note: On Supabase, pg_cron jobs need to be created using the Supabase CLI or dashboard
-- The following commands are for reference and may need to be executed separately

-- Schedule the edge function invocation to run every 15 minutes
-- This provides a good balance between responsiveness and resource usage

DO $$
BEGIN
    -- Remove existing job if it exists
    PERFORM cron.unschedule('execute-scheduled-reports');
EXCEPTION
    WHEN undefined_table THEN
        -- cron schema doesn't exist, skip
        RAISE NOTICE 'pg_cron not available, skipping job creation';
        RETURN;
    WHEN OTHERS THEN
        -- Job doesn't exist, continue
        NULL;
END;
$$;

-- Create the cron job
-- Runs every 15 minutes (at :00, :15, :30, :45)
DO $$
BEGIN
    PERFORM cron.schedule(
        'execute-scheduled-reports',           -- Job name
        '*/15 * * * *',                        -- Every 15 minutes
        $$SELECT invoke_scheduled_reports_execution()$$
    );
    RAISE NOTICE 'Created cron job: execute-scheduled-reports (runs every 15 minutes)';
EXCEPTION
    WHEN undefined_table THEN
        RAISE WARNING 'pg_cron not available. Using fallback approach with mark_due_schedules_for_execution()';

        -- Create a simpler job that marks schedules as pending
        PERFORM cron.schedule(
            'mark-due-schedules',
            '*/15 * * * *',
            $$SELECT mark_due_schedules_for_execution()$$
        );
        RAISE NOTICE 'Created fallback cron job: mark-due-schedules (runs every 15 minutes)';
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create cron job: %', SQLERRM;
END;
$$;

-- =============================================================================
-- 5. CREATE TRIGGER TO AUTO-CALCULATE NEXT_RUN_AT
-- =============================================================================

-- Trigger function to automatically calculate next_run_at when schedule is created or updated
CREATE OR REPLACE FUNCTION auto_calculate_next_run()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_next_run TIMESTAMP WITH TIME ZONE;
    v_base_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Skip if schedule is not active
    IF NOT NEW.is_active THEN
        RETURN NEW;
    END IF;

    -- Use current time or last_run_at as base
    v_base_time := COALESCE(NEW.last_run_at, NOW());

    -- Calculate next run based on schedule type
    CASE NEW.schedule_type
        WHEN 'once' THEN
            -- For one-time schedules, use the scheduled_date
            v_next_run := NEW.scheduled_date::DATE + NEW.schedule_time::TIME;

        WHEN 'daily' THEN
            -- Run every day at schedule_time
            v_next_run := date_trunc('day', v_base_time) + NEW.schedule_time::TIME;
            IF v_next_run <= v_base_time THEN
                v_next_run := v_next_run + INTERVAL '1 day';
            END IF;

        WHEN 'weekly' THEN
            -- Run every week on schedule_day_of_week
            v_next_run := date_trunc('week', v_base_time)
                        + (COALESCE(NEW.schedule_day_of_week, 0) || ' days')::INTERVAL
                        + NEW.schedule_time::TIME;
            WHILE v_next_run <= v_base_time LOOP
                v_next_run := v_next_run + INTERVAL '1 week';
            END LOOP;

        WHEN 'monthly' THEN
            -- Run every month on schedule_day_of_month
            v_next_run := date_trunc('month', v_base_time)
                        + ((COALESCE(NEW.schedule_day_of_month, 1) - 1) || ' days')::INTERVAL
                        + NEW.schedule_time::TIME;
            WHILE v_next_run <= v_base_time LOOP
                v_next_run := v_next_run + INTERVAL '1 month';
            END LOOP;

        WHEN 'quarterly' THEN
            -- Run every quarter (3 months) on schedule_day_of_month
            v_next_run := date_trunc('quarter', v_base_time)
                        + ((COALESCE(NEW.schedule_day_of_month, 1) - 1) || ' days')::INTERVAL
                        + NEW.schedule_time::TIME;
            WHILE v_next_run <= v_base_time LOOP
                v_next_run := v_next_run + INTERVAL '3 months';
            END LOOP;

        WHEN 'annually' THEN
            -- Run once a year on schedule_month and schedule_day_of_month
            v_next_run := make_date(
                EXTRACT(YEAR FROM v_base_time)::INTEGER,
                COALESCE(NEW.schedule_month, 1),
                COALESCE(NEW.schedule_day_of_month, 1)
            )::TIMESTAMP + NEW.schedule_time::TIME;

            IF v_next_run <= v_base_time THEN
                v_next_run := make_date(
                    EXTRACT(YEAR FROM v_base_time)::INTEGER + 1,
                    COALESCE(NEW.schedule_month, 1),
                    COALESCE(NEW.schedule_day_of_month, 1)
                )::TIMESTAMP + NEW.schedule_time::TIME;
            END IF;

        ELSE
            RAISE EXCEPTION 'Unsupported schedule type: %', NEW.schedule_type;
    END CASE;

    -- Set the calculated next_run_at
    NEW.next_run_at := v_next_run;

    RETURN NEW;
END;
$$;

-- Apply trigger to report_schedules table
DROP TRIGGER IF EXISTS trigger_auto_calculate_next_run ON report_schedules;
CREATE TRIGGER trigger_auto_calculate_next_run
    BEFORE INSERT OR UPDATE OF schedule_type, schedule_time, schedule_day_of_week,
                                schedule_day_of_month, schedule_month, scheduled_date,
                                is_active, last_run_at
    ON report_schedules
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_next_run();

COMMENT ON TRIGGER trigger_auto_calculate_next_run ON report_schedules IS
    'Automatically calculates next_run_at when schedule configuration changes';

-- =============================================================================
-- 6. CREATE STORAGE BUCKET FOR REPORT EXPORTS
-- =============================================================================

-- Create storage bucket for report exports
-- Note: This requires the storage schema to be available

DO $$
BEGIN
    -- Insert bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'report-exports',
        'report-exports',
        true,  -- Public bucket for easy access
        52428800,  -- 50MB file size limit
        ARRAY['text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json', 'image/png']
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Created storage bucket: report-exports';
EXCEPTION
    WHEN undefined_table THEN
        RAISE WARNING 'Storage schema not available. Please create bucket manually via Supabase dashboard.';
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create storage bucket: %', SQLERRM;
END;
$$;

-- Create RLS policies for report-exports bucket
DO $$
BEGIN
    -- Allow authenticated users to read
    CREATE POLICY "Allow authenticated users to read report exports"
        ON storage.objects FOR SELECT
        USING (
            bucket_id = 'report-exports' AND
            auth.role() = 'authenticated'
        );

    -- Allow service role to insert/update/delete
    CREATE POLICY "Allow service role to manage report exports"
        ON storage.objects FOR ALL
        USING (
            bucket_id = 'report-exports' AND
            auth.role() = 'service_role'
        );

    RAISE NOTICE 'Created RLS policies for report-exports bucket';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Storage policies already exist';
    WHEN undefined_table THEN
        RAISE WARNING 'Storage policies could not be created';
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create storage policies: %', SQLERRM;
END;
$$;

-- =============================================================================
-- 7. GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions to authenticated and service roles
GRANT EXECUTE ON FUNCTION invoke_scheduled_reports_execution() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_due_schedules_for_execution() TO authenticated, service_role;

-- =============================================================================
-- 8. CREATE MONITORING VIEW
-- =============================================================================

-- View to monitor scheduled report execution status
CREATE OR REPLACE VIEW scheduled_reports_status AS
SELECT
    rs.id AS schedule_id,
    r.name AS report_name,
    rs.schedule_type,
    rs.is_active,
    rs.last_run_at,
    rs.next_run_at,
    rs.run_count,
    rs.last_status,
    rs.last_error,
    CASE
        WHEN rs.next_run_at IS NULL THEN 'No next run scheduled'
        WHEN rs.next_run_at <= NOW() THEN 'Overdue'
        WHEN rs.next_run_at <= NOW() + INTERVAL '1 hour' THEN 'Due soon'
        ELSE 'Scheduled'
    END AS status,
    EXTRACT(EPOCH FROM (rs.next_run_at - NOW()))/60 AS minutes_until_next_run,
    rs.delivery_method,
    rs.export_format,
    rs.recipients,
    rs.created_at,
    rs.updated_at
FROM report_schedules rs
JOIN reports r ON rs.report_id = r.id
ORDER BY rs.next_run_at ASC NULLS LAST;

COMMENT ON VIEW scheduled_reports_status IS
    'Monitoring view for scheduled report execution status with human-readable status indicators';

-- =============================================================================
-- 9. UTILITY FUNCTIONS
-- =============================================================================

-- Function to manually trigger a schedule execution (for testing)
CREATE OR REPLACE FUNCTION trigger_schedule_now(p_schedule_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Set next_run_at to now to trigger immediate execution
    UPDATE report_schedules
    SET next_run_at = NOW()
    WHERE id = p_schedule_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Schedule not found'
        );
    END IF;

    -- Invoke execution
    PERFORM invoke_scheduled_reports_execution();

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Schedule triggered for immediate execution'
    );
END;
$$;

COMMENT ON FUNCTION trigger_schedule_now(UUID) IS
    'Manually trigger a schedule to execute immediately (for testing purposes)';

GRANT EXECUTE ON FUNCTION trigger_schedule_now(UUID) TO authenticated;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON EXTENSION pg_cron IS
    'PostgreSQL extension for scheduling jobs to run at specific times using cron syntax';

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Summary of created objects:
--   - pg_cron extension installed
--   - invoke_scheduled_reports_execution() function to call edge function
--   - mark_due_schedules_for_execution() function as fallback
--   - Cron job scheduled to run every 15 minutes
--   - auto_calculate_next_run() trigger for automatic next_run_at calculation
--   - report-exports storage bucket with RLS policies
--   - scheduled_reports_status monitoring view
--   - trigger_schedule_now() utility function for manual testing
--
-- Next steps:
--   1. Deploy the execute-scheduled-reports edge function
--   2. Configure Supabase environment variables (supabase_url, supabase_anon_key)
--   3. Test with: SELECT trigger_schedule_now('<schedule_id>');
--   4. Monitor with: SELECT * FROM scheduled_reports_status;
--
-- Maintenance:
--   - Clean old exports: DELETE FROM storage.objects WHERE bucket_id = 'report-exports' AND created_at < NOW() - INTERVAL '90 days';
--   - View cron job status: SELECT * FROM cron.job;
--   - View cron job run history: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
