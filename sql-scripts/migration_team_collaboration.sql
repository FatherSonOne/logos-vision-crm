-- =====================================================
-- TEAM COLLABORATION MIGRATION
-- =====================================================
-- Features:
-- 1. Unified comments system for Tasks, Projects, Cases
-- 2. @mentions with user linking
-- 3. Notifications system with real-time support
-- 4. Activity feed for collaboration tracking
-- =====================================================

-- =====================================================
-- 1. COMMENTS TABLE (Unified for all entities)
-- =====================================================

-- Create comments table if it doesn't exist (extends task_comments concept)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entity reference (polymorphic)
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('task', 'project', 'case', 'client', 'activity')),
    entity_id UUID NOT NULL,
    
    -- Comment content
    content TEXT NOT NULL,
    content_html TEXT, -- Rich text/rendered content with @mentions highlighted
    
    -- Author info
    author_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    author_name VARCHAR(255), -- Denormalized for display (in case author deleted)
    
    -- Reply threading
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    thread_depth INTEGER DEFAULT 0,
    
    -- Metadata
    is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to clients
    is_edited BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_pinned ON comments(is_pinned) WHERE is_pinned = true;

-- =====================================================
-- 2. MENTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Where the mention occurred
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    -- Alternative: mention in entity description/notes (not in a comment)
    entity_type VARCHAR(50), -- 'task', 'project', 'case', etc.
    entity_id UUID,
    
    -- Who was mentioned
    mentioned_user_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    
    -- Who made the mention
    mentioned_by_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    
    -- Context for notification display
    mention_context TEXT, -- Excerpt of text around the mention
    mention_position INTEGER, -- Position in the text
    
    -- Read status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for mentions
CREATE INDEX IF NOT EXISTS idx_mentions_user ON mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_mentions_entity ON mentions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_mentions_unread ON mentions(mentioned_user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_mentions_created ON mentions(created_at DESC);

-- =====================================================
-- 3. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient
    user_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    
    -- Notification type
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'mention',           -- @mentioned in comment
        'comment',           -- New comment on entity you're involved in
        'reply',             -- Reply to your comment
        'assignment',        -- Assigned to task/project
        'unassignment',      -- Removed from task/project
        'status_change',     -- Status changed on entity you're following
        'due_date',          -- Due date reminder
        'overdue',           -- Task/project overdue
        'completion',        -- Task/project completed
        'approval_request',  -- Approval requested
        'approval_response', -- Approval granted/denied
        'system'             -- System notifications
    )),
    
    -- What triggered the notification
    entity_type VARCHAR(50), -- 'task', 'project', 'case', 'comment', etc.
    entity_id UUID,
    
    -- Related objects
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    mention_id UUID REFERENCES mentions(id) ON DELETE CASCADE,
    
    -- Actor (who triggered the notification, if applicable)
    actor_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    actor_name VARCHAR(255), -- Denormalized
    
    -- Content
    title VARCHAR(500) NOT NULL,
    message TEXT,
    action_url VARCHAR(1000), -- Deep link to the relevant page
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,
    
    -- Priority for sorting
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- Optional expiration
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority, created_at DESC);

-- =====================================================
-- 4. ACTIVITY LOG TABLE (For collaboration audit trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entity reference
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Activity type
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'commented', 'mentioned', 'assigned', etc.
    
    -- Actor
    actor_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    actor_name VARCHAR(255), -- Denormalized
    
    -- Details
    description TEXT, -- Human-readable description
    changes JSONB, -- Detailed changes { field: { old: x, new: y } }
    metadata JSONB, -- Additional context
    
    -- Related items
    comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
    
    -- Visibility
    is_internal BOOLEAN DEFAULT false, -- Internal activity not shown to clients
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- =====================================================
-- 5. USER NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE UNIQUE,
    
    -- Email notifications
    email_mentions BOOLEAN DEFAULT true,
    email_comments BOOLEAN DEFAULT true,
    email_assignments BOOLEAN DEFAULT true,
    email_status_changes BOOLEAN DEFAULT false,
    email_due_dates BOOLEAN DEFAULT true,
    email_digest BOOLEAN DEFAULT true, -- Daily digest instead of immediate
    email_digest_time TIME DEFAULT '09:00:00', -- When to send digest
    
    -- In-app notifications
    app_mentions BOOLEAN DEFAULT true,
    app_comments BOOLEAN DEFAULT true,
    app_assignments BOOLEAN DEFAULT true,
    app_status_changes BOOLEAN DEFAULT true,
    app_due_dates BOOLEAN DEFAULT true,
    
    -- Push notifications (for future mobile app)
    push_enabled BOOLEAN DEFAULT false,
    push_mentions BOOLEAN DEFAULT true,
    push_assignments BOOLEAN DEFAULT true,
    push_urgent_only BOOLEAN DEFAULT false,
    
    -- Do not disturb
    dnd_enabled BOOLEAN DEFAULT false,
    dnd_start TIME,
    dnd_end TIME,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for notification preferences
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);

-- =====================================================
-- 6. FOLLOWING/WATCHING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS entity_watchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entity being watched
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Watcher
    user_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    
    -- Watch level
    watch_level VARCHAR(20) DEFAULT 'all' CHECK (watch_level IN (
        'all',           -- All activity
        'mentions',      -- Only when mentioned
        'status_only',   -- Only status changes
        'none'           -- Muted
    )),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(entity_type, entity_id, user_id)
);

-- Indexes for entity_watchers
CREATE INDEX IF NOT EXISTS idx_entity_watchers_entity ON entity_watchers(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_watchers_user ON entity_watchers(user_id);

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_watchers ENABLE ROW LEVEL SECURITY;

-- Comments: Users can see all comments, but only edit their own
CREATE POLICY "Users can view all comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (author_id = auth.uid()::uuid OR author_id IN (SELECT id FROM team_members WHERE email = auth.email()));
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (author_id = auth.uid()::uuid OR author_id IN (SELECT id FROM team_members WHERE email = auth.email()));

-- Mentions: Users can see mentions where they are involved
CREATE POLICY "Users can view relevant mentions" ON mentions FOR SELECT USING (true);
CREATE POLICY "Users can insert mentions" ON mentions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own mentions" ON mentions FOR UPDATE USING (mentioned_user_id = auth.uid()::uuid OR mentioned_user_id IN (SELECT id FROM team_members WHERE email = auth.email()));

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid()::uuid OR user_id IN (SELECT id FROM team_members WHERE email = auth.email()));
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()::uuid OR user_id IN (SELECT id FROM team_members WHERE email = auth.email()));

-- Activity log: All users can view activity
CREATE POLICY "Users can view activity log" ON activity_log FOR SELECT USING (true);
CREATE POLICY "System can insert activity" ON activity_log FOR INSERT WITH CHECK (true);

-- Notification preferences: Users can only manage their own
CREATE POLICY "Users can view own preferences" ON notification_preferences FOR SELECT USING (user_id = auth.uid()::uuid OR user_id IN (SELECT id FROM team_members WHERE email = auth.email()));
CREATE POLICY "Users can insert own preferences" ON notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid()::uuid OR user_id IN (SELECT id FROM team_members WHERE email = auth.email()));
CREATE POLICY "Users can update own preferences" ON notification_preferences FOR UPDATE USING (user_id = auth.uid()::uuid OR user_id IN (SELECT id FROM team_members WHERE email = auth.email()));

-- Entity watchers: Users can see all watchers, manage their own
CREATE POLICY "Users can view watchers" ON entity_watchers FOR SELECT USING (true);
CREATE POLICY "Users can manage own watches" ON entity_watchers FOR INSERT WITH CHECK (user_id = auth.uid()::uuid OR user_id IN (SELECT id FROM team_members WHERE email = auth.email()));
CREATE POLICY "Users can update own watches" ON entity_watchers FOR UPDATE USING (user_id = auth.uid()::uuid OR user_id IN (SELECT id FROM team_members WHERE email = auth.email()));
CREATE POLICY "Users can delete own watches" ON entity_watchers FOR DELETE USING (user_id = auth.uid()::uuid OR user_id IN (SELECT id FROM team_members WHERE email = auth.email()));

-- =====================================================
-- 8. TRIGGERS FOR REAL-TIME & AUTO-TIMESTAMPS
-- =====================================================

-- Update timestamp trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = p_user_id
        AND is_read = false
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get unread mention count for a user
CREATE OR REPLACE FUNCTION get_unread_mention_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM mentions
        WHERE mentioned_user_id = p_user_id
        AND is_read = false
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE user_id = p_user_id
    AND is_read = false;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to add sample data:
/*
INSERT INTO notification_preferences (user_id)
SELECT id FROM team_members
ON CONFLICT (user_id) DO NOTHING;
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Run this script in your Supabase SQL editor or via migrations
-- Tables created:
-- - comments (unified comments for all entities)
-- - mentions (@mention tracking)
-- - notifications (notification center)
-- - activity_log (collaboration audit trail)
-- - notification_preferences (user settings)
-- - entity_watchers (follow/watch entities)
-- =====================================================
