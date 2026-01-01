-- ============================================
-- PHASE 3: COMMUNICATION PREFERENCES
-- Logos Vision CRM
-- ============================================

-- IMPORTANT: Run this script in order.

-- 1. ADD COMMUNICATION PREFERENCE COLUMNS TO CLIENTS TABLE
-- These track how each contact prefers to be contacted

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS do_not_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS do_not_call BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS do_not_mail BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS do_not_text BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS newsletter_subscriber BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS communication_notes TEXT;

-- 2. CREATE INDEX FOR QUICK LOOKUPS
CREATE INDEX IF NOT EXISTS idx_clients_preferred_contact_method
ON clients(preferred_contact_method);

CREATE INDEX IF NOT EXISTS idx_clients_email_opt_in
ON clients(email_opt_in) WHERE email_opt_in = true;

CREATE INDEX IF NOT EXISTS idx_clients_newsletter_subscriber
ON clients(newsletter_subscriber) WHERE newsletter_subscriber = true;

-- 3. ADD COMMUNICATION LOG TABLE
-- Tracks all communications with contacts
CREATE TABLE IF NOT EXISTS communication_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Communication details
    type VARCHAR(50) NOT NULL, -- email, call, text, mail, meeting
    direction VARCHAR(20) NOT NULL DEFAULT 'outbound', -- inbound, outbound
    subject VARCHAR(255),
    content TEXT,

    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced BOOLEAN DEFAULT false,
    bounce_reason VARCHAR(255),

    -- Related records
    campaign_id UUID, -- If sent as part of an email campaign
    user_id UUID, -- Team member who initiated the communication

    -- Metadata
    metadata JSONB, -- Additional data like email headers, call duration, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE INDEXES FOR COMMUNICATION LOG
CREATE INDEX IF NOT EXISTS idx_communication_log_client_id
ON communication_log(client_id);

CREATE INDEX IF NOT EXISTS idx_communication_log_type
ON communication_log(type);

CREATE INDEX IF NOT EXISTS idx_communication_log_sent_at
ON communication_log(sent_at DESC);

-- 5. CREATE COMMUNICATION SUMMARY VIEW
-- Quick overview of communication history per contact
CREATE OR REPLACE VIEW communication_summary AS
SELECT
    c.id AS client_id,
    c.name AS client_name,
    c.preferred_contact_method,
    c.do_not_email,
    c.do_not_call,
    c.do_not_mail,
    c.do_not_text,
    c.email_opt_in,
    c.newsletter_subscriber,
    COUNT(cl.id) AS total_communications,
    COUNT(CASE WHEN cl.type = 'email' THEN 1 END) AS email_count,
    COUNT(CASE WHEN cl.type = 'call' THEN 1 END) AS call_count,
    COUNT(CASE WHEN cl.type = 'text' THEN 1 END) AS text_count,
    MAX(cl.sent_at) AS last_contacted,
    MAX(CASE WHEN cl.direction = 'inbound' THEN cl.sent_at END) AS last_inbound,
    MAX(CASE WHEN cl.direction = 'outbound' THEN cl.sent_at END) AS last_outbound
FROM clients c
LEFT JOIN communication_log cl ON cl.client_id = c.id
GROUP BY c.id, c.name, c.preferred_contact_method, c.do_not_email,
         c.do_not_call, c.do_not_mail, c.do_not_text, c.email_opt_in,
         c.newsletter_subscriber;

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

-- Create permissive policy (adjust for your auth setup)
CREATE POLICY "Allow all access to communication_log"
ON communication_log FOR ALL
USING (true)
WITH CHECK (true);

-- 7. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON COLUMN clients.preferred_contact_method IS 'How the contact prefers to be contacted: email, phone, text, mail';
COMMENT ON COLUMN clients.do_not_email IS 'Contact has opted out of email communications';
COMMENT ON COLUMN clients.do_not_call IS 'Contact has opted out of phone calls';
COMMENT ON COLUMN clients.do_not_mail IS 'Contact has opted out of physical mail';
COMMENT ON COLUMN clients.do_not_text IS 'Contact has opted out of text messages';
COMMENT ON COLUMN clients.email_opt_in IS 'Contact has opted in to receive marketing emails';
COMMENT ON COLUMN clients.newsletter_subscriber IS 'Contact is subscribed to newsletter';
COMMENT ON TABLE communication_log IS 'Tracks all communications with contacts for engagement history';
COMMENT ON VIEW communication_summary IS 'Aggregated communication statistics per contact';
