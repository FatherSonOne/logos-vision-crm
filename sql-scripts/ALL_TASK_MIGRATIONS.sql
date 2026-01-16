-- ============================================
-- COMPLETE TASK MANAGEMENT MIGRATIONS
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: TASK ENHANCEMENTS
-- Add missing columns to tasks table
-- ============================================

-- Add title column (separate from description for clarity)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Add time tracking columns
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS time_estimate_hours NUMERIC DEFAULT 0;

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS time_spent_hours NUMERIC DEFAULT 0;

-- Add tags for categorization (PostgreSQL array type)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add assigned_to column (this might be redundant with team_member_id, but plan specifies it)
-- We'll keep both for backward compatibility
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES team_members(id);

-- Add created_by column for audit trail
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES team_members(id);

-- BACKWARD COMPATIBILITY DATA MIGRATION
-- If title is null, use first 100 chars of description
UPDATE tasks
SET title = LEFT(description, 100)
WHERE title IS NULL AND description IS NOT NULL;

-- If assigned_to is null but team_member_id exists, copy it
UPDATE tasks
SET assigned_to = team_member_id
WHERE assigned_to IS NULL AND team_member_id IS NOT NULL;

-- INDEXES FOR PERFORMANCE
-- Index on title for search
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks USING gin(to_tsvector('english', title));

-- Index on assigned_to for filtering by assignee
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Index on tags for tag-based filtering (GIN index for array containment)
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING gin(tags);

-- Composite index for common queries (status + due date)
CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date ON tasks(status, due_date);

-- Index on created_by for audit queries
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- CONSTRAINTS
-- Ensure time spent doesn't exceed estimate by too much (allow 50% overage for realistic scenarios)
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS check_time_spent_valid;

ALTER TABLE tasks
ADD CONSTRAINT check_time_spent_valid
CHECK (time_estimate_hours = 0 OR time_spent_hours <= time_estimate_hours * 1.5);

-- COMMENTS FOR DOCUMENTATION
COMMENT ON COLUMN tasks.title IS 'Short task title (max 255 chars)';
COMMENT ON COLUMN tasks.description IS 'Detailed task description';
COMMENT ON COLUMN tasks.time_estimate_hours IS 'Estimated time to complete in hours';
COMMENT ON COLUMN tasks.time_spent_hours IS 'Actual time spent in hours';
COMMENT ON COLUMN tasks.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN tasks.assigned_to IS 'Current assignee (team member ID)';
COMMENT ON COLUMN tasks.created_by IS 'User who created this task';

-- ============================================
-- PART 2: TASK SUBTABLES
-- Create supporting tables for tasks
-- ============================================

-- Create task_subtasks table
CREATE TABLE IF NOT EXISTS task_subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_subtasks_task_id ON task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_completed ON task_subtasks(completed);

-- Create task_comments table
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

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);

-- Create task_attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);

-- Create task_activity table (audit log)
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

CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_created_at ON task_activity(created_at DESC);

-- Create task_dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id)
);

-- Prevent self-dependencies
ALTER TABLE task_dependencies
DROP CONSTRAINT IF EXISTS check_no_self_dependency;

ALTER TABLE task_dependencies
ADD CONSTRAINT check_no_self_dependency
CHECK (task_id != depends_on_task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- TRIGGERS FOR AUTO-UPDATE
-- Trigger to update updated_at on task_subtasks
CREATE OR REPLACE FUNCTION update_task_subtasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_task_subtasks_updated_at ON task_subtasks;
CREATE TRIGGER trigger_update_task_subtasks_updated_at
    BEFORE UPDATE ON task_subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_subtasks_updated_at();

-- Trigger to update updated_at on task_comments
CREATE OR REPLACE FUNCTION update_task_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_task_comments_updated_at ON task_comments;
CREATE TRIGGER trigger_update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_task_comments_updated_at();

-- CIRCULAR DEPENDENCY PREVENTION TRIGGER
CREATE OR REPLACE FUNCTION prevent_circular_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    cycle_exists BOOLEAN;
BEGIN
    -- Check if adding this dependency would create a cycle
    -- Using recursive CTE to detect cycles
    WITH RECURSIVE dependency_chain AS (
        -- Start with the new dependency
        SELECT NEW.task_id as current_task, NEW.depends_on_task_id as depends_on, 1 as depth
        UNION ALL
        -- Recursively follow dependencies
        SELECT dc.current_task, td.depends_on_task_id, dc.depth + 1
        FROM dependency_chain dc
        JOIN task_dependencies td ON td.task_id = dc.depends_on
        WHERE dc.depth < 50  -- Prevent infinite loops in case of existing bad data
    )
    SELECT EXISTS(
        SELECT 1 FROM dependency_chain
        WHERE current_task = depends_on  -- Found a cycle
    ) INTO cycle_exists;

    IF cycle_exists THEN
        RAISE EXCEPTION 'Cannot create dependency: would create a circular dependency chain';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_circular_dependencies ON task_dependencies;
CREATE TRIGGER trigger_prevent_circular_dependencies
    BEFORE INSERT OR UPDATE ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION prevent_circular_task_dependencies();

-- AUTOMATIC ACTIVITY LOGGING TRIGGER
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO task_activity (task_id, activity_type, description, old_value, new_value)
        VALUES (NEW.id, 'status_changed', 'Task status changed', OLD.status, NEW.status);
    END IF;

    -- Log assignment changes
    IF TG_OP = 'UPDATE' AND (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
        INSERT INTO task_activity (task_id, activity_type, description, old_value, new_value)
        VALUES (NEW.id, 'assigned', 'Task assignment changed', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT);
    END IF;

    -- Log priority changes
    IF TG_OP = 'UPDATE' AND (OLD.priority IS DISTINCT FROM NEW.priority) THEN
        INSERT INTO task_activity (task_id, activity_type, description, old_value, new_value)
        VALUES (NEW.id, 'priority_changed', 'Task priority changed', OLD.priority, NEW.priority);
    END IF;

    -- Log task creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO task_activity (task_id, activity_type, description)
        VALUES (NEW.id, 'created', 'Task created');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_task_changes ON tasks;
CREATE TRIGGER trigger_log_task_changes
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_changes();

-- ============================================
-- PART 3: ENHANCED RLS POLICIES
-- Implement granular role-based security
-- ============================================

-- Enable RLS on all task-related tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to read tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to insert tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to update tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to delete tasks" ON tasks;

-- TASKS TABLE POLICIES

-- SELECT: Users can view tasks they're assigned to, created, or part of project team
CREATE POLICY "Users can read assigned or project tasks"
ON tasks FOR SELECT
TO authenticated
USING (
    auth.uid() = assigned_to
    OR auth.uid() = created_by
    OR auth.uid() IN (
        SELECT user_id FROM team_members WHERE role IN ('admin', 'manager')
    )
);

-- INSERT: Users can create tasks in projects they're part of or personal tasks
CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM team_members WHERE role IN ('admin', 'manager', 'member')
    )
);

-- UPDATE: Assignees, creators, and admins can update
CREATE POLICY "Users can update their tasks"
ON tasks FOR UPDATE
TO authenticated
USING (
    auth.uid() = assigned_to
    OR auth.uid() = created_by
    OR auth.uid() IN (
        SELECT user_id FROM team_members WHERE role IN ('admin', 'manager')
    )
)
WITH CHECK (
    auth.uid() = assigned_to
    OR auth.uid() = created_by
    OR auth.uid() IN (
        SELECT user_id FROM team_members WHERE role IN ('admin', 'manager')
    )
);

-- DELETE: Only creators and admins can delete
CREATE POLICY "Users can delete their created tasks"
ON tasks FOR DELETE
TO authenticated
USING (
    auth.uid() = created_by
    OR auth.uid() IN (
        SELECT user_id FROM team_members WHERE role IN ('admin', 'manager')
    )
);

-- TASK_SUBTASKS POLICIES

CREATE POLICY "Users can view subtasks of tasks they can view"
ON task_subtasks FOR SELECT
TO authenticated
USING (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can add subtasks to tasks they can update"
ON task_subtasks FOR INSERT
TO authenticated
WITH CHECK (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can update subtasks of tasks they can update"
ON task_subtasks FOR UPDATE
TO authenticated
USING (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can delete subtasks of tasks they can update"
ON task_subtasks FOR DELETE
TO authenticated
USING (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

-- TASK_COMMENTS POLICIES

CREATE POLICY "Users can view comments on tasks they can view"
ON task_comments FOR SELECT
TO authenticated
USING (
    (NOT is_internal OR user_id = auth.uid())
    AND task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can add comments to tasks they can view"
ON task_comments FOR INSERT
TO authenticated
WITH CHECK (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can update their own comments"
ON task_comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments or admins can delete any"
ON task_comments FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
    OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
);

-- TASK_ATTACHMENTS POLICIES

CREATE POLICY "Users can view attachments on tasks they can view"
ON task_attachments FOR SELECT
TO authenticated
USING (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can upload attachments to tasks they can update"
ON task_attachments FOR INSERT
TO authenticated
WITH CHECK (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can delete their own attachments or admins can delete any"
ON task_attachments FOR DELETE
TO authenticated
USING (
    uploaded_by = auth.uid()
    OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
);

-- TASK_ACTIVITY POLICIES (Read-only audit log)

CREATE POLICY "Users can view activity on tasks they can view"
ON task_activity FOR SELECT
TO authenticated
USING (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

-- No INSERT/UPDATE/DELETE policies - activity log is immutable except via triggers

-- TASK_DEPENDENCIES POLICIES

CREATE POLICY "Users can view dependencies between tasks they can view"
ON task_dependencies FOR SELECT
TO authenticated
USING (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can create dependencies for tasks they can update"
ON task_dependencies FOR INSERT
TO authenticated
WITH CHECK (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

CREATE POLICY "Users can delete dependencies for tasks they can update"
ON task_dependencies FOR DELETE
TO authenticated
USING (
    task_id IN (
        SELECT id FROM tasks WHERE
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR auth.uid() IN (SELECT user_id FROM team_members WHERE role IN ('admin', 'manager'))
    )
);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Create view with aggregated task metrics
CREATE OR REPLACE VIEW tasks_with_metrics AS
SELECT
    t.*,
    COUNT(DISTINCT ts.id) as subtasks_count,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.completed = true) as completed_subtasks_count,
    COUNT(DISTINCT tc.id) as comments_count,
    COUNT(DISTINCT ta.id) as attachments_count
FROM tasks t
LEFT JOIN task_subtasks ts ON ts.task_id = t.id
LEFT JOIN task_comments tc ON tc.task_id = t.id
LEFT JOIN task_attachments ta ON ta.task_id = t.id
GROUP BY t.id;

-- ============================================
-- COMPLETED
-- ============================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ All task management migrations completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Created/Updated:';
    RAISE NOTICE '  - 6 new columns on tasks table';
    RAISE NOTICE '  - 5 new supporting tables';
    RAISE NOTICE '  - 11 performance indexes';
    RAISE NOTICE '  - 4 intelligent triggers';
    RAISE NOTICE '  - 18+ RLS security policies';
    RAISE NOTICE '  - 1 helper view (tasks_with_metrics)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Test the taskManagementService and connect TaskView.tsx';
END $$;
