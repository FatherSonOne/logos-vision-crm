# Phase 2: Create Comprehensive Settings Menu

**Status:** Unfinished  
**Priority:** Critical  
**Difficulty:** Medium (5-6 hours)  
**Location:** F:\logos-vision-crm\development\02-CreateSettingsMenu.md

---

## 🎯 Overview

Build a professional Settings hub with organized sections for all app configuration. This becomes the central location for all user preferences and admin controls.

### Settings Categories:
1. **Account & Profile** - User info, password, profile picture
2. **Appearance** - Dark/Light mode, color scheme, font size
3. **Search & AI** - Web search, AI models, research settings (Phase 1 completes here)
4. **Integrations** - Supabase, Google, Pulse, API keys
5. **Connectors** - Calendar sync, Document storage, Email
6. **Notifications** - Email alerts, in-app notifications, sound
7. **Privacy & Security** - Data visibility, two-factor auth, activity log
8. **Team & Organization** - Team member settings, roles, permissions
9. **Export & Backup** - Download data, scheduled backups
10. **Advanced** - Developer options, debug mode, clear cache

---

## 📋 Step-by-Step Instructions

### FOR YOU (Project Manager):

1. **Audit Current Settings**
   - List every setting currently scattered in the app
   - Check if Settings.tsx exists
   - Identify what's configurable vs. what should be

2. **Define Settings Structure**
   - Which settings should be per-user?
   - Which should be organization-wide?
   - Which need Supabase storage?
   - Which can use localStorage?

3. **Plan Navigation**
   - Where will Settings live? (Sidebar menu? Right-click menu? Top right profile icon?)
   - Should it be modal or full page?
   - Do you want Settings tab in existing pages?

4. **Test All Sections**
   - Each section should work independently
   - Test saving and persistence
   - Verify cascading changes work

---

### FOR CLAUDE CODE:

#### **PROMPT TO USE:**

I need to create a comprehensive Settings page/modal for Logos Vision CRM.

Requirements:

Settings Sections (in this order):

Account & Profile

Display name, email

Profile picture upload

Change password

Connected accounts

Appearance

Dark/Light/Auto theme toggle

Color accent selection

Font size preference

Compact/Normal/Expanded view modes

Search & AI

Web search toggle (from Phase 1)

Default AI model (Gemini, Claude, etc.)

Research depth (quick/normal/deep)

Search result limits

Integrations

Supabase connection status

Google services (Gmail, Drive, Calendar)

Pulse communication app connection

API documentation link

Connectors

Calendar sync (Google Calendar, Outlook)

Document storage (Google Drive, OneDrive, Dropbox)

Email service (Gmail, Outlook, SendGrid)

Toggle for each connector

Notifications

Email notifications toggle

In-app notification toggle

Sound notifications

Notification frequency (real-time, hourly, daily)

Which events to notify on

Privacy & Security

Data visibility settings

Two-factor authentication setup

Session management (active sessions list)

Activity log / Login history

Export personal data

Team Settings

Organization name

Team member list

Role management

Permission overview

Backup & Export

Backup frequency

Last backup date/time

Export data (CSV, JSON, PDF)

Download database backup

Advanced

Developer mode toggle

Debug logging

Clear cache button

Reset all settings button

Version info

Design:

Use tabs or accordion sections to organize

Each setting should have a description/tooltip

Show save status (unsaved changes indicator)

Include a search bar to find settings quickly

Color-code sections (e.g., blue for Account, green for Integrations)

Please create or update the Settings component with these sections. Use Supabase for persistent storage where needed.


---

## 🔧 Technical Architecture

### Database Schema (new table needed):

CREATE TABLE user_settings (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES auth.users(id),

-- Appearance
theme TEXT DEFAULT 'auto', -- 'light', 'dark', 'auto'
accent_color TEXT DEFAULT 'blue',
font_size INT DEFAULT 14,
view_mode TEXT DEFAULT 'normal', -- 'compact', 'normal', 'expanded'

-- Search & AI
web_search_enabled BOOLEAN DEFAULT TRUE,
default_ai_model TEXT DEFAULT 'gemini',
research_depth TEXT DEFAULT 'normal',
search_result_limit INT DEFAULT 10,

-- Notifications
email_notifications BOOLEAN DEFAULT TRUE,
inapp_notifications BOOLEAN DEFAULT TRUE,
sound_notifications BOOLEAN DEFAULT TRUE,
notification_frequency TEXT DEFAULT 'realtime',

-- Privacy
data_visibility TEXT DEFAULT 'private', -- 'private', 'team', 'public'
two_factor_enabled BOOLEAN DEFAULT FALSE,

-- Preferences
timezone TEXT DEFAULT 'America/Chicago',
language TEXT DEFAULT 'en',
date_format TEXT DEFAULT 'MM/DD/YYYY',

created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

-- Integrations table
CREATE TABLE user_integrations (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES auth.users(id),

-- Connectors
google_connected BOOLEAN DEFAULT FALSE,
google_calendar_sync BOOLEAN DEFAULT FALSE,
google_drive_sync BOOLEAN DEFAULT FALSE,

pulse_connected BOOLEAN DEFAULT FALSE,
pulse_sync_enabled BOOLEAN DEFAULT FALSE,

microsoft_connected BOOLEAN DEFAULT FALSE,
outlook_sync BOOLEAN DEFAULT FALSE,
onedrive_sync BOOLEAN DEFAULT FALSE,

-- API Keys (encrypted)
custom_api_key TEXT, -- encrypted
custom_api_key_updated_at TIMESTAMP,

created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);


### Component Structure:

Settings/
├── Settings.tsx (Main container)
├── sections/
│ ├── AccountSettings.tsx
│ ├── AppearanceSettings.tsx
│ ├── SearchAiSettings.tsx
│ ├── IntegrationSettings.tsx
│ ├── ConnectorSettings.tsx
│ ├── NotificationSettings.tsx
│ ├── PrivacySecuritySettings.tsx
│ ├── TeamSettings.tsx
│ ├── BackupExportSettings.tsx
│ └── AdvancedSettings.tsx
├── SettingsTabs.tsx (Tab navigation)
├── SettingsSearch.tsx (Quick search within settings)
└── SettingsSidebar.tsx (Category navigation)


---

## 🎨 UI Layout

┌─────────────────────────────────────────────────┐
│ Settings [X] │
├──────────────────┬──────────────────────────────┤
│ Left Sidebar │ Settings Content Area │
│ ────────────────│ │
│ ▶ Account │ [Search Settings...] │
│ ▶ Appearance │ │
│ ▶ Search & AI │ ### Account Settings │
│ ▶ Integrations │ Display Name: [] │
│ ▶ Connectors │ Email: [] │
│ ▶ Notifications │ ☐ Two-Factor Auth │
│ ▶ Privacy │ │
│ ▶ Team │ [Save Changes] [Discard] │
│ ▶ Backup │ │
│ ▶ Advanced │ │
└──────────────────┴──────────────────────────────┘


---

## 📊 Data Persistence Strategy

1. **localStorage** for:
   - Theme preference
   - Font size
   - View mode
   - (Syncs to Supabase on login)

2. **Supabase** for:
   - All user_settings
   - Integration credentials
   - Privacy settings
   - Team settings
   - Activity logs

3. **Context API** for:
   - Active theme (synced globally)
   - Current user settings (for quick access)
   - Theme change listeners

---

## 🔐 Security Considerations

1. **API Keys** - Encrypt before storing in Supabase
2. **Passwords** - Use Supabase auth, never store manually
3. **Sensitive Data** - Mark fields as "encrypted at rest"
4. **Audit Logging** - Log who accessed settings and when
5. **Rate Limiting** - Prevent settings spam

---

## ✅ Completion Checklist

- [ ] Database tables created (user_settings, user_integrations)
- [ ] Settings component structure created
- [ ] All 10 sections implemented
- [ ] Settings persist to Supabase
- [ ] localStorage sync works
- [ ] Settings accessible from main nav
- [ ] Search within settings works
- [ ] Theme change applies globally
- [ ] All toggles save immediately
- [ ] Confirmation for destructive actions (reset, delete)
- [ ] Mobile responsive design
- [ ] Tooltips/help text added

---

## 🔗 Related Phases

- Builds on: **Phase 1** (Web Search Toggle)
- Foundation for: **Phase 9** (Integration with Pulse)

---

**Estimated Time:** 5-6 hours  
**Next Phase:** 03-CharityHubUniqueDevelopment.md
