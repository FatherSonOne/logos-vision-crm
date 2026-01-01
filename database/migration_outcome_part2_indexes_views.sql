-- ============================================
-- PHASE 8: OUTCOME MEASUREMENT - PART 2
-- Indexes and Views
-- ============================================

-- INDEXES
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

-- CLIENT OUTCOME SUMMARY VIEW
CREATE OR REPLACE VIEW client_outcome_summary AS
SELECT
    c.id AS client_id,
    c.name AS client_name,
    c.email AS client_email,
    COUNT(DISTINCT cp.program_id) AS programs_enrolled,
    COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.program_id END) AS programs_completed,
    COUNT(DISTINCT s.id) AS total_services,
    COALESCE(SUM(s.duration_minutes), 0) / 60.0 AS total_service_hours,
    MAX(s.service_date) AS last_service_date,
    COUNT(DISTINCT o.id) AS total_outcomes,
    COALESCE(SUM(o.impact_value), 0) AS total_impact_value,
    CASE
        WHEN COUNT(DISTINCT CASE WHEN cp.current_stage IN ('enrolled', 'active', 'completing') THEN cp.id END) > 0 THEN 'active'
        WHEN COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.id END) > 0 THEN 'graduated'
        ELSE 'inactive'
    END AS client_status,
    MIN(cp.enrollment_date) AS first_enrollment_date,
    MAX(cp.completion_date) AS last_completion_date
FROM clients c
LEFT JOIN client_progress cp ON cp.client_id = c.id
LEFT JOIN services s ON s.client_id = c.id
LEFT JOIN outcomes o ON o.client_id = c.id
GROUP BY c.id, c.name, c.email;

-- PROGRAM IMPACT SUMMARY VIEW
CREATE OR REPLACE VIEW program_impact_summary AS
SELECT
    p.id AS program_id,
    p.name AS program_name,
    p.category AS program_category,
    p.cost_per_participant,
    p.is_active,
    COUNT(DISTINCT cp.client_id) AS total_enrolled,
    COUNT(DISTINCT CASE WHEN cp.current_stage IN ('enrolled', 'active', 'completing') THEN cp.client_id END) AS currently_active,
    COUNT(DISTINCT CASE WHEN cp.completion_status = 'completed' THEN cp.client_id END) AS total_completed,
    ROUND(AVG(cp.attendance_rate), 1) AS avg_attendance_rate,
    COUNT(DISTINCT s.id) AS total_services,
    COALESCE(SUM(s.duration_minutes), 0) / 60.0 AS total_service_hours,
    COUNT(DISTINCT o.id) AS total_outcomes,
    COALESCE(SUM(o.impact_value), 0) AS total_impact_value,
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
    CASE
        WHEN COUNT(DISTINCT o.id) > 0
        THEN ROUND((p.cost_per_participant * COUNT(DISTINCT cp.client_id)) / COUNT(DISTINCT o.id), 2)
        ELSE 0
    END AS cost_per_outcome,
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

-- Done! Run Part 3 next (triggers and functions)
