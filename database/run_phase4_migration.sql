-- =====================================================
-- LOGOS VISION CRM - Phase 4 Complete Migration
-- =====================================================
--
-- This is a single migration file that combines:
-- 1. RLS policies and storage setup
-- 2. Database validation constraints
-- 3. Performance indexes
--
-- Run this in your Supabase SQL Editor to apply all Phase 4
-- database improvements at once.
--
-- IMPORTANT: Review the PHASE4_DATABASE_SETUP_GUIDE.md first!
--
-- Estimated execution time: 1-2 minutes
--
-- =====================================================

\echo '═══════════════════════════════════════════════════════'
\echo 'PHASE 4 COMPLETE DATABASE MIGRATION'
\echo '═══════════════════════════════════════════════════════'
\echo ''
\echo 'This will set up:'
\echo '  ✓ Row Level Security policies'
\echo '  ✓ Storage buckets and policies'
\echo '  ✓ Database validation constraints'
\echo '  ✓ Performance indexes'
\echo '  ✓ Helper functions'
\echo ''
\echo 'Starting migration...'
\echo ''

-- =====================================================
-- STEP 1: Storage Buckets
-- =====================================================

\echo '→ Creating storage buckets...'

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('documents', 'documents', false, 52428800, ARRAY[
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]),
  ('images', 'images', true, 10485760, ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
  ]),
  ('avatars', 'avatars', true, 5242880, ARRAY[
    'image/jpeg', 'image/png', 'image/webp'
  ])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

\echo '  ✓ Storage buckets created'

-- =====================================================
-- STEP 2: Helper Functions
-- =====================================================

\echo '→ Creating helper functions...'

CREATE OR REPLACE FUNCTION get_user_role() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'Client');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'Admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_manager_or_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('Admin', 'Manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_staff() RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('Admin', 'Manager', 'Consultant');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_team_member_id() RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM team_members WHERE email = auth.email() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_assigned_to_project(p_project_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_team_members ptm
    WHERE ptm.project_id = p_project_id
    AND ptm.team_member_id = get_user_team_member_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

\echo '  ✓ Helper functions created'

-- =====================================================
-- STEP 3: Validation Functions
-- =====================================================

\echo '→ Creating validation functions...'

CREATE OR REPLACE FUNCTION is_valid_email(email TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION is_valid_phone(phone TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN length(regexp_replace(phone, '\D', '', 'g')) >= 10;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION is_valid_url(url TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN url ~* '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION is_valid_date_range(start_date DATE, end_date DATE) RETURNS BOOLEAN AS $$
BEGIN
  RETURN end_date IS NULL OR end_date >= start_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

\echo '  ✓ Validation functions created'

-- =====================================================
-- STEP 4: Enable RLS
-- =====================================================

\echo '→ Enabling RLS on all tables...'

DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
  END LOOP;
END $$;

\echo '  ✓ RLS enabled'

-- =====================================================
-- STEP 5: Drop Existing Policies
-- =====================================================

\echo '→ Dropping existing policies...'

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

\echo '  ✓ Old policies dropped'

-- =====================================================
-- STEP 6: Create Table RLS Policies
-- =====================================================

\echo '→ Creating table RLS policies...'
\echo '  → Clients policies...'

CREATE POLICY "clients_select_admin_manager" ON clients FOR SELECT USING (is_manager_or_admin());
CREATE POLICY "clients_select_consultant" ON clients FOR SELECT USING (get_user_role() = 'Consultant' AND EXISTS (SELECT 1 FROM projects p JOIN project_team_members ptm ON p.id = ptm.project_id WHERE p.client_id = clients.id AND ptm.team_member_id = get_user_team_member_id()));
CREATE POLICY "clients_select_own" ON clients FOR SELECT USING (get_user_role() = 'Client' AND email = auth.email());
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (is_manager_or_admin());
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (is_manager_or_admin());
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (is_admin());

\echo '  → Team members policies...'

CREATE POLICY "team_members_select" ON team_members FOR SELECT USING (is_staff());
CREATE POLICY "team_members_insert" ON team_members FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "team_members_update_admin" ON team_members FOR UPDATE USING (is_admin());
CREATE POLICY "team_members_update_own" ON team_members FOR UPDATE USING (email = auth.email());
CREATE POLICY "team_members_delete" ON team_members FOR DELETE USING (is_admin());

\echo '  → Projects policies...'

CREATE POLICY "projects_select_admin_manager" ON projects FOR SELECT USING (is_manager_or_admin());
CREATE POLICY "projects_select_consultant" ON projects FOR SELECT USING (get_user_role() = 'Consultant' AND is_assigned_to_project(id));
CREATE POLICY "projects_select_client" ON projects FOR SELECT USING (get_user_role() = 'Client' AND client_id IN (SELECT id FROM clients WHERE email = auth.email()));
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (is_manager_or_admin());
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (is_manager_or_admin() OR (get_user_role() = 'Consultant' AND is_assigned_to_project(id)));
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (is_admin());

\echo '  → Tasks policies...'

CREATE POLICY "tasks_select_staff" ON tasks FOR SELECT USING (is_staff());
CREATE POLICY "tasks_select_client" ON tasks FOR SELECT USING (get_user_role() = 'Client' AND shared_with_client = true AND project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT id FROM clients WHERE email = auth.email())));
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (is_staff());
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (is_manager_or_admin());

\echo '  → Activities policies...'

CREATE POLICY "activities_select_staff" ON activities FOR SELECT USING (is_staff());
CREATE POLICY "activities_select_client" ON activities FOR SELECT USING (get_user_role() = 'Client' AND shared_with_client = true);
CREATE POLICY "activities_insert" ON activities FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "activities_update" ON activities FOR UPDATE USING (is_staff());
CREATE POLICY "activities_delete" ON activities FOR DELETE USING (is_manager_or_admin());

\echo '  → Cases policies...'

CREATE POLICY "cases_select_staff" ON cases FOR SELECT USING (is_staff());
CREATE POLICY "cases_select_client" ON cases FOR SELECT USING (get_user_role() = 'Client' AND client_id IN (SELECT id FROM clients WHERE email = auth.email()));
CREATE POLICY "cases_insert" ON cases FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "cases_update" ON cases FOR UPDATE USING (is_staff());
CREATE POLICY "cases_delete" ON cases FOR DELETE USING (is_admin());

\echo '  → Other table policies...'

-- Continue with other tables...
CREATE POLICY "documents_select_staff" ON documents FOR SELECT USING (is_staff());
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (is_manager_or_admin());
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (is_admin());

CREATE POLICY "volunteers_select" ON volunteers FOR SELECT USING (is_staff());
CREATE POLICY "volunteers_insert" ON volunteers FOR INSERT WITH CHECK (is_manager_or_admin());
CREATE POLICY "volunteers_update" ON volunteers FOR UPDATE USING (is_manager_or_admin());
CREATE POLICY "volunteers_delete" ON volunteers FOR DELETE USING (is_admin());

CREATE POLICY "donations_select" ON donations FOR SELECT USING (is_staff());
CREATE POLICY "donations_insert" ON donations FOR INSERT WITH CHECK (is_manager_or_admin());
CREATE POLICY "donations_update" ON donations FOR UPDATE USING (is_manager_or_admin());
CREATE POLICY "donations_delete" ON donations FOR DELETE USING (is_admin());

CREATE POLICY "events_select_published" ON events FOR SELECT USING (is_published = true);
CREATE POLICY "events_select_staff" ON events FOR SELECT USING (is_staff());
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (is_manager_or_admin());
CREATE POLICY "events_update" ON events FOR UPDATE USING (is_manager_or_admin());
CREATE POLICY "events_delete" ON events FOR DELETE USING (is_admin());

CREATE POLICY "email_campaigns_select" ON email_campaigns FOR SELECT USING (is_manager_or_admin());
CREATE POLICY "email_campaigns_insert" ON email_campaigns FOR INSERT WITH CHECK (is_manager_or_admin());
CREATE POLICY "email_campaigns_update" ON email_campaigns FOR UPDATE USING (is_manager_or_admin());
CREATE POLICY "email_campaigns_delete" ON email_campaigns FOR DELETE USING (is_admin());

\echo '  ✓ Table policies created'

-- =====================================================
-- STEP 7: Storage Policies
-- =====================================================

\echo '→ Creating storage policies...'

CREATE POLICY "documents_upload_staff" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND is_staff());
CREATE POLICY "documents_read_staff" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents' AND is_staff());
CREATE POLICY "documents_update_admin_manager" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents' AND is_manager_or_admin());
CREATE POLICY "documents_delete_admin_manager" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND is_manager_or_admin());

CREATE POLICY "images_read_public" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'images');
CREATE POLICY "images_upload_staff" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images' AND is_staff());
CREATE POLICY "images_update_admin_manager" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images' AND is_manager_or_admin());
CREATE POLICY "images_delete_admin_manager" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images' AND is_manager_or_admin());

CREATE POLICY "avatars_read_public" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_upload_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

\echo '  ✓ Storage policies created'

-- =====================================================
-- STEP 8: Validation Constraints
-- =====================================================

\echo '→ Adding validation constraints...'

-- Clients
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_valid, DROP CONSTRAINT IF EXISTS clients_phone_valid, DROP CONSTRAINT IF EXISTS clients_name_not_empty;
ALTER TABLE clients ADD CONSTRAINT clients_email_valid CHECK (is_valid_email(email)), ADD CONSTRAINT clients_phone_valid CHECK (phone IS NULL OR is_valid_phone(phone)), ADD CONSTRAINT clients_name_not_empty CHECK (length(trim(name)) >= 2);

-- Projects
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_name_not_empty, DROP CONSTRAINT IF EXISTS projects_date_range_valid;
ALTER TABLE projects ADD CONSTRAINT projects_name_not_empty CHECK (length(trim(name)) >= 3), ADD CONSTRAINT projects_date_range_valid CHECK (is_valid_date_range(start_date, end_date));

-- Tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_description_not_empty;
ALTER TABLE tasks ADD CONSTRAINT tasks_description_not_empty CHECK (length(trim(description)) >= 3);

-- Cases
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_title_not_empty, DROP CONSTRAINT IF EXISTS cases_description_not_empty;
ALTER TABLE cases ADD CONSTRAINT cases_title_not_empty CHECK (length(trim(title)) >= 3), ADD CONSTRAINT cases_description_not_empty CHECK (length(trim(description)) >= 10);

\echo '  ✓ Validation constraints added'

-- =====================================================
-- STEP 9: Performance Indexes
-- =====================================================

\echo '→ Creating performance indexes...'

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);

\echo '  ✓ Performance indexes created'

-- =====================================================
-- STEP 10: Grant Permissions
-- =====================================================

\echo '→ Granting permissions...'

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

\echo '  ✓ Permissions granted'

-- =====================================================
-- COMPLETION
-- =====================================================

\echo ''
\echo '═══════════════════════════════════════════════════════'
\echo '✓ MIGRATION COMPLETE!'
\echo '═══════════════════════════════════════════════════════'
\echo ''
\echo 'Next steps:'
\echo '  1. Verify RLS is enabled on all tables'
\echo '  2. Set up user roles in auth.users'
\echo '  3. Test file uploads to storage buckets'
\echo '  4. Review the PHASE4_DATABASE_SETUP_GUIDE.md'
\echo ''
\echo 'Run verification queries:'
\echo '  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = '\'public\'';'
\echo '  SELECT * FROM storage.buckets;'
\echo '  SELECT tablename, COUNT(*) FROM pg_policies GROUP BY tablename;'
\echo ''
