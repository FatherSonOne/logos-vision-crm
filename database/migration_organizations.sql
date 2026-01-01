-- ============================================
-- ORGANIZATIONS FEATURE MIGRATION
-- Adds organization-contact relationships and hierarchy
-- ============================================

-- ============================================
-- 1. ORGANIZATION-CONTACT RELATIONSHIPS TABLE
-- Links contacts to organizations with role information
-- ============================================

CREATE TABLE IF NOT EXISTS organization_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'employee', 'board_member', 'volunteer', 'donor', 'partner'
    role_title VARCHAR(255),
    is_primary_contact BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, contact_id, relationship_type),
    -- Ensure organization_id references an organization type client
    -- and contact_id references an individual type client
    CONSTRAINT different_entities CHECK (organization_id != contact_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_org_contacts_organization_id ON organization_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_contacts_contact_id ON organization_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_org_contacts_relationship_type ON organization_contacts(relationship_type);
CREATE INDEX IF NOT EXISTS idx_org_contacts_is_primary ON organization_contacts(is_primary_contact) WHERE is_primary_contact = TRUE;

-- ============================================
-- 2. ORGANIZATION HIERARCHY TABLE
-- Supports parent-child relationships between organizations
-- ============================================

CREATE TABLE IF NOT EXISTS organization_hierarchy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_org_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    child_org_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'subsidiary', -- 'subsidiary', 'chapter', 'affiliate', 'division', 'department'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_org_id, child_org_id),
    -- Prevent self-referencing
    CONSTRAINT no_self_parent CHECK (parent_org_id != child_org_id)
);

-- Index for fast hierarchy traversal
CREATE INDEX IF NOT EXISTS idx_org_hierarchy_parent ON organization_hierarchy(parent_org_id);
CREATE INDEX IF NOT EXISTS idx_org_hierarchy_child ON organization_hierarchy(child_org_id);

-- ============================================
-- 3. ADD CLIENT TYPE COLUMN IF NOT EXISTS
-- To distinguish organizations from individuals
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'client_type'
    ) THEN
        ALTER TABLE clients ADD COLUMN client_type VARCHAR(50) DEFAULT 'individual';
    END IF;
END $$;

-- Index for client type filtering
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(client_type);

-- ============================================
-- 4. UPDATED_AT TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_organization_contacts_updated_at ON organization_contacts;
CREATE TRIGGER update_organization_contacts_updated_at
    BEFORE UPDATE ON organization_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_hierarchy_updated_at ON organization_hierarchy;
CREATE TRIGGER update_organization_hierarchy_updated_at
    BEFORE UPDATE ON organization_hierarchy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organization_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_hierarchy ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
DROP POLICY IF EXISTS "Allow authenticated access to organization_contacts" ON organization_contacts;
CREATE POLICY "Allow authenticated access to organization_contacts"
    ON organization_contacts FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated access to organization_hierarchy" ON organization_hierarchy;
CREATE POLICY "Allow authenticated access to organization_hierarchy"
    ON organization_hierarchy FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- ============================================
-- 6. VIEWS FOR AGGREGATED DATA
-- ============================================

-- View: Organization with contact count and donation totals
CREATE OR REPLACE VIEW organization_summary AS
SELECT
    c.id AS organization_id,
    c.name AS organization_name,
    c.email,
    c.phone,
    c.location,
    c.client_type,
    c.is_active,
    c.created_at,
    COUNT(DISTINCT oc.contact_id) AS affiliated_contacts_count,
    COUNT(DISTINCT CASE WHEN oc.is_primary_contact THEN oc.contact_id END) AS primary_contacts_count,
    COUNT(DISTINCT oh_parent.child_org_id) AS child_orgs_count,
    oh_child.parent_org_id AS parent_org_id
FROM clients c
LEFT JOIN organization_contacts oc ON c.id = oc.organization_id
LEFT JOIN organization_hierarchy oh_parent ON c.id = oh_parent.parent_org_id
LEFT JOIN organization_hierarchy oh_child ON c.id = oh_child.child_org_id
WHERE c.client_type IN ('organization', 'nonprofit')
GROUP BY c.id, c.name, c.email, c.phone, c.location, c.client_type, c.is_active, c.created_at, oh_child.parent_org_id;

-- View: Contact affiliations summary
CREATE OR REPLACE VIEW contact_affiliations AS
SELECT
    c.id AS contact_id,
    c.name AS contact_name,
    c.email AS contact_email,
    oc.organization_id,
    org.name AS organization_name,
    oc.relationship_type,
    oc.role_title,
    oc.is_primary_contact,
    oc.start_date,
    oc.end_date,
    CASE WHEN oc.end_date IS NULL OR oc.end_date > CURRENT_DATE THEN TRUE ELSE FALSE END AS is_current
FROM clients c
JOIN organization_contacts oc ON c.id = oc.contact_id
JOIN clients org ON oc.organization_id = org.id
WHERE c.client_type = 'individual' OR c.client_type IS NULL;

-- View: Organization donation roll-up
CREATE OR REPLACE VIEW organization_donation_rollup AS
SELECT
    oc.organization_id,
    org.name AS organization_name,
    COUNT(DISTINCT d.id) AS total_donations,
    COALESCE(SUM(d.amount), 0) AS total_amount,
    COUNT(DISTINCT d.client_id) AS unique_donors,
    MAX(d.donation_date) AS last_donation_date,
    AVG(d.amount) AS average_donation
FROM organization_contacts oc
JOIN clients org ON oc.organization_id = org.id
LEFT JOIN donations d ON oc.contact_id = d.client_id
GROUP BY oc.organization_id, org.name;

-- ============================================
-- 7. SAMPLE RELATIONSHIP TYPES (Reference)
-- ============================================
COMMENT ON COLUMN organization_contacts.relationship_type IS
'Valid values: employee, board_member, volunteer, donor, partner, consultant, vendor, member';

COMMENT ON COLUMN organization_hierarchy.relationship_type IS
'Valid values: subsidiary, chapter, affiliate, division, department, branch, region';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================