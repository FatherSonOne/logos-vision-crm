-- ============================================
-- PHASE 4: DONOR ENGAGEMENT SCORING
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this entire script in order.

-- 0. DROP EXISTING OBJECTS (to ensure clean state)
DROP VIEW IF EXISTS engagement_score_summary CASCADE;
DROP TABLE IF EXISTS donor_engagement_scores CASCADE;
DROP FUNCTION IF EXISTS calculate_donation_frequency_score CASCADE;
DROP FUNCTION IF EXISTS calculate_donation_recency_score CASCADE;
DROP FUNCTION IF EXISTS calculate_pledge_fulfillment_score CASCADE;
DROP FUNCTION IF EXISTS calculate_communication_score CASCADE;
DROP FUNCTION IF EXISTS calculate_overall_engagement_score CASCADE;
DROP FUNCTION IF EXISTS refresh_engagement_scores CASCADE;

-- 1. DONOR ENGAGEMENT SCORES TABLE
-- Stores calculated engagement scores for each donor
CREATE TABLE donor_engagement_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Component scores (0-100)
    donation_frequency_score DECIMAL(5,2) DEFAULT 0,
    donation_recency_score DECIMAL(5,2) DEFAULT 0,
    donation_amount_score DECIMAL(5,2) DEFAULT 0,
    pledge_fulfillment_score DECIMAL(5,2) DEFAULT 0,
    communication_score DECIMAL(5,2) DEFAULT 0,

    -- Overall composite score (0-100)
    overall_score DECIMAL(5,2) DEFAULT 0,

    -- Engagement classification
    engagement_level VARCHAR(50) DEFAULT 'Unknown',

    -- Tracking metadata
    total_donations INTEGER DEFAULT 0,
    total_donated DECIMAL(12,2) DEFAULT 0,
    last_donation_date DATE,
    days_since_last_donation INTEGER,
    average_donation DECIMAL(12,2) DEFAULT 0,
    donation_frequency_days DECIMAL(10,2), -- Average days between donations

    -- Score history for trends (JSONB array)
    score_history JSONB DEFAULT '[]'::JSONB,

    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one score record per client
    UNIQUE(client_id)
);

-- 2. SCORING FUNCTIONS

-- Calculate donation frequency score (how often they donate)
CREATE OR REPLACE FUNCTION calculate_donation_frequency_score(p_client_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    donation_count INTEGER;
    first_donation DATE;
    last_donation DATE;
    days_span INTEGER;
    avg_days_between DECIMAL;
    score DECIMAL;
BEGIN
    -- Get donation stats for this client
    SELECT
        COUNT(*),
        MIN(donation_date),
        MAX(donation_date)
    INTO donation_count, first_donation, last_donation
    FROM donations
    WHERE client_id = p_client_id;

    -- No donations = 0 score
    IF donation_count IS NULL OR donation_count = 0 THEN
        RETURN 0;
    END IF;

    -- Single donation = base score of 20
    IF donation_count = 1 THEN
        RETURN 20;
    END IF;

    -- Calculate average days between donations
    days_span := last_donation - first_donation;
    IF days_span = 0 THEN
        days_span := 1;
    END IF;

    avg_days_between := days_span::DECIMAL / (donation_count - 1);

    -- Score based on frequency (more frequent = higher score)
    -- Monthly (30 days) = 100, Quarterly (90 days) = 75, Semi-annual (180 days) = 50, Annual (365 days) = 25
    CASE
        WHEN avg_days_between <= 30 THEN score := 100;
        WHEN avg_days_between <= 60 THEN score := 85;
        WHEN avg_days_between <= 90 THEN score := 75;
        WHEN avg_days_between <= 180 THEN score := 50;
        WHEN avg_days_between <= 365 THEN score := 25;
        ELSE score := 10;
    END CASE;

    -- Bonus for high donation count
    IF donation_count >= 12 THEN
        score := LEAST(score + 10, 100);
    ELSIF donation_count >= 6 THEN
        score := LEAST(score + 5, 100);
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Calculate donation recency score (how recently they donated)
CREATE OR REPLACE FUNCTION calculate_donation_recency_score(p_client_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    last_donation DATE;
    days_since INTEGER;
    score DECIMAL;
BEGIN
    -- Get most recent donation
    SELECT MAX(donation_date) INTO last_donation
    FROM donations
    WHERE client_id = p_client_id;

    -- No donations = 0 score
    IF last_donation IS NULL THEN
        RETURN 0;
    END IF;

    days_since := CURRENT_DATE - last_donation;

    -- Score based on recency
    -- Within 30 days = 100, 60 days = 80, 90 days = 60, 180 days = 40, 365 days = 20
    CASE
        WHEN days_since <= 30 THEN score := 100;
        WHEN days_since <= 60 THEN score := 85;
        WHEN days_since <= 90 THEN score := 70;
        WHEN days_since <= 180 THEN score := 50;
        WHEN days_since <= 365 THEN score := 30;
        WHEN days_since <= 730 THEN score := 15;
        ELSE score := 5;
    END CASE;

    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Calculate donation amount score (relative to other donors)
CREATE OR REPLACE FUNCTION calculate_donation_amount_score(p_client_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    client_total DECIMAL;
    max_total DECIMAL;
    avg_total DECIMAL;
    score DECIMAL;
BEGIN
    -- Get client's total donations
    SELECT COALESCE(SUM(amount), 0) INTO client_total
    FROM donations
    WHERE client_id = p_client_id;

    -- No donations = 0 score
    IF client_total = 0 THEN
        RETURN 0;
    END IF;

    -- Get max and average totals across all donors
    SELECT MAX(total), AVG(total)
    INTO max_total, avg_total
    FROM (
        SELECT client_id, SUM(amount) as total
        FROM donations
        GROUP BY client_id
    ) donor_totals;

    -- Avoid division by zero
    IF max_total IS NULL OR max_total = 0 THEN
        RETURN 50;
    END IF;

    -- Score based on position relative to others
    -- Above average gets 50+, below average gets 0-50
    IF client_total >= avg_total THEN
        -- Scale from 50 to 100 based on distance to max
        score := 50 + (50 * (client_total - avg_total) / NULLIF(max_total - avg_total, 0));
    ELSE
        -- Scale from 0 to 50 based on distance to average
        score := 50 * (client_total / NULLIF(avg_total, 0));
    END IF;

    -- Ensure score is within bounds
    score := GREATEST(0, LEAST(100, COALESCE(score, 50)));

    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Calculate pledge fulfillment score
CREATE OR REPLACE FUNCTION calculate_pledge_fulfillment_score(p_client_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_total_pledged DECIMAL;
    v_total_fulfilled DECIMAL;
    v_active_pledges INTEGER;
    v_completed_pledges INTEGER;
    v_fulfillment_rate DECIMAL;
    v_score DECIMAL;
BEGIN
    -- Get pledge stats
    SELECT
        COALESCE(SUM(p.total_pledged), 0),
        COALESCE(SUM(p.total_fulfilled), 0),
        COUNT(*) FILTER (WHERE p.status = 'active'),
        COUNT(*) FILTER (WHERE p.status = 'completed')
    INTO v_total_pledged, v_total_fulfilled, v_active_pledges, v_completed_pledges
    FROM pledges p
    WHERE p.client_id = p_client_id;

    -- No pledges = neutral score (they might just donate without pledging)
    IF v_total_pledged = 0 THEN
        RETURN 50;
    END IF;

    -- Calculate fulfillment rate
    v_fulfillment_rate := (v_total_fulfilled / v_total_pledged) * 100;

    -- Base score is fulfillment rate
    v_score := v_fulfillment_rate;

    -- Bonus for completed pledges
    IF v_completed_pledges > 0 THEN
        v_score := LEAST(v_score + (v_completed_pledges * 5), 100);
    END IF;

    RETURN GREATEST(0, LEAST(100, v_score));
END;
$$ LANGUAGE plpgsql;

-- Calculate communication engagement score
CREATE OR REPLACE FUNCTION calculate_communication_score(p_client_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_comms INTEGER;
    inbound_comms INTEGER;
    recent_comms INTEGER;
    last_comm_days INTEGER;
    score DECIMAL;
BEGIN
    -- Get communication stats
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE direction = 'inbound'),
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '90 days')
    INTO total_comms, inbound_comms, recent_comms
    FROM communication_log
    WHERE client_id = p_client_id;

    -- Get days since last communication
    SELECT EXTRACT(DAY FROM NOW() - MAX(created_at))::INTEGER
    INTO last_comm_days
    FROM communication_log
    WHERE client_id = p_client_id;

    -- No communications = low engagement
    IF total_comms IS NULL OR total_comms = 0 THEN
        RETURN 20;
    END IF;

    -- Start with base score
    score := 40;

    -- Add points for inbound communications (shows engagement)
    IF inbound_comms > 0 THEN
        score := score + LEAST(inbound_comms * 5, 20);
    END IF;

    -- Add points for recent activity
    IF recent_comms > 0 THEN
        score := score + LEAST(recent_comms * 3, 15);
    END IF;

    -- Add points for recency
    IF last_comm_days IS NOT NULL THEN
        IF last_comm_days <= 30 THEN
            score := score + 25;
        ELSIF last_comm_days <= 90 THEN
            score := score + 15;
        ELSIF last_comm_days <= 180 THEN
            score := score + 5;
        END IF;
    END IF;

    RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Calculate overall engagement score
CREATE OR REPLACE FUNCTION calculate_overall_engagement_score(
    p_frequency_score DECIMAL,
    p_recency_score DECIMAL,
    p_amount_score DECIMAL,
    p_pledge_score DECIMAL,
    p_communication_score DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    weighted_score DECIMAL;
BEGIN
    -- Weighted average of all component scores
    -- Weights: Recency (30%), Frequency (25%), Amount (20%), Pledge (15%), Communication (10%)
    weighted_score := (
        (COALESCE(p_recency_score, 0) * 0.30) +
        (COALESCE(p_frequency_score, 0) * 0.25) +
        (COALESCE(p_amount_score, 0) * 0.20) +
        (COALESCE(p_pledge_score, 0) * 0.15) +
        (COALESCE(p_communication_score, 0) * 0.10)
    );

    RETURN ROUND(weighted_score, 2);
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCTION TO REFRESH ALL ENGAGEMENT SCORES
CREATE OR REPLACE FUNCTION refresh_engagement_scores()
RETURNS INTEGER AS $$
DECLARE
    client_rec RECORD;
    freq_score DECIMAL;
    recency_score DECIMAL;
    amount_score DECIMAL;
    pledge_score DECIMAL;
    comm_score DECIMAL;
    overall DECIMAL;
    engagement_lvl VARCHAR(50);
    donation_stats RECORD;
    updated_count INTEGER := 0;
    current_history JSONB;
BEGIN
    -- Loop through all clients
    FOR client_rec IN SELECT id FROM clients LOOP
        -- Calculate component scores
        freq_score := calculate_donation_frequency_score(client_rec.id);
        recency_score := calculate_donation_recency_score(client_rec.id);
        amount_score := calculate_donation_amount_score(client_rec.id);
        pledge_score := calculate_pledge_fulfillment_score(client_rec.id);
        comm_score := calculate_communication_score(client_rec.id);

        -- Calculate overall score
        overall := calculate_overall_engagement_score(freq_score, recency_score, amount_score, pledge_score, comm_score);

        -- Determine engagement level
        CASE
            WHEN overall >= 80 THEN engagement_lvl := 'Highly Engaged';
            WHEN overall >= 60 THEN engagement_lvl := 'Engaged';
            WHEN overall >= 40 THEN engagement_lvl := 'Moderate';
            WHEN overall >= 20 THEN engagement_lvl := 'Low Engagement';
            ELSE engagement_lvl := 'At Risk';
        END CASE;

        -- Get donation statistics
        SELECT
            COUNT(*) as count,
            COALESCE(SUM(amount), 0) as total,
            MAX(donation_date) as last_date,
            COALESCE(AVG(amount), 0) as avg_amount
        INTO donation_stats
        FROM donations
        WHERE client_id = client_rec.id;

        -- Get existing score history
        SELECT COALESCE(score_history, '[]'::JSONB) INTO current_history
        FROM donor_engagement_scores
        WHERE client_id = client_rec.id;

        IF current_history IS NULL THEN
            current_history := '[]'::JSONB;
        END IF;

        -- Append new score to history (keep last 12 entries)
        current_history := (
            SELECT COALESCE(jsonb_agg(elem), '[]'::JSONB)
            FROM (
                SELECT elem
                FROM jsonb_array_elements(current_history) elem
                ORDER BY elem->>'date' DESC
                LIMIT 11
            ) recent
        ) || jsonb_build_array(jsonb_build_object('date', CURRENT_DATE, 'score', overall));

        -- Upsert the engagement score record
        INSERT INTO donor_engagement_scores (
            client_id,
            donation_frequency_score,
            donation_recency_score,
            donation_amount_score,
            pledge_fulfillment_score,
            communication_score,
            overall_score,
            engagement_level,
            total_donations,
            total_donated,
            last_donation_date,
            days_since_last_donation,
            average_donation,
            score_history,
            calculated_at,
            updated_at
        ) VALUES (
            client_rec.id,
            freq_score,
            recency_score,
            amount_score,
            pledge_score,
            comm_score,
            overall,
            engagement_lvl,
            donation_stats.count,
            donation_stats.total,
            donation_stats.last_date,
            CASE WHEN donation_stats.last_date IS NOT NULL
                THEN CURRENT_DATE - donation_stats.last_date
                ELSE NULL
            END,
            donation_stats.avg_amount,
            current_history,
            NOW(),
            NOW()
        )
        ON CONFLICT (client_id) DO UPDATE SET
            donation_frequency_score = EXCLUDED.donation_frequency_score,
            donation_recency_score = EXCLUDED.donation_recency_score,
            donation_amount_score = EXCLUDED.donation_amount_score,
            pledge_fulfillment_score = EXCLUDED.pledge_fulfillment_score,
            communication_score = EXCLUDED.communication_score,
            overall_score = EXCLUDED.overall_score,
            engagement_level = EXCLUDED.engagement_level,
            total_donations = EXCLUDED.total_donations,
            total_donated = EXCLUDED.total_donated,
            last_donation_date = EXCLUDED.last_donation_date,
            days_since_last_donation = EXCLUDED.days_since_last_donation,
            average_donation = EXCLUDED.average_donation,
            score_history = EXCLUDED.score_history,
            calculated_at = NOW(),
            updated_at = NOW();

        updated_count := updated_count + 1;
    END LOOP;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE ENGAGEMENT SCORE SUMMARY VIEW
CREATE OR REPLACE VIEW engagement_score_summary AS
SELECT
    des.id,
    des.client_id,
    c.name AS client_name,
    c.email AS client_email,
    des.overall_score,
    des.engagement_level,
    des.donation_frequency_score,
    des.donation_recency_score,
    des.donation_amount_score,
    des.pledge_fulfillment_score,
    des.communication_score,
    des.total_donations,
    des.total_donated,
    des.last_donation_date,
    des.days_since_last_donation,
    des.average_donation,
    des.score_history,
    des.calculated_at,
    des.created_at,
    des.updated_at
FROM donor_engagement_scores des
JOIN clients c ON c.id = des.client_id;

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_engagement_scores_client_id ON donor_engagement_scores(client_id);
CREATE INDEX IF NOT EXISTS idx_engagement_scores_overall ON donor_engagement_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_scores_level ON donor_engagement_scores(engagement_level);
CREATE INDEX IF NOT EXISTS idx_engagement_scores_calculated ON donor_engagement_scores(calculated_at);

-- 6. ADD TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_engagement_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_engagement_scores_updated_at ON donor_engagement_scores;
CREATE TRIGGER trigger_engagement_scores_updated_at
    BEFORE UPDATE ON donor_engagement_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_engagement_scores_updated_at();

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE donor_engagement_scores ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (adjust for your auth setup)
CREATE POLICY "Allow all access to donor_engagement_scores"
ON donor_engagement_scores FOR ALL
USING (true)
WITH CHECK (true);

-- 8. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE donor_engagement_scores IS 'Stores calculated engagement scores for each donor based on donation patterns, pledge fulfillment, and communication history';
COMMENT ON COLUMN donor_engagement_scores.overall_score IS 'Weighted composite score (0-100) based on all engagement factors';
COMMENT ON COLUMN donor_engagement_scores.engagement_level IS 'Classification: Highly Engaged, Engaged, Moderate, Low Engagement, At Risk';
COMMENT ON COLUMN donor_engagement_scores.score_history IS 'JSONB array of historical scores for trend analysis';
COMMENT ON FUNCTION refresh_engagement_scores() IS 'Recalculates engagement scores for all clients. Run periodically or after significant data changes.';
COMMENT ON VIEW engagement_score_summary IS 'Aggregated view of engagement scores with client information';

-- 9. INITIAL SCORE CALCULATION
-- Uncomment the line below to run initial calculation after migration
-- SELECT refresh_engagement_scores();
