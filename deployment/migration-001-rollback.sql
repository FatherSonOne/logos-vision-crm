-- ==============================================================================
-- ROLLBACK 001: CONTACTS PULSE INTEGRATION
-- ==============================================================================
-- Description: Rollback Pulse relationship intelligence fields from contacts table
-- Version: 1.0.0
-- Date: 2026-01-25
-- Author: DevOps Automator
-- WARNING: This will drop all Pulse integration data. Backup before running!
-- ==============================================================================

-- ==============================================================================
-- PHASE 1: PRE-ROLLBACK VALIDATION
-- ==============================================================================

-- Verify contacts table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
    RAISE EXCEPTION 'contacts table does not exist. Cannot proceed with rollback.';
  END IF;
END $$;

-- Check if there's data to preserve
DO $$
DECLARE
  pulse_data_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pulse_data_count
  FROM contacts
  WHERE pulse_profile_id IS NOT NULL;

  IF pulse_data_count > 0 THEN
    RAISE WARNING 'Found % contacts with Pulse data. This data will be lost after rollback!', pulse_data_count;
    RAISE NOTICE 'Create a backup before proceeding: CREATE TABLE contacts_pulse_backup AS SELECT * FROM contacts WHERE pulse_profile_id IS NOT NULL';
  ELSE
    RAISE NOTICE 'No Pulse data found. Safe to proceed with rollback.';
  END IF;
END $$;

-- ==============================================================================
-- PHASE 2: CREATE BACKUP BEFORE ROLLBACK
-- ==============================================================================

-- Create rollback backup table with timestamp
DO $$
DECLARE
  rollback_backup_name TEXT := 'contacts_rollback_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS');
BEGIN
  EXECUTE format('CREATE TABLE %I AS SELECT * FROM contacts', rollback_backup_name);
  RAISE NOTICE 'Rollback backup created: %', rollback_backup_name;
END $$;

-- ==============================================================================
-- PHASE 3: DROP INDEXES
-- ==============================================================================

DROP INDEX IF EXISTS idx_contacts_pulse_profile_id;
DROP INDEX IF EXISTS idx_contacts_relationship_score;
DROP INDEX IF EXISTS idx_contacts_relationship_trend;
DROP INDEX IF EXISTS idx_contacts_last_interaction;
DROP INDEX IF EXISTS idx_contacts_donor_stage;
DROP INDEX IF EXISTS idx_contacts_engagement_score;
DROP INDEX IF EXISTS idx_contacts_status_flags;
DROP INDEX IF EXISTS idx_contacts_sync_status;
DROP INDEX IF EXISTS idx_contacts_pulse_tags;

RAISE NOTICE 'All Pulse-related indexes dropped';

-- ==============================================================================
-- PHASE 4: DROP COLUMNS
-- ==============================================================================

-- Drop Pulse profile relationship
ALTER TABLE contacts DROP COLUMN IF EXISTS pulse_profile_id;

-- Drop relationship intelligence fields
ALTER TABLE contacts DROP COLUMN IF EXISTS relationship_score;
ALTER TABLE contacts DROP COLUMN IF EXISTS relationship_trend;

-- Drop interaction tracking
ALTER TABLE contacts DROP COLUMN IF EXISTS last_interaction_date;
ALTER TABLE contacts DROP COLUMN IF EXISTS total_interactions;

-- Drop communication preferences
ALTER TABLE contacts DROP COLUMN IF EXISTS preferred_channel;
ALTER TABLE contacts DROP COLUMN IF EXISTS communication_frequency;

-- Drop categorization and notes
ALTER TABLE contacts DROP COLUMN IF EXISTS pulse_tags;
ALTER TABLE contacts DROP COLUMN IF EXISTS pulse_notes;

-- Drop status flags
ALTER TABLE contacts DROP COLUMN IF EXISTS is_favorite;
ALTER TABLE contacts DROP COLUMN IF EXISTS is_blocked;
ALTER TABLE contacts DROP COLUMN IF EXISTS is_vip;

-- Drop donor-specific fields
ALTER TABLE contacts DROP COLUMN IF EXISTS donor_stage;
ALTER TABLE contacts DROP COLUMN IF EXISTS engagement_score;
ALTER TABLE contacts DROP COLUMN IF EXISTS total_lifetime_giving;
ALTER TABLE contacts DROP COLUMN IF EXISTS last_gift_date;

-- Drop metadata tracking
ALTER TABLE contacts DROP COLUMN IF EXISTS pulse_last_synced_at;
ALTER TABLE contacts DROP COLUMN IF EXISTS pulse_sync_status;
ALTER TABLE contacts DROP COLUMN IF EXISTS pulse_sync_error;

RAISE NOTICE 'All Pulse-related columns dropped';

-- ==============================================================================
-- PHASE 5: POST-ROLLBACK VALIDATION
-- ==============================================================================

-- Verify all columns were dropped
DO $$
DECLARE
  remaining_columns TEXT[];
  pulse_columns TEXT[] := ARRAY[
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
  FOREACH col IN ARRAY pulse_columns
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'contacts' AND column_name = col
    ) THEN
      remaining_columns := array_append(remaining_columns, col);
    END IF;
  END LOOP;

  IF array_length(remaining_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Rollback incomplete. Remaining columns: %', array_to_string(remaining_columns, ', ');
  END IF;

  RAISE NOTICE 'All Pulse columns removed successfully';
END $$;

-- Verify all indexes were dropped
DO $$
DECLARE
  remaining_indexes TEXT[];
  pulse_indexes TEXT[] := ARRAY[
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
  FOREACH idx IN ARRAY pulse_indexes
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE tablename = 'contacts' AND indexname = idx
    ) THEN
      remaining_indexes := array_append(remaining_indexes, idx);
    END IF;
  END LOOP;

  IF array_length(remaining_indexes, 1) > 0 THEN
    RAISE WARNING 'Some indexes remain: %', array_to_string(remaining_indexes, ', ');
  ELSE
    RAISE NOTICE 'All Pulse indexes removed successfully';
  END IF;
END $$;

-- Record rollback in migrations table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations') THEN
    DELETE FROM schema_migrations WHERE version = '001';
    RAISE NOTICE 'Migration 001 record removed from schema_migrations';
  END IF;
END $$;

-- ==============================================================================
-- ROLLBACK COMPLETE
-- ==============================================================================
-- WARNING: All Pulse integration data has been removed from the contacts table
--
-- To restore data from backup:
-- 1. Find the backup table: SELECT tablename FROM pg_tables WHERE tablename LIKE 'contacts_rollback_backup_%' ORDER BY tablename DESC LIMIT 1;
-- 2. Restore data: INSERT INTO contacts SELECT * FROM [backup_table_name] ON CONFLICT (id) DO UPDATE SET ...;
--
-- To re-apply migration:
-- Run migration-001-contacts-pulse-integration.sql
-- ==============================================================================
