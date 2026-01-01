text
# Phase 5: Task Management - Population & Timeline Views

**Status:** Unfinished  
**Priority:** High  
**Difficulty:** Medium (6 hours)  
**Location:** F:\logos-vision-crm\development\05-TaskManagementPopulation.md

---

## 🎯 Overview

The Tasks page exists but needs:
1. Sample data population
2. Multiple unique views (Timeline, Department branch, Kanban, Gantt)
3. Task creation workflow
4. Assignment & notification system

---

## 📋 Step-by-Step Instructions

### FOR YOU (Project Manager):

1. **Define Task Hierarchy**
   - What are task categories for your nonprofit consulting?
   - Examples: Client deliverables, Internal projects, Team meetings, Compliance, Fundraising
   - Define departments: (Consulting, Operations, Finance, HR, Marketing)

2. **Create Sample Tasks**
   - 20-30 tasks across different status levels
   - Mix of overdue, due soon, on track, completed
   - Assign to different team members
   - Set various due dates (past, this week, next month)

3. **Test Views**
   - Timeline view should show tasks chronologically
   - Department view should group by team
   - Check filtering and sorting

---

### FOR CLAUDE CODE:

#### **PROMPT TO USE:**

I need to populate the Tasks page with sample data and create multiple unique view modes.

Requirements:

Sample Task Data

30+ tasks with:

Title, description, status (new, assigned, in_progress, completed, overdue)

Due dates (various dates: past, this week, next month)

Priority (low, medium, high, critical)

Assigned team member

Department/category

Related project or client

Time estimate

Time spent

Task Views

a) Timeline View (Horizontal timeline)

X-axis: Dates (today, this week, next month, future)

Y-axis: Tasks listed

Color-coded by priority

Show overdue tasks in red at top

Hover shows task details

Drag to reschedule

Task completion indicator (progress bar or checkmark)

b) Department View (Branching/Tree structure)

Root: All Tasks

Level 1 Branches: Consulting, Operations, Finance, HR, Marketing

Level 2: Individual tasks under each department

Expand/collapse departments

Count of tasks per department

Count of overdue per department

Completion percentage per department

c) Kanban View (Existing kanban columns)

Columns: New, Assigned, In Progress, Completed, Overdue

Drag cards between columns

Filter by assignee/department

Quick actions on hover

d) List View (Table)

Columns: ID, Title, Assignee, Due Date, Priority, Status, Department

Sortable columns

Filterable

Bulk actions

e) Calendar View

Month calendar

Tasks shown on due dates

Click date to see tasks

Color-coded by priority

Today indicator

Task Creation

Quick create: Title, Due date, Assignee

Full create: All fields including description, priority, department

Auto-suggest due date (default to 7 days out)

Template tasks

Task Detail Modal

All task fields

Activity timeline

Comments section

Related items (project, client, case)

Time tracking (estimate vs. actual)

Subtasks

Dependencies (blocking/blocked by)

Task Assignment & Notifications

Assign task (change assignee)

Notify assignee when assigned

Notify when due date approaching (2 days before)

Notify manager if overdue

Filtering & Search

Filter by: Status, Assignee, Department, Priority, Due date range

Quick filters: My Tasks, Overdue, Due Today, Due This Week

Full-text search

Design:

Clean, organized layout

Different view icons to switch between views

Loading states

Empty states

Drag-and-drop where applicable (Kanban, Timeline)

Mobile responsive

Please create the Task page with all views and sample data.

text

---

## 🔧 Technical Implementation

### Database Schema:

CREATE TABLE tasks (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
title TEXT NOT NULL,
description TEXT,

-- Relationships
project_id UUID REFERENCES projects(id),
client_id UUID REFERENCES clients(id),
assigned_to UUID REFERENCES team_members(id),
created_by UUID REFERENCES auth.users(id),

-- Task Details
status TEXT DEFAULT 'new', -- 'new', 'assigned', 'in_progress', 'completed', 'overdue'
priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
department TEXT,

-- Dates
created_at TIMESTAMP DEFAULT NOW(),
due_date TIMESTAMP,
completed_at TIMESTAMP,

-- Time Tracking
time_estimate_hours INT,
time_spent_hours INT DEFAULT 0,

-- Subtasks & Dependencies
parent_task_id UUID REFERENCES tasks(id),
is_blocking_id UUID REFERENCES tasks(id), -- Tasks this one blocks

-- Metadata
tags TEXT[],
notes TEXT
);

CREATE TABLE task_activities (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
activity_type TEXT,
description TEXT,
created_by UUID REFERENCES auth.users(id),
created_at TIMESTAMP DEFAULT NOW()
);

text

### Component Structure:

TaskManagement/
├── TaskPage.tsx (Main container)
├── TaskDashboard.tsx (Overview stats)
├── views/
│ ├── TimelineView.tsx (Horizontal timeline)
│ ├── DepartmentBranchView.tsx (Tree structure)
│ ├── KanbanView.tsx (Existing)
│ ├── ListView.tsx (Table)
│ └── CalendarView.tsx (Month calendar)
├── TaskFilters.tsx
├── TaskCreateDialog.tsx
├── TaskDetail.tsx
└── services/
└── taskService.ts

text

---

## 📊 Sample Tasks Format

const sampleTasks = [
{
id: '1',
title: 'Annual Impact Report - Final Review',
description: 'Complete final review of annual impact report before printing',
client: 'Hope Harbor Foundation',
assignedTo: 'Sarah Johnson',
status: 'in_progress',
priority: 'high',
dueDate: '2024-12-20',
department: 'Consulting',
timeEstimate: 4,
timeSpent: 2,
createdDate: '2024-12-01'
},
// ... more tasks
];

text

---

## ✅ Completion Checklist

- [ ] Sample tasks created (30+)
- [ ] Timeline view implemented
- [ ] Department branch view implemented
- [ ] Kanban view enhanced
- [ ] List view implemented
- [ ] Calendar view added
- [ ] Task creation working
- [ ] Task detail modal complete
- [ ] Filtering/search working
- [ ] Drag-and-drop functional
- [ ] Notifications implemented
- [ ] Mobile responsive

---

**Estimated Time:** 6 hours  
**Next Phase:** 06-CalendarPageEnhancements.md
End of File 7