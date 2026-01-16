-- ==========================================
-- INVITATIONS TABLE MIGRATION
-- ==========================================
-- Creates the invitations table for team member invitations
-- Run this in Supabase SQL Editor

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    invited_by UUID REFERENCES auth.users(id),
    invited_by_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to view invitations they created
CREATE POLICY "Users can view their own invitations"
    ON public.invitations
    FOR SELECT
    USING (auth.uid() = invited_by);

-- Allow authenticated users to create invitations
CREATE POLICY "Authenticated users can create invitations"
    ON public.invitations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own invitations (for resend/cancel)
CREATE POLICY "Users can update their own invitations"
    ON public.invitations
    FOR UPDATE
    USING (auth.uid() = invited_by);

-- Allow users to delete their own invitations
CREATE POLICY "Users can delete their own invitations"
    ON public.invitations
    FOR DELETE
    USING (auth.uid() = invited_by);

-- Allow anyone to read invitation by token (for accepting)
CREATE POLICY "Anyone can read invitation by token"
    ON public.invitations
    FOR SELECT
    USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invitations_updated_at
    BEFORE UPDATE ON public.invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_invitations_updated_at();

-- ==========================================
-- TEAM MEMBERS TABLE (if not exists)
-- ==========================================
-- This table links authenticated users to team membership

CREATE TABLE IF NOT EXISTS public.team_members_auth (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.team_members_auth ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members_auth
CREATE POLICY "Users can view all team members"
    ON public.team_members_auth
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert team members"
    ON public.team_members_auth
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update team members"
    ON public.team_members_auth
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_team_members_auth_user_id ON public.team_members_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_auth_email ON public.team_members_auth(email);

-- Grant permissions
GRANT ALL ON public.invitations TO authenticated;
GRANT ALL ON public.team_members_auth TO authenticated;

COMMENT ON TABLE public.invitations IS 'Stores team invitation records for Logos Vision CRM';
COMMENT ON TABLE public.team_members_auth IS 'Links authenticated users to team membership with roles';
