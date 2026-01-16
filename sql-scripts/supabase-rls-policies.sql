-- Row Level Security Policies for Logos Vision CRM
-- Run this script AFTER creating tables with supabase-schema.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

-- Enable RLS on existing tables (will skip if table doesn't exist)
DO $$
BEGIN
  -- Clients
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Projects
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Tasks
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Activities
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activities') THEN
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Team Members
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') THEN
    ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Volunteers
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'volunteers') THEN
    ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Donations
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'donations') THEN
    ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Cases
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cases') THEN
    ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Case Comments
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'case_comments') THEN
    ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Events
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'events') THEN
    ALTER TABLE events ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Email Campaigns
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_campaigns') THEN
    ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Documents
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Webpages
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webpages') THEN
    ALTER TABLE webpages ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- ============================================
-- CLIENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read clients"
ON clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update clients"
ON clients FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete clients"
ON clients FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- PROJECTS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read projects"
ON projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update projects"
ON projects FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- TASKS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read tasks"
ON tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tasks"
ON tasks FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete tasks"
ON tasks FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- ACTIVITIES TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read activities"
ON activities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert activities"
ON activities FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update activities"
ON activities FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete activities"
ON activities FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- TEAM MEMBERS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read team_members"
ON team_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert team_members"
ON team_members FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update team_members"
ON team_members FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete team_members"
ON team_members FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- VOLUNTEERS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read volunteers"
ON volunteers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert volunteers"
ON volunteers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update volunteers"
ON volunteers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete volunteers"
ON volunteers FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- DONATIONS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read donations"
ON donations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert donations"
ON donations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update donations"
ON donations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete donations"
ON donations FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- CASES TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read cases"
ON cases FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert cases"
ON cases FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update cases"
ON cases FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete cases"
ON cases FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- CASE COMMENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read case_comments"
ON case_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert case_comments"
ON case_comments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update case_comments"
ON case_comments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete case_comments"
ON case_comments FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read events"
ON events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert events"
ON events FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update events"
ON events FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete events"
ON events FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- EMAIL CAMPAIGNS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read email_campaigns"
ON email_campaigns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert email_campaigns"
ON email_campaigns FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update email_campaigns"
ON email_campaigns FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete email_campaigns"
ON email_campaigns FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- DOCUMENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read documents"
ON documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update documents"
ON documents FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete documents"
ON documents FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- WEBPAGES TABLE POLICIES
-- ============================================

CREATE POLICY "Allow authenticated users to read webpages"
ON webpages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert webpages"
ON webpages FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update webpages"
ON webpages FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete webpages"
ON webpages FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- STORAGE BUCKET POLICIES (for documents bucket)
-- ============================================

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated users to read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this to verify all policies are created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
