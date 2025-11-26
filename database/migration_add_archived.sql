-- Migration: Add archived column to projects table
-- Run this in Supabase SQL Editor

-- Add archived column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'archived'
    ) THEN
        ALTER TABLE projects ADD COLUMN archived BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create index for faster filtering of archived/non-archived projects
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);

-- Optional: Update any null values to false
UPDATE projects SET archived = false WHERE archived IS NULL;

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'archived';
