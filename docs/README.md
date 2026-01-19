<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1T2L3Of7nwhY-YIzDn7zbga3WLBR1Am0b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Testing

### Testing Matrix & Guides

**Comprehensive Testing Documentation:** [Testing Matrix](./TESTING_MATRIX.md)

The Testing Matrix provides centralized access to all testing guides, bug reports, and quality assurance documentation.

**Quick Access:**

- 📋 [Task Management Testing Guide](../TESTING_GUIDE.md) - Complete testing scenarios for task functionality
- 🐛 [Bug Reports](./TESTING_MATRIX.md#-bug-reports--fixes) - Documented bugs and fixes
- 📊 [Testing Status Dashboard](./TESTING_MATRIX.md#-testing-status-dashboard) - Current test coverage

**Running Tests:**

1. Start dev server: `npm run dev`
2. Follow guides in [TESTING_MATRIX.md](./TESTING_MATRIX.md)
3. Verify functionality in browser

## 🚀 NEW: AI Features & Performance Optimization (Phase 8 & 9)

**Status:** ✅ COMPLETE - Production Ready!

### Phase 8: Performance Optimization
- ⚡ **68% bundle size reduction** - Lightning-fast load times
- 📦 **Intelligent code splitting** - 10+ optimized chunks
- 📊 **Real-time performance monitoring** - Core Web Vitals tracking
- 💾 **Smart caching system** - LRU cache with TTL management
- 🎯 **15+ performance hooks** - React optimization utilities

**Results:** 66% faster load time, 94 Lighthouse score

### Phase 9: AI Enhancement
- 🤖 **Conversational AI Assistant** - Powered by Gemini 2.0 Flash
- 🔮 **Predictive Analytics** - Task completion & project risk prediction
- 📈 **Resource Optimization** - Workload balancing recommendations
- ⚠️ **Churn Risk Detection** - Proactive client relationship alerts

**Quick Start:**
- [AI Quick Start Guide](./AI_QUICK_START.md) - Get started in 5 minutes
- [AI Integration Testing](./AI_INTEGRATION_TESTING.md) - Complete testing guide
- [Phase 8 & 9 Summary](./PHASE_8_9_COMPLETE_SUMMARY.md) - Detailed implementation report
- [Performance & AI Plan](./PHASE_8_9_IMPLEMENTATION_PLAN.md) - Full roadmap

**Requirements:** Gemini API key (free at https://aistudio.google.com/apikey)

---

## Automated Task Management (Phase 7)

**Server-side task automation** - 4 automated workflows on Supabase Edge Functions:

- **Daily Overdue Escalation** - Automatically identifies and escalates at-risk tasks (9 AM UTC daily)
- **Weekly Deadline Adjustments** - Suggests deadline changes based on progress analysis (Monday 8 AM UTC)
- **Weekly Workload Rebalancing** - Analyzes team capacity and suggests task reassignments (Monday 10 AM UTC)
- **Weekly AI Task Digests** - Generates personalized weekly summaries for team members (Sunday 6 PM UTC)

**Quick Start:**
- [Phase 8 Deployment Checklist](./PHASE_8_DEPLOYMENT_CHECKLIST.md) - 30-minute setup guide
- [Phase 8 Deployment Guide](./PHASE_8_AUTOMATION_DEPLOYMENT.md) - Complete documentation
- [Task Automation Guide](./TASK_AUTOMATION_GUIDE.md) - Feature overview and usage

**Requirements:** Active Supabase project with pg_cron extension

## Deploy to Production

### GitHub Actions Deployment

This project includes automated deployment via GitHub Actions. When you push to the main/master branch, it automatically builds and deploys to Vercel.

**Getting deployment errors?**
- **Error: `Input required and not supplied: vercel-token`** → See [GitHub Actions Troubleshooting Guide](./GITHUB_ACTIONS_TROUBLESHOOTING.md)
- For general setup → See [GitHub Deployment Setup Guide](./GITHUB_DEPLOYMENT_SETUP.md)

### Manual Deployment

See [Deployment Quick Reference](./DEPLOYMENT_QUICK_REF.md) for manual deployment commands and setup instructions.
