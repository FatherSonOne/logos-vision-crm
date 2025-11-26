-- ============================================
-- CORRECTED SUPABASE SCHEMA - UNIFIED
-- ============================================
-- This fixes the UUID vs TEXT mismatch error
-- Use THIS file instead of supabase-schema.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (Clean Start)
-- ============================================
-- Run these if you want to recreate from scratch
DROP TABLE IF EXISTS case_comments CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS webpages CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- ============================================
-- CASES TABLE (FIXED: UUID instead of TEXT)
-- ============================================
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_id UUID NOT NULL,
  case_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  assigned_to UUID,
  date_opened TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_closed TIMESTAMPTZ,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CASE COMMENTS TABLE (FIXED: UUID for case_id)
-- ============================================
CREATE TABLE case_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EVENTS TABLE (FIXED: UUID)
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_id UUID,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  description TEXT,
  banner_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  schedule JSONB DEFAULT '[]'::jsonb,
  ticket_types JSONB DEFAULT '[]'::jsonb,
  volunteer_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EMAIL CAMPAIGNS TABLE (FIXED: UUID)
-- ============================================
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  subject TEXT NOT NULL,
  subject_line_b TEXT,
  body TEXT NOT NULL,
  header_image_url TEXT,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_date TIMESTAMPTZ,
  stats JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "unsubscribes": 0}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS TABLE (Already UUID - Good!)
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  related_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- WEBPAGES TABLE (FIXED: UUID)
-- ============================================
CREATE TABLE webpages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  author_id UUID NOT NULL,
  published_date TIMESTAMPTZ,
  meta_description TEXT,
  featured_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Cases indexes
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_date_opened ON cases(date_opened);

-- Case comments indexes
CREATE INDEX idx_case_comments_case_id ON case_comments(case_id);
CREATE INDEX idx_case_comments_user_id ON case_comments(user_id);

-- Events indexes
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_is_published ON events(is_published);

-- Email campaigns indexes
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_sent_date ON email_campaigns(sent_date);

-- Documents indexes
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_related_id ON documents(related_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Webpages indexes
CREATE INDEX idx_webpages_slug ON webpages(slug);
CREATE INDEX idx_webpages_status ON webpages(status);
CREATE INDEX idx_webpages_author_id ON webpages(author_id);

-- ============================================
-- CREATE UPDATED_AT TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_case_comments_updated_at ON case_comments;
CREATE TRIGGER update_case_comments_updated_at
  BEFORE UPDATE ON case_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_webpages_updated_at ON webpages;
CREATE TRIGGER update_webpages_updated_at
  BEFORE UPDATE ON webpages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE webpages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Allow authenticated access)
-- ============================================

CREATE POLICY "Allow authenticated read access" ON cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON cases FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON case_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON case_comments FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON events FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON email_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON email_campaigns FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON documents FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON webpages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON webpages FOR ALL TO authenticated USING (true);

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this to verify all tables are created
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- COMPLETED! ✅
-- ============================================
-- All tables now use UUID consistently
-- No more TEXT vs UUID foreign key errors!
