-- ============================================================================
-- PHASE 9: MOVES MANAGEMENT SAMPLE DATA
-- ============================================================================
-- Run this AFTER running migration_phase9_moves_management.sql
-- This creates sample data for the donor pipeline, cultivation plans, and touchpoints
-- ============================================================================

-- First, let's get some client IDs to reference
-- We'll use a DO block to handle the dynamic IDs

DO $$
DECLARE
    v_org_id UUID;
    v_client1_id UUID;
    v_client2_id UUID;
    v_client3_id UUID;
    v_client4_id UUID;
    v_client5_id UUID;
    v_client6_id UUID;
    v_client7_id UUID;
    v_client8_id UUID;
    v_user_id UUID;
    v_plan1_id UUID;
    v_plan2_id UUID;
    v_plan3_id UUID;
    v_move1_id UUID;
    v_move2_id UUID;
    v_move3_id UUID;
    v_move4_id UUID;
    v_move5_id UUID;
    v_move6_id UUID;
    v_move7_id UUID;
    v_move8_id UUID;
BEGIN
    -- Get the organization ID
    SELECT id INTO v_org_id FROM organizations LIMIT 1;

    -- Get client IDs (we need at least 8 clients for good sample data)
    SELECT id INTO v_client1_id FROM clients WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 0;
    SELECT id INTO v_client2_id FROM clients WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 1;
    SELECT id INTO v_client3_id FROM clients WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 2;
    SELECT id INTO v_client4_id FROM clients WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 3;
    SELECT id INTO v_client5_id FROM clients WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 4;
    SELECT id INTO v_client6_id FROM clients WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 5;
    SELECT id INTO v_client7_id FROM clients WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 6;
    SELECT id INTO v_client8_id FROM clients WHERE organization_id = v_org_id ORDER BY created_at LIMIT 1 OFFSET 7;

    -- Get a user ID for assigned_to fields
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    -- If we don't have enough clients, we'll skip some entries
    IF v_client1_id IS NULL THEN
        RAISE NOTICE 'No clients found. Please run sample data for clients first.';
        RETURN;
    END IF;

    -- ========================================================================
    -- DONOR MOVES (Pipeline Entries)
    -- ========================================================================

    -- Client 1: Major donor in cultivation stage
    IF v_client1_id IS NOT NULL THEN
        INSERT INTO donor_moves (
            id, organization_id, client_id, current_stage, donor_type, giving_capacity,
            estimated_gift_amount, target_ask_date, probability, assigned_to,
            engagement_score, last_contact_date, next_action, notes, is_active
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client1_id, 'cultivation', 'major', 'major',
            50000.00, CURRENT_DATE + INTERVAL '60 days', 70, v_user_id,
            85, CURRENT_DATE - INTERVAL '5 days', 'Schedule site visit and impact tour',
            'Long-time community supporter. Recently expressed interest in funding our new community center project. Has capacity for transformational gift.',
            true
        ) RETURNING id INTO v_move1_id;
    END IF;

    -- Client 2: First-time donor in solicitation stage
    IF v_client2_id IS NOT NULL THEN
        INSERT INTO donor_moves (
            id, organization_id, client_id, current_stage, donor_type, giving_capacity,
            estimated_gift_amount, target_ask_date, probability, assigned_to,
            engagement_score, last_contact_date, next_action, notes, is_active
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client2_id, 'solicitation', 'first_time', 'medium',
            5000.00, CURRENT_DATE + INTERVAL '14 days', 60, v_user_id,
            72, CURRENT_DATE - INTERVAL '2 days', 'Prepare personalized proposal and schedule ask meeting',
            'Met at annual gala. Very interested in youth education programs. Ready for formal ask.',
            true
        ) RETURNING id INTO v_move2_id;
    END IF;

    -- Client 3: Repeat donor in stewardship
    IF v_client3_id IS NOT NULL THEN
        INSERT INTO donor_moves (
            id, organization_id, client_id, current_stage, donor_type, giving_capacity,
            estimated_gift_amount, target_ask_date, probability, assigned_to,
            engagement_score, last_contact_date, next_action, notes, is_active
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client3_id, 'stewardship', 'repeat', 'medium',
            2500.00, CURRENT_DATE + INTERVAL '180 days', 90, v_user_id,
            95, CURRENT_DATE - INTERVAL '1 day', 'Send quarterly impact report and thank you video',
            'Has given consistently for 3 years. Currently in stewardship cycle. Planning upgrade conversation in 6 months.',
            true
        ) RETURNING id INTO v_move3_id;
    END IF;

    -- Client 4: Corporate prospect in qualification
    IF v_client4_id IS NOT NULL THEN
        INSERT INTO donor_moves (
            id, organization_id, client_id, current_stage, donor_type, giving_capacity,
            estimated_gift_amount, target_ask_date, probability, assigned_to,
            engagement_score, last_contact_date, next_action, notes, is_active
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client4_id, 'qualification', 'corporate', 'high',
            25000.00, CURRENT_DATE + INTERVAL '90 days', 40, v_user_id,
            55, CURRENT_DATE - INTERVAL '10 days', 'Research company CSR priorities and prepare capability presentation',
            'New corporate contact through board member introduction. Need to learn more about their giving priorities.',
            true
        ) RETURNING id INTO v_move4_id;
    END IF;

    -- Client 5: Foundation in identification stage
    IF v_client5_id IS NOT NULL THEN
        INSERT INTO donor_moves (
            id, organization_id, client_id, current_stage, donor_type, giving_capacity,
            estimated_gift_amount, target_ask_date, probability, assigned_to,
            engagement_score, last_contact_date, next_action, notes, is_active
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client5_id, 'identification', 'foundation', 'major',
            100000.00, CURRENT_DATE + INTERVAL '120 days', 25, v_user_id,
            30, NULL, 'Review foundation guidelines and identify program alignment',
            'Family foundation that funds education and poverty alleviation. Need to research further before outreach.',
            true
        ) RETURNING id INTO v_move5_id;
    END IF;

    -- Client 6: Legacy donor prospect
    IF v_client6_id IS NOT NULL THEN
        INSERT INTO donor_moves (
            id, organization_id, client_id, current_stage, donor_type, giving_capacity,
            estimated_gift_amount, target_ask_date, probability, assigned_to,
            engagement_score, last_contact_date, next_action, notes, is_active
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client6_id, 'cultivation', 'legacy', 'high',
            NULL, NULL, 50, v_user_id,
            78, CURRENT_DATE - INTERVAL '14 days', 'Invite to planned giving seminar',
            'Long-time supporter interested in leaving legacy. Has mentioned us in conversation about estate planning.',
            true
        ) RETURNING id INTO v_move6_id;
    END IF;

    -- Client 7: Lapsed donor for reactivation
    IF v_client7_id IS NOT NULL THEN
        INSERT INTO donor_moves (
            id, organization_id, client_id, current_stage, donor_type, giving_capacity,
            estimated_gift_amount, target_ask_date, probability, assigned_to,
            engagement_score, last_contact_date, next_action, notes, is_active
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client7_id, 'lapsed', 'repeat', 'low',
            500.00, CURRENT_DATE + INTERVAL '30 days', 35, v_user_id,
            25, CURRENT_DATE - INTERVAL '180 days', 'Send personalized reactivation letter with impact update',
            'Previously gave $500/year for 2 years. Last gift was 18 months ago. Need to reconnect.',
            true
        ) RETURNING id INTO v_move7_id;
    END IF;

    -- Client 8: New prospect
    IF v_client8_id IS NOT NULL THEN
        INSERT INTO donor_moves (
            id, organization_id, client_id, current_stage, donor_type, giving_capacity,
            estimated_gift_amount, target_ask_date, probability, assigned_to,
            engagement_score, last_contact_date, next_action, notes, is_active
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client8_id, 'identification', 'prospect', 'medium',
            1000.00, CURRENT_DATE + INTERVAL '60 days', 30, v_user_id,
            40, CURRENT_DATE - INTERVAL '7 days', 'Add to newsletter list and invite to upcoming event',
            'Attended volunteer orientation. Shows interest in mission. Potential first-time donor.',
            true
        ) RETURNING id INTO v_move8_id;
    END IF;

    -- ========================================================================
    -- CULTIVATION PLANS
    -- ========================================================================

    -- Plan 1: Major Gift Cultivation for Client 1
    IF v_move1_id IS NOT NULL THEN
        INSERT INTO cultivation_plans (
            id, organization_id, client_id, move_id, name, description, goal_amount,
            start_date, target_completion_date, status, priority, assigned_to
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client1_id, v_move1_id,
            'Community Center Major Gift Campaign',
            'Cultivate relationship for lead gift to the new Community Center capital campaign. Focus on demonstrating impact and providing exclusive access to project planning.',
            50000.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '90 days',
            'active', 'high', v_user_id
        ) RETURNING id INTO v_plan1_id;

        -- Tasks for Plan 1
        INSERT INTO cultivation_tasks (organization_id, plan_id, title, description, due_date, status, assigned_to, sort_order) VALUES
        (v_org_id, v_plan1_id, 'Send architectural renderings', 'Share exclusive preview of Community Center designs', CURRENT_DATE - INTERVAL '20 days', 'completed', v_user_id, 1),
        (v_org_id, v_plan1_id, 'Host private lunch with ED', 'Arrange one-on-one lunch with Executive Director to discuss vision', CURRENT_DATE - INTERVAL '10 days', 'completed', v_user_id, 2),
        (v_org_id, v_plan1_id, 'Site visit to current programs', 'Tour existing facilities and meet program participants', CURRENT_DATE + INTERVAL '7 days', 'in_progress', v_user_id, 3),
        (v_org_id, v_plan1_id, 'Naming opportunity discussion', 'Present naming opportunities for major spaces', CURRENT_DATE + INTERVAL '21 days', 'pending', v_user_id, 4),
        (v_org_id, v_plan1_id, 'Prepare formal proposal', 'Create personalized gift proposal with recognition levels', CURRENT_DATE + INTERVAL '45 days', 'pending', v_user_id, 5),
        (v_org_id, v_plan1_id, 'Schedule ask meeting', 'Arrange formal solicitation meeting', CURRENT_DATE + INTERVAL '60 days', 'pending', v_user_id, 6);
    END IF;

    -- Plan 2: Corporate Partnership Development for Client 4
    IF v_move4_id IS NOT NULL THEN
        INSERT INTO cultivation_plans (
            id, organization_id, client_id, move_id, name, description, goal_amount,
            start_date, target_completion_date, status, priority, assigned_to
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client4_id, v_move4_id,
            'TechCorp Corporate Partnership',
            'Develop strategic corporate partnership including employee engagement, sponsorship, and CSR alignment.',
            25000.00, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '120 days',
            'active', 'medium', v_user_id
        ) RETURNING id INTO v_plan2_id;

        -- Tasks for Plan 2
        INSERT INTO cultivation_tasks (organization_id, plan_id, title, description, due_date, status, assigned_to, sort_order) VALUES
        (v_org_id, v_plan2_id, 'Research CSR priorities', 'Review annual report and CSR commitments', CURRENT_DATE - INTERVAL '7 days', 'completed', v_user_id, 1),
        (v_org_id, v_plan2_id, 'Prepare capability presentation', 'Create customized presentation on partnership opportunities', CURRENT_DATE + INTERVAL '7 days', 'in_progress', v_user_id, 2),
        (v_org_id, v_plan2_id, 'Schedule discovery meeting', 'Meet with CSR manager to understand priorities', CURRENT_DATE + INTERVAL '14 days', 'pending', v_user_id, 3),
        (v_org_id, v_plan2_id, 'Propose volunteer day', 'Offer corporate volunteer opportunity', CURRENT_DATE + INTERVAL '30 days', 'pending', v_user_id, 4),
        (v_org_id, v_plan2_id, 'Develop sponsorship proposal', 'Create tiered sponsorship package', CURRENT_DATE + INTERVAL '60 days', 'pending', v_user_id, 5);
    END IF;

    -- Plan 3: Stewardship plan for Client 3
    IF v_move3_id IS NOT NULL THEN
        INSERT INTO cultivation_plans (
            id, organization_id, client_id, move_id, name, description, goal_amount,
            start_date, target_completion_date, status, priority, assigned_to
        ) VALUES (
            gen_random_uuid(), v_org_id, v_client3_id, v_move3_id,
            'Annual Stewardship & Upgrade Path',
            'Maintain strong relationship through excellent stewardship while preparing for upgrade conversation.',
            5000.00, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '180 days',
            'active', 'medium', v_user_id
        ) RETURNING id INTO v_plan3_id;

        -- Tasks for Plan 3
        INSERT INTO cultivation_tasks (organization_id, plan_id, title, description, due_date, status, assigned_to, sort_order) VALUES
        (v_org_id, v_plan3_id, 'Send handwritten thank you', 'Personal note from ED thanking for continued support', CURRENT_DATE - INTERVAL '55 days', 'completed', v_user_id, 1),
        (v_org_id, v_plan3_id, 'Quarterly impact report', 'Send Q1 impact report with their giving highlighted', CURRENT_DATE - INTERVAL '30 days', 'completed', v_user_id, 2),
        (v_org_id, v_plan3_id, 'Birthday acknowledgment', 'Send birthday card with small gift', CURRENT_DATE - INTERVAL '5 days', 'completed', v_user_id, 3),
        (v_org_id, v_plan3_id, 'Invite to behind-the-scenes tour', 'Exclusive donor appreciation event', CURRENT_DATE + INTERVAL '30 days', 'pending', v_user_id, 4),
        (v_org_id, v_plan3_id, 'Annual giving review call', 'Personal call to share annual impact', CURRENT_DATE + INTERVAL '90 days', 'pending', v_user_id, 5),
        (v_org_id, v_plan3_id, 'Upgrade conversation', 'Discuss increased giving level for next year', CURRENT_DATE + INTERVAL '150 days', 'pending', v_user_id, 6);
    END IF;

    -- ========================================================================
    -- TOUCHPOINTS
    -- ========================================================================

    -- Touchpoints for Client 1 (Major donor)
    IF v_client1_id IS NOT NULL THEN
        INSERT INTO touchpoints (organization_id, client_id, move_id, type, subject, description, contact_date, sentiment, engagement_level, outcome, follow_up_required, follow_up_date, conducted_by) VALUES
        (v_org_id, v_client1_id, v_move1_id, 'meeting', 'Initial Discovery Meeting', 'Met for coffee to discuss their philanthropic interests. Very engaged and passionate about community development.', CURRENT_DATE - INTERVAL '45 days', 'positive', 'high', 'Agreed to tour our facilities', true, CURRENT_DATE - INTERVAL '30 days', v_user_id),
        (v_org_id, v_client1_id, v_move1_id, 'site_visit', 'Facility Tour', 'Toured main campus and met with program directors. Was visibly moved by student testimonials.', CURRENT_DATE - INTERVAL '30 days', 'very_positive', 'very_high', 'Expressed strong interest in Community Center project', true, CURRENT_DATE - INTERVAL '20 days', v_user_id),
        (v_org_id, v_client1_id, v_move1_id, 'email', 'Shared Architectural Plans', 'Sent exclusive preview of Community Center architectural renderings.', CURRENT_DATE - INTERVAL '20 days', 'positive', 'high', 'Replied with enthusiasm, asked about naming opportunities', true, CURRENT_DATE - INTERVAL '10 days', v_user_id),
        (v_org_id, v_client1_id, v_move1_id, 'phone', 'Follow-up Call', 'Discussed naming opportunities and gift levels. Mentioned interest in the main gathering space.', CURRENT_DATE - INTERVAL '5 days', 'positive', 'high', 'Will discuss with spouse and get back to us', true, CURRENT_DATE + INTERVAL '10 days', v_user_id);
    END IF;

    -- Touchpoints for Client 2 (First-time donor in solicitation)
    IF v_client2_id IS NOT NULL THEN
        INSERT INTO touchpoints (organization_id, client_id, move_id, type, subject, description, contact_date, sentiment, engagement_level, outcome, follow_up_required, follow_up_date, conducted_by) VALUES
        (v_org_id, v_client2_id, v_move2_id, 'event', 'Annual Gala Attendance', 'Met at annual gala. Very interested in youth education mission. Stayed to talk with students.', CURRENT_DATE - INTERVAL '30 days', 'very_positive', 'high', 'Requested more information about education programs', true, CURRENT_DATE - INTERVAL '25 days', v_user_id),
        (v_org_id, v_client2_id, v_move2_id, 'email', 'Program Information Packet', 'Sent detailed information about youth education programs including outcomes data.', CURRENT_DATE - INTERVAL '25 days', 'positive', 'medium', 'Acknowledged receipt, will review', true, CURRENT_DATE - INTERVAL '20 days', v_user_id),
        (v_org_id, v_client2_id, v_move2_id, 'phone', 'Discovery Call', 'Discussed their connection to education and reasons for giving. Teacher background - personal connection.', CURRENT_DATE - INTERVAL '14 days', 'positive', 'high', 'Ready for formal proposal', true, CURRENT_DATE - INTERVAL '7 days', v_user_id),
        (v_org_id, v_client2_id, v_move2_id, 'meeting', 'Lunch Meeting', 'Presented giving opportunities and discussed specific program sponsorship.', CURRENT_DATE - INTERVAL '2 days', 'positive', 'very_high', 'Agreed to consider $5,000 gift, meeting scheduled for next week', true, CURRENT_DATE + INTERVAL '7 days', v_user_id);
    END IF;

    -- Touchpoints for Client 3 (Stewardship)
    IF v_client3_id IS NOT NULL THEN
        INSERT INTO touchpoints (organization_id, client_id, move_id, type, subject, description, contact_date, sentiment, engagement_level, outcome, follow_up_required, follow_up_date, conducted_by) VALUES
        (v_org_id, v_client3_id, v_move3_id, 'thank_you', 'Handwritten Thank You Note', 'Sent personalized thank you note from Executive Director for recent gift.', CURRENT_DATE - INTERVAL '60 days', 'positive', 'medium', 'Donor replied with appreciation', false, NULL, v_user_id),
        (v_org_id, v_client3_id, v_move3_id, 'email', 'Q1 Impact Report', 'Shared quarterly impact report highlighting programs their giving supports.', CURRENT_DATE - INTERVAL '30 days', 'positive', 'medium', 'Opened and clicked through to stories', false, NULL, v_user_id),
        (v_org_id, v_client3_id, v_move3_id, 'other', 'Birthday Card', 'Sent birthday card signed by staff and small branded gift.', CURRENT_DATE - INTERVAL '5 days', 'very_positive', 'medium', 'Called to say thank you - felt very appreciated', true, CURRENT_DATE + INTERVAL '30 days', v_user_id),
        (v_org_id, v_client3_id, v_move3_id, 'phone', 'Check-in Call', 'Quarterly check-in call to share updates and gather feedback.', CURRENT_DATE - INTERVAL '1 day', 'positive', 'high', 'Expressed continued commitment, interested in volunteer opportunities', true, CURRENT_DATE + INTERVAL '14 days', v_user_id);
    END IF;

    -- Touchpoints for Client 4 (Corporate)
    IF v_client4_id IS NOT NULL THEN
        INSERT INTO touchpoints (organization_id, client_id, move_id, type, subject, description, contact_date, sentiment, engagement_level, outcome, follow_up_required, follow_up_date, conducted_by) VALUES
        (v_org_id, v_client4_id, v_move4_id, 'introduction', 'Board Member Introduction', 'Board member introduced us to company CSR director at networking event.', CURRENT_DATE - INTERVAL '21 days', 'positive', 'low', 'Exchanged business cards, agreed to follow up', true, CURRENT_DATE - INTERVAL '14 days', v_user_id),
        (v_org_id, v_client4_id, v_move4_id, 'email', 'Introduction Follow-up', 'Sent follow-up email with organization overview and partnership opportunities.', CURRENT_DATE - INTERVAL '14 days', 'neutral', 'low', 'Brief acknowledgment, busy with quarter-end', true, CURRENT_DATE - INTERVAL '7 days', v_user_id),
        (v_org_id, v_client4_id, v_move4_id, 'phone', 'Initial Phone Call', 'Brief call to introduce organization and understand their CSR focus areas.', CURRENT_DATE - INTERVAL '10 days', 'positive', 'medium', 'Interested in employee engagement opportunities', true, CURRENT_DATE + INTERVAL '7 days', v_user_id);
    END IF;

    -- Touchpoints for Client 6 (Legacy)
    IF v_client6_id IS NOT NULL THEN
        INSERT INTO touchpoints (organization_id, client_id, move_id, type, subject, description, contact_date, sentiment, engagement_level, outcome, follow_up_required, follow_up_date, conducted_by) VALUES
        (v_org_id, v_client6_id, v_move6_id, 'meeting', 'Annual Donor Appreciation Lunch', 'Long-time supporter attended donor lunch. Mentioned discussing estate plans with attorney.', CURRENT_DATE - INTERVAL '45 days', 'positive', 'medium', 'Expressed interest in learning about planned giving options', true, CURRENT_DATE - INTERVAL '30 days', v_user_id),
        (v_org_id, v_client6_id, v_move6_id, 'mail', 'Planned Giving Brochure', 'Mailed planned giving information packet with personalized letter.', CURRENT_DATE - INTERVAL '30 days', 'positive', 'low', 'No response yet', true, CURRENT_DATE - INTERVAL '14 days', v_user_id),
        (v_org_id, v_client6_id, v_move6_id, 'phone', 'Follow-up Call', 'Called to discuss planned giving materials. Very thoughtful about legacy.', CURRENT_DATE - INTERVAL '14 days', 'positive', 'high', 'Interested in attending planned giving seminar', true, CURRENT_DATE + INTERVAL '7 days', v_user_id);
    END IF;

    -- Touchpoints for Client 7 (Lapsed)
    IF v_client7_id IS NOT NULL THEN
        INSERT INTO touchpoints (organization_id, client_id, move_id, type, subject, description, contact_date, sentiment, engagement_level, outcome, follow_up_required, follow_up_date, conducted_by) VALUES
        (v_org_id, v_client7_id, v_move7_id, 'email', 'We Miss You Email', 'Sent personalized reactivation email highlighting new programs.', CURRENT_DATE - INTERVAL '14 days', 'neutral', 'low', 'Email opened but no action taken', true, CURRENT_DATE - INTERVAL '7 days', v_user_id),
        (v_org_id, v_client7_id, v_move7_id, 'phone', 'Reconnection Call', 'Left voicemail inviting to upcoming event and checking in.', CURRENT_DATE - INTERVAL '7 days', 'neutral', 'low', 'No callback received', true, CURRENT_DATE + INTERVAL '7 days', v_user_id);
    END IF;

    RAISE NOTICE 'Phase 9 sample data inserted successfully!';
    RAISE NOTICE 'Created % donor pipeline entries',
        (SELECT COUNT(*) FROM donor_moves WHERE organization_id = v_org_id);
    RAISE NOTICE 'Created % cultivation plans',
        (SELECT COUNT(*) FROM cultivation_plans WHERE organization_id = v_org_id);
    RAISE NOTICE 'Created % touchpoints',
        (SELECT COUNT(*) FROM touchpoints WHERE organization_id = v_org_id);

END $$;

-- Verify the data
SELECT 'Donor Pipeline Summary' as report;
SELECT current_stage, donor_type, COUNT(*) as count,
       ROUND(AVG(engagement_score)) as avg_engagement,
       SUM(estimated_gift_amount) as total_potential
FROM donor_moves
GROUP BY current_stage, donor_type
ORDER BY current_stage, donor_type;

SELECT 'Cultivation Plans Summary' as report;
SELECT cp.name, cp.status, cp.goal_amount,
       COUNT(ct.id) as total_tasks,
       COUNT(CASE WHEN ct.status = 'completed' THEN 1 END) as completed_tasks
FROM cultivation_plans cp
LEFT JOIN cultivation_tasks ct ON ct.plan_id = cp.id
GROUP BY cp.id, cp.name, cp.status, cp.goal_amount;

SELECT 'Touchpoints by Type' as report;
SELECT type, sentiment, COUNT(*) as count
FROM touchpoints
GROUP BY type, sentiment
ORDER BY type, sentiment;
