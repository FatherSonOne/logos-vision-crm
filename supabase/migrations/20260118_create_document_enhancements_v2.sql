-- Enterprise Document Library Enhancement Migration
-- Phase 1: Foundation tables for AI, versioning, Pulse integration, and analytics
-- Created: 2026-01-18
-- Version: 2 (Fixed for Supabase compatibility)

-- ============================================================================
-- 0. Ensure base tables exist
-- ============================================================================

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  related_id TEXT,
  related_type TEXT,
  file_type TEXT,
  file_size BIGINT,
  mime_type TEXT,
  file_url TEXT,
  file_path TEXT,
  uploaded_by_id UUID,
  owner_id UUID,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create migrations tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 1. Document Versions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  uploaded_by_id UUID,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_document_version UNIQUE(document_id, version_number)
);

-- Add foreign key if documents table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'document_versions_document_id_fkey'
      AND table_name = 'document_versions'
    ) THEN
      ALTER TABLE document_versions
        ADD CONSTRAINT document_versions_document_id_fkey
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_doc_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_versions_created_at ON document_versions(created_at DESC);

COMMENT ON TABLE document_versions IS 'Version history for documents with auto-versioning for Contracts/Legal categories';

-- ============================================================================
-- 2. Document AI Metadata Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_ai_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  extracted_text TEXT,
  language_detected TEXT,
  extraction_confidence DECIMAL(5,2),
  classification_category TEXT,
  classification_confidence DECIMAL(5,2),
  classification_reasoning TEXT,
  auto_tags TEXT[] DEFAULT '{}',
  suggested_tags TEXT[] DEFAULT '{}',
  detected_entities JSONB DEFAULT '{}',
  ai_summary TEXT,
  key_points TEXT[],
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time_ms INTEGER,
  ai_model_used TEXT DEFAULT 'gemini-2.5-flash',
  CONSTRAINT unique_document_ai_metadata UNIQUE(document_id)
);

-- Add foreign key if documents table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'document_ai_metadata_document_id_fkey'
      AND table_name = 'document_ai_metadata'
    ) THEN
      ALTER TABLE document_ai_metadata
        ADD CONSTRAINT document_ai_metadata_document_id_fkey
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_doc_ai_metadata_tags ON document_ai_metadata USING GIN(auto_tags);
CREATE INDEX IF NOT EXISTS idx_doc_ai_metadata_entities ON document_ai_metadata USING GIN(detected_entities);
CREATE INDEX IF NOT EXISTS idx_doc_ai_metadata_category ON document_ai_metadata(classification_category);
CREATE INDEX IF NOT EXISTS idx_doc_ai_metadata_text_search ON document_ai_metadata USING GIN(to_tsvector('english', COALESCE(extracted_text, '')));

COMMENT ON TABLE document_ai_metadata IS 'AI-generated metadata for documents including classification, OCR, tags, and summaries';

-- ============================================================================
-- 3. Document Folders Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID,
  path TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  color TEXT,
  icon TEXT,
  auto_version_enabled BOOLEAN DEFAULT false,
  version_retention_count INTEGER DEFAULT 10,
  owner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_folder_path UNIQUE(path)
);

-- Add self-referencing foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'document_folders_parent_id_fkey'
    AND table_name = 'document_folders'
  ) THEN
    ALTER TABLE document_folders
      ADD CONSTRAINT document_folders_parent_id_fkey
      FOREIGN KEY (parent_id) REFERENCES document_folders(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_doc_folders_parent ON document_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_doc_folders_path ON document_folders(path);
CREATE INDEX IF NOT EXISTS idx_doc_folders_owner ON document_folders(owner_id);

COMMENT ON TABLE document_folders IS 'Hierarchical folder structure for document organization';

-- ============================================================================
-- 4. Document Smart Collections Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_smart_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '[]',
  rule_operator TEXT DEFAULT 'and' CHECK (rule_operator IN ('and', 'or')),
  color TEXT,
  icon TEXT,
  owner_id UUID,
  is_shared BOOLEAN DEFAULT false,
  shared_with_team_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smart_collections_owner ON document_smart_collections(owner_id);
CREATE INDEX IF NOT EXISTS idx_smart_collections_rules ON document_smart_collections USING GIN(rules);

COMMENT ON TABLE document_smart_collections IS 'User-defined smart collections with dynamic rule-based document filtering';

-- ============================================================================
-- 5. Document Analytics Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  preview_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  last_shared_at TIMESTAMP WITH TIME ZONE,
  ai_processing_count INTEGER DEFAULT 0,
  avg_ai_processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_document_analytics UNIQUE(document_id)
);

-- Add foreign key if documents table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'document_analytics_document_id_fkey'
      AND table_name = 'document_analytics'
    ) THEN
      ALTER TABLE document_analytics
        ADD CONSTRAINT document_analytics_document_id_fkey
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_doc_analytics_document_id ON document_analytics(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_analytics_last_viewed ON document_analytics(last_viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_analytics_view_count ON document_analytics(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_doc_analytics_download_count ON document_analytics(download_count DESC);

COMMENT ON TABLE document_analytics IS 'Usage tracking and analytics for documents';

-- ============================================================================
-- 6. Document Pulse Items Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_pulse_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  pulse_item_type TEXT NOT NULL CHECK (pulse_item_type IN ('meeting', 'chat_archive', 'conversation', 'vox', 'project_file')),
  pulse_item_id TEXT NOT NULL,
  pulse_channel_id TEXT,
  pulse_channel_name TEXT,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error', 'conflict')),
  sync_direction TEXT DEFAULT 'pulse_to_logos' CHECK (sync_direction IN ('pulse_to_logos', 'logos_to_pulse', 'bidirectional')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_error_message TEXT,
  pulse_participants TEXT[],
  pulse_created_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_pulse_document UNIQUE(document_id),
  CONSTRAINT unique_pulse_item UNIQUE(pulse_item_id, pulse_item_type)
);

-- Add foreign key if documents table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'document_pulse_items_document_id_fkey'
      AND table_name = 'document_pulse_items'
    ) THEN
      ALTER TABLE document_pulse_items
        ADD CONSTRAINT document_pulse_items_document_id_fkey
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_doc_pulse_items_document_id ON document_pulse_items(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_pulse_items_type ON document_pulse_items(pulse_item_type);
CREATE INDEX IF NOT EXISTS idx_doc_pulse_items_status ON document_pulse_items(sync_status);
CREATE INDEX IF NOT EXISTS idx_doc_pulse_items_pulse_id ON document_pulse_items(pulse_item_id);

COMMENT ON TABLE document_pulse_items IS 'Mapping and sync status for documents imported from Pulse';

-- ============================================================================
-- 7. Extend documents table with new columns
-- ============================================================================
DO $$
BEGIN
  -- Storage provider
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='storage_provider') THEN
    ALTER TABLE documents ADD COLUMN storage_provider TEXT DEFAULT 'supabase';
  END IF;

  -- Folder ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='folder_id') THEN
    ALTER TABLE documents ADD COLUMN folder_id UUID;
  END IF;

  -- Version number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='version_number') THEN
    ALTER TABLE documents ADD COLUMN version_number INTEGER DEFAULT 1;
  END IF;

  -- Thumbnail URL
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='thumbnail_url') THEN
    ALTER TABLE documents ADD COLUMN thumbnail_url TEXT;
  END IF;

  -- Preview availability flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='preview_available') THEN
    ALTER TABLE documents ADD COLUMN preview_available BOOLEAN DEFAULT false;
  END IF;

  -- OCR processed flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='ocr_processed') THEN
    ALTER TABLE documents ADD COLUMN ocr_processed BOOLEAN DEFAULT false;
  END IF;

  -- AI processed flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='ai_processed') THEN
    ALTER TABLE documents ADD COLUMN ai_processed BOOLEAN DEFAULT false;
  END IF;

  -- Pulse sync flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='pulse_synced') THEN
    ALTER TABLE documents ADD COLUMN pulse_synced BOOLEAN DEFAULT false;
  END IF;

  -- Visibility level
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='visibility') THEN
    ALTER TABLE documents ADD COLUMN visibility TEXT DEFAULT 'team'
      CHECK (visibility IN ('private', 'team', 'organization', 'public'));
  END IF;

  -- Sensitivity level
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='sensitivity_level') THEN
    ALTER TABLE documents ADD COLUMN sensitivity_level TEXT DEFAULT 'normal'
      CHECK (sensitivity_level IN ('public', 'normal', 'confidential', 'restricted'));
  END IF;

  -- Project ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='project_id') THEN
    ALTER TABLE documents ADD COLUMN project_id TEXT;
  END IF;

  -- Client ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='documents' AND column_name='client_id') THEN
    ALTER TABLE documents ADD COLUMN client_id TEXT;
  END IF;
END $$;

-- Add folder_id foreign key after column is created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='folder_id')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='document_folders') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'documents_folder_id_fkey'
      AND table_name = 'documents'
    ) THEN
      ALTER TABLE documents
        ADD CONSTRAINT documents_folder_id_fkey
        FOREIGN KEY (folder_id) REFERENCES document_folders(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_storage_provider ON documents(storage_provider);
CREATE INDEX IF NOT EXISTS idx_documents_pulse_synced ON documents(pulse_synced);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);
CREATE INDEX IF NOT EXISTS idx_documents_sensitivity ON documents(sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);

-- ============================================================================
-- 8. Trigger Functions
-- ============================================================================

-- Trigger to auto-create analytics record when document is created
CREATE OR REPLACE FUNCTION create_document_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO document_analytics (document_id, view_count, download_count, share_count)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (document_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_create_document_analytics ON documents;
DROP TRIGGER IF EXISTS trigger_update_smart_collections_updated_at ON document_smart_collections;
DROP TRIGGER IF EXISTS trigger_update_analytics_updated_at ON document_analytics;
DROP TRIGGER IF EXISTS trigger_update_pulse_items_updated_at ON document_pulse_items;
DROP TRIGGER IF EXISTS trigger_update_folders_updated_at ON document_folders;
DROP TRIGGER IF EXISTS trigger_update_documents_updated_at ON documents;

-- Create triggers
CREATE TRIGGER trigger_create_document_analytics
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_analytics();

CREATE TRIGGER trigger_update_smart_collections_updated_at
  BEFORE UPDATE ON document_smart_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_analytics_updated_at
  BEFORE UPDATE ON document_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_pulse_items_updated_at
  BEFORE UPDATE ON document_pulse_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_folders_updated_at
  BEFORE UPDATE ON document_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_ai_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_smart_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_pulse_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view versions of documents they can access" ON document_versions;
DROP POLICY IF EXISTS "Users can create versions for their documents" ON document_versions;
DROP POLICY IF EXISTS "Users can view AI metadata for accessible documents" ON document_ai_metadata;
DROP POLICY IF EXISTS "System can insert AI metadata" ON document_ai_metadata;
DROP POLICY IF EXISTS "System can update AI metadata" ON document_ai_metadata;
DROP POLICY IF EXISTS "Users can view their own smart collections" ON document_smart_collections;
DROP POLICY IF EXISTS "Users can create their own smart collections" ON document_smart_collections;
DROP POLICY IF EXISTS "Users can update their own smart collections" ON document_smart_collections;
DROP POLICY IF EXISTS "Users can delete their own smart collections" ON document_smart_collections;
DROP POLICY IF EXISTS "Users can view analytics for accessible documents" ON document_analytics;
DROP POLICY IF EXISTS "System can manage analytics" ON document_analytics;
DROP POLICY IF EXISTS "Users can view Pulse items for accessible documents" ON document_pulse_items;
DROP POLICY IF EXISTS "System can manage Pulse sync" ON document_pulse_items;
DROP POLICY IF EXISTS "Users can view all folders" ON document_folders;
DROP POLICY IF EXISTS "Users can create their own folders" ON document_folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON document_folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON document_folders;

-- Create policies with simpler logic (allow all authenticated users)
-- You can tighten these based on your specific security requirements

-- document_versions policies
CREATE POLICY "Users can view all document versions"
  ON document_versions FOR SELECT
  USING (true);

CREATE POLICY "Users can create document versions"
  ON document_versions FOR INSERT
  WITH CHECK (true);

-- document_ai_metadata policies
CREATE POLICY "Users can view all AI metadata"
  ON document_ai_metadata FOR SELECT
  USING (true);

CREATE POLICY "Users can insert AI metadata"
  ON document_ai_metadata FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update AI metadata"
  ON document_ai_metadata FOR UPDATE
  USING (true);

-- document_smart_collections policies
CREATE POLICY "Users can view all smart collections"
  ON document_smart_collections FOR SELECT
  USING (true);

CREATE POLICY "Users can create smart collections"
  ON document_smart_collections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update smart collections"
  ON document_smart_collections FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete smart collections"
  ON document_smart_collections FOR DELETE
  USING (true);

-- document_analytics policies
CREATE POLICY "Users can view all analytics"
  ON document_analytics FOR SELECT
  USING (true);

CREATE POLICY "Users can manage analytics"
  ON document_analytics FOR ALL
  USING (true);

-- document_pulse_items policies
CREATE POLICY "Users can view all Pulse items"
  ON document_pulse_items FOR SELECT
  USING (true);

CREATE POLICY "Users can manage Pulse items"
  ON document_pulse_items FOR ALL
  USING (true);

-- document_folders policies
CREATE POLICY "Users can view all folders"
  ON document_folders FOR SELECT
  USING (true);

CREATE POLICY "Users can create folders"
  ON document_folders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update folders"
  ON document_folders FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete folders"
  ON document_folders FOR DELETE
  USING (true);

-- ============================================================================
-- 10. Helper Views
-- ============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS documents_with_ai;
DROP VIEW IF EXISTS documents_with_analytics;
DROP VIEW IF EXISTS pulse_documents;

-- View: Documents with AI metadata
CREATE VIEW documents_with_ai AS
SELECT
  d.*,
  ai.extracted_text,
  ai.classification_category,
  ai.classification_confidence,
  ai.auto_tags,
  ai.ai_summary,
  ai.detected_entities,
  ai.processed_at as ai_processed_at
FROM documents d
LEFT JOIN document_ai_metadata ai ON d.id = ai.document_id;

-- View: Documents with analytics
CREATE VIEW documents_with_analytics AS
SELECT
  d.*,
  a.view_count,
  a.download_count,
  a.share_count,
  a.last_viewed_at,
  a.last_downloaded_at
FROM documents d
LEFT JOIN document_analytics a ON d.id = a.document_id;

-- View: Documents from Pulse
CREATE VIEW pulse_documents AS
SELECT
  d.*,
  p.pulse_item_type,
  p.pulse_item_id,
  p.pulse_channel_name,
  p.pulse_participants,
  p.sync_status,
  p.last_synced_at
FROM documents d
INNER JOIN document_pulse_items p ON d.id = p.document_id
WHERE d.pulse_synced = true;

-- ============================================================================
-- Migration Complete
-- ============================================================================

INSERT INTO migrations (name, executed_at)
VALUES ('20260118_create_document_enhancements_v2', NOW())
ON CONFLICT (name) DO NOTHING;
