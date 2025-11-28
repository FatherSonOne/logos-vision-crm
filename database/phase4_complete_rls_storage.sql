-- =====================================================
-- LOGOS VISION CRM - Phase 4 Complete Database Integration
-- =====================================================
--
-- This file provides comprehensive RLS policies, storage configuration,
-- and database-level validation for the CRM system.
--
-- Run this file after your main schema is created.
--
-- Prerequisites:
-- 1. All tables created from schema.sql
-- 2. Supabase Storage enabled
-- 3. Auth system configured
--
-- =====================================================

-- =====================================================
-- PART 1: STORAGE BUCKETS SETUP
-- =====================================================

-- Create storage buckets for different file types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  -- Documents bucket (PDFs, Word docs, etc.)
  (
    'documents',
    'documents',
    false, -- Private files, require authentication
    52428800, -- 50MB limit
    ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ]
  ),
  -- Images bucket (for event banners, email headers, etc.)
  (
    'images',
    'images',
    true, -- Public files for website/emails
    10485760, -- 10MB limit
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]
  ),
  -- Profile pictures bucket
  (
    'avatars',
    'avatars',
    true, -- Public files
    5242880, -- 5MB limit
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  )
ON CONFLICT (id) DO UPDATE
SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- PART 2: HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Get user's role from auth.users metadata
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'Client' -- Default to most restrictive
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'Admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('Admin', 'Manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is staff (Admin, Manager, or Consultant)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('Admin', 'Manager', 'Consultant');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's team member ID
CREATE OR REPLACE FUNCTION get_user_team_member_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM team_members
    WHERE email = auth.email()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is assigned to a specific project
CREATE OR REPLACE FUNCTION is_assigned_to_project(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM project_team_members ptm
    WHERE ptm.project_id = p_project_id
    AND ptm.team_member_id = get_user_team_member_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user owns or is assigned to a task
CREATE OR REPLACE FUNCTION can_access_task(p_task_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_project_id UUID;
BEGIN
  -- Get the project ID for this task
  SELECT project_id INTO v_project_id
  FROM tasks
  WHERE id = p_task_id;

  -- Admin/Manager can access all tasks
  IF is_manager_or_admin() THEN
    RETURN TRUE;
  END IF;

  -- Check if user is assigned to the project
  RETURN is_assigned_to_project(v_project_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- PART 3: STORAGE POLICIES
-- =====================================================

-- Documents Bucket Policies
-- --------------------------

-- Staff can upload documents
CREATE POLICY "documents_upload_staff"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND is_staff()
  -- Enforce folder structure: documents/{category}/{client_or_project_id}/filename
  AND (storage.foldername(name))[1] IN ('client', 'project', 'internal', 'template')
);

-- Staff can read all documents
CREATE POLICY "documents_read_staff"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND is_staff()
);

-- Clients can read documents in their folders
CREATE POLICY "documents_read_client"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND get_user_role() = 'Client'
  AND (
    -- Match client folder: documents/client/{client_id}/
    (storage.foldername(name))[1] = 'client'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM clients WHERE email = auth.email()
    )
  )
);

-- Admin/Manager can update documents
CREATE POLICY "documents_update_admin_manager"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND is_manager_or_admin()
);

-- Admin/Manager can delete documents
CREATE POLICY "documents_delete_admin_manager"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND is_manager_or_admin()
);

-- Images Bucket Policies
-- -----------------------

-- Public read access for images (used in emails, events, website)
CREATE POLICY "images_read_public"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'images');

-- Staff can upload images
CREATE POLICY "images_upload_staff"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND is_staff()
);

-- Admin/Manager can update/delete images
CREATE POLICY "images_update_admin_manager"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images'
  AND is_manager_or_admin()
);

CREATE POLICY "images_delete_admin_manager"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images'
  AND is_manager_or_admin()
);

-- Avatars Bucket Policies
-- ------------------------

-- Public read access for avatars
CREATE POLICY "avatars_read_public"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "avatars_upload_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  -- Enforce naming: avatars/{user_id}.{ext}
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- PART 4: ENHANCED TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
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

-- Enable RLS on all tables
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
  END LOOP;
END $$;

-- CLIENTS TABLE
-- -------------
CREATE POLICY "clients_select_admin_manager" ON clients
  FOR SELECT USING (is_manager_or_admin());

CREATE POLICY "clients_select_consultant" ON clients
  FOR SELECT USING (
    get_user_role() = 'Consultant'
    AND EXISTS (
      SELECT 1 FROM projects p
      JOIN project_team_members ptm ON p.id = ptm.project_id
      WHERE p.client_id = clients.id
      AND ptm.team_member_id = get_user_team_member_id()
    )
  );

CREATE POLICY "clients_select_own" ON clients
  FOR SELECT USING (
    get_user_role() = 'Client' AND email = auth.email()
  );

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (is_manager_or_admin());

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (is_manager_or_admin());

CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (is_admin());

-- TEAM MEMBERS TABLE
-- ------------------
CREATE POLICY "team_members_select" ON team_members
  FOR SELECT USING (is_staff());

CREATE POLICY "team_members_insert" ON team_members
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "team_members_update_admin" ON team_members
  FOR UPDATE USING (is_admin());

CREATE POLICY "team_members_update_own" ON team_members
  FOR UPDATE USING (email = auth.email());

CREATE POLICY "team_members_delete" ON team_members
  FOR DELETE USING (is_admin());

-- PROJECTS TABLE
-- --------------
CREATE POLICY "projects_select_admin_manager" ON projects
  FOR SELECT USING (is_manager_or_admin());

CREATE POLICY "projects_select_consultant" ON projects
  FOR SELECT USING (
    get_user_role() = 'Consultant'
    AND is_assigned_to_project(id)
  );

CREATE POLICY "projects_select_client" ON projects
  FOR SELECT USING (
    get_user_role() = 'Client'
    AND client_id IN (SELECT id FROM clients WHERE email = auth.email())
  );

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (is_manager_or_admin());

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (
    is_manager_or_admin()
    OR (get_user_role() = 'Consultant' AND is_assigned_to_project(id))
  );

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (is_admin());

-- TASKS TABLE
-- -----------
CREATE POLICY "tasks_select_staff" ON tasks
  FOR SELECT USING (
    is_staff() AND (is_manager_or_admin() OR can_access_task(id))
  );

CREATE POLICY "tasks_select_client" ON tasks
  FOR SELECT USING (
    get_user_role() = 'Client'
    AND shared_with_client = true
    AND project_id IN (
      SELECT id FROM projects
      WHERE client_id IN (SELECT id FROM clients WHERE email = auth.email())
    )
  );

CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT WITH CHECK (
    is_staff() AND (is_manager_or_admin() OR is_assigned_to_project(project_id))
  );

CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE USING (
    is_staff() AND (is_manager_or_admin() OR can_access_task(id))
  );

CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE USING (is_manager_or_admin());

-- ACTIVITIES TABLE
-- ----------------
CREATE POLICY "activities_select_staff" ON activities
  FOR SELECT USING (is_staff());

CREATE POLICY "activities_select_client" ON activities
  FOR SELECT USING (
    get_user_role() = 'Client'
    AND shared_with_client = true
    AND (
      client_id IN (SELECT id FROM clients WHERE email = auth.email())
      OR project_id IN (
        SELECT id FROM projects
        WHERE client_id IN (SELECT id FROM clients WHERE email = auth.email())
      )
    )
  );

CREATE POLICY "activities_insert" ON activities
  FOR INSERT WITH CHECK (is_staff());

CREATE POLICY "activities_update" ON activities
  FOR UPDATE USING (
    is_staff() AND (is_manager_or_admin() OR created_by_id = auth.uid()::text)
  );

CREATE POLICY "activities_delete" ON activities
  FOR DELETE USING (is_manager_or_admin());

-- CASES TABLE
-- -----------
CREATE POLICY "cases_select_staff" ON cases
  FOR SELECT USING (
    is_staff() AND (
      is_manager_or_admin()
      OR assigned_to_id = get_user_team_member_id()
    )
  );

CREATE POLICY "cases_select_client" ON cases
  FOR SELECT USING (
    get_user_role() = 'Client'
    AND client_id IN (SELECT id FROM clients WHERE email = auth.email())
  );

CREATE POLICY "cases_insert" ON cases
  FOR INSERT WITH CHECK (is_staff());

CREATE POLICY "cases_update" ON cases
  FOR UPDATE USING (
    is_staff() AND (
      is_manager_or_admin()
      OR assigned_to_id = get_user_team_member_id()
    )
  );

CREATE POLICY "cases_delete" ON cases
  FOR DELETE USING (is_admin());

-- CASE COMMENTS TABLE
-- -------------------
CREATE POLICY "case_comments_select" ON case_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE id = case_comments.case_id)
  );

CREATE POLICY "case_comments_insert" ON case_comments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cases WHERE id = case_comments.case_id)
  );

CREATE POLICY "case_comments_update" ON case_comments
  FOR UPDATE USING (author_id = auth.uid()::text OR is_admin());

CREATE POLICY "case_comments_delete" ON case_comments
  FOR DELETE USING (is_admin());

-- DOCUMENTS TABLE
-- ---------------
CREATE POLICY "documents_select_staff" ON documents
  FOR SELECT USING (is_staff());

CREATE POLICY "documents_select_client" ON documents
  FOR SELECT USING (
    get_user_role() = 'Client'
    AND (
      related_id IN (SELECT id FROM clients WHERE email = auth.email())
      OR related_id IN (
        SELECT id FROM projects
        WHERE client_id IN (SELECT id FROM clients WHERE email = auth.email())
      )
    )
  );

CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (is_staff());

CREATE POLICY "documents_update" ON documents
  FOR UPDATE USING (is_manager_or_admin());

CREATE POLICY "documents_delete" ON documents
  FOR DELETE USING (is_admin());

-- VOLUNTEERS TABLE
-- ----------------
CREATE POLICY "volunteers_select" ON volunteers
  FOR SELECT USING (is_staff());

CREATE POLICY "volunteers_insert" ON volunteers
  FOR INSERT WITH CHECK (is_manager_or_admin());

CREATE POLICY "volunteers_update" ON volunteers
  FOR UPDATE USING (is_manager_or_admin());

CREATE POLICY "volunteers_delete" ON volunteers
  FOR DELETE USING (is_admin());

-- DONATIONS TABLE
-- ---------------
CREATE POLICY "donations_select" ON donations
  FOR SELECT USING (is_staff());

CREATE POLICY "donations_insert" ON donations
  FOR INSERT WITH CHECK (is_manager_or_admin());

CREATE POLICY "donations_update" ON donations
  FOR UPDATE USING (is_manager_or_admin());

CREATE POLICY "donations_delete" ON donations
  FOR DELETE USING (is_admin());

-- EVENTS TABLE
-- ------------
CREATE POLICY "events_select_published" ON events
  FOR SELECT USING (is_published = true);

CREATE POLICY "events_select_staff" ON events
  FOR SELECT USING (is_staff());

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (is_manager_or_admin());

CREATE POLICY "events_update" ON events
  FOR UPDATE USING (is_manager_or_admin());

CREATE POLICY "events_delete" ON events
  FOR DELETE USING (is_admin());

-- EMAIL CAMPAIGNS TABLE
-- ---------------------
CREATE POLICY "email_campaigns_select" ON email_campaigns
  FOR SELECT USING (is_manager_or_admin());

CREATE POLICY "email_campaigns_insert" ON email_campaigns
  FOR INSERT WITH CHECK (is_manager_or_admin());

CREATE POLICY "email_campaigns_update" ON email_campaigns
  FOR UPDATE USING (is_manager_or_admin());

CREATE POLICY "email_campaigns_delete" ON email_campaigns
  FOR DELETE USING (is_admin());

-- WEBPAGES TABLE (if exists)
-- ---------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'webpages') THEN
    EXECUTE '
      CREATE POLICY "webpages_select_published" ON webpages
        FOR SELECT USING (is_published = true);

      CREATE POLICY "webpages_select_staff" ON webpages
        FOR SELECT USING (is_staff());

      CREATE POLICY "webpages_insert" ON webpages
        FOR INSERT WITH CHECK (is_manager_or_admin());

      CREATE POLICY "webpages_update" ON webpages
        FOR UPDATE USING (is_manager_or_admin());

      CREATE POLICY "webpages_delete" ON webpages
        FOR DELETE USING (is_admin());
    ';
  END IF;
END $$;

-- =====================================================
-- PART 5: GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant authenticated users access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant authenticated users access to storage
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- Verify all policies are created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify storage buckets
SELECT
  id,
  name,
  public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_type_count
FROM storage.buckets
ORDER BY name;

-- =====================================================
-- TESTING INSTRUCTIONS
-- =====================================================
--
-- To test these policies, create test users with different roles:
--
-- 1. Set user role in auth.users metadata:
--
--    UPDATE auth.users
--    SET raw_user_meta_data = jsonb_set(
--      COALESCE(raw_user_meta_data, '{}'::jsonb),
--      '{role}',
--      '"Admin"'
--    )
--    WHERE email = 'admin@example.com';
--
-- 2. Test by logging in as each user type:
--    - Admin: Full access to everything
--    - Manager: Can view/edit most data, limited delete
--    - Consultant: Can view/edit assigned projects only
--    - Client: Can view only their own data
--
-- 3. Test storage uploads:
--    - Try uploading files to each bucket
--    - Verify mime type restrictions
--    - Verify file size limits
--    - Test access permissions
--
-- =====================================================
