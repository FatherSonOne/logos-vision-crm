-- =====================================================
-- ENABLE REALTIME FOR ACTIVITY_LOG TABLE
-- =====================================================
-- This adds the activity_log table to realtime publication
-- Run this if you need real-time activity feed updates
-- WARNING: This table can be high volume, so only enable
-- if you need real-time activity updates in the UI
-- =====================================================

DO $$
BEGIN
    -- Enable realtime for activity_log table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'activity_log'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
        RAISE NOTICE 'Added activity_log to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'activity_log already in supabase_realtime publication - skipping';
    END IF;
END $$;

-- Verification
SELECT tablename, schemaname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'activity_log';

-- =====================================================
-- SUCCESS!
-- =====================================================
