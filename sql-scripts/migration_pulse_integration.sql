-- ============================================
-- Phase 9: Pulse Integration - Enhanced Schema
-- Seamless CRM <-> Communication Platform Sync
-- ============================================

-- ============================================
-- INTEGRATION CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS app_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_type TEXT NOT NULL DEFAULT 'pulse',
    is_enabled BOOLEAN DEFAULT TRUE,

    -- Pulse Connection
    pulse_api_url TEXT DEFAULT 'https://ucaeuszgoihoyrvhewxk.supabase.co',
    pulse_api_key TEXT, -- Encrypted in production
    pulse_websocket_url TEXT,

    -- Sync Settings
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('logos_to_pulse', 'pulse_to_logos', 'bidirectional')),
    last_sync_at TIMESTAMPTZ,
    sync_frequency TEXT DEFAULT 'realtime' CHECK (sync_frequency IN ('realtime', 'manual', '5min', '15min', 'hourly')),

    -- Conflict Resolution
    conflict_resolution TEXT DEFAULT 'newest_wins' CHECK (conflict_resolution IN ('logos_wins', 'pulse_wins', 'newest_wins', 'manual')),

    -- Data Type Sync Flags
    sync_team_members BOOLEAN DEFAULT TRUE,
    sync_projects BOOLEAN DEFAULT TRUE,
    sync_clients BOOLEAN DEFAULT TRUE,
    sync_activities BOOLEAN DEFAULT TRUE,
    sync_meetings BOOLEAN DEFAULT TRUE,
    sync_documents BOOLEAN DEFAULT TRUE,
    sync_cases BOOLEAN DEFAULT FALSE,
    sync_tasks BOOLEAN DEFAULT TRUE,

    -- Notification Settings
    notify_on_sync_complete BOOLEAN DEFAULT FALSE,
    notify_on_sync_error BOOLEAN DEFAULT TRUE,
    notification_email TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(integration_type)
);

-- ============================================
-- SYNC LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_type TEXT NOT NULL DEFAULT 'pulse',
    sync_direction TEXT NOT NULL CHECK (sync_direction IN ('to_pulse', 'from_pulse', 'bidirectional')),

    -- What was synced
    data_type TEXT NOT NULL, -- 'meeting', 'message', 'document', 'project', 'client', etc.
    entity_id TEXT,
    entity_name TEXT,

    -- Status
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'queued', 'partial')),
    error_message TEXT,
    retry_count INT DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INT,

    -- Counts
    items_processed INT DEFAULT 0,
    items_succeeded INT DEFAULT 0,
    items_failed INT DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_synced_at ON sync_logs(synced_at DESC);
CREATE INDEX idx_sync_logs_data_type ON sync_logs(data_type);

-- ============================================
-- ENTITY MAPPINGS (Link Logos <-> Pulse IDs)
-- ============================================

CREATE TABLE IF NOT EXISTS entity_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Logos side
    logos_entity_type TEXT NOT NULL, -- 'project', 'client', 'activity', 'document', 'team_member'
    logos_entity_id UUID NOT NULL,

    -- Pulse side
    pulse_entity_type TEXT NOT NULL, -- 'channel', 'contact', 'meeting', 'file', 'user'
    pulse_entity_id TEXT NOT NULL,

    -- Sync metadata
    last_logos_update TIMESTAMPTZ,
    last_pulse_update TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error')),

    -- Conflict data (if any)
    conflict_data JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(logos_entity_type, logos_entity_id, pulse_entity_type)
);

CREATE INDEX idx_entity_mappings_logos ON entity_mappings(logos_entity_type, logos_entity_id);
CREATE INDEX idx_entity_mappings_pulse ON entity_mappings(pulse_entity_type, pulse_entity_id);

-- ============================================
-- PULSE MESSAGES (Local cache for display)
-- ============================================

CREATE TABLE IF NOT EXISTS pulse_messages_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pulse_message_id TEXT NOT NULL UNIQUE,

    channel_id TEXT NOT NULL,
    channel_name TEXT,

    sender_id TEXT NOT NULL,
    sender_name TEXT,
    sender_avatar_url TEXT,

    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'video', 'system')),

    -- Attachments
    attachments JSONB DEFAULT '[]',

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,

    -- Linking
    linked_project_id UUID REFERENCES lv_projects(id) ON DELETE SET NULL,
    linked_client_id UUID REFERENCES lv_clients(id) ON DELETE SET NULL,
    linked_case_id UUID REFERENCES lv_cases(id) ON DELETE SET NULL,

    -- Source
    source TEXT DEFAULT 'pulse' CHECK (source IN ('pulse', 'slack', 'teams', 'email', 'sms')),

    -- Timestamps
    sent_at TIMESTAMPTZ NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_pulse_messages_channel ON pulse_messages_cache(channel_id);
CREATE INDEX idx_pulse_messages_sent ON pulse_messages_cache(sent_at DESC);
CREATE INDEX idx_pulse_messages_unread ON pulse_messages_cache(is_read) WHERE is_read = FALSE;

-- ============================================
-- PULSE CHANNELS (Local cache)
-- ============================================

CREATE TABLE IF NOT EXISTS pulse_channels_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pulse_channel_id TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL,
    description TEXT,
    channel_type TEXT DEFAULT 'channel' CHECK (channel_type IN ('channel', 'dm', 'group', 'project')),

    -- Stats
    member_count INT DEFAULT 0,
    unread_count INT DEFAULT 0,

    -- Last activity
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    last_message_sender TEXT,

    -- Linking
    linked_project_id UUID REFERENCES lv_projects(id) ON DELETE SET NULL,
    linked_client_id UUID REFERENCES lv_clients(id) ON DELETE SET NULL,

    -- Settings
    is_muted BOOLEAN DEFAULT FALSE,
    notification_preference TEXT DEFAULT 'all' CHECK (notification_preference IN ('all', 'mentions', 'none')),

    cached_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pulse_channels_linked ON pulse_channels_cache(linked_project_id, linked_client_id);

-- ============================================
-- PULSE MEETINGS
-- ============================================

CREATE TABLE IF NOT EXISTS pulse_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pulse_meeting_id TEXT UNIQUE,

    title TEXT NOT NULL,
    description TEXT,

    -- Scheduling
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'America/New_York',

    -- Meeting room
    room_url TEXT,
    room_id TEXT,
    passcode TEXT,

    -- Recording
    is_recorded BOOLEAN DEFAULT FALSE,
    recording_url TEXT,
    recording_duration_seconds INT,
    transcription TEXT,

    -- Attendees
    organizer_id TEXT,
    organizer_name TEXT,
    attendees JSONB DEFAULT '[]', -- [{id, name, email, status}]

    -- Notes
    agenda TEXT,
    notes TEXT,
    action_items JSONB DEFAULT '[]', -- [{task, assignee, due_date}]

    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

    -- Linking
    linked_project_id UUID REFERENCES lv_projects(id) ON DELETE SET NULL,
    linked_client_id UUID REFERENCES lv_clients(id) ON DELETE SET NULL,
    linked_activity_id UUID REFERENCES lv_activities(id) ON DELETE SET NULL,
    linked_calendar_event_id UUID,

    -- Auto-create activity when meeting ends
    auto_create_activity BOOLEAN DEFAULT TRUE,
    activity_created BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pulse_meetings_time ON pulse_meetings(start_time, end_time);
CREATE INDEX idx_pulse_meetings_project ON pulse_meetings(linked_project_id);
CREATE INDEX idx_pulse_meetings_status ON pulse_meetings(status);

-- ============================================
-- DOCUMENT SYNC TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS document_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Logos document
    logos_document_id UUID NOT NULL REFERENCES lv_documents(id) ON DELETE CASCADE,

    -- Pulse file
    pulse_file_id TEXT,
    pulse_file_url TEXT,

    -- Sync status
    sync_direction TEXT DEFAULT 'logos_to_pulse' CHECK (sync_direction IN ('logos_to_pulse', 'pulse_to_logos', 'bidirectional')),
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('synced', 'pending', 'error', 'conflict')),

    -- Version tracking
    logos_version INT DEFAULT 1,
    pulse_version INT DEFAULT 1,
    logos_hash TEXT,
    pulse_hash TEXT,

    -- Sharing
    shared_in_channels TEXT[], -- Pulse channel IDs where doc was shared

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_sync_status ON document_sync(sync_status);

-- ============================================
-- PRESENCE & NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS user_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'team_member' CHECK (user_type IN ('team_member', 'client', 'volunteer')),

    -- Status
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    status_message TEXT,
    status_emoji TEXT,

    -- Last activity
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_page TEXT,

    -- Pulse presence sync
    pulse_user_id TEXT,
    pulse_status TEXT,
    pulse_last_active TIMESTAMPTZ,

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_presence_status ON user_presence(status);
CREATE INDEX idx_user_presence_user ON user_presence(user_id, user_type);

-- Notification queue for cross-app notifications
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Target
    target_app TEXT NOT NULL CHECK (target_app IN ('logos', 'pulse')),
    target_user_id TEXT NOT NULL,

    -- Notification content
    notification_type TEXT NOT NULL, -- 'message', 'mention', 'meeting', 'task', 'case', etc.
    title TEXT NOT NULL,
    body TEXT,
    icon TEXT,
    url TEXT,

    -- Source
    source_app TEXT NOT NULL CHECK (source_app IN ('logos', 'pulse')),
    source_entity_type TEXT,
    source_entity_id TEXT,

    -- Delivery
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,

    -- Retry
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at TIMESTAMPTZ,

    -- Priority
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_notification_queue_pending ON notification_queue(status, target_app) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_user ON notification_queue(target_user_id, target_app);

-- ============================================
-- ACTIVITY FEED INTEGRATION
-- ============================================

CREATE TABLE IF NOT EXISTS pulse_activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event info
    event_type TEXT NOT NULL, -- 'message_sent', 'meeting_started', 'file_shared', 'channel_created', etc.
    event_title TEXT NOT NULL,
    event_description TEXT,

    -- Actor
    actor_id TEXT,
    actor_name TEXT,
    actor_avatar_url TEXT,

    -- Target
    target_type TEXT, -- 'channel', 'meeting', 'file', 'user'
    target_id TEXT,
    target_name TEXT,

    -- Linking
    linked_project_id UUID REFERENCES lv_projects(id) ON DELETE SET NULL,
    linked_client_id UUID REFERENCES lv_clients(id) ON DELETE SET NULL,

    -- Display
    icon TEXT,
    color TEXT,

    -- Timestamps
    occurred_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW(),

    -- Show in Logos activity feed?
    show_in_logos BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_pulse_activity_occurred ON pulse_activity_feed(occurred_at DESC);
CREATE INDEX idx_pulse_activity_project ON pulse_activity_feed(linked_project_id);

-- ============================================
-- WEBHOOK ENDPOINTS
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Webhook config
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret_key TEXT, -- For HMAC verification

    -- Direction
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    source_app TEXT, -- For incoming: 'pulse', etc.
    target_app TEXT, -- For outgoing: 'pulse', etc.

    -- Events
    events TEXT[] DEFAULT '{}', -- Event types to trigger/receive

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    failure_count INT DEFAULT 0,

    -- Rate limiting
    rate_limit_per_minute INT DEFAULT 60,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create activity from meeting
CREATE OR REPLACE FUNCTION create_activity_from_meeting()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.auto_create_activity = TRUE AND NEW.activity_created = FALSE THEN
        INSERT INTO lv_activities (
            type,
            title,
            description,
            activity_date,
            status,
            project_id,
            client_id,
            notes,
            created_by_id,
            created_at
        ) VALUES (
            'Meeting',
            'Meeting: ' || NEW.title,
            COALESCE(NEW.description, 'Meeting completed via Pulse'),
            NEW.end_time,
            'Completed',
            NEW.linked_project_id,
            NEW.linked_client_id,
            COALESCE(NEW.notes, '') || E'\n\n' || COALESCE(NEW.action_items::TEXT, ''),
            NEW.organizer_id::UUID,
            NOW()
        );

        -- Mark as created
        NEW.activity_created := TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_activity_from_meeting
    BEFORE UPDATE ON pulse_meetings
    FOR EACH ROW
    EXECUTE FUNCTION create_activity_from_meeting();

-- Function to log sync operations
CREATE OR REPLACE FUNCTION log_sync_operation(
    p_direction TEXT,
    p_data_type TEXT,
    p_entity_id TEXT,
    p_entity_name TEXT,
    p_status TEXT,
    p_items_processed INT DEFAULT 0,
    p_items_succeeded INT DEFAULT 0,
    p_items_failed INT DEFAULT 0,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO sync_logs (
        sync_direction,
        data_type,
        entity_id,
        entity_name,
        status,
        items_processed,
        items_succeeded,
        items_failed,
        error_message,
        metadata,
        completed_at,
        duration_ms
    ) VALUES (
        p_direction,
        p_data_type,
        p_entity_id,
        p_entity_name,
        p_status,
        p_items_processed,
        p_items_succeeded,
        p_items_failed,
        p_error_message,
        p_metadata,
        NOW(),
        EXTRACT(EPOCH FROM (NOW() - NOW()))::INT * 1000
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired cache
CREATE OR REPLACE FUNCTION clean_pulse_cache()
RETURNS INT AS $$
DECLARE
    v_deleted INT := 0;
BEGIN
    -- Clean expired messages
    DELETE FROM pulse_messages_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    -- Clean old activity feed (keep 30 days)
    DELETE FROM pulse_activity_feed WHERE occurred_at < NOW() - INTERVAL '30 days';

    -- Clean delivered notifications older than 7 days
    DELETE FROM notification_queue
    WHERE status IN ('delivered', 'read')
    AND created_at < NOW() - INTERVAL '7 days';

    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE app_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_messages_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_channels_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_activity_feed ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your auth setup)
CREATE POLICY "Allow authenticated access to integrations" ON app_integrations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to sync_logs" ON sync_logs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to entity_mappings" ON entity_mappings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to pulse_messages" ON pulse_messages_cache
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to pulse_channels" ON pulse_channels_cache
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to pulse_meetings" ON pulse_meetings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to document_sync" ON document_sync
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to user_presence" ON user_presence
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to notifications" ON notification_queue
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to activity_feed" ON pulse_activity_feed
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default integration config
INSERT INTO app_integrations (
    integration_type,
    is_enabled,
    sync_direction,
    sync_frequency,
    conflict_resolution
) VALUES (
    'pulse',
    TRUE,
    'bidirectional',
    'realtime',
    'newest_wins'
) ON CONFLICT (integration_type) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE app_integrations IS 'Configuration for app integrations (Pulse, etc.)';
COMMENT ON TABLE sync_logs IS 'Log of all sync operations between Logos and external apps';
COMMENT ON TABLE entity_mappings IS 'Maps Logos entities to their counterparts in external apps';
COMMENT ON TABLE pulse_messages_cache IS 'Local cache of Pulse messages for display in Logos';
COMMENT ON TABLE pulse_channels_cache IS 'Local cache of Pulse channels/rooms';
COMMENT ON TABLE pulse_meetings IS 'Meetings synced from Pulse with linking to Logos entities';
COMMENT ON TABLE document_sync IS 'Tracks document sync status between Logos and Pulse';
COMMENT ON TABLE user_presence IS 'Real-time user presence status';
COMMENT ON TABLE notification_queue IS 'Queue for cross-app notifications';
COMMENT ON TABLE pulse_activity_feed IS 'Activity events from Pulse to show in Logos';
