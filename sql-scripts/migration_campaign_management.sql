-- ============================================
-- PHASE 6: CAMPAIGN MANAGEMENT
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this entire script in order.

-- 0. DROP EXISTING OBJECTS (to ensure clean state)
DROP VIEW IF EXISTS campaign_performance_summary CASCADE;
DROP TABLE IF EXISTS campaign_contacts CASCADE;
DROP TABLE IF EXISTS campaign_segments CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TYPE IF EXISTS campaign_type CASCADE;
DROP TYPE IF EXISTS campaign_status CASCADE;
DROP TYPE IF EXISTS contact_status CASCADE;

-- 1. CREATE ENUM TYPES
CREATE TYPE campaign_type AS ENUM (
    'annual_fund',
    'specific_project',
    'emergency_appeal',
    'peer_to_peer',
    'monthly_giving',
    'capital_campaign',
    'matching_gift',
    'crowdfunding'
);

CREATE TYPE campaign_status AS ENUM (
    'draft',
    'scheduled',
    'active',
    'paused',
    'completed',
    'cancelled'
);

CREATE TYPE contact_status AS ENUM (
    'pending',
    'contacted',
    'responded',
    'donated',
    'declined',
    'unsubscribed'
);

-- 2. CAMPAIGNS TABLE
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Campaign type and status
    campaign_type campaign_type NOT NULL,
    status campaign_status NOT NULL DEFAULT 'draft',

    -- Financial goals
    goal_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    raised_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    donor_count INTEGER NOT NULL DEFAULT 0,

    -- Timing
    start_date DATE,
    end_date DATE,

    -- Targeting
    target_engagement_tiers TEXT[] DEFAULT '{}', -- ['champion', 'core', 'emerging']
    min_engagement_score INTEGER,
    max_engagement_score INTEGER,

    -- Content
    appeal_message TEXT,
    thank_you_message TEXT,

    -- Settings
    use_suggested_asks BOOLEAN DEFAULT true,
    allow_recurring BOOLEAN DEFAULT false,

    -- Statistics
    email_sent_count INTEGER DEFAULT 0,
    email_opened_count INTEGER DEFAULT 0,
    email_clicked_count INTEGER DEFAULT 0,

    -- Metadata
    created_by UUID,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CAMPAIGN SEGMENTS TABLE
-- Pre-defined segments based on engagement tiers
CREATE TABLE campaign_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

    -- Segment definition
    name VARCHAR(100) NOT NULL,
    engagement_tier VARCHAR(50) NOT NULL, -- 'champion', 'core', 'emerging', 'at_risk', 'lapsed'
    min_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,

    -- Ask strategy
    suggested_ask_multiplier DECIMAL(5, 2) DEFAULT 1.0, -- Multiplier of average gift
    expected_response_rate DECIMAL(5, 4) DEFAULT 0.10, -- e.g., 0.35 = 35%

    -- Results
    contact_count INTEGER DEFAULT 0,
    responded_count INTEGER DEFAULT 0,
    donated_count INTEGER DEFAULT 0,
    total_raised DECIMAL(15, 2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CAMPAIGN CONTACTS TABLE
-- Individual contacts assigned to campaign
CREATE TABLE campaign_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES campaign_segments(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Contact info at time of campaign
    engagement_score INTEGER,
    engagement_tier VARCHAR(50),

    -- Ask strategy
    suggested_ask DECIMAL(15, 2),
    actual_ask DECIMAL(15, 2),

    -- Status tracking
    status contact_status NOT NULL DEFAULT 'pending',

    -- Communication tracking
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_opened_at TIMESTAMP WITH TIME ZONE,
    email_clicked_at TIMESTAMP WITH TIME ZONE,

    -- Response tracking
    responded_at TIMESTAMP WITH TIME ZONE,
    response_notes TEXT,

    -- Donation tracking
    donation_id UUID, -- Link to donation if one was made
    donation_amount DECIMAL(15, 2),
    donated_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one contact per campaign
    UNIQUE(campaign_id, client_id)
);

-- 5. CREATE CAMPAIGN PERFORMANCE VIEW
CREATE OR REPLACE VIEW campaign_performance_summary AS
SELECT
    c.id,
    c.name,
    c.campaign_type,
    c.status,
    c.goal_amount,
    c.raised_amount,
    c.donor_count,
    c.start_date,
    c.end_date,
    c.created_at,
    -- Progress percentage
    CASE
        WHEN c.goal_amount > 0 THEN ROUND((c.raised_amount / c.goal_amount * 100)::NUMERIC, 1)
        ELSE 0
    END AS progress_percentage,
    -- Contact statistics
    (SELECT COUNT(*) FROM campaign_contacts cc WHERE cc.campaign_id = c.id) AS total_contacts,
    (SELECT COUNT(*) FROM campaign_contacts cc WHERE cc.campaign_id = c.id AND cc.status = 'contacted') AS contacted_count,
    (SELECT COUNT(*) FROM campaign_contacts cc WHERE cc.campaign_id = c.id AND cc.status = 'responded') AS responded_count,
    (SELECT COUNT(*) FROM campaign_contacts cc WHERE cc.campaign_id = c.id AND cc.status = 'donated') AS donations_count,
    -- Response rate
    CASE
        WHEN (SELECT COUNT(*) FROM campaign_contacts cc WHERE cc.campaign_id = c.id AND cc.status != 'pending') > 0
        THEN ROUND(
            ((SELECT COUNT(*) FROM campaign_contacts cc WHERE cc.campaign_id = c.id AND cc.status IN ('responded', 'donated'))::NUMERIC /
            (SELECT COUNT(*) FROM campaign_contacts cc WHERE cc.campaign_id = c.id AND cc.status != 'pending')::NUMERIC * 100), 1
        )
        ELSE 0
    END AS response_rate,
    -- Email statistics
    c.email_sent_count,
    c.email_opened_count,
    c.email_clicked_count,
    -- Email rates
    CASE
        WHEN c.email_sent_count > 0 THEN ROUND((c.email_opened_count::NUMERIC / c.email_sent_count * 100), 1)
        ELSE 0
    END AS open_rate,
    CASE
        WHEN c.email_sent_count > 0 THEN ROUND((c.email_clicked_count::NUMERIC / c.email_sent_count * 100), 1)
        ELSE 0
    END AS click_rate
FROM campaigns c;

-- 6. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_segments_campaign ON campaign_segments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_segments_tier ON campaign_segments(engagement_tier);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_client ON campaign_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON campaign_contacts(status);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_segment ON campaign_contacts(segment_id);

-- 7. ADD TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_campaign_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_campaigns_updated_at ON campaigns;
CREATE TRIGGER trigger_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_updated_at();

DROP TRIGGER IF EXISTS trigger_campaign_segments_updated_at ON campaign_segments;
CREATE TRIGGER trigger_campaign_segments_updated_at
    BEFORE UPDATE ON campaign_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_updated_at();

DROP TRIGGER IF EXISTS trigger_campaign_contacts_updated_at ON campaign_contacts;
CREATE TRIGGER trigger_campaign_contacts_updated_at
    BEFORE UPDATE ON campaign_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_updated_at();

-- 8. FUNCTION TO POPULATE CAMPAIGN FROM ENGAGEMENT SCORES
CREATE OR REPLACE FUNCTION populate_campaign_contacts(
    p_campaign_id UUID,
    p_engagement_tiers TEXT[] DEFAULT NULL,
    p_min_score INTEGER DEFAULT NULL,
    p_max_score INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    tier_record RECORD;
    client_record RECORD;
    v_segment_id UUID;
    v_contact_count INTEGER := 0;
    v_suggested_ask DECIMAL(15, 2);
    v_avg_gift DECIMAL(15, 2);
    v_tier_config RECORD;
BEGIN
    -- Define tier configurations
    FOR tier_record IN
        SELECT * FROM (VALUES
            ('champion', 85, 100, 1.5, 0.35),
            ('core', 70, 84, 1.2, 0.25),
            ('emerging', 50, 69, 1.0, 0.15),
            ('at_risk', 30, 49, 0.8, 0.10),
            ('lapsed', 0, 29, 0.6, 0.05)
        ) AS t(tier_name, min_score, max_score, ask_multiplier, response_rate)
    LOOP
        -- Skip if tier not in requested list (when specified)
        IF p_engagement_tiers IS NOT NULL AND NOT (tier_record.tier_name = ANY(p_engagement_tiers)) THEN
            CONTINUE;
        END IF;

        -- Skip if outside score range (when specified)
        IF p_min_score IS NOT NULL AND tier_record.max_score < p_min_score THEN
            CONTINUE;
        END IF;
        IF p_max_score IS NOT NULL AND tier_record.min_score > p_max_score THEN
            CONTINUE;
        END IF;

        -- Create segment for this tier
        INSERT INTO campaign_segments (
            campaign_id,
            name,
            engagement_tier,
            min_score,
            max_score,
            suggested_ask_multiplier,
            expected_response_rate
        ) VALUES (
            p_campaign_id,
            INITCAP(tier_record.tier_name) || ' Donors',
            tier_record.tier_name,
            tier_record.min_score,
            tier_record.max_score,
            tier_record.ask_multiplier,
            tier_record.response_rate
        )
        RETURNING id INTO v_segment_id;

        -- Add contacts from this tier
        FOR client_record IN
            SELECT
                es.client_id,
                es.total_score,
                es.engagement_level,
                COALESCE(
                    (SELECT AVG(d.amount) FROM donations d WHERE d.client_id = es.client_id),
                    100
                ) AS avg_gift
            FROM engagement_scores es
            WHERE es.total_score >= tier_record.min_score
            AND es.total_score <= tier_record.max_score
            AND (p_min_score IS NULL OR es.total_score >= p_min_score)
            AND (p_max_score IS NULL OR es.total_score <= p_max_score)
        LOOP
            -- Calculate suggested ask
            v_suggested_ask := ROUND(client_record.avg_gift * tier_record.ask_multiplier, 0);

            -- Insert contact (ignore if already exists)
            INSERT INTO campaign_contacts (
                campaign_id,
                segment_id,
                client_id,
                engagement_score,
                engagement_tier,
                suggested_ask
            ) VALUES (
                p_campaign_id,
                v_segment_id,
                client_record.client_id,
                client_record.total_score,
                tier_record.tier_name,
                v_suggested_ask
            )
            ON CONFLICT (campaign_id, client_id) DO NOTHING;

            IF FOUND THEN
                v_contact_count := v_contact_count + 1;
            END IF;
        END LOOP;

        -- Update segment contact count
        UPDATE campaign_segments
        SET contact_count = (
            SELECT COUNT(*) FROM campaign_contacts
            WHERE segment_id = v_segment_id
        )
        WHERE id = v_segment_id;
    END LOOP;

    RETURN v_contact_count;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCTION TO UPDATE CAMPAIGN STATISTICS
CREATE OR REPLACE FUNCTION update_campaign_stats(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE campaigns c
    SET
        raised_amount = COALESCE((
            SELECT SUM(cc.donation_amount)
            FROM campaign_contacts cc
            WHERE cc.campaign_id = p_campaign_id
            AND cc.status = 'donated'
        ), 0),
        donor_count = (
            SELECT COUNT(*)
            FROM campaign_contacts cc
            WHERE cc.campaign_id = p_campaign_id
            AND cc.status = 'donated'
        )
    WHERE c.id = p_campaign_id;

    -- Update segment stats
    UPDATE campaign_segments cs
    SET
        responded_count = (
            SELECT COUNT(*) FROM campaign_contacts cc
            WHERE cc.segment_id = cs.id
            AND cc.status IN ('responded', 'donated')
        ),
        donated_count = (
            SELECT COUNT(*) FROM campaign_contacts cc
            WHERE cc.segment_id = cs.id
            AND cc.status = 'donated'
        ),
        total_raised = COALESCE((
            SELECT SUM(cc.donation_amount) FROM campaign_contacts cc
            WHERE cc.segment_id = cs.id
            AND cc.status = 'donated'
        ), 0)
    WHERE cs.campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- 10. FUNCTION TO RECORD CAMPAIGN DONATION
CREATE OR REPLACE FUNCTION record_campaign_donation(
    p_campaign_id UUID,
    p_client_id UUID,
    p_donation_id UUID,
    p_amount DECIMAL(15, 2)
) RETURNS BOOLEAN AS $$
BEGIN
    -- Update contact status
    UPDATE campaign_contacts
    SET
        status = 'donated',
        donation_id = p_donation_id,
        donation_amount = p_amount,
        donated_at = NOW()
    WHERE campaign_id = p_campaign_id
    AND client_id = p_client_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update campaign stats
    PERFORM update_campaign_stats(p_campaign_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 11. ENABLE ROW LEVEL SECURITY
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all access to campaigns"
ON campaigns FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to campaign_segments"
ON campaign_segments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to campaign_contacts"
ON campaign_contacts FOR ALL USING (true) WITH CHECK (true);

-- 12. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE campaigns IS 'Stores fundraising campaigns with goals, timing, and targeting';
COMMENT ON TABLE campaign_segments IS 'Engagement tier segments within a campaign';
COMMENT ON TABLE campaign_contacts IS 'Individual donor contacts assigned to campaigns';
COMMENT ON VIEW campaign_performance_summary IS 'Aggregated campaign performance metrics';
COMMENT ON FUNCTION populate_campaign_contacts IS 'Populates campaign contacts based on engagement scores';
COMMENT ON FUNCTION update_campaign_stats IS 'Recalculates campaign statistics from contacts';
COMMENT ON FUNCTION record_campaign_donation IS 'Records a donation made through a campaign';
