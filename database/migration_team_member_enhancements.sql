-- Migration: Team Member Enhancements
-- Adds profile picture, permission levels, and custom fields support to team_members table
-- This supports Google Drive-style permission levels (admin/editor/viewer)

-- Add new columns to team_members table
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS permission VARCHAR(20) DEFAULT 'viewer',
ADD COLUMN IF NOT EXISTS custom_fields JSONB,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add constraint for valid permission values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'team_members_permission_check'
    ) THEN
        ALTER TABLE team_members
        ADD CONSTRAINT team_members_permission_check
        CHECK (permission IN ('admin', 'editor', 'viewer'));
    END IF;
END $$;

-- Create index on permission for filtering
CREATE INDEX IF NOT EXISTS idx_team_members_permission ON team_members(permission);

-- Create index on custom_fields for JSON queries
CREATE INDEX IF NOT EXISTS idx_team_members_custom_fields ON team_members USING GIN (custom_fields);

-- Update existing records to have default permission if null
UPDATE team_members SET permission = 'viewer' WHERE permission IS NULL;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS team_members_updated_at_trigger ON team_members;
CREATE TRIGGER team_members_updated_at_trigger
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_team_members_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN team_members.profile_picture IS 'Base64-encoded profile picture or URL';
COMMENT ON COLUMN team_members.permission IS 'Permission level: admin, editor, or viewer (like Google Drive)';
COMMENT ON COLUMN team_members.custom_fields IS 'JSON array of custom fields (phone types, social, work details, etc.)';
COMMENT ON COLUMN team_members.last_active_at IS 'Timestamp of last activity';
