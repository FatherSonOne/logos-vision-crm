-- ============================================
-- PHASE 3: PLEDGES & RECURRING DONATIONS
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this entire script in order.

-- 0. DROP EXISTING OBJECTS (to ensure clean state)
DROP VIEW IF EXISTS pledge_summary CASCADE;
DROP TABLE IF EXISTS pledge_schedules CASCADE;
DROP TABLE IF EXISTS pledge_payments CASCADE;
DROP TABLE IF EXISTS pledges CASCADE;
DROP FUNCTION IF EXISTS calculate_next_payment_date CASCADE;

-- 1. PLEDGES TABLE
-- Tracks recurring donation commitments
CREATE TABLE pledges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Pledge details
    pledge_amount DECIMAL(12,2) NOT NULL,
    frequency VARCHAR(50) NOT NULL DEFAULT 'monthly', -- monthly, quarterly, annually, one-time
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for ongoing pledges

    -- Tracking
    total_pledged DECIMAL(12,2) NOT NULL DEFAULT 0, -- Calculated total expected
    total_fulfilled DECIMAL(12,2) NOT NULL DEFAULT 0, -- Sum of donations against this pledge
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, completed, cancelled, paused

    -- Campaign/fund allocation
    campaign VARCHAR(255),
    fund VARCHAR(255),

    -- Notes and metadata
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_days_before INTEGER DEFAULT 7, -- Days before due date to remind
    last_reminder_sent TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PLEDGE PAYMENTS TABLE
-- Links donations to pledges for fulfillment tracking
CREATE TABLE pledge_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pledge_id UUID NOT NULL REFERENCES pledges(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(donation_id) -- Each donation can only fulfill one pledge
);

-- 3. PLEDGE SCHEDULES TABLE (Optional)
-- Pre-defined payment schedule for pledges
CREATE TABLE pledge_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pledge_id UUID NOT NULL REFERENCES pledges(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_amount DECIMAL(12,2) NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    paid_date DATE,
    payment_id UUID REFERENCES pledge_payments(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE HELPER FUNCTION FOR NEXT PAYMENT DATE
CREATE OR REPLACE FUNCTION calculate_next_payment_date(
    p_start_date DATE,
    p_frequency VARCHAR
) RETURNS DATE AS $$
DECLARE
    next_date DATE;
    months_passed INTEGER;
BEGIN
    -- If start date is in the future, return it
    IF p_start_date > CURRENT_DATE THEN
        RETURN p_start_date;
    END IF;

    -- Calculate based on frequency
    CASE p_frequency
        WHEN 'monthly' THEN
            months_passed := (EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_start_date)) * 12 +
                            EXTRACT(MONTH FROM AGE(CURRENT_DATE, p_start_date)))::INTEGER;
            next_date := p_start_date + ((months_passed + 1) * INTERVAL '1 month');
        WHEN 'quarterly' THEN
            months_passed := (EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_start_date)) * 12 +
                            EXTRACT(MONTH FROM AGE(CURRENT_DATE, p_start_date)))::INTEGER;
            next_date := p_start_date + ((CEIL((months_passed + 1) / 3.0) * 3)::INTEGER * INTERVAL '1 month');
        WHEN 'annually' THEN
            months_passed := EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_start_date))::INTEGER;
            next_date := p_start_date + ((months_passed + 1) * INTERVAL '1 year');
        ELSE
            next_date := p_start_date;
    END CASE;

    RETURN next_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. CREATE PLEDGE SUMMARY VIEW
-- Aggregates pledge data for easy querying
CREATE OR REPLACE VIEW pledge_summary AS
SELECT
    p.id AS pledge_id,
    p.client_id,
    c.name AS client_name,
    c.email AS client_email,
    p.pledge_amount,
    p.frequency,
    p.start_date,
    p.end_date,
    p.total_pledged,
    p.total_fulfilled,
    p.status,
    p.campaign,
    p.fund,
    p.reminder_enabled,
    p.created_at,
    p.updated_at,
    -- Calculated fields
    CASE
        WHEN p.total_pledged > 0 THEN ROUND((p.total_fulfilled / p.total_pledged) * 100, 1)
        ELSE 0
    END AS fulfillment_percentage,
    p.total_pledged - p.total_fulfilled AS remaining_amount,
    -- Next payment due date using helper function
    calculate_next_payment_date(p.start_date, p.frequency) AS next_payment_due,
    -- Count of payments made
    (SELECT COUNT(*) FROM pledge_payments pp WHERE pp.pledge_id = p.id) AS payment_count
FROM pledges p
LEFT JOIN clients c ON c.id = p.client_id;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_pledges_client_id ON pledges(client_id);
CREATE INDEX IF NOT EXISTS idx_pledges_status ON pledges(status);
CREATE INDEX IF NOT EXISTS idx_pledges_start_date ON pledges(start_date);
CREATE INDEX IF NOT EXISTS idx_pledges_campaign ON pledges(campaign);
CREATE INDEX IF NOT EXISTS idx_pledge_payments_pledge_id ON pledge_payments(pledge_id);
CREATE INDEX IF NOT EXISTS idx_pledge_payments_donation_id ON pledge_payments(donation_id);
CREATE INDEX IF NOT EXISTS idx_pledge_schedules_pledge_id ON pledge_schedules(pledge_id);
CREATE INDEX IF NOT EXISTS idx_pledge_schedules_scheduled_date ON pledge_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_pledge_schedules_is_paid ON pledge_schedules(is_paid);

-- 7. ADD TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_pledges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pledges_updated_at ON pledges;
CREATE TRIGGER trigger_pledges_updated_at
    BEFORE UPDATE ON pledges
    FOR EACH ROW
    EXECUTE FUNCTION update_pledges_updated_at();

-- 8. TRIGGER TO UPDATE PLEDGE TOTALS WHEN PAYMENTS CHANGE
CREATE OR REPLACE FUNCTION update_pledge_fulfilled_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE pledges
        SET total_fulfilled = (
            SELECT COALESCE(SUM(amount), 0)
            FROM pledge_payments
            WHERE pledge_id = NEW.pledge_id
        )
        WHERE id = NEW.pledge_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE pledges
        SET total_fulfilled = (
            SELECT COALESCE(SUM(amount), 0)
            FROM pledge_payments
            WHERE pledge_id = OLD.pledge_id
        )
        WHERE id = OLD.pledge_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pledge_fulfilled ON pledge_payments;
CREATE TRIGGER trigger_update_pledge_fulfilled
    AFTER INSERT OR UPDATE OR DELETE ON pledge_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_pledge_fulfilled_amount();

-- 9. FUNCTION TO CALCULATE TOTAL PLEDGED BASED ON FREQUENCY AND DURATION
CREATE OR REPLACE FUNCTION calculate_total_pledged(
    p_amount DECIMAL,
    p_frequency VARCHAR,
    p_start_date DATE,
    p_end_date DATE
) RETURNS DECIMAL AS $$
DECLARE
    months_diff INTEGER;
    total DECIMAL;
BEGIN
    -- If no end date, calculate for 1 year
    IF p_end_date IS NULL THEN
        p_end_date := p_start_date + INTERVAL '1 year';
    END IF;

    months_diff := EXTRACT(YEAR FROM AGE(p_end_date, p_start_date)) * 12 +
                   EXTRACT(MONTH FROM AGE(p_end_date, p_start_date));

    CASE p_frequency
        WHEN 'monthly' THEN
            total := p_amount * GREATEST(months_diff, 1);
        WHEN 'quarterly' THEN
            total := p_amount * GREATEST(CEIL(months_diff / 3.0), 1);
        WHEN 'annually' THEN
            total := p_amount * GREATEST(CEIL(months_diff / 12.0), 1);
        WHEN 'one-time' THEN
            total := p_amount;
        ELSE
            total := p_amount;
    END CASE;

    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- 10. ENABLE ROW LEVEL SECURITY
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledge_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledge_schedules ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (adjust for your auth setup)
CREATE POLICY "Allow all access to pledges"
ON pledges FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to pledge_payments"
ON pledge_payments FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to pledge_schedules"
ON pledge_schedules FOR ALL
USING (true)
WITH CHECK (true);

-- 11. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE pledges IS 'Tracks recurring donation commitments and pledges from donors';
COMMENT ON TABLE pledge_payments IS 'Links individual donations to pledges for fulfillment tracking';
COMMENT ON TABLE pledge_schedules IS 'Pre-defined payment schedule for pledges with due dates and amounts';
COMMENT ON VIEW pledge_summary IS 'Aggregated view of pledges with calculated fulfillment metrics';
COMMENT ON COLUMN pledges.frequency IS 'Payment frequency: monthly, quarterly, annually, one-time';
COMMENT ON COLUMN pledges.status IS 'Pledge status: active, completed, cancelled, paused';
COMMENT ON COLUMN pledges.total_pledged IS 'Calculated total expected amount based on frequency and duration';
COMMENT ON COLUMN pledges.total_fulfilled IS 'Sum of all payments made against this pledge';
