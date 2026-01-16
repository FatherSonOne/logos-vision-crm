-- ============================================================================
-- COMPREHENSIVE SAMPLE DATA FOR LOGOS VISION CRM
-- ============================================================================
-- This file creates realistic sample data for EVERY menu item in the CRM
-- Run this AFTER your database schema is set up
-- ============================================================================

BEGIN;

-- ============================================
-- 1. CLIENTS (Organizations)
-- ============================================
INSERT INTO clients (id, name, contact_person, email, phone, address, city, state, zip, website, organization_type, notes, created_at) VALUES
('client-1', 'Hope Community Center', 'Sarah Johnson', 'sjohnson@hopecc.org', '(555) 123-4567', '123 Main Street', 'Seneca', 'SC', '29678', 'www.hopecc.org', 'Non-Profit', 'Focus on youth programs and community development', NOW() - INTERVAL '6 months'),
('client-2', 'Green Earth Alliance', 'Michael Chen', 'mchen@greenearth.org', '(555) 234-5678', '456 Oak Avenue', 'Clemson', 'SC', '29631', 'www.greenearth.org', 'Non-Profit', 'Environmental advocacy and sustainability education', NOW() - INTERVAL '4 months'),
('client-3', 'Faith Family Services', 'Rebecca Martinez', 'rmartinez@faithfamily.org', '(555) 345-6789', '789 Church Road', 'Westminster', 'SC', '29693', 'www.faithfamily.org', 'Religious Organization', 'Family counseling and support services', NOW() - INTERVAL '3 months'),
('client-4', 'Southside Food Bank', 'David Thompson', 'dthompson@southsidefb.org', '(555) 456-7890', '321 South Street', 'Walhalla', 'SC', '29691', 'www.southsidefb.org', 'Non-Profit', 'Emergency food assistance and nutrition education', NOW() - INTERVAL '2 months'),
('client-5', 'Arts for All Foundation', 'Jennifer Lee', 'jlee@artsforall.org', '(555) 567-8901', '654 Creative Lane', 'Anderson', 'SC', '29621', 'www.artsforall.org', 'Non-Profit', 'Arts education and accessibility programs', NOW() - INTERVAL '1 month');

-- ============================================
-- 2. CONTACTS (Individual contacts within orgs)
-- ============================================
INSERT INTO contacts (id, first_name, last_name, email, phone, client_id, title, notes, created_at) VALUES
('contact-1', 'Sarah', 'Johnson', 'sjohnson@hopecc.org', '(555) 123-4567', 'client-1', 'Executive Director', 'Primary contact for Hope Community Center', NOW() - INTERVAL '6 months'),
('contact-2', 'Tom', 'Anderson', 'tanderson@hopecc.org', '(555) 123-4568', 'client-1', 'Program Director', 'Manages youth programs', NOW() - INTERVAL '5 months'),
('contact-3', 'Michael', 'Chen', 'mchen@greenearth.org', '(555) 234-5678', 'client-2', 'Founder & CEO', 'Visionary leader, passionate about climate action', NOW() - INTERVAL '4 months'),
('contact-4', 'Lisa', 'Wong', 'lwong@greenearth.org', '(555) 234-5679', 'client-2', 'Development Director', 'Handles fundraising and grants', NOW() - INTERVAL '3 months'),
('contact-5', 'Rebecca', 'Martinez', 'rmartinez@faithfamily.org', '(555) 345-6789', 'client-3', 'Pastor', 'Senior leadership, community outreach', NOW() - INTERVAL '3 months'),
('contact-6', 'David', 'Thompson', 'dthompson@southsidefb.org', '(555) 456-7890', 'client-4', 'Operations Manager', 'Day-to-day operations and volunteer coordination', NOW() - INTERVAL '2 months'),
('contact-7', 'Jennifer', 'Lee', 'jlee@artsforall.org', '(555) 567-8901', 'client-5', 'Executive Director', 'Strategic planning and community partnerships', NOW() - INTERVAL '1 month'),
('contact-8', 'Carlos', 'Rodriguez', 'crodriguez@artsforall.org', '(555) 567-8902', 'client-5', 'Education Coordinator', 'Develops curriculum and teaches classes', NOW() - INTERVAL '3 weeks');

-- ============================================
-- 3. TEAM MEMBERS
-- ============================================
INSERT INTO team_members (id, name, email, role, phone, department, hire_date, avatar_url, status, notes) VALUES
('team-1', 'Frankie Mercurio', 'frankie@logosvision.com', 'Founder & Lead Consultant', '(555) 111-2222', 'Leadership', NOW() - INTERVAL '1 year', NULL, 'Active', 'Specializes in non-profit consulting and CRM solutions'),
('team-2', 'Alex Rivera', 'arivera@logosvision.com', 'Senior Project Manager', '(555) 222-3333', 'Project Management', NOW() - INTERVAL '8 months', NULL, 'Active', 'Expert in Agile methodology and stakeholder management'),
('team-3', 'Priya Patel', 'ppatel@logosvision.com', 'Grant Writer', '(555) 333-4444', 'Development', NOW() - INTERVAL '6 months', NULL, 'Active', 'Successfully secured over $2M in grants'),
('team-4', 'James Wilson', 'jwilson@logosvision.com', 'Web Developer', '(555) 444-5555', 'Technology', NOW() - INTERVAL '4 months', NULL, 'Active', 'Full-stack developer specializing in React and Node.js'),
('team-5', 'Maria Garcia', 'mgarcia@logosvision.com', 'Marketing Specialist', '(555) 555-6666', 'Marketing', NOW() - INTERVAL '3 months', NULL, 'Active', 'Digital marketing and social media strategy expert');

-- ============================================
-- 4. PROJECTS
-- ============================================
INSERT INTO projects (id, name, description, client_id, status, start_date, end_date, budget, actual_cost, progress, tags, notes, created_at) VALUES
('proj-1', 'Hope CC Website Redesign', 'Complete website overhaul with donation integration and volunteer portal', 'client-1', 'in_progress', NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 15000.00, 8500.00, 60, ARRAY['Website', 'Design', 'Development'], 'Client wants mobile-first responsive design', NOW() - INTERVAL '30 days'),
('proj-2', 'Green Earth Social Media Campaign', 'Launch comprehensive social media strategy across all platforms', 'client-2', 'in_progress', NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days', 5000.00, 2800.00, 45, ARRAY['Marketing', 'Social Media'], 'Focus on Instagram and TikTok for youth engagement', NOW() - INTERVAL '20 days'),
('proj-3', 'Faith Family Annual Gala', 'Event planning and execution for annual fundraising gala', 'client-3', 'planning', NOW() + INTERVAL '15 days', NOW() + INTERVAL '90 days', 25000.00, 5000.00, 25, ARRAY['Event', 'Fundraising'], 'Expected 200+ attendees, goal $100K raised', NOW() - INTERVAL '10 days'),
('proj-4', 'Southside Food Bank Database Migration', 'Migrate donor and recipient data to new CRM system', 'client-4', 'completed', NOW() - INTERVAL '90 days', NOW() - INTERVAL '15 days', 8000.00, 7800.00, 100, ARRAY['Technology', 'Database'], 'Successfully migrated 5,000+ records', NOW() - INTERVAL '90 days'),
('proj-5', 'Arts for All Youth Program Launch', 'Design and launch after-school arts program for underserved youth', 'client-5', 'in_progress', NOW() - INTERVAL '45 days', NOW() + INTERVAL '120 days', 18000.00, 9000.00, 50, ARRAY['Program Development', 'Education'], 'Partnering with 3 local schools', NOW() - INTERVAL '45 days'),
('proj-6', 'Hope CC Grant Application - DOE', 'Federal grant application for educational programs ($250K)', 'client-1', 'in_progress', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 3000.00, 1500.00, 75, ARRAY['Grant Writing', 'Federal'], 'Deadline approaching - high priority', NOW() - INTERVAL '10 days'),
('proj-7', 'Green Earth Volunteer Training Program', 'Develop comprehensive training for environmental volunteers', 'client-2', 'on_hold', NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days', 4500.00, 2000.00, 35, ARRAY['Training', 'Volunteers'], 'On hold pending board approval', NOW() - INTERVAL '60 days');

-- ============================================
-- 5. TASKS
-- ============================================
INSERT INTO tasks (id, title, description, project_id, assigned_to, status, priority, due_date, estimated_hours, actual_hours, tags, notes, created_at) VALUES
-- Tasks for Project 1 (Hope CC Website)
('task-1', 'Design Homepage Mockups', 'Create 3 homepage design concepts for client review', 'proj-1', 'team-4', 'completed', 'high', NOW() - INTERVAL '20 days', 12, 14, ARRAY['Design'], 'Client loved option 2', NOW() - INTERVAL '30 days'),
('task-2', 'Develop Donation Page', 'Build secure donation page with Stripe integration', 'proj-1', 'team-4', 'in_progress', 'high', NOW() + INTERVAL '5 days', 16, 8, ARRAY['Development', 'Payment'], 'Stripe API keys received', NOW() - INTERVAL '25 days'),
('task-3', 'Create Volunteer Portal', 'Build login system for volunteers to track hours', 'proj-1', 'team-4', 'pending', 'medium', NOW() + INTERVAL '15 days', 20, 0, ARRAY['Development', 'Portal'], 'Waiting on design specs', NOW() - INTERVAL '25 days'),
('task-4', 'User Acceptance Testing', 'Client testing and feedback collection', 'proj-1', 'team-2', 'pending', 'high', NOW() + INTERVAL '45 days', 8, 0, ARRAY['Testing'], 'Schedule 2-week testing period', NOW() - INTERVAL '25 days'),

-- Tasks for Project 2 (Green Earth Social)
('task-5', 'Create Content Calendar', 'Plan 3 months of social media content', 'proj-2', 'team-5', 'completed', 'high', NOW() - INTERVAL '10 days', 8, 9, ARRAY['Marketing', 'Planning'], 'Calendar approved by client', NOW() - INTERVAL '20 days'),
('task-6', 'Design Instagram Graphics', 'Create branded graphics for 20 Instagram posts', 'proj-2', 'team-5', 'in_progress', 'medium', NOW() + INTERVAL '7 days', 15, 7, ARRAY['Design', 'Social'], 'Using new brand colors', NOW() - INTERVAL '15 days'),
('task-7', 'Launch TikTok Account', 'Set up and post first 5 TikTok videos', 'proj-2', 'team-5', 'pending', 'medium', NOW() + INTERVAL '14 days', 10, 0, ARRAY['Social', 'Video'], 'Targeting Gen Z audience', NOW() - INTERVAL '15 days'),

-- Tasks for Project 6 (Grant Application)
('task-8', 'Research Grant Requirements', 'Review DOE grant guidelines and eligibility', 'proj-6', 'team-3', 'completed', 'critical', NOW() - INTERVAL '8 days', 4, 5, ARRAY['Research', 'Grant'], 'Confirmed eligibility', NOW() - INTERVAL '10 days'),
('task-9', 'Draft Narrative Section', 'Write compelling program narrative (10 pages)', 'proj-6', 'team-3', 'in_progress', 'critical', NOW() + INTERVAL '3 days', 16, 10, ARRAY['Writing', 'Grant'], 'Section 2 of 4 complete', NOW() - INTERVAL '9 days'),
('task-10', 'Gather Budget Documentation', 'Collect financial records and create detailed budget', 'proj-6', 'team-1', 'in_progress', 'critical', NOW() + INTERVAL '5 days', 8, 4, ARRAY['Finance', 'Grant'], 'Need Q3 financials from client', NOW() - INTERVAL '8 days'),
('task-11', 'Submit Final Application', 'Final review and online submission to DOE portal', 'proj-6', 'team-3', 'pending', 'critical', NOW() + INTERVAL '15 days', 4, 0, ARRAY['Grant', 'Submission'], 'Must submit 48 hours before deadline', NOW() - INTERVAL '10 days');

-- ============================================
-- 6. ACTIVITIES (Calls, Meetings, Emails)
-- ============================================
INSERT INTO activities (id, type, title, description, activity_date, activity_time, client_id, project_id, contact_id, assigned_to, status, outcome, notes, created_at) VALUES
-- Recent activities
('act-1', 'call', 'Check-in Call with Sarah Johnson', 'Discussed website progress and timeline concerns', CURRENT_DATE, '10:00', 'client-1', 'proj-1', 'contact-1', 'team-2', 'completed', 'Positive - client is pleased with progress', 'Agreed to weekly status calls', NOW() - INTERVAL '2 days'),
('act-2', 'meeting', 'Green Earth Strategy Session', 'Quarterly planning meeting for social media strategy', CURRENT_DATE - INTERVAL '1 day', '14:00', 'client-2', 'proj-2', 'contact-3', 'team-5', 'completed', 'Very productive - new ideas generated', 'Client wants to expand to YouTube', NOW() - INTERVAL '1 day'),
('act-3', 'email', 'Grant Budget Questions', 'Email exchange re: DOE grant budget requirements', CURRENT_DATE, '09:30', 'client-1', 'proj-6', 'contact-2', 'team-3', 'completed', 'Questions answered, moving forward', 'Client will provide missing docs by Friday', NOW() - INTERVAL '6 hours'),
('act-4', 'meeting', 'Faith Family Gala Planning Meeting', 'Initial planning session for annual gala event', CURRENT_DATE + INTERVAL '2 days', '13:00', 'client-3', 'proj-3', 'contact-5', 'team-1', 'scheduled', NULL, 'First of 6 planning meetings', NOW() - INTERVAL '3 days'),
('act-5', 'call', 'Southside Food Bank Success Call', 'Post-migration check-in and training discussion', CURRENT_DATE - INTERVAL '7 days', '11:00', 'client-4', 'proj-4', 'contact-6', 'team-2', 'completed', 'Excellent - client very satisfied', 'Potential for future projects discussed', NOW() - INTERVAL '7 days'),
('act-6', 'meeting', 'Arts Program Site Visit', 'Visit to partner school to assess facility needs', CURRENT_DATE + INTERVAL '5 days', '10:00', 'client-5', 'proj-5', 'contact-7', 'team-1', 'scheduled', NULL, 'Meeting at Southside Elementary', NOW() - INTERVAL '1 day'),
('act-7', 'email', 'Website Design Revisions', 'Client feedback on homepage mockups', CURRENT_DATE - INTERVAL '15 days', '16:45', 'client-1', 'proj-1', 'contact-1', 'team-4', 'completed', 'Minor revisions requested', 'Revisions completed within 24 hours', NOW() - INTERVAL '15 days'),
('act-8', 'call', 'Volunteer Program Discussion', 'Discussed volunteer training needs', CURRENT_DATE - INTERVAL '30 days', '15:00', 'client-2', 'proj-7', 'contact-4', 'team-2', 'completed', 'On hold - needs board approval', 'Will revisit in Q2', NOW() - INTERVAL '30 days');

-- ============================================
-- 7. CASES (Case Management)
-- ============================================
INSERT INTO cases (id, title, description, client_id, assigned_to, status, priority, case_number, category, date_opened, date_closed, resolution, notes, created_at) VALUES
('case-1', 'Website Login Issues', 'Users reporting intermittent login failures on volunteer portal', 'client-1', 'team-4', 'open', 'high', 'CASE-2024-001', 'Technical Support', CURRENT_DATE - INTERVAL '5 days', NULL, NULL, 'Investigating database timeout issues', NOW() - INTERVAL '5 days'),
('case-2', 'Grant Application Assistance', 'Help needed with federal grant application', 'client-1', 'team-3', 'in_progress', 'high', 'CASE-2024-002', 'Consulting', CURRENT_DATE - INTERVAL '10 days', NULL, NULL, 'DOE grant - deadline approaching', NOW() - INTERVAL '10 days'),
('case-3', 'Social Media Strategy', 'Request for social media marketing guidance', 'client-2', 'team-5', 'resolved', 'medium', 'CASE-2024-003', 'Marketing', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '5 days', 'Comprehensive strategy delivered and approved', 'Client very satisfied with plan', NOW() - INTERVAL '30 days'),
('case-4', 'Donor Database Migration', 'Need help migrating donor records from old system', 'client-4', 'team-4', 'resolved', 'high', 'CASE-2024-004', 'Technical Support', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '15 days', 'Successfully migrated 5,000+ records with zero data loss', 'Exceeded client expectations', NOW() - INTERVAL '90 days'),
('case-5', 'Event Planning Support', 'Need comprehensive event planning for annual gala', 'client-3', 'team-1', 'in_progress', 'medium', 'CASE-2024-005', 'Event Planning', CURRENT_DATE - INTERVAL '7 days', NULL, NULL, '200+ expected attendees, $100K fundraising goal', NOW() - INTERVAL '7 days'),
('case-6', 'Branding Guidelines Request', 'Need help creating consistent brand identity', 'client-5', 'team-5', 'open', 'low', 'CASE-2024-006', 'Marketing', CURRENT_DATE - INTERVAL '3 days', NULL, NULL, 'Client has logo but needs full brand kit', NOW() - INTERVAL '3 days'),
('case-7', 'Volunteer Management System', 'Request for volunteer tracking solution', 'client-2', 'team-4', 'in_progress', 'medium', 'CASE-2024-007', 'Technical Support', CURRENT_DATE - INTERVAL '14 days', NULL, NULL, 'Exploring integration with existing systems', NOW() - INTERVAL '14 days');

-- ============================================
-- 8. CASE COMMENTS
-- ============================================
INSERT INTO case_comments (id, case_id, user_id, user_name, comment, created_at) VALUES
('cc-1', 'case-1', 'team-4', 'James Wilson', 'Initial investigation shows database connection pooling might be the issue. Running tests now.', NOW() - INTERVAL '4 days'),
('cc-2', 'case-1', 'team-2', 'Alex Rivera', 'Client reports issue is affecting 15-20% of login attempts. Priority increased to high.', NOW() - INTERVAL '3 days'),
('cc-3', 'case-1', 'team-4', 'James Wilson', 'Fixed connection timeout settings. Monitoring for 48 hours before closing case.', NOW() - INTERVAL '1 day'),
('cc-4', 'case-2', 'team-3', 'Priya Patel', 'Received all required documentation from client. Beginning narrative draft.', NOW() - INTERVAL '8 days'),
('cc-5', 'case-2', 'team-1', 'Frankie Mercurio', 'Reviewed draft - excellent work. Just a few minor edits needed.', NOW() - INTERVAL '5 days'),
('cc-6', 'case-5', 'team-1', 'Frankie Mercurio', 'Initial planning meeting scheduled for next week. Client is very excited!', NOW() - INTERVAL '6 days'),
('cc-7', 'case-7', 'team-4', 'James Wilson', 'Researching volunteer management platforms. Will present 3 options to client.', NOW() - INTERVAL '12 days');

-- ============================================
-- 9. DONATIONS
-- ============================================
INSERT INTO donations (id, amount, donor_name, donor_email, donor_phone, client_id, campaign, donation_date, payment_method, is_recurring, frequency, tax_receipt_sent, notes, created_at) VALUES
('don-1', 1000.00, 'John & Mary Smith', 'jsmith@email.com', '(555) 111-2222', 'client-1', 'Year-End Campaign', CURRENT_DATE - INTERVAL '5 days', 'credit_card', false, NULL, true, 'Thank you note sent', NOW() - INTERVAL '5 days'),
('don-2', 250.00, 'Robert Johnson', 'rjohnson@email.com', '(555) 222-3333', 'client-1', 'General Fund', CURRENT_DATE - INTERVAL '15 days', 'check', false, NULL, true, 'Regular donor', NOW() - INTERVAL '15 days'),
('don-3', 500.00, 'Green Valley Church', 'giving@greenvalley.org', '(555) 333-4444', 'client-3', 'Building Fund', CURRENT_DATE - INTERVAL '20 days', 'bank_transfer', false, NULL, true, 'Partnership donation', NOW() - INTERVAL '20 days'),
('don-4', 100.00, 'Susan Williams', 'swilliams@email.com', '(555) 444-5555', 'client-1', 'Youth Programs', CURRENT_DATE - INTERVAL '30 days', 'credit_card', true, 'monthly', true, 'Monthly sustainer since 2023', NOW() - INTERVAL '30 days'),
('don-5', 2500.00, 'Anderson Family Foundation', 'info@andersonfoundation.org', '(555) 555-6666', 'client-2', 'Environmental Programs', CURRENT_DATE - INTERVAL '45 days', 'check', false, NULL, true, 'Major gift - handwritten thank you sent', NOW() - INTERVAL '45 days'),
('don-6', 50.00, 'Michael Brown', 'mbrown@email.com', '(555) 666-7777', 'client-4', 'Food Security', CURRENT_DATE - INTERVAL '10 days', 'credit_card', true, 'weekly', true, 'Weekly donor', NOW() - INTERVAL '10 days'),
('don-7', 750.00, 'Clemson Business Association', 'info@clemsonbiz.org', '(555) 777-8888', 'client-5', 'Arts Education', CURRENT_DATE - INTERVAL '7 days', 'bank_transfer', false, NULL, false, 'Receipt requested - processing', NOW() - INTERVAL '7 days'),
('don-8', 5000.00, 'Anonymous', NULL, NULL, 'client-1', 'Capital Campaign', CURRENT_DATE - INTERVAL '60 days', 'wire_transfer', false, NULL, false, 'Donor wishes to remain anonymous', NOW() - INTERVAL '60 days'),
('don-9', 150.00, 'Jennifer Davis', 'jdavis@email.com', '(555) 888-9999', 'client-2', 'General Fund', CURRENT_DATE - INTERVAL '3 days', 'credit_card', false, NULL, true, 'First-time donor from social media campaign', NOW() - INTERVAL '3 days'),
('don-10', 300.00, 'Thomas Wilson', 'twilson@email.com', '(555) 999-0000', 'client-3', 'Family Services', CURRENT_DATE - INTERVAL '12 days', 'check', true, 'quarterly', true, 'Quarterly sustainer', NOW() - INTERVAL '12 days');

-- ============================================
-- 10. VOLUNTEERS
-- ============================================
INSERT INTO volunteers (id, first_name, last_name, email, phone, address, city, state, zip, skills, availability, status, assigned_projects, total_hours, notes, created_at) VALUES
('vol-1', 'Amanda', 'Taylor', 'ataylor@email.com', '(555) 121-2121', '111 Volunteer Lane', 'Seneca', 'SC', '29678', ARRAY['Teaching', 'Tutoring', 'Youth Programs'], 'Weekday Evenings, Weekends', 'Active', ARRAY['proj-1', 'proj-5'], 45, 'Background check completed', NOW() - INTERVAL '3 months'),
('vol-2', 'Christopher', 'Moore', 'cmoore@email.com', '(555) 232-3232', '222 Helper Street', 'Clemson', 'SC', '29631', ARRAY['Event Planning', 'Fundraising', 'Marketing'], 'Weekends Only', 'Active', ARRAY['proj-3'], 28, 'Great with event logistics', NOW() - INTERVAL '2 months'),
('vol-3', 'Emily', 'Anderson', 'eanderson@email.com', '(555) 343-4343', '333 Service Road', 'Westminster', 'SC', '29693', ARRAY['Food Service', 'Warehouse', 'Delivery'], 'Flexible', 'Active', ARRAY[], 67, 'Reliable - never missed a shift', NOW() - INTERVAL '6 months'),
('vol-4', 'Daniel', 'Martinez', 'dmartinez@email.com', '(555) 454-5454', '444 Community Ave', 'Walhalla', 'SC', '29691', ARRAY['Photography', 'Videography', 'Social Media'], 'Weekends, Some Evenings', 'Active', ARRAY['proj-2'], 15, 'Professional photographer - donated services', NOW() - INTERVAL '1 month'),
('vol-5', 'Olivia', 'White', 'owhite@email.com', '(555) 565-6565', '555 Kindness Blvd', 'Anderson', 'SC', '29621', ARRAY['Arts & Crafts', 'Teaching', 'Curriculum Development'], 'Weekday Afternoons', 'Active', ARRAY['proj-5'], 52, 'Art teacher at local high school', NOW() - INTERVAL '4 months'),
('vol-6', 'Ryan', 'Harris', 'rharris@email.com', '(555) 676-7676', '666 Giving Circle', 'Seneca', 'SC', '29678', ARRAY['IT Support', 'Web Development', 'Training'], 'Remote, Flexible', 'Active', ARRAY['proj-1'], 33, 'IT professional - helps with tech issues', NOW() - INTERVAL '5 months'),
('vol-7', 'Sophia', 'Clark', 'sclark@email.com', '(555) 787-8787', '777 Angel Way', 'Clemson', 'SC', '29631', ARRAY['Counseling', 'Case Management', 'Spanish Translation'], 'Weekday Mornings', 'Inactive', ARRAY[], 89, 'On leave - returning in 2 months', NOW() - INTERVAL '8 months'),
('vol-8', 'Ethan', 'Lewis', 'elewis@email.com', '(555) 898-9898', '888 Helper Heights', 'Westminster', 'SC', '29693', ARRAY['Gardening', 'Landscaping', 'Maintenance'], 'Weekends', 'Active', ARRAY[], 41, 'Maintains community garden', NOW() - INTERVAL '7 months');

-- ============================================
-- 11. EVENTS
-- ============================================
INSERT INTO events (id, title, description, client_id, event_date, location, capacity, registered_count, ticket_price, is_published, banner_image_url, schedule, ticket_types, volunteer_ids, notes, created_at) VALUES
('event-1', 'Hope Community Center Annual Gala', 'Black-tie fundraising gala featuring dinner, silent auction, and live entertainment', 'client-3', CURRENT_DATE + INTERVAL '60 days', 'The Grand Ballroom, Clemson', 250, 147, 150.00, true, 'https://example.com/gala-banner.jpg', 
'[{"id":"s1","time":"18:00","title":"Cocktail Hour","description":"Open bar and appetizers"},{"id":"s2","time":"19:00","title":"Dinner Service","description":"Three-course plated dinner"},{"id":"s3","time":"20:00","title":"Program & Auction","description":"Welcome address and silent auction closes"},{"id":"s4","time":"21:00","title":"Live Entertainment","description":"Local jazz band performance"}]'::jsonb,
'[{"id":"t1","name":"Individual Ticket","price":150,"description":"One dinner seat"},{"id":"t2","name":"Couple Package","price":275,"description":"Two dinner seats"},{"id":"t3","name":"VIP Table","price":2000,"description":"Premium table for 8 with wine service"}]'::jsonb,
ARRAY['vol-2', 'vol-4'], 'Expecting 200+ attendees, goal $100K raised', NOW() - INTERVAL '45 days'),

('event-2', 'Earth Day Community Cleanup', 'Join us for a morning of environmental action! Cleanup supplies and refreshments provided.', 'client-2', CURRENT_DATE + INTERVAL '30 days', 'Lake Hartwell State Park', 100, 67, 0.00, true, 'https://example.com/earth-day.jpg',
'[{"id":"s1","time":"08:00","title":"Check-in & Supplies","description":"Registration and equipment distribution"},{"id":"s2","time":"08:30","title":"Group Assignment","description":"Teams assigned to cleanup zones"},{"id":"s3","time":"09:00","title":"Cleanup Begins","description":"Beach and trail cleanup"},{"id":"s4","time":"12:00","title":"Lunch & Celebration","description":"Pizza lunch and awards for top collectors"}]'::jsonb,
'[{"id":"t1","name":"Free Registration","price":0,"description":"Open to all community members"}]'::jsonb,
ARRAY['vol-1', 'vol-3', 'vol-6', 'vol-8'], 'Partnership with SC Parks', NOW() - INTERVAL '20 days'),

('event-3', 'Youth Arts Showcase', 'Celebrating young artists! Student artwork exhibition and live performances.', 'client-5', CURRENT_DATE + INTERVAL '45 days', 'Arts for All Gallery, Anderson', 150, 89, 10.00, true, 'https://example.com/arts-showcase.jpg',
'[{"id":"s1","time":"14:00","title":"Doors Open","description":"Gallery viewing begins"},{"id":"s2","time":"15:00","title":"Student Performances","description":"Music, dance, and spoken word"},{"id":"s3","time":"16:00","title":"Awards Ceremony","description":"Recognition of outstanding young artists"},{"id":"s4","time":"17:00","title":"Reception","description":"Light refreshments and artist meet-and-greet"}]'::jsonb,
'[{"id":"t1","name":"General Admission","price":10,"description":"Includes gallery access and program"},{"id":"t2","name":"Student/Senior","price":5,"description":"Discounted rate with valid ID"},{"id":"t3","name":"Family Pack","price":25,"description":"Admission for up to 5 family members"}]'::jsonb,
ARRAY['vol-5', 'vol-7'], 'Featuring 50+ student artworks', NOW() - INTERVAL '30 days'),

('event-4', 'Food Bank Volunteer Orientation', 'Required orientation for new food bank volunteers. Learn about our mission and operations.', 'client-4', CURRENT_DATE + INTERVAL '7 days', 'Southside Food Bank Main Location', 30, 18, 0.00, true, NULL,
'[{"id":"s1","time":"18:00","title":"Welcome & Mission","description":"Introduction to food bank mission"},{"id":"s2","time":"18:30","title":"Facility Tour","description":"Tour of warehouse and distribution areas"},{"id":"s3","time":"19:00","title":"Volunteer Roles","description":"Overview of volunteer opportunities"},{"id":"s4","time":"19:30","title":"Q&A & Sign-up","description":"Questions and volunteer registration"}]'::jsonb,
'[{"id":"t1","name":"Free Orientation","price":0,"description":"Required for all new volunteers"}]'::jsonb,
ARRAY['vol-3'], 'Monthly recurring event', NOW() - INTERVAL '25 days');

-- ============================================
-- 12. EMAIL CAMPAIGNS
-- ============================================
INSERT INTO email_campaigns (id, name, subject, subject_line_b, body, recipient_segment, status, sent_date, schedule_date, stats, header_image_url, cta_button_text, cta_button_url, performance, notes, created_at) VALUES
('email-1', 'Year-End Giving Campaign', 'Your Gift Doubles Today! 🎁', 'Last Chance: Match Your Impact Before Midnight', '<h1>Make 2X the Impact</h1><p>Dear Friend,</p><p>Thanks to a generous matching donor, every gift you make today will be DOUBLED up to $50,000!</p><p>Your $100 gift becomes $200. Your $500 gift becomes $1,000. Together, we can reach our goal and serve even more families in need.</p>', 'All Active Donors', 'Sent', CURRENT_DATE - INTERVAL '5 days', NULL,
'{"sent": 2847, "opened": 1254, "clicked": 387, "unsubscribes": 8}'::jsonb,
'https://example.com/year-end-header.jpg', 'Make My Gift Today', 'https://donate.hopecc.org/year-end',
'{"opensOverTime": [{"hour": 0, "count": 45}, {"hour": 1, "count": 89}, {"hour": 2, "count": 124}, {"hour": 3, "count": 156}]}'::jsonb,
'44% open rate - exceeded expectations!', NOW() - INTERVAL '10 days'),

('email-2', 'Spring Newsletter - Hope Community Update', 'Spring at Hope: See What Your Support Made Possible 🌸', NULL, '<h1>Spring Newsletter</h1><p>Dear Hope Community,</p><p>As flowers bloom this spring, so does the impact of your generosity! This quarter:</p><ul><li>457 families received food assistance</li><li>89 youth participated in our after-school programs</li><li>23 job seekers found employment through our career center</li></ul><p>Thank you for making this possible!</p>', 'All Subscribers', 'Sent', CURRENT_DATE - INTERVAL '15 days', NULL,
'{"sent": 3124, "opened": 1497, "clicked": 423, "unsubscribes": 12}'::jsonb,
'https://example.com/spring-newsletter.jpg', 'Read Full Impact Report', 'https://hopecc.org/impact-report',
'{"opensOverTime": [{"hour": 0, "count": 67}, {"hour": 1, "count": 134}, {"hour": 2, "count": 201}]}'::jsonb,
'47.9% open rate!', NOW() - INTERVAL '20 days'),

('email-3', 'Earth Day Cleanup Event Invitation', 'Join Us for Earth Day! 🌍', NULL, '<h1>Celebrate Earth Day with Action</h1><p>Dear Environmental Champion,</p><p>Join Green Earth Alliance on April 22nd for our annual Earth Day Community Cleanup at Lake Hartwell State Park!</p><p>🗓 Saturday, April 22 • 8:00 AM - 1:00 PM<br/>📍 Lake Hartwell State Park<br/>🎯 Goal: Collect 500+ pounds of litter</p><p>Supplies, training, and lunch provided. Bring your enthusiasm and comfortable shoes!</p>', 'Event Interested', 'Scheduled', NULL, CURRENT_DATE + INTERVAL '3 days',
'{"sent": 0, "opened": 0, "clicked": 0, "unsubscribes": 0}'::jsonb,
'https://example.com/earth-day-invite.jpg', 'Register Now', 'https://greenearth.org/earth-day',
NULL, 'Scheduled to send 3 days before event', NOW() - INTERVAL '5 days'),

('email-4', 'Volunteer Opportunity: After-School Arts Program', 'Share Your Creativity: Arts Volunteers Needed', NULL, '<h1>Calling All Creative Souls!</h1><p>Arts for All Foundation is launching a new after-school program and we need YOU!</p><p>We''re seeking volunteers to teach:</p><ul><li>Drawing & Painting</li><li>Music & Performance</li><li>Crafts & Sculpture</li></ul><p>No teaching experience required - just passion for the arts and working with kids!</p><p>Time Commitment: 2 hours/week for 10 weeks</p>', 'Volunteer List', 'Draft', NULL, NULL,
'{"sent": 0, "opened": 0, "clicked": 0, "unsubscribes": 0}'::jsonb,
'https://example.com/volunteer-arts.jpg', 'Sign Up to Volunteer', 'https://artsforall.org/volunteer',
NULL, 'Awaiting final approval from director', NOW() - INTERVAL '2 days'),

('email-5', 'Food Bank Urgent Need: Summer Stock-Up', '🚨 URGENT: Help Us Stock Up for Summer', NULL, '<h1>Summer is Coming - And So Is Hunger</h1><p>Dear Supporter,</p><p>When school ends, childhood hunger doesn''t. Last summer, we served 40% more families as parents struggled to provide three meals a day.</p><p>We''re preparing now, but our shelves are only 60% full. We urgently need:</p><ul><li>Peanut butter & jelly</li><li>Canned fruits & vegetables</li><li>Cereal & pasta</li><li>Shelf-stable milk</li></ul><p>Every $1 provides 4 meals. Can you help us reach our $25,000 goal?</p>', 'Donor List', 'Draft', NULL, NULL,
'{"sent": 0, "opened": 0, "clicked": 0, "unsubscribes": 0}'::jsonb,
'https://example.com/summer-stockup.jpg', 'Make an Emergency Gift', 'https://southsidefb.org/donate',
NULL, 'Draft - needs manager approval', NOW() - INTERVAL '1 day');

-- ============================================
-- 13. DOCUMENTS
-- ============================================
INSERT INTO documents (id, name, category, related_id, file_type, file_size, file_url, uploaded_by, upload_date, last_accessed, access_count, notes, created_at) VALUES
(gen_random_uuid(), 'Hope CC - Website Design Mockups.pdf', 'Project', 'proj-1', 'pdf', 5242880, 'https://storage.example.com/docs/hope-mockups.pdf', 'team-4', NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days', 15, 'Final approved designs', NOW() - INTERVAL '25 days'),
(gen_random_uuid(), 'DOE Grant Application Draft.docx', 'Project', 'proj-6', 'docx', 2097152, 'https://storage.example.com/docs/doe-grant-draft.docx', 'team-3', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day', 8, 'Version 3 - almost final', NOW() - INTERVAL '8 days'),
(gen_random_uuid(), 'Green Earth Brand Guidelines.pdf', 'Client', 'client-2', 'pdf', 8388608, 'https://storage.example.com/docs/greenearth-brand.pdf', 'team-5', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days', 22, 'Reference for all marketing materials', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'Faith Family Gala Budget.xlsx', 'Project', 'proj-3', 'xlsx', 524288, 'https://storage.example.com/docs/gala-budget.xlsx', 'team-1', NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days', 6, 'Updated with venue quotes', NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'Volunteer Handbook 2024.pdf', 'Internal', 'team-1', 'pdf', 3145728, 'https://storage.example.com/docs/volunteer-handbook.pdf', 'team-2', NOW() - INTERVAL '60 days', NOW() - INTERVAL '7 days', 34, 'Required reading for all volunteers', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'Q1 2024 Financial Report.xlsx', 'Internal', 'team-1', 'xlsx', 1048576, 'https://storage.example.com/docs/q1-financials.xlsx', 'team-1', NOW() - INTERVAL '30 days', NOW() - INTERVAL '14 days', 18, 'Reviewed by accountant', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'Hope CC - Contract Amendment.pdf', 'Client', 'client-1', 'pdf', 786432, 'https://storage.example.com/docs/hope-amendment.pdf', 'team-1', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', 3, 'Signed by client 4/15', NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'Social Media Content Calendar.xlsx', 'Project', 'proj-2', 'xlsx', 614400, 'https://storage.example.com/docs/social-calendar.xlsx', 'team-5', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day', 12, 'Q2 content planned', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'Arts Program Curriculum Guide.docx', 'Project', 'proj-5', 'docx', 2621440, 'https://storage.example.com/docs/arts-curriculum.docx', 'team-5', NOW() - INTERVAL '35 days', NOW() - INTERVAL '8 days', 9, '12-week program outline', NOW() - INTERVAL '35 days'),
(gen_random_uuid(), 'Non-Profit Consulting Services Agreement.pdf', 'Template', 'team-1', 'pdf', 1572864, 'https://storage.example.com/docs/consulting-template.pdf', 'team-1', NOW() - INTERVAL '90 days', NOW() - INTERVAL '20 days', 27, 'Standard client agreement template', NOW() - INTERVAL '90 days');

-- ============================================
-- 14. CALENDAR EVENTS (from various activities/tasks)
-- ============================================
-- Calendar events are typically generated from activities and tasks,
-- but we can add a few standalone calendar items
INSERT INTO calendar_events (id, title, description, start_datetime, end_datetime, event_type, related_id, attendees, location, is_all_day, recurrence_rule, reminder_minutes, created_by, notes, created_at) VALUES
('cal-1', 'Weekly Team Standup', 'Weekly project status and planning meeting', CURRENT_DATE + INTERVAL '1 day' + TIME '09:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:00', 'meeting', NULL, ARRAY['team-1', 'team-2', 'team-3', 'team-4', 'team-5'], 'Zoom Meeting Room', false, 'FREQ=WEEKLY;BYDAY=TU', 15, 'team-1', 'Recurring weekly meeting', NOW() - INTERVAL '90 days'),
('cal-2', 'Hope CC Website Launch', 'Official launch of new website', CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE + INTERVAL '60 days', 'milestone', 'proj-1', ARRAY['team-1', 'team-2', 'team-4'], 'Virtual', true, NULL, 1440, 'team-2', 'Major project milestone', NOW() - INTERVAL '30 days'),
('cal-3', 'Grant Application Deadline', 'DOE grant must be submitted by 5 PM EST', CURRENT_DATE + INTERVAL '18 days', CURRENT_DATE + INTERVAL '18 days', 'deadline', 'proj-6', ARRAY['team-3', 'team-1'], 'Online Submission', false, NULL, 4320, 'team-3', 'CRITICAL DEADLINE - Do not miss!', NOW() - INTERVAL '10 days'),
('cal-4', 'Client Review: Arts Program', 'Present curriculum and program outline to client', CURRENT_DATE + INTERVAL '12 days' + TIME '14:00', CURRENT_DATE + INTERVAL '12 days' + TIME '15:30', 'meeting', 'proj-5', ARRAY['team-1', 'team-5'], 'Arts for All Office', false, NULL, 60, 'team-1', 'Bring printed curriculum guides', NOW() - INTERVAL '5 days'),
('cal-5', 'Professional Development: Grant Writing Workshop', 'Advanced grant writing techniques workshop', CURRENT_DATE + INTERVAL '25 days' + TIME '09:00', CURRENT_DATE + INTERVAL '25 days' + TIME '16:00', 'training', NULL, ARRAY['team-3'], 'Greenville Convention Center', false, NULL, 1440, 'team-3', 'Continuing education credits available', NOW() - INTERVAL '15 days');

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉🎉🎉 COMPREHENSIVE SAMPLE DATA CREATED SUCCESSFULLY! 🎉🎉🎉';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Data Summary:';
  RAISE NOTICE '  ✅ 5 Organizations (Clients)';
  RAISE NOTICE '  ✅ 8 Individual Contacts';
  RAISE NOTICE '  ✅ 5 Team Members';
  RAISE NOTICE '  ✅ 7 Projects (varied statuses)';
  RAISE NOTICE '  ✅ 11 Tasks (across multiple projects)';
  RAISE NOTICE '  ✅ 8 Activities (calls, meetings, emails)';
  RAISE NOTICE '  ✅ 7 Cases (various priorities)';
  RAISE NOTICE '  ✅ 7 Case Comments';
  RAISE NOTICE '  ✅ 10 Donations ($10,900 total)';
  RAISE NOTICE '  ✅ 8 Volunteers';
  RAISE NOTICE '  ✅ 4 Events';
  RAISE NOTICE '  ✅ 5 Email Campaigns';
  RAISE NOTICE '  ✅ 10 Documents';
  RAISE NOTICE '  ✅ 5 Calendar Events';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Your CRM is now fully populated and ready to explore!';
  RAISE NOTICE '🚀 Every menu item now has realistic sample data!';
  RAISE NOTICE '';
END $$;

COMMIT;
