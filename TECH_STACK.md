# Logos Vision CRM - Complete Tech Stack Documentation

> A comprehensive non-profit/charity CRM platform with AI-powered features, real-time collaboration, and multi-platform integrations.

---

## Table of Contents

1. [Frontend Framework & Libraries](#1-frontend-framework--libraries)
2. [Backend & Database](#2-backend--database)
3. [AI & Machine Learning](#3-ai--machine-learning)
4. [Maps & Geolocation](#4-maps--geolocation)
5. [Analytics & Monitoring](#5-analytics--monitoring)
6. [Build Tools & Development](#6-build-tools--development)
7. [Configuration Files](#7-configuration-files)
8. [Database Schema](#8-database-schema)
9. [Services Architecture](#9-services-architecture)
10. [Component Structure](#10-component-structure)
11. [Design System & Styling](#11-design-system--styling)
12. [TypeScript Types](#12-typescript-types)
13. [External Integrations](#13-external-integrations)
14. [Environment Variables](#14-environment-variables)
15. [Architectural Patterns](#15-architectural-patterns)
16. [Development Setup](#16-development-setup)

---

## 1. Frontend Framework & Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| **React** | ^19.2.1 | Core UI library with hooks |
| **React DOM** | ^19.2.1 | DOM rendering |
| **React Router** | ^7.10.1 | Client-side SPA routing |
| **Recharts** | ^3.5.1 | Data visualization & charts |
| **Lucide React** | ^0.553.0 | Icon library (100+ icons) |

---

## 2. Backend & Database

| Package | Version | Purpose |
|---------|---------|---------|
| **Supabase JS** | ^2.83.0 | PostgreSQL backend with real-time, auth, storage |
| **Axios** | ^1.13.2 | HTTP client for external API calls |

### Supabase Features Used
- **PostgreSQL** - Relational database with RLS
- **Authentication** - JWT-based user auth
- **Real-time** - WebSocket subscriptions
- **Storage** - Document/media file storage
- **Edge Functions** - Serverless functions (optional)

---

## 3. AI & Machine Learning

| Package | Version | Purpose |
|---------|---------|---------|
| **@google/generative-ai** | ^1.26.0 | Google Gemini AI integration |
| **@anthropic-ai/sdk** | ^0.71.0 | Claude AI integration |

### AI Capabilities
- Project summary generation with web search grounding
- Risk analysis with structured output
- Volunteer matching recommendations
- Meeting analysis & action item extraction
- Smart text suggestions
- Grant writing assistance

---

## 4. Maps & Geolocation

| Package | Version | Purpose |
|---------|---------|---------|
| **@react-google-maps/api** | ^2.20.7 | Google Maps React integration |

### Features
- Contact location visualization
- Volunteer geographic mapping
- Distance calculations
- Geocoding utilities

---

## 5. Analytics & Monitoring

| Package | Version | Purpose |
|---------|---------|---------|
| **@vercel/analytics** | ^1.5.0 | User behavior analytics |
| **@vercel/speed-insights** | ^1.2.0 | Web Vitals performance tracking |

---

## 6. Build Tools & Development

| Package | Version | Purpose |
|---------|---------|---------|
| **Vite** | ^6.2.0 | Build tool & dev server |
| **TypeScript** | ~5.8.2 | Static type checking |
| **@vitejs/plugin-react** | ^5.0.0 | React JSX & Fast Refresh |
| **tsx** | ^4.20.6 | TypeScript execution |
| **dotenv** | ^17.2.3 | Environment variable loading |
| **@types/node** | ^22.14.0 | Node.js type definitions |

---

## 7. Configuration Files

### vite.config.ts
```typescript
// Key configurations:
- Dev server on port 3000
- Module chunk splitting (react, supabase, recharts, genai, icons)
- Path alias: @ -> root directory
- Environment variable handling via import.meta.env
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true
  }
}
```

### Styling Configuration
- **Tailwind CSS** via CDN (v3+)
- **PostCSS** for CSS processing
- **Design Tokens** in `/src/styles/design-tokens.css`

---

## 8. Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `clients` | Organizations/nonprofits with contact info |
| `team_members` | Staff/consultants with roles |
| `projects` | Project management with budget tracking |
| `project_team_members` | M2M project assignments |
| `tasks` | Project tasks with priority & phases |
| `activities` | Calls, meetings, emails logging |
| `cases` | Support case management |
| `case_comments` | Case discussion threads |

### Household Management

| Table | Purpose |
|-------|---------|
| `households` | Family groupings |
| `household_relationships` | Member-to-household links |
| `household_totals` (VIEW) | Aggregated donation stats |

### Fundraising & Pledges

| Table | Purpose |
|-------|---------|
| `donations` | Individual donation records |
| `pledges` | Recurring donation commitments |
| `pledge_payments` | Payment fulfillment tracking |
| `pledge_schedules` | Scheduled payment dates |

### Outcome Measurement

| Table | Purpose |
|-------|---------|
| `programs` | Service programs offered |
| `services` | Service delivery instances |
| `outcomes` | Measured impact results |
| `client_progress` | Client journey tracking |
| `program_results` | Aggregated program outcomes |
| `impact_snapshots` | Historical impact data |

### Communication & Campaigns

| Table | Purpose |
|-------|---------|
| `communication_logs` | Email, call, text tracking |
| `communication_preferences` | Do-not-contact settings |
| `email_campaigns` | Campaign management |
| `email_templates` | Reusable templates |
| `automation_rules` | Trigger-based workflows |

### Analytics & Reporting

| Table | Purpose |
|-------|---------|
| `donor_cohorts` | Donor segmentation |
| `donor_lifetime_value` | LTV calculations |
| `retention_metrics` | Donor retention stats |
| `reports` | Custom report definitions |

### Integration Tables

| Table | Purpose |
|-------|---------|
| `entomate_*` | Meeting assistant sync |
| `pulse_*` | Communication platform sync |
| `calendar_events` | Calendar entries |
| `documents` | Document library |

---

## 9. Services Architecture

### 37 Service Files

#### Core Data Services
```
src/services/
├── supabaseClient.ts      # Supabase configuration
├── databaseService.ts     # Direct DB operations
├── testConnection.ts      # Connection testing
```

#### Entity Services
```
├── clientService.ts       # Client/org CRUD
├── projectService.ts      # Project management
├── taskService.ts         # Task operations
├── teamMemberService.ts   # Team management
├── volunteerService.ts    # Volunteer management
├── donationService.ts     # Donation tracking
├── caseService.ts         # Case management
├── activityService.ts     # Activity logging
```

#### Advanced Features
```
├── pledgeService.ts       # Pledge & fulfillment
├── outcomeService.ts      # Program outcomes
├── engagementService.ts   # RFM scoring
├── campaignService.ts     # Email campaigns
├── automationService.ts   # Workflow automation
├── reportService.ts       # Report generation
├── analyticsService.ts    # Donor analytics
```

#### Calendar Services
```
├── calendar/
│   ├── baseCalendarService.ts
│   ├── calendarManager.ts
│   ├── googleCalendarService.ts
│   ├── config.ts
│   └── types.ts
```

#### AI Integration
```
├── geminiService.ts       # Google Gemini AI
```

#### External Integrations
```
├── pulseIntegrationService.ts
├── pulseDocumentSync.ts
├── pulseMeetingService.ts
├── pulsePresenceService.ts
├── pulseToLogosSync.ts
├── entomateService.ts
├── entomateWebhookHandler.ts
├── dataSyncEngine.ts      # Bidirectional sync
├── logosSync.ts           # Sync helper
```

---

## 10. Component Structure

### 102+ React Components

```
src/components/
├── Dashboard.tsx              # Main dashboard
├── Sidebar.tsx               # Navigation sidebar
├── Header.tsx                # App header
│
├── # Contact Management
├── Contacts.tsx
├── ContactList.tsx
├── ContactDetail.tsx
├── ContactsMap.tsx
│
├── # Project Management
├── ProjectHub.tsx
├── ProjectList.tsx
├── ProjectDetail.tsx
├── ProjectCalendar.tsx
├── ProjectTemplates.tsx
│
├── # Donations & Fundraising
├── Donations.tsx
├── DonorPipeline.tsx
├── Stewardship.tsx
├── CharityHub.tsx
│
├── # Case Management
├── CaseManagement.tsx
├── CaseDetail.tsx
├── CaseDialog.tsx
│
├── # Activities & Calendar
├── ActivityFeed.tsx
├── CalendarView.tsx
├── EnhancedCalendarView.tsx
├── CalendarIntegration.tsx
│
├── # AI Features
├── AiTools.tsx
├── AiChatBot.tsx
├── GrantAssistant.tsx
│
├── # Communication
├── LiveChat.tsx
├── TeamChat.tsx
├── VideoConference.tsx
│
├── # Analytics & Reports
├── AnalyticsDashboard.tsx
├── ImpactDashboard.tsx
├── ImpactReportBuilder.tsx
│
├── # UI Components
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Tabs.tsx
│   ├── Toast.tsx
│   ├── Loading.tsx
│   ├── Skeleton.tsx
│   ├── EmptyState.tsx
│   ├── PageContainer.tsx
│   ├── ThemeToggle.tsx
│   └── index.ts
│
├── # Chart Components
├── charts/
│   ├── MiniAreaChart.tsx
│   ├── ProgressRing.tsx
│   ├── Sparkline.tsx
│   └── ProjectStatusChart.tsx
│
├── # Feature Directories
├── households/             # Household management
├── pledges/               # Pledge components
├── reports/               # Reporting hub
├── dialogs/               # Modal dialogs
├── calendar/              # Calendar views
├── dashboard/             # Dashboard widgets
├── timeline/              # Activity timeline
└── filters/               # Advanced filters
```

---

## 11. Design System & Styling

### Approach
- **Tailwind CSS** via CDN for utility classes
- **CSS Custom Properties** for design tokens
- **CMF Nothing Brand** dark mode styling

### Design Tokens (`/src/styles/design-tokens.css`)

#### Color Palettes (10 shades each: 50-900)
- `--color-primary-*` - Blue accent colors
- `--color-secondary-*` - Purple/violet
- `--color-accent-*` - Cyan/teal
- `--color-success-*` - Green
- `--color-warning-*` - Amber/orange
- `--color-error-*` - Red
- `--color-info-*` - Sky blue
- `--color-gray-*` - Neutral grays
- `--color-neutral-*` - Warm neutrals

#### Typography
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
```

### Theme Support
- **Light Mode**: Gradient backgrounds, subtle shadows
- **Dark Mode**: Matte black (#000000, #0a0a0a), light blue accents (#7dd3fc)

### Visual Effects
- Acrylic glass morphism (blur + transparency)
- Card lift on hover
- Smooth transitions (0.2s - 0.3s)
- Shimmer loading states
- Glow pulse animations

### CMF Nothing Brand Classes
```css
.cmf-page-header     /* Dark header styling */
.cmf-section-card    /* Matte black cards */
.cmf-stats-grid      /* Stats layout */
.cmf-filter-bar      /* Filter container */
.cmf-search-input    /* Dark search input */
.cmf-button-primary  /* Accent button */
.cmf-table           /* Dark table styling */
.cmf-badge-*         /* Status badges */
.cmf-gradient-*      /* Gradient overlays */
.cmf-empty-state     /* Empty state styling */
.cmf-card-hover      /* Hover effects */
```

---

## 12. TypeScript Types

### `/src/types.ts` - 1,763 lines

#### Core Enums
```typescript
enum ProjectStatus { Planning, InProgress, Completed, OnHold }
enum TaskStatus { ToDo, InProgress, Done }
enum ActivityType { Call, Email, Meeting, Note }
enum CaseStatus { New, InProgress, Resolved, Closed }
enum CasePriority { Low, Medium, High }
enum DocumentCategory { Client, Project, Internal, Template }
```

#### Core Interfaces
```typescript
interface Client {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  website?: string;
  is_active: boolean;
  household_id?: string;
  // ... donor fields
}

interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_by_id?: string;
  // ... relationships
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
}
```

#### Advanced Types
```typescript
interface Household { /* Family grouping */ }
interface Pledge { /* Recurring donations */ }
interface EngagementScore { /* RFM scoring 0-100 */ }
interface Program { /* Service programs */ }
interface Outcome { /* Impact measurement */ }
interface ClientProgress { /* Client journey */ }
interface EmailCampaign { /* Campaign with A/B testing */ }
```

#### AI-Related Types
```typescript
interface RecommendedVolunteer { matchScore: number; /* 0-100 */ }
interface AiProjectPlan { phases: Phase[]; }
interface MeetingAnalysisResult { summary: string; insights: string[]; actionItems: ActionItem[]; }
```

---

## 13. External Integrations

### Supabase
- **Database**: PostgreSQL with RLS
- **Auth**: JWT-based authentication
- **Real-time**: WebSocket subscriptions
- **Storage**: Document/media files

### Google Services

#### Gemini AI
```typescript
// Models used:
- gemini-2.5-flash  // Fast responses
- gemini-2.5-pro    // Complex reasoning

// Features:
- Web search grounding
- Structured output
- Tool integration
```

#### Google Calendar
- OAuth 2.0 authentication
- Event synchronization
- Attendance tracking

#### Google Maps
- Location visualization
- Geocoding
- Distance calculations

### Anthropic Claude
- SDK integration for AI features
- Alternative to Gemini for specific tasks

### Entomate Meeting Assistant
- Webhook-based integration
- Action items → Tasks sync
- Meetings → Activities sync
- Meeting notes storage

### Pulse Communication Platform
- Separate Supabase instance (optional)
- Bidirectional data sync
- Projects ↔ Channels
- Contacts ↔ Members
- Meeting recordings/transcriptions
- Document sharing

### Vercel
- Analytics tracking
- Speed Insights (Core Web Vitals)

---

## 14. Environment Variables

### Required
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google AI
VITE_API_KEY=your-gemini-api-key

# Google Maps
VITE_GOOGLE_MAPS_KEY=your-maps-api-key

# Google Calendar OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_GOOGLE_CLIENT_SECRET=your-client-secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Optional
```env
# Microsoft Calendar (Optional)
VITE_MICROSOFT_CLIENT_ID=
VITE_MICROSOFT_CLIENT_SECRET=
VITE_MICROSOFT_REDIRECT_URI=

# Apple Calendar (Optional)
VITE_APPLE_CLIENT_ID=
VITE_APPLE_CLIENT_SECRET=
VITE_APPLE_REDIRECT_URI=

# Entomate Integration (Optional)
VITE_ENTOMATE_WEBHOOK_SECRET=
VITE_ENTOMATE_SUPABASE_URL=
VITE_ENTOMATE_SUPABASE_ANON_KEY=

# Development Mode
VITE_DEV_MODE=true  # Bypasses auth in development
```

---

## 15. Architectural Patterns

### State Management
- **React Hooks**: useState, useContext, useCallback, useMemo
- **AuthContext**: Global authentication state
- **Custom Hooks**: useDonationSummary, useRealtime, useScrollReveal

### Service Layer Pattern
```typescript
// Centralized Supabase client
const supabase = createClient(url, key);

// Service objects with grouped operations
export const clientService = {
  getAll: async () => { /* ... */ },
  getById: async (id: string) => { /* ... */ },
  create: async (data: Client) => { /* ... */ },
  update: async (id: string, data: Partial<Client>) => { /* ... */ },
  delete: async (id: string) => { /* ... */ },
};
```

### Data Sync Engine
```typescript
// Queue-based syncing with retry logic
// Conflict resolution strategies:
- logos_wins   // Logos data takes precedence
- pulse_wins   // Pulse data takes precedence
- newest_wins  // Most recent update wins

// Features:
- Entity mapping and versioning
- Real-time WebSocket updates
- Configurable sync direction
```

### Component Organization
```
Feature-based directories
├── Presentational components (UI)
├── Container components (logic)
├── Dialogs (modals)
└── Shared utilities
```

### Error Handling
- Try/catch in async operations
- Toast notifications for feedback
- React Error Boundaries
- Validation before API calls

---

## 16. Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud Console project (for AI/Maps)

### Installation
```bash
# Clone repository
git clone <repo-url>
cd logos-vision-crm

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run migrate-data # Run data migrations
```

### Build Output
```
Chunk splitting:
├── react-vendor     # React & React DOM
├── supabase        # Supabase client
├── charts          # Recharts library
├── genai           # Google GenAI
└── icons           # Lucide icons
```

---

## File Statistics

| Category | Count |
|----------|-------|
| React Components | 102+ |
| Service Files | 37 |
| Database Migrations | 23+ |
| TypeScript Types | 1,763 lines |
| Custom Hooks | 3 |
| Utility Modules | 5 |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  React 19 + TypeScript + Vite                           ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   ││
│  │  │Dashboard│ │Contacts │ │Projects │ │ Donations   │   ││
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘   ││
│  │       └───────────┴──────────┴──────────────┘           ││
│  │                         │                                ││
│  │              ┌──────────┴──────────┐                    ││
│  │              │   Service Layer     │                    ││
│  │              │  (37 services)      │                    ││
│  │              └──────────┬──────────┘                    ││
│  └─────────────────────────┼───────────────────────────────┘│
└────────────────────────────┼────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Supabase    │   │  Google APIs  │   │   External    │
│  PostgreSQL   │   │  ┌─────────┐  │   │  Integrations │
│  ┌─────────┐  │   │  │ Gemini  │  │   │  ┌─────────┐  │
│  │  Auth   │  │   │  │   AI    │  │   │  │Entomate │  │
│  ├─────────┤  │   │  ├─────────┤  │   │  ├─────────┤  │
│  │Realtime │  │   │  │Calendar │  │   │  │  Pulse  │  │
│  ├─────────┤  │   │  ├─────────┤  │   │  ├─────────┤  │
│  │ Storage │  │   │  │  Maps   │  │   │  │ Vercel  │  │
│  └─────────┘  │   │  └─────────┘  │   │  └─────────┘  │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## License

Proprietary - Logos Vision CRM

---

*Last Updated: December 2025*
