# Logos Vision CRM - AI Assistant Guide

This document provides context and guidelines for AI assistants working on the Logos Vision CRM project.

## Project Overview

Logos Vision CRM is a modern customer relationship management system designed for managing clients, projects, team members, and tasks. It features advanced UI components, AI integration via Google Gemini, and comprehensive data visualization capabilities.

**Live App**: https://ai.studio/apps/drive/1T2L3Of7nwhY-YIzDn7zbga3WLBR1Am0b

## Tech Stack

### Core Technologies
- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 6.2.0
- **Language**: TypeScript 5.8.2
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini AI (@google/genai)
- **UI Components**: Custom components with Lucide React icons
- **Data Visualization**: Recharts 3.3.0

### Key Dependencies
- `@supabase/supabase-js` - Database and authentication
- `@google/genai` - AI-powered features
- `lucide-react` - Icon system
- `recharts` - Charts and data visualization

## Project Structure

```
/src
├── App.tsx              # Main application component
├── AppWithAuth.tsx      # Authentication wrapper
├── index.tsx            # Application entry point
├── types.ts             # TypeScript type definitions
├── components/          # React components
├── contexts/            # React contexts (state management)
├── data/                # Static/seed data
├── hooks/               # Custom React hooks
├── services/            # External service integrations (Supabase, AI)
└── utils/               # Utility functions

/database                # Database setup and migration files
```

## Core Data Models

### Main Entities
- **Client**: Customer/client information with contact details
- **Project**: Project details linked to clients and team members
- **Task**: Individual tasks with status, assignments, and due dates
- **TeamMember**: Team member profiles and roles

### Status Enums
- **ProjectStatus**: Planning, InProgress, Completed, OnHold
- **TaskStatus**: ToDo, InProgress, Done

See `src/types.ts` for complete type definitions.

## Architecture Patterns

### State Management
- React Context API for global state
- Local component state for UI-specific state
- Supabase real-time subscriptions for data synchronization

### Component Organization
- Feature-based component organization in `/src/components`
- Reusable UI primitives
- Composition over inheritance
- Custom hooks for shared logic

### Styling Approach
- Custom CSS with CSS variables for theming
- Consistent spacing system (defined in SPACING_SYSTEM.md)
- Color system with dark mode support (see COLOR_SYSTEM_COMPLETE.md)
- Micro-interactions and animations (see ADVANCED_MICRO_INTERACTIONS_GUIDE.md)

## Development Workflow

### Local Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
```

### Environment Variables
Required in `.env.local`:
- `GEMINI_API_KEY` - Google Gemini API key for AI features
- Supabase credentials (see database/SETUP_GUIDE.md)

### Database
- See `database/SETUP_GUIDE.md` for Supabase setup
- See `database/CONNECTION_GUIDE.md` for connection configuration
- Migration script: `npm run migrate-data`

## Key Features & Components

### UI Components
- **Accordions** (ACCORDION_COMPLETE.md)
- **Breadcrumbs** (BREADCRUMBS_COMPLETE.md)
- **Collapsible Sidebar** (COLLAPSIBLE_SIDEBAR_GUIDE.md)
- **Context Menus** (CONTEXT_MENUS_COMPLETE.md)
- **Command Palette** (COMMAND_PALETTE_GUIDE.md)
- **Global Search** (GLOBAL_SEARCH_COMPLETE.md)
- **Tabs** (TABS_COMPLETE.md)
- **Split View** (SPLIT_VIEW_COMPLETE.md)
- **Data Visualizations** (DATA_VIZ_COMPLETE.md)
- **Keyboard Shortcuts** (KEYBOARD_SHORTCUTS_COMPLETE.md)

### Interactive Features
- Advanced hover effects and micro-interactions
- Responsive data tables
- Real-time updates via Supabase
- AI-powered project scaffolding
- Context-aware search

## Deployment

### Platforms
- **Primary**: Vercel (automatic deployments)
- **GitHub Actions**: Automated CI/CD (.github/workflows/deploy.yml)

### Deployment Guides
- Quick reference: DEPLOYMENT_QUICK_REF.md
- Complete setup: GITHUB_DEPLOYMENT_SETUP.md
- Production checklist: PRODUCTION_DEPLOYMENT_CHECKLIST.md
- Flowchart: DEPLOYMENT_FLOWCHART.md

### Deployment Commands
```bash
# Manual Vercel deployment
vercel --prod
```

## Important Conventions

### Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use descriptive variable and function names
- Keep components focused and single-responsibility
- Extract complex logic into custom hooks

### File Naming
- Components: PascalCase (e.g., `ProjectCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: Defined in `types.ts` or co-located with components
- Contexts: `*Context.tsx` pattern

### Import Organization
1. External dependencies (React, libraries)
2. Internal utilities/services
3. Types
4. Components
5. Styles

### Git Workflow
- Branch naming: `claude/*` prefix for AI-assisted development
- Descriptive commit messages
- Push to feature branches, not main
- Current working branch: `claude/update-claude-md-015hBqWr5NSr9xKxKMSLtQHH`

## Common Tasks

### Adding a New Feature
1. Check existing component patterns in `/src/components`
2. Define types in `types.ts` if needed
3. Create component with TypeScript
4. Add to appropriate context if state management needed
5. Update relevant documentation
6. Test locally with `npm run dev`

### Database Changes
1. Update Supabase schema via dashboard or SQL
2. Update TypeScript types in `types.ts`
3. Update service layer in `/src/services`
4. Test with real-time subscriptions if applicable

### UI Improvements
1. Follow established color system (COLOR_SYSTEM_COMPLETE.md)
2. Use consistent spacing (SPACING_SYSTEM.md)
3. Add micro-interactions where appropriate
4. Ensure responsive design
5. Test dark mode if applicable

## Testing & Quality

### Before Committing
- Run `npm run build` to check for TypeScript errors
- Test all affected features locally
- Verify responsive design
- Check browser console for errors

### Production Checks
- See PRODUCTION_DEPLOYMENT_CHECKLIST.md
- Verify environment variables are set
- Test critical user flows
- Monitor Supabase connection

## Documentation Reference

The project has extensive documentation organized by feature:

**Setup & Deployment**
- SETUP_CHECKLIST.md
- GITHUB_DEPLOYMENT_SETUP.md
- PRODUCTION_SETUP.md
- QUICK_DEPLOY_STEPS.md

**Component Guides**
- Each major component has COMPLETE.md, GUIDE.md, or QUICKSTART.md files
- Reference these for implementation details and patterns

**Database**
- database/SETUP_GUIDE.md
- database/CONNECTION_GUIDE.md
- database/CHECKLIST.md

**Session Summaries**
- Various SESSION_SUMMARY.md and TODAY_*.md files track development history
- Useful for understanding evolution of features

## AI Integration

The project uses Google Gemini AI for:
- Project scaffolding and task generation
- Intelligent suggestions
- Content generation

See `src/services/` for AI service implementation.

## Troubleshooting

### Common Issues
1. **Supabase connection**: Check environment variables and SUPABASE_FIX_GUIDE.md
2. **Build errors**: Ensure all TypeScript types are properly defined
3. **Missing dependencies**: Run `npm install`
4. **Port conflicts**: Default dev server runs on port 5173

### Getting Help
- Check relevant GUIDE.md or COMPLETE.md files
- Review types.ts for data model questions
- Check database/ directory for backend issues

## Notes for AI Assistants

- Always read existing code before suggesting modifications
- Follow established patterns and conventions
- Reference line numbers when discussing code (e.g., `src/App.tsx:42`)
- Use TodoWrite tool for multi-step tasks
- Check git status before making changes
- Push to the designated claude/* branch
- Don't over-engineer solutions - keep it simple
- Avoid adding unnecessary comments or documentation
- When in doubt, ask for clarification

## Recent Updates

- Comprehensive deployment guides added
- Enhanced UI component library
- Improved keyboard shortcuts system
- Advanced micro-interactions
- Global search integration
- Split view functionality
- Data visualization components

---

**Last Updated**: 2025-11-28
**Version**: 1.0.0
**Maintained By**: AI-assisted development
