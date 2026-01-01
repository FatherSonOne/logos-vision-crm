-- ============================================
-- MIGRATION: Add Missing Columns
-- ============================================
-- This migration adds columns that may be missing from your tables
-- Run this BEFORE running sample_data_all_sections.sql
-- ============================================

-- Add bio column to team_members if missing
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add missing columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Add type column to clients for organization/individual distinction
ALTER TABLE clients ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'individual';

-- Add household_id to clients for family groupings
ALTER TABLE clients ADD COLUMN IF NOT EXISTS household_id UUID;

-- Add donor tracking columns to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_lifetime_giving DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_gift_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS donor_stage VARCHAR(50) DEFAULT 'Prospect';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS engagement_score VARCHAR(20) DEFAULT 'low';

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing columns to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Scheduled';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS shared_with_client BOOLEAN DEFAULT false;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS created_by_id UUID;

-- Add missing columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS phase VARCHAR(100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS shared_with_client BOOLEAN DEFAULT false;

-- Create project_team_members junction table if not exists
CREATE TABLE IF NOT EXISTS project_team_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    role VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, team_member_id)
);

-- Drop and recreate cases table to ensure correct structure
DROP TABLE IF EXISTS case_comments CASCADE;
DROP TABLE IF EXISTS cases CASCADE;

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id UUID REFERENCES clients(id),
    status VARCHAR(50) DEFAULT 'Open',
    priority VARCHAR(50) DEFAULT 'Medium',
    category VARCHAR(100),
    assigned_to_id UUID REFERENCES team_members(id),
    created_by_id UUID REFERENCES team_members(id),
    opened_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_comments table
CREATE TABLE case_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    author_id UUID REFERENCES team_members(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate households table to ensure correct structure
DROP TABLE IF EXISTS households CASCADE;

CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    primary_contact_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for household_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'clients_household_id_fkey'
    ) THEN
        ALTER TABLE clients
        ADD CONSTRAINT clients_household_id_fkey
        FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index on household_id
CREATE INDEX IF NOT EXISTS idx_clients_household_id ON clients(household_id);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_donor_stage ON clients(donor_stage);

-- Enable RLS on households
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access to households
DROP POLICY IF EXISTS "Allow authenticated access to households" ON households;
CREATE POLICY "Allow authenticated access to households" ON households FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create trigger for households updated_at
DROP TRIGGER IF EXISTS update_households_updated_at ON households;
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access to cases" ON cases;
CREATE POLICY "Allow authenticated access to cases" ON cases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS on case_comments
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access to case_comments" ON case_comments;
CREATE POLICY "Allow authenticated access to case_comments" ON case_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS on project_team_members
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access to project_team_members" ON project_team_members;
CREATE POLICY "Allow authenticated access to project_team_members" ON project_team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to_id ON cases(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_case_comments_case_id ON case_comments(case_id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- After running this migration, you can run sample_data_all_sections.sql
-- ============================================
