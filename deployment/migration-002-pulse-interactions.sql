-- ==============================================================================
-- MIGRATION 002: PULSE CONTACT INTERACTIONS TABLE
-- ==============================================================================
-- Description: Create table for storing detailed contact interaction history
-- Version: 1.0.0
-- Date: 2026-01-25
-- Author: DevOps Automator
-- Dependencies: migration-001-contacts-pulse-integration.sql
-- Rollback: See migration-002-rollback.sql
-- ==============================================================================

-- ==============================================================================
-- PHASE 1: PRE-MIGRATION VALIDATION
-- ==============================================================================

-- Verify contacts table exists with Pulse fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
    RAISE EXCEPTION 'contacts table does not exist. Run migration 001 first.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'pulse_profile_id'
  ) THEN
    RAISE EXCEPTION 'contacts table missing pulse_profile_id column. Run migration 001 first.';
  END IF;

  RAISE NOTICE 'Pre-migration validation passed';
END $$;

-- ==============================================================================
-- PHASE 2: CREATE PULSE_CONTACT_INTERACTIONS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS pulse_contact_interactions (
  -- Primary identification
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  pulse_profile_id TEXT NOT NULL,

  -- Interaction metadata
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'email_sent',
    'email_received',
    'call_outbound',
    'call_inbound',
    'meeting_scheduled',
    'meeting_attended',
    'message_sent',
    'message_received',
    'note_added',
    'gift_received',
    'event_attended',
    'other'
  )),
  interaction_date TIMESTAMPTZ NOT NULL,

  -- Communication details
  channel TEXT CHECK (channel IN ('email', 'phone', 'text', 'video', 'in-person', 'social', 'other')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound', 'bilateral')),

  -- Content summary
  subject TEXT,
  snippet TEXT,
  full_content TEXT,

  -- AI-generated insights
  sentiment_score NUMERIC(3, 2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label TEXT CHECK (sentiment_label IN ('very_negative', 'negative', 'neutral', 'positive', 'very_positive')),
  ai_topics TEXT[],
  ai_action_items TEXT[],
  ai_summary TEXT,
  ai_key_points TEXT[],

  -- Meeting-specific fields
  duration_minutes INTEGER CHECK (duration_minutes >= 0),
  meeting_attendees TEXT[],
  meeting_location TEXT,

  -- Attachment metadata
  has_attachments BOOLEAN DEFAULT false,
  attachment_count INTEGER DEFAULT 0 CHECK (attachment_count >= 0),
  attachment_types TEXT[],

  -- Engagement metrics
  response_time_hours NUMERIC(10, 2),
  engagement_level TEXT CHECK (engagement_level IN ('low', 'medium', 'high')),

  -- Relationship impact
  relationship_score_change INTEGER CHECK (relationship_score_change >= -100 AND relationship_score_change <= 100),

  -- Status and metadata
  is_important BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Sync tracking
  synced_from_pulse_at TIMESTAMPTZ,
  pulse_last_modified_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Foreign key constraint
  CONSTRAINT fk_contact
    FOREIGN KEY (contact_id)
    REFERENCES contacts(id)
    ON DELETE CASCADE
);

COMMENT ON TABLE pulse_contact_interactions IS 'Detailed interaction history synced from Pulse Communication Platform';
COMMENT ON COLUMN pulse_contact_interactions.id IS 'Unique interaction ID from Pulse';
COMMENT ON COLUMN pulse_contact_interactions.contact_id IS 'Reference to contacts table';
COMMENT ON COLUMN pulse_contact_interactions.pulse_profile_id IS 'Pulse profile ID for validation';
COMMENT ON COLUMN pulse_contact_interactions.interaction_type IS 'Type of interaction (email, call, meeting, etc.)';
COMMENT ON COLUMN pulse_contact_interactions.sentiment_score IS 'AI-calculated sentiment (-1 to +1, negative to positive)';
COMMENT ON COLUMN pulse_contact_interactions.ai_topics IS 'Key topics extracted by AI';
COMMENT ON COLUMN pulse_contact_interactions.ai_action_items IS 'Action items identified by AI';
COMMENT ON COLUMN pulse_contact_interactions.relationship_score_change IS 'Impact on relationship score (-100 to +100)';

-- ==============================================================================
-- PHASE 3: CREATE INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Primary lookup index by contact
CREATE INDEX idx_pulse_interactions_contact
ON pulse_contact_interactions(contact_id, interaction_date DESC);

-- Index for date-based queries (recent interactions)
CREATE INDEX idx_pulse_interactions_date
ON pulse_contact_interactions(interaction_date DESC)
WHERE is_archived = false;

-- Index for Pulse profile lookups
CREATE INDEX idx_pulse_interactions_profile
ON pulse_contact_interactions(pulse_profile_id, interaction_date DESC);

-- Index for interaction type filtering
CREATE INDEX idx_pulse_interactions_type
ON pulse_contact_interactions(interaction_type, interaction_date DESC);

-- Index for channel filtering
CREATE INDEX idx_pulse_interactions_channel
ON pulse_contact_interactions(channel)
WHERE channel IS NOT NULL;

-- Index for sentiment analysis queries
CREATE INDEX idx_pulse_interactions_sentiment
ON pulse_contact_interactions(sentiment_label, interaction_date DESC)
WHERE sentiment_label IS NOT NULL;

-- Index for important/flagged interactions
CREATE INDEX idx_pulse_interactions_important
ON pulse_contact_interactions(contact_id, interaction_date DESC)
WHERE is_important = true AND is_archived = false;

-- Full-text search index for content
CREATE INDEX idx_pulse_interactions_content_search
ON pulse_contact_interactions USING GIN(
  to_tsvector('english', COALESCE(subject, '') || ' ' || COALESCE(snippet, '') || ' ' || COALESCE(ai_summary, ''))
);

-- Index for AI topics (array operations)
CREATE INDEX idx_pulse_interactions_topics
ON pulse_contact_interactions USING GIN(ai_topics)
WHERE ai_topics IS NOT NULL;

-- ==============================================================================
-- PHASE 4: CREATE UPDATED_AT TRIGGER
-- ==============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_pulse_interactions_updated_at
  BEFORE UPDATE ON pulse_contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp on row modification';

-- ==============================================================================
-- PHASE 5: CREATE AGGREGATE UPDATE TRIGGER
-- ==============================================================================

-- Function to update contact interaction stats when interaction is added/modified
CREATE OR REPLACE FUNCTION update_contact_interaction_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update contact's total_interactions and last_interaction_date
  UPDATE contacts
  SET
    total_interactions = (
      SELECT COUNT(*)
      FROM pulse_contact_interactions
      WHERE contact_id = COALESCE(NEW.contact_id, OLD.contact_id)
        AND is_archived = false
    ),
    last_interaction_date = (
      SELECT MAX(interaction_date)
      FROM pulse_contact_interactions
      WHERE contact_id = COALESCE(NEW.contact_id, OLD.contact_id)
        AND is_archived = false
    )
  WHERE id = COALESCE(NEW.contact_id, OLD.contact_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT
CREATE TRIGGER trigger_contact_stats_on_insert
  AFTER INSERT ON pulse_contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_interaction_stats();

-- Trigger on UPDATE (when is_archived changes)
CREATE TRIGGER trigger_contact_stats_on_update
  AFTER UPDATE OF is_archived ON pulse_contact_interactions
  FOR EACH ROW
  WHEN (OLD.is_archived IS DISTINCT FROM NEW.is_archived)
  EXECUTE FUNCTION update_contact_interaction_stats();

-- Trigger on DELETE
CREATE TRIGGER trigger_contact_stats_on_delete
  AFTER DELETE ON pulse_contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_interaction_stats();

COMMENT ON FUNCTION update_contact_interaction_stats() IS 'Updates contact aggregate stats when interactions change';

-- ==============================================================================
-- PHASE 6: CREATE VIEWS FOR COMMON QUERIES
-- ==============================================================================

-- View: Recent interactions (last 30 days)
CREATE OR REPLACE VIEW recent_contact_interactions AS
SELECT
  i.*,
  c.name AS contact_name,
  c.email AS contact_email,
  c.relationship_score
FROM pulse_contact_interactions i
JOIN contacts c ON i.contact_id = c.id
WHERE i.interaction_date >= now() - INTERVAL '30 days'
  AND i.is_archived = false
ORDER BY i.interaction_date DESC;

COMMENT ON VIEW recent_contact_interactions IS 'Interactions from the last 30 days with contact details';

-- View: High-value interactions (important or high engagement)
CREATE OR REPLACE VIEW high_value_interactions AS
SELECT
  i.*,
  c.name AS contact_name,
  c.email AS contact_email,
  c.relationship_score
FROM pulse_contact_interactions i
JOIN contacts c ON i.contact_id = c.id
WHERE (i.is_important = true OR i.engagement_level = 'high')
  AND i.is_archived = false
ORDER BY i.interaction_date DESC;

COMMENT ON VIEW high_value_interactions IS 'Important or high-engagement interactions';

-- ==============================================================================
-- PHASE 7: POST-MIGRATION VALIDATION
-- ==============================================================================

-- Verify table was created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pulse_contact_interactions') THEN
    RAISE EXCEPTION 'pulse_contact_interactions table was not created';
  END IF;

  RAISE NOTICE 'Table created successfully';
END $$;

-- Verify all indexes were created
DO $$
DECLARE
  expected_count INTEGER := 9;
  actual_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO actual_count
  FROM pg_indexes
  WHERE tablename = 'pulse_contact_interactions';

  IF actual_count < expected_count THEN
    RAISE WARNING 'Expected at least % indexes, found %', expected_count, actual_count;
  ELSE
    RAISE NOTICE 'All indexes created successfully (% indexes)', actual_count;
  END IF;
END $$;

-- Verify triggers were created
DO $$
DECLARE
  expected_triggers INTEGER := 4;
  actual_triggers INTEGER;
BEGIN
  SELECT COUNT(*) INTO actual_triggers
  FROM pg_trigger
  WHERE tgrelid = 'pulse_contact_interactions'::regclass;

  IF actual_triggers < expected_triggers THEN
    RAISE WARNING 'Expected at least % triggers, found %', expected_triggers, actual_triggers;
  ELSE
    RAISE NOTICE 'All triggers created successfully (% triggers)', actual_triggers;
  END IF;
END $$;

-- Verify views were created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'recent_contact_interactions') THEN
    RAISE WARNING 'recent_contact_interactions view was not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'high_value_interactions') THEN
    RAISE WARNING 'high_value_interactions view was not created';
  END IF;

  RAISE NOTICE 'Views created successfully';
END $$;

-- Record migration completion
DO $$
BEGIN
  INSERT INTO schema_migrations (version, description)
  VALUES ('002', 'Pulse Contact Interactions - Create interactions tracking table')
  ON CONFLICT (version) DO NOTHING;

  RAISE NOTICE 'Migration 002 completed successfully';
END $$;

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
-- Next steps:
-- 1. Run migration-003-entity-mappings.sql to create entity mapping table
-- 2. Test interaction syncing from Pulse API
-- 3. Verify triggers update contact stats correctly
-- ==============================================================================
