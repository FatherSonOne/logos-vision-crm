-- ============================================
-- MIGRATION: Complete Projects Table Setup
-- ============================================
-- Run this in Supabase SQL Editor to add all missing columns
-- This adds: pinned, starred, team_member_ids, archived, is_active
-- ============================================

-- Add pinned column (for pinning favorite projects)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Add starred column (for starring projects)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false;

-- Add team_member_ids array column (stores assigned team member UUIDs)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS team_member_ids UUID[] DEFAULT '{}';

-- Add archived column (for archiving completed/old projects)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add is_active column (for soft-deleting projects)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_pinned ON projects(pinned) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS idx_projects_starred ON projects(starred) WHERE starred = true;
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- ============================================
-- Update any existing null values
-- ============================================

UPDATE projects SET pinned = false WHERE pinned IS NULL;
UPDATE projects SET starred = false WHERE starred IS NULL;
UPDATE projects SET archived = false WHERE archived IS NULL;
UPDATE projects SET is_active = true WHERE is_active IS NULL;
UPDATE projects SET team_member_ids = '{}' WHERE team_member_ids IS NULL;

-- ============================================
-- VERIFY: Check all columns were added
-- ============================================
-- Run this query to verify:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'projects'
AND column_name IN ('pinned', 'starred', 'team_member_ids', 'archived', 'is_active')
ORDER BY column_name;

-- ============================================
-- SUCCESS!
-- ============================================
-- You should see 5 rows returned showing all the new columns.
-- Next step: Run the data migration script to populate projects.
