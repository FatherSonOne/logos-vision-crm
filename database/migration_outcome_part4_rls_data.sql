-- ============================================
-- PHASE 8: OUTCOME MEASUREMENT - PART 4
-- RLS Policies and Sample Data
-- ============================================

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_snapshots ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES (if any)
DROP POLICY IF EXISTS "Allow all access to programs" ON programs;
DROP POLICY IF EXISTS "Allow all access to services" ON services;
DROP POLICY IF EXISTS "Allow all access to outcomes" ON outcomes;
DROP POLICY IF EXISTS "Allow all access to client_progress" ON client_progress;
DROP POLICY IF EXISTS "Allow all access to program_results" ON program_results;
DROP POLICY IF EXISTS "Allow all access to impact_snapshots" ON impact_snapshots;

-- CREATE PERMISSIVE POLICIES
CREATE POLICY "Allow all access to programs"
ON programs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to services"
ON services FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to outcomes"
ON outcomes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to client_progress"
ON client_progress FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to program_results"
ON program_results FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to impact_snapshots"
ON impact_snapshots FOR ALL USING (true) WITH CHECK (true);

-- INSERT SAMPLE PROGRAMS
INSERT INTO programs (name, description, category, program_type, duration_weeks, cost_per_participant, track_attendance, track_outcomes, outcome_types)
VALUES
    ('Job Readiness Training', 'Comprehensive employment preparation including resume writing, interview skills, and job search strategies', 'employment', 'cohort', 8, 500.00, true, true, '["employment", "income_increase"]'::JSONB),
    ('Emergency Housing Assistance', 'Short-term housing support and stabilization services', 'housing', 'one-time', NULL, 1500.00, false, true, '["housing_stable", "housing_obtained"]'::JSONB),
    ('Financial Literacy Workshop', 'Budgeting, saving, and financial planning skills', 'financial', 'cohort', 6, 200.00, true, true, '["financial_literacy", "savings_increase"]'::JSONB),
    ('GED Preparation', 'High school equivalency test preparation and tutoring', 'education', 'ongoing', 16, 800.00, true, true, '["education_complete", "credential_obtained"]'::JSONB),
    ('Health & Wellness Program', 'Physical and mental health support services', 'health', 'ongoing', NULL, 300.00, true, true, '["health_improved", "mental_health"]'::JSONB),
    ('Family Strengthening', 'Parenting skills and family support services', 'family', 'cohort', 12, 600.00, true, true, '["family_stability", "parenting_skills"]'::JSONB),
    ('Food Assistance', 'Food pantry and nutrition assistance', 'other', 'drop-in', NULL, 50.00, false, false, '[]'::JSONB),
    ('Case Management', 'Comprehensive case management and referral services', 'other', 'ongoing', NULL, 400.00, true, true, '["stability", "goal_achievement"]'::JSONB);

-- TABLE COMMENTS
COMMENT ON TABLE programs IS 'Defines programs and services offered by the organization';
COMMENT ON TABLE services IS 'Individual service delivery instances to clients';
COMMENT ON TABLE outcomes IS 'Measured outcomes and results for clients';
COMMENT ON TABLE client_progress IS 'Tracks client journey through programs';
COMMENT ON TABLE program_results IS 'Aggregated program performance metrics by period';
COMMENT ON TABLE impact_snapshots IS 'Point-in-time snapshots of organizational impact';
COMMENT ON FUNCTION calculate_program_results IS 'Calculates and stores program performance metrics for a period';
COMMENT ON FUNCTION create_impact_snapshot IS 'Creates a point-in-time snapshot of organizational impact';

-- DONE! Phase 8 database migration complete.
