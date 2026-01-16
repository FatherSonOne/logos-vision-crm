-- ============================================================================
-- ADD SAMPLE DATA TO SUPABASE
-- ============================================================================
-- This adds a few sample projects, cases, and donations for testing
-- Run this AFTER adding the missing columns
-- ============================================================================

DO $$
DECLARE
  sample_client_id UUID;
  sample_project_id UUID;
  project_count INT;
BEGIN
  -- Get a client to use for samples (use LIMIT 1 to ensure single row)
  SELECT id INTO STRICT sample_client_id FROM clients ORDER BY created_at LIMIT 1;
  
  IF sample_client_id IS NULL THEN
    RAISE NOTICE '⚠️  No clients found. Please add clients first.';
    RETURN;
  END IF;

  RAISE NOTICE '📝 Adding sample data using client ID: %', sample_client_id;

  -- Check if we already have projects to avoid duplicates
  SELECT COUNT(*) INTO project_count FROM projects;
  
  IF project_count > 0 THEN
    RAISE NOTICE 'ℹ️  Found % existing projects. Skipping project creation to avoid duplicates.', project_count;
  ELSE
    -- Add 3 sample projects
    INSERT INTO projects (name, description, status, start_date, end_date, budget, client_id, notes)
    VALUES 
      (
        'Website Redesign Project',
        'Complete overhaul of organization website with modern design',
        'in_progress',
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '60 days',
        15000.00,
        sample_client_id,
        'Client wants mobile-first design'
      )
    RETURNING id INTO sample_project_id;

    INSERT INTO projects (name, description, status, start_date, end_date, budget, client_id, notes)
    VALUES 
      (
        'Annual Fundraising Campaign',
        'Year-end fundraising campaign to support youth programs',
        'planning',
        CURRENT_DATE + INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '90 days',
        5000.00,
        sample_client_id,
        'Target: $50,000 in donations'
      );

    INSERT INTO projects (name, description, status, start_date, end_date, budget, client_id, notes)
    VALUES 
      (
        'Community Outreach Initiative',
        'Expand community engagement through local events',
        'completed',
        CURRENT_DATE - INTERVAL '90 days',
        CURRENT_DATE - INTERVAL '10 days',
        8000.00,
        sample_client_id,
        'Reached 500+ community members'
      );

    RAISE NOTICE '✅ Added 3 sample projects';

    -- Add sample tasks for the first project
    IF sample_project_id IS NOT NULL THEN
      INSERT INTO tasks (title, description, status, due_date, project_id)
      VALUES 
        ('Design mockups', 'Create initial design mockups for review', 'completed', CURRENT_DATE - INTERVAL '20 days', sample_project_id),
        ('Develop homepage', 'Build responsive homepage', 'in_progress', CURRENT_DATE + INTERVAL '10 days', sample_project_id),
        ('User testing', 'Conduct user testing sessions', 'pending', CURRENT_DATE + INTERVAL '30 days', sample_project_id);

      RAISE NOTICE '✅ Added 3 sample tasks';
    END IF;
  END IF;

  -- Add 3 sample cases
  INSERT INTO cases (title, description, status, priority, client_id, category)
  VALUES 
    (
      'Website Login Issues',
      'Users reporting intermittent login failures',
      'open',
      'high',
      sample_client_id,
      'Technical Support'
    ),
    (
      'Grant Application Assistance',
      'Help needed with federal grant application',
      'in_progress',
      'medium',
      sample_client_id,
      'Consulting'
    ),
    (
      'Social Media Strategy',
      'Request for social media marketing guidance',
      'resolved',
      'low',
      sample_client_id,
      'Marketing'
    );

  RAISE NOTICE '✅ Added 3 sample cases';

  -- Add 5 sample donations
  INSERT INTO donations (amount, date, method, client_id, campaign, is_recurring, tax_receipt_sent)
  VALUES 
    (1000.00, CURRENT_DATE - INTERVAL '5 days', 'credit_card', sample_client_id, 'Year-End Campaign', false, true),
    (250.00, CURRENT_DATE - INTERVAL '15 days', 'check', sample_client_id, 'General Fund', false, true),
    (500.00, CURRENT_DATE - INTERVAL '30 days', 'bank_transfer', sample_client_id, 'Youth Programs', false, false),
    (100.00, CURRENT_DATE - INTERVAL '45 days', 'credit_card', sample_client_id, 'General Fund', true, true),
    (2500.00, CURRENT_DATE - INTERVAL '60 days', 'check', sample_client_id, 'Building Fund', false, true);

  RAISE NOTICE '✅ Added 5 sample donations';

  RAISE NOTICE '';
  RAISE NOTICE '🎉 Sample data created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  • 3 Projects (with 3 tasks)';
  RAISE NOTICE '  • 3 Cases';
  RAISE NOTICE '  • 5 Donations ($4,350 total)';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Your CRM is ready to use!';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
    RAISE NOTICE 'HINT: Make sure you have run add-final-columns.sql first';
END $$;
