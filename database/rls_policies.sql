-- =====================================================
-- LOGOS VISION CRM - Row Level Security Policies
-- =====================================================
--
-- This file implements comprehensive RLS policies for the CRM
-- based on the Phase 4 permission system.
--
-- User Roles:
-- - Admin: Full access to all data
-- - Manager: Can view/edit most data, limited delete
-- - Consultant: Can view/edit assigned items only
-- - Client: Can view their own data only
--
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get user's role from auth.users metadata
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'user_role',
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'Client' -- Default to most restrictive
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'Admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('Admin', 'Manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is consultant, manager, or admin
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('Admin', 'Manager', 'Consultant');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is assigned to a project
CREATE OR REPLACE FUNCTION is_assigned_to_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_team_members ptm
    JOIN team_members tm ON ptm.team_member_id = tm.id
    WHERE ptm.project_id = is_assigned_to_project.project_id
    AND tm.email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLIENTS TABLE POLICIES
-- =====================================================

-- Admin/Manager can view all clients
CREATE POLICY "clients_view_admin_manager"
  ON clients FOR SELECT
  USING (is_manager_or_admin());

-- Consultants can view clients they're working with
CREATE POLICY "clients_view_consultant"
  ON clients FOR SELECT
  USING (
    get_user_role() = 'Consultant'
    AND EXISTS (
      SELECT 1 FROM projects p
      JOIN project_team_members ptm ON p.id = ptm.project_id
      JOIN team_members tm ON ptm.team_member_id = tm.id
      WHERE p.client_id = clients.id
      AND tm.email = auth.email()
    )
  );

-- Clients can view their own organization
CREATE POLICY "clients_view_own"
  ON clients FOR SELECT
  USING (
    get_user_role() = 'Client'
    AND email = auth.email()
  );

-- Admin/Manager can create clients
CREATE POLICY "clients_create"
  ON clients FOR INSERT
  WITH CHECK (is_manager_or_admin());

-- Admin/Manager can update clients
CREATE POLICY "clients_update"
  ON clients FOR UPDATE
  USING (is_manager_or_admin());

-- Only Admin can delete clients
CREATE POLICY "clients_delete"
  ON clients FOR DELETE
  USING (is_admin());

-- =====================================================
-- TEAM MEMBERS TABLE POLICIES
-- =====================================================

-- All staff can view team members
CREATE POLICY "team_members_view"
  ON team_members FOR SELECT
  USING (is_staff());

-- Admin can create/update/delete team members
CREATE POLICY "team_members_create"
  ON team_members FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "team_members_update"
  ON team_members FOR UPDATE
  USING (is_admin());

CREATE POLICY "team_members_delete"
  ON team_members FOR DELETE
  USING (is_admin());

-- Team members can update their own profile
CREATE POLICY "team_members_update_own"
  ON team_members FOR UPDATE
  USING (email = auth.email());

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================

-- Admin/Manager can view all projects
CREATE POLICY "projects_view_admin_manager"
  ON projects FOR SELECT
  USING (is_manager_or_admin());

-- Consultants can view assigned projects
CREATE POLICY "projects_view_consultant"
  ON projects FOR SELECT
  USING (
    get_user_role() = 'Consultant'
    AND is_assigned_to_project(id)
  );

-- Clients can view their projects
CREATE POLICY "projects_view_client"
  ON projects FOR SELECT
  USING (
    get_user_role() = 'Client'
    AND client_id IN (
      SELECT id FROM clients WHERE email = auth.email()
    )
  );

-- Admin/Manager can create projects
CREATE POLICY "projects_create"
  ON projects FOR INSERT
  WITH CHECK (is_manager_or_admin());

-- Admin/Manager/Consultant can update projects (Consultant only if assigned)
CREATE POLICY "projects_update"
  ON projects FOR UPDATE
  USING (
    is_manager_or_admin()
    OR (get_user_role() = 'Consultant' AND is_assigned_to_project(id))
  );

-- Only Admin can delete projects
CREATE POLICY "projects_delete"
  ON projects FOR DELETE
  USING (is_admin());

-- =====================================================
-- TASKS TABLE POLICIES
-- =====================================================

-- Staff can view tasks
CREATE POLICY "tasks_view_staff"
  ON tasks FOR SELECT
  USING (
    is_staff()
    AND (
      is_manager_or_admin()
      OR is_assigned_to_project(project_id)
    )
  );

-- Clients can view shared tasks
CREATE POLICY "tasks_view_client"
  ON tasks FOR SELECT
  USING (
    get_user_role() = 'Client'
    AND shared_with_client = true
    AND project_id IN (
      SELECT id FROM projects WHERE client_id IN (
        SELECT id FROM clients WHERE email = auth.email()
      )
    )
  );

-- Staff can create/update tasks
CREATE POLICY "tasks_create"
  ON tasks FOR INSERT
  WITH CHECK (
    is_staff()
    AND (
      is_manager_or_admin()
      OR is_assigned_to_project(project_id)
    )
  );

CREATE POLICY "tasks_update"
  ON tasks FOR UPDATE
  USING (
    is_staff()
    AND (
      is_manager_or_admin()
      OR is_assigned_to_project(project_id)
    )
  );

-- Admin/Manager can delete tasks
CREATE POLICY "tasks_delete"
  ON tasks FOR DELETE
  USING (is_manager_or_admin());

-- =====================================================
-- ACTIVITIES TABLE POLICIES
-- =====================================================

-- Staff can view activities
CREATE POLICY "activities_view_staff"
  ON activities FOR SELECT
  USING (
    is_staff()
    AND (
      is_manager_or_admin()
      OR (project_id IS NOT NULL AND is_assigned_to_project(project_id))
    )
  );

-- Clients can view shared activities
CREATE POLICY "activities_view_client"
  ON activities FOR SELECT
  USING (
    get_user_role() = 'Client'
    AND shared_with_client = true
    AND (
      client_id IN (SELECT id FROM clients WHERE email = auth.email())
      OR project_id IN (
        SELECT id FROM projects WHERE client_id IN (
          SELECT id FROM clients WHERE email = auth.email()
        )
      )
    )
  );

-- Staff can create/update activities
CREATE POLICY "activities_create"
  ON activities FOR INSERT
  WITH CHECK (is_staff());

CREATE POLICY "activities_update"
  ON activities FOR UPDATE
  USING (
    is_staff()
    AND (is_manager_or_admin() OR created_by_id = auth.uid()::text)
  );

-- Admin/Manager can delete activities
CREATE POLICY "activities_delete"
  ON activities FOR DELETE
  USING (is_manager_or_admin());

-- =====================================================
-- CASES TABLE POLICIES
-- =====================================================

-- Staff can view cases
CREATE POLICY "cases_view_staff"
  ON cases FOR SELECT
  USING (
    is_staff()
    AND (
      is_manager_or_admin()
      OR assigned_to_id IN (
        SELECT id FROM team_members WHERE email = auth.email()
      )
    )
  );

-- Clients can view their cases
CREATE POLICY "cases_view_client"
  ON cases FOR SELECT
  USING (
    get_user_role() = 'Client'
    AND client_id IN (SELECT id FROM clients WHERE email = auth.email())
  );

-- Staff can create cases
CREATE POLICY "cases_create"
  ON cases FOR INSERT
  WITH CHECK (is_staff());

-- Staff can update assigned cases
CREATE POLICY "cases_update"
  ON cases FOR UPDATE
  USING (
    is_staff()
    AND (
      is_manager_or_admin()
      OR assigned_to_id IN (
        SELECT id FROM team_members WHERE email = auth.email()
      )
    )
  );

-- Admin can delete cases
CREATE POLICY "cases_delete"
  ON cases FOR DELETE
  USING (is_admin());

-- =====================================================
-- CASE COMMENTS TABLE POLICIES
-- =====================================================

-- Users can view comments on cases they can view
CREATE POLICY "case_comments_view"
  ON case_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases WHERE id = case_comments.case_id
    )
  );

-- Users can add comments to cases they can view
CREATE POLICY "case_comments_create"
  ON case_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases WHERE id = case_comments.case_id
    )
  );

-- Users can update their own comments
CREATE POLICY "case_comments_update"
  ON case_comments FOR UPDATE
  USING (author_id = auth.uid()::text OR is_admin());

-- Admin can delete any comment
CREATE POLICY "case_comments_delete"
  ON case_comments FOR DELETE
  USING (is_admin());

-- =====================================================
-- DOCUMENTS TABLE POLICIES
-- =====================================================

-- Staff can view all documents
CREATE POLICY "documents_view_staff"
  ON documents FOR SELECT
  USING (is_staff());

-- Clients can view documents related to their data
CREATE POLICY "documents_view_client"
  ON documents FOR SELECT
  USING (
    get_user_role() = 'Client'
    AND (
      related_id IN (SELECT id FROM clients WHERE email = auth.email())
      OR related_id IN (
        SELECT id FROM projects WHERE client_id IN (
          SELECT id FROM clients WHERE email = auth.email()
        )
      )
    )
  );

-- Staff can upload documents
CREATE POLICY "documents_create"
  ON documents FOR INSERT
  WITH CHECK (is_staff());

-- Admin/Manager can update documents
CREATE POLICY "documents_update"
  ON documents FOR UPDATE
  USING (is_manager_or_admin());

-- Admin can delete documents
CREATE POLICY "documents_delete"
  ON documents FOR DELETE
  USING (is_admin());

-- =====================================================
-- VOLUNTEERS TABLE POLICIES
-- =====================================================

-- Staff can view volunteers
CREATE POLICY "volunteers_view"
  ON volunteers FOR SELECT
  USING (is_staff());

-- Admin/Manager can manage volunteers
CREATE POLICY "volunteers_create"
  ON volunteers FOR INSERT
  WITH CHECK (is_manager_or_admin());

CREATE POLICY "volunteers_update"
  ON volunteers FOR UPDATE
  USING (is_manager_or_admin());

CREATE POLICY "volunteers_delete"
  ON volunteers FOR DELETE
  USING (is_admin());

-- =====================================================
-- DONATIONS TABLE POLICIES
-- =====================================================

-- Staff can view donations
CREATE POLICY "donations_view"
  ON donations FOR SELECT
  USING (is_staff());

-- Admin/Manager can manage donations
CREATE POLICY "donations_create"
  ON donations FOR INSERT
  WITH CHECK (is_manager_or_admin());

CREATE POLICY "donations_update"
  ON donations FOR UPDATE
  USING (is_manager_or_admin());

CREATE POLICY "donations_delete"
  ON donations FOR DELETE
  USING (is_admin());

-- =====================================================
-- EVENTS TABLE POLICIES
-- =====================================================

-- Everyone can view published events
CREATE POLICY "events_view_published"
  ON events FOR SELECT
  USING (is_published = true);

-- Staff can view all events
CREATE POLICY "events_view_staff"
  ON events FOR SELECT
  USING (is_staff());

-- Admin/Manager can manage events
CREATE POLICY "events_create"
  ON events FOR INSERT
  WITH CHECK (is_manager_or_admin());

CREATE POLICY "events_update"
  ON events FOR UPDATE
  USING (is_manager_or_admin());

CREATE POLICY "events_delete"
  ON events FOR DELETE
  USING (is_admin());

-- =====================================================
-- EMAIL CAMPAIGNS TABLE POLICIES
-- =====================================================

-- Admin/Manager can view email campaigns
CREATE POLICY "email_campaigns_view"
  ON email_campaigns FOR SELECT
  USING (is_manager_or_admin());

-- Admin/Manager can create/update campaigns
CREATE POLICY "email_campaigns_create"
  ON email_campaigns FOR INSERT
  WITH CHECK (is_manager_or_admin());

CREATE POLICY "email_campaigns_update"
  ON email_campaigns FOR UPDATE
  USING (is_manager_or_admin());

-- Only Admin can delete campaigns
CREATE POLICY "email_campaigns_delete"
  ON email_campaigns FOR DELETE
  USING (is_admin());

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant authenticated users access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- TESTING RLS POLICIES
-- =====================================================
--
-- To test these policies, create test users with different roles:
--
-- 1. Create admin user:
--    UPDATE auth.users
--    SET raw_user_meta_data = '{"role": "Admin"}'
--    WHERE email = 'admin@example.com';
--
-- 2. Create manager user:
--    UPDATE auth.users
--    SET raw_user_meta_data = '{"role": "Manager"}'
--    WHERE email = 'manager@example.com';
--
-- 3. Create consultant user:
--    UPDATE auth.users
--    SET raw_user_meta_data = '{"role": "Consultant"}'
--    WHERE email = 'consultant@example.com';
--
-- 4. Create client user:
--    UPDATE auth.users
--    SET raw_user_meta_data = '{"role": "Client"}'
--    WHERE email = 'client@example.com';
--
-- Then test by logging in as each user and verifying they can only
-- access data according to their role permissions.
--
-- =====================================================
