# CLAUDE.md - AI Assistant Guide for Logos Vision CRM

> **Last Updated:** November 27, 2025
> **Project:** Logos Vision CRM - A comprehensive CRM system for nonprofit and consulting organizations

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Codebase Structure](#codebase-structure)
4. [Development Workflows](#development-workflows)
5. [Coding Conventions](#coding-conventions)
6. [Database & Data Management](#database--data-management)
7. [UI/UX Components](#uiux-components)
8. [State Management](#state-management)
9. [Key Features](#key-features)
10. [Deployment](#deployment)
11. [Common Tasks](#common-tasks)
12. [Troubleshooting](#troubleshooting)
13. [Important Notes for AI Assistants](#important-notes-for-ai-assistants)

---

## 📖 Project Overview

**Logos Vision CRM** is a full-featured Customer Relationship Management system designed specifically for nonprofit organizations and consulting firms. It provides comprehensive tools for managing clients, projects, team members, volunteers, donations, events, and more.

### Key Characteristics
- **Primary Users:** Nonprofit organizations, consulting firms, project managers
- **Architecture:** Single-page application (SPA) with React
- **Data Persistence:** Supabase (PostgreSQL) with real-time subscriptions
- **AI Integration:** Google Gemini API for intelligent features
- **Deployment:** Vercel (primary), Netlify (alternative)

### Project Status
- ✅ Core features implemented
- ✅ Database schema complete (14 tables)
- ✅ UI component library established
- ✅ Real-time features integrated
- 🔄 Ongoing: Data migration from mock data to Supabase
- 🔄 Ongoing: Production deployment optimization

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19.2.0
- **Language:** TypeScript 5.8.2
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS (via inline classes)
- **Icons:** Lucide React 0.553.0
- **Charts:** Recharts 3.3.0

### Backend & Database
- **Database:** Supabase (PostgreSQL)
- **Client Library:** @supabase/supabase-js 2.83.0
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime subscriptions

### AI & APIs
- **AI Provider:** Google Gemini (@google/genai 1.26.0)
- **Maps:** Google Maps API
- **Search:** Integrated global search with Gemini

### Development Tools
- **Package Manager:** npm
- **TypeScript Config:** ESNext with React JSX
- **Path Aliases:** `@/*` maps to project root
- **Environment Variables:** `.env.local` (Vite prefix required)

---

## 📁 Codebase Structure

```
logos-vision-crm/
├── .claude/                      # Claude Code settings
│   └── settings.local.json
├── .github/workflows/            # CI/CD workflows
│   └── deploy.yml               # Vercel deployment workflow
├── components/                   # Legacy components (mostly moved to src/)
│   ├── export/
│   ├── filters/
│   └── quickadd/
├── database/                     # Database documentation
│   ├── CHECKLIST.md
│   ├── CONNECTION_GUIDE.md
│   ├── SETUP_GUIDE.md
│   └── SUMMARY.md
├── services/                     # Legacy service files
├── src/
│   ├── components/              # React components (main location)
│   │   ├── charts/             # Chart components
│   │   ├── export/             # Export functionality
│   │   ├── filters/            # Filter components
│   │   ├── projects/           # Project-specific components
│   │   ├── quickadd/           # Quick add dialogs
│   │   ├── timeline/           # Timeline components
│   │   └── ui/                 # Reusable UI components
│   │       ├── Accordion.tsx
│   │       ├── Breadcrumbs.tsx
│   │       ├── ContextMenu.tsx
│   │       ├── Tabs.tsx
│   │       ├── Toast.tsx
│   │       └── ... (more UI primitives)
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx
│   ├── data/                   # Mock data (being phased out)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useRealtime.ts     # Supabase realtime hook
│   │   └── useScrollReveal.ts
│   ├── services/               # Service layer (API interactions)
│   │   ├── activityService.ts
│   │   ├── authService.ts
│   │   ├── caseService.ts
│   │   ├── clientService.ts
│   │   ├── databaseService.ts
│   │   ├── documentService.ts
│   │   ├── donationService.ts
│   │   ├── emailCampaignService.ts
│   │   ├── eventService.ts
│   │   ├── geminiService.ts   # AI features
│   │   ├── projectService.ts
│   │   ├── realtimeService.ts
│   │   ├── supabaseClient.ts  # Supabase configuration
│   │   ├── taskService.ts
│   │   ├── teamMemberService.ts
│   │   └── volunteerService.ts
│   ├── utils/                  # Utility functions
│   │   ├── audio.ts
│   │   ├── dateHelpers.ts
│   │   ├── distance.ts
│   │   └── geocoding.ts
│   ├── App.tsx                 # Main application component (2589 lines)
│   ├── AppWithAuth.tsx         # Auth wrapper
│   ├── index.tsx               # Application entry point
│   └── types.ts                # TypeScript type definitions
├── App.tsx                      # Root App component (42KB)
├── types.ts                     # Global type definitions & augmentations
├── index.html                   # HTML entry point
├── index.css                    # Global styles
├── database-schema.sql          # Complete database schema
├── supabase-schema.sql          # Simplified Supabase schema
├── supabase-rls-policies.sql    # Row Level Security policies
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── vercel.json                  # Vercel deployment config
├── netlify.toml                 # Netlify deployment config
└── [MANY_MD_FILES].md          # Comprehensive documentation
```

### Documentation Files (Important)
- `START_HERE_TOMORROW.md` - Onboarding guide for developers
- `DEPLOYMENT_QUICK_REF.md` - Deployment reference
- `COLOR_SYSTEM_GUIDE.md` - Design system colors
- `SPACING_SYSTEM.md` - Design system spacing
- `KEYBOARD_SHORTCUTS.md` - Keyboard shortcuts reference
- `TABS_GUIDE.md`, `ACCORDION_COMPLETE.md`, etc. - Component guides

---

## 🔄 Development Workflows

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd logos-vision-crm
   npm install
   ```

2. **Environment Configuration**
   Create `.env.local` with:
   ```env
   VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-key>
   VITE_DEV_MODE=true
   VITE_API_KEY=<gemini-api-key>
   VITE_GOOGLE_MAPS_KEY=<google-maps-key>
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # Runs on http://localhost:3000
   ```

### Available Scripts

```bash
npm run dev        # Start development server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build
```

### Git Workflow

- **Main Branch:** `main` or `master`
- **Feature Branches:** Create from main, prefix with feature type
- **Commits:** Clear, descriptive commit messages
- **CI/CD:** GitHub Actions auto-deploy to Vercel on push to main

### Making Changes

1. **Always read files before modifying** - Don't propose changes to code you haven't read
2. **Test locally** - Use `npm run dev` and verify in browser
3. **Check TypeScript** - Ensure no type errors
4. **Test build** - Run `npm run build` before deploying
5. **Update documentation** - Keep MD files in sync with code changes

---

## 📐 Coding Conventions

### TypeScript Standards

1. **Type Definitions**
   - All types defined in `src/types.ts`
   - Use enums for status fields (e.g., `ProjectStatus`, `TaskStatus`)
   - Export interfaces for all data models
   - Use proper typing, avoid `any`

2. **Imports**
   - Use path alias: `import { Type } from '@/src/types'`
   - Group imports: React, external libraries, local files
   - Import types with `import type` when possible

3. **File Naming**
   - Components: PascalCase (e.g., `ProjectList.tsx`)
   - Services: camelCase (e.g., `projectService.ts`)
   - Utilities: camelCase (e.g., `dateHelpers.ts`)
   - Types: Use descriptive names matching domain concepts

### React Patterns

1. **Component Structure**
   ```typescript
   import React, { useState, useEffect } from 'react';
   import type { ComponentProps } from '@/src/types';

   interface ComponentNameProps {
     // Props definition
   }

   export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
     // Hooks
     const [state, setState] = useState();

     // Effects
     useEffect(() => {
       // Side effects
     }, []);

     // Event handlers
     const handleEvent = () => {
       // Handler logic
     };

     // Render
     return (
       <div>
         {/* JSX */}
       </div>
     );
   }
   ```

2. **State Management**
   - Use `useState` for local state
   - Use `useEffect` for side effects
   - Lift state up when needed by multiple components
   - Context for app-wide state (e.g., `AuthContext`)

3. **Async Operations**
   - Always use try-catch for async operations
   - Show loading states
   - Display user-friendly error messages via toast
   - Fallback to mock data on error (during migration phase)

### Styling Conventions

1. **Tailwind Classes**
   - Use utility classes inline
   - Follow design system colors (see `COLOR_SYSTEM_GUIDE.md`)
   - Responsive: `sm:`, `md:`, `lg:`, `xl:` breakpoints
   - Dark mode: `dark:` prefix

2. **Color Usage**
   - Primary: Cyan/Teal (`primary-500: #06b6d4`)
   - Secondary: Indigo (`secondary-500: #6366f1`)
   - Success: Green (`green-500`)
   - Warning: Amber (`amber-500`)
   - Error: Red (`red-500`)
   - Neutral: Gray shades for text and backgrounds

3. **Spacing**
   - Follow 4px grid system
   - Standard padding: `p-4`, `p-6`, `p-8`
   - Standard margins: `m-4`, `mb-4`, `mt-6`
   - Gaps in flex/grid: `gap-4`, `gap-6`

### Service Layer Patterns

All services follow consistent patterns:

```typescript
// Service file structure
import { supabase } from './supabaseClient';
import type { Entity } from '@/src/types';

export const entityService = {
  async getAll(): Promise<Entity[]> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Entity | null> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(entity: Omit<Entity, 'id'>): Promise<Entity> {
    const { data, error } = await supabase
      .from('entities')
      .insert(entity)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Entity>): Promise<Entity> {
    const { data, error } = await supabase
      .from('entities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('entities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
```

---

## 🗄 Database & Data Management

### Supabase Configuration

- **URL:** `https://psjgmdnrehcwvppbeqjy.supabase.co`
- **Project ID:** `psjgmdnrehcwvppbeqjy`
- **Client:** Initialized in `src/services/supabaseClient.ts`

### Database Schema

14 main tables (see `database-schema.sql`):

1. **clients** - Organizations/clients
2. **team_members** - Internal team (consultants)
3. **projects** - Client projects
4. **project_team_assignments** - Many-to-many: projects ↔ team members
5. **tasks** - Project tasks
6. **activities** - Calls, meetings, emails, notes
7. **cases** - Support cases
8. **case_comments** - Comments on cases
9. **volunteers** - Volunteer management
10. **donations** - Donation tracking
11. **events** - Event management
12. **documents** - Document library
13. **email_campaigns** - Email marketing
14. **chat_messages** - Team chat

### Key Relationships

- `projects.client_id` → `clients.id`
- `tasks.project_id` → `projects.id`
- `tasks.team_member_id` → `team_members.id`
- `activities.client_id` → `clients.id`
- `activities.project_id` → `projects.id`
- `cases.client_id` → `clients.id`

### Data Migration Status

**Migration Pattern:**
1. ✅ **Clients** - Fully migrated to Supabase
2. 🔄 **Projects** - In progress
3. 🔄 **Tasks** - Pending
4. 🔄 **Activities** - Pending
5. 🔄 **Cases** - Pending
6. ⏳ **Others** - Queued

**Migration Workflow:**
1. Import service (e.g., `import { projectService } from './services/projectService'`)
2. Change state from mock data to empty array
3. Add `useEffect` to load data from Supabase
4. Update CRUD operations to use service methods
5. Test and verify persistence

### Real-time Features

Enabled tables (via Supabase Replication):
- `clients`
- `projects`
- `tasks`
- `activities`
- `cases`
- `team_members`

Use `useRealtime` hook for real-time subscriptions:
```typescript
import { useRealtime } from '@/src/hooks/useRealtime';

useRealtime('clients', (payload) => {
  // Handle real-time updates
});
```

---

## 🎨 UI/UX Components

### Design System

**Color System:** See `COLOR_SYSTEM_GUIDE.md`
- Primary: Cyan/Teal family
- Secondary: Indigo family
- Semantic colors: Success (green), Warning (amber), Error (red)
- WCAG AA compliant contrast ratios

**Spacing System:** See `SPACING_SYSTEM.md`
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64px

### Core UI Components (src/components/ui/)

1. **Tabs** (`Tabs.tsx`)
   - 3 variants: default, pills, underline
   - Keyboard navigation (arrows, Home, End)
   - Icons and badges support
   - Full guide: `TABS_GUIDE.md`

2. **Accordion** (`Accordion.tsx`)
   - 3 variants: default, bordered, separated
   - Single or multiple expansion modes
   - Smooth animations
   - Full guide: `ACCORDION_COMPLETE.md`

3. **Context Menu** (`ContextMenu.tsx`)
   - Right-click menus
   - Keyboard navigation
   - Icons, separators, submenus
   - Full guide: `CONTEXT_MENUS_GUIDE.md`

4. **Breadcrumbs** (`Breadcrumbs.tsx`)
   - Navigation trails
   - Auto-collapse on overflow
   - Full guide: `BREADCRUMBS_GUIDE.md`

5. **Toast Notifications** (`Toast.tsx`, `ToastContext.tsx`)
   - Success, error, info, warning types
   - Auto-dismiss
   - Multiple toast stacking
   - Usage:
     ```typescript
     import { useToast } from '@/src/components/ui/ToastContext';
     const { showToast } = useToast();
     showToast('Message', 'success');
     ```

6. **Loading States** (`Loading.tsx`, `Skeleton.tsx`)
   - Spinner component
   - Skeleton loaders for content
   - Empty states (`EmptyState.tsx`)

7. **Status Badge** (`StatusBadge.tsx`)
   - Color-coded status indicators
   - Variants for different status types

### Feature Components

**Global Search** (`GlobalSearch.tsx`)
- Keyboard shortcuts: `Ctrl+K` or `/`
- Search button in header
- Search across all entity types
- Recent searches
- Full guide: `GLOBAL_SEARCH_COMPLETE.md`

**Major Feature Areas:**
- Projects: `ProjectList.tsx`, `ProjectDetail.tsx`, `ProjectKanban.tsx`
- Clients: `ClientList.tsx`, `OrganizationDetail.tsx`
- Team: `ConsultantList.tsx`, `TeamMemberList.tsx`
- Activities: `ActivityFeed.tsx`, `CalendarView.tsx`
- Cases: `CaseManagement.tsx`, `CaseDetail.tsx`
- Documents: `DocumentLibrary.tsx`
- Volunteers: `VolunteerList.tsx`
- AI Tools: `AiChatBot.tsx`, `AiTools.tsx`, `GrantAssistant.tsx`

---

## 🔧 State Management

### Application State (App.tsx)

The main `App.tsx` component manages global state:

```typescript
// Data state
const [clients, setClients] = useState<Client[]>([]);
const [projects, setProjects] = useState<Project[]>([]);
const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [activities, setActivities] = useState<Activity[]>([]);
const [cases, setCases] = useState<Case[]>([]);
// ... more entities

// UI state
const [currentPage, setCurrentPage] = useState<Page>('dashboard');
const [selectedProject, setSelectedProject] = useState<string | null>(null);
const [selectedClient, setSelectedClient] = useState<string | null>(null);
// ... more UI state

// Loading state
const [isLoadingClients, setIsLoadingClients] = useState(true);
const [isLoadingProjects, setIsLoadingProjects] = useState(true);
```

### Context Providers

**AuthContext** (`src/contexts/AuthContext.tsx`)
- Authentication state
- User session
- Login/logout methods

**ToastContext** (`src/components/ui/ToastContext.tsx`)
- Toast notifications
- Global notification queue

### Props Drilling vs Context

- **Props:** Used for component-specific data
- **Context:** Used for app-wide state (auth, toasts, theme)
- **Services:** Used for data fetching and persistence

---

## ⚡ Key Features

### 1. Client/Organization Management
- Full CRUD operations
- Contact information
- Organization type (nonprofit, for-profit)
- Tax ID, website, industry tracking
- Activity history

### 2. Project Management
- Project creation and tracking
- Team assignments (many-to-many)
- Task breakdown
- Status tracking (Planning, In Progress, Completed, On Hold)
- Budget and cost tracking
- AI project scaffolding (via Gemini)

### 3. Task Management
- Task creation and assignment
- Due dates
- Status tracking (To Do, In Progress, Done)
- Priority levels
- Shared with client option
- Timeline views

### 4. Activities & Calendar
- Activity types: Call, Email, Meeting, Note
- Activity status: Scheduled, Completed, Cancelled
- Calendar views
- Client/project association
- Shared activities visible to clients

### 5. Case Management
- Support case tracking
- Priority levels (Low, Medium, High)
- Status workflow (New, In Progress, Resolved, Closed)
- Comments and activity history
- Assignment to team members

### 6. Volunteer Management
- Volunteer database
- Skills tracking
- Availability scheduling
- Project/client assignments
- AI-powered volunteer matching

### 7. Donation Tracking
- Donation records
- Donor management
- Campaign tracking
- Charity progress tracking

### 8. Document Library
- Document upload and organization
- Categories: Client, Project, Internal, Template
- File type support: PDF, DOCX, XLSX, PPTX
- Related entity linking

### 9. Event Management
- Event creation and publishing
- Scheduling
- Ticket types and pricing
- Volunteer coordination
- Banner images

### 10. Email Campaigns
- Campaign creation
- A/B testing (subject lines)
- Recipient segmentation
- Performance tracking
- Opens/clicks analytics

### 11. AI Features (Gemini Integration)
- **AI Chat Bot:** General assistance
- **Grant Assistant:** Grant writing help
- **Project Scaffolding:** Auto-generate project phases
- **Meeting Analysis:** Extract action items from notes
- **Volunteer Matching:** Suggest volunteers for projects
- **Advanced Search:** Semantic search across data

### 12. Client Portal
- Custom portal builder
- Widget-based layout
- Shared projects and tasks visibility
- Document sharing
- Activity feeds
- Video conferencing

### 13. Reporting & Analytics
- Project dashboards
- Financial reports
- Activity reports
- Volunteer engagement
- Donation summaries

---

## 🚀 Deployment

### Environment Configuration

**Local Development (.env.local):**
```env
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=<key>
VITE_DEV_MODE=true  # Bypasses login for development
VITE_API_KEY=<gemini-key>
VITE_GOOGLE_MAPS_KEY=<maps-key>
```

**Production:**
```env
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=<key>
VITE_DEV_MODE=false  # IMPORTANT: Must be false for auth
VITE_API_KEY=<gemini-key>
VITE_GOOGLE_MAPS_KEY=<maps-key>
```

### Vercel Deployment (Primary)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel          # Preview deployment
   vercel --prod   # Production deployment
   ```

3. **Environment Variables:**
   - Set in Vercel dashboard
   - Must prefix with `VITE_`
   - Set `VITE_DEV_MODE=false` for production

4. **GitHub Integration:**
   - Auto-deploys on push to main (see `.github/workflows/deploy.yml`)

### Netlify Deployment (Alternative)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Pre-Deployment Checklist

- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] `VITE_DEV_MODE=false` in production
- [ ] Supabase tables have data
- [ ] Supabase RLS policies enabled
- [ ] User accounts created in Supabase Auth
- [ ] Real-time enabled on key tables

### Post-Deployment Verification

- [ ] Production URL loads
- [ ] Login page shows (not bypassed)
- [ ] Can log in with test user
- [ ] Data loads from Supabase
- [ ] Can create/edit/delete data
- [ ] No console errors
- [ ] Global search works (Ctrl+K)
- [ ] Mobile responsive

**Full guide:** `DEPLOYMENT_QUICK_REF.md`, `PRODUCTION_DEPLOYMENT_CHECKLIST.md`

---

## 🔨 Common Tasks

### Adding a New Entity Type

1. **Define Types** (`src/types.ts`)
   ```typescript
   export interface NewEntity {
     id: string;
     name: string;
     // ... other fields
   }
   ```

2. **Create Service** (`src/services/newEntityService.ts`)
   ```typescript
   import { supabase } from './supabaseClient';
   import type { NewEntity } from '@/src/types';

   export const newEntityService = {
     async getAll(): Promise<NewEntity[]> { /* ... */ },
     async create(entity: Omit<NewEntity, 'id'>): Promise<NewEntity> { /* ... */ },
     // ... other CRUD methods
   };
   ```

3. **Update App State** (`src/App.tsx`)
   ```typescript
   const [newEntities, setNewEntities] = useState<NewEntity[]>([]);

   useEffect(() => {
     loadNewEntities();
   }, []);

   async function loadNewEntities() {
     const data = await newEntityService.getAll();
     setNewEntities(data);
   }
   ```

4. **Create UI Components**
   - List component: `src/components/NewEntityList.tsx`
   - Detail component: `src/components/NewEntityDetail.tsx`
   - Dialog component: `src/components/AddNewEntityDialog.tsx`

5. **Add Database Table** (Supabase SQL Editor)
   ```sql
   CREATE TABLE new_entities (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Adding a New UI Component

1. **Create Component File** (`src/components/ui/NewComponent.tsx`)
   ```typescript
   interface NewComponentProps {
     prop1: string;
     prop2?: number;
   }

   export function NewComponent({ prop1, prop2 }: NewComponentProps) {
     return (
       <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
         {/* Component JSX */}
       </div>
     );
   }
   ```

2. **Export from Index** (`src/components/ui/index.ts`)
   ```typescript
   export { NewComponent } from './NewComponent';
   ```

3. **Document Usage** (Create `NEW_COMPONENT_GUIDE.md`)
   - Overview and purpose
   - Props reference
   - Usage examples
   - Accessibility notes

### Modifying Existing Features

1. **Read the File First** - Never propose changes without reading
2. **Understand Dependencies** - Check what imports the file
3. **Check Types** - Ensure type consistency
4. **Test Locally** - Verify changes work
5. **Update Documentation** - Keep MD files in sync

### Adding AI Features

1. **Import Gemini Service**
   ```typescript
   import { geminiService } from '@/src/services/geminiService';
   ```

2. **Use Existing Functions** or **Create New**
   - `analyzeProjectScope(description)`
   - `analyzeMeetingNotes(notes)`
   - `recommendVolunteers(projectDescription, volunteers)`
   - `performAdvancedSearch(query)`

3. **Handle Async/Errors**
   ```typescript
   try {
     setIsLoading(true);
     const result = await geminiService.someMethod(input);
     // Process result
   } catch (error) {
     showToast('AI request failed', 'error');
   } finally {
     setIsLoading(false);
   }
   ```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Supabase connection failed"**
- Check `.env.local` has correct URL and key
- Verify environment variables start with `VITE_`
- Restart dev server after changing env vars

**2. "Type errors in build"**
- Run `npx tsc --noEmit` to see all errors
- Check imports use correct paths
- Verify all required props are passed

**3. "Data not loading"**
- Check console for errors
- Verify service is imported
- Check `useEffect` calls load function
- Verify Supabase table exists and has data

**4. "Real-time not working"**
- Enable Replication in Supabase dashboard (Database → Replication)
- Check table is in realtime list
- Verify `useRealtime` hook is properly configured

**5. "Login bypassed in production"**
- Ensure `VITE_DEV_MODE=false` in production environment
- Redeploy after changing environment variable
- Clear browser cache

**6. "Build fails"**
- Check for TypeScript errors
- Verify all imports resolve
- Check for missing dependencies
- Clear cache: `rm -rf node_modules/.vite && npm run build`

**7. "AI features not working"**
- Verify `VITE_API_KEY` is set (Gemini API key)
- Check API quota/limits
- Check console for specific errors

### Debug Tools

- **Browser Console:** `F12` - Check for errors and logs
- **React DevTools:** Inspect component tree and state
- **Network Tab:** Check API calls to Supabase
- **Supabase Dashboard:** Verify data and query logs

---

## 📌 Important Notes for AI Assistants

### What to Know Before Making Changes

1. **Read First, Code Second**
   - ALWAYS read files before modifying
   - Understand context and dependencies
   - Check for similar patterns in codebase

2. **Follow Established Patterns**
   - Service layer pattern (see existing services)
   - Component structure (see existing components)
   - State management approach (useState + useEffect)
   - Error handling (try-catch with toast)

3. **Type Safety is Critical**
   - All entities have types in `src/types.ts`
   - Use proper TypeScript - avoid `any`
   - Check types match between service and component

4. **Database Operations**
   - Use service layer, never direct Supabase calls in components
   - Follow CRUD pattern in services
   - Handle errors gracefully
   - Show loading states

5. **UI Consistency**
   - Use Tailwind classes matching design system
   - Follow color system (`COLOR_SYSTEM_GUIDE.md`)
   - Use existing UI components from `src/components/ui/`
   - Maintain dark mode support

6. **Don't Over-Engineer**
   - Keep solutions simple and focused
   - Don't add features beyond requirements
   - Don't refactor working code unless necessary
   - Don't add comments where code is self-evident

### Migration Awareness

The project is **actively migrating** from mock data to Supabase:
- ✅ Clients are fully migrated
- 🔄 Projects, Tasks, Activities, Cases in progress
- Some code still references mock data - this is expected
- When modifying data operations, use service layer

### Testing Checklist

Before marking work complete:
- [ ] Code compiles (`npm run build`)
- [ ] TypeScript has no errors
- [ ] Changes tested in browser
- [ ] No console errors
- [ ] Data persists after refresh (if applicable)
- [ ] Mobile responsive (if UI change)
- [ ] Dark mode works (if UI change)

### File Organization Rules

- **Components:** `src/components/[ComponentName].tsx`
- **UI Components:** `src/components/ui/[ComponentName].tsx`
- **Services:** `src/services/[entityName]Service.ts`
- **Types:** Add to `src/types.ts`
- **Utilities:** `src/utils/[utilityName].ts`
- **Hooks:** `src/hooks/use[HookName].ts`

### Documentation Requirements

When creating new features:
1. Update this `CLAUDE.md` if architectural changes
2. Create component guide MD file if new UI component
3. Update relevant existing MD files
4. Add inline JSDoc comments for complex functions

### What NOT to Do

❌ **Don't:**
- Modify files without reading them first
- Create duplicate functionality
- Break existing working features
- Ignore TypeScript errors
- Skip error handling
- Remove working code without understanding it
- Add backwards-compatibility hacks for removed features
- Create abstractions for one-time operations
- Add unnecessary comments or docstrings

✅ **Do:**
- Follow existing patterns
- Keep changes focused and minimal
- Test thoroughly
- Handle errors gracefully
- Use type safety
- Maintain consistency
- Ask for clarification when unclear

### Quick Reference Links

- **Types:** `src/types.ts`
- **Main App:** `src/App.tsx` (2589 lines - large file!)
- **Supabase Client:** `src/services/supabaseClient.ts`
- **UI Components:** `src/components/ui/`
- **Design System:** `COLOR_SYSTEM_GUIDE.md`, `SPACING_SYSTEM.md`
- **Deployment:** `DEPLOYMENT_QUICK_REF.md`
- **Database:** `database-schema.sql`

---

## 📚 Additional Resources

### External Documentation
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

### Internal Documentation
See the extensive MD files in the project root for detailed guides on specific topics.

---

## 🎯 Summary for AI Assistants

This is a **React + TypeScript + Supabase CRM application** with:
- **Large codebase** with comprehensive features
- **Active development** - migration from mock to real database
- **Established patterns** - follow the service layer architecture
- **Rich UI library** - use existing components
- **Strong typing** - maintain type safety
- **Thorough documentation** - consult MD files

**When in doubt:**
1. Read the relevant files
2. Follow existing patterns
3. Test your changes
4. Keep it simple
5. Ask for clarification

Good luck! 🚀
