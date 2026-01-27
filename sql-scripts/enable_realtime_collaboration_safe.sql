-- =====================================================
-- ENABLE REALTIME FOR COLLABORATION TABLES (SAFE VERSION)
-- =====================================================
-- Run this after the migration_team_collaboration.sql
-- to enable real-time subscriptions on collaboration tables
-- This version safely checks if tables are already in the publication
-- =====================================================

-- Helper function to safely add table to realtime publication
DO $$
BEGIN
    -- Enable realtime for comments table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'comments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE comments;
        RAISE NOTICE 'Added comments to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'comments already in supabase_realtime publication - skipping';
    END IF;

    -- Enable realtime for mentions table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'mentions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE mentions;
        RAISE NOTICE 'Added mentions to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'mentions already in supabase_realtime publication - skipping';
    END IF;

    -- Enable realtime for notifications table
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
        RAISE NOTICE 'Added notifications to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'notifications already in supabase_realtime publication - skipping';
    END IF;

    -- Enable realtime for activity_log table (optional - can be high volume)
    -- Uncomment the block below if you want real-time activity updates:
    /*
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
    */
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this query to verify tables are in the publication:
SELECT tablename, schemaname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('comments', 'mentions', 'notifications', 'activity_log')
ORDER BY tablename;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- If you see the tables listed above, realtime is properly enabled.
-- Your collaboration features will now receive real-time updates.
-- =====================================================
