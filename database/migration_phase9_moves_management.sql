-- ============================================
-- PHASE 9: MOVES MANAGEMENT / DONOR CULTIVATION
-- Logos Vision CRM
-- ============================================

-- This migration creates the moves management system for tracking
-- donor relationships through cultivation stages.

-- 0. DROP EXISTING OBJECTS (for clean state)
DROP VIEW IF EXISTS donor_pipeline_summary CASCADE;
DROP VIEW IF EXISTS cultivation_activity_summary CASCADE;
DROP TABLE IF EXISTS touchpoints CASCADE;
DROP TABLE IF EXISTS cultivation_tasks CASCADE;
DROP TABLE IF EXISTS cultivation_plans CASCADE;
DROP TABLE IF EXISTS donor_moves CASCADE;

-- 1. DONOR MOVES TABLE
-- Tracks a donor's current position in the cultivation pipeline
CREATE TABLE donor_moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    -- Current Stage
    current_stage VARCHAR(50) NOT NULL DEFAULT 'identification', -- 'identification', 'qualification', 'cultivation', 'solicitation', 'stewardship', 'lapsed'
    stage_entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    previous_stage VARCHAR(50),
    -- Donor Classification
    donor_type VARCHAR(50) DEFAULT 'prospect', -- 'prospect', 'first-time', 'repeat', 'major', 'legacy', 'corporate', 'foundation'
    giving_capacity VARCHAR(50), -- 'low' (<$1k), 'medium' ($1k-$10k), 'high' ($10k-$100k), 'major' (>$100k)
    affinity_score INTEGER DEFAULT 0, -- 0-100 scale of connection to mission
    -- Assigned Manager
    assigned_to UUID, -- team member managing this relationship
    -- Target/Goal
    target_gift_amount DECIMAL(15, 2),
    target_gift_date DATE,
    target_gift_type VARCHAR(50), -- 'one-time', 'recurring', 'pledge', 'planned-gift', 'in-kind'
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    -- Notes
    notes TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- One active move record per client
    UNIQUE(client_id)
);

-- 2. CULTIVATION PLANS TABLE
-- Strategic plans for cultivating specific donors
CREATE TABLE cultivation_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_move_id UUID NOT NULL REFERENCES donor_moves(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    -- Plan Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy TEXT, -- Overall cultivation strategy
    -- Timeline
    start_date DATE NOT NULL,
    target_completion_date DATE,
    actual_completion_date DATE,
    -- Goal
    goal_description TEXT,
    goal_amount DECIMAL(15, 2),
    goal_type VARCHAR(50), -- 'first-gift', 'upgrade', 'major-gift', 'recurring', 'planned-gift', 'retention'
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'paused', 'completed', 'cancelled'
    -- Success Metrics
    success_criteria TEXT,
    outcome_notes TEXT,
    was_successful BOOLEAN,
    -- Assigned
    created_by UUID,
    assigned_to UUID,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CULTIVATION TASKS TABLE
-- Specific tasks within a cultivation plan
CREATE TABLE cultivation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cultivation_plan_id UUID NOT NULL REFERENCES cultivation_plans(id) ON DELETE CASCADE,
    -- Task Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'event-invite', 'tour', 'gift', 'research', 'proposal', 'follow-up', 'other'
    -- Scheduling
    due_date DATE,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'scheduled', 'in-progress', 'completed', 'cancelled', 'deferred'
    priority VARCHAR(20) DEFAULT 'medium',
    -- Assignment
    assigned_to UUID,
    -- Order
    sequence_order INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TOUCHPOINTS TABLE
-- Records all interactions with donors
CREATE TABLE touchpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    donor_move_id UUID REFERENCES donor_moves(id) ON DELETE SET NULL,
    cultivation_plan_id UUID REFERENCES cultivation_plans(id) ON DELETE SET NULL,
    cultivation_task_id UUID REFERENCES cultivation_tasks(id) ON DELETE SET NULL,
    -- Touchpoint Details
    touchpoint_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'event', 'tour', 'gift-sent', 'letter', 'social-media', 'visit', 'thank-you', 'proposal', 'other'
    touchpoint_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    direction VARCHAR(20) DEFAULT 'outbound', -- 'inbound', 'outbound'
    -- Content
    subject VARCHAR(255),
    description TEXT,
    outcome TEXT,
    -- Sentiment/Quality
    sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
    engagement_level VARCHAR(20), -- 'high', 'medium', 'low', 'none'
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    -- Recording
    recorded_by UUID,
    -- Related Items
    related_donation_id UUID,
    related_activity_id UUID,
    -- Attachments (stored as JSON array of URLs/paths)
    attachments JSONB DEFAULT '[]'::JSONB,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_donor_moves_client ON donor_moves(client_id);
CREATE INDEX IF NOT EXISTS idx_donor_moves_stage ON donor_moves(current_stage);
CREATE INDEX IF NOT EXISTS idx_donor_moves_assigned ON donor_moves(assigned_to);
CREATE INDEX IF NOT EXISTS idx_donor_moves_priority ON donor_moves(priority);
CREATE INDEX IF NOT EXISTS idx_donor_moves_donor_type ON donor_moves(donor_type);
CREATE INDEX IF NOT EXISTS idx_cultivation_plans_donor_move ON cultivation_plans(donor_move_id);
CREATE INDEX IF NOT EXISTS idx_cultivation_plans_client ON cultivation_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_cultivation_plans_status ON cultivation_plans(status);
CREATE INDEX IF NOT EXISTS idx_cultivation_tasks_plan ON cultivation_tasks(cultivation_plan_id);
CREATE INDEX IF NOT EXISTS idx_cultivation_tasks_status ON cultivation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cultivation_tasks_due_date ON cultivation_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_touchpoints_client ON touchpoints(client_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_donor_move ON touchpoints(donor_move_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_date ON touchpoints(touchpoint_date);
CREATE INDEX IF NOT EXISTS idx_touchpoints_type ON touchpoints(touchpoint_type);

-- 6. CREATE DONOR PIPELINE SUMMARY VIEW
CREATE OR REPLACE VIEW donor_pipeline_summary AS
SELECT
    dm.current_stage,
    dm.donor_type,
    dm.giving_capacity,
    dm.priority,
    COUNT(DISTINCT dm.id) AS donor_count,
    COALESCE(SUM(dm.target_gift_amount), 0) AS total_target_amount,
    COUNT(DISTINCT cp.id) AS active_plans,
    COUNT(DISTINCT CASE WHEN ct.status = 'pending' THEN ct.id END) AS pending_tasks,
    COUNT(DISTINCT CASE WHEN ct.due_date < CURRENT_DATE AND ct.status = 'pending' THEN ct.id END) AS overdue_tasks,
    COUNT(DISTINCT t.id) AS total_touchpoints,
    MAX(t.touchpoint_date) AS last_touchpoint_date
FROM donor_moves dm
LEFT JOIN cultivation_plans cp ON cp.donor_move_id = dm.id AND cp.status = 'active'
LEFT JOIN cultivation_tasks ct ON ct.cultivation_plan_id = cp.id
LEFT JOIN touchpoints t ON t.donor_move_id = dm.id
WHERE dm.is_active = true
GROUP BY dm.current_stage, dm.donor_type, dm.giving_capacity, dm.priority;

-- 7. CREATE CULTIVATION ACTIVITY SUMMARY VIEW
CREATE OR REPLACE VIEW cultivation_activity_summary AS
SELECT
    c.id AS client_id,
    c.name AS client_name,
    c.email AS client_email,
    dm.current_stage,
    dm.donor_type,
    dm.giving_capacity,
    dm.target_gift_amount,
    dm.target_gift_date,
    dm.assigned_to,
    dm.priority,
    -- Plan info
    cp.name AS active_plan_name,
    cp.goal_amount AS plan_goal,
    cp.target_completion_date AS plan_target_date,
    -- Task counts
    (SELECT COUNT(*) FROM cultivation_tasks WHERE cultivation_plan_id = cp.id AND status = 'pending') AS pending_tasks,
    (SELECT COUNT(*) FROM cultivation_tasks WHERE cultivation_plan_id = cp.id AND status = 'completed') AS completed_tasks,
    -- Touchpoint info
    (SELECT COUNT(*) FROM touchpoints WHERE client_id = c.id) AS total_touchpoints,
    (SELECT MAX(touchpoint_date) FROM touchpoints WHERE client_id = c.id) AS last_touchpoint,
    (SELECT COUNT(*) FROM touchpoints WHERE client_id = c.id AND touchpoint_date > NOW() - INTERVAL '30 days') AS touchpoints_last_30_days,
    -- Next action
    (SELECT MIN(due_date) FROM cultivation_tasks ct2
     JOIN cultivation_plans cp2 ON ct2.cultivation_plan_id = cp2.id
     WHERE cp2.client_id = c.id AND ct2.status = 'pending') AS next_task_due
FROM clients c
JOIN donor_moves dm ON dm.client_id = c.id
LEFT JOIN cultivation_plans cp ON cp.donor_move_id = dm.id AND cp.status = 'active'
WHERE dm.is_active = true;

-- 8. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_moves_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_donor_moves_updated_at ON donor_moves;
CREATE TRIGGER trigger_donor_moves_updated_at
    BEFORE UPDATE ON donor_moves
    FOR EACH ROW
    EXECUTE FUNCTION update_moves_updated_at();

DROP TRIGGER IF EXISTS trigger_cultivation_plans_updated_at ON cultivation_plans;
CREATE TRIGGER trigger_cultivation_plans_updated_at
    BEFORE UPDATE ON cultivation_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_moves_updated_at();

DROP TRIGGER IF EXISTS trigger_cultivation_tasks_updated_at ON cultivation_tasks;
CREATE TRIGGER trigger_cultivation_tasks_updated_at
    BEFORE UPDATE ON cultivation_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_moves_updated_at();

DROP TRIGGER IF EXISTS trigger_touchpoints_updated_at ON touchpoints;
CREATE TRIGGER trigger_touchpoints_updated_at
    BEFORE UPDATE ON touchpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_moves_updated_at();

-- 9. FUNCTION TO ADVANCE DONOR STAGE
CREATE OR REPLACE FUNCTION advance_donor_stage(
    p_donor_move_id UUID,
    p_new_stage VARCHAR(50),
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_current_stage VARCHAR(50);
BEGIN
    -- Get current stage
    SELECT current_stage INTO v_current_stage
    FROM donor_moves WHERE id = p_donor_move_id;

    -- Update to new stage
    UPDATE donor_moves
    SET
        previous_stage = v_current_stage,
        current_stage = p_new_stage,
        stage_entered_at = NOW(),
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_donor_move_id;

    -- Log the stage change as a touchpoint
    INSERT INTO touchpoints (
        client_id,
        donor_move_id,
        touchpoint_type,
        subject,
        description,
        direction
    )
    SELECT
        client_id,
        id,
        'other',
        'Stage Advanced: ' || v_current_stage || ' → ' || p_new_stage,
        COALESCE(p_notes, 'Donor moved to ' || p_new_stage || ' stage'),
        'outbound'
    FROM donor_moves WHERE id = p_donor_move_id;
END;
$$ LANGUAGE plpgsql;

-- 10. FUNCTION TO GET DONOR ENGAGEMENT SCORE
CREATE OR REPLACE FUNCTION calculate_donor_engagement(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_touchpoints_30d INTEGER;
    v_touchpoints_90d INTEGER;
    v_last_donation_days INTEGER;
    v_total_donations DECIMAL;
    v_positive_touchpoints INTEGER;
BEGIN
    -- Touchpoints in last 30 days (max 30 points)
    SELECT COUNT(*) INTO v_touchpoints_30d
    FROM touchpoints
    WHERE client_id = p_client_id
    AND touchpoint_date > NOW() - INTERVAL '30 days';
    v_score := v_score + LEAST(v_touchpoints_30d * 5, 30);

    -- Touchpoints in last 90 days (max 20 points)
    SELECT COUNT(*) INTO v_touchpoints_90d
    FROM touchpoints
    WHERE client_id = p_client_id
    AND touchpoint_date > NOW() - INTERVAL '90 days';
    v_score := v_score + LEAST(v_touchpoints_90d * 2, 20);

    -- Positive sentiment touchpoints (max 20 points)
    SELECT COUNT(*) INTO v_positive_touchpoints
    FROM touchpoints
    WHERE client_id = p_client_id
    AND sentiment = 'positive'
    AND touchpoint_date > NOW() - INTERVAL '180 days';
    v_score := v_score + LEAST(v_positive_touchpoints * 4, 20);

    -- Recent donation activity (max 30 points)
    SELECT
        EXTRACT(DAY FROM NOW() - MAX(d.date))::INTEGER,
        COALESCE(SUM(d.amount), 0)
    INTO v_last_donation_days, v_total_donations
    FROM donations d
    WHERE d.client_id = p_client_id
    AND d.date > NOW() - INTERVAL '365 days';

    IF v_last_donation_days IS NOT NULL THEN
        IF v_last_donation_days < 30 THEN v_score := v_score + 30;
        ELSIF v_last_donation_days < 90 THEN v_score := v_score + 20;
        ELSIF v_last_donation_days < 180 THEN v_score := v_score + 10;
        ELSIF v_last_donation_days < 365 THEN v_score := v_score + 5;
        END IF;
    END IF;

    RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- 11. ENABLE ROW LEVEL SECURITY
ALTER TABLE donor_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchpoints ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all access to donor_moves"
ON donor_moves FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to cultivation_plans"
ON cultivation_plans FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to cultivation_tasks"
ON cultivation_tasks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to touchpoints"
ON touchpoints FOR ALL USING (true) WITH CHECK (true);

-- 12. TABLE COMMENTS
COMMENT ON TABLE donor_moves IS 'Tracks donor position in the cultivation pipeline';
COMMENT ON TABLE cultivation_plans IS 'Strategic plans for cultivating specific donors';
COMMENT ON TABLE cultivation_tasks IS 'Specific tasks within cultivation plans';
COMMENT ON TABLE touchpoints IS 'Records all interactions with donors';
COMMENT ON FUNCTION advance_donor_stage IS 'Advances a donor to a new pipeline stage';
COMMENT ON FUNCTION calculate_donor_engagement IS 'Calculates engagement score for a donor (0-100)';

-- DONE! Phase 9 database migration complete.
