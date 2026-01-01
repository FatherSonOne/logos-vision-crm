-- ============================================
-- ENTOMATE INTEGRATION MIGRATION
-- ============================================
-- This migration adds support for syncing data between
-- Logos Vision CRM and Entomate meeting assistant.
--
-- Run this migration to enable:
-- - Action item → Task sync
-- - Meeting → Activity sync
-- - Project linking
-- - Sync audit logging
-- ============================================

-- ============================================
-- 1. ADD ENTOMATE REFERENCE COLUMNS TO TASKS
-- ============================================
-- These columns link Logos Vision tasks to Entomate action items

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS entomate_action_item_id VARCHAR(256),
ADD COLUMN IF NOT EXISTS entomate_meeting_id VARCHAR(256),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium';

-- Index for fast lookup by Entomate ID
CREATE INDEX IF NOT EXISTS idx_tasks_entomate_action_item_id
ON tasks(entomate_action_item_id)
WHERE entomate_action_item_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_entomate_meeting_id
ON tasks(entomate_meeting_id)
WHERE entomate_meeting_id IS NOT NULL;

COMMENT ON COLUMN tasks.entomate_action_item_id IS 'Links to Entomate action_items.id for bidirectional sync';
COMMENT ON COLUMN tasks.entomate_meeting_id IS 'Links to Entomate meeting that generated this task';
COMMENT ON COLUMN tasks.priority IS 'Task priority: High, Medium, Low';

-- ============================================
-- 2. ADD ENTOMATE REFERENCE COLUMNS TO ACTIVITIES
-- ============================================
-- These columns link Logos Vision activities to Entomate meetings

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS entomate_meeting_id VARCHAR(256);

CREATE INDEX IF NOT EXISTS idx_activities_entomate_meeting_id
ON activities(entomate_meeting_id)
WHERE entomate_meeting_id IS NOT NULL;

COMMENT ON COLUMN activities.entomate_meeting_id IS 'Links to Entomate meetings.id for sync tracking';

-- ============================================
-- 3. ADD ENTOMATE REFERENCE COLUMNS TO PROJECTS
-- ============================================
-- These columns link Logos Vision projects to Entomate projects/deals

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS entomate_project_id VARCHAR(256),
ADD COLUMN IF NOT EXISTS entomate_deal_id VARCHAR(256);

CREATE INDEX IF NOT EXISTS idx_projects_entomate_project_id
ON projects(entomate_project_id)
WHERE entomate_project_id IS NOT NULL;

COMMENT ON COLUMN projects.entomate_project_id IS 'Links to Entomate projects.id';
COMMENT ON COLUMN projects.entomate_deal_id IS 'Links to Entomate CRM deal ID';

-- ============================================
-- 4. CREATE ENTOMATE SYNC LOGS TABLE
-- ============================================
-- Audit trail for all sync operations

CREATE TABLE IF NOT EXISTS entomate_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL, -- 'action_item', 'meeting', 'project'
  source_id VARCHAR(256) NOT NULL,
  destination_type VARCHAR(50) NOT NULL, -- 'task', 'activity', 'project'
  destination_id VARCHAR(256),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'synced', 'failed'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_source_type CHECK (source_type IN ('action_item', 'meeting', 'project')),
  CONSTRAINT valid_destination_type CHECK (destination_type IN ('task', 'activity', 'project')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'synced', 'failed'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_entomate_sync_logs_source
ON entomate_sync_logs(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_entomate_sync_logs_status
ON entomate_sync_logs(status);

CREATE INDEX IF NOT EXISTS idx_entomate_sync_logs_created_at
ON entomate_sync_logs(created_at DESC);

COMMENT ON TABLE entomate_sync_logs IS 'Audit log for Entomate integration sync operations';

-- ============================================
-- 5. CREATE ENTOMATE INTEGRATION CONFIG TABLE
-- ============================================
-- Stores integration configuration per organization

CREATE TABLE IF NOT EXISTS entomate_integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID, -- Optional: for multi-tenant support
  enabled BOOLEAN DEFAULT true,
  auto_sync BOOLEAN DEFAULT true,
  sync_frequency VARCHAR(20) DEFAULT '5min',
  default_team_member_id UUID REFERENCES team_members(id),
  sync_action_items BOOLEAN DEFAULT true,
  sync_meetings BOOLEAN DEFAULT true,
  sync_projects BOOLEAN DEFAULT true,
  create_activities_from_meetings BOOLEAN DEFAULT true,
  api_key_hash VARCHAR(256), -- Hashed API key for webhook authentication
  webhook_secret VARCHAR(256), -- Secret for webhook signature verification
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_sync_frequency CHECK (sync_frequency IN ('realtime', '5min', '15min', '30min', 'hourly', 'daily'))
);

COMMENT ON TABLE entomate_integration_config IS 'Configuration for Entomate integration';

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on new tables

ALTER TABLE entomate_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE entomate_integration_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read sync logs
DROP POLICY IF EXISTS "Allow authenticated read sync logs" ON entomate_sync_logs;
CREATE POLICY "Allow authenticated read sync logs"
ON entomate_sync_logs FOR SELECT
TO authenticated
USING (true);

-- Allow service role to manage sync logs
DROP POLICY IF EXISTS "Allow service role manage sync logs" ON entomate_sync_logs;
CREATE POLICY "Allow service role manage sync logs"
ON entomate_sync_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read config
DROP POLICY IF EXISTS "Allow authenticated read config" ON entomate_integration_config;
CREATE POLICY "Allow authenticated read config"
ON entomate_integration_config FOR SELECT
TO authenticated
USING (true);

-- Allow service role to manage config
DROP POLICY IF EXISTS "Allow service role manage config" ON entomate_integration_config;
CREATE POLICY "Allow service role manage config"
ON entomate_integration_config FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to get sync statistics
CREATE OR REPLACE FUNCTION get_entomate_sync_stats()
RETURNS TABLE (
  total_syncs BIGINT,
  successful_syncs BIGINT,
  failed_syncs BIGINT,
  pending_syncs BIGINT,
  last_sync_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_syncs,
    COUNT(*) FILTER (WHERE status = 'synced')::BIGINT as successful_syncs,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_syncs,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_syncs,
    MAX(created_at) as last_sync_at
  FROM entomate_sync_logs;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_entomate_sync_stats IS 'Returns summary statistics for Entomate sync operations';

-- Function to clean up old sync logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_entomate_sync_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM entomate_sync_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND status = 'synced'; -- Keep failed logs longer for debugging

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_entomate_sync_logs IS 'Removes old sync logs, keeping recent and failed entries';

-- ============================================
-- 8. INSERT DEFAULT CONFIGURATION
-- ============================================

INSERT INTO entomate_integration_config (
  enabled,
  auto_sync,
  sync_frequency,
  sync_action_items,
  sync_meetings,
  sync_projects,
  create_activities_from_meetings
)
SELECT true, true, '5min', true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM entomate_integration_config LIMIT 1);

-- ============================================
-- 9. TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_entomate_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_entomate_config_updated_at ON entomate_integration_config;
CREATE TRIGGER trg_entomate_config_updated_at
BEFORE UPDATE ON entomate_integration_config
FOR EACH ROW EXECUTE FUNCTION update_entomate_config_updated_at();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
--
-- After running this migration:
-- 1. Tasks can now link to Entomate action items
-- 2. Activities can now link to Entomate meetings
-- 3. Projects can now link to Entomate projects
-- 4. Sync operations are logged for auditing
-- 5. Integration can be configured per organization
--
-- Next steps:
-- - Configure webhook endpoint in Entomate
-- - Set API key in Logos Vision settings
-- - Enable auto-sync for real-time updates
-- ============================================
