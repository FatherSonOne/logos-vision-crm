-- =====================================================
-- VERIFY TEAM COLLABORATION SETUP
-- =====================================================
-- Run this to verify all tables, policies, and realtime
-- are properly configured for team collaboration
-- =====================================================

-- 1. Check that all tables exist
SELECT
    'Tables Check' as check_type,
    CASE
        WHEN COUNT(*) = 6 THEN '✅ All 6 tables exist'
        ELSE '❌ Missing tables: ' || (6 - COUNT(*))::text
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'comments',
    'mentions',
    'notifications',
    'activity_log',
    'notification_preferences',
    'entity_watchers'
);

-- 2. List all collaboration tables with row counts
SELECT
    'Table Details' as check_type,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
    'comments',
    'mentions',
    'notifications',
    'activity_log',
    'notification_preferences',
    'entity_watchers'
)
ORDER BY table_name;

-- 3. Check RLS is enabled
SELECT
    'RLS Check' as check_type,
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'comments',
    'mentions',
    'notifications',
    'activity_log',
    'notification_preferences',
    'entity_watchers'
)
ORDER BY tablename;

-- 4. Check realtime publication
SELECT
    'Realtime Check' as check_type,
    tablename,
    '✅ Realtime enabled' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN (
    'comments',
    'mentions',
    'notifications',
    'activity_log'
)
ORDER BY tablename;

-- 5. Count policies
SELECT
    'Policies Check' as check_type,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'comments',
    'mentions',
    'notifications',
    'activity_log',
    'notification_preferences',
    'entity_watchers'
)
GROUP BY tablename
ORDER BY tablename;

-- 6. Check helper functions exist
SELECT
    'Functions Check' as check_type,
    proname as function_name,
    '✅ Exists' as status
FROM pg_proc
WHERE proname IN (
    'get_unread_notification_count',
    'get_unread_mention_count',
    'mark_all_notifications_read',
    'update_updated_at_column'
)
ORDER BY proname;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- Tables Check: ✅ All 6 tables exist
-- Table Details: 6 tables listed
-- RLS Check: All tables show ✅ Enabled
-- Realtime Check: 4 tables (comments, mentions, notifications, activity_log)
-- Policies Check:
--   - comments: 4 policies
--   - mentions: 3 policies
--   - notifications: 3 policies
--   - activity_log: 2 policies
--   - notification_preferences: 3 policies
--   - entity_watchers: 4 policies
-- Functions Check: 4 functions listed
-- =====================================================
