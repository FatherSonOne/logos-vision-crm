-- ============================================
-- CONTACTS & ORGANIZATIONS DATABASE MIGRATION
-- Separate CRM contacts/organizations from Case Management clients/households
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CONTACTS TABLE (CRM - donor/volunteer management)
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    type VARCHAR(50) DEFAULT 'individual' CHECK (type IN ('individual', 'organization_contact')),
    engagement_score VARCHAR(20) DEFAULT 'low' CHECK (engagement_score IN ('low', 'medium', 'high')),
    donor_stage VARCHAR(50) DEFAULT 'Prospect',
    total_lifetime_giving DECIMAL(12, 2) DEFAULT 0,
    last_gift_date DATE,
    notes TEXT,
    preferred_contact_method VARCHAR(20) CHECK (preferred_contact_method IN ('email', 'phone', 'text', 'mail')),
    do_not_email BOOLEAN DEFAULT false,
    do_not_call BOOLEAN DEFAULT false,
    do_not_mail BOOLEAN DEFAULT false,
    do_not_text BOOLEAN DEFAULT false,
    email_opt_in BOOLEAN DEFAULT true,
    newsletter_subscriber BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_engagement ON contacts(engagement_score);
CREATE INDEX IF NOT EXISTS idx_contacts_donor_stage ON contacts(donor_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);

-- ============================================
-- ORGANIZATIONS TABLE (separate from contacts)
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    org_type VARCHAR(50) DEFAULT 'nonprofit' CHECK (org_type IN ('nonprofit', 'foundation', 'corporation', 'government', 'other')),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    ein VARCHAR(20),
    mission_statement TEXT,
    primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    parent_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    total_donations DECIMAL(12, 2) DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_parent ON organizations(parent_org_id);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);

-- ============================================
-- ORGANIZATION_CONTACTS junction (many-to-many)
-- ============================================
DROP TABLE IF EXISTS organization_contacts CASCADE;
CREATE TABLE organization_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'employee' CHECK (relationship_type IN ('employee', 'board_member', 'volunteer', 'donor', 'partner', 'consultant', 'other')),
    role_title VARCHAR(100),
    department VARCHAR(100),
    is_primary_contact BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, contact_id, relationship_type)
);

-- Indexes for organization_contacts
CREATE INDEX IF NOT EXISTS idx_org_contacts_org ON organization_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_contacts_contact ON organization_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_org_contacts_primary ON organization_contacts(is_primary_contact);
CREATE INDEX IF NOT EXISTS idx_org_contacts_type ON organization_contacts(relationship_type);

-- ============================================
-- ORGANIZATION_HIERARCHY (parent-child orgs)
-- ============================================
DROP TABLE IF EXISTS organization_hierarchy CASCADE;
CREATE TABLE organization_hierarchy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    child_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'subsidiary' CHECK (relationship_type IN ('subsidiary', 'chapter', 'affiliate', 'partner', 'member')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_org_id, child_org_id),
    CHECK (parent_org_id != child_org_id)
);

-- Indexes for organization_hierarchy
CREATE INDEX IF NOT EXISTS idx_org_hierarchy_parent ON organization_hierarchy(parent_org_id);
CREATE INDEX IF NOT EXISTS idx_org_hierarchy_child ON organization_hierarchy(child_org_id);

-- ============================================
-- CONTACT DONATIONS (link donations to contacts)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    donation_date DATE NOT NULL,
    campaign VARCHAR(255),
    payment_method VARCHAR(50),
    is_recurring BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contact_donations
CREATE INDEX IF NOT EXISTS idx_contact_donations_contact ON contact_donations(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_donations_date ON contact_donations(donation_date);

-- ============================================
-- VIEWS
-- ============================================

-- Contact affiliations view (organizations a contact belongs to)
CREATE OR REPLACE VIEW contact_affiliations AS
SELECT
    oc.contact_id,
    c.name as contact_name,
    c.email as contact_email,
    oc.organization_id,
    o.name as organization_name,
    oc.relationship_type,
    oc.role_title,
    oc.department,
    oc.is_primary_contact,
    oc.start_date,
    oc.end_date,
    CASE WHEN oc.end_date IS NULL OR oc.end_date > CURRENT_DATE THEN true ELSE false END as is_current
FROM organization_contacts oc
JOIN contacts c ON c.id = oc.contact_id
JOIN organizations o ON o.id = oc.organization_id
WHERE c.is_active = true;

-- Organization summary view
CREATE OR REPLACE VIEW organization_summary AS
SELECT
    o.id as organization_id,
    o.name as organization_name,
    o.org_type,
    o.email,
    o.phone,
    o.website,
    o.city,
    o.state,
    o.ein,
    o.is_active,
    o.created_at,
    o.total_donations,
    (SELECT COUNT(*) FROM organization_contacts oc WHERE oc.organization_id = o.id AND (oc.end_date IS NULL OR oc.end_date > CURRENT_DATE)) as affiliated_contacts_count,
    (SELECT COUNT(*) FROM organization_contacts oc WHERE oc.organization_id = o.id AND oc.is_primary_contact = true) as primary_contacts_count,
    (SELECT COUNT(*) FROM organization_hierarchy oh WHERE oh.parent_org_id = o.id) as child_orgs_count,
    o.parent_org_id
FROM organizations o
WHERE o.is_active = true;

-- Organization donation rollup view
CREATE OR REPLACE VIEW organization_donation_rollup AS
SELECT
    o.id as organization_id,
    o.name as organization_name,
    COALESCE(SUM(cd.amount), 0) as total_amount,
    COUNT(DISTINCT cd.id) as total_donations,
    COUNT(DISTINCT cd.contact_id) as unique_donors,
    MAX(cd.donation_date) as last_donation_date,
    CASE WHEN COUNT(cd.id) > 0 THEN SUM(cd.amount) / COUNT(cd.id) ELSE 0 END as average_donation
FROM organizations o
LEFT JOIN organization_contacts oc ON oc.organization_id = o.id
LEFT JOIN contact_donations cd ON cd.contact_id = oc.contact_id
WHERE o.is_active = true
GROUP BY o.id, o.name;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update contacts updated_at timestamp
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_contacts_updated_at();

-- Update organizations updated_at timestamp
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update organization_contacts updated_at timestamp
DROP TRIGGER IF EXISTS update_org_contacts_updated_at ON organization_contacts;
CREATE TRIGGER update_org_contacts_updated_at
    BEFORE UPDATE ON organization_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update organization contact count when contacts are added/removed
CREATE OR REPLACE FUNCTION update_organization_contact_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE organizations SET contact_count = contact_count + 1 WHERE id = NEW.organization_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE organizations SET contact_count = contact_count - 1 WHERE id = OLD.organization_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_org_contact_count ON organization_contacts;
CREATE TRIGGER update_org_contact_count
    AFTER INSERT OR DELETE ON organization_contacts
    FOR EACH ROW EXECUTE FUNCTION update_organization_contact_count();

-- Update contact lifetime giving when donations added
CREATE OR REPLACE FUNCTION update_contact_lifetime_giving()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE contacts
        SET total_lifetime_giving = total_lifetime_giving + NEW.amount,
            last_gift_date = GREATEST(last_gift_date, NEW.donation_date)
        WHERE id = NEW.contact_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE contacts
        SET total_lifetime_giving = total_lifetime_giving - OLD.amount
        WHERE id = OLD.contact_id;
        -- Recalculate last_gift_date
        UPDATE contacts
        SET last_gift_date = (SELECT MAX(donation_date) FROM contact_donations WHERE contact_id = OLD.contact_id)
        WHERE id = OLD.contact_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_giving ON contact_donations;
CREATE TRIGGER update_contact_giving
    AFTER INSERT OR DELETE ON contact_donations
    FOR EACH ROW EXECUTE FUNCTION update_contact_lifetime_giving();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_donations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
DROP POLICY IF EXISTS "Allow authenticated access to contacts" ON contacts;
CREATE POLICY "Allow authenticated access to contacts" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated access to organizations" ON organizations;
CREATE POLICY "Allow authenticated access to organizations" ON organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated access to organization_contacts" ON organization_contacts;
CREATE POLICY "Allow authenticated access to organization_contacts" ON organization_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated access to organization_hierarchy" ON organization_hierarchy;
CREATE POLICY "Allow authenticated access to organization_hierarchy" ON organization_hierarchy FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated access to contact_donations" ON contact_donations;
CREATE POLICY "Allow authenticated access to contact_donations" ON contact_donations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anonymous users access (for development/demo without auth)
DROP POLICY IF EXISTS "Allow anon access to contacts" ON contacts;
CREATE POLICY "Allow anon access to contacts" ON contacts FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon access to organizations" ON organizations;
CREATE POLICY "Allow anon access to organizations" ON organizations FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon access to organization_contacts" ON organization_contacts;
CREATE POLICY "Allow anon access to organization_contacts" ON organization_contacts FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon access to organization_hierarchy" ON organization_hierarchy;
CREATE POLICY "Allow anon access to organization_hierarchy" ON organization_hierarchy FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon access to contact_donations" ON contact_donations;
CREATE POLICY "Allow anon access to contact_donations" ON contact_donations FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (Optional - for development)
-- ============================================

-- Sample contacts
INSERT INTO contacts (id, first_name, last_name, name, email, phone, city, state, type, engagement_score, donor_stage, total_lifetime_giving) VALUES
('c1000000-0000-0000-0000-000000000001', 'John', 'Smith', 'John Smith', 'john.smith@email.com', '(843) 555-0101', 'Charleston', 'SC', 'individual', 'high', 'Major Donor', 15000.00),
('c1000000-0000-0000-0000-000000000002', 'Sarah', 'Johnson', 'Sarah Johnson', 'sarah.johnson@email.com', '(843) 555-0102', 'Columbia', 'SC', 'individual', 'medium', 'Repeat Donor', 2500.00),
('c1000000-0000-0000-0000-000000000003', 'Michael', 'Williams', 'Michael Williams', 'michael.w@email.com', '(843) 555-0103', 'Greenville', 'SC', 'individual', 'high', 'First-time Donor', 500.00),
('c1000000-0000-0000-0000-000000000004', 'Emily', 'Davis', 'Emily Davis', 'emily.davis@email.com', '(843) 555-0104', 'Charleston', 'SC', 'individual', 'low', 'Prospect', 0.00),
('c1000000-0000-0000-0000-000000000005', 'Robert', 'Brown', 'Robert Brown', 'robert.brown@corp.com', '(843) 555-0105', 'Spartanburg', 'SC', 'organization_contact', 'medium', 'Repeat Donor', 5000.00)
ON CONFLICT DO NOTHING;

-- Sample organizations
INSERT INTO organizations (id, name, org_type, email, phone, city, state, ein, total_donations) VALUES
('a1000000-0000-0000-0000-000000000001', 'Hope Harbor Foundation', 'nonprofit', 'info@hopeharbor.org', '(843) 555-1001', 'Charleston', 'SC', '12-3456789', 50000.00),
('a1000000-0000-0000-0000-000000000002', 'Lowcountry Food Bank', 'nonprofit', 'contact@lcfoodbank.org', '(843) 555-1002', 'Charleston', 'SC', '23-4567890', 125000.00),
('a1000000-0000-0000-0000-000000000003', 'Coastal Conservation League', 'nonprofit', 'info@coastalconservation.org', '(843) 555-1003', 'Charleston', 'SC', '34-5678901', 75000.00),
('a1000000-0000-0000-0000-000000000004', 'United Way of the Midlands', 'nonprofit', 'info@uwmidlands.org', '(803) 555-1004', 'Columbia', 'SC', '45-6789012', 200000.00),
('a1000000-0000-0000-0000-000000000005', 'SC Youth Advocate Program', 'nonprofit', 'contact@scyap.org', '(803) 555-1005', 'Columbia', 'SC', '56-7890123', 35000.00)
ON CONFLICT DO NOTHING;

-- Sample organization-contact relationships
INSERT INTO organization_contacts (organization_id, contact_id, relationship_type, role_title, is_primary_contact) VALUES
('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'board_member', 'Board Chair', true),
('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'donor', NULL, false),
('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'volunteer', 'Volunteer Coordinator', false),
('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'donor', NULL, false),
('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005', 'employee', 'Executive Director', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
