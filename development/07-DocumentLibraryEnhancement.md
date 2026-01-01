📄 File 8: 06-CalendarPageEnhancements.md
Copy everything below this line:

text
# Phase 6: Calendar Page - Enhancements & Sync Features

**Status:** Unfinished  
**Priority:** High  
**Difficulty:** Medium-High (7 hours)  
**Location:** F:\logos-vision-crm\development\06-CalendarPageEnhancements.md

---

## 🎯 Overview

The Calendar exists but has issues:
- Cursor orb and context menu placement errors
- Timeline view glitches
- Navigation challenges
- Settings location unclear
- Need Google Calendar sync

---

## 📋 Step-by-Step Instructions

### FOR YOU (Project Manager):

1. **Test Current Calendar**
   - Click events to verify context menu appears correctly
   - Test timeline view - look for cursor orb issues
   - Try navigating between months
   - Check if settings accessible

2. **Identify Bugs**
   - Document where cursor/orb appears incorrectly
   - List navigation issues
   - Note any other errors

3. **Define Sync Features**
   - Should calendar sync with Google Calendar?
   - What about Outlook?
   - Bi-directional sync?

---

### FOR CLAUDE CODE:

#### **PROMPT TO USE:**

I need to enhance the Calendar page to fix bugs and add powerful sync features.

Issues to Fix:

Cursor orb position is incorrect when clicking on events

Context menu appears in wrong location

Timeline view has rendering errors

Navigation between views is confusing

Calendar Settings need better organization

Enhancements to Add:

Bug Fixes

Debug and fix cursor orb positioning (should appear at click point)

Fix context menu positioning (should be near cursor)

Fix timeline view rendering issues

Improve view transitions

Enhanced Navigation

Clear view selector buttons: Month / Week / Day / Timeline / Agenda

Mini calendar for quick date navigation

Today button

Previous/Next navigation arrows

Jump to date picker

Breadcrumb showing current view (e.g., December 2024 > Week View)

Event Management

Click event to see details

Right-click context menu: Edit, Delete, Duplicate, Change Color, Share

Drag to reschedule

Drag to change duration

Quick event creation (click empty time slot)

Recurring event support

Calendar Sync with External Services

a) Google Calendar Sync

Connect to Google account (OAuth)

Import events from Google Calendar

Create events that sync to Google

Two-way sync (changes in Logos update Google and vice versa)

Sync interval: Real-time, every hour, daily

Selective sync (choose which calendars to sync)

b) Outlook Calendar Sync

Same as Google but for Outlook

Microsoft OAuth integration

c) Calendar Settings (move from elsewhere or create menu)

Sync preferences per calendar

Sync frequency

Which events to sync (filters)

Default calendar selection

Calendar color assignment

Time zone setting

Week start day preference

Work hours display

Holiday calendar inclusion

Calendar Views Enhancement

a) Month View

Better event display

Show event count indicator

Color-coded by calendar source

Week numbers option

Event preview on hover

b) Week View

Time grid (hourly slots)

All-day events at top

Drag to create/reschedule

Current time indicator

Hour labels

Multi-week option (2 weeks)

c) Day View

Hour-by-hour breakdown

Time blocks for events

Quick add event at time slot

Task list sidebar for that day

Weather (optional)

d) Timeline View (Fix existing)

Horizontal timeline

Projects/events as bars

Drag to reschedule

Show dependencies

Current date indicator

Zoom in/out

e) Agenda View

List of upcoming events

Time + Event title + Location

Sortable, filterable

Quick preview on hover

Click to open details

Integration Features

Show Logos Vision events (Projects, Tasks, Meetings)

Link calendar events to projects

Link calendar events to tasks

Automatic meeting notes capture

Video meeting links (Zoom, Teams, Google Meet)

Advanced Features

Event color coding (by type, by project, by category)

Search events

Filter by calendar source

Filter by event type

Reminders/notifications

Event notifications (15 min before, 1 hour, 1 day)

Mark as busy/free/tentative

Mobile Responsive

Touch-friendly date selection

Simplified event creation on mobile

Mobile-optimized event details

Please fix the bugs and implement calendar sync with Google and Outlook, plus all enhanced features.

text

---

## 🔧 Technical Implementation

### Database Schema (Additions):

CREATE TABLE calendar_syncs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES auth.users(id),

-- Sync Service
sync_type TEXT NOT NULL, -- 'google', 'outlook', 'ical'
sync_enabled BOOLEAN DEFAULT TRUE,

-- OAuth
access_token TEXT, -- Encrypted
refresh_token TEXT, -- Encrypted
token_expires_at TIMESTAMP,

-- Sync Settings
sync_frequency TEXT DEFAULT 'realtime', -- 'realtime', 'hourly', 'daily'
bi_directional BOOLEAN DEFAULT TRUE,
last_sync_at TIMESTAMP,

-- Calendar Selection
external_calendar_id TEXT,
external_calendar_name TEXT,
sync_to_logos BOOLEAN DEFAULT TRUE, -- Import to Logos
sync_from_logos BOOLEAN DEFAULT TRUE, -- Export from Logos

created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE calendar_events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id),

title TEXT NOT NULL,
description TEXT,
location TEXT,

-- Time
start_time TIMESTAMP NOT NULL,
end_time TIMESTAMP NOT NULL,
all_day BOOLEAN DEFAULT FALSE,

-- Recurrence
recurring BOOLEAN DEFAULT FALSE,
recurrence_rule TEXT, -- iCalendar RRULE format

-- Links
project_id UUID REFERENCES projects(id),
task_id UUID REFERENCES tasks(id),

-- Sync Info
source TEXT DEFAULT 'logos', -- 'logos', 'google', 'outlook'
external_event_id TEXT,

-- Display
color TEXT DEFAULT '#3B82F6',
status TEXT DEFAULT 'scheduled', -- 'scheduled', 'tentative', 'busy', 'free'

-- Notifications
reminder_minutes INT DEFAULT 15,

created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

text

### Component Structure:

Calendar/
├── CalendarPage.tsx (Main container)
├── views/
│ ├── MonthView.tsx
│ ├── WeekView.tsx
│ ├── DayView.tsx
│ ├── TimelineView.tsx (Fix)
│ └── AgendaView.tsx
├── CalendarHeader.tsx (Navigation & view selector)
├── CalendarSidebar.tsx (Mini calendar, filters)
├── EventDetail.tsx
├── EventCreate.tsx
├── CalendarSync.tsx (Sync settings)
├── SyncSettings/
│ ├── GoogleCalendarSync.tsx
│ ├── OutlookCalendarSync.tsx
│ └── SyncPreferences.tsx
└── services/
├── googleCalendarService.ts
├── outlookCalendarService.ts
└── calendarSyncService.ts

text

---

## 🔗 OAuth Setup

### Google Calendar:
1. Create OAuth app in Google Cloud Console
2. Set up redirect URI
3. Get Client ID and Secret
4. Add to environment variables

### Outlook Calendar:
1. Register app in Azure AD
2. Get Client ID and Secret
3. Add redirect URI
4. Add to environment variables

---

## ✅ Completion Checklist

- [ ] Cursor orb positioning fixed
- [ ] Context menu positioning fixed
- [ ] Timeline view bugs fixed
- [ ] Navigation improved
- [ ] Month view enhanced
- [ ] Week view functional
- [ ] Day view implemented
- [ ] Agenda view created
- [ ] Google Calendar OAuth setup
- [ ] Outlook Calendar OAuth setup
- [ ] Bi-directional sync working
- [ ] Event creation working
- [ ] Event editing working
- [ ] Recurring events working
- [ ] Reminders functional
- [ ] Mobile responsive
- [ ] Accessibility tested

---

**Estimated Time:** 7 hours  
**Next Phase:** 07-DocumentLibraryEnhancement.md
End of File 8

📄 File 9: 07-DocumentLibraryEnhancement.md
Copy everything below this line:

text
# Phase 7: Document Library - Smart Sync & Integration

**Status:** Unfinished  
**Priority:** Critical  
**Difficulty:** High (8-9 hours)  
**Location:** F:\logos-vision-crm\development\07-DocumentLibraryEnhancement.md

---

## 🎯 Overview & Research

### What Makes Advanced Document Management?

Leading platforms (Salesforce, Microsoft 365, Notion) provide:

1. **Multi-Source Sync** - Google Drive, OneDrive, Dropbox, Pulse (your communication app)
2. **Smart Organization** - Automatic tagging, AI categorization
3. **Meeting Integration** - Automatically capture meeting notes, chat logs
4. **Version Control** - Track changes, rollback capabilities
5. **Collaboration** - Comments, suggestions, real-time editing links
6. **Export Options** - Docs, PDF, Sheets, Presentations
7. **Search** - Full-text search across all documents
8. **Branching Navigation** - Replace tabs with intuitive menu system

---

## 📋 Step-by-Step Instructions

### FOR YOU (Project Manager):

1. **Audit Current Document Library**
   - What storage services do you use? (Google Drive? OneDrive? Dropbox?)
   - How are documents currently organized?
   - What Pulse features need to sync? (Meeting notes? Chat logs?)

2. **Define Document Categories**
   - Proposals, Contracts, Reports, Meeting Notes, Chat Archives
   - Financial documents, Strategy docs, Case files
   - Client deliverables

3. **Decide Integration Priority**
   - Which external services matter most?
   - How often to sync?
   - Real-time or scheduled?

---

### FOR CLAUDE CODE:

#### **PROMPT TO USE:**

I need to build an advanced Document Library with multi-source sync and Pulse integration.

Current situation:

Document Library exists but uses tabs (need to change to branching menu)

No external sync

Limited organization

No Pulse integration

Create the following:

Branching Menu System (Replace Tabs)
Instead of tabs, create a hierarchical menu:

📁 Document Library
├── 📂 My Documents
├── 📂 Client Deliverables
├── 📂 Financial Reports
├── 📂 Meeting Notes
├── 📂 Proposals & Contracts
├── 📂 Case Files
├── 🔗 Connected Services
│ ├── Google Drive Sync
│ ├── OneDrive Sync
│ └── Dropbox Sync
├── 💬 Pulse Integration
│ ├── Meeting Notes
│ ├── Team Chat Logs
│ └── Communication Archive
└── ⚙️ Settings
├── Sync Preferences
├── Auto-Tagging
└── Storage Limits

Core Document Features

Upload documents (drag & drop)

Organize in folders

Auto-tagging (based on content/filename)

Search all documents (full-text)

Preview (Google Docs, PDF, images)

Download/Export

Share with team members

Comments & collaboration

Version history

Google Drive Integration

OAuth authentication

List files from Google Drive

Sync frequency options (real-time, hourly, daily)

Two-way sync capability

Selective folder sync

Automatic organization in Logos

Update detection

File preview from Drive

Create new Google Doc in Logos

Export from Logos to Google Drive

OneDrive Integration

OAuth authentication

List files from OneDrive

Same sync features as Google Drive

SharePoint support

Office document handling

Dropbox Integration

OAuth authentication

File sync

Version history

Team Dropbox support

Pulse Communication App Integration
Meeting Notes Sync:

Capture meeting notes from Pulse

Organize by date, attendees

Link to related clients/projects

Auto-tagging (who attended, project)

Full-text search

Edit and store in Logos

Export to Google Docs/PDF

Team Chat Logs:

Archive important Pulse conversations

Create searchable chat archive

Thread organization

Export conversations

Link to cases/projects

Chat highlights (starred messages)

Communication Archive:

Centralized place for all Pulse exports

Organized by date, channel, participant

Search across all communications

Maintain audit trail

Smart Organization

Auto-tagging based on:

File type

Content analysis

Filename patterns

Folder location

Suggested categories

Manual categorization options

Tag suggestions

Advanced Features

Version history (track changes over time)

Rollback to previous version

Document templates

Bulk actions (download, share, move, delete)

Export options:

Export folder as ZIP

Export to Google Docs

Export to PDF

Export to CSV (for data)

Favorites/starred documents

Recently accessed

Shared with me

Notifications on document changes

Sample Data

Create folders with sample documents

Add documents from each integration type

Include various file types (.pdf, .doc, .sheet, images)

Sample meeting notes

Sample chat logs

UI/UX

Clean branching menu on left sidebar

Main content area showing documents

Quick filters at top

Document detail panel on right (optional)

Mobile responsive

File upload zone (drag & drop)

Please implement the complete Document Library system with all sync integrations and Pulse communication features.

text

---

## 🔧 Technical Implementation

### Database Schema:

CREATE TABLE documents (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
description TEXT,
file_type TEXT, -- 'pdf', 'doc', 'sheet', 'image', 'other'

-- Storage
storage_location TEXT, -- 'logos', 'google_drive', 'onedrive', 'dropbox'
file_path TEXT,
external_file_id TEXT, -- ID from external service
file_size INT,

-- Organization
folder_id UUID REFERENCES documents(id), -- For nested folders
category TEXT,
tags TEXT[],

-- Metadata
uploaded_by UUID REFERENCES auth.users(id),
uploaded_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
accessed_at TIMESTAMP,

-- Sync Info
last_synced_at TIMESTAMP,
version INT DEFAULT 1,
is_favorite BOOLEAN DEFAULT FALSE
);

CREATE TABLE document_versions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
version_number INT,
file_path TEXT,
created_by UUID REFERENCES auth.users(id),
created_at TIMESTAMP DEFAULT NOW(),
size INT
);

CREATE TABLE document_sync_configs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES auth.users(id),

service_type TEXT NOT NULL, -- 'google_drive', 'onedrive', 'dropbox', 'pulse'
sync_enabled BOOLEAN DEFAULT TRUE,

-- OAuth
access_token TEXT, -- Encrypted
refresh_token TEXT, -- Encrypted
token_expires_at TIMESTAMP,

-- Sync Settings
sync_frequency TEXT DEFAULT 'daily', -- 'realtime', 'hourly', 'daily'
bi_directional BOOLEAN DEFAULT TRUE,
last_sync_at TIMESTAMP,

-- Selective Sync
sync_folder_id TEXT, -- Which folder to sync from external service
logos_folder_id UUID REFERENCES documents(id), -- Where to sync to

created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pulse_meetings (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
document_id UUID REFERENCES documents(id),

meeting_title TEXT,
meeting_date TIMESTAMP,
attendees TEXT[],
duration_minutes INT,
notes TEXT,

-- Links
client_id UUID REFERENCES clients(id),
project_id UUID REFERENCES projects(id),

imported_from_pulse BOOLEAN DEFAULT TRUE,
pulse_meeting_id TEXT,

created_at TIMESTAMP DEFAULT NOW()
);

text

### Component Structure:

DocumentLibrary/
├── DocumentLibrary.tsx (Main container)
├── DocumentBranchMenu.tsx (Left sidebar menu)
├── DocumentGrid.tsx (Main content area)
├── DocumentDetail.tsx (Right sidebar)
├── DocumentUpload.tsx (Drag & drop area)
├── folders/
│ ├── FolderView.tsx
│ ├── FolderCreate.tsx
│ └── FolderRename.tsx
├── sync/
│ ├── GoogleDriveSync.tsx
│ ├── OneDriveSync.tsx
│ ├── DropboxSync.tsx
│ └── SyncStatus.tsx
├── pulse/
│ ├── PulseMeetingSync.tsx
│ ├── PulseChatArchive.tsx
│ └── PulseSyncPreferences.tsx
├── DocumentSearch.tsx
├── DocumentFilters.tsx
├── DocumentActions.tsx (Download, Share, Delete)
└── services/
├── documentService.ts
├── googleDriveService.ts
├── oneDriveService.ts
├── dropboxService.ts
└── pulseIntegrationService.ts

text

---

## ✅ Completion Checklist

- [ ] Database schema created
- [ ] Branching menu system built
- [ ] Google Drive OAuth setup
- [ ] OneDrive OAuth setup
- [ ] Dropbox OAuth setup
- [ ] Document upload working
- [ ] Folder organization working
- [ ] Google Drive sync functional
- [ ] OneDrive sync functional
- [ ] Dropbox sync functional
- [ ] Pulse meeting notes integration
- [ ] Pulse chat archive integration
- [ ] Version history working
- [ ] Search functional
- [ ] Export features working
- [ ] Mobile responsive
- [ ] Performance optimized

---

**Estimated Time:** 8-9 hours  
**Next Phase:** 08-ReportsEnhancement.md
End of File 9