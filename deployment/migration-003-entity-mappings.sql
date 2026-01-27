-- ==============================================================================
-- MIGRATION 003: ENTITY MAPPINGS TABLE
-- ==============================================================================
-- Description: Create table for tracking Logos Vision <-> Pulse entity mappings
-- Version: 1.0.0
-- Date: 2026-01-25
-- Author: DevOps Automator
-- Dependencies: migration-001-contacts-pulse-integration.sql
-- Rollback: See migration-003-rollback.sql
-- ==============================================================================

-- ==============================================================================
-- PHASE 1: CREATE ENTITY_MAPPINGS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS entity_mappings (
  -- Primary key
  id SERIAL PRIMARY KEY,

  -- Entity identification
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'document', 'interaction', 'task', 'event', 'organization')),
  lv_entity_id TEXT NOT NULL,
  pulse_entity_id TEXT NOT NULL,

  -- Sync metadata
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict', 'disabled')) DEFAULT 'pending',
  sync_direction TEXT CHECK (sync_direction IN ('lv_to_pulse', 'pulse_to_lv', 'bidirectional')),
  sync_error TEXT,
  sync_retry_count INTEGER DEFAULT 0 CHECK (sync_retry_count >= 0),

  -- Data integrity
  lv_last_modified_at TIMESTAMPTZ,
  pulse_last_modified_at TIMESTAMPTZ,
  data_hash TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unique constraints
  CONSTRAINT uq_entity_mappings_lv UNIQUE(entity_type, lv_entity_id),
  CONSTRAINT uq_entity_mappings_pulse UNIQUE(entity_type, pulse_entity_id)
);

COMMENT ON TABLE entity_mappings IS 'Bidirectional entity mappings between Logos Vision and Pulse';
COMMENT ON COLUMN entity_mappings.entity_type IS 'Type of entity being mapped';
COMMENT ON COLUMN entity_mappings.lv_entity_id IS 'Logos Vision entity ID';
COMMENT ON COLUMN entity_mappings.pulse_entity_id IS 'Pulse platform entity ID';
COMMENT ON COLUMN entity_mappings.sync_status IS 'Current synchronization status';
COMMENT ON COLUMN entity_mappings.data_hash IS 'Hash of entity data for conflict detection';

-- ==============================================================================
-- PHASE 2: CREATE INDEXES
-- ==============================================================================

-- Index for looking up by Logos Vision entity
CREATE INDEX idx_entity_mappings_type_lv
ON entity_mappings(entity_type, lv_entity_id)
WHERE sync_status != 'disabled';

-- Index for looking up by Pulse entity
CREATE INDEX idx_entity_mappings_type_pulse
ON entity_mappings(entity_type, pulse_entity_id)
WHERE sync_status != 'disabled';

-- Index for finding pending syncs
CREATE INDEX idx_entity_mappings_pending_sync
ON entity_mappings(entity_type, sync_status, last_synced_at)
WHERE sync_status IN ('pending', 'failed');

-- Index for monitoring failed syncs
CREATE INDEX idx_entity_mappings_failed
ON entity_mappings(entity_type, sync_retry_count, updated_at)
WHERE sync_status = 'failed';

-- ==============================================================================
-- PHASE 3: CREATE UPDATED_AT TRIGGER
-- ==============================================================================

CREATE TRIGGER trigger_entity_mappings_updated_at
  BEFORE UPDATE ON entity_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================

DO $$
BEGIN
  INSERT INTO schema_migrations (version, description)
  VALUES ('003', 'Entity Mappings - Create bidirectional sync mapping table')
  ON CONFLICT (version) DO NOTHING;

  RAISE NOTICE 'Migration 003 completed successfully';
END $$;
