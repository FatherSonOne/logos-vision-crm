-- ============================================
-- PHASE 7: ANALYTICS & REPORTING
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this entire script in order.

-- 0. DROP EXISTING OBJECTS (to ensure clean state)
DROP VIEW IF EXISTS donor_analytics_summary CASCADE;
DROP VIEW IF EXISTS cohort_retention_summary CASCADE;
DROP TABLE IF EXISTS giving_progression CASCADE;
DROP TABLE IF EXISTS retention_metrics CASCADE;
DROP TABLE IF EXISTS lifetime_values CASCADE;
DROP TABLE IF EXISTS cohort_members CASCADE;
DROP TABLE IF EXISTS donor_cohorts CASCADE;
DROP TABLE IF EXISTS saved_reports CASCADE;

-- 1. DONOR COHORTS TABLE
-- Groups donors by their first donation year
CREATE TABLE donor_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_year INTEGER NOT NULL UNIQUE,
    cohort_name VARCHAR(100) NOT NULL,
    description TEXT,
    total_donors INTEGER DEFAULT 0,
    total_first_year_value DECIMAL(15, 2) DEFAULT 0,
    avg_first_gift DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. COHORT MEMBERS TABLE
-- Links donors to their acquisition cohort
CREATE TABLE cohort_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID NOT NULL REFERENCES donor_cohorts(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_donation_date DATE NOT NULL,
    first_donation_amount DECIMAL(15, 2) NOT NULL,
    acquisition_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id)
);

-- 3. LIFETIME VALUES TABLE
-- Tracks calculated lifetime value for each donor
CREATE TABLE lifetime_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
    -- Actual values
    total_lifetime_value DECIMAL(15, 2) DEFAULT 0,
    total_donations INTEGER DEFAULT 0,
    avg_donation DECIMAL(15, 2) DEFAULT 0,
    largest_donation DECIMAL(15, 2) DEFAULT 0,
    first_donation_date DATE,
    last_donation_date DATE,
    donor_tenure_months INTEGER DEFAULT 0,
    -- Projected values
    projected_annual_value DECIMAL(15, 2) DEFAULT 0,
    projected_5yr_value DECIMAL(15, 2) DEFAULT 0,
    -- Scores
    recency_score INTEGER DEFAULT 0, -- 0-100
    frequency_score INTEGER DEFAULT 0, -- 0-100
    monetary_score INTEGER DEFAULT 0, -- 0-100
    rfm_score INTEGER DEFAULT 0, -- Combined RFM score
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RETENTION METRICS TABLE
-- Tracks year-over-year retention by cohort
CREATE TABLE retention_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID NOT NULL REFERENCES donor_cohorts(id) ON DELETE CASCADE,
    metric_year INTEGER NOT NULL,
    years_since_acquisition INTEGER NOT NULL,
    -- Counts
    donors_start_of_year INTEGER DEFAULT 0,
    donors_retained INTEGER DEFAULT 0,
    donors_lapsed INTEGER DEFAULT 0,
    donors_reactivated INTEGER DEFAULT 0,
    -- Rates
    retention_rate DECIMAL(5, 2) DEFAULT 0,
    lapse_rate DECIMAL(5, 2) DEFAULT 0,
    -- Values
    total_value DECIMAL(15, 2) DEFAULT 0,
    avg_gift DECIMAL(15, 2) DEFAULT 0,
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cohort_id, metric_year)
);

-- 5. GIVING PROGRESSION TABLE
-- Tracks individual donor giving changes year over year
CREATE TABLE giving_progression (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    -- Giving metrics
    gift_count INTEGER DEFAULT 0,
    gift_total DECIMAL(15, 2) DEFAULT 0,
    avg_gift DECIMAL(15, 2) DEFAULT 0,
    largest_gift DECIMAL(15, 2) DEFAULT 0,
    -- Year-over-year changes
    yoy_gift_count_change INTEGER DEFAULT 0,
    yoy_total_change DECIMAL(15, 2) DEFAULT 0,
    yoy_total_change_pct DECIMAL(5, 2) DEFAULT 0,
    -- Tier tracking
    engagement_tier_start VARCHAR(50),
    engagement_tier_end VARCHAR(50),
    tier_changed BOOLEAN DEFAULT false,
    tier_improved BOOLEAN DEFAULT false,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, year)
);

-- 6. SAVED REPORTS TABLE
-- Stores user-created custom reports
CREATE TABLE saved_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- 'cohort', 'ltv', 'retention', 'progression', 'custom'
    -- Report configuration
    filters JSONB DEFAULT '{}'::JSONB,
    columns JSONB DEFAULT '[]'::JSONB,
    sort_by VARCHAR(100),
    sort_direction VARCHAR(10) DEFAULT 'desc',
    -- Display settings
    chart_type VARCHAR(50), -- 'bar', 'line', 'pie', 'table'
    date_range_type VARCHAR(50), -- 'all_time', 'this_year', 'last_year', 'custom'
    date_from DATE,
    date_to DATE,
    -- Metadata
    created_by UUID,
    is_favorite BOOLEAN DEFAULT false,
    last_run_at TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE COHORT RETENTION SUMMARY VIEW
CREATE OR REPLACE VIEW cohort_retention_summary AS
SELECT
    dc.id AS cohort_id,
    dc.cohort_year,
    dc.cohort_name,
    dc.total_donors AS original_donors,
    dc.total_first_year_value,
    dc.avg_first_gift,
    rm.metric_year,
    rm.years_since_acquisition,
    rm.donors_retained,
    rm.retention_rate,
    rm.total_value AS year_value,
    rm.avg_gift AS year_avg_gift,
    -- Calculate cumulative retention
    ROUND(
        (rm.donors_retained::NUMERIC / NULLIF(dc.total_donors, 0) * 100),
        1
    ) AS cumulative_retention_rate
FROM donor_cohorts dc
LEFT JOIN retention_metrics rm ON rm.cohort_id = dc.id
ORDER BY dc.cohort_year DESC, rm.metric_year;

-- 8. CREATE DONOR ANALYTICS SUMMARY VIEW
-- Note: Uses LEFT JOIN to engagement_scores if it exists (from Phase 4)
-- If engagement_scores doesn't exist, those columns will be NULL
CREATE OR REPLACE VIEW donor_analytics_summary AS
SELECT
    c.id AS client_id,
    c.name AS client_name,
    c.email AS client_email,
    -- Cohort info
    dc.cohort_year,
    dc.cohort_name,
    cm.first_donation_date,
    cm.first_donation_amount,
    -- Lifetime value
    lv.total_lifetime_value,
    lv.total_donations,
    lv.avg_donation,
    lv.largest_donation,
    lv.donor_tenure_months,
    lv.projected_annual_value,
    lv.projected_5yr_value,
    lv.rfm_score,
    -- Engagement (derived from RFM score if engagement_scores table doesn't exist)
    lv.rfm_score AS engagement_score,
    CASE
        WHEN lv.rfm_score >= 85 THEN 'Champion'
        WHEN lv.rfm_score >= 70 THEN 'Core'
        WHEN lv.rfm_score >= 50 THEN 'Emerging'
        WHEN lv.rfm_score >= 30 THEN 'At Risk'
        ELSE 'Lapsed'
    END AS engagement_level,
    -- Latest progression
    gp.year AS latest_year,
    gp.gift_count AS latest_gift_count,
    gp.gift_total AS latest_gift_total,
    gp.yoy_total_change_pct,
    gp.tier_improved
FROM clients c
LEFT JOIN cohort_members cm ON cm.client_id = c.id
LEFT JOIN donor_cohorts dc ON dc.id = cm.cohort_id
LEFT JOIN lifetime_values lv ON lv.client_id = c.id
LEFT JOIN LATERAL (
    SELECT * FROM giving_progression gp2
    WHERE gp2.client_id = c.id
    ORDER BY gp2.year DESC
    LIMIT 1
) gp ON true;

-- 9. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_donor_cohorts_year ON donor_cohorts(cohort_year);
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_client ON cohort_members(client_id);
CREATE INDEX IF NOT EXISTS idx_lifetime_values_client ON lifetime_values(client_id);
CREATE INDEX IF NOT EXISTS idx_lifetime_values_rfm ON lifetime_values(rfm_score DESC);
CREATE INDEX IF NOT EXISTS idx_lifetime_values_ltv ON lifetime_values(total_lifetime_value DESC);
CREATE INDEX IF NOT EXISTS idx_retention_metrics_cohort ON retention_metrics(cohort_id);
CREATE INDEX IF NOT EXISTS idx_retention_metrics_year ON retention_metrics(metric_year);
CREATE INDEX IF NOT EXISTS idx_giving_progression_client ON giving_progression(client_id);
CREATE INDEX IF NOT EXISTS idx_giving_progression_year ON giving_progression(year);
CREATE INDEX IF NOT EXISTS idx_saved_reports_type ON saved_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_saved_reports_favorite ON saved_reports(is_favorite);

-- 10. ADD TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_donor_cohorts_updated_at ON donor_cohorts;
CREATE TRIGGER trigger_donor_cohorts_updated_at
    BEFORE UPDATE ON donor_cohorts
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_lifetime_values_updated_at ON lifetime_values;
CREATE TRIGGER trigger_lifetime_values_updated_at
    BEFORE UPDATE ON lifetime_values
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_saved_reports_updated_at ON saved_reports;
CREATE TRIGGER trigger_saved_reports_updated_at
    BEFORE UPDATE ON saved_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

-- 11. FUNCTION TO BUILD/REFRESH COHORTS
CREATE OR REPLACE FUNCTION refresh_donor_cohorts()
RETURNS INTEGER AS $$
DECLARE
    v_year INTEGER;
    v_cohort_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Get all distinct first donation years
    FOR v_year IN
        SELECT DISTINCT EXTRACT(YEAR FROM MIN(d.donation_date))::INTEGER AS first_year
        FROM donations d
        WHERE d.client_id IS NOT NULL
        GROUP BY d.client_id
        ORDER BY first_year
    LOOP
        -- Create or update cohort for this year
        INSERT INTO donor_cohorts (cohort_year, cohort_name, description)
        VALUES (
            v_year,
            'Class of ' || v_year,
            'Donors who made their first gift in ' || v_year
        )
        ON CONFLICT (cohort_year) DO UPDATE
        SET cohort_name = EXCLUDED.cohort_name
        RETURNING id INTO v_cohort_id;

        -- Add members to cohort
        INSERT INTO cohort_members (cohort_id, client_id, first_donation_date, first_donation_amount)
        SELECT
            v_cohort_id,
            sub.client_id,
            sub.first_date,
            sub.first_amount
        FROM (
            SELECT
                d.client_id,
                MIN(d.donation_date) AS first_date,
                (SELECT d2.amount FROM donations d2
                 WHERE d2.client_id = d.client_id
                 ORDER BY d2.donation_date ASC LIMIT 1) AS first_amount
            FROM donations d
            WHERE d.client_id IS NOT NULL
            GROUP BY d.client_id
            HAVING EXTRACT(YEAR FROM MIN(d.donation_date)) = v_year
        ) sub
        ON CONFLICT (client_id) DO UPDATE
        SET
            first_donation_date = EXCLUDED.first_donation_date,
            first_donation_amount = EXCLUDED.first_donation_amount;

        -- Update cohort statistics
        UPDATE donor_cohorts
        SET
            total_donors = (SELECT COUNT(*) FROM cohort_members WHERE cohort_id = v_cohort_id),
            total_first_year_value = (SELECT COALESCE(SUM(first_donation_amount), 0) FROM cohort_members WHERE cohort_id = v_cohort_id),
            avg_first_gift = (SELECT COALESCE(AVG(first_donation_amount), 0) FROM cohort_members WHERE cohort_id = v_cohort_id)
        WHERE id = v_cohort_id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 12. FUNCTION TO CALCULATE LIFETIME VALUES
CREATE OR REPLACE FUNCTION calculate_lifetime_values()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    client_rec RECORD;
    v_recency INTEGER;
    v_frequency INTEGER;
    v_monetary INTEGER;
    v_tenure_months INTEGER;
    v_avg_annual DECIMAL(15, 2);
BEGIN
    FOR client_rec IN
        SELECT
            c.id AS client_id,
            COUNT(d.id) AS total_donations,
            COALESCE(SUM(d.amount), 0) AS total_value,
            COALESCE(AVG(d.amount), 0) AS avg_amount,
            COALESCE(MAX(d.amount), 0) AS max_amount,
            MIN(d.donation_date) AS first_date,
            MAX(d.donation_date) AS last_date
        FROM clients c
        LEFT JOIN donations d ON d.client_id = c.id
        GROUP BY c.id
        HAVING COUNT(d.id) > 0
    LOOP
        -- Calculate tenure in months
        v_tenure_months := GREATEST(1,
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, client_rec.first_date)) * 12 +
            EXTRACT(MONTH FROM AGE(CURRENT_DATE, client_rec.first_date))
        );

        -- Calculate RFM scores (each 0-100)
        -- Recency: days since last donation (lower = better)
        v_recency := GREATEST(0, LEAST(100,
            100 - (CURRENT_DATE - client_rec.last_date)::INTEGER / 3
        ));

        -- Frequency: donations per year
        v_frequency := LEAST(100,
            (client_rec.total_donations::NUMERIC / (v_tenure_months / 12.0) * 20)::INTEGER
        );

        -- Monetary: based on average donation
        v_monetary := LEAST(100,
            (client_rec.avg_amount / 10)::INTEGER
        );

        -- Calculate projected annual value
        v_avg_annual := client_rec.total_value / GREATEST(1, v_tenure_months / 12.0);

        -- Insert or update lifetime value record
        INSERT INTO lifetime_values (
            client_id,
            total_lifetime_value,
            total_donations,
            avg_donation,
            largest_donation,
            first_donation_date,
            last_donation_date,
            donor_tenure_months,
            projected_annual_value,
            projected_5yr_value,
            recency_score,
            frequency_score,
            monetary_score,
            rfm_score,
            calculated_at
        ) VALUES (
            client_rec.client_id,
            client_rec.total_value,
            client_rec.total_donations,
            client_rec.avg_amount,
            client_rec.max_amount,
            client_rec.first_date,
            client_rec.last_date,
            v_tenure_months,
            v_avg_annual,
            v_avg_annual * 5,
            v_recency,
            v_frequency,
            v_monetary,
            (v_recency + v_frequency + v_monetary) / 3,
            NOW()
        )
        ON CONFLICT (client_id) DO UPDATE
        SET
            total_lifetime_value = EXCLUDED.total_lifetime_value,
            total_donations = EXCLUDED.total_donations,
            avg_donation = EXCLUDED.avg_donation,
            largest_donation = EXCLUDED.largest_donation,
            first_donation_date = EXCLUDED.first_donation_date,
            last_donation_date = EXCLUDED.last_donation_date,
            donor_tenure_months = EXCLUDED.donor_tenure_months,
            projected_annual_value = EXCLUDED.projected_annual_value,
            projected_5yr_value = EXCLUDED.projected_5yr_value,
            recency_score = EXCLUDED.recency_score,
            frequency_score = EXCLUDED.frequency_score,
            monetary_score = EXCLUDED.monetary_score,
            rfm_score = EXCLUDED.rfm_score,
            calculated_at = NOW();

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 13. FUNCTION TO CALCULATE RETENTION METRICS
CREATE OR REPLACE FUNCTION calculate_retention_metrics()
RETURNS INTEGER AS $$
DECLARE
    cohort_rec RECORD;
    v_year INTEGER;
    v_current_year INTEGER;
    v_donors_in_year INTEGER;
    v_total_value DECIMAL(15, 2);
    v_count INTEGER := 0;
BEGIN
    v_current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

    FOR cohort_rec IN
        SELECT id, cohort_year, total_donors
        FROM donor_cohorts
        ORDER BY cohort_year
    LOOP
        -- Calculate metrics for each year since cohort acquisition
        FOR v_year IN cohort_rec.cohort_year..v_current_year
        LOOP
            -- Count donors who gave in this year
            SELECT
                COUNT(DISTINCT d.client_id),
                COALESCE(SUM(d.amount), 0)
            INTO v_donors_in_year, v_total_value
            FROM donations d
            JOIN cohort_members cm ON cm.client_id = d.client_id
            WHERE cm.cohort_id = cohort_rec.id
            AND EXTRACT(YEAR FROM d.donation_date) = v_year;

            -- Insert or update retention metric
            INSERT INTO retention_metrics (
                cohort_id,
                metric_year,
                years_since_acquisition,
                donors_start_of_year,
                donors_retained,
                retention_rate,
                total_value,
                avg_gift,
                calculated_at
            ) VALUES (
                cohort_rec.id,
                v_year,
                v_year - cohort_rec.cohort_year,
                cohort_rec.total_donors,
                v_donors_in_year,
                ROUND((v_donors_in_year::NUMERIC / NULLIF(cohort_rec.total_donors, 0) * 100), 1),
                v_total_value,
                CASE WHEN v_donors_in_year > 0 THEN v_total_value / v_donors_in_year ELSE 0 END,
                NOW()
            )
            ON CONFLICT (cohort_id, metric_year) DO UPDATE
            SET
                donors_retained = EXCLUDED.donors_retained,
                retention_rate = EXCLUDED.retention_rate,
                total_value = EXCLUDED.total_value,
                avg_gift = EXCLUDED.avg_gift,
                calculated_at = NOW();

            v_count := v_count + 1;
        END LOOP;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 14. FUNCTION TO CALCULATE GIVING PROGRESSION
CREATE OR REPLACE FUNCTION calculate_giving_progression()
RETURNS INTEGER AS $$
DECLARE
    client_rec RECORD;
    v_year INTEGER;
    v_gift_count INTEGER;
    v_gift_total DECIMAL(15, 2);
    v_prev_total DECIMAL(15, 2);
    v_count INTEGER := 0;
BEGIN
    FOR client_rec IN
        SELECT DISTINCT client_id
        FROM donations
        WHERE client_id IS NOT NULL
    LOOP
        v_prev_total := NULL;

        FOR v_year IN
            SELECT DISTINCT EXTRACT(YEAR FROM donation_date)::INTEGER
            FROM donations
            WHERE client_id = client_rec.client_id
            ORDER BY 1
        LOOP
            SELECT
                COUNT(*),
                COALESCE(SUM(amount), 0)
            INTO v_gift_count, v_gift_total
            FROM donations
            WHERE client_id = client_rec.client_id
            AND EXTRACT(YEAR FROM donation_date) = v_year;

            INSERT INTO giving_progression (
                client_id,
                year,
                gift_count,
                gift_total,
                avg_gift,
                largest_gift,
                yoy_gift_count_change,
                yoy_total_change,
                yoy_total_change_pct
            )
            SELECT
                client_rec.client_id,
                v_year,
                v_gift_count,
                v_gift_total,
                CASE WHEN v_gift_count > 0 THEN v_gift_total / v_gift_count ELSE 0 END,
                COALESCE(MAX(amount), 0),
                0,
                CASE WHEN v_prev_total IS NOT NULL THEN v_gift_total - v_prev_total ELSE 0 END,
                CASE
                    WHEN v_prev_total IS NOT NULL AND v_prev_total > 0
                    THEN ROUND(((v_gift_total - v_prev_total) / v_prev_total * 100), 1)
                    ELSE 0
                END
            FROM donations
            WHERE client_id = client_rec.client_id
            AND EXTRACT(YEAR FROM donation_date) = v_year
            ON CONFLICT (client_id, year) DO UPDATE
            SET
                gift_count = EXCLUDED.gift_count,
                gift_total = EXCLUDED.gift_total,
                avg_gift = EXCLUDED.avg_gift,
                largest_gift = EXCLUDED.largest_gift,
                yoy_total_change = EXCLUDED.yoy_total_change,
                yoy_total_change_pct = EXCLUDED.yoy_total_change_pct;

            v_prev_total := v_gift_total;
            v_count := v_count + 1;
        END LOOP;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 15. MASTER FUNCTION TO REFRESH ALL ANALYTICS
CREATE OR REPLACE FUNCTION refresh_all_analytics()
RETURNS TABLE(
    cohorts_refreshed INTEGER,
    ltv_calculated INTEGER,
    retention_calculated INTEGER,
    progression_calculated INTEGER
) AS $$
DECLARE
    v_cohorts INTEGER;
    v_ltv INTEGER;
    v_retention INTEGER;
    v_progression INTEGER;
BEGIN
    -- Refresh in order of dependencies
    v_cohorts := refresh_donor_cohorts();
    v_ltv := calculate_lifetime_values();
    v_retention := calculate_retention_metrics();
    v_progression := calculate_giving_progression();

    RETURN QUERY SELECT v_cohorts, v_ltv, v_retention, v_progression;
END;
$$ LANGUAGE plpgsql;

-- 16. ENABLE ROW LEVEL SECURITY
ALTER TABLE donor_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifetime_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all access to donor_cohorts"
ON donor_cohorts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to cohort_members"
ON cohort_members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to lifetime_values"
ON lifetime_values FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to retention_metrics"
ON retention_metrics FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to giving_progression"
ON giving_progression FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to saved_reports"
ON saved_reports FOR ALL USING (true) WITH CHECK (true);

-- 17. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE donor_cohorts IS 'Groups donors by their first donation year for cohort analysis';
COMMENT ON TABLE cohort_members IS 'Links individual donors to their acquisition cohort';
COMMENT ON TABLE lifetime_values IS 'Calculated lifetime value and RFM scores for each donor';
COMMENT ON TABLE retention_metrics IS 'Year-over-year retention statistics by cohort';
COMMENT ON TABLE giving_progression IS 'Tracks individual donor giving changes year over year';
COMMENT ON TABLE saved_reports IS 'User-created custom report configurations';
COMMENT ON FUNCTION refresh_donor_cohorts IS 'Builds or refreshes donor cohorts from donation data';
COMMENT ON FUNCTION calculate_lifetime_values IS 'Calculates LTV and RFM scores for all donors';
COMMENT ON FUNCTION calculate_retention_metrics IS 'Calculates retention rates by cohort and year';
COMMENT ON FUNCTION calculate_giving_progression IS 'Tracks year-over-year giving changes per donor';
COMMENT ON FUNCTION refresh_all_analytics IS 'Master function to refresh all analytics data';
