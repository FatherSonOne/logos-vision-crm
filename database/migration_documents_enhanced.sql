-- ============================================
-- Enhanced Documents Migration
-- With security policies, Google Drive sync, and Pulse integration
-- ============================================

-- ============================================
-- 1. ENHANCED DOCUMENTS TABLE
-- ============================================

-- Drop and recreate documents table with enhanced schema
-- CAUTION: Only run if fresh install, or backup existing data first
DROP TABLE IF EXISTS document_sync CASCADE;
DROP TABLE IF EXISTS document_access_logs CASCADE;
DROP TABLE IF EXISTS document_policies CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name VARCHAR(500) NOT NULL,
    description TEXT,
    file_type VARCHAR(100),
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(255),

    -- Storage
    storage_provider VARCHAR(50) DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'google_drive', 'onedrive', 'dropbox', 'external')),
    file_url TEXT NOT NULL,
    file_path TEXT, -- Path within storage bucket
    thumbnail_url TEXT,

    -- External provider IDs
    google_drive_id VARCHAR(255),
    onedrive_id VARCHAR(255),
    dropbox_id VARCHAR(255),

    -- Organization
    category VARCHAR(100) DEFAULT 'Internal',
    folder_id UUID,
    tags TEXT[] DEFAULT '{}',

    -- Relationships
    related_id UUID, -- Client, Project, Case, etc.
    related_type VARCHAR(50), -- 'client', 'project', 'case', 'household', 'volunteer'
    project_id UUID,
    client_id UUID,
    case_id UUID,

    -- Ownership & Permissions
    uploaded_by_id UUID,
    owner_id UUID,
    is_public BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(50) DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'organization', 'public')),

    -- Security & Compliance
    sensitivity_level VARCHAR(50) DEFAULT 'normal' CHECK (sensitivity_level IN ('public', 'normal', 'confidential', 'restricted')),
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    acknowledgment_text TEXT,
    retention_policy VARCHAR(100),
    retention_until DATE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    encryption_key_id VARCHAR(255),

    -- Versioning
    version INT DEFAULT 1,
    parent_version_id UUID REFERENCES documents(id),
    is_latest_version BOOLEAN DEFAULT TRUE,
    version_notes TEXT,

    -- Audit
    checksum VARCHAR(128),
    last_accessed_at TIMESTAMPTZ,
    access_count INT DEFAULT 0,
    last_modified_by UUID,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted', 'pending_review', 'locked')),
    locked_by UUID,
    locked_at TIMESTAMPTZ,
    lock_reason TEXT,

    -- Sync tracking
    pulse_synced BOOLEAN DEFAULT FALSE,
    pulse_file_id TEXT,
    pulse_last_sync TIMESTAMPTZ,
    sync_enabled BOOLEAN DEFAULT TRUE,

    -- Timestamps
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_related ON documents(related_id, related_type);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_visibility ON documents(visibility);
CREATE INDEX idx_documents_sensitivity ON documents(sensitivity_level);
CREATE INDEX idx_documents_storage ON documents(storage_provider);
CREATE INDEX idx_documents_gdrive ON documents(google_drive_id) WHERE google_drive_id IS NOT NULL;
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);

-- Full-text search on document names and descriptions
CREATE INDEX idx_documents_search ON documents USING GIN(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- ============================================
-- 2. DOCUMENT FOLDERS
-- ============================================

CREATE TABLE IF NOT EXISTS document_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
    path TEXT, -- Full path like '/Client Documents/Active Clients/Smith Family'

    -- Permissions
    owner_id UUID,
    visibility VARCHAR(50) DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'organization', 'public')),

    -- Settings
    auto_policy VARCHAR(100), -- Auto-apply security policy to new docs
    color VARCHAR(20),
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,

    -- Sync
    google_drive_folder_id VARCHAR(255),
    sync_enabled BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doc_folders_parent ON document_folders(parent_id);
CREATE INDEX idx_doc_folders_path ON document_folders(path);

-- ============================================
-- 3. DOCUMENT ACCESS LOGS (Audit Trail)
-- ============================================

CREATE TABLE document_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Who
    user_id UUID NOT NULL,
    user_type VARCHAR(50) DEFAULT 'team_member', -- 'team_member', 'client', 'external'
    user_email TEXT,
    user_name TEXT,

    -- What
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'view', 'download', 'upload', 'edit', 'delete', 'share',
        'print', 'copy', 'move', 'rename', 'lock', 'unlock',
        'acknowledge', 'restore', 'archive', 'set_policy'
    )),

    -- Context
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    location TEXT,

    -- Details
    details JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doc_access_document ON document_access_logs(document_id);
CREATE INDEX idx_doc_access_user ON document_access_logs(user_id);
CREATE INDEX idx_doc_access_action ON document_access_logs(action);
CREATE INDEX idx_doc_access_time ON document_access_logs(created_at DESC);

-- ============================================
-- 4. DOCUMENT SECURITY POLICIES
-- ============================================

CREATE TABLE document_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Scope
    applies_to VARCHAR(50) DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'folder', 'sensitivity', 'custom')),
    scope_value TEXT, -- e.g., category name, folder_id, sensitivity level

    -- Access Controls
    allowed_roles TEXT[] DEFAULT '{}', -- ['admin', 'manager', 'staff']
    allowed_users UUID[] DEFAULT '{}',
    denied_users UUID[] DEFAULT '{}',

    -- Actions Allowed
    can_view BOOLEAN DEFAULT TRUE,
    can_download BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_share BOOLEAN DEFAULT FALSE,
    can_print BOOLEAN DEFAULT TRUE,

    -- Time Restrictions
    access_start_date DATE,
    access_end_date DATE,
    access_hours_start TIME,
    access_hours_end TIME,
    allowed_days INT[] DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday

    -- Security Requirements
    require_mfa BOOLEAN DEFAULT FALSE,
    require_acknowledgment BOOLEAN DEFAULT FALSE,
    acknowledgment_text TEXT,
    require_watermark BOOLEAN DEFAULT FALSE,
    watermark_text TEXT,

    -- Retention
    retention_days INT,
    auto_archive_after_days INT,
    auto_delete_after_days INT,

    -- Audit Requirements
    log_all_access BOOLEAN DEFAULT TRUE,
    notify_on_access BOOLEAN DEFAULT FALSE,
    notify_email TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 100, -- Lower = higher priority

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doc_policies_scope ON document_policies(applies_to, scope_value);
CREATE INDEX idx_doc_policies_active ON document_policies(is_active);

-- ============================================
-- 5. DOCUMENT SHARES
-- ============================================

CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Share target
    share_type VARCHAR(50) NOT NULL CHECK (share_type IN ('user', 'team', 'client', 'external_email', 'public_link')),
    shared_with_id UUID, -- User/Team ID
    shared_with_email TEXT, -- For external shares

    -- Permissions
    permission VARCHAR(50) DEFAULT 'view' CHECK (permission IN ('view', 'download', 'edit', 'full')),

    -- Link settings (for public links)
    share_link_token VARCHAR(255) UNIQUE,
    password_hash TEXT,

    -- Expiration
    expires_at TIMESTAMPTZ,
    max_downloads INT,
    download_count INT DEFAULT 0,

    -- Tracking
    shared_by_id UUID NOT NULL,
    message TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doc_shares_document ON document_shares(document_id);
CREATE INDEX idx_doc_shares_user ON document_shares(shared_with_id);
CREATE INDEX idx_doc_shares_token ON document_shares(share_link_token) WHERE share_link_token IS NOT NULL;

-- ============================================
-- 6. DOCUMENT ACKNOWLEDGMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS document_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,

    -- Acknowledgment details
    acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,

    -- Optional signature
    signature_data TEXT, -- Base64 encoded signature image

    UNIQUE(document_id, user_id)
);

CREATE INDEX idx_doc_ack_document ON document_acknowledgments(document_id);
CREATE INDEX idx_doc_ack_user ON document_acknowledgments(user_id);

-- ============================================
-- 7. GOOGLE DRIVE SYNC CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS google_drive_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,

    -- OAuth tokens (encrypted in production)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,

    -- Sync settings
    root_folder_id VARCHAR(255), -- Google Drive folder to sync with
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_direction VARCHAR(50) DEFAULT 'bidirectional' CHECK (sync_direction IN ('to_gdrive', 'from_gdrive', 'bidirectional')),

    -- What to sync
    sync_all_documents BOOLEAN DEFAULT FALSE,
    sync_categories TEXT[] DEFAULT '{}',
    sync_folders UUID[] DEFAULT '{}',

    -- Conflict resolution
    conflict_resolution VARCHAR(50) DEFAULT 'newest_wins' CHECK (conflict_resolution IN ('logos_wins', 'gdrive_wins', 'newest_wins', 'keep_both')),

    -- Status
    last_sync_at TIMESTAMPTZ,
    last_sync_status VARCHAR(50),
    last_sync_error TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

-- ============================================
-- 8. PULSE DOCUMENT SYNC
-- ============================================

CREATE TABLE IF NOT EXISTS document_pulse_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Pulse references
    pulse_file_id TEXT,
    pulse_file_url TEXT,
    pulse_channel_ids TEXT[] DEFAULT '{}',
    pulse_message_id TEXT,

    -- Sync tracking
    sync_direction VARCHAR(50) DEFAULT 'bidirectional' CHECK (sync_direction IN ('to_pulse', 'from_pulse', 'bidirectional')),
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN ('synced', 'pending', 'error', 'conflict')),
    sync_error TEXT,

    -- Version tracking for conflict detection
    logos_version INT DEFAULT 1,
    pulse_version INT DEFAULT 1,
    logos_checksum VARCHAR(128),
    pulse_checksum VARCHAR(128),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(document_id)
);

CREATE INDEX idx_doc_pulse_sync_status ON document_pulse_sync(sync_status);
CREATE INDEX idx_doc_pulse_sync_pulse_id ON document_pulse_sync(pulse_file_id);

-- ============================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all document tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_config ENABLE ROW LEVEL SECURITY;

-- Google Drive Config: Users can only access their own config
CREATE POLICY "Users can view own google drive config" ON google_drive_config
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own google drive config" ON google_drive_config
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own google drive config" ON google_drive_config
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own google drive config" ON google_drive_config
    FOR DELETE USING (user_id = auth.uid());

-- Documents: Users can see their own documents, team documents, and shared documents
CREATE POLICY "Users can view accessible documents" ON documents
    FOR SELECT USING (
        -- Public documents
        visibility = 'public' AND status = 'active'
        OR
        -- User's own documents
        uploaded_by_id = auth.uid()
        OR
        -- Team visibility (authenticated users can see team docs)
        visibility IN ('team', 'organization') AND auth.role() = 'authenticated'
        OR
        -- Explicitly shared with user (checked via document_shares)
        EXISTS (
            SELECT 1 FROM document_shares
            WHERE document_shares.document_id = documents.id
            AND document_shares.shared_with_id = auth.uid()
            AND document_shares.is_active = true
            AND (document_shares.expires_at IS NULL OR document_shares.expires_at > NOW())
        )
    );

-- Documents: Users can insert their own documents
CREATE POLICY "Users can upload documents" ON documents
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

-- Documents: Users can update their own documents
CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (
        uploaded_by_id = auth.uid()
        OR owner_id = auth.uid()
    );

-- Documents: Only owners can delete
CREATE POLICY "Owners can delete documents" ON documents
    FOR DELETE USING (
        uploaded_by_id = auth.uid()
        OR owner_id = auth.uid()
    );

-- Folders: Team members can see all folders
CREATE POLICY "Team members can view folders" ON document_folders
    FOR SELECT USING (
        visibility IN ('team', 'organization', 'public')
        OR owner_id = auth.uid()
    );

CREATE POLICY "Users can create folders" ON document_folders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owners can update folders" ON document_folders
    FOR UPDATE USING (owner_id = auth.uid());

-- Access logs: Users can see logs for documents they own
CREATE POLICY "Owners can view access logs" ON document_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_access_logs.document_id
            AND (documents.uploaded_by_id = auth.uid() OR documents.owner_id = auth.uid())
        )
    );

-- Access logs: System can insert (service role)
CREATE POLICY "System can log access" ON document_access_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Shares: Users can see shares they created or that are shared with them
CREATE POLICY "Users can view their shares" ON document_shares
    FOR SELECT USING (
        shared_by_id = auth.uid()
        OR shared_with_id = auth.uid()
    );

CREATE POLICY "Users can create shares for owned docs" ON document_shares
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_id
            AND (documents.uploaded_by_id = auth.uid() OR documents.owner_id = auth.uid())
        )
    );

-- Acknowledgments: Users can see and create their own
CREATE POLICY "Users can view own acknowledgments" ON document_acknowledgments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can acknowledge documents" ON document_acknowledgments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- 10. STORAGE BUCKET SETUP (Run via Supabase dashboard or API)
-- ============================================

-- Note: This needs to be executed via Supabase dashboard or storage API
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--     'documents',
--     'documents',
--     false, -- Private bucket
--     52428800, -- 50MB limit
--     ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--           'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
--           'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
--           'image/jpeg', 'image/png', 'image/gif', 'image/webp',
--           'text/plain', 'text/csv', 'application/json']
-- );

-- ============================================
-- 11. DEFAULT SECURITY POLICIES
-- ============================================

INSERT INTO document_policies (name, description, applies_to, scope_value, can_view, can_download, can_edit, can_delete, can_share, log_all_access, priority)
VALUES
    -- Client Documents - Confidential by default
    ('Client Documents Policy', 'Security policy for client-related documents', 'category', 'Client Documents', true, true, false, false, false, true, 10),

    -- Internal Documents - Normal access for team
    ('Internal Documents Policy', 'Policy for internal team documents', 'category', 'Internal', true, true, true, true, true, false, 50),

    -- Project Documents - Team access
    ('Project Documents Policy', 'Policy for project-related documents', 'category', 'Project Documents', true, true, true, false, true, true, 30),

    -- Templates - Read-only for most users
    ('Templates Policy', 'Policy for document templates', 'category', 'Templates', true, true, false, false, false, false, 40),

    -- Restricted Documents - Admin only
    ('Restricted Documents Policy', 'Highly sensitive documents', 'sensitivity', 'restricted', true, false, false, false, false, true, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. HELPER FUNCTIONS
-- ============================================

-- Function to log document access
CREATE OR REPLACE FUNCTION log_document_access(
    p_document_id UUID,
    p_action VARCHAR(50),
    p_details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO document_access_logs (document_id, user_id, action, details)
    VALUES (p_document_id, auth.uid(), p_action, p_details)
    RETURNING id INTO v_log_id;

    -- Update document access stats
    UPDATE documents
    SET last_accessed_at = NOW(),
        access_count = access_count + 1
    WHERE id = p_document_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check document access
CREATE OR REPLACE FUNCTION can_access_document(
    p_document_id UUID,
    p_action VARCHAR(50) DEFAULT 'view'
) RETURNS BOOLEAN AS $$
DECLARE
    v_doc documents%ROWTYPE;
    v_policy document_policies%ROWTYPE;
    v_has_share BOOLEAN;
BEGIN
    -- Get document
    SELECT * INTO v_doc FROM documents WHERE id = p_document_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;

    -- Owner/uploader always has full access
    IF v_doc.uploaded_by_id = auth.uid() OR v_doc.owner_id = auth.uid() THEN
        RETURN TRUE;
    END IF;

    -- Check for explicit share
    SELECT EXISTS (
        SELECT 1 FROM document_shares
        WHERE document_id = p_document_id
        AND shared_with_id = auth.uid()
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (
            (p_action = 'view' AND permission IN ('view', 'download', 'edit', 'full'))
            OR (p_action = 'download' AND permission IN ('download', 'edit', 'full'))
            OR (p_action = 'edit' AND permission IN ('edit', 'full'))
            OR (p_action = 'delete' AND permission = 'full')
        )
    ) INTO v_has_share;

    IF v_has_share THEN RETURN TRUE; END IF;

    -- Check visibility
    IF v_doc.visibility = 'public' AND p_action = 'view' THEN RETURN TRUE; END IF;
    IF v_doc.visibility IN ('team', 'organization') THEN RETURN TRUE; END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update document and track changes
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_modified_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_update_timestamp
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_document_timestamp();

-- ============================================
-- 13. VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Documents with folder path
CREATE OR REPLACE VIEW documents_with_folders AS
SELECT
    d.*,
    f.name as folder_name,
    f.path as folder_path
FROM documents d
LEFT JOIN document_folders f ON d.folder_id = f.id
WHERE d.status = 'active';

-- View: Recently accessed documents
CREATE OR REPLACE VIEW recent_documents AS
SELECT
    d.id,
    d.name,
    d.file_type,
    d.category,
    d.file_url,
    d.last_accessed_at,
    d.access_count
FROM documents d
WHERE d.status = 'active'
    AND d.last_accessed_at IS NOT NULL
ORDER BY d.last_accessed_at DESC
LIMIT 50;

-- View: Documents pending sync
CREATE OR REPLACE VIEW documents_pending_sync AS
SELECT
    d.*,
    ps.sync_status,
    ps.last_sync_at,
    ps.sync_error
FROM documents d
LEFT JOIN document_pulse_sync ps ON d.id = ps.document_id
WHERE d.sync_enabled = true
    AND d.status = 'active'
    AND (ps.sync_status IS NULL OR ps.sync_status IN ('pending', 'error'));

COMMENT ON TABLE documents IS 'Enhanced document storage with security policies, versioning, and multi-provider support';
COMMENT ON TABLE document_policies IS 'Security policies for document access control';
COMMENT ON TABLE document_access_logs IS 'Audit trail for all document access and modifications';
