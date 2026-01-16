-- RLS Policy Fix for Contacts & Organizations
-- Run this in Supabase SQL Editor to enable anonymous access

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

-- Verify sample data exists (re-insert if needed)
INSERT INTO contacts (id, first_name, last_name, name, email, phone, city, state, type, engagement_score, donor_stage, total_lifetime_giving) VALUES
('c1000000-0000-0000-0000-000000000001', 'John', 'Smith', 'John Smith', 'john.smith@email.com', '(843) 555-0101', 'Charleston', 'SC', 'individual', 'high', 'Major Donor', 15000.00),
('c1000000-0000-0000-0000-000000000002', 'Sarah', 'Johnson', 'Sarah Johnson', 'sarah.johnson@email.com', '(843) 555-0102', 'Columbia', 'SC', 'individual', 'medium', 'Repeat Donor', 2500.00),
('c1000000-0000-0000-0000-000000000003', 'Michael', 'Williams', 'Michael Williams', 'michael.w@email.com', '(843) 555-0103', 'Greenville', 'SC', 'individual', 'high', 'First-time Donor', 500.00),
('c1000000-0000-0000-0000-000000000004', 'Emily', 'Davis', 'Emily Davis', 'emily.davis@email.com', '(843) 555-0104', 'Charleston', 'SC', 'individual', 'low', 'Prospect', 0.00),
('c1000000-0000-0000-0000-000000000005', 'Robert', 'Brown', 'Robert Brown', 'robert.brown@corp.com', '(843) 555-0105', 'Spartanburg', 'SC', 'organization_contact', 'medium', 'Repeat Donor', 5000.00)
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT COUNT(*) as contact_count FROM contacts;
