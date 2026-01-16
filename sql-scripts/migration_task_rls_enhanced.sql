-- ============================================
-- TASK ENHANCED RLS POLICIES MIGRATION
-- Replace permissive policies with granular role-based access control
-- ============================================

-- ============================================
-- TASKS TABLE - Enhanced RLS Policies
-- ============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow authenticated access to tasks" ON tasks;

-- 1. SELECT Policy: Users can read tasks they're assigned to OR tasks in their projects
CREATE POLICY "task_select_policy"
ON tasks FOR SELECT
TO authenticated
USING (
    -- User is assigned to the task
    auth.uid()::text = assigned_to::text
    OR auth.uid()::text = team_member_id::text
    OR auth.uid()::text = created_by::text
    -- OR user is part of the project team
    OR project_id IN (
        SELECT project_id
        FROM project_team_members
        WHERE team_member_id::text = auth.uid()::text
    )
    -- OR user is an admin/manager (assuming team_members has a role column)
    OR EXISTS (
        SELECT 1
        FROM team_members
        WHERE id::text = auth.uid()::text
        AND role IN ('admin', 'Admin', 'manager', 'Manager')
    )
);

-- 2. INSERT Policy: Users can create tasks in projects they're part of
CREATE POLICY "task_insert_policy"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
    -- User is part of the project team
    project_id IN (
        SELECT project_id
        FROM project_team_members
        WHERE team_member_id::text = auth.uid()::text
    )
    -- OR user is an admin/manager
    OR EXISTS (
        SELECT 1
        FROM team_members
        WHERE id::text = auth.uid()::text
        AND role IN ('admin', 'Admin', 'manager', 'Manager')
    )
    -- OR project_id is null (personal tasks)
    OR project_id IS NULL
);

-- 3. UPDATE Policy: Users can update tasks they created or are assigned to
CREATE POLICY "task_update_policy"
ON tasks FOR UPDATE
TO authenticated
USING (
    -- User is assigned to the task
    auth.uid()::text = assigned_to::text
    OR auth.uid()::text = team_member_id::text
    OR auth.uid()::text = created_by::text
    -- OR user is an admin/manager
    OR EXISTS (
        SELECT 1
        FROM team_members
        WHERE id::text = auth.uid()::text
        AND role IN ('admin', 'Admin', 'manager', 'Manager')
    )
)
WITH CHECK (
    -- Same permissions for the updated row
    auth.uid()::text = assigned_to::text
    OR auth.uid()::text = team_member_id::text
    OR auth.uid()::text = created_by::text
    OR EXISTS (
        SELECT 1
        FROM team_members
        WHERE id::text = auth.uid()::text
        AND role IN ('admin', 'Admin', 'manager', 'Manager')
    )
);

-- 4. DELETE Policy: Only task creator or admins can delete tasks
CREATE POLICY "task_delete_policy"
ON tasks FOR DELETE
TO authenticated
USING (
    -- User created the task
    auth.uid()::text = created_by::text
    -- OR user is an admin/manager
    OR EXISTS (
        SELECT 1
        FROM team_members
        WHERE id::text = auth.uid()::text
        AND role IN ('admin', 'Admin', 'manager', 'Manager')
    )
);

-- ============================================
-- TASK_SUBTASKS - Enhanced RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated access to task_subtasks" ON task_subtasks;

-- SELECT: Can view subtasks of tasks they can view
CREATE POLICY "task_subtasks_select_policy"
ON task_subtasks FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_subtasks.task_id
        -- User has access to parent task (leverages task RLS)
    )
);

-- INSERT: Can add subtasks to tasks they can update
CREATE POLICY "task_subtasks_insert_policy"
ON task_subtasks FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_subtasks.task_id
        AND (
            auth.uid()::text = assigned_to::text
            OR auth.uid()::text = created_by::text
            OR EXISTS (
                SELECT 1 FROM team_members
                WHERE id::text = auth.uid()::text
                AND role IN ('admin', 'Admin', 'manager', 'Manager')
            )
        )
    )
);

-- UPDATE: Can update subtasks of tasks they can update
CREATE POLICY "task_subtasks_update_policy"
ON task_subtasks FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_subtasks.task_id
        AND (
            auth.uid()::text = assigned_to::text
            OR auth.uid()::text = created_by::text
            OR EXISTS (
                SELECT 1 FROM team_members
                WHERE id::text = auth.uid()::text
                AND role IN ('admin', 'Admin', 'manager', 'Manager')
            )
        )
    )
);

-- DELETE: Can delete subtasks of tasks they can update
CREATE POLICY "task_subtasks_delete_policy"
ON task_subtasks FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_subtasks.task_id
        AND (
            auth.uid()::text = assigned_to::text
            OR auth.uid()::text = created_by::text
            OR EXISTS (
                SELECT 1 FROM team_members
                WHERE id::text = auth.uid()::text
                AND role IN ('admin', 'Admin', 'manager', 'Manager')
            )
        )
    )
);

-- ============================================
-- TASK_COMMENTS - Enhanced RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated access to task_comments" ON task_comments;

-- SELECT: Can view comments on tasks they can view (excluding internal comments if not assignee)
CREATE POLICY "task_comments_select_policy"
ON task_comments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_comments.task_id
    )
    AND (
        -- Non-internal comments visible to all who can see task
        is_internal = false
        -- Internal comments only visible to assignee, creator, or admins
        OR EXISTS (
            SELECT 1 FROM tasks
            WHERE id = task_comments.task_id
            AND (
                auth.uid()::text = assigned_to::text
                OR auth.uid()::text = created_by::text
                OR EXISTS (
                    SELECT 1 FROM team_members
                    WHERE id::text = auth.uid()::text
                    AND role IN ('admin', 'Admin', 'manager', 'Manager')
                )
            )
        )
    )
);

-- INSERT: Can add comments to tasks they can view
CREATE POLICY "task_comments_insert_policy"
ON task_comments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_comments.task_id
    )
);

-- UPDATE: Can only update own comments
CREATE POLICY "task_comments_update_policy"
ON task_comments FOR UPDATE
TO authenticated
USING (
    auth.uid()::text = user_id::text
    OR auth.uid()::text = team_member_id::text
);

-- DELETE: Can delete own comments or admin can delete any
CREATE POLICY "task_comments_delete_policy"
ON task_comments FOR DELETE
TO authenticated
USING (
    auth.uid()::text = user_id::text
    OR auth.uid()::text = team_member_id::text
    OR EXISTS (
        SELECT 1 FROM team_members
        WHERE id::text = auth.uid()::text
        AND role IN ('admin', 'Admin', 'manager', 'Manager')
    )
);

-- ============================================
-- TASK_ATTACHMENTS - Enhanced RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated access to task_attachments" ON task_attachments;

-- SELECT: Can view attachments on tasks they can view
CREATE POLICY "task_attachments_select_policy"
ON task_attachments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_attachments.task_id
    )
);

-- INSERT: Can add attachments to tasks they can update
CREATE POLICY "task_attachments_insert_policy"
ON task_attachments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_attachments.task_id
        AND (
            auth.uid()::text = assigned_to::text
            OR auth.uid()::text = created_by::text
            OR EXISTS (
                SELECT 1 FROM team_members
                WHERE id::text = auth.uid()::text
                AND role IN ('admin', 'Admin', 'manager', 'Manager')
            )
        )
    )
);

-- DELETE: Can delete own attachments or admin can delete any
CREATE POLICY "task_attachments_delete_policy"
ON task_attachments FOR DELETE
TO authenticated
USING (
    auth.uid()::text = uploaded_by::text
    OR auth.uid()::text = uploaded_by_team_member::text
    OR EXISTS (
        SELECT 1 FROM team_members
        WHERE id::text = auth.uid()::text
        AND role IN ('admin', 'Admin', 'manager', 'Manager')
    )
);

-- ============================================
-- TASK_ACTIVITY - Enhanced RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated access to task_activity" ON task_activity;

-- SELECT: Can view activity log of tasks they can view
CREATE POLICY "task_activity_select_policy"
ON task_activity FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_activity.task_id
    )
);

-- INSERT: System and authenticated users can log activity
CREATE POLICY "task_activity_insert_policy"
ON task_activity FOR INSERT
TO authenticated
WITH CHECK (true);

-- No UPDATE or DELETE policies - activity log is immutable

-- ============================================
-- TASK_DEPENDENCIES - Enhanced RLS Policies
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated access to task_dependencies" ON task_dependencies;

-- SELECT: Can view dependencies between tasks they can view
CREATE POLICY "task_dependencies_select_policy"
ON task_dependencies FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_dependencies.task_id
    )
);

-- INSERT: Can create dependencies for tasks they can update
CREATE POLICY "task_dependencies_insert_policy"
ON task_dependencies FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_dependencies.task_id
        AND (
            auth.uid()::text = assigned_to::text
            OR auth.uid()::text = created_by::text
            OR EXISTS (
                SELECT 1 FROM team_members
                WHERE id::text = auth.uid()::text
                AND role IN ('admin', 'Admin', 'manager', 'Manager')
            )
        )
    )
);

-- DELETE: Can remove dependencies for tasks they can update
CREATE POLICY "task_dependencies_delete_policy"
ON task_dependencies FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM tasks
        WHERE id = task_dependencies.task_id
        AND (
            auth.uid()::text = assigned_to::text
            OR auth.uid()::text = created_by::text
            OR EXISTS (
                SELECT 1 FROM team_members
                WHERE id::text = auth.uid()::text
                AND role IN ('admin', 'Admin', 'manager', 'Manager')
            )
        )
    )
);

-- ============================================
-- HELPER VIEWS FOR EASY QUERYING
-- ============================================

-- View: Tasks with subtask counts
CREATE OR REPLACE VIEW tasks_with_metrics AS
SELECT
    t.*,
    COUNT(DISTINCT ts.id) as subtasks_count,
    COUNT(DISTINCT CASE WHEN ts.completed = true THEN ts.id END) as subtasks_completed,
    COUNT(DISTINCT tc.id) as comments_count,
    COUNT(DISTINCT ta.id) as attachments_count
FROM tasks t
LEFT JOIN task_subtasks ts ON t.id = ts.task_id
LEFT JOIN task_comments tc ON t.id = tc.task_id
LEFT JOIN task_attachments ta ON t.id = ta.task_id
GROUP BY t.id;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON POLICY "task_select_policy" ON tasks IS 'Users can view tasks they are assigned to, created, or part of project team';
COMMENT ON POLICY "task_insert_policy" ON tasks IS 'Users can create tasks in their projects or personal tasks';
COMMENT ON POLICY "task_update_policy" ON tasks IS 'Users can update tasks they are involved with';
COMMENT ON POLICY "task_delete_policy" ON tasks IS 'Only task creators and admins can delete tasks';
