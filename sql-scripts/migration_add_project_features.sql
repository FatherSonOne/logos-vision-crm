-- ============================================
-- MIGRATION: Add Pin/Star/TeamMemberIds to Projects
-- ============================================
-- Run this in Supabase SQL Editor to add new columns
-- ============================================

-- Add pinned column (for pinning favorite projects)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Add starred column (for starring projects)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false;

-- Add team_member_ids array column (stores assigned team member UUIDs)
-- Note: This is in addition to the project_team_assignments junction table
-- for simpler querying from the app
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS team_member_ids UUID[] DEFAULT '{}';

-- Create index for faster queries on pinned/starred projects
CREATE INDEX IF NOT EXISTS idx_projects_pinned ON projects(pinned) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS idx_projects_starred ON projects(starred) WHERE starred = true;

-- ============================================
-- VERIFY: Check the columns were added
-- ============================================
-- Run this query to verify:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'projects' 
-- AND column_name IN ('pinned', 'starred', 'team_member_ids');
