-- ============================================================================
-- ADD MISSING COLUMNS TO SUPABASE TABLES
-- ============================================================================
-- This script adds columns that exist in mock data but are missing from the database
-- Run this in your Supabase SQL Editor before running migrations
-- ============================================================================

-- 1. Add 'notes' column to projects table
-- This will store project notes and additional information
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN projects.notes IS 'Additional notes and information about the project';

-- ============================================================================

-- 2. Add 'activity_time' column to activities table
-- This stores the specific time when an activity occurred
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS activity_time TIMESTAMPTZ;

COMMENT ON COLUMN activities.activity_time IS 'Specific timestamp when the activity occurred';

-- ============================================================================

-- 3. Add 'assigned_to_id' column to cases table
-- This links a case to a team member who is responsible for it
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES team_members(id) ON DELETE SET NULL;

COMMENT ON COLUMN cases.assigned_to_id IS 'Team member assigned to handle this case';

-- Create an index for faster queries on assigned cases
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to_id);

-- ============================================================================

-- 4. Add 'campaign' column to donations table
-- This stores which fundraising campaign the donation is associated with
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS campaign TEXT;

COMMENT ON COLUMN donations.campaign IS 'Fundraising campaign associated with this donation';

-- ============================================================================

-- Verify the changes
DO $$ 
BEGIN
    RAISE NOTICE '✅ Schema updates completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Added columns:';
    RAISE NOTICE '  • projects.notes (TEXT)';
    RAISE NOTICE '  • activities.activity_time (TIMESTAMPTZ)';
    RAISE NOTICE '  • cases.assigned_to_id (UUID, FK to team_members)';
    RAISE NOTICE '  • donations.campaign (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now run your migration scripts!';
END $$;
