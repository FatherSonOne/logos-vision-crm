-- ============================================
-- PHASE 8: OUTCOME MEASUREMENT
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this entire script in order.

-- 0. DROP EXISTING OBJECTS (to ensure clean state)
DROP VIEW IF EXISTS program_impact_summary CASCADE;
DROP VIEW IF EXISTS client_outcome_summary CASCADE;
DROP TABLE IF EXISTS impact_snapshots CASCADE;
DROP TABLE IF EXISTS program_results CASCADE;
DROP TABLE IF EXISTS client_progress CASCADE;
DROP TABLE IF EXISTS outcomes CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS programs CASCADE;

-- 1. PROGRAMS TABLE
-- Defines programs/services offered by the organization
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'employment', 'housing', 'education', 'health', 'financial', 'family', 'other'
    program_type VARCHAR(100) DEFAULT 'ongoing', -- 'one-time', 'ongoing', 'cohort', 'drop-in'
    duration_weeks INTEGER, -- Expected duration in weeks (NULL for ongoing)
    cost_per_participant DECIMAL(10, 2) DEFAULT 0,
    max_participants INTEGER,
    -- Tracking settings
    track_attendance BOOLEAN DEFAULT true,
    track_outcomes BOOLEAN DEFAULT true,
    outcome_types JSONB DEFAULT '[]'::JSONB, -- Array of outcome types this program measures
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SERVICES TABLE
-- Tracks individual service delivery instances
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    -- Service details
    service_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- 'session', 'class', 'meeting', 'workshop', 'assessment', 'follow-up'
    duration_minutes INTEGER DEFAULT 60,
    -- Status
    status VARCHAR(50) DEFAULT 'completed', -- 'scheduled', 'completed', 'cancelled', 'no-show'
    -- Notes
    notes TEXT,
    provider_id UUID, -- team member who delivered service
    location VARCHAR(255),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OUTCOMES TABLE
-- Tracks measured outcomes/results for clients
CREATE TABLE outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    -- Outcome details
    outcome_type VARCHAR(100) NOT NULL, -- 'employment', 'income_increase', 'housing_stable', 'education_complete', 'health_improved', etc.
    outcome_category VARCHAR(100), -- 'employment', 'housing', 'education', 'health', 'financial', 'family'
    -- Measurement
    before_value DECIMAL(15, 2),
    after_value DECIMAL(15, 2),
    before_status VARCHAR(100),
    after_status VARCHAR(100),
    -- Calculated impact
    impact_value DECIMAL(15, 2) DEFAULT 0, -- Dollar value of impact
    impact_description TEXT,
    -- Verification
    outcome_date DATE NOT NULL,
    verified BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_date DATE,
    -- Evidence
    evidence_notes TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLIENT PROGRESS TABLE
-- Tracks client journey through programs
CREATE TABLE client_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    -- Enrollment
    enrollment_date DATE NOT NULL,
    enrollment_source VARCHAR(100), -- 'referral', 'self', 'outreach', 'partner'
    -- Progress tracking
    current_stage VARCHAR(100) DEFAULT 'enrolled', -- 'enrolled', 'active', 'completing', 'completed', 'graduated', 'withdrawn', 'on-hold'
    stage_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Attendance
    sessions_attended INTEGER DEFAULT 0,
    sessions_scheduled INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5, 2) DEFAULT 0,
    last_attendance_date DATE,
    -- Completion
    completion_date DATE,
    completion_status VARCHAR(50), -- 'completed', 'graduated', 'withdrawn', 'transferred', 'inactive'
    withdrawal_reason TEXT,
    -- Outcomes
    outcomes_achieved INTEGER DEFAULT 0,
    primary_outcome_id UUID REFERENCES outcomes(id),
    -- Risk tracking
    at_risk BOOLEAN DEFAULT false,
    risk_factors JSONB DEFAULT '[]'::JSONB,
    -- Notes
    notes TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Unique constraint
    UNIQUE(client_id, program_id)
);

-- 5. PROGRAM RESULTS TABLE
-- Aggregated program performance metrics by period
CREATE TABLE program_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    -- Period
    period_type VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    -- Enrollment metrics
    enrolled_count INTEGER DEFAULT 0,
    active_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    withdrawn_count INTEGER DEFAULT 0,
    -- Attendance metrics
    total_services INTEGER DEFAULT 0,
    avg_attendance_rate DECIMAL(5, 2) DEFAULT 0,
    total_service_hours DECIMAL(10, 2) DEFAULT 0,
    -- Outcome metrics
    outcome_count INTEGER DEFAULT 0,
    total_impact_value DECIMAL(15, 2) DEFAULT 0,
    avg_impact_per_client DECIMAL(15, 2) DEFAULT 0,
    -- Efficiency metrics
    cost_per_outcome DECIMAL(10, 2) DEFAULT 0,
    cost_per_client DECIMAL(10, 2) DEFAULT 0,
    roi_percentage DECIMAL(8, 2) DEFAULT 0,
    -- Completion metrics
    completion_rate DECIMAL(5, 2) DEFAULT 0,
    avg_time_to_completion INTEGER, -- days
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Unique constraint
    UNIQUE(program_id, period_type, period_start)
);

-- 6. IMPACT SNAPSHOTS TABLE
-- Point-in-time snapshots of overall organizational impact
CREATE TABLE impact_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL,
    snapshot_type VARCHAR(50) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    -- Service metrics
    total_services INTEGER DEFAULT 0,
    total_service_hours DECIMAL(10, 2) DEFAULT 0,
    unique_clients_served INTEGER DEFAULT 0,
    -- Enrollment metrics
    total_enrollments INTEGER DEFAULT 0,
    active_enrollments INTEGER DEFAULT 0,
    completions_this_period INTEGER DEFAULT 0,
    -- Outcome metrics
    total_outcomes INTEGER DEFAULT 0,
    outcomes_this_period INTEGER DEFAULT 0,
    total_impact_value DECIMAL(15, 2) DEFAULT 0,
    impact_this_period DECIMAL(15, 2) DEFAULT 0,
    -- Key outcomes breakdown
    employment_outcomes INTEGER DEFAULT 0,
    housing_outcomes INTEGER DEFAULT 0,
    education_outcomes INTEGER DEFAULT 0,
    health_outcomes INTEGER DEFAULT 0,
    financial_outcomes INTEGER DEFAULT 0,
    -- Efficiency metrics
    avg_cost_per_outcome DECIMAL(10, 2) DEFAULT 0,
    overall_completion_rate DECIMAL(5, 2) DEFAULT 0,
    -- Summary
    summary_metrics JSONB DEFAULT '{}'::JSONB,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Unique constraint
    UNIQUE(snapshot_date, snapshot_type)
);

-- 7. CREATE CLIENT OUTCOME SUMMARY VIEW
CREATE OR REPLACE VIEW client_outcome_summary AS
SELECT
    c.id AS client_id,
    c.name AS client_name,
    c.email AS client_email,
    -- Program enrollment
    COUNT(DISTINCT cp.program_id) AS programs_enrolled,
    COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.program_id END) AS programs_completed,
    -- Services received
    COUNT(DISTINCT s.id) AS total_services,
    COALESCE(SUM(s.duration_minutes), 0) / 60.0 AS total_service_hours,
    MAX(s.service_date) AS last_service_date,
    -- Outcomes achieved
    COUNT(DISTINCT o.id) AS total_outcomes,
    COALESCE(SUM(o.impact_value), 0) AS total_impact_value,
    -- Status
    CASE
        WHEN COUNT(DISTINCT CASE WHEN cp.current_stage IN ('enrolled', 'active', 'completing') THEN cp.id END) > 0 THEN 'active'
        WHEN COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.id END) > 0 THEN 'graduated'
        ELSE 'inactive'
    END AS client_status,
    -- Dates
    MIN(cp.enrollment_date) AS first_enrollment_date,
    MAX(cp.completion_date) AS last_completion_date
FROM clients c
LEFT JOIN client_progress cp ON cp.client_id = c.id
LEFT JOIN services s ON s.client_id = c.id
LEFT JOIN outcomes o ON o.client_id = c.id
GROUP BY c.id, c.name, c.email;

-- 8. CREATE PROGRAM IMPACT SUMMARY VIEW
CREATE OR REPLACE VIEW program_impact_summary AS
SELECT
    p.id AS program_id,
    p.name AS program_name,
    p.category AS program_category,
    p.cost_per_participant,
    p.is_active,
    -- Enrollment
    COUNT(DISTINCT cp.client_id) AS total_enrolled,
    COUNT(DISTINCT CASE WHEN cp.current_stage IN ('enrolled', 'active', 'completing') THEN cp.client_id END) AS currently_active,
    COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.client_id END) AS total_completed,
    -- Attendance
    ROUND(AVG(cp.attendance_rate), 1) AS avg_attendance_rate,
    -- Services
    COUNT(DISTINCT s.id) AS total_services,
    COALESCE(SUM(s.duration_minutes), 0) / 60.0 AS total_service_hours,
    -- Outcomes
    COUNT(DISTINCT o.id) AS total_outcomes,
    COALESCE(SUM(o.impact_value), 0) AS total_impact_value,
    -- Rates
    CASE
        WHEN COUNT(DISTINCT cp.client_id) > 0
        THEN ROUND((COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.client_id END)::NUMERIC / COUNT(DISTINCT cp.client_id) * 100), 1)
        ELSE 0
    END AS completion_rate,
    CASE
        WHEN COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.client_id END) > 0
        THEN ROUND((COUNT(DISTINCT o.id)::NUMERIC / COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.client_id END)), 2)
        ELSE 0
    END AS outcomes_per_graduate,
    -- Cost efficiency
    CASE
        WHEN COUNT(DISTINCT o.id) > 0
        THEN ROUND((p.cost_per_participant * COUNT(DISTINCT cp.client_id)) / COUNT(DISTINCT o.id), 2)
        ELSE 0
    END AS cost_per_outcome,
    -- ROI
    CASE
        WHEN (p.cost_per_participant * COUNT(DISTINCT cp.client_id)) > 0
        THEN ROUND((COALESCE(SUM(o.impact_value), 0) / (p.cost_per_participant * COUNT(DISTINCT cp.client_id)) * 100), 1)
        ELSE 0
    END AS roi_percentage
FROM programs p
LEFT JOIN client_progress cp ON cp.program_id = p.id
LEFT JOIN services s ON s.program_id = p.id
LEFT JOIN outcomes o ON o.program_id = p.id
GROUP BY p.id, p.name, p.category, p.cost_per_participant, p.is_active;

-- 9. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active);
CREATE INDEX IF NOT EXISTS idx_services_client ON services(client_id);
CREATE INDEX IF NOT EXISTS idx_services_program ON services(program_id);
CREATE INDEX IF NOT EXISTS idx_services_date ON services(service_date);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_outcomes_client ON outcomes(client_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_program ON outcomes(program_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_type ON outcomes(outcome_type);
CREATE INDEX IF NOT EXISTS idx_outcomes_date ON outcomes(outcome_date);
CREATE INDEX IF NOT EXISTS idx_client_progress_client ON client_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_program ON client_progress(program_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_stage ON client_progress(current_stage);
CREATE INDEX IF NOT EXISTS idx_program_results_program ON program_results(program_id);
CREATE INDEX IF NOT EXISTS idx_program_results_period ON program_results(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_impact_snapshots_date ON impact_snapshots(snapshot_date);

-- 10. ADD TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_outcome_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_programs_updated_at ON programs;
CREATE TRIGGER trigger_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_outcome_updated_at();

DROP TRIGGER IF EXISTS trigger_services_updated_at ON services;
CREATE TRIGGER trigger_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_outcome_updated_at();

DROP TRIGGER IF EXISTS trigger_outcomes_updated_at ON outcomes;
CREATE TRIGGER trigger_outcomes_updated_at
    BEFORE UPDATE ON outcomes
    FOR EACH ROW
    EXECUTE FUNCTION update_outcome_updated_at();

DROP TRIGGER IF EXISTS trigger_client_progress_updated_at ON client_progress;
CREATE TRIGGER trigger_client_progress_updated_at
    BEFORE UPDATE ON client_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_outcome_updated_at();

-- 11. FUNCTION TO UPDATE CLIENT PROGRESS ATTENDANCE
CREATE OR REPLACE FUNCTION update_client_attendance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update attendance stats when a service is recorded
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE client_progress
        SET
            sessions_attended = (
                SELECT COUNT(*) FROM services
                WHERE client_id = NEW.client_id
                AND program_id = NEW.program_id
                AND status = 'completed'
            ),
            last_attendance_date = NEW.service_date,
            attendance_rate = CASE
                WHEN sessions_scheduled > 0
                THEN ROUND((
                    SELECT COUNT(*)::NUMERIC FROM services
                    WHERE client_id = NEW.client_id
                    AND program_id = NEW.program_id
                    AND status = 'completed'
                ) / sessions_scheduled * 100, 1)
                ELSE 0
            END,
            updated_at = NOW()
        WHERE client_id = NEW.client_id AND program_id = NEW.program_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_attendance ON services;
CREATE TRIGGER trigger_update_attendance
    AFTER INSERT OR UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_client_attendance();

-- 12. FUNCTION TO UPDATE CLIENT OUTCOMES COUNT
CREATE OR REPLACE FUNCTION update_client_outcomes()
RETURNS TRIGGER AS $$
BEGIN
    -- Update outcomes count when an outcome is recorded
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE client_progress
        SET
            outcomes_achieved = (
                SELECT COUNT(*) FROM outcomes
                WHERE client_id = NEW.client_id
                AND program_id = NEW.program_id
            ),
            updated_at = NOW()
        WHERE client_id = NEW.client_id AND program_id = NEW.program_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_outcomes ON outcomes;
CREATE TRIGGER trigger_update_outcomes
    AFTER INSERT OR UPDATE ON outcomes
    FOR EACH ROW
    WHEN (NEW.program_id IS NOT NULL)
    EXECUTE FUNCTION update_client_outcomes();

-- 13. FUNCTION TO CALCULATE PROGRAM RESULTS
CREATE OR REPLACE FUNCTION calculate_program_results(
    p_program_id UUID,
    p_period_type VARCHAR(20),
    p_period_start DATE,
    p_period_end DATE
)
RETURNS UUID AS $$
DECLARE
    v_result_id UUID;
    v_enrolled INTEGER;
    v_active INTEGER;
    v_completed INTEGER;
    v_withdrawn INTEGER;
    v_services INTEGER;
    v_service_hours DECIMAL;
    v_avg_attendance DECIMAL;
    v_outcomes INTEGER;
    v_impact DECIMAL;
    v_cost_per_participant DECIMAL;
    v_completion_rate DECIMAL;
    v_cost_per_outcome DECIMAL;
    v_roi DECIMAL;
BEGIN
    -- Get program cost
    SELECT cost_per_participant INTO v_cost_per_participant
    FROM programs WHERE id = p_program_id;

    -- Calculate enrollment metrics
    SELECT
        COUNT(*) FILTER (WHERE enrollment_date <= p_period_end),
        COUNT(*) FILTER (WHERE current_stage IN ('enrolled', 'active', 'completing') AND enrollment_date <= p_period_end),
        COUNT(*) FILTER (WHERE completion_status = 'completed' AND completion_date BETWEEN p_period_start AND p_period_end),
        COUNT(*) FILTER (WHERE completion_status = 'withdrawn' AND completion_date BETWEEN p_period_start AND p_period_end)
    INTO v_enrolled, v_active, v_completed, v_withdrawn
    FROM client_progress
    WHERE program_id = p_program_id;

    -- Calculate service metrics
    SELECT
        COUNT(*),
        COALESCE(SUM(duration_minutes), 0) / 60.0
    INTO v_services, v_service_hours
    FROM services
    WHERE program_id = p_program_id
    AND service_date BETWEEN p_period_start AND p_period_end
    AND status = 'completed';

    -- Calculate attendance rate
    SELECT COALESCE(AVG(attendance_rate), 0)
    INTO v_avg_attendance
    FROM client_progress
    WHERE program_id = p_program_id
    AND enrollment_date <= p_period_end;

    -- Calculate outcome metrics
    SELECT
        COUNT(*),
        COALESCE(SUM(impact_value), 0)
    INTO v_outcomes, v_impact
    FROM outcomes
    WHERE program_id = p_program_id
    AND outcome_date BETWEEN p_period_start AND p_period_end;

    -- Calculate rates
    v_completion_rate := CASE WHEN v_enrolled > 0 THEN (v_completed::NUMERIC / v_enrolled * 100) ELSE 0 END;
    v_cost_per_outcome := CASE WHEN v_outcomes > 0 THEN ((v_cost_per_participant * v_enrolled) / v_outcomes) ELSE 0 END;
    v_roi := CASE WHEN (v_cost_per_participant * v_enrolled) > 0 THEN (v_impact / (v_cost_per_participant * v_enrolled) * 100) ELSE 0 END;

    -- Insert or update result
    INSERT INTO program_results (
        program_id, period_type, period_start, period_end,
        enrolled_count, active_count, completed_count, withdrawn_count,
        total_services, avg_attendance_rate, total_service_hours,
        outcome_count, total_impact_value, avg_impact_per_client,
        cost_per_outcome, cost_per_client, roi_percentage,
        completion_rate, calculated_at
    ) VALUES (
        p_program_id, p_period_type, p_period_start, p_period_end,
        v_enrolled, v_active, v_completed, v_withdrawn,
        v_services, v_avg_attendance, v_service_hours,
        v_outcomes, v_impact, CASE WHEN v_enrolled > 0 THEN v_impact / v_enrolled ELSE 0 END,
        v_cost_per_outcome, v_cost_per_participant, v_roi,
        v_completion_rate, NOW()
    )
    ON CONFLICT (program_id, period_type, period_start) DO UPDATE
    SET
        period_end = EXCLUDED.period_end,
        enrolled_count = EXCLUDED.enrolled_count,
        active_count = EXCLUDED.active_count,
        completed_count = EXCLUDED.completed_count,
        withdrawn_count = EXCLUDED.withdrawn_count,
        total_services = EXCLUDED.total_services,
        avg_attendance_rate = EXCLUDED.avg_attendance_rate,
        total_service_hours = EXCLUDED.total_service_hours,
        outcome_count = EXCLUDED.outcome_count,
        total_impact_value = EXCLUDED.total_impact_value,
        avg_impact_per_client = EXCLUDED.avg_impact_per_client,
        cost_per_outcome = EXCLUDED.cost_per_outcome,
        cost_per_client = EXCLUDED.cost_per_client,
        roi_percentage = EXCLUDED.roi_percentage,
        completion_rate = EXCLUDED.completion_rate,
        calculated_at = NOW()
    RETURNING id INTO v_result_id;

    RETURN v_result_id;
END;
$$ LANGUAGE plpgsql;

-- 14. FUNCTION TO CREATE IMPACT SNAPSHOT
CREATE OR REPLACE FUNCTION create_impact_snapshot(
    p_snapshot_date DATE DEFAULT CURRENT_DATE,
    p_snapshot_type VARCHAR(50) DEFAULT 'daily'
)
RETURNS UUID AS $$
DECLARE
    v_snapshot_id UUID;
    v_period_start DATE;
BEGIN
    -- Determine period start based on type
    CASE p_snapshot_type
        WHEN 'daily' THEN v_period_start := p_snapshot_date;
        WHEN 'weekly' THEN v_period_start := p_snapshot_date - INTERVAL '7 days';
        WHEN 'monthly' THEN v_period_start := date_trunc('month', p_snapshot_date)::DATE;
        WHEN 'quarterly' THEN v_period_start := date_trunc('quarter', p_snapshot_date)::DATE;
        WHEN 'yearly' THEN v_period_start := date_trunc('year', p_snapshot_date)::DATE;
        ELSE v_period_start := p_snapshot_date;
    END CASE;

    INSERT INTO impact_snapshots (
        snapshot_date, snapshot_type,
        total_services, total_service_hours, unique_clients_served,
        total_enrollments, active_enrollments, completions_this_period,
        total_outcomes, outcomes_this_period, total_impact_value, impact_this_period,
        employment_outcomes, housing_outcomes, education_outcomes, health_outcomes, financial_outcomes,
        avg_cost_per_outcome, overall_completion_rate,
        summary_metrics
    )
    SELECT
        p_snapshot_date,
        p_snapshot_type,
        -- Service metrics (all time)
        (SELECT COUNT(*) FROM services WHERE status = 'completed'),
        (SELECT COALESCE(SUM(duration_minutes), 0) / 60.0 FROM services WHERE status = 'completed'),
        (SELECT COUNT(DISTINCT client_id) FROM services WHERE status = 'completed'),
        -- Enrollment metrics
        (SELECT COUNT(*) FROM client_progress),
        (SELECT COUNT(*) FROM client_progress WHERE current_stage IN ('enrolled', 'active', 'completing')),
        (SELECT COUNT(*) FROM client_progress WHERE completion_date BETWEEN v_period_start AND p_snapshot_date),
        -- Outcome metrics (all time)
        (SELECT COUNT(*) FROM outcomes),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_date BETWEEN v_period_start AND p_snapshot_date),
        (SELECT COALESCE(SUM(impact_value), 0) FROM outcomes),
        (SELECT COALESCE(SUM(impact_value), 0) FROM outcomes WHERE outcome_date BETWEEN v_period_start AND p_snapshot_date),
        -- Outcome breakdown
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'employment'),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'housing'),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'education'),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'health'),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'financial'),
        -- Efficiency metrics
        (SELECT CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(cost_per_outcome), 0) / COUNT(*) ELSE 0 END FROM program_results),
        (SELECT CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE completion_status = 'completed')::NUMERIC / COUNT(*) * 100) ELSE 0 END FROM client_progress),
        -- Summary
        jsonb_build_object(
            'snapshot_date', p_snapshot_date,
            'snapshot_type', p_snapshot_type,
            'generated_at', NOW()
        )
    ON CONFLICT (snapshot_date, snapshot_type) DO UPDATE
    SET
        total_services = EXCLUDED.total_services,
        total_service_hours = EXCLUDED.total_service_hours,
        unique_clients_served = EXCLUDED.unique_clients_served,
        total_enrollments = EXCLUDED.total_enrollments,
        active_enrollments = EXCLUDED.active_enrollments,
        completions_this_period = EXCLUDED.completions_this_period,
        total_outcomes = EXCLUDED.total_outcomes,
        outcomes_this_period = EXCLUDED.outcomes_this_period,
        total_impact_value = EXCLUDED.total_impact_value,
        impact_this_period = EXCLUDED.impact_this_period,
        employment_outcomes = EXCLUDED.employment_outcomes,
        housing_outcomes = EXCLUDED.housing_outcomes,
        education_outcomes = EXCLUDED.education_outcomes,
        health_outcomes = EXCLUDED.health_outcomes,
        financial_outcomes = EXCLUDED.financial_outcomes,
        avg_cost_per_outcome = EXCLUDED.avg_cost_per_outcome,
        overall_completion_rate = EXCLUDED.overall_completion_rate,
        summary_metrics = EXCLUDED.summary_metrics
    RETURNING id INTO v_snapshot_id;

    RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- 15. ENABLE ROW LEVEL SECURITY
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_snapshots ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
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

-- 16. INSERT SAMPLE PROGRAMS
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

-- 17. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE programs IS 'Defines programs and services offered by the organization';
COMMENT ON TABLE services IS 'Individual service delivery instances to clients';
COMMENT ON TABLE outcomes IS 'Measured outcomes and results for clients';
COMMENT ON TABLE client_progress IS 'Tracks client journey through programs';
COMMENT ON TABLE program_results IS 'Aggregated program performance metrics by period';
COMMENT ON TABLE impact_snapshots IS 'Point-in-time snapshots of organizational impact';
COMMENT ON FUNCTION calculate_program_results IS 'Calculates and stores program performance metrics for a period';
COMMENT ON FUNCTION create_impact_snapshot IS 'Creates a point-in-time snapshot of organizational impact';
