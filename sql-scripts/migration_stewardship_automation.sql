-- ============================================
-- PHASE 5: STEWARDSHIP AUTOMATION
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this entire script in order.

-- 0. DROP EXISTING OBJECTS (to ensure clean state)
DROP VIEW IF EXISTS automation_execution_summary CASCADE;
DROP TABLE IF EXISTS automation_executions CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TYPE IF EXISTS trigger_type CASCADE;
DROP TYPE IF EXISTS action_type CASCADE;
DROP TYPE IF EXISTS execution_status CASCADE;

-- 1. CREATE ENUM TYPES
CREATE TYPE trigger_type AS ENUM (
    'donation_created',
    'pledge_created',
    'pledge_payment_due',
    'large_donation',
    'engagement_dropped',
    'birthday',
    'anniversary',
    'manual'
);

CREATE TYPE action_type AS ENUM (
    'send_email',
    'create_task',
    'send_sms',
    'log_communication',
    'update_engagement'
);

CREATE TYPE execution_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'skipped'
);

-- 2. EMAIL TEMPLATES TABLE
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,

    -- Template category
    category VARCHAR(100) DEFAULT 'general', -- thank_you, reminder, reengagement, birthday, etc.

    -- Merge fields available (stored as JSON for reference)
    available_merge_fields JSONB DEFAULT '["{{donor_name}}", "{{donation_amount}}", "{{donation_date}}", "{{organization_name}}"]'::JSONB,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AUTOMATION RULES TABLE
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Trigger configuration
    trigger_type trigger_type NOT NULL,
    trigger_conditions JSONB DEFAULT '{}'::JSONB, -- e.g., {"min_amount": 500} for large donations

    -- Action configuration
    action_type action_type NOT NULL,
    action_config JSONB DEFAULT '{}'::JSONB, -- e.g., {"template_id": "uuid", "assigned_to": "user_id"}

    -- Timing
    delay_minutes INTEGER DEFAULT 0, -- How long to wait before executing (0 = immediate)

    -- Template reference (for email actions)
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,

    -- Assignment (for task actions)
    assign_to_user_id UUID, -- User to assign tasks to

    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100, -- Lower = higher priority

    -- Statistics
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AUTOMATION EXECUTIONS TABLE
CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,

    -- Target
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

    -- Trigger details
    trigger_type trigger_type NOT NULL,
    trigger_data JSONB DEFAULT '{}'::JSONB, -- Store the triggering event data
    trigger_entity_id UUID, -- The donation, pledge, etc. that triggered this

    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Execution details
    status execution_status NOT NULL DEFAULT 'pending',
    executed_at TIMESTAMP WITH TIME ZONE,

    -- Results
    result_data JSONB DEFAULT '{}'::JSONB, -- Store results like email_id, task_id, etc.
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ADD BIRTHDAY FIELD TO CLIENTS IF NOT EXISTS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'birthday'
    ) THEN
        ALTER TABLE clients ADD COLUMN birthday DATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'anniversary_date'
    ) THEN
        ALTER TABLE clients ADD COLUMN anniversary_date DATE;
    END IF;
END $$;

-- 6. CREATE EXECUTION SUMMARY VIEW
CREATE OR REPLACE VIEW automation_execution_summary AS
SELECT
    ae.id,
    ae.rule_id,
    ar.name AS rule_name,
    ar.trigger_type,
    ar.action_type,
    ae.client_id,
    c.name AS client_name,
    c.email AS client_email,
    ae.trigger_data,
    ae.scheduled_for,
    ae.status,
    ae.executed_at,
    ae.result_data,
    ae.error_message,
    ae.retry_count,
    ae.created_at,
    ae.updated_at
FROM automation_executions ae
JOIN automation_rules ar ON ar.id = ae.rule_id
LEFT JOIN clients c ON c.id = ae.client_id;

-- 7. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_executions_rule ON automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_client ON automation_executions(client_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_scheduled ON automation_executions(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_clients_birthday ON clients(birthday);

-- 8. ADD TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_automation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_automation_rules_updated_at ON automation_rules;
CREATE TRIGGER trigger_automation_rules_updated_at
    BEFORE UPDATE ON automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_updated_at();

DROP TRIGGER IF EXISTS trigger_automation_executions_updated_at ON automation_executions;
CREATE TRIGGER trigger_automation_executions_updated_at
    BEFORE UPDATE ON automation_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_updated_at();

DROP TRIGGER IF EXISTS trigger_email_templates_updated_at ON email_templates;
CREATE TRIGGER trigger_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_updated_at();

-- 9. FUNCTION TO QUEUE AUTOMATION EXECUTION
CREATE OR REPLACE FUNCTION queue_automation(
    p_trigger_type trigger_type,
    p_client_id UUID,
    p_trigger_data JSONB DEFAULT '{}'::JSONB,
    p_trigger_entity_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    rule_rec RECORD;
    queued_count INTEGER := 0;
    scheduled_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Find all active rules for this trigger type
    FOR rule_rec IN
        SELECT id, delay_minutes, trigger_conditions
        FROM automation_rules
        WHERE trigger_type = p_trigger_type
        AND is_active = true
        ORDER BY priority ASC
    LOOP
        -- Check trigger conditions if any
        -- For now, we'll queue all matching rules
        -- More complex condition checking can be added here

        -- Calculate scheduled time
        scheduled_time := NOW() + (rule_rec.delay_minutes || ' minutes')::INTERVAL;

        -- Insert execution record
        INSERT INTO automation_executions (
            rule_id,
            client_id,
            trigger_type,
            trigger_data,
            trigger_entity_id,
            scheduled_for,
            status
        ) VALUES (
            rule_rec.id,
            p_client_id,
            p_trigger_type,
            p_trigger_data,
            p_trigger_entity_id,
            scheduled_time,
            'pending'
        );

        queued_count := queued_count + 1;
    END LOOP;

    RETURN queued_count;
END;
$$ LANGUAGE plpgsql;

-- 10. FUNCTION TO GET PENDING EXECUTIONS
CREATE OR REPLACE FUNCTION get_pending_automations(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    execution_id UUID,
    rule_id UUID,
    rule_name VARCHAR,
    action_type action_type,
    template_id UUID,
    assign_to_user_id UUID,
    action_config JSONB,
    client_id UUID,
    client_name VARCHAR,
    client_email VARCHAR,
    trigger_type trigger_type,
    trigger_data JSONB,
    trigger_entity_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ae.id AS execution_id,
        ar.id AS rule_id,
        ar.name AS rule_name,
        ar.action_type,
        ar.template_id,
        ar.assign_to_user_id,
        ar.action_config,
        ae.client_id,
        c.name AS client_name,
        c.email AS client_email,
        ae.trigger_type,
        ae.trigger_data,
        ae.trigger_entity_id
    FROM automation_executions ae
    JOIN automation_rules ar ON ar.id = ae.rule_id
    LEFT JOIN clients c ON c.id = ae.client_id
    WHERE ae.status = 'pending'
    AND ae.scheduled_for <= NOW()
    ORDER BY ae.scheduled_for ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 11. FUNCTION TO MARK EXECUTION COMPLETE
CREATE OR REPLACE FUNCTION complete_automation_execution(
    p_execution_id UUID,
    p_status execution_status,
    p_result_data JSONB DEFAULT '{}'::JSONB,
    p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_rule_id UUID;
BEGIN
    -- Get the rule ID
    SELECT rule_id INTO v_rule_id FROM automation_executions WHERE id = p_execution_id;

    -- Update execution record
    UPDATE automation_executions
    SET
        status = p_status,
        executed_at = NOW(),
        result_data = p_result_data,
        error_message = p_error_message,
        updated_at = NOW()
    WHERE id = p_execution_id;

    -- Update rule statistics if completed
    IF p_status = 'completed' THEN
        UPDATE automation_rules
        SET
            execution_count = execution_count + 1,
            last_executed_at = NOW()
        WHERE id = v_rule_id;
    END IF;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 12. ENABLE ROW LEVEL SECURITY
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all access to email_templates"
ON email_templates FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to automation_rules"
ON automation_rules FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to automation_executions"
ON automation_executions FOR ALL USING (true) WITH CHECK (true);

-- 13. SEED DEFAULT EMAIL TEMPLATES
INSERT INTO email_templates (name, description, subject, body, category) VALUES
(
    'Thank You - General Donation',
    'Sent immediately after a donation is received',
    'Thank you for your generous gift, {{donor_name}}!',
    E'Dear {{donor_name}},\n\nThank you so much for your generous donation of ${{donation_amount}} on {{donation_date}}.\n\nYour support helps us continue our important work in the community. Because of donors like you, we can make a real difference.\n\nWith gratitude,\n{{organization_name}}',
    'thank_you'
),
(
    'Pledge Payment Reminder',
    'Sent 7 days before a pledge payment is due',
    'Reminder: Your pledge payment is coming up',
    E'Dear {{donor_name}},\n\nThis is a friendly reminder that your pledge payment of ${{pledge_amount}} is due on {{due_date}}.\n\nYour continued support means the world to us. If you have any questions about your pledge, please don''t hesitate to reach out.\n\nThank you for your commitment,\n{{organization_name}}',
    'reminder'
),
(
    'Re-engagement - We Miss You',
    'Sent to donors who have lapsed',
    'We miss you, {{donor_name}}!',
    E'Dear {{donor_name}},\n\nIt''s been a while since we''ve heard from you, and we wanted to reach out.\n\nYour past support has made such a difference in our community. We''d love to share what we''ve been up to and how you can continue to be part of our mission.\n\nWould you consider making a gift today?\n\nWith appreciation,\n{{organization_name}}',
    'reengagement'
),
(
    'Birthday Greeting',
    'Sent on donor birthday',
    'Happy Birthday, {{donor_name}}! 🎂',
    E'Dear {{donor_name}},\n\nHappy Birthday! 🎉\n\nWe hope you have a wonderful day filled with joy and celebration. Thank you for being part of our community.\n\nWarm wishes,\n{{organization_name}}',
    'birthday'
),
(
    'Thank You - Large Donation',
    'Sent for donations over threshold amount',
    'Your extraordinary generosity, {{donor_name}}',
    E'Dear {{donor_name}},\n\nWe are deeply moved by your extraordinary gift of ${{donation_amount}}.\n\nYour generosity will have a profound impact on our work. A member of our team will be reaching out personally to thank you and share how your gift will be put to use.\n\nWith heartfelt gratitude,\n{{organization_name}}',
    'thank_you'
);

-- 14. SEED DEFAULT AUTOMATION RULES
INSERT INTO automation_rules (name, description, trigger_type, action_type, delay_minutes, template_id, trigger_conditions) VALUES
(
    'Thank You Email - All Donations',
    'Send thank you email immediately after donation',
    'donation_created',
    'send_email',
    0,
    (SELECT id FROM email_templates WHERE name = 'Thank You - General Donation'),
    '{}'::JSONB
),
(
    'Pledge Payment Reminder',
    'Send reminder 7 days before pledge payment due',
    'pledge_payment_due',
    'send_email',
    0, -- Triggered by scheduled job checking due dates
    (SELECT id FROM email_templates WHERE name = 'Pledge Payment Reminder'),
    '{"days_before": 7}'::JSONB
),
(
    'Large Donation Follow-up Task',
    'Create follow-up task for donations over $500',
    'large_donation',
    'create_task',
    10080, -- 7 days in minutes
    NULL,
    '{"min_amount": 500}'::JSONB
),
(
    'Re-engagement Email',
    'Send re-engagement email when donor becomes lapsed',
    'engagement_dropped',
    'send_email',
    1440, -- 1 day in minutes
    (SELECT id FROM email_templates WHERE name = 'Re-engagement - We Miss You'),
    '{"max_score": 30}'::JSONB
),
(
    'Birthday Greeting',
    'Send birthday email on donor birthday',
    'birthday',
    'send_email',
    0,
    (SELECT id FROM email_templates WHERE name = 'Birthday Greeting'),
    '{}'::JSONB
);

-- 15. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE email_templates IS 'Stores email templates for automated communications';
COMMENT ON TABLE automation_rules IS 'Defines automation rules with triggers, conditions, and actions';
COMMENT ON TABLE automation_executions IS 'Tracks execution of automation rules';
COMMENT ON FUNCTION queue_automation IS 'Queues automation executions for a given trigger';
COMMENT ON FUNCTION get_pending_automations IS 'Returns pending automation executions ready to process';
COMMENT ON FUNCTION complete_automation_execution IS 'Marks an automation execution as complete';
