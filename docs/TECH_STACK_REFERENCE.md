# 🏗️ Logos Vision CRM - Tech Stack Reference Card

**Quick Reference Guide for Understanding Your Project Architecture**

---

## 📚 Table of Contents
1. [Core Technologies](#core-technologies)
2. [Services & APIs](#services--apis)
3. [Deployment & CI/CD](#deployment--cicd)
4. [Project Architecture](#project-architecture)
5. [Data Flow](#data-flow)
6. [Environment Configuration](#environment-configuration)
7. [Development Workflow](#development-workflow)
8. [Future/Optional Services](#futureoptional-services)

---

## Core Technologies

### Frontend Stack

| Technology | Version | Purpose | Usage in Project |
|------------|---------|---------|------------------|
| **React** | 19.2.0 | UI Framework | Core application framework for building interactive user interfaces |
| **TypeScript** | 5.8.2 | Type Safety | Adds static typing to JavaScript, catching errors at compile time |
| **Vite** | 6.2.0 | Build Tool | Fast development server, hot module replacement (HMR), optimized production builds |
| **Lucide React** | 0.553.0 | Icons | SVG icon library used throughout the UI (Home, Users, Settings icons, etc.) |
| **Recharts** | 3.3.0 | Charts/Graphs | Data visualization for dashboards, reports, and analytics |

**How They Work Together:**
- React components written in TypeScript are bundled by Vite
- Vite provides instant HMR during development (`npm run dev`)
- TypeScript ensures type safety across all React components and services
- Lucide icons provide consistent UI elements
- Recharts renders analytics and project metrics

---

### Backend & Database

| Service | Type | Purpose | Usage in Project |
|---------|------|---------|------------------|
| **Supabase** | BaaS (Backend as a Service) | Database + Auth + Realtime + Storage | Complete backend solution replacing traditional server setup |
| **PostgreSQL** | Database | Relational Database | Underlying database engine (managed by Supabase) |
| **Supabase Auth** | Authentication | User Management | Handles login, registration, sessions, password reset |
| **Supabase Realtime** | WebSocket Service | Live Updates | Real-time synchronization of data changes across clients |
| **Supabase Storage** | Object Storage | File Management | Document uploads, images, attachments (if needed) |

**Key Supabase Features Used:**
- Row Level Security (RLS) for data access control
- PostgreSQL triggers and functions for business logic
- Real-time subscriptions for live data updates
- Anonymous key for client-side access

**Database Tables:**
- `clients` - Organizations/companies you work with
- `projects` - Client projects and consulting engagements
- `tasks` - Project tasks and todos
- `team_members` - Your consultants and staff
- `activities` - Activity logs and history
- `cases` - Support/legal cases
- `volunteers` - Volunteer management
- `donations` - Donation tracking
- `events` - Event management
- `documents` - Document metadata
- `chat_messages` - Team chat and communications

---

## Services & APIs

### Google Gemini AI (@google/genai)

**Version:** 1.26.0
**API Key:** `VITE_API_KEY` (Google Gemini API)

**What It Does:**
- AI-powered features throughout the CRM
- Natural language processing
- Content generation and analysis

**Specific Use Cases in Your Project:**

| Feature | Location | What It Does |
|---------|----------|-------------|
| **Project Summary Generation** | `geminiService.ts` | Creates executive summaries of projects for stakeholders |
| **Task Suggestions** | AI Tools | Suggests next tasks based on project context |
| **Team Member Recommendations** | AI Tools | Recommends team members for projects based on skills |
| **Meeting Analysis** | Meeting Assistant | Analyzes meeting notes and extracts action items |
| **Web Search Integration** | AI Tools | Searches web for relevant information |
| **Grant Writing Assistant** | Grant Assistant | Helps draft grant proposals |
| **Email Campaign Generator** | Email Campaigns | Creates marketing email content |
| **Chat Bot** | AI Chat Bot | Conversational AI assistant for users |
| **Smart Text Enhancement** | AI Enhanced Textarea | Improves and expands user-written content |
| **Volunteer Matching** | Volunteer Service | Matches volunteers to opportunities using AI |

**How to Use:**
```typescript
import { generateProjectSummary } from './services/geminiService';

// Generate AI summary
const result = await generateProjectSummary(project, client, teamMembers);
console.log(result.summary);
```

---

### Google Maps API

**API Key:** `VITE_GOOGLE_MAPS_KEY`

**What It Does:**
- Location autocomplete for address entry
- Interactive maps showing client/volunteer locations
- Geocoding addresses to coordinates

**Used In:**
- `ContactsMap.tsx` - Shows clients on a map
- `VolunteersMap.tsx` - Shows volunteer locations
- `LocationAutocompleteInput.tsx` - Address autocomplete dropdowns

**How to Use:**
```typescript
// Location autocomplete is available in forms
<LocationAutocompleteInput
  value={address}
  onChange={setAddress}
/>
```

---

## Deployment & CI/CD

### Deployment Platforms

#### **Vercel** (Primary - Recommended)

**What:** Modern hosting platform for frontend applications
**Why:** Optimized for React/Vite, automatic SSL, global CDN, zero-config deployment

**Configuration:** `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Deploy Commands:**
```bash
vercel              # Deploy to preview
vercel --prod       # Deploy to production
```

**Features You Get:**
- Automatic HTTPS/SSL
- Global CDN (fast worldwide)
- Instant rollbacks
- Preview deployments for branches
- Environment variables management
- Analytics and monitoring

**Dashboard:** https://vercel.com/dashboard

---

#### **Netlify** (Alternative)

**What:** Competing platform similar to Vercel
**Why:** Alternative option with similar features

**Configuration:** `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy Commands:**
```bash
netlify deploy --prod
```

**Dashboard:** https://app.netlify.com

---

#### **GitHub Actions** (CI/CD Automation)

**What:** Automated deployment pipeline
**Why:** Auto-deploys to Vercel on every git push

**Configuration:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` or `master` branch → Production deployment
- Pull request → Preview deployment

**What It Does:**
1. Checks out code
2. Installs Node.js 20
3. Installs dependencies (`npm ci`)
4. Builds project (`npm run build`)
5. Deploys to Vercel automatically

**Required GitHub Secrets:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Project ID
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_KEY` - Google Gemini API key
- `VITE_GOOGLE_MAPS_KEY` - Google Maps API key

---

## Project Architecture

### Directory Structure

```
logos-vision-crm/
├── src/
│   ├── components/        # React components
│   │   ├── charts/        # Chart components (Recharts)
│   │   ├── export/        # Export functionality
│   │   ├── filters/       # Data filtering components
│   │   ├── projects/      # Project-specific components
│   │   ├── quickadd/      # Quick-add dialogs
│   │   ├── timeline/      # Timeline/Gantt views
│   │   └── ui/            # Reusable UI components
│   ├── services/          # Business logic & API calls
│   │   ├── supabaseClient.ts      # Supabase initialization
│   │   ├── authService.ts         # Authentication
│   │   ├── geminiService.ts       # AI features
│   │   ├── databaseService.ts     # CRUD operations
│   │   ├── realtimeService.ts     # Real-time subscriptions
│   │   └── [entity]Service.ts     # Entity-specific services
│   ├── contexts/          # React Context (state management)
│   │   └── AuthContext.tsx        # Authentication state
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── data/              # Mock/seed data
│   └── types.ts           # TypeScript type definitions
├── database/              # Database migrations
├── App.tsx                # Main application component
├── index.tsx              # Application entry point
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

---

### Component Architecture

**Application Flow:**
```
index.tsx
  └── AppWithAuth (Authentication wrapper)
      └── App.tsx (Main application)
          ├── Sidebar (Navigation)
          ├── Header (Top bar, search, notifications)
          └── [Current View Component]
              ├── Dashboard
              ├── ProjectsHub
              ├── ClientPortal
              ├── TaskView
              ├── Reports
              └── ... etc
```

**Key Components:**

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `Dashboard.tsx` | Home/overview page | Charts, recent activity, quick stats |
| `ProjectsHub.tsx` | Project management center | Kanban, Gantt, timeline views |
| `ProjectDetail.tsx` | Individual project view | Tasks, team, progress, AI summaries |
| `ClientPortal.tsx` | Client-facing interface | Limited view for external clients |
| `CommandPalette.tsx` | Quick navigation (Ctrl+K) | Search everything, keyboard shortcuts |
| `GlobalSearch.tsx` | Search functionality | Searches across all entities |
| `AiTools.tsx` | AI feature panel | AI-powered tools and suggestions |
| `TeamChat.tsx` | Internal messaging | Team communication |
| `Reports.tsx` | Analytics & reporting | Data visualizations, exports |

---

### Service Layer Architecture

**Services are organized by domain:**

```typescript
// Authentication
authService.ts → Supabase Auth
  - signIn(email, password)
  - signUp(email, password)
  - signOut()
  - getCurrentUser()

// Database Operations
databaseService.ts → Supabase Database
  - Generic CRUD operations
  - Batch operations
  - Transaction handling

// Entity Services
clientService.ts → Client management
projectService.ts → Project CRUD
taskService.ts → Task operations
teamMemberService.ts → Team management
caseService.ts → Case management
volunteerService.ts → Volunteer operations
donationService.ts → Donation tracking
eventService.ts → Event management
documentService.ts → File management

// AI Services
geminiService.ts → Google Gemini AI
  - 20+ AI-powered functions
  - Project analysis
  - Content generation
  - Recommendations

// Real-time
realtimeService.ts → Supabase Realtime
  - Subscribe to table changes
  - Live updates across clients
```

---

## Data Flow

### How Data Moves Through Your Application

```
┌─────────────────┐
│   React UI      │  User interacts with component
│  (Component)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Service       │  Service handles business logic
│  (e.g. project  │  Validates, transforms data
│   Service.ts)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Supabase Client │  Supabase SDK makes API call
│ (supabaseClient)│
└────────┬────────┘
         │
         ↓ (HTTPS)
┌─────────────────┐
│   Supabase      │  PostgreSQL database
│   Backend       │  Row Level Security
│  (Cloud DB)     │  Triggers & Functions
└────────┬────────┘
         │
         ↓ (WebSocket)
┌─────────────────┐
│  Realtime       │  Real-time updates pushed
│  Subscription   │  to all connected clients
└─────────────────┘
```

### Example: Creating a Project

```typescript
// 1. User clicks "New Project" in UI
// 2. Component calls service
const newProject = await createProject({
  name: "Website Redesign",
  client_id: "abc-123",
  status: "active"
});

// 3. Service validates and calls Supabase
// services/projectService.ts
const { data, error } = await supabase
  .from('projects')
  .insert(newProject)
  .select()
  .single();

// 4. Supabase inserts into PostgreSQL
// 5. RLS policies check if user has permission
// 6. Triggers fire (updated_at, activity logs)
// 7. Realtime broadcasts change to subscribers
// 8. Component updates with new project
```

---

## Environment Configuration

### Environment Variables

**All environment variables MUST start with `VITE_` to be accessible in client-side code.**

#### Local Development (.env.local)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development Mode (KEEP TRUE LOCALLY)
VITE_DEV_MODE=true

# Google Services
VITE_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
```

#### Production Deployment

```env
# Supabase Configuration (same as local)
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development Mode (MUST BE FALSE IN PRODUCTION!)
VITE_DEV_MODE=false

# Google Services (same as local)
VITE_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
```

**Critical:** `VITE_DEV_MODE=false` in production enables authentication. Dev mode bypasses login for development convenience.

---

### Accessing Environment Variables

**In Your Code:**
```typescript
// Access via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_API_KEY;

// Check if dev mode
const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
```

**In Vite Config:**
```typescript
// vite.config.ts exposes env vars
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
    }
  };
});
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production (outputs to /dist)
npm run build

# Preview production build locally
npm run preview

# Migrate data to Supabase
npm run migrate-data
```

---

### Development Server Features

**Vite Dev Server (Port 3000):**
- Hot Module Replacement (HMR) - changes appear instantly
- Fast startup (~1-2 seconds)
- Optimized for development
- Source maps for debugging
- TypeScript type checking

**Access:**
- Local: http://localhost:3000
- Network: http://0.0.0.0:3000 (accessible on LAN)

---

### Build Process

```bash
npm run build
```

**What Happens:**
1. TypeScript compiles to JavaScript
2. Vite bundles all modules
3. Code splitting for optimized loading
4. Minification and tree-shaking
5. Asset optimization (images, CSS)
6. Output to `/dist` directory

**Output Structure:**
```
dist/
├── index.html         # Main HTML file
├── assets/
│   ├── index-[hash].js    # Main JavaScript bundle
│   ├── index-[hash].css   # Compiled CSS
│   └── [images/fonts]     # Optimized assets
```

---

### Deployment Workflow

**Automatic (via GitHub Actions):**
```bash
git add .
git commit -m "Add new feature"
git push origin main
# → GitHub Actions automatically deploys to Vercel
```

**Manual (via CLI):**
```bash
# Build locally
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

---

## Future/Optional Services

### Services You May Want to Add

#### **Email Services**

| Service | Purpose | Integration Complexity |
|---------|---------|----------------------|
| **SendGrid** | Transactional emails (password reset, notifications) | Easy - REST API |
| **Mailchimp** | Marketing campaigns, newsletters | Medium - OAuth API |
| **Postmark** | Fast transactional email | Easy - REST API |

**Use Cases:**
- Email notifications for task assignments
- Password reset emails
- Project status updates
- Marketing campaigns to clients

---

#### **Payment Processing**

| Service | Purpose | Integration Complexity |
|---------|---------|----------------------|
| **Stripe** | Donation processing, subscription billing | Medium - SDK + webhooks |
| **PayPal** | Alternative payment method | Medium - SDK + OAuth |
| **Square** | Point-of-sale, donations | Medium - SDK |

**Use Cases:**
- Online donation processing
- Client invoice payments
- Subscription billing for services
- Event ticket sales

---

#### **Analytics & Monitoring**

| Service | Purpose | Integration Complexity |
|---------|---------|----------------------|
| **Google Analytics 4** | User behavior tracking, page views | Easy - Script tag |
| **Mixpanel** | Advanced product analytics | Easy - SDK |
| **Sentry** | Error tracking and monitoring | Easy - SDK |
| **LogRocket** | Session replay, debugging | Easy - SDK |

**Use Cases:**
- Track user engagement
- Monitor application performance
- Debug production issues
- Understand feature usage

---

#### **Communication**

| Service | Purpose | Integration Complexity |
|---------|---------|----------------------|
| **Twilio** | SMS notifications, phone calls | Medium - REST API |
| **SendBird** | In-app chat (alternative to custom) | Medium - SDK |
| **Zoom API** | Video conferencing integration | Medium - OAuth + REST |
| **Slack** | Team notifications, integrations | Easy - Webhooks |

**Use Cases:**
- SMS reminders for events
- Video calls with clients
- Slack notifications for project updates
- Advanced team chat features

---

#### **File Storage & Processing**

| Service | Purpose | Integration Complexity |
|---------|---------|----------------------|
| **Cloudinary** | Image optimization, transformations | Easy - REST API |
| **AWS S3** | Large file storage | Medium - AWS SDK |
| **Dropbox API** | File sync and sharing | Medium - OAuth |
| **DocuSign** | Document signing | Medium - OAuth + API |

**Use Cases:**
- Automatic image optimization
- Document signing workflows
- Large file uploads (videos, presentations)
- Backup and archival

---

#### **CRM & Marketing Automation**

| Service | Purpose | Integration Complexity |
|---------|---------|----------------------|
| **HubSpot** | Marketing automation, lead tracking | Medium - OAuth + REST |
| **Salesforce** | Enterprise CRM integration | Hard - Complex API |
| **Zapier** | Connect 3000+ apps without coding | Easy - Webhooks |
| **Make (Integromat)** | Visual automation workflows | Easy - Webhooks |

**Use Cases:**
- Sync contacts with HubSpot
- Automate workflows between tools
- Lead scoring and nurturing
- Sales pipeline management

---

#### **Calendar & Scheduling**

| Service | Purpose | Integration Complexity |
|---------|---------|----------------------|
| **Calendly** | Easy scheduling for meetings | Easy - Embed + webhooks |
| **Google Calendar API** | Calendar integration | Medium - OAuth + API |
| **Microsoft Graph** | Outlook calendar integration | Medium - OAuth + API |

**Use Cases:**
- Client meeting scheduling
- Team calendar sync
- Event management
- Automated reminders

---

#### **AI & Machine Learning (Beyond Gemini)**

| Service | Purpose | Integration Complexity |
|---------|---------|----------------------|
| **OpenAI GPT-4** | Alternative AI model | Easy - REST API |
| **Anthropic Claude** | Advanced reasoning AI | Easy - REST API |
| **Whisper API** | Speech-to-text transcription | Easy - REST API |
| **ElevenLabs** | Text-to-speech | Easy - REST API |

**Use Cases:**
- Meeting transcription
- Voice commands
- Multi-model AI responses
- Audio content generation

---

## Quick Reference Commands

### Development
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run migrate-data  # Migrate data to Supabase
```

### Deployment
```bash
vercel                # Deploy to Vercel preview
vercel --prod         # Deploy to Vercel production
netlify deploy --prod # Deploy to Netlify production
```

### Database (Supabase)
```sql
-- Run in Supabase SQL Editor
-- Location: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/sql

-- View all tables
SELECT * FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE clients, projects, tasks;
```

---

## Important URLs

### Development
- **Local App:** http://localhost:3000
- **Vite Config:** `/vite.config.ts`
- **Environment:** `/.env.local` (create this file)

### Supabase
- **Dashboard:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy
- **SQL Editor:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/sql
- **Table Editor:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/editor
- **Auth Users:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/auth/users
- **Realtime:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/database/replication

### Deployment
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Netlify Dashboard:** https://app.netlify.com
- **GitHub Actions:** Repository → Actions tab

### APIs
- **Google Cloud Console:** https://console.cloud.google.com
- **Gemini API:** https://ai.google.dev
- **Google Maps API:** https://console.cloud.google.com/apis/credentials

---

## Troubleshooting Guide

### Build Errors

**Problem:** TypeScript errors during build
```bash
# Check types without building
npx tsc --noEmit

# Clear cache
rm -rf node_modules/.vite
npm run build
```

**Problem:** Missing environment variables
- Ensure all variables start with `VITE_`
- Check `.env.local` exists and has correct values
- Restart dev server after changing env vars

---

### Supabase Connection Issues

**Problem:** "Failed to connect to Supabase"
- Verify `VITE_SUPABASE_URL` is correct
- Check `VITE_SUPABASE_ANON_KEY` matches dashboard
- Ensure RLS policies exist (`SUPABASE_QUICK_SETUP.sql`)
- Check network connectivity

**Problem:** "Permission denied" errors
- RLS policies may be blocking access
- Check user authentication status
- Verify policies in Supabase dashboard

---

### Deployment Issues

**Problem:** "Build failed" in Vercel/Netlify
- Check environment variables are set in platform
- Review build logs for specific errors
- Ensure dependencies are in `package.json`, not just dev dependencies

**Problem:** "White screen" after deployment
- Check console for JavaScript errors
- Verify environment variables (especially `VITE_DEV_MODE=false`)
- Check Supabase URL is accessible from deployment

---

## Key Takeaways

1. **Frontend:** React + TypeScript + Vite = Fast, type-safe development
2. **Backend:** Supabase = Complete backend (database, auth, realtime, storage)
3. **AI:** Google Gemini = 20+ AI features throughout the app
4. **Deploy:** Vercel/Netlify + GitHub Actions = Automatic deployments on push
5. **Dev Mode:** `VITE_DEV_MODE=true` locally, `false` in production
6. **Real-time:** Supabase Realtime keeps all clients in sync automatically
7. **Extensible:** Easy to add new services (payments, email, SMS, etc.)

---

**Last Updated:** November 2024
**Keep this file open while developing!** 📌
