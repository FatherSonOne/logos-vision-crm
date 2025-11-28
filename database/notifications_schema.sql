-- =====================================================
-- NOTIFICATIONS SYSTEM - Database Schema
-- =====================================================
--
-- This creates a comprehensive notification system with:
-- - Database-persisted notifications
-- - Real-time delivery
-- - User preferences
-- - Read/unread tracking
-- - Notification categories
--
-- Run this after the main schema and Phase 4 improvements
--
-- =====================================================

-- =====================================================
-- PART 1: NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL CHECK (type IN (
    'task_assigned',
    'task_completed',
    'task_due_soon',
    'case_assigned',
    'case_updated',
    'case_comment',
    'project_updated',
    'mention',
    'meeting_scheduled',
    'document_uploaded',
    'activity_shared',
    'system'
  )),
  title TEXT NOT NULL CHECK (length(trim(title)) >= 1),
  message TEXT NOT NULL CHECK (length(trim(message)) >= 1),

  -- Optional action/link
  action_url TEXT,
  action_label TEXT,

  -- Related entities (for context and filtering)
  related_entity_type TEXT CHECK (related_entity_type IN (
    'task', 'case', 'project', 'client', 'activity', 'document', 'comment'
  )),
  related_entity_id UUID,

  -- Actor (who triggered the notification)
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,
  actor_avatar_url TEXT,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Priority (for sorting and filtering)
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Metadata (JSON for extensibility)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT notification_read_consistency CHECK (
    (is_read = false AND read_at IS NULL) OR
    (is_read = true AND read_at IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related ON notifications(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority) WHERE priority IN ('high', 'urgent');
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- =====================================================
-- PART 2: NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,

  -- Notification type preferences (JSONB for flexibility)
  -- Example: {"task_assigned": true, "task_completed": false, ...}
  type_preferences JSONB DEFAULT '{
    "task_assigned": true,
    "task_completed": true,
    "task_due_soon": true,
    "case_assigned": true,
    "case_updated": true,
    "case_comment": true,
    "project_updated": true,
    "mention": true,
    "meeting_scheduled": true,
    "document_uploaded": true,
    "activity_shared": true,
    "system": true
  }'::jsonb,

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'UTC',

  -- Digest preferences
  daily_digest_enabled BOOLEAN DEFAULT false,
  daily_digest_time TIME DEFAULT '09:00:00',
  weekly_digest_enabled BOOLEAN DEFAULT false,
  weekly_digest_day INTEGER DEFAULT 1 CHECK (weekly_digest_day BETWEEN 0 AND 6), -- 0 = Sunday

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- =====================================================
-- PART 3: NOTIFICATION HELPER FUNCTIONS
-- =====================================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_actor_name TEXT;
  v_prefs RECORD;
BEGIN
  -- Get user preferences
  SELECT * INTO v_prefs
  FROM notification_preferences
  WHERE user_id = p_user_id;

  -- Create preferences if they don't exist
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id)
    VALUES (p_user_id);

    SELECT * INTO v_prefs
    FROM notification_preferences
    WHERE user_id = p_user_id;
  END IF;

  -- Check if user has this notification type enabled
  IF v_prefs.in_app_enabled AND (v_prefs.type_preferences->p_type)::boolean IS NOT FALSE THEN
    -- Get actor name if provided
    IF p_actor_id IS NOT NULL THEN
      SELECT raw_user_meta_data->>'name' INTO v_actor_name
      FROM auth.users
      WHERE id = p_actor_id;
    END IF;

    -- Create notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_entity_type,
      related_entity_id,
      actor_id,
      actor_name,
      priority,
      action_url,
      action_label,
      expires_at
    ) VALUES (
      p_user_id,
      p_type,
      p_title,
      p_message,
      p_related_entity_type,
      p_related_entity_id,
      p_actor_id,
      v_actor_name,
      p_priority,
      p_action_url,
      p_action_label,
      p_expires_at
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE id = p_notification_id
  AND user_id = auth.uid()
  AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE user_id = auth.uid()
  AND is_read = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = auth.uid()
    AND is_read = false
    AND (expires_at IS NULL OR expires_at > NOW())
  )::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE (
    -- Delete read notifications older than 30 days
    (is_read = true AND read_at < NOW() - INTERVAL '30 days')
    OR
    -- Delete expired notifications
    (expires_at IS NOT NULL AND expires_at < NOW())
    OR
    -- Delete old unread low-priority notifications (60 days)
    (is_read = false AND priority = 'low' AND created_at < NOW() - INTERVAL '60 days')
  );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 4: NOTIFICATION TRIGGERS
-- =====================================================

-- Trigger: Update updated_at on notification preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER trigger_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- =====================================================
-- PART 5: RLS POLICIES FOR NOTIFICATIONS
-- =====================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (true);

-- Notification preferences policies
CREATE POLICY "notification_preferences_select_own" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notification_preferences_insert_own" ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notification_preferences_update_own" ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- PART 6: EXAMPLE TRIGGER FOR AUTO-NOTIFICATIONS
-- =====================================================

-- Example: Notify user when a task is assigned to them
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
DECLARE
  v_team_member RECORD;
  v_project_name TEXT;
BEGIN
  -- Get team member info
  SELECT tm.*, au.id as user_id
  INTO v_team_member
  FROM team_members tm
  LEFT JOIN auth.users au ON tm.email = au.email
  WHERE tm.id = NEW.team_member_id;

  -- Get project name
  SELECT name INTO v_project_name
  FROM projects
  WHERE id = NEW.project_id;

  -- Create notification if user exists
  IF v_team_member.user_id IS NOT NULL THEN
    PERFORM create_notification(
      p_user_id := v_team_member.user_id,
      p_type := 'task_assigned',
      p_title := 'New Task Assigned',
      p_message := format('You have been assigned a task: %s', NEW.description),
      p_related_entity_type := 'task',
      p_related_entity_id := NEW.id,
      p_actor_id := auth.uid(),
      p_priority := CASE
        WHEN NEW.priority = 'High' THEN 'high'
        WHEN NEW.due_date < NOW() + INTERVAL '2 days' THEN 'high'
        ELSE 'normal'
      END,
      p_action_url := format('/projects/%s', NEW.project_id),
      p_action_label := 'View Task'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger (optional - uncomment to enable)
-- DROP TRIGGER IF EXISTS trigger_notify_task_assigned ON tasks;
-- CREATE TRIGGER trigger_notify_task_assigned
--   AFTER INSERT ON tasks
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_task_assigned();

-- =====================================================
-- PART 7: SCHEDULED CLEANUP JOB
-- =====================================================

-- Create a scheduled job to clean up old notifications (requires pg_cron extension)
-- Uncomment if you have pg_cron enabled in your Supabase project:
--
-- SELECT cron.schedule(
--   'cleanup-old-notifications',
--   '0 2 * * *', -- Run at 2 AM every day
--   $$SELECT cleanup_old_notifications()$$
-- );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables created
SELECT tablename, schemaname
FROM pg_tables
WHERE tablename IN ('notifications', 'notification_preferences')
AND schemaname = 'public';

-- Verify indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('notifications', 'notification_preferences')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify functions
SELECT proname, pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname LIKE '%notification%'
AND pronamespace = 'public'::regnamespace;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================
--
-- 1. Create a notification:
--    SELECT create_notification(
--      p_user_id := '...',
--      p_type := 'task_assigned',
--      p_title := 'New Task',
--      p_message := 'You have been assigned a new task'
--    );
--
-- 2. Mark as read:
--    SELECT mark_notification_read('notification-id');
--
-- 3. Mark all as read:
--    SELECT mark_all_notifications_read();
--
-- 4. Get unread count:
--    SELECT get_unread_notification_count();
--
-- 5. Query user's notifications:
--    SELECT * FROM notifications
--    WHERE user_id = auth.uid()
--    ORDER BY created_at DESC
--    LIMIT 20;
--
-- =====================================================
