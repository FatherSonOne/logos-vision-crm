-- ============================================
-- TASK SUPPORTING TABLES MIGRATION
-- Create subtasks, comments, attachments, activity, and dependencies tables
-- ============================================

-- ============================================
-- 1. TASK SUBTASKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS task_subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_subtasks_task_id ON task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_order ON task_subtasks(task_id, display_order);

-- Comments
COMMENT ON TABLE task_subtasks IS 'Subtasks that belong to a parent task';
COMMENT ON COLUMN task_subtasks.display_order IS 'Order in which subtasks should be displayed';

-- ============================================
-- 2. TASK COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    team_member_id UUID REFERENCES team_members(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

-- Comments
COMMENT ON TABLE task_comments IS 'Comments and discussions on tasks';
COMMENT ON COLUMN task_comments.is_internal IS 'If true, not visible to clients';

-- ============================================
-- 3. TASK ATTACHMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_by_team_member UUID REFERENCES team_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);

-- Comments
COMMENT ON TABLE task_attachments IS 'Files attached to tasks';
COMMENT ON COLUMN task_attachments.file_path IS 'Path in storage bucket or file system';

-- ============================================
-- 4. TASK ACTIVITY TABLE (Audit Log)
-- ============================================

CREATE TABLE IF NOT EXISTS task_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    team_member_id UUID REFERENCES team_members(id),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    old_value TEXT,
    new_value TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_created_at ON task_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_activity_type ON task_activity(activity_type);

-- Comments
COMMENT ON TABLE task_activity IS 'Audit log of all task changes and activities';
COMMENT ON COLUMN task_activity.activity_type IS 'Type: created, updated, status_changed, assigned, commented, etc.';
COMMENT ON COLUMN task_activity.metadata IS 'Additional context as JSON';

-- ============================================
-- 5. TASK DEPENDENCIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- Comments
COMMENT ON TABLE task_dependencies IS 'Task dependency relationships';
COMMENT ON COLUMN task_dependencies.dependency_type IS 'finish_to_start, start_to_start, finish_to_finish, start_to_finish';
COMMENT ON CONSTRAINT task_dependencies_task_id_depends_on_task_id_key ON task_dependencies IS 'Prevent duplicate dependencies';
COMMENT ON CONSTRAINT task_dependencies_check ON task_dependencies IS 'Prevent self-dependencies';

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Subtasks updated_at trigger
DROP TRIGGER IF EXISTS update_task_subtasks_updated_at ON task_subtasks;
CREATE TRIGGER update_task_subtasks_updated_at
    BEFORE UPDATE ON task_subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments updated_at trigger
DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Prevent Circular Dependencies
-- ============================================

CREATE OR REPLACE FUNCTION prevent_circular_task_dependency()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if adding this dependency would create a cycle
    -- This is a simple check; for production you might want a more sophisticated graph traversal
    IF EXISTS (
        WITH RECURSIVE dependency_chain AS (
            -- Start with the task we're trying to depend on
            SELECT depends_on_task_id AS task_id
            FROM task_dependencies
            WHERE task_id = NEW.depends_on_task_id

            UNION

            -- Recursively find all tasks that the depends_on_task depends on
            SELECT td.depends_on_task_id
            FROM task_dependencies td
            INNER JOIN dependency_chain dc ON td.task_id = dc.task_id
        )
        SELECT 1 FROM dependency_chain WHERE task_id = NEW.task_id
    ) THEN
        RAISE EXCEPTION 'Circular dependency detected: Task % cannot depend on task % as it would create a cycle',
            NEW.task_id, NEW.depends_on_task_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS check_circular_dependency ON task_dependencies;
CREATE TRIGGER check_circular_dependency
    BEFORE INSERT OR UPDATE ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_task_dependency();

-- ============================================
-- FUNCTION: Auto-log task activity on changes
-- ============================================

CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO task_activity (task_id, activity_type, description, old_value, new_value)
        VALUES (
            NEW.id,
            'status_changed',
            'Task status changed',
            OLD.status,
            NEW.status
        );
    END IF;

    -- Log assignment changes
    IF TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
        INSERT INTO task_activity (task_id, activity_type, description, old_value, new_value)
        VALUES (
            NEW.id,
            'assigned',
            'Task reassigned',
            OLD.assigned_to::TEXT,
            NEW.assigned_to::TEXT
        );
    END IF;

    -- Log priority changes
    IF TG_OP = 'UPDATE' AND OLD.priority IS DISTINCT FROM NEW.priority THEN
        INSERT INTO task_activity (task_id, activity_type, description, old_value, new_value)
        VALUES (
            NEW.id,
            'priority_changed',
            'Task priority changed',
            OLD.priority,
            NEW.priority
        );
    END IF;

    -- Log task creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO task_activity (task_id, activity_type, description, team_member_id)
        VALUES (
            NEW.id,
            'created',
            'Task created',
            NEW.created_by
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for automatic activity logging
DROP TRIGGER IF EXISTS auto_log_task_changes ON tasks;
CREATE TRIGGER auto_log_task_changes
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_activity();

-- ============================================
-- ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Temporary permissive policies (will be replaced by granular policies in migration_task_rls_enhanced.sql)
CREATE POLICY "Allow authenticated access to task_subtasks" ON task_subtasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to task_comments" ON task_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to task_attachments" ON task_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to task_activity" ON task_activity FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to task_dependencies" ON task_dependencies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
