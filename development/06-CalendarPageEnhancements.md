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