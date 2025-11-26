-- ============================================
-- MIGRATION: Project Notes Table for Collaboration
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Create project_notes table
CREATE TABLE IF NOT EXISTS project_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_author_id ON project_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_is_pinned ON project_notes(is_pinned) WHERE is_pinned = true;

-- Create project_activities table for activity log
CREATE TABLE IF NOT EXISTS project_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- 'note_added', 'status_changed', 'member_assigned', etc.
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for project activities
CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON project_activities(project_id);

-- Add trigger to update updated_at on project_notes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_notes_updated_at
    BEFORE UPDATE ON project_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFY: Check the tables were created
-- ============================================
-- Run this query to verify:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('project_notes', 'project_activities');
