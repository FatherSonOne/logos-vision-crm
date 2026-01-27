-- =====================================================
-- TEAM COLLABORATION SETUP - COMPACT VERIFICATION
-- =====================================================
-- One-screen verification of all collaboration features
-- =====================================================

SELECT
    '📊 SETUP VERIFICATION' as section,
    '' as item,
    '' as status,
    '' as details
UNION ALL
SELECT
    '━━━━━━━━━━━━━━━━━━━━',
    '━━━━━━━━━━━━━━━━━━━━',
    '━━━━━━━━━━━━━━━━━━━━',
    '━━━━━━━━━━━━━━━━━━━━'

-- 1. Tables Check
UNION ALL
SELECT
    '1️⃣ TABLES' as section,
    'Total Tables' as item,
    CASE
        WHEN COUNT(*) = 6 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    COUNT(*)::text || ' of 6 tables' as details
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('comments', 'mentions', 'notifications', 'activity_log', 'notification_preferences', 'entity_watchers')

-- 2. RLS Check
UNION ALL
SELECT
    '2️⃣ ROW LEVEL SECURITY',
    'RLS Enabled',
    CASE
        WHEN COUNT(*) = 6 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END,
    COUNT(*)::text || ' of 6 tables'
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('comments', 'mentions', 'notifications', 'activity_log', 'notification_preferences', 'entity_watchers')
AND rowsecurity = true

-- 3. Realtime Check
UNION ALL
SELECT
    '3️⃣ REALTIME',
    'Realtime Enabled',
    CASE
        WHEN COUNT(*) = 4 THEN '✅ PASS'
        ELSE '⚠️ PARTIAL'
    END,
    COUNT(*)::text || ' of 4 tables'
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('comments', 'mentions', 'notifications', 'activity_log')

-- 4. Policies Check
UNION ALL
SELECT
    '4️⃣ SECURITY POLICIES',
    'Total Policies',
    CASE
        WHEN COUNT(*) >= 19 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END,
    COUNT(*)::text || ' policies (expect 19+)'
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('comments', 'mentions', 'notifications', 'activity_log', 'notification_preferences', 'entity_watchers')

-- 5. Functions Check
UNION ALL
SELECT
    '5️⃣ HELPER FUNCTIONS',
    'SQL Functions',
    CASE
        WHEN COUNT(*) = 4 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END,
    COUNT(*)::text || ' of 4 functions'
FROM pg_proc
WHERE proname IN (
    'get_unread_notification_count',
    'get_unread_mention_count',
    'mark_all_notifications_read',
    'update_updated_at_column'
)

-- Footer
UNION ALL
SELECT
    '━━━━━━━━━━━━━━━━━━━━',
    '━━━━━━━━━━━━━━━━━━━━',
    '━━━━━━━━━━━━━━━━━━━━',
    '━━━━━━━━━━━━━━━━━━━━'
UNION ALL
SELECT
    '📝 SUMMARY',
    'Team Collaboration',
    CASE
        WHEN
            (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('comments', 'mentions', 'notifications', 'activity_log', 'notification_preferences', 'entity_watchers')) = 6
            AND (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('comments', 'mentions', 'notifications', 'activity_log', 'notification_preferences', 'entity_watchers') AND rowsecurity = true) = 6
            AND (SELECT COUNT(*) FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename IN ('comments', 'mentions', 'notifications', 'activity_log')) >= 3
            AND (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_unread_notification_count', 'get_unread_mention_count', 'mark_all_notifications_read', 'update_updated_at_column')) = 4
        THEN '✅ READY'
        ELSE '⚠️ INCOMPLETE'
    END,
    'All checks completed'
;

-- =====================================================
-- LEGEND:
-- ✅ PASS = Feature fully configured
-- ⚠️ PARTIAL = Feature partially configured
-- ❌ FAIL = Feature missing or broken
-- =====================================================
