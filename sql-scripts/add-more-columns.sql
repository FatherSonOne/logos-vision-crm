-- ============================================================================
-- ADD ADDITIONAL MISSING COLUMNS TO SUPABASE TABLES
-- ============================================================================
-- Run this in your Supabase SQL Editor to add the remaining missing columns
-- ============================================================================

-- 1. Add 'case_id' column to activities table
-- This allows linking activities to specific cases (optional relationship)
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES cases(id) ON DELETE SET NULL;

COMMENT ON COLUMN activities.case_id IS 'Optional link to a case this activity relates to';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_case ON activities(case_id);

-- ============================================================================

-- 2. Add 'category' column to cases table
-- This categorizes the type of case (e.g., Technical Support, Billing, etc.)
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS category TEXT;

COMMENT ON COLUMN cases.category IS 'Category or type of the case';

-- ============================================================================

-- 3. Add 'is_recurring' column to donations table
-- This tracks whether a donation is one-time or recurring
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

COMMENT ON COLUMN donations.is_recurring IS 'Whether this is a recurring donation';

-- ============================================================================

-- Verify the changes
DO $$ 
BEGIN
    RAISE NOTICE '✅ Additional schema updates completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Added columns:';
    RAISE NOTICE '  • activities.case_id (UUID, FK to cases)';
    RAISE NOTICE '  • cases.category (TEXT)';
    RAISE NOTICE '  • donations.is_recurring (BOOLEAN)';
    RAISE NOTICE '';
    RAISE NOTICE 'Schema is now ready for migration!';
END $$;
