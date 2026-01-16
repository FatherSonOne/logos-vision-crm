-- Migration: Add missing columns to user_settings table
-- Run this if the user_settings table already exists but is missing columns

-- First, check what columns exist and add any missing ones

-- Account settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- General settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255);
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fiscal_year_start VARCHAR(20) DEFAULT 'january';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'America/New_York';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Appearance settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS theme_mode VARCHAR(20) DEFAULT 'system';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20) DEFAULT 'cyan';
-- font_size might exist as INTEGER, change to VARCHAR
DO $$
BEGIN
    -- Check if font_size exists and is INTEGER, then drop and recreate as VARCHAR
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_settings' AND column_name = 'font_size' AND data_type = 'integer'
    ) THEN
        ALTER TABLE user_settings DROP COLUMN font_size;
        ALTER TABLE user_settings ADD COLUMN font_size VARCHAR(20) DEFAULT 'medium';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_settings' AND column_name = 'font_size'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN font_size VARCHAR(20) DEFAULT 'medium';
    END IF;
END $$;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS compact_mode BOOLEAN DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS show_animations BOOLEAN DEFAULT true;

-- AI & Search settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS web_search_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS search_result_limit INTEGER DEFAULT 10;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS ai_research_mode BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS default_ai_model VARCHAR(50) DEFAULT 'claude-sonnet';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS research_depth VARCHAR(20) DEFAULT 'balanced';

-- Notification settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS in_app_notifications BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notification_sound BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notification_frequency VARCHAR(20) DEFAULT 'instant';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notify_new_donations BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notify_task_reminders BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notify_team_updates BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notify_system_alerts BOOLEAN DEFAULT true;

-- Privacy & Security settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS data_visibility VARCHAR(20) DEFAULT 'team';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS activity_logging BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Advanced settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS developer_mode BOOLEAN DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS debug_logging BOOLEAN DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS experimental_features BOOLEAN DEFAULT false;

-- Backup settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS auto_backup BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS backup_frequency VARCHAR(20) DEFAULT 'weekly';

-- Metadata (these likely already exist)
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Add unique constraint on user_id (required for ON CONFLICT upsert)
-- This will fail silently if constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_settings_user_id_key'
    ) THEN
        ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Recreate the updated_at trigger
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_settings_updated_at_trigger ON user_settings;
CREATE TRIGGER user_settings_updated_at_trigger
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();
