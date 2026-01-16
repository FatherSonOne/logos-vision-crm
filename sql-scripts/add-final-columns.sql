-- ============================================================================
-- ADD FINAL MISSING COLUMNS TO SUPABASE TABLES
-- ============================================================================
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 1. Add 'closed_date' column to cases table
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS closed_date TIMESTAMPTZ;

COMMENT ON COLUMN cases.closed_date IS 'Date when the case was closed/resolved';

-- ============================================================================

-- 2. Add 'tax_receipt_sent' column to donations table
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS tax_receipt_sent BOOLEAN DEFAULT false;

COMMENT ON COLUMN donations.tax_receipt_sent IS 'Whether a tax receipt has been sent for this donation';

-- ============================================================================

-- Verify the changes
DO $$ 
BEGIN
    RAISE NOTICE '✅ Final schema updates completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Added columns:';
    RAISE NOTICE '  • cases.closed_date (TIMESTAMPTZ)';
    RAISE NOTICE '  • donations.tax_receipt_sent (BOOLEAN)';
    RAISE NOTICE '';
    RAISE NOTICE 'Schema is complete!';
END $$;
