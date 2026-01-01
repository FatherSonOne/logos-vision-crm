-- ============================================
-- PHASE 8: OUTCOME MEASUREMENT - PART 1
-- Tables Only
-- ============================================

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
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    program_type VARCHAR(100) DEFAULT 'ongoing',
    duration_weeks INTEGER,
    cost_per_participant DECIMAL(10, 2) DEFAULT 0,
    max_participants INTEGER,
    track_attendance BOOLEAN DEFAULT true,
    track_outcomes BOOLEAN DEFAULT true,
    outcome_types JSONB DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SERVICES TABLE
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    provider_id UUID,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OUTCOMES TABLE
CREATE TABLE outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    outcome_type VARCHAR(100) NOT NULL,
    outcome_category VARCHAR(100),
    before_value DECIMAL(15, 2),
    after_value DECIMAL(15, 2),
    before_status VARCHAR(100),
    after_status VARCHAR(100),
    impact_value DECIMAL(15, 2) DEFAULT 0,
    impact_description TEXT,
    outcome_date DATE NOT NULL,
    verified BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_date DATE,
    evidence_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLIENT PROGRESS TABLE
CREATE TABLE client_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL,
    enrollment_source VARCHAR(100),
    current_stage VARCHAR(100) DEFAULT 'enrolled',
    stage_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sessions_attended INTEGER DEFAULT 0,
    sessions_scheduled INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5, 2) DEFAULT 0,
    last_attendance_date DATE,
    completion_date DATE,
    completion_status VARCHAR(50),
    withdrawal_reason TEXT,
    outcomes_achieved INTEGER DEFAULT 0,
    primary_outcome_id UUID REFERENCES outcomes(id),
    at_risk BOOLEAN DEFAULT false,
    risk_factors JSONB DEFAULT '[]'::JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, program_id)
);

-- 5. PROGRAM RESULTS TABLE
CREATE TABLE program_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    enrolled_count INTEGER DEFAULT 0,
    active_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    withdrawn_count INTEGER DEFAULT 0,
    total_services INTEGER DEFAULT 0,
    avg_attendance_rate DECIMAL(5, 2) DEFAULT 0,
    total_service_hours DECIMAL(10, 2) DEFAULT 0,
    outcome_count INTEGER DEFAULT 0,
    total_impact_value DECIMAL(15, 2) DEFAULT 0,
    avg_impact_per_client DECIMAL(15, 2) DEFAULT 0,
    cost_per_outcome DECIMAL(10, 2) DEFAULT 0,
    cost_per_client DECIMAL(10, 2) DEFAULT 0,
    roi_percentage DECIMAL(8, 2) DEFAULT 0,
    completion_rate DECIMAL(5, 2) DEFAULT 0,
    avg_time_to_completion INTEGER,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id, period_type, period_start)
);

-- 6. IMPACT SNAPSHOTS TABLE
CREATE TABLE impact_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL,
    snapshot_type VARCHAR(50) DEFAULT 'daily',
    total_services INTEGER DEFAULT 0,
    total_service_hours DECIMAL(10, 2) DEFAULT 0,
    unique_clients_served INTEGER DEFAULT 0,
    total_enrollments INTEGER DEFAULT 0,
    active_enrollments INTEGER DEFAULT 0,
    completions_this_period INTEGER DEFAULT 0,
    total_outcomes INTEGER DEFAULT 0,
    outcomes_this_period INTEGER DEFAULT 0,
    total_impact_value DECIMAL(15, 2) DEFAULT 0,
    impact_this_period DECIMAL(15, 2) DEFAULT 0,
    employment_outcomes INTEGER DEFAULT 0,
    housing_outcomes INTEGER DEFAULT 0,
    education_outcomes INTEGER DEFAULT 0,
    health_outcomes INTEGER DEFAULT 0,
    financial_outcomes INTEGER DEFAULT 0,
    avg_cost_per_outcome DECIMAL(10, 2) DEFAULT 0,
    overall_completion_rate DECIMAL(5, 2) DEFAULT 0,
    summary_metrics JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(snapshot_date, snapshot_type)
);

-- Done! Run Part 2 next (indexes and views)
