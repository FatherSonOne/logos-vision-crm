-- ============================================
-- LOGOS VISION CRM - COMPREHENSIVE SAMPLE DATA
-- ============================================
-- Sample data for all sections:
-- - Organizations (clients of type organization/nonprofit)
-- - Contacts (individual contacts)
-- - Households (family groupings)
-- - Projects
-- - Activities
-- - Cases
-- ============================================
--
-- IMPORTANT: Run migration_add_missing_columns.sql FIRST
-- if you haven't already added the required columns!
--
-- ============================================

-- ============================================
-- 1. TEAM MEMBERS
-- ============================================

INSERT INTO team_members (id, name, email, role, phone, bio, is_active) VALUES
  ('a1000001-0000-0000-0000-000000000001', 'Frankie Merritt', 'frankie@logosvision.com', 'Founder & Lead Consultant', '(864) 555-0101', 'Founder with 20+ years of nonprofit consulting experience', true),
  ('a1000001-0000-0000-0000-000000000002', 'Sarah Thompson', 'sarah@logosvision.com', 'Senior Project Manager', '(864) 555-0102', 'Expert in nonprofit strategic planning and operations', true),
  ('a1000001-0000-0000-0000-000000000003', 'Marcus Chen', 'marcus@logosvision.com', 'Grant Writing Specialist', '(864) 555-0103', 'Secured over $5M in grants for nonprofit clients', true),
  ('a1000001-0000-0000-0000-000000000004', 'Emily Rodriguez', 'emily@logosvision.com', 'Data Analytics Lead', '(864) 555-0104', 'Specializes in donor data analysis and reporting', true),
  ('a1000001-0000-0000-0000-000000000005', 'James Patterson', 'james@logosvision.com', 'Community Outreach Coordinator', '(864) 555-0105', 'Builds bridges between nonprofits and communities', true),
  ('a1000001-0000-0000-0000-000000000006', 'Lisa Anderson', 'lisa@logosvision.com', 'Marketing & Communications', '(864) 555-0106', 'Digital marketing and branding expert', true),
  ('a1000001-0000-0000-0000-000000000007', 'David Kim', 'david@logosvision.com', 'Technology Director', '(864) 555-0107', 'CRM implementation and technology strategy', true),
  ('a1000001-0000-0000-0000-000000000008', 'Rachel Green', 'rachel@logosvision.com', 'Junior Consultant', '(864) 555-0108', 'Recent MBA graduate specializing in nonprofit management', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  bio = EXCLUDED.bio;

-- ============================================
-- 2. HOUSEHOLDS
-- ============================================

INSERT INTO households (id, household_name, address, city, state, zip_code, phone, email, is_active) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'The Morrison Family', '123 Oak Lane', 'Charleston', 'SC', '29401', '(843) 555-1001', 'morrison.family@email.com', true),
  ('b1000001-0000-0000-0000-000000000002', 'Reynolds-Baker Household', '456 Maple Drive', 'Greenville', 'SC', '29601', '(864) 555-1002', 'reynolds.baker@email.com', true),
  ('b1000001-0000-0000-0000-000000000003', 'The Chen Family', '789 Pine Street', 'Columbia', 'SC', '29201', '(803) 555-1003', 'chen.family@email.com', true),
  ('b1000001-0000-0000-0000-000000000004', 'Martinez Household', '321 Cedar Ave', 'Spartanburg', 'SC', '29301', '(864) 555-1004', 'martinez.household@email.com', true),
  ('b1000001-0000-0000-0000-000000000005', 'The Wilson-Davis Family', '654 Birch Road', 'Anderson', 'SC', '29621', '(864) 555-1005', 'wilson.davis@email.com', true),
  ('b1000001-0000-0000-0000-000000000006', 'Foster Family Foundation', '987 Elm Court', 'Clemson', 'SC', '29631', '(864) 555-1006', 'foster.foundation@email.com', true),
  ('b1000001-0000-0000-0000-000000000007', 'The Patterson Legacy', '147 Willow Way', 'Easley', 'SC', '29640', '(864) 555-1007', 'patterson.legacy@email.com', true),
  ('b1000001-0000-0000-0000-000000000008', 'Anderson-Lee Family', '258 Ash Street', 'Seneca', 'SC', '29678', '(864) 555-1008', 'anderson.lee@email.com', true)
ON CONFLICT (id) DO UPDATE SET
  household_name = EXCLUDED.household_name,
  city = EXCLUDED.city;

-- ============================================
-- 3. ORGANIZATIONS (Clients with type 'organization' or 'nonprofit')
-- ============================================

INSERT INTO clients (id, name, contact_person, email, phone, location, address, website, notes, is_active, type) VALUES
  -- Nonprofit Organizations
  ('c1000001-0000-0000-0000-000000000001', 'Hope Harbor Foundation', 'Dr. Elizabeth Morrison', 'e.morrison@hopeharbor.org', '(843) 555-2001', 'Charleston, SC', '100 Harbor Way, Charleston, SC 29401', 'https://hopeharbor.org', 'Focus on homeless services and transitional housing', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000002', 'Upstate Community Arts Alliance', 'Thomas Reynolds', 't.reynolds@ucaa.org', '(864) 555-2002', 'Greenville, SC', '200 Arts Center Dr, Greenville, SC 29601', 'https://ucaa.org', 'Arts education and community programs', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000003', 'Youth Futures Network', 'Maria Gonzalez', 'm.gonzalez@youthfutures.org', '(803) 555-2003', 'Columbia, SC', '300 Youth Way, Columbia, SC 29201', 'https://youthfutures.org', 'After-school programs and mentorship', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000004', 'Blue Ridge Environmental Trust', 'Jonathan Baker', 'j.baker@blueridgetrust.org', '(828) 555-2004', 'Asheville, NC', '400 Mountain View, Asheville, NC 28801', 'https://blueridgetrust.org', 'Land conservation and environmental education', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000005', 'Literacy Champions SC', 'Patricia Chen', 'p.chen@literacychampions.org', '(864) 555-2005', 'Spartanburg, SC', '500 Book Lane, Spartanburg, SC 29301', 'https://literacychampions.org', 'Adult literacy and ESL programs', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000006', 'Second Chance Animal Rescue', 'Richard Martinez', 'r.martinez@secondchancear.org', '(864) 555-2006', 'Anderson, SC', '600 Rescue Road, Anderson, SC 29621', 'https://secondchancear.org', 'Animal rescue and adoption services', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000007', 'Paws & Hearts Sanctuary', 'Jennifer Davis', 'j.davis@pawsandhearts.org', '(864) 555-2007', 'Clemson, SC', '700 Sanctuary Lane, Clemson, SC 29631', 'https://pawsandhearts.org', 'Senior pet care and therapy animal programs', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000008', 'Tech Tomorrow Initiative', 'William Foster', 'w.foster@techtomorrow.org', '(864) 555-2008', 'Greenville, SC', '800 Innovation Blvd, Greenville, SC 29601', 'https://techtomorrow.org', 'STEM education for underserved youth', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000009', 'Upstate Urban Gardens', 'Nicole Murphy', 'n.murphy@upstategardens.org', '(864) 555-2009', 'Greenville, SC', '900 Garden Way, Greenville, SC 29601', 'https://upstategardens.org', 'Community gardens and food security', true, 'nonprofit'),
  ('c1000001-0000-0000-0000-000000000010', 'Senior Connect Services', 'Charles Anderson', 'c.anderson@seniorconnect.org', '(864) 555-2010', 'Easley, SC', '1000 Elder Care Dr, Easley, SC 29640', 'https://seniorconnect.org', 'Senior services and companionship programs', true, 'nonprofit'),
  -- Regular Organizations/Businesses
  ('c1000001-0000-0000-0000-000000000011', 'Greenville Chamber Foundation', 'Michael Scott', 'm.scott@gvlchamber.org', '(864) 555-2011', 'Greenville, SC', '1100 Business Way, Greenville, SC 29601', 'https://gvlchamber.org', 'Business community development', true, 'organization'),
  ('c1000001-0000-0000-0000-000000000012', 'Carolina Corporate Giving', 'Amanda Wilson', 'a.wilson@carolinacorp.com', '(864) 555-2012', 'Greenville, SC', '1200 Corporate Dr, Greenville, SC 29601', 'https://carolinacorp.com', 'Corporate philanthropy consulting', true, 'organization')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  contact_person = EXCLUDED.contact_person,
  type = EXCLUDED.type;

-- ============================================
-- 4. INDIVIDUAL CONTACTS
-- ============================================

INSERT INTO clients (id, name, contact_person, email, phone, location, address, notes, is_active, type, household_id, total_lifetime_giving, last_gift_date, donor_stage, engagement_score) VALUES
  -- Individual donors linked to households
  ('d1000001-0000-0000-0000-000000000001', 'Dr. Elizabeth Morrison', NULL, 'elizabeth.m@personal.com', '(843) 555-3001', 'Charleston, SC', '123 Oak Lane, Charleston, SC 29401', 'Board member at Hope Harbor, major donor prospect', true, 'individual', 'b1000001-0000-0000-0000-000000000001', 25000.00, '2024-11-15', 'Major Donor', 'high'),
  ('d1000001-0000-0000-0000-000000000002', 'Robert Morrison', NULL, 'robert.m@personal.com', '(843) 555-3002', 'Charleston, SC', '123 Oak Lane, Charleston, SC 29401', 'Spouse of Elizabeth, interested in arts programs', true, 'individual', 'b1000001-0000-0000-0000-000000000001', 15000.00, '2024-10-01', 'Repeat Donor', 'medium'),
  ('d1000001-0000-0000-0000-000000000003', 'Thomas Reynolds', NULL, 'tom.reynolds@personal.com', '(864) 555-3003', 'Greenville, SC', '456 Maple Drive, Greenville, SC 29601', 'Executive Director at UCAA, passionate about arts', true, 'individual', 'b1000001-0000-0000-0000-000000000002', 5000.00, '2024-09-15', 'Repeat Donor', 'high'),
  ('d1000001-0000-0000-0000-000000000004', 'Sarah Baker-Reynolds', NULL, 'sarah.br@personal.com', '(864) 555-3004', 'Greenville, SC', '456 Maple Drive, Greenville, SC 29601', 'Attorney, interested in youth programs', true, 'individual', 'b1000001-0000-0000-0000-000000000002', 3500.00, '2024-08-20', 'Repeat Donor', 'medium'),
  ('d1000001-0000-0000-0000-000000000005', 'Patricia Chen', NULL, 'patricia.chen@personal.com', '(803) 555-3005', 'Columbia, SC', '789 Pine Street, Columbia, SC 29201', 'Literacy advocate, volunteer coordinator', true, 'individual', 'b1000001-0000-0000-0000-000000000003', 8000.00, '2024-12-01', 'Major Donor', 'high'),
  ('d1000001-0000-0000-0000-000000000006', 'David Chen', NULL, 'david.chen@personal.com', '(803) 555-3006', 'Columbia, SC', '789 Pine Street, Columbia, SC 29201', 'Tech entrepreneur, supports STEM education', true, 'individual', 'b1000001-0000-0000-0000-000000000003', 12000.00, '2024-11-01', 'Major Donor', 'high'),
  -- Individual donors not in households
  ('d1000001-0000-0000-0000-000000000007', 'Maria Gonzalez', NULL, 'maria.g@personal.com', '(803) 555-3007', 'Columbia, SC', '1500 Youth Ave, Columbia, SC 29201', 'Youth program coordinator, first-time supporter', true, 'individual', NULL, 500.00, '2024-10-15', 'First-time Donor', 'medium'),
  ('d1000001-0000-0000-0000-000000000008', 'Jonathan Baker', NULL, 'jon.baker@personal.com', '(828) 555-3008', 'Asheville, NC', '2000 Mountain View, Asheville, NC 28801', 'Environmental activist, monthly giver', true, 'individual', NULL, 2400.00, '2024-12-01', 'Repeat Donor', 'high'),
  ('d1000001-0000-0000-0000-000000000009', 'Jennifer Davis', NULL, 'jen.davis@personal.com', '(864) 555-3009', 'Clemson, SC', '2500 Pet Lane, Clemson, SC 29631', 'Animal welfare advocate, potential major donor', true, 'individual', NULL, 4000.00, '2024-11-20', 'Repeat Donor', 'medium'),
  ('d1000001-0000-0000-0000-000000000010', 'William Foster III', NULL, 'will.foster@personal.com', '(864) 555-3010', 'Greenville, SC', '3000 Tech Blvd, Greenville, SC 29601', 'Tech executive, STEM education supporter', true, 'individual', NULL, 50000.00, '2024-10-01', 'Major Donor', 'high'),
  ('d1000001-0000-0000-0000-000000000011', 'Nicole Murphy', NULL, 'nicole.m@personal.com', '(864) 555-3011', 'Greenville, SC', '3500 Garden Way, Greenville, SC 29601', 'Community garden volunteer, new donor', true, 'individual', NULL, 250.00, '2024-11-01', 'First-time Donor', 'low'),
  ('d1000001-0000-0000-0000-000000000012', 'Charles Anderson Jr.', NULL, 'chuck.a@personal.com', '(864) 555-3012', 'Easley, SC', '4000 Elder Dr, Easley, SC 29640', 'Retired executive, senior services supporter', true, 'individual', NULL, 7500.00, '2024-09-01', 'Repeat Donor', 'medium'),
  -- Prospects (no donations yet)
  ('d1000001-0000-0000-0000-000000000013', 'Amanda Mitchell', NULL, 'amanda.m@personal.com', '(864) 555-3013', 'Greenville, SC', '4500 Prospect Lane, Greenville, SC 29601', 'New to area, expressed interest in volunteering', true, 'individual', NULL, 0.00, NULL, 'Prospect', 'low'),
  ('d1000001-0000-0000-0000-000000000014', 'Michael Scott', NULL, 'michael.scott@personal.com', '(864) 555-3014', 'Greenville, SC', '5000 Business Way, Greenville, SC 29601', 'Business owner, chamber member', true, 'individual', NULL, 0.00, NULL, 'Prospect', 'medium'),
  -- Lapsed donors
  ('d1000001-0000-0000-0000-000000000015', 'Former Donor Smith', NULL, 'former.donor@personal.com', '(864) 555-3015', 'Anderson, SC', '5500 Past Way, Anderson, SC 29621', 'Last gave 2 years ago, re-engagement candidate', true, 'individual', NULL, 1500.00, '2022-06-15', 'Lapsed', 'low')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  donor_stage = EXCLUDED.donor_stage,
  type = EXCLUDED.type;

-- ============================================
-- 5. PROJECTS
-- ============================================

INSERT INTO projects (id, name, description, client_id, status, start_date, end_date, budget, notes, created_by_id) VALUES
  ('e1000001-0000-0000-0000-000000000001', 'Annual Impact Gala 2025', 'Plan and execute comprehensive fundraising gala for Hope Harbor Foundation including venue selection, sponsorships, and donor cultivation', 'c1000001-0000-0000-0000-000000000001', 'In Progress', '2024-08-01', '2025-03-15', 75000.00, 'Target: $150,000 raised', 'a1000001-0000-0000-0000-000000000001'),
  ('e1000001-0000-0000-0000-000000000002', 'Federal Grant Application - Education', '$250K grant application for Youth Futures Network youth education programs', 'c1000001-0000-0000-0000-000000000003', 'In Progress', '2024-09-01', '2025-01-31', 15000.00, 'Department of Education opportunity', 'a1000001-0000-0000-0000-000000000003'),
  ('e1000001-0000-0000-0000-000000000003', 'Strategic Plan 2025-2030', 'Comprehensive 5-year strategic planning engagement for Hope Harbor Foundation', 'c1000001-0000-0000-0000-000000000001', 'In Progress', '2024-06-01', '2024-12-31', 45000.00, 'Includes board retreat and stakeholder interviews', 'a1000001-0000-0000-0000-000000000002'),
  ('e1000001-0000-0000-0000-000000000004', 'CRM Implementation', 'Implement new donor management system for Upstate Community Arts Alliance', 'c1000001-0000-0000-0000-000000000002', 'Planning', '2025-01-01', '2025-06-30', 25000.00, 'Salesforce Nonprofit implementation', 'a1000001-0000-0000-0000-000000000007'),
  ('e1000001-0000-0000-0000-000000000005', 'Capital Campaign Planning', 'Feasibility study and campaign planning for Literacy Champions new building', 'c1000001-0000-0000-0000-000000000005', 'Planning', '2025-02-01', '2025-08-31', 35000.00, 'Goal: $2M campaign', 'a1000001-0000-0000-0000-000000000001'),
  ('e1000001-0000-0000-0000-000000000006', 'Board Development Workshop', 'Governance and fundraising training for Blue Ridge Environmental Trust board', 'c1000001-0000-0000-0000-000000000004', 'Completed', '2024-10-01', '2024-11-30', 8000.00, 'Successfully completed', 'a1000001-0000-0000-0000-000000000002'),
  ('e1000001-0000-0000-0000-000000000007', 'Marketing Refresh', 'Brand refresh and website redesign for Second Chance Animal Rescue', 'c1000001-0000-0000-0000-000000000006', 'In Progress', '2024-11-01', '2025-02-28', 18000.00, 'Includes new logo and brand guidelines', 'a1000001-0000-0000-0000-000000000006'),
  ('e1000001-0000-0000-0000-000000000008', 'Donor Retention Analysis', 'Deep dive into donor retention metrics for Tech Tomorrow Initiative', 'c1000001-0000-0000-0000-000000000008', 'On Hold', '2024-09-15', '2024-12-15', 12000.00, 'Waiting for client data access', 'a1000001-0000-0000-0000-000000000004'),
  ('e1000001-0000-0000-0000-000000000009', 'Community Garden Expansion', 'Grant writing and planning for Upstate Urban Gardens expansion', 'c1000001-0000-0000-0000-000000000009', 'In Progress', '2024-10-15', '2025-04-30', 20000.00, 'Three new garden sites planned', 'a1000001-0000-0000-0000-000000000003'),
  ('e1000001-0000-0000-0000-000000000010', 'Senior Services Assessment', 'Comprehensive needs assessment for Senior Connect Services', 'c1000001-0000-0000-0000-000000000010', 'Planning', '2025-01-15', '2025-05-31', 22000.00, 'Includes survey of 500+ seniors', 'a1000001-0000-0000-0000-000000000005')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status;

-- ============================================
-- 6. PROJECT TEAM MEMBERS
-- ============================================

INSERT INTO project_team_members (project_id, team_member_id, role) VALUES
  ('e1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Project Lead'),
  ('e1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000002', 'Event Coordinator'),
  ('e1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000006', 'Marketing Support'),
  ('e1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000003', 'Lead Writer'),
  ('e1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000004', 'Data Analyst'),
  ('e1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000001', 'Senior Advisor'),
  ('e1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000002', 'Project Manager'),
  ('e1000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000007', 'Technical Lead'),
  ('e1000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000004', 'Data Migration'),
  ('e1000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000001', 'Campaign Consultant'),
  ('e1000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000003', 'Grant Writer'),
  ('e1000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000002', 'Facilitator'),
  ('e1000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000006', 'Creative Director'),
  ('e1000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000008', 'Designer'),
  ('e1000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000004', 'Analyst'),
  ('e1000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000003', 'Grant Writer'),
  ('e1000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000005', 'Community Liaison'),
  ('e1000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000005', 'Project Lead'),
  ('e1000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000004', 'Data Analyst')
ON CONFLICT (project_id, team_member_id) DO NOTHING;

-- ============================================
-- 7. TASKS
-- ============================================

INSERT INTO tasks (id, project_id, description, team_member_id, status, due_date, priority, phase, notes, shared_with_client) VALUES
  -- Gala tasks
  ('f1000001-0000-0000-0000-000000000001', 'e1000001-0000-0000-0000-000000000001', 'Secure venue contract', 'a1000001-0000-0000-0000-000000000002', 'Done', '2024-09-15', 'High', 'Planning', 'Greenville Convention Center confirmed', true),
  ('f1000001-0000-0000-0000-000000000002', 'e1000001-0000-0000-0000-000000000001', 'Book keynote speaker', 'a1000001-0000-0000-0000-000000000001', 'Done', '2024-10-30', 'High', 'Planning', 'Senator Johnson confirmed', true),
  ('f1000001-0000-0000-0000-000000000003', 'e1000001-0000-0000-0000-000000000001', 'Launch sponsorship campaign', 'a1000001-0000-0000-0000-000000000006', 'In Progress', '2024-12-15', 'High', 'Fundraising', 'Target: 20 corporate sponsors', false),
  ('f1000001-0000-0000-0000-000000000004', 'e1000001-0000-0000-0000-000000000001', 'Design event materials', 'a1000001-0000-0000-0000-000000000006', 'To Do', '2025-01-15', 'Medium', 'Marketing', 'Invitations, programs, signage', false),
  ('f1000001-0000-0000-0000-000000000005', 'e1000001-0000-0000-0000-000000000001', 'Coordinate catering', 'a1000001-0000-0000-0000-000000000002', 'To Do', '2025-02-01', 'Medium', 'Logistics', 'Menu tasting scheduled', false),
  -- Grant tasks
  ('f1000001-0000-0000-0000-000000000006', 'e1000001-0000-0000-0000-000000000002', 'Gather impact statistics', 'a1000001-0000-0000-0000-000000000004', 'Done', '2024-09-30', 'High', 'Research', 'Data compiled from last 3 years', false),
  ('f1000001-0000-0000-0000-000000000007', 'e1000001-0000-0000-0000-000000000002', 'Draft narrative section', 'a1000001-0000-0000-0000-000000000003', 'In Progress', '2024-12-15', 'High', 'Writing', 'First draft complete, revising', false),
  ('f1000001-0000-0000-0000-000000000008', 'e1000001-0000-0000-0000-000000000002', 'Compile budget justification', 'a1000001-0000-0000-0000-000000000003', 'To Do', '2024-12-30', 'High', 'Writing', NULL, false),
  -- Strategic plan tasks
  ('f1000001-0000-0000-0000-000000000009', 'e1000001-0000-0000-0000-000000000003', 'Complete stakeholder interviews', 'a1000001-0000-0000-0000-000000000002', 'Done', '2024-07-31', 'High', 'Discovery', '15 interviews completed', true),
  ('f1000001-0000-0000-0000-000000000010', 'e1000001-0000-0000-0000-000000000003', 'Facilitate board retreat', 'a1000001-0000-0000-0000-000000000001', 'Done', '2024-09-15', 'High', 'Planning', 'Successful 2-day retreat', true),
  ('f1000001-0000-0000-0000-000000000011', 'e1000001-0000-0000-0000-000000000003', 'Draft strategic plan document', 'a1000001-0000-0000-0000-000000000002', 'In Progress', '2024-12-15', 'High', 'Documentation', 'Final review stage', true),
  -- CRM tasks
  ('f1000001-0000-0000-0000-000000000012', 'e1000001-0000-0000-0000-000000000004', 'Requirements gathering', 'a1000001-0000-0000-0000-000000000007', 'In Progress', '2025-01-15', 'High', 'Discovery', 'Meeting with stakeholders', false),
  ('f1000001-0000-0000-0000-000000000013', 'e1000001-0000-0000-0000-000000000004', 'Data cleanup plan', 'a1000001-0000-0000-0000-000000000004', 'To Do', '2025-02-01', 'Medium', 'Preparation', NULL, false),
  -- Marketing tasks
  ('f1000001-0000-0000-0000-000000000014', 'e1000001-0000-0000-0000-000000000007', 'Logo concepts development', 'a1000001-0000-0000-0000-000000000006', 'Done', '2024-11-30', 'High', 'Creative', '3 concepts presented', true),
  ('f1000001-0000-0000-0000-000000000015', 'e1000001-0000-0000-0000-000000000007', 'Website wireframes', 'a1000001-0000-0000-0000-000000000008', 'In Progress', '2024-12-20', 'High', 'Creative', 'Homepage and 5 key pages', false)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

-- ============================================
-- 8. ACTIVITIES
-- ============================================

INSERT INTO activities (id, type, title, description, client_id, project_id, status, activity_date, duration_minutes, location, notes, shared_with_client, created_by_id) VALUES
  -- Meetings
  ('11000001-0000-0000-0000-000000000001', 'Meeting', 'Gala Planning Kickoff', 'Initial planning meeting for 2025 Impact Gala', 'c1000001-0000-0000-0000-000000000001', 'e1000001-0000-0000-0000-000000000001', 'Completed', '2024-08-15', 90, 'Hope Harbor Office', 'Great energy from the team, clear goals established', true, 'a1000001-0000-0000-0000-000000000001'),
  ('11000001-0000-0000-0000-000000000002', 'Meeting', 'Grant Strategy Session', 'Federal grant application strategy meeting', 'c1000001-0000-0000-0000-000000000003', 'e1000001-0000-0000-0000-000000000002', 'Completed', '2024-09-05', 60, 'Virtual', 'Identified key strengths to highlight', false, 'a1000001-0000-0000-0000-000000000003'),
  ('11000001-0000-0000-0000-000000000003', 'Meeting', 'Board Presentation', 'Strategic plan progress presentation to board', 'c1000001-0000-0000-0000-000000000001', 'e1000001-0000-0000-0000-000000000003', 'Completed', '2024-11-15', 120, 'Hope Harbor Boardroom', 'Board enthusiastic about direction', true, 'a1000001-0000-0000-0000-000000000002'),
  ('11000001-0000-0000-0000-000000000004', 'Meeting', 'Sponsor Cultivation Lunch', 'Lunch with potential major sponsor', 'c1000001-0000-0000-0000-000000000001', 'e1000001-0000-0000-0000-000000000001', 'Completed', '2024-12-01', 75, 'Greenville Country Club', 'Very positive reception, follow-up scheduled', false, 'a1000001-0000-0000-0000-000000000001'),
  ('11000001-0000-0000-0000-000000000005', 'Meeting', 'CRM Kickoff Call', 'Project kickoff with UCAA team', 'c1000001-0000-0000-0000-000000000002', 'e1000001-0000-0000-0000-000000000004', 'Scheduled', '2025-01-08', 60, 'Virtual', NULL, true, 'a1000001-0000-0000-0000-000000000007'),
  -- Calls
  ('11000001-0000-0000-0000-000000000006', 'Call', 'Donor Thank You Call', 'Called to thank William Foster for $50K gift', 'd1000001-0000-0000-0000-000000000010', NULL, 'Completed', '2024-10-15', 15, 'Phone', 'Very appreciative, interested in naming opportunity', false, 'a1000001-0000-0000-0000-000000000001'),
  ('11000001-0000-0000-0000-000000000007', 'Call', 'Grant Officer Follow-up', 'Follow-up call with federal grant program officer', 'c1000001-0000-0000-0000-000000000003', 'e1000001-0000-0000-0000-000000000002', 'Completed', '2024-11-20', 30, 'Phone', 'Confirmed our application is competitive', false, 'a1000001-0000-0000-0000-000000000003'),
  ('11000001-0000-0000-0000-000000000008', 'Call', 'Monthly Check-in', 'Regular check-in with Elizabeth Morrison', 'd1000001-0000-0000-0000-000000000001', NULL, 'Completed', '2024-12-05', 20, 'Phone', 'Interested in matching gift program', false, 'a1000001-0000-0000-0000-000000000001'),
  -- Emails
  ('11000001-0000-0000-0000-000000000009', 'Email', 'Sponsorship Package Sent', 'Sent 2025 Gala sponsorship package', 'c1000001-0000-0000-0000-000000000011', 'e1000001-0000-0000-0000-000000000001', 'Completed', '2024-11-01', 15, 'Email', 'Sent Gold and Platinum options', false, 'a1000001-0000-0000-0000-000000000006'),
  ('11000001-0000-0000-0000-000000000010', 'Email', 'Grant Draft Review Request', 'Sent grant narrative draft for client review', 'c1000001-0000-0000-0000-000000000003', 'e1000001-0000-0000-0000-000000000002', 'Completed', '2024-12-10', 30, 'Email', 'Deadline for feedback: Dec 15', true, 'a1000001-0000-0000-0000-000000000003'),
  -- Notes
  ('11000001-0000-0000-0000-000000000011', 'Note', 'Prospect Research Notes', 'Research on potential major donor Amanda Mitchell', 'd1000001-0000-0000-0000-000000000013', NULL, 'Completed', '2024-11-25', 45, 'Office', 'Wealth screening indicates capacity for $25K+', false, 'a1000001-0000-0000-0000-000000000004'),
  ('11000001-0000-0000-0000-000000000012', 'Note', 'Site Visit Notes', 'Documented visit to community garden expansion site', 'c1000001-0000-0000-0000-000000000009', 'e1000001-0000-0000-0000-000000000009', 'Completed', '2024-11-30', 60, 'Greenville', 'Three viable locations identified', true, 'a1000001-0000-0000-0000-000000000005')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

-- ============================================
-- 9. CASES
-- ============================================

INSERT INTO cases (id, title, description, client_id, assigned_to_id, status, priority, category, opened_date, resolution) VALUES
  ('21000001-0000-0000-0000-000000000001', 'Federal Grant Application Denial Appeal', 'Hope Harbor Foundation received denial for their federal education grant. Need to prepare appeal documentation and strategy.', 'c1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000003', 'Open', 'High', 'Grant', '2024-12-01', NULL),
  ('21000001-0000-0000-0000-000000000002', 'Employment Contract Dispute', 'Youth Futures Network has a contract dispute with a former employee. Need legal review and mediation strategy.', 'c1000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000002', 'Open', 'Critical', 'Legal', '2024-11-15', NULL),
  ('21000001-0000-0000-0000-000000000003', 'Annual Compliance Audit Prep', 'Blue Ridge Environmental Trust needs assistance preparing for their annual state compliance audit.', 'c1000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000002', 'In Progress', 'Medium', 'Compliance', '2024-12-05', NULL),
  ('21000001-0000-0000-0000-000000000004', 'Strategic Planning Workshop Request', 'Second Chance Animal Rescue requested a strategic planning workshop for their 2025 initiatives.', 'c1000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000001', 'Open', 'Medium', 'Strategic', '2024-12-08', NULL),
  ('21000001-0000-0000-0000-000000000005', 'Board Governance Policy Review', 'Literacy Champions needs comprehensive review and update of board governance policies.', 'c1000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000002', 'Resolved', 'Low', 'Compliance', '2024-11-01', 'Completed comprehensive policy review. Updated 12 policies and created 3 new ones. Board approved all changes.'),
  ('21000001-0000-0000-0000-000000000006', 'Major Donor Issue Resolution', 'William Foster expressed concerns about program impact reporting. Need to address and provide detailed metrics.', 'd1000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000001', 'Open', 'High', 'Donor Relations', '2024-12-10', NULL),
  ('21000001-0000-0000-0000-000000000007', 'CRM Data Migration Issue', 'UCAA experiencing data quality issues in preparation for CRM migration.', 'c1000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000007', 'In Progress', 'Medium', 'Technical', '2024-12-12', NULL),
  ('21000001-0000-0000-0000-000000000008', 'Grant Reporting Deadline Extension', 'Tech Tomorrow Initiative needs help requesting deadline extension for quarterly grant report.', 'c1000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000003', 'Resolved', 'Medium', 'Grant', '2024-11-20', 'Extension approved through January 15, 2025')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  resolution = EXCLUDED.resolution;

-- ============================================
-- 10. CASE COMMENTS
-- ============================================

INSERT INTO case_comments (id, case_id, author_id, content, is_internal) VALUES
  ('31000001-0000-0000-0000-000000000001', '21000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000003', 'Reviewed denial letter. Main issue is budget justification. Scheduling call with client to gather additional documentation.', false),
  ('31000001-0000-0000-0000-000000000002', '21000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000003', 'Call completed. Client will provide revised budget by Dec 15.', false),
  ('31000001-0000-0000-0000-000000000003', '21000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000002', 'Initial consultation with client board completed. Recommending mediation before legal action.', true),
  ('31000001-0000-0000-0000-000000000004', '21000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000002', 'Audit checklist sent to client. Awaiting documents.', false),
  ('31000001-0000-0000-0000-000000000005', '21000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000002', 'All policy documents submitted to board for approval.', false),
  ('31000001-0000-0000-0000-000000000006', '21000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000002', 'Board unanimously approved all policy updates. Case resolved.', false),
  ('31000001-0000-0000-0000-000000000007', '21000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000001', 'Spoke with Mr. Foster. He wants quarterly impact reports with specific beneficiary stories.', true),
  ('31000001-0000-0000-0000-000000000008', '21000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000004', 'Created custom dashboard showing program impact metrics. Sending to Frankie for review.', true),
  ('31000001-0000-0000-0000-000000000009', '21000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000007', 'Identified 2,500 duplicate records. Data cleanup plan in progress.', false),
  ('31000001-0000-0000-0000-000000000010', '21000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000003', 'Extension request submitted. Awaiting funder response.', false),
  ('31000001-0000-0000-0000-000000000011', '21000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000003', 'Extension approved! New deadline is January 15, 2025.', false)
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content;

-- ============================================
-- UPDATE HOUSEHOLD CONTACT COUNTS
-- ============================================

-- Update primary contacts for households
UPDATE households SET primary_contact_id = 'd1000001-0000-0000-0000-000000000001' WHERE id = 'b1000001-0000-0000-0000-000000000001';
UPDATE households SET primary_contact_id = 'd1000001-0000-0000-0000-000000000003' WHERE id = 'b1000001-0000-0000-0000-000000000002';
UPDATE households SET primary_contact_id = 'd1000001-0000-0000-0000-000000000005' WHERE id = 'b1000001-0000-0000-0000-000000000003';

-- ============================================
-- SAMPLE DATA COMPLETE
-- ============================================
--
-- Summary of data created:
-- - 8 Team Members
-- - 8 Households
-- - 12 Organizations (10 nonprofits, 2 regular orgs)
-- - 15 Individual Contacts (9 in households, 6 not)
-- - 10 Projects with various statuses
-- - 19 Project Team Member assignments
-- - 15 Tasks across projects
-- - 12 Activities (meetings, calls, emails, notes)
-- - 8 Cases with various statuses
-- - 11 Case Comments
--
-- INSTRUCTIONS:
-- 1. First run: migration_add_missing_columns.sql
-- 2. Then run this file: sample_data_all_sections.sql
--
-- ============================================
