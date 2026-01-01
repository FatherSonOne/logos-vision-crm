# 📋 Logos Vision CRM - Complete Project Breakdown

**Generated:** December 12, 2024  
**Project Location:** F:\logos-vision-crm  
**Owner:** Frankie Merritt, Founder & CEO of Logos Vision

---

## 🎯 Project Overview

**Logos Vision CRM** is a comprehensive nonprofit consulting CRM system built for Logos Vision, a South Carolina-based consulting firm. The system manages clients, projects, team members, volunteers, donations, events, and provides AI-powered features for grant writing, strategic planning, and automated workflows.

### Key Features
- **Client & Project Management** - Full lifecycle tracking for nonprofit consulting engagements
- **AI-Powered Tools** - Google Gemini integration for summaries, recommendations, grant writing
- **Team Collaboration** - Real-time chat, video conferencing, document sharing
- **Volunteer Management** - Coordinate volunteers with smart matching
- **Donation Tracking** - Track contributions and generate reports
- **Event Management** - Plan and execute fundraising events
- **Analytics & Reporting** - Data visualizations with Recharts
- **Modern UI** - Glassmorphism design with collapsible sidebar, smooth animations

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.1 | UI framework |
| TypeScript | 5.8.2 | Type safety |
| Vite | 6.2.0 | Build tool & dev server |
| Lucide React | 0.553.0 | Icon library |
| Recharts | 3.3.0 | Data visualization |

### Backend & Services
| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database, auth, realtime, storage |
| Google Gemini AI | AI-powered features (summaries, grant writing, recommendations) |
| Google Maps API | Location autocomplete, mapping |
| Vercel | Hosting & deployment |
| GitHub Actions | CI/CD automation |

### Development Tools
| Tool | Purpose |
|------|---------|
| dotenv | Environment variable management |
| tsx | TypeScript execution for migrations |
| @vitejs/plugin-react | React support in Vite |

---

## 📁 Project Structure

### Root Directory Files (Configuration)
```
├── .env, .env.local, .env.example    # Environment variables (Supabase, API keys)
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── vite.config.ts                     # Vite build configuration
├── vercel.json                        # Vercel deployment config
├── netlify.toml                       # Alternative deployment (Netlify)
├── .gitignore                         # Git ignore rules
└── README.md                          # Project documentation
```

### Source Code (`/src`)

#### Core Application Files
```
src/
├── index.tsx                  # Application entry point
├── App.tsx                    # Main app component with routing
├── AppWithAuth.tsx            # Authentication wrapper
└── types.ts                   # TypeScript type definitions
```

#### Components (`/src/components`)

**Core UI Components:**
- `Dashboard.tsx` - Home dashboard with charts & stats
- `Header.tsx` - Top navigation bar
- `Sidebar.tsx` - Collapsible navigation sidebar
- `Logo.tsx` - Logos Vision branding
- `Modal.tsx` - Reusable modal component
- `Toast.tsx` - Notification system

**Project Management:**
- `ProjectsHub.tsx` - Central project management interface
- `ProjectDetail.tsx` - Individual project view
- `ProjectList.tsx` - Project listings
- `ProjectTimeline.tsx` - Timeline visualization
- `ProjectKanban.tsx` - Kanban board view
- `ProjectGantt.tsx` - Gantt chart view
- `ProjectCalendar.tsx` - Calendar integration
- `ProjectComparison.tsx` - Compare multiple projects
- `ProjectFlowchart.tsx` - Project workflow diagrams
- `ProjectTemplates.tsx` - Reusable project templates
- `NewProjectDialog.tsx` - Create new projects
- `EditProjectDialog.tsx` - Edit project details

**Client Management:**
- `ClientList.tsx` - Client directory
- `ClientPortal.tsx` - Client-facing portal
- `ClientPortalLogin.tsx` - Portal authentication
- `ContactList.tsx` - Contact management
- `ContactsMap.tsx` - Geographic client mapping
- `AddContactDialog.tsx` - Add new contacts

**Team & Collaboration:**
- `TeamChat.tsx` - Internal team messaging
- `ConsultantList.tsx` - Team member directory
- `AddTeamMemberDialog.tsx` - Add team members
- `VideoConference.tsx` - Video meeting integration
- `LiveChat.tsx` - Real-time chat features
- `CreateRoomDialog.tsx` - Create chat rooms

**AI-Powered Features:**
- `AiTools.tsx` - AI assistant panel
- `AiChatBot.tsx` - Conversational AI
- `AiEnhancedTextarea.tsx` - Smart text enhancement
- `GrantAssistant.tsx` - AI grant writing help
- `MeetingAssistantModal.tsx` - Meeting analysis
- `ProjectPlannerModal.tsx` - AI project planning

**Task & Activity:**
- `TaskView.tsx` - Task management
- `TaskTimeline.tsx` - Task timeline view
- `ActivityFeed.tsx` - Activity log
- `ActivityDialog.tsx` - Log activities

**Case Management:**
- `CaseManagement.tsx` - Support/legal case tracking
- `CaseDetail.tsx` - Individual case view
- `CaseDialog.tsx` - Create/edit cases

**Volunteer Management:**
- `VolunteerList.tsx` - Volunteer directory
- `VolunteersMap.tsx` - Volunteer location mapping
- `AddVolunteerDialog.tsx` - Register volunteers

**Donations & Fundraising:**
- `Donations.tsx` - Donation tracking
- `CharityTracker.tsx` - Charity management
- `CharityHub.tsx` - Nonprofit directory

**Events:**
- `CalendarView.tsx` - Event calendar
- `EventEditor.tsx` - Create/edit events
- `EnhancedCalendarView.tsx` - Advanced calendar
- `CalendarIntegration.tsx` - Google Calendar sync
- `CalendarSettings.tsx` - Calendar preferences

**Documents & Content:**
- `DocumentLibrary.tsx` - File management
- `EmailCampaigns.tsx` - Email marketing
- `WebManagement.tsx` - Website content
- `WebpagePreviewModal.tsx` - Preview pages

**Navigation & Search:**
- `GlobalSearch.tsx` - Universal search
- `CommandPalette.tsx` - Keyboard shortcuts (Ctrl+K)
- `SearchResultsModal.tsx` - Search results display
- `SearchResultsPage.tsx` - Full search page
- `PageNavigator.tsx` - Page navigation

**Analytics & Reports:**
- `Reports.tsx` - Report generation
- `ProjectExportModal.tsx` - Export data

**Specialized UI:**
- `FormGenerator.tsx` - Dynamic form builder
- `PortalBuilder.tsx` - Custom portal creator
- `LocationAutocompleteInput.tsx` - Google Places autocomplete
- `ContextMenu.tsx` - Right-click context menus
- `GuidedTour.tsx` - User onboarding
- `Login.tsx` - Authentication UI

**Subdirectories:**
```
components/
├── calendar/          # Calendar-specific components
├── charts/            # Data visualization charts
├── export/            # Export functionality
│   └── ExportButton.tsx
├── filters/           # Data filtering
│   ├── AdvancedFilterPanel.tsx
│   └── filterLogic.ts
├── icons/             # Custom icon components
├── projects/          # Project-specific components
├── quickadd/          # Quick-add dialogs
│   └── QuickAddButton.tsx
├── timeline/          # Timeline visualizations
└── ui/                # Reusable UI primitives
```

#### Services (`/src/services`)

**Core Services:**
- `supabaseClient.ts` - Supabase initialization
- `authService.ts` - Authentication logic
- `geminiService.ts` - Google Gemini AI integration
- `databaseService.ts` - Generic database operations
- `realtimeService.ts` - Real-time subscriptions

**Entity Services:**
- `clientService.ts` - Client CRUD operations
- `projectService.ts` - Project management
- `taskService.ts` - Task operations
- `teamMemberService.ts` - Team member management
- `activityService.ts` - Activity logging
- `caseService.ts` - Case management
- `volunteerService.ts` - Volunteer operations
- `donationService.ts` - Donation tracking
- `eventService.ts` - Event management
- `documentService.ts` - File management
- `emailCampaignService.ts` - Email campaigns
- `projectNotesService.ts` - Project notes

**Specialized Services:**
- `portalDbService.ts` - Portal database operations
- `logosSync.ts` - Data synchronization
- `pulseToLogosSync.ts` - PULSE integration sync
- `testConnection.ts` - Database connectivity test

**Subdirectories:**
```
services/
└── calendar/          # Calendar integration services
```

#### Data (`/src/data`)
- `sampleData.ts` - South Carolina nonprofit sample data
- `sampleData-part2.ts` - Additional samples
- `sampleData-part3.ts` - Extended samples
- `mockData.ts` - Mock data for development
- `index.ts` - Data exports

#### Contexts (`/src/contexts`)
- `AuthContext.tsx` - Authentication state management

#### Hooks (`/src/hooks`)
- `useRealtime.ts` - Real-time data hook
- `useScrollReveal.ts` - Scroll animation hook

#### Utils (`/src/utils`)
- `dateHelpers.ts` - Date formatting utilities
- `distance.ts` - Distance calculations
- `geocoding.ts` - Address geocoding
- `eventTypes.ts` - Event type definitions
- `audio.ts` - Audio utilities

#### Library (`/src/lib`)
- `supabaseLogosClient.ts` - Supabase client setup

---

## 🗄️ Database Structure

### Supabase Tables

1. **clients** - Organizations/companies
2. **projects** - Consulting engagements
3. **tasks** - Project tasks
4. **team_members** - Consultants and staff
5. **activities** - Activity logs
6. **cases** - Support/legal cases
7. **volunteers** - Volunteer management
8. **donations** - Donation tracking
9. **events** - Event management
10. **documents** - Document metadata
11. **chat_messages** - Team communications

### Database Files
```
database/
├── schema.sql                        # Full database schema
├── schema_simple.sql                 # Simplified schema
├── migration_add_archived.sql        # Add archived fields
├── migration_add_project_features.sql# Project enhancements
├── migration_complete_projects_table.sql
├── migration_project_notes.sql       # Project notes feature
├── SETUP_GUIDE.md                    # Setup instructions
├── CONNECTION_GUIDE.md               # Connection help
├── QUICKSTART.txt                    # Quick reference
└── CHECKLIST.md                      # Setup checklist
```

Additional SQL Files:
```
├── supabase-schema.sql              # Complete Supabase schema
├── supabase-rls-policies.sql        # Row Level Security policies
├── SUPABASE_QUICK_SETUP.sql         # Quick setup script
├── add-sample-data.sql              # Sample data insertion
├── comprehensive-sample-data.sql    # Full sample dataset
```

---

## 🚀 Deployment & DevOps

### GitHub Actions (`/.github/workflows`)
- `deploy.yml` - Automated Vercel deployment on push

### Deployment Configurations
- `vercel.json` - Vercel hosting config
- `netlify.toml` - Netlify alternative config

### Batch Scripts (Windows Automation)
- `start.bat` - Quick start development server
- `start-dev-server.bat` - Alternative dev start
- `create-env.bat` - Generate .env file
- `push-to-github.bat` - Git push automation
- `push-to-github.ps1` - PowerShell version
- `sync-to-onedrive.bat` - OneDrive backup

---

## 📚 Documentation Files

### Setup & Getting Started
- `README.md` - Main project documentation
- `README_SETUP.md` - Setup instructions
- `SETUP_INSTRUCTIONS.md` - Detailed setup
- `SETUP_CHECKLIST.md` - Setup verification
- `HOW_TO_RUN_LOCALLY.md` - Local development guide
- `START_HERE_TOMORROW.md` - Quick session starter
- `QUICK_START.md` - Quick start guide
- `QUICK_REFERENCE.txt` - Quick reference card
- `QUICK_START_CARD.txt` - Printable reference

### Deployment Guides
- `AUTOMATIC_DEPLOYMENT.md` - CI/CD setup
- `DEPLOYMENT_FLOWCHART.md` - Visual deployment guide
- `DEPLOYMENT_QUICK_REF.md` - Quick deployment reference
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Pre-deploy checklist
- `PRODUCTION_SETUP.md` - Production configuration
- `GITHUB_DEPLOYMENT_SETUP.md` - GitHub Actions setup
- `GITHUB_SECRETS_SETUP.md` - Secrets configuration
- `GITHUB_ACTIONS_TROUBLESHOOTING.md` - CI/CD debugging
- `VERCEL_DEPLOYMENT_LOG.md` - Vercel deployment notes

### Database & Migration
- `MIGRATION_GUIDE.md` - Data migration instructions
- `MIGRATION_NOW.md` - Immediate migration steps
- `MIGRATION_START_HERE.md` - Migration starting point
- `QUICK_MIGRATION.txt` - Quick migration reference
- `LOAD_SAMPLE_DATA_INSTRUCTIONS.md` - Load sample data
- `POPULATE_DATABASE.md` - Database population
- `SUPABASE_SETUP.md` - Supabase configuration
- `SUPABASE_STEP_BY_STEP.md` - Step-by-step Supabase
- `SUPABASE_FIX_GUIDE.md` - Troubleshooting
- `SUPABASE_COMPLETE.txt` - Completion checklist

### Synchronization
- `HOW_TO_SYNC.md` - Sync guide
- `SIMPLE_SYNC_GUIDE.txt` - Simplified sync
- `SYNC_STATUS.md` - Current sync status

### Feature Documentation
- `TECH_STACK_REFERENCE.md` - Complete tech stack reference
- `GLOBAL_SEARCH_INTEGRATED.md` - Search feature docs
- `GLOBAL_SEARCH_INTEGRATION.md` - Search integration
- `GLOBAL_SEARCH_COMPLETE.md` - Search completion notes
- `CALENDAR_INTEGRATION_GUIDE.md` - Calendar setup
- `CALENDAR_INTEGRATION_STEPS.md` - Step-by-step calendar
- `CALENDAR_VISUAL_REFERENCE.md` - Calendar visuals
- `ENHANCED_CALENDAR_GUIDE.md` - Enhanced features
- `DEBUGGING_CALENDAR.md` - Calendar troubleshooting

### UI/UX Documentation
- `UI_MODERNIZATION_PLAN.md` - UI overhaul plan
- `UI_IMPROVEMENTS_COMPLETE.md` - Completed improvements
- `COLLAPSIBLE_SIDEBAR_GUIDE.md` - Sidebar feature
- `SIDEBAR_ENHANCED_COMPLETE.md` - Sidebar enhancements
- `COLOR_SYSTEM_GUIDE.md` - Color system
- `COLOR_SYSTEM_COMPLETE.md` - Color completion
- `COLOR_IMPLEMENTATION_COMPLETE.md` - Implementation notes
- `CHARITY_HUB_DESIGN_SYSTEM.md` - Design system
- `SPACING_SYSTEM.md` - Spacing standards
- `CARD_HOVER_EFFECTS.md` - Hover effects guide
- `ADVANCED_MICRO_INTERACTIONS_GUIDE.md` - Micro-interactions

### Component Guides
- `ACCORDION_COMPLETE.md` - Accordion component
- `ACCORDION_QUICKSTART.md` - Quick accordion setup
- `BREADCRUMBS_COMPLETE.md` - Breadcrumbs feature
- `BREADCRUMBS_GUIDE.md` - Breadcrumb usage
- `BREADCRUMBS_FIX.md` - Breadcrumb fixes
- `TABS_COMPLETE.md` - Tabs component
- `TABS_GUIDE.md` - Tab usage guide
- `TABS_QUICKSTART.md` - Quick tabs setup
- `CONTEXT_MENUS_COMPLETE.md` - Context menu feature
- `CONTEXT_MENUS_GUIDE.md` - Context menu guide
- `CONTEXT_MENUS_QUICKSTART.md` - Quick context menu setup
- `SPLIT_VIEW_COMPLETE.md` - Split view feature
- `SPLIT_VIEW_GUIDE.md` - Split view usage
- `SPLIT_VIEW_READY_FOR_LATER.md` - Future enhancements
- `SPLIT_VIEW_TUTORIAL_ADDED.md` - Tutorial notes

### Timeline Feature
- `TIMELINE_FEATURE_GUIDE.md` - Timeline feature guide
- `TIMELINE_INTEGRATION_GUIDE.md` - Integration steps
- `TIMELINE_COMPONENT_CODE.md` - Code reference
- `TIMELINE_VISUAL_REFERENCE.md` - Visual guide
- `TIMELINE_ORB_CONTEXT_MENU.md` - Orb context menus
- `ORB_VISUAL_GUIDE.md` - Orb design guide

### Data Visualization
- `DATA_VISUALIZATIONS_GUIDE.md` - Chart implementation
- `DATA_VIZ_COMPLETE.md` - Visualization completion

### Interactive Features
- `COMMAND_PALETTE_GUIDE.md` - Command palette (Ctrl+K)
- `KEYBOARD_SHORTCUTS.md` - Keyboard shortcuts
- `KEYBOARD_SHORTCUTS_COMPLETE.md` - Shortcut completion

### Session Summaries
- `SESSION_SUMMARY.md` - Development session notes
- `TODAY_COMPLETE_SESSION.md` - Daily completion log
- `TODAY_SESSION_SUMMARY.md` - Today's work summary
- `IMPROVEMENTS_SUMMARY.md` - Improvement tracking
- `PHASE_3_PROJECTS_COMPLETE.md` - Phase 3 completion
- `PHASE_5_COMPLETE.md` - Phase 5 completion

### Development Workflows
- `DEVELOPMENT_WORKFLOW.txt` - Dev workflow guide
- `TOMORROW_QUICK_REF.txt` - Next session prep
- `COMPLETION_CHECKLIST.md` - Feature completion
- `COMPLETE_CHECKLIST.md` - Overall completion
- `ALL_TASKS_COMPLETE.md` - Task completion log

### Additional Guides
- `ADDITIONAL_UI_IDEAS.md` - Future UI ideas
- `CURSOR_TEST_INSTRUCTIONS.md` - Testing instructions
- `SEARCH_BUTTON_ADDED.md` - Search button notes
- `HELP_BUTTON_CONNECTED.md` - Help integration
- `UPDATE_APP_INSTRUCTIONS.md` - Update procedures
- `URGENT_FIX_STEPS.md` - Emergency fixes
- `MOCK_DATA_REMOVED.md` - Data cleanup notes
- `COORDINATE_DEBUG.md` - Coordinate debugging
- `OFFSET_FIX.md` - UI offset fixes

---

## 🔧 Migration Scripts

TypeScript migration utilities for data transfer:
- `migrateData.ts` - Main migration orchestrator
- `migrateProjectsFixed.ts` - Project migration (fixed)
- `migrateProjectsActivities.ts` - Project activities
- `migrateActivities.ts` - Activity logs
- `migrateCases.ts` - Case data
- `migrateDonations.ts` - Donation data
- `migrateTasks.ts` - Task data
- `migrateTeamMembers.ts` - Team member data
- `migrateVolunteers.ts` - Volunteer data
- `migrateAllRemaining.ts` - Remaining entities
- `checkSchema.ts` - Schema validation

---

## 🌐 Environment Variables

Required environment variables (`.env.local`):

```bash
# Supabase
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development Mode (true for local, false for production)
VITE_DEV_MODE=true

# Google Services
VITE_API_KEY=AIzaSyAxjKjbzJTzOEg2dQ_S7z6NciiPUqFrX7o
VITE_GOOGLE_MAPS_KEY=AIzaSyD3CAVYUQfY2cQ0tqF00ABSRJZUxVcCMF0
```

**Important:** All variables must start with `VITE_` to be accessible in client code.

---

## 📦 npm Scripts

```bash
# Development
npm run dev              # Start Vite dev server (localhost:3000)
npm run build            # Build for production
npm run preview          # Preview production build locally

# Data Migration
npm run migrate-data     # Run data migration scripts
```

---

## 🎨 UI/UX Features

### Design System
- **Glassmorphism Effects** - Frosted glass backgrounds with backdrop blur
- **Neutral Color Palette** - Soft slate grays with subtle accents
- **Smooth Animations** - 30-second animated gradient backgrounds
- **Collapsible Sidebar** - Saves state in localStorage
- **Hover Tooltips** - Contextual help on hover
- **Responsive Layout** - Mobile-friendly design

### Interactive Elements
- **Command Palette** - Ctrl+K quick navigation
- **Context Menus** - Right-click functionality
- **Keyboard Shortcuts** - Power user features
- **Breadcrumbs** - Hierarchical navigation
- **Split View** - Side-by-side content
- **Timeline Views** - Interactive project timelines

### Data Visualization
- **Charts & Graphs** - Recharts integration
- **Maps** - Google Maps for locations
- **Kanban Boards** - Drag-and-drop task management
- **Gantt Charts** - Project scheduling
- **Calendar Views** - Event management

---

## 🤖 AI Features (Google Gemini)

### Implemented AI Capabilities
1. **Project Summary Generation** - Executive summaries
2. **Task Suggestions** - Context-aware task recommendations
3. **Team Member Recommendations** - AI skill matching
4. **Meeting Analysis** - Extract action items from notes
5. **Grant Writing Assistant** - Draft grant proposals
6. **Email Campaign Generator** - Marketing content creation
7. **Chat Bot** - Conversational AI assistant
8. **Smart Text Enhancement** - Improve user-written content
9. **Volunteer Matching** - Match volunteers to opportunities
10. **Web Search Integration** - AI-powered research

---

## 🔄 Real-time Features

Powered by Supabase Realtime:
- Live chat messages
- Project updates
- Task changes
- Activity feed
- Team presence
- Document collaboration

---

## 🚦 Development Status

### ✅ Completed Features
- Core CRM functionality
- Authentication & authorization
- Real-time subscriptions
- AI integration (Google Gemini)
- Modern UI with glassmorphism
- Collapsible sidebar
- Calendar integration
- Global search
- Command palette
- Context menus
- Export functionality
- Sample data for South Carolina nonprofits

### 🚧 In Progress / Planned
- PULSE communication platform integration
- Enhanced analytics dashboard
- Mobile app development
- Additional AI models (Anthropic Claude)
- Advanced reporting features

---

## 📊 Sample Data

Included realistic South Carolina nonprofit data:
- **12 nonprofit clients** (Hope Harbor Foundation, Upstate Community Arts Alliance, Youth Futures Network, etc.)
- **12 team members** (consultants, specialists, coordinators)
- **Multiple projects** (Annual Impact Gala, Federal Grant Application, Strategic Plans)
- **Sample tasks, volunteers, donations, events**

---

## 🔐 Security

- **Row Level Security (RLS)** - Supabase policies
- **JWT Authentication** - Secure sessions
- **API Key Management** - Environment variables
- **HTTPS Only** - Encrypted connections

---

## 🌟 Key Differentiators

1. **AI-First Approach** - Google Gemini integration throughout
2. **Nonprofit Focus** - Purpose-built for consulting firms
3. **Modern UX** - Glassmorphism, smooth animations
4. **Real-time Collaboration** - Supabase-powered live updates
5. **Comprehensive Features** - All-in-one solution
6. **Easy Deployment** - Automated CI/CD with GitHub Actions

---

## 📝 File Count Summary

```
Total Project Files: ~800+

Breakdown:
├── Source Code (src/): ~150 files
├── Components: ~100 files
├── Services: ~25 files
├── Documentation: ~150 files
├── Database: ~15 SQL files
├── Configuration: ~20 files
└── Node Modules: ~500+ dependencies
```

---

## 🔗 Important URLs

### Development
- Local App: http://localhost:3000
- Vite Config: `/vite.config.ts`

### Supabase
- Dashboard: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy
- SQL Editor: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/sql
- Table Editor: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/editor

### Deployment
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repository: [Your GitHub URL]

### APIs
- Google Cloud Console: https://console.cloud.google.com
- Gemini API: https://ai.google.dev

---

## 💡 Next Steps for Perplexity Research

You can use this breakdown to ask Perplexity about:
1. Best practices for React 19 + TypeScript + Vite
2. Supabase optimization for large datasets
3. Google Gemini AI integration patterns
4. Modern CRM architecture patterns
5. Nonprofit consulting industry trends
6. UI/UX best practices for glassmorphism
7. Real-time collaboration implementation
8. CI/CD strategies for React apps

---

**Generated by:** Claude (Anthropic)  
**For:** Frankie Merritt, Logos Vision  
**Purpose:** Perplexity AI research and project documentation
