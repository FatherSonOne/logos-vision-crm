-- ============================================
-- PHASE 2: HOUSEHOLD MANAGEMENT MIGRATION
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this entire script in order.
-- If you get an error about missing columns, you may need to drop and recreate the table.

-- 1. DROP existing view if it exists (to avoid conflicts)
DROP VIEW IF EXISTS household_totals;

-- 2. HOUSEHOLDS TABLE
-- Groups family members together
-- Note: Using DROP + CREATE to ensure correct schema
DROP TABLE IF EXISTS household_relationships CASCADE;
DROP TABLE IF EXISTS households CASCADE;

CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    primary_contact_id UUID, -- Will be set after clients are linked
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADD HOUSEHOLD FOREIGN KEY TO CLIENTS TABLE
-- Each client/contact can belong to one household
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE SET NULL;

-- 4. HOUSEHOLD RELATIONSHIPS TABLE
-- Defines how each contact relates to the household (Head, Spouse, Child, etc.)
CREATE TABLE IF NOT EXISTS household_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'Member',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(household_id, client_id)
);

-- 5. ADD FOREIGN KEY CONSTRAINT FOR PRIMARY CONTACT
-- Now that clients table has household_id, we can add the constraint
ALTER TABLE households
ADD CONSTRAINT fk_primary_contact
FOREIGN KEY (primary_contact_id) REFERENCES clients(id) ON DELETE SET NULL;

-- 6. CREATE HOUSEHOLD TOTALS VIEW
-- Aggregates data for each household (member count, total donations, last donation)
CREATE OR REPLACE VIEW household_totals AS
SELECT
    h.id AS household_id,
    h.name AS household_name,
    h.address,
    h.city,
    h.state,
    h.zip_code,
    h.phone,
    h.email,
    h.primary_contact_id,
    h.is_active,
    h.created_at,
    h.updated_at,
    COUNT(DISTINCT c.id) AS member_count,
    COALESCE(SUM(d.amount), 0) AS total_donated,
    MAX(d.donation_date) AS last_donation_date
FROM households h
LEFT JOIN clients c ON c.household_id = h.id
LEFT JOIN donations d ON d.client_id = c.id
GROUP BY h.id, h.name, h.address, h.city, h.state, h.zip_code,
         h.phone, h.email, h.primary_contact_id, h.is_active,
         h.created_at, h.updated_at;

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clients_household_id ON clients(household_id);
CREATE INDEX IF NOT EXISTS idx_household_relationships_household ON household_relationships(household_id);
CREATE INDEX IF NOT EXISTS idx_household_relationships_client ON household_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_households_name ON households(name);
CREATE INDEX IF NOT EXISTS idx_households_is_active ON households(is_active);

-- 8. ADD TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_households_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_households_updated_at ON households;
CREATE TRIGGER trigger_households_updated_at
    BEFORE UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION update_households_updated_at();

-- 9. ENABLE ROW LEVEL SECURITY (if using Supabase auth)
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed for your auth setup)
CREATE POLICY "Allow authenticated users full access to households"
ON households FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to household_relationships"
ON household_relationships FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 10. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE households IS 'Groups contacts/clients into family units for household giving tracking';
COMMENT ON TABLE household_relationships IS 'Defines the relationship type for each member within a household';
COMMENT ON VIEW household_totals IS 'Aggregated view showing household statistics including member count and total donations';
COMMENT ON COLUMN households.primary_contact_id IS 'The main contact person for communications with this household';
COMMENT ON COLUMN household_relationships.relationship_type IS 'Head of Household, Spouse, Child, Parent, Sibling, Other, Member';
COMMENT ON COLUMN household_relationships.is_primary IS 'Indicates if this contact is the primary decision maker';
