-- ============================================
-- LOGOS VISION CRM - COMPLETE DATABASE SCHEMA
-- ============================================
-- This schema supports all features of your CRM
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension for automatic ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CLIENTS/ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    location TEXT,
    address TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    organization_type VARCHAR(100), -- nonprofit, for-profit, etc.
    tax_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. TEAM MEMBERS (CONSULTANTS) TABLE
-- ============================================
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100), -- Admin, Consultant, Project Manager, etc.
    phone VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[], -- Array of skills
    hourly_rate DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Planning', -- Planning, In Progress, Completed, On Hold
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    actual_cost DECIMAL(12, 2),
    progress INTEGER DEFAULT 0, -- 0-100 percentage
    priority VARCHAR(50), -- Low, Medium, High, Critical
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PROJECT TEAM ASSIGNMENTS
-- ============================================
CREATE TABLE project_team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    role VARCHAR(100), -- Lead, Member, Advisor, etc.
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, team_member_id)
);

-- ============================================
-- 5. TASKS TABLE
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'To Do', -- To Do, In Progress, Done
    priority VARCHAR(50), -- Low, Medium, High
    phase VARCHAR(100), -- For AI project scaffolding
    shared_with_client BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ACTIVITIES/EVENTS TABLE
-- ============================================
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- Meeting, Call, Email, Note, Task, Event
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    location TEXT,
    duration INTEGER, -- in minutes
    shared_with_client BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. CASES TABLE (Support/Issues)
-- ============================================
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Open', -- Open, In Progress, Resolved, Closed
    priority VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High, Critical
    category VARCHAR(100), -- Technical, Legal, Financial, etc.
    due_date DATE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 8. CASE COMMENTS
-- ============================================
CREATE TABLE case_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    author_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal notes vs client-visible
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. DOCUMENTS TABLE
-- ============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), -- PDF, DOCX, XLSX, etc.
    file_size INTEGER, -- in bytes
    category VARCHAR(100), -- Contract, Report, Invoice, Client, Project, etc.
    related_type VARCHAR(50), -- client, project, case, etc.
    related_id UUID, -- ID of related entity
    uploaded_by_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    description TEXT,
    tags TEXT[],
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. DONATIONS TABLE
-- ============================================
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    donation_date DATE NOT NULL,
    payment_method VARCHAR(50), -- Credit Card, Check, Wire Transfer, etc.
    campaign VARCHAR(255),
    designation VARCHAR(255), -- What the donation is for
    is_recurring BOOLEAN DEFAULT false,
    receipt_sent BOOLEAN DEFAULT false,
    thank_you_sent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. VOLUNTEERS TABLE
-- ============================================
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    skills TEXT[],
    availability TEXT, -- e.g., "Weekends", "Evenings"
    hours_contributed DECIMAL(8, 2) DEFAULT 0,
    start_date DATE,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Pending
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 12. VOLUNTEER PROJECT ASSIGNMENTS
-- ============================================
CREATE TABLE volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    role VARCHAR(100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(volunteer_id, project_id)
);

-- ============================================
-- 13. WEBPAGES TABLE (Gold Pages)
-- ============================================
CREATE TABLE webpages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT, -- HTML content
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Published, Archived
    template VARCHAR(100),
    meta_description TEXT,
    meta_keywords TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 14. EVENTS TABLE (Calendar Events)
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    event_type VARCHAR(100), -- Fundraiser, Workshop, Conference, etc.
    max_attendees INTEGER,
    registration_required BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'Planned', -- Planned, Active, Completed, Cancelled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 15. EVENT VOLUNTEERS
-- ============================================
CREATE TABLE event_volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    role VARCHAR(100),
    confirmed BOOLEAN DEFAULT false,
    UNIQUE(event_id, volunteer_id)
);

-- ============================================
-- 16. EMAIL CAMPAIGNS TABLE
-- ============================================
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Scheduled, Sent
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_by_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 17. CHAT ROOMS TABLE
-- ============================================
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 18. CHAT ROOM MEMBERS
-- ============================================
CREATE TABLE chat_room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, team_member_id)
);

-- ============================================
-- 19. CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 20. CLIENT PORTAL LAYOUTS
-- ============================================
CREATE TABLE portal_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    layout_config JSONB NOT NULL, -- Store layout configuration as JSON
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Clients
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(name);

-- Team Members
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_role ON team_members(role);

-- Projects
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_team_member_id ON tasks(team_member_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Activities
CREATE INDEX idx_activities_client_id ON activities(client_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_date ON activities(activity_date);
CREATE INDEX idx_activities_type ON activities(type);

-- Cases
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_assigned_to_id ON cases(assigned_to_id);
CREATE INDEX idx_cases_status ON cases(status);

-- Documents
CREATE INDEX idx_documents_related_type_id ON documents(related_type, related_id);
CREATE INDEX idx_documents_category ON documents(category);

-- Donations
CREATE INDEX idx_donations_client_id ON donations(client_id);
CREATE INDEX idx_donations_date ON donations(donation_date);

-- Volunteers
CREATE INDEX idx_volunteers_client_id ON volunteers(client_id);
CREATE INDEX idx_volunteers_status ON volunteers(status);

-- Events
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_date ON events(event_date);

-- Chat Messages
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
-- This ensures users can only access data they're allowed to see

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE webpages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BASIC RLS POLICIES (AUTHENTICATED USERS CAN ACCESS ALL)
-- ============================================
-- Note: You'll want to customize these based on your security needs

-- Allow authenticated users to read all data (for now - will refine later)
CREATE POLICY "Allow authenticated read access" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON volunteers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON webpages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON email_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON chat_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON chat_messages FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete (for now - will refine later)
CREATE POLICY "Allow authenticated write access" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON activities FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON cases FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON donations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON volunteers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON webpages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON events FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON email_campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON chat_messages FOR ALL TO authenticated USING (true);

-- ============================================
-- COMPLETED!
-- ============================================
-- Your database schema is now ready for Logos Vision CRM
