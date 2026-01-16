-- ============================================
-- PHASE 8: OUTCOME MEASUREMENT - PART 3
-- Triggers and Functions
-- ============================================

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_outcome_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER FOR PROGRAMS
DROP TRIGGER IF EXISTS trigger_programs_updated_at ON programs;
CREATE TRIGGER trigger_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_outcome_updated_at();

-- TRIGGER FOR SERVICES
DROP TRIGGER IF EXISTS trigger_services_updated_at ON services;
CREATE TRIGGER trigger_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_outcome_updated_at();

-- TRIGGER FOR OUTCOMES
DROP TRIGGER IF EXISTS trigger_outcomes_updated_at ON outcomes;
CREATE TRIGGER trigger_outcomes_updated_at
    BEFORE UPDATE ON outcomes
    FOR EACH ROW
    EXECUTE FUNCTION update_outcome_updated_at();

-- TRIGGER FOR CLIENT PROGRESS
DROP TRIGGER IF EXISTS trigger_client_progress_updated_at ON client_progress;
CREATE TRIGGER trigger_client_progress_updated_at
    BEFORE UPDATE ON client_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_outcome_updated_at();

-- FUNCTION TO UPDATE CLIENT PROGRESS ATTENDANCE
CREATE OR REPLACE FUNCTION update_client_attendance()
RETURNS TRIGGER AS $$
BEGIN
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

-- FUNCTION TO UPDATE CLIENT OUTCOMES COUNT
CREATE OR REPLACE FUNCTION update_client_outcomes()
RETURNS TRIGGER AS $$
BEGIN
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

-- FUNCTION TO CALCULATE PROGRAM RESULTS
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
    SELECT cost_per_participant INTO v_cost_per_participant
    FROM programs WHERE id = p_program_id;

    SELECT
        COUNT(*) FILTER (WHERE enrollment_date <= p_period_end),
        COUNT(*) FILTER (WHERE current_stage IN ('enrolled', 'active', 'completing') AND enrollment_date <= p_period_end),
        COUNT(*) FILTER (WHERE completion_status = 'completed' AND completion_date BETWEEN p_period_start AND p_period_end),
        COUNT(*) FILTER (WHERE completion_status = 'withdrawn' AND completion_date BETWEEN p_period_start AND p_period_end)
    INTO v_enrolled, v_active, v_completed, v_withdrawn
    FROM client_progress
    WHERE program_id = p_program_id;

    SELECT
        COUNT(*),
        COALESCE(SUM(duration_minutes), 0) / 60.0
    INTO v_services, v_service_hours
    FROM services
    WHERE program_id = p_program_id
    AND service_date BETWEEN p_period_start AND p_period_end
    AND status = 'completed';

    SELECT COALESCE(AVG(attendance_rate), 0)
    INTO v_avg_attendance
    FROM client_progress
    WHERE program_id = p_program_id
    AND enrollment_date <= p_period_end;

    SELECT
        COUNT(*),
        COALESCE(SUM(impact_value), 0)
    INTO v_outcomes, v_impact
    FROM outcomes
    WHERE program_id = p_program_id
    AND outcome_date BETWEEN p_period_start AND p_period_end;

    v_completion_rate := CASE WHEN v_enrolled > 0 THEN (v_completed::NUMERIC / v_enrolled * 100) ELSE 0 END;
    v_cost_per_outcome := CASE WHEN v_outcomes > 0 THEN ((v_cost_per_participant * v_enrolled) / v_outcomes) ELSE 0 END;
    v_roi := CASE WHEN (v_cost_per_participant * v_enrolled) > 0 THEN (v_impact / (v_cost_per_participant * v_enrolled) * 100) ELSE 0 END;

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

-- FUNCTION TO CREATE IMPACT SNAPSHOT
CREATE OR REPLACE FUNCTION create_impact_snapshot(
    p_snapshot_date DATE DEFAULT CURRENT_DATE,
    p_snapshot_type VARCHAR(50) DEFAULT 'daily'
)
RETURNS UUID AS $$
DECLARE
    v_snapshot_id UUID;
    v_period_start DATE;
BEGIN
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
        (SELECT COUNT(*) FROM services WHERE status = 'completed'),
        (SELECT COALESCE(SUM(duration_minutes), 0) / 60.0 FROM services WHERE status = 'completed'),
        (SELECT COUNT(DISTINCT client_id) FROM services WHERE status = 'completed'),
        (SELECT COUNT(*) FROM client_progress),
        (SELECT COUNT(*) FROM client_progress WHERE current_stage IN ('enrolled', 'active', 'completing')),
        (SELECT COUNT(*) FROM client_progress WHERE completion_date BETWEEN v_period_start AND p_snapshot_date),
        (SELECT COUNT(*) FROM outcomes),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_date BETWEEN v_period_start AND p_snapshot_date),
        (SELECT COALESCE(SUM(impact_value), 0) FROM outcomes),
        (SELECT COALESCE(SUM(impact_value), 0) FROM outcomes WHERE outcome_date BETWEEN v_period_start AND p_snapshot_date),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'employment'),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'housing'),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'education'),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'health'),
        (SELECT COUNT(*) FROM outcomes WHERE outcome_category = 'financial'),
        (SELECT CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(cost_per_outcome), 0) / COUNT(*) ELSE 0 END FROM program_results),
        (SELECT CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE completion_status = 'completed')::NUMERIC / COUNT(*) * 100) ELSE 0 END FROM client_progress),
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

-- Done! Run Part 4 next (RLS and sample data)
