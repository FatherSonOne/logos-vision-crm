-- =====================================================
-- LOGOS VISION CRM - Database-Level Validation
-- =====================================================
--
-- This file adds CHECK constraints, triggers, and validation
-- functions to enforce data integrity at the database level.
--
-- Run this file after your schema and RLS policies are in place.
--
-- =====================================================

-- =====================================================
-- PART 1: VALIDATION HELPER FUNCTIONS
-- =====================================================

-- Validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate phone number (basic validation for common formats)
CREATE OR REPLACE FUNCTION is_valid_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove all non-digit characters
  RETURN length(regexp_replace(phone, '\D', '', 'g')) >= 10;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate URL format
CREATE OR REPLACE FUNCTION is_valid_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN url ~* '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate date range (start date before end date)
CREATE OR REPLACE FUNCTION is_valid_date_range(start_date DATE, end_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN end_date IS NULL OR end_date >= start_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- PART 2: CHECK CONSTRAINTS ON TABLES
-- =====================================================

-- CLIENTS TABLE
-- -------------
ALTER TABLE clients
  DROP CONSTRAINT IF EXISTS clients_email_valid,
  DROP CONSTRAINT IF EXISTS clients_phone_valid,
  DROP CONSTRAINT IF EXISTS clients_name_not_empty,
  DROP CONSTRAINT IF EXISTS clients_website_valid;

ALTER TABLE clients
  ADD CONSTRAINT clients_email_valid
    CHECK (is_valid_email(email)),
  ADD CONSTRAINT clients_phone_valid
    CHECK (phone IS NULL OR is_valid_phone(phone)),
  ADD CONSTRAINT clients_name_not_empty
    CHECK (length(trim(name)) >= 2),
  ADD CONSTRAINT clients_website_valid
    CHECK (website IS NULL OR website = '' OR is_valid_url(website));

-- TEAM MEMBERS TABLE
-- ------------------
ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_email_valid,
  DROP CONSTRAINT IF EXISTS team_members_phone_valid,
  DROP CONSTRAINT IF EXISTS team_members_name_not_empty,
  DROP CONSTRAINT IF EXISTS team_members_role_not_empty;

ALTER TABLE team_members
  ADD CONSTRAINT team_members_email_valid
    CHECK (is_valid_email(email)),
  ADD CONSTRAINT team_members_phone_valid
    CHECK (phone IS NULL OR is_valid_phone(phone)),
  ADD CONSTRAINT team_members_name_not_empty
    CHECK (length(trim(name)) >= 2),
  ADD CONSTRAINT team_members_role_not_empty
    CHECK (length(trim(role)) >= 2);

-- PROJECTS TABLE
-- --------------
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_name_not_empty,
  DROP CONSTRAINT IF EXISTS projects_date_range_valid,
  DROP CONSTRAINT IF EXISTS projects_budget_positive;

ALTER TABLE projects
  ADD CONSTRAINT projects_name_not_empty
    CHECK (length(trim(name)) >= 3),
  ADD CONSTRAINT projects_date_range_valid
    CHECK (is_valid_date_range(start_date, end_date)),
  ADD CONSTRAINT projects_budget_positive
    CHECK (budget IS NULL OR budget > 0);

-- TASKS TABLE
-- -----------
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_description_not_empty;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_description_not_empty
    CHECK (length(trim(description)) >= 3);

-- ACTIVITIES TABLE
-- ----------------
ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS activities_title_not_empty,
  DROP CONSTRAINT IF EXISTS activities_time_format,
  DROP CONSTRAINT IF EXISTS activities_duration_positive;

ALTER TABLE activities
  ADD CONSTRAINT activities_title_not_empty
    CHECK (length(trim(title)) >= 3),
  ADD CONSTRAINT activities_time_format
    CHECK (activity_time IS NULL OR activity_time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
  ADD CONSTRAINT activities_duration_positive
    CHECK (duration IS NULL OR duration > 0);

-- CASES TABLE
-- -----------
ALTER TABLE cases
  DROP CONSTRAINT IF EXISTS cases_title_not_empty,
  DROP CONSTRAINT IF EXISTS cases_description_not_empty;

ALTER TABLE cases
  ADD CONSTRAINT cases_title_not_empty
    CHECK (length(trim(title)) >= 3),
  ADD CONSTRAINT cases_description_not_empty
    CHECK (length(trim(description)) >= 10);

-- VOLUNTEERS TABLE
-- ----------------
ALTER TABLE volunteers
  DROP CONSTRAINT IF EXISTS volunteers_name_not_empty,
  DROP CONSTRAINT IF EXISTS volunteers_email_valid,
  DROP CONSTRAINT IF EXISTS volunteers_phone_valid,
  DROP CONSTRAINT IF EXISTS volunteers_location_not_empty,
  DROP CONSTRAINT IF EXISTS volunteers_availability_not_empty;

ALTER TABLE volunteers
  ADD CONSTRAINT volunteers_name_not_empty
    CHECK (length(trim(name)) >= 2),
  ADD CONSTRAINT volunteers_email_valid
    CHECK (is_valid_email(email)),
  ADD CONSTRAINT volunteers_phone_valid
    CHECK (is_valid_phone(phone)),
  ADD CONSTRAINT volunteers_location_not_empty
    CHECK (length(trim(location)) >= 2),
  ADD CONSTRAINT volunteers_availability_not_empty
    CHECK (length(trim(availability)) >= 2);

-- DONATIONS TABLE
-- ---------------
ALTER TABLE donations
  DROP CONSTRAINT IF EXISTS donations_donor_name_not_empty,
  DROP CONSTRAINT IF EXISTS donations_amount_positive,
  DROP CONSTRAINT IF EXISTS donations_campaign_not_empty;

ALTER TABLE donations
  ADD CONSTRAINT donations_donor_name_not_empty
    CHECK (length(trim(donor_name)) >= 2),
  ADD CONSTRAINT donations_amount_positive
    CHECK (amount > 0),
  ADD CONSTRAINT donations_campaign_not_empty
    CHECK (length(trim(campaign)) >= 2);

-- EVENTS TABLE
-- ------------
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_title_not_empty,
  DROP CONSTRAINT IF EXISTS events_location_not_empty,
  DROP CONSTRAINT IF EXISTS events_description_not_empty,
  DROP CONSTRAINT IF EXISTS events_banner_url_valid;

ALTER TABLE events
  ADD CONSTRAINT events_title_not_empty
    CHECK (length(trim(title)) >= 3),
  ADD CONSTRAINT events_location_not_empty
    CHECK (length(trim(location)) >= 2),
  ADD CONSTRAINT events_description_not_empty
    CHECK (length(trim(description)) >= 10),
  ADD CONSTRAINT events_banner_url_valid
    CHECK (banner_image_url IS NULL OR banner_image_url = '' OR is_valid_url(banner_image_url));

-- EMAIL CAMPAIGNS TABLE
-- ---------------------
ALTER TABLE email_campaigns
  DROP CONSTRAINT IF EXISTS email_campaigns_name_not_empty,
  DROP CONSTRAINT IF EXISTS email_campaigns_subject_not_empty,
  DROP CONSTRAINT IF EXISTS email_campaigns_body_not_empty,
  DROP CONSTRAINT IF EXISTS email_campaigns_segment_not_empty;

ALTER TABLE email_campaigns
  ADD CONSTRAINT email_campaigns_name_not_empty
    CHECK (length(trim(name)) >= 3),
  ADD CONSTRAINT email_campaigns_subject_not_empty
    CHECK (length(trim(subject_line)) >= 5),
  ADD CONSTRAINT email_campaigns_body_not_empty
    CHECK (length(trim(body)) >= 20),
  ADD CONSTRAINT email_campaigns_segment_not_empty
    CHECK (length(trim(recipient_segment)) >= 2);

-- DOCUMENTS TABLE
-- ---------------
ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_name_not_empty;

ALTER TABLE documents
  ADD CONSTRAINT documents_name_not_empty
    CHECK (length(trim(name)) >= 2);

-- =====================================================
-- PART 3: AUTO-UPDATE TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_updated_at timestamp
CREATE OR REPLACE FUNCTION update_last_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_volunteers_updated_at ON volunteers;
CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply last_updated_at trigger to cases
DROP TRIGGER IF EXISTS update_cases_last_updated_at ON cases;
CREATE TRIGGER update_cases_last_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_at_column();

-- =====================================================
-- PART 4: BUSINESS LOGIC TRIGGERS
-- =====================================================

-- Prevent deleting clients with active projects
CREATE OR REPLACE FUNCTION prevent_client_delete_with_projects()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM projects
    WHERE client_id = OLD.id
    AND archived = false
  ) THEN
    RAISE EXCEPTION 'Cannot delete client with active projects. Archive or delete projects first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_client_delete_with_projects_trigger ON clients;
CREATE TRIGGER prevent_client_delete_with_projects_trigger
  BEFORE DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION prevent_client_delete_with_projects();

-- Prevent deleting projects with incomplete tasks
CREATE OR REPLACE FUNCTION prevent_project_delete_with_incomplete_tasks()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tasks
    WHERE project_id = OLD.id
    AND status != 'Done'
  ) THEN
    RAISE EXCEPTION 'Cannot delete project with incomplete tasks. Complete or delete tasks first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_project_delete_with_incomplete_tasks_trigger ON projects;
CREATE TRIGGER prevent_project_delete_with_incomplete_tasks_trigger
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION prevent_project_delete_with_incomplete_tasks();

-- Validate task due date is not in the past for new tasks
CREATE OR REPLACE FUNCTION validate_task_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Task due date cannot be in the past';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_task_due_date_trigger ON tasks;
CREATE TRIGGER validate_task_due_date_trigger
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_due_date();

-- Auto-close cases when all tasks are done
CREATE OR REPLACE FUNCTION auto_update_case_status()
RETURNS TRIGGER AS $$
DECLARE
  v_case_id UUID;
  v_all_done BOOLEAN;
BEGIN
  -- Only proceed if a task status changed
  IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get related case ID (if this task is related to a case)
  -- Note: This assumes tasks can be linked to cases via project
  -- Adjust based on your actual schema

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 5: AUDIT LOG TRIGGERS (Optional but Recommended)
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
CREATE POLICY "audit_log_select_admin" ON audit_log
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin'
  );

-- Create audit log function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id,
    user_email,
    user_role
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    auth.email(),
    (auth.jwt() -> 'user_metadata' ->> 'role')
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables (optional - can be selective)
-- Uncomment the ones you want to audit:

-- DROP TRIGGER IF EXISTS audit_clients ON clients;
-- CREATE TRIGGER audit_clients
--   AFTER INSERT OR UPDATE OR DELETE ON clients
--   FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- DROP TRIGGER IF EXISTS audit_projects ON projects;
-- CREATE TRIGGER audit_projects
--   AFTER INSERT OR UPDATE OR DELETE ON projects
--   FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- DROP TRIGGER IF EXISTS audit_cases ON cases;
-- CREATE TRIGGER audit_cases
--   AFTER INSERT OR UPDATE OR DELETE ON cases
--   FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- DROP TRIGGER IF EXISTS audit_donations ON donations;
-- CREATE TRIGGER audit_donations
--   AFTER INSERT OR UPDATE OR DELETE ON donations
--   FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- PART 6: PERFORMANCE INDEXES
-- =====================================================

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_user_role ON team_members(user_role);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_team_member_id ON project_team_members(team_member_id);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_member_id ON tasks(team_member_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_shared_with_client ON tasks(shared_with_client) WHERE shared_with_client = true;

CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_by_id ON activities(created_by_id);
CREATE INDEX IF NOT EXISTS idx_activities_activity_date ON activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_shared_with_client ON activities(shared_with_client) WHERE shared_with_client = true;

CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to_id ON cases(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_case_comments_case_id ON case_comments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_comments_author_id ON case_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_case_comments_created_at ON case_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_related_id ON documents(related_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_donations_client_id ON donations(client_id);
CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON donations(donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify constraints are created
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid::regclass::text IN (
  'clients', 'team_members', 'projects', 'tasks', 'activities',
  'cases', 'volunteers', 'donations', 'events', 'email_campaigns', 'documents'
)
AND contype = 'c' -- CHECK constraints
ORDER BY table_name, constraint_name;

-- Verify triggers are created
SELECT
  trigger_name,
  event_object_table AS table_name,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Verify indexes are created
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'clients', 'team_members', 'projects', 'tasks', 'activities',
  'cases', 'case_comments', 'documents', 'events', 'donations'
)
ORDER BY tablename, indexname;

-- =====================================================
-- TESTING VALIDATION
-- =====================================================
--
-- Test constraint violations:
--
-- 1. Try inserting invalid email:
--    INSERT INTO clients (name, email, phone, location)
--    VALUES ('Test', 'invalid-email', '1234567890', 'Test Location');
--    -- Should fail with email validation error
--
-- 2. Try inserting short name:
--    INSERT INTO clients (name, email, phone, location)
--    VALUES ('A', 'test@example.com', '1234567890', 'Test');
--    -- Should fail with name length error
--
-- 3. Try invalid date range:
--    INSERT INTO projects (name, description, client_id, start_date, end_date, status)
--    VALUES ('Test', 'Test', '...', '2024-12-01', '2024-11-01', 'Planning');
--    -- Should fail with date range error
--
-- 4. Try deleting client with projects:
--    -- First create a client and project
--    -- Then try to delete the client
--    -- Should fail with constraint error
--
-- =====================================================
