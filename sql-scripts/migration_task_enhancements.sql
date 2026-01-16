-- ============================================
-- TASK ENHANCEMENTS MIGRATION
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

-- ============================================
-- BACKWARD COMPATIBILITY DATA MIGRATION
-- ============================================

-- If title is null, use first 100 chars of description
UPDATE tasks
SET title = LEFT(description, 100)
WHERE title IS NULL AND description IS NOT NULL;

-- If assigned_to is null but team_member_id exists, copy it
UPDATE tasks
SET assigned_to = team_member_id
WHERE assigned_to IS NULL AND team_member_id IS NOT NULL;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

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

-- ============================================
-- CONSTRAINTS
-- ============================================

-- Ensure time spent doesn't exceed estimate (if estimate is set)
ALTER TABLE tasks
ADD CONSTRAINT check_time_spent_valid
CHECK (time_estimate_hours = 0 OR time_spent_hours <= time_estimate_hours * 1.5);
-- Allow 50% overage for realistic scenarios

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN tasks.title IS 'Short task title (max 255 chars)';
COMMENT ON COLUMN tasks.description IS 'Detailed task description';
COMMENT ON COLUMN tasks.time_estimate_hours IS 'Estimated time to complete in hours';
COMMENT ON COLUMN tasks.time_spent_hours IS 'Actual time spent in hours';
COMMENT ON COLUMN tasks.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN tasks.assigned_to IS 'Current assignee (team member ID)';
COMMENT ON COLUMN tasks.created_by IS 'User who created this task';
