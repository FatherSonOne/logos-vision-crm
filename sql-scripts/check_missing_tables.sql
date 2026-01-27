-- =====================================================
-- CHECK WHICH COLLABORATION TABLE IS MISSING
-- =====================================================

-- List which tables exist and which are missing
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        'comments',
        'mentions',
        'notifications',
        'activity_log',
        'notification_preferences',
        'entity_watchers'
    ]) AS table_name
),
existing_tables AS (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'comments',
        'mentions',
        'notifications',
        'activity_log',
        'notification_preferences',
        'entity_watchers'
    )
)
SELECT
    e.table_name,
    CASE
        WHEN x.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM expected_tables e
LEFT JOIN existing_tables x ON e.table_name = x.table_name
ORDER BY e.table_name;

-- =====================================================
-- This will show exactly which table is missing
-- =====================================================
