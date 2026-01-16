-- Migration: User Settings
-- Creates a table to persist user settings/preferences to Supabase
-- This allows settings to sync across devices and persist beyond localStorage

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Account settings
    display_name VARCHAR(255),
    profile_picture TEXT,

    -- General settings
    organization_name VARCHAR(255),
    fiscal_year_start VARCHAR(20) DEFAULT 'january',
    currency VARCHAR(10) DEFAULT 'USD',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    language VARCHAR(10) DEFAULT 'en',

    -- Appearance settings
    theme_mode VARCHAR(20) DEFAULT 'system',
    accent_color VARCHAR(20) DEFAULT 'cyan',
    font_size VARCHAR(20) DEFAULT 'medium',
    compact_mode BOOLEAN DEFAULT false,
    show_animations BOOLEAN DEFAULT true,

    -- AI & Search settings
    web_search_enabled BOOLEAN DEFAULT true,
    search_result_limit INTEGER DEFAULT 10,
    ai_research_mode BOOLEAN DEFAULT true,
    default_ai_model VARCHAR(50) DEFAULT 'claude-sonnet',
    research_depth VARCHAR(20) DEFAULT 'balanced',

    -- Notification settings
    email_notifications BOOLEAN DEFAULT true,
    in_app_notifications BOOLEAN DEFAULT true,
    notification_sound BOOLEAN DEFAULT true,
    notification_frequency VARCHAR(20) DEFAULT 'instant',
    notify_new_donations BOOLEAN DEFAULT true,
    notify_task_reminders BOOLEAN DEFAULT true,
    notify_team_updates BOOLEAN DEFAULT true,
    notify_system_alerts BOOLEAN DEFAULT true,

    -- Privacy & Security settings
    data_visibility VARCHAR(20) DEFAULT 'team',
    activity_logging BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,

    -- Advanced settings
    developer_mode BOOLEAN DEFAULT false,
    debug_logging BOOLEAN DEFAULT false,
    experimental_features BOOLEAN DEFAULT false,

    -- Backup settings
    auto_backup BOOLEAN DEFAULT true,
    backup_frequency VARCHAR(20) DEFAULT 'weekly',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one settings record per user
    UNIQUE(user_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own settings
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings"
    ON user_settings FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS user_settings_updated_at_trigger ON user_settings;
CREATE TRIGGER user_settings_updated_at_trigger
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_settings IS 'Stores user preferences and settings that sync across devices';
COMMENT ON COLUMN user_settings.user_id IS 'References the authenticated user from auth.users';
COMMENT ON COLUMN user_settings.theme_mode IS 'UI theme: system, light, or dark';
COMMENT ON COLUMN user_settings.accent_color IS 'Primary accent color for UI';
COMMENT ON COLUMN user_settings.compact_mode IS 'Whether to use compact UI mode';
COMMENT ON COLUMN user_settings.developer_mode IS 'Enables developer/debug features';
