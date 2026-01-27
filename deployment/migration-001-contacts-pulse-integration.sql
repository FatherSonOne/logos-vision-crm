-- ==============================================================================
-- MIGRATION 001: CONTACTS PULSE INTEGRATION
-- ==============================================================================
-- Description: Extend contacts table with Pulse relationship intelligence fields
-- Version: 1.0.0
-- Date: 2026-01-25
-- Author: DevOps Automator
-- Dependencies: None
-- Rollback: See migration-001-rollback.sql
-- ==============================================================================

-- ==============================================================================
-- PHASE 1: PRE-MIGRATION VALIDATION
-- ==============================================================================

-- Verify contacts table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
    RAISE EXCEPTION 'contacts table does not exist. Cannot proceed with migration.';
  END IF;
END $$;

-- ==============================================================================
-- PHASE 2: BACKUP EXISTING DATA
-- ==============================================================================

-- Create backup table with timestamp
DO $$
DECLARE
  backup_table_name TEXT := 'contacts_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS');
BEGIN
  EXECUTE format('CREATE TABLE %I AS SELECT * FROM contacts', backup_table_name);
  RAISE NOTICE 'Backup created: %', backup_table_name;
END $$;

-- ==============================================================================
-- PHASE 3: ADD NEW COLUMNS
-- ==============================================================================

-- Add Pulse profile relationship
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pulse_profile_id TEXT;

-- Add relationship intelligence fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS relationship_score INTEGER CHECK (relationship_score >= 0 AND relationship_score <= 100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS relationship_trend TEXT CHECK (relationship_trend IN ('rising', 'stable', 'declining', 'new'));

-- Add interaction tracking
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS total_interactions INTEGER DEFAULT 0 CHECK (total_interactions >= 0);

-- Add communication preferences
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preferred_channel TEXT CHECK (preferred_channel IN ('email', 'phone', 'text', 'video', 'in-person'));
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS communication_frequency TEXT CHECK (communication_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'rarely'));

-- Add categorization and notes
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pulse_tags TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pulse_notes TEXT;

-- Add status flags
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;

-- Add donor-specific fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS donor_stage TEXT CHECK (donor_stage IN ('prospect', 'first-time', 'repeat', 'major', 'lapsed', 'retired'));
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS engagement_score TEXT CHECK (engagement_score IN ('cold', 'warm', 'hot', 'champion'));
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS total_lifetime_giving NUMERIC(12, 2) DEFAULT 0 CHECK (total_lifetime_giving >= 0);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_gift_date DATE;

-- Add metadata tracking
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pulse_last_synced_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pulse_sync_status TEXT CHECK (pulse_sync_status IN ('synced', 'pending', 'failed', 'disabled')) DEFAULT 'pending';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pulse_sync_error TEXT;

-- ==============================================================================
-- PHASE 4: CREATE INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Index for Pulse profile lookups
CREATE INDEX IF NOT EXISTS idx_contacts_pulse_profile_id
ON contacts(pulse_profile_id)
WHERE pulse_profile_id IS NOT NULL;

-- Index for relationship score queries (range queries)
CREATE INDEX IF NOT EXISTS idx_contacts_relationship_score
ON contacts(relationship_score DESC NULLS LAST)
WHERE relationship_score IS NOT NULL;

-- Index for relationship trend filtering
CREATE INDEX IF NOT EXISTS idx_contacts_relationship_trend
ON contacts(relationship_trend)
WHERE relationship_trend IS NOT NULL;

-- Index for last interaction date (recent contacts)
CREATE INDEX IF NOT EXISTS idx_contacts_last_interaction
ON contacts(last_interaction_date DESC NULLS LAST)
WHERE last_interaction_date IS NOT NULL;

-- Index for donor stage filtering
CREATE INDEX IF NOT EXISTS idx_contacts_donor_stage
ON contacts(donor_stage)
WHERE donor_stage IS NOT NULL;

-- Index for engagement score filtering
CREATE INDEX IF NOT EXISTS idx_contacts_engagement_score
ON contacts(engagement_score)
WHERE engagement_score IS NOT NULL;

-- Composite index for VIP and favorite contacts
CREATE INDEX IF NOT EXISTS idx_contacts_status_flags
ON contacts(is_vip, is_favorite, is_blocked)
WHERE is_vip = true OR is_favorite = true;

-- Index for sync status monitoring
CREATE INDEX IF NOT EXISTS idx_contacts_sync_status
ON contacts(pulse_sync_status, pulse_last_synced_at)
WHERE pulse_sync_status IS NOT NULL;

-- Full-text search index for pulse_tags (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_contacts_pulse_tags
ON contacts USING GIN(pulse_tags)
WHERE pulse_tags IS NOT NULL;

-- ==============================================================================
-- PHASE 5: ADD COMMENTS FOR DOCUMENTATION
-- ==============================================================================

COMMENT ON COLUMN contacts.pulse_profile_id IS 'Foreign key to Pulse Communication Platform profile ID';
COMMENT ON COLUMN contacts.relationship_score IS 'AI-calculated relationship health score (0-100)';
COMMENT ON COLUMN contacts.relationship_trend IS 'Recent trend direction: rising, stable, declining, new';
COMMENT ON COLUMN contacts.last_interaction_date IS 'Most recent interaction timestamp from Pulse';
COMMENT ON COLUMN contacts.total_interactions IS 'Total number of logged interactions';
COMMENT ON COLUMN contacts.preferred_channel IS 'Contact''s preferred communication method';
COMMENT ON COLUMN contacts.communication_frequency IS 'Expected communication cadence';
COMMENT ON COLUMN contacts.pulse_tags IS 'Array of tags from Pulse (e.g., ["board-member", "monthly-donor"])';
COMMENT ON COLUMN contacts.pulse_notes IS 'Free-form notes synced from Pulse';
COMMENT ON COLUMN contacts.is_favorite IS 'User-marked as favorite contact';
COMMENT ON COLUMN contacts.is_blocked IS 'Blocked from communications';
COMMENT ON COLUMN contacts.is_vip IS 'VIP status (high-priority contact)';
COMMENT ON COLUMN contacts.donor_stage IS 'Donor lifecycle stage';
COMMENT ON COLUMN contacts.engagement_score IS 'Current engagement level';
COMMENT ON COLUMN contacts.total_lifetime_giving IS 'Total donations across all time (USD)';
COMMENT ON COLUMN contacts.last_gift_date IS 'Date of most recent donation';
COMMENT ON COLUMN contacts.pulse_last_synced_at IS 'Last successful sync timestamp';
COMMENT ON COLUMN contacts.pulse_sync_status IS 'Current sync status with Pulse';
COMMENT ON COLUMN contacts.pulse_sync_error IS 'Error message from last failed sync';

-- ==============================================================================
-- PHASE 6: POST-MIGRATION VALIDATION
-- ==============================================================================

-- Verify all columns were created
DO $$
DECLARE
  missing_columns TEXT[];
  expected_columns TEXT[] := ARRAY[
    'pulse_profile_id',
    'relationship_score',
    'relationship_trend',
    'last_interaction_date',
    'total_interactions',
    'preferred_channel',
    'communication_frequency',
    'pulse_tags',
    'pulse_notes',
    'is_favorite',
    'is_blocked',
    'is_vip',
    'donor_stage',
    'engagement_score',
    'total_lifetime_giving',
    'last_gift_date',
    'pulse_last_synced_at',
    'pulse_sync_status',
    'pulse_sync_error'
  ];
  col TEXT;
BEGIN
  FOREACH col IN ARRAY expected_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'contacts' AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;

  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Migration incomplete. Missing columns: %', array_to_string(missing_columns, ', ');
  END IF;

  RAISE NOTICE 'All columns created successfully';
END $$;

-- Verify all indexes were created
DO $$
DECLARE
  missing_indexes TEXT[];
  expected_indexes TEXT[] := ARRAY[
    'idx_contacts_pulse_profile_id',
    'idx_contacts_relationship_score',
    'idx_contacts_relationship_trend',
    'idx_contacts_last_interaction',
    'idx_contacts_donor_stage',
    'idx_contacts_engagement_score',
    'idx_contacts_status_flags',
    'idx_contacts_sync_status',
    'idx_contacts_pulse_tags'
  ];
  idx TEXT;
BEGIN
  FOREACH idx IN ARRAY expected_indexes
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE tablename = 'contacts' AND indexname = idx
    ) THEN
      missing_indexes := array_append(missing_indexes, idx);
    END IF;
  END LOOP;

  IF array_length(missing_indexes, 1) > 0 THEN
    RAISE WARNING 'Some indexes missing: %', array_to_string(missing_indexes, ', ');
  ELSE
    RAISE NOTICE 'All indexes created successfully';
  END IF;
END $$;

-- Record migration completion
DO $$
BEGIN
  -- Create migrations tracking table if it doesn't exist
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT now(),
    description TEXT
  );

  -- Record this migration
  INSERT INTO schema_migrations (version, description)
  VALUES ('001', 'Contacts Pulse Integration - Add relationship intelligence fields')
  ON CONFLICT (version) DO NOTHING;

  RAISE NOTICE 'Migration 001 completed successfully';
END $$;

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
-- Next steps:
-- 1. Run migration-002-pulse-interactions.sql to create interactions table
-- 2. Run migration-003-entity-mappings.sql to create mapping table
-- 3. Verify data integrity with validation queries
-- 4. Test Pulse API integration
-- ==============================================================================
