-- Migration: Create Default Households for Existing Contacts
-- This script creates individual households for contacts that don't belong to any household
-- Run this AFTER the household tables have been created (migration_households.sql)

-- Create households for all active contacts
-- that don't already have a household_id assigned

DO $$
DECLARE
    contact_record RECORD;
    new_household_id UUID;
BEGIN
    -- Loop through all contacts without a household
    FOR contact_record IN
        SELECT id, name, phone, email
        FROM clients
        WHERE household_id IS NULL
          AND is_active = true
    LOOP
        -- Create a new household for this contact
        INSERT INTO households (name, phone, email, is_active)
        VALUES (
            COALESCE(contact_record.name, 'Unknown') || ' Household',
            contact_record.phone,
            contact_record.email,
            true
        )
        RETURNING id INTO new_household_id;

        -- Update the contact with the new household_id
        UPDATE clients
        SET household_id = new_household_id,
            updated_at = NOW()
        WHERE id = contact_record.id;

        -- Also create a household_relationships entry
        INSERT INTO household_relationships (household_id, client_id, relationship_type, is_primary)
        VALUES (new_household_id, contact_record.id, 'Head of Household', true);

        RAISE NOTICE 'Created household for contact: %', contact_record.name;
    END LOOP;

    -- Log summary
    RAISE NOTICE 'Migration complete. Created households for individual contacts.';
END $$;

-- Optional: Verify the migration
SELECT
    COUNT(*) as total_contacts,
    COUNT(household_id) as contacts_with_household,
    COUNT(*) - COUNT(household_id) as contacts_without_household
FROM clients
WHERE is_active = true;

-- Show household summary
SELECT
    COUNT(*) as total_households,
    SUM(member_count) as total_members
FROM household_totals
WHERE is_active = true;
