-- Enterprise Document Library Enhancement Migration
-- Phase 1: Foundation tables for AI, versioning, Pulse integration, and analytics
-- Created: 2026-01-18

-- ============================================================================
-- 1. Document Versions Table
-- ============================================================================
-- Tracks version history for documents with hybrid versioning strategy
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  uploaded_by_id UUID REFERENCES auth.users(id),
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_document_version UNIQUE(document_id, version_number)
);

-- Index for quick version lookups
CREATE INDEX IF NOT EXISTS idx_doc_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_versions_created_at ON document_versions(created_at DESC);

COMMENT ON TABLE document_versions IS 'Version history for documents with auto-versioning for Contracts/Legal categories';
COMMENT ON COLUMN document_versions.version_number IS 'Incremental version number starting from 1';
COMMENT ON COLUMN document_versions.change_description IS 'Optional description of what changed in this version';

-- ============================================================================
-- 2. Document AI Metadata Table
-- ============================================================================
-- Stores AI-generated metadata (classification, tags, OCR results, summaries)
CREATE TABLE IF NOT EXISTS document_ai_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Text extraction (OCR/PDF parsing)
  extracted_text TEXT,
  language_detected TEXT,
  extraction_confidence DECIMAL(3,2),

  -- AI Classification
  classification_category TEXT,
  classification_confidence DECIMAL(3,2),
  classification_reasoning TEXT,

  -- Auto-tagging
  auto_tags TEXT[] DEFAULT '{}',
  suggested_tags TEXT[] DEFAULT '{}',

  -- Entity extraction
  detected_entities JSONB DEFAULT '{}',

  -- Summarization
  ai_summary TEXT,
  key_points TEXT[],

  -- Processing metadata
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time_ms INTEGER,
  ai_model_used TEXT DEFAULT 'gemini-2.5-flash',

  CONSTRAINT unique_document_ai_metadata UNIQUE(document_id)
);

-- GIN index for array and JSONB searches
CREATE INDEX IF NOT EXISTS idx_doc_ai_metadata_tags ON document_ai_metadata USING GIN(auto_tags);
CREATE INDEX IF NOT EXISTS idx_doc_ai_metadata_entities ON document_ai_metadata USING GIN(detected_entities);
CREATE INDEX IF NOT EXISTS idx_doc_ai_metadata_category ON document_ai_metadata(classification_category);

-- Full-text search index on extracted text
CREATE INDEX IF NOT EXISTS idx_doc_ai_metadata_text_search ON document_ai_metadata USING GIN(to_tsvector('english', extracted_text));

COMMENT ON TABLE document_ai_metadata IS 'AI-generated metadata for documents including classification, OCR, tags, and summaries';
COMMENT ON COLUMN document_ai_metadata.detected_entities IS 'JSON object with entity types as keys (people, organizations, dates, locations)';

-- ============================================================================
-- 3. Document Smart Collections Table
-- ============================================================================
-- Dynamic collections with rule-based filtering
CREATE TABLE IF NOT EXISTS document_smart_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,

  -- Rules engine
  rules JSONB NOT NULL DEFAULT '[]',
  rule_operator TEXT DEFAULT 'and' CHECK (rule_operator IN ('and', 'or')),

  -- Visual customization
  color TEXT,
  icon TEXT,

  -- Ownership and sharing
  owner_id UUID REFERENCES auth.users(id),
  is_shared BOOLEAN DEFAULT false,
  shared_with_team_ids UUID[],

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smart_collections_owner ON document_smart_collections(owner_id);
CREATE INDEX IF NOT EXISTS idx_smart_collections_rules ON document_smart_collections USING GIN(rules);

COMMENT ON TABLE document_smart_collections IS 'User-defined smart collections with dynamic rule-based document filtering';
COMMENT ON COLUMN document_smart_collections.rules IS 'Array of rule objects with field, operator, value structure';

-- ============================================================================
-- 4. Document Analytics Table
-- ============================================================================
-- Usage tracking and analytics for documents
CREATE TABLE IF NOT EXISTS document_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Usage counters
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  preview_count INTEGER DEFAULT 0,

  -- Last activity timestamps
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  last_shared_at TIMESTAMP WITH TIME ZONE,

  -- AI processing stats
  ai_processing_count INTEGER DEFAULT 0,
  avg_ai_processing_time_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_document_analytics UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_analytics_document_id ON document_analytics(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_analytics_last_viewed ON document_analytics(last_viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_analytics_view_count ON document_analytics(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_doc_analytics_download_count ON document_analytics(download_count DESC);

COMMENT ON TABLE document_analytics IS 'Usage tracking and analytics for documents';

-- ============================================================================
-- 5. Document Pulse Items Table
-- ============================================================================
-- Mapping between Logos documents and Pulse archive items
CREATE TABLE IF NOT EXISTS document_pulse_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Pulse source information
  pulse_item_type TEXT NOT NULL CHECK (pulse_item_type IN ('meeting', 'chat_archive', 'conversation', 'vox', 'project_file')),
  pulse_item_id TEXT NOT NULL,
  pulse_channel_id TEXT,
  pulse_channel_name TEXT,

  -- Sync metadata
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error', 'conflict')),
  sync_direction TEXT DEFAULT 'pulse_to_logos' CHECK (sync_direction IN ('pulse_to_logos', 'logos_to_pulse', 'bidirectional')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_error_message TEXT,

  -- Pulse metadata
  pulse_participants TEXT[],
  pulse_created_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_pulse_document UNIQUE(document_id),
  CONSTRAINT unique_pulse_item UNIQUE(pulse_item_id, pulse_item_type)
);

CREATE INDEX IF NOT EXISTS idx_doc_pulse_items_document_id ON document_pulse_items(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_pulse_items_type ON document_pulse_items(pulse_item_type);
CREATE INDEX IF NOT EXISTS idx_doc_pulse_items_status ON document_pulse_items(sync_status);
CREATE INDEX IF NOT EXISTS idx_doc_pulse_items_pulse_id ON document_pulse_items(pulse_item_id);

COMMENT ON TABLE document_pulse_items IS 'Mapping and sync status for documents imported from Pulse';
COMMENT ON COLUMN document_pulse_items.sync_direction IS 'Current: pulse_to_logos (one-way). Future: bidirectional support';

-- ============================================================================
-- 6. Document Folders Enhancement (if not exists)
-- ============================================================================
-- Enhanced folder structure with hierarchy and metadata
CREATE TABLE IF NOT EXISTS document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  level INTEGER DEFAULT 0,

  -- Visual customization
  color TEXT,
  icon TEXT,

  -- Auto-versioning configuration
  auto_version_enabled BOOLEAN DEFAULT false,
  version_retention_count INTEGER DEFAULT 10,

  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_folder_path UNIQUE(path)
);

CREATE INDEX IF NOT EXISTS idx_doc_folders_parent ON document_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_doc_folders_path ON document_folders(path);
CREATE INDEX IF NOT EXISTS idx_doc_folders_owner ON document_folders(owner_id);

COMMENT ON TABLE document_folders IS 'Hierarchical folder structure for document organization';
COMMENT ON COLUMN document_folders.auto_version_enabled IS 'Enable auto-versioning for all documents in this folder';

-- ============================================================================
-- 7. Add new columns to existing documents table (if not already present)
-- ============================================================================
-- Extend documents table with new fields for enterprise features

-- Check and add columns safely
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
    ALTER TABLE documents ADD COLUMN folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL;
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
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_storage_provider ON documents(storage_provider);
CREATE INDEX IF NOT EXISTS idx_documents_pulse_synced ON documents(pulse_synced);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);
CREATE INDEX IF NOT EXISTS idx_documents_sensitivity ON documents(sensitivity_level);

-- ============================================================================
-- 8. Trigger Functions for Automatic Updates
-- ============================================================================

-- Trigger to update analytics on document access
CREATE OR REPLACE FUNCTION update_document_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO document_analytics (document_id, view_count, last_viewed_at)
  VALUES (NEW.id, 1, NOW())
  ON CONFLICT (document_id) DO UPDATE
  SET view_count = document_analytics.view_count + 1,
      last_viewed_at = NOW(),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Create trigger on documents table
DROP TRIGGER IF EXISTS trigger_create_document_analytics ON documents;
CREATE TRIGGER trigger_create_document_analytics
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_analytics();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trigger_update_smart_collections_updated_at ON document_smart_collections;
CREATE TRIGGER trigger_update_smart_collections_updated_at
  BEFORE UPDATE ON document_smart_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_analytics_updated_at ON document_analytics;
CREATE TRIGGER trigger_update_analytics_updated_at
  BEFORE UPDATE ON document_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_pulse_items_updated_at ON document_pulse_items;
CREATE TRIGGER trigger_update_pulse_items_updated_at
  BEFORE UPDATE ON document_pulse_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_folders_updated_at ON document_folders;
CREATE TRIGGER trigger_update_folders_updated_at
  BEFORE UPDATE ON document_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_ai_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_smart_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_pulse_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;

-- Policies for document_versions (inherit from parent document)
CREATE POLICY "Users can view versions of documents they can access" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
    )
  );

CREATE POLICY "Users can create versions for their documents" ON document_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
    )
  );

-- Policies for document_ai_metadata (inherit from parent document)
CREATE POLICY "Users can view AI metadata for accessible documents" ON document_ai_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_ai_metadata.document_id
    )
  );

CREATE POLICY "System can insert AI metadata" ON document_ai_metadata
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update AI metadata" ON document_ai_metadata
  FOR UPDATE USING (true);

-- Policies for document_smart_collections
CREATE POLICY "Users can view their own smart collections" ON document_smart_collections
  FOR SELECT USING (owner_id = auth.uid() OR is_shared = true);

CREATE POLICY "Users can create their own smart collections" ON document_smart_collections
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own smart collections" ON document_smart_collections
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own smart collections" ON document_smart_collections
  FOR DELETE USING (owner_id = auth.uid());

-- Policies for document_analytics (read-only for users, write for system)
CREATE POLICY "Users can view analytics for accessible documents" ON document_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analytics.document_id
    )
  );

CREATE POLICY "System can manage analytics" ON document_analytics
  FOR ALL USING (true);

-- Policies for document_pulse_items
CREATE POLICY "Users can view Pulse items for accessible documents" ON document_pulse_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_pulse_items.document_id
    )
  );

CREATE POLICY "System can manage Pulse sync" ON document_pulse_items
  FOR ALL USING (true);

-- Policies for document_folders
CREATE POLICY "Users can view all folders" ON document_folders
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own folders" ON document_folders
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own folders" ON document_folders
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own folders" ON document_folders
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================================
-- 10. Helper Views for Common Queries
-- ============================================================================

-- View: Documents with AI metadata
CREATE OR REPLACE VIEW documents_with_ai AS
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
CREATE OR REPLACE VIEW documents_with_analytics AS
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
CREATE OR REPLACE VIEW pulse_documents AS
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

-- Insert migration record
INSERT INTO public.migrations (name, executed_at)
VALUES ('20260118_create_document_enhancements', NOW())
ON CONFLICT (name) DO NOTHING;

COMMENT ON SCHEMA public IS 'Enterprise Document Library Enhancement - Phase 1 Complete';
