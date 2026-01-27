# Contacts Redesign - Deployment Guide

> Comprehensive deployment guide for the Logos Vision CRM Contacts redesign featuring Pulse API integration, AI-driven priorities, and modern relationship management.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build & Deployment](#build--deployment)
4. [Pulse API Configuration](#pulse-api-configuration)
5. [Verification Checklist](#verification-checklist)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Plan](#rollback-plan)
8. [Monitoring & Support](#monitoring--support)

---

## Prerequisites

### System Requirements

- **Node.js**: v18.0.0 or higher (v20.x recommended)
- **npm**: v9.0.0 or higher
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Development Tools

```bash
# Verify Node.js version
node --version  # Should be >= v18.0.0

# Verify npm version
npm --version   # Should be >= v9.0.0

# Install dependencies
npm install
```

### Database Setup

The Contacts redesign uses Supabase for data persistence. Ensure your Supabase project includes:

- `contacts` table with extended Pulse fields
- `entity_mappings` table for Pulse sync tracking
- Proper RLS (Row Level Security) policies configured

---

## Environment Configuration

### Environment Variables

Create or update your `.env` file with the following variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Pulse API Configuration (Optional - will use mock data if not configured)
VITE_PULSE_API_URL=https://pulse-api.yourdomain.com/api
VITE_PULSE_API_KEY=your-pulse-api-key

# Debug Logging (Optional - only for development/troubleshooting)
VITE_DEBUG_LOGGING=false
```

### Environment-Specific Configuration

#### Development Environment

```env
# .env.development
VITE_DEBUG_LOGGING=true
VITE_PULSE_API_URL=https://pulse-staging.yourdomain.com/api
```

#### Production Environment

```env
# .env.production
VITE_DEBUG_LOGGING=false
VITE_PULSE_API_URL=https://pulse-api.yourdomain.com/api
VITE_PULSE_API_KEY=prod-api-key-here
```

### Fallback Behavior

The Contacts redesign includes intelligent fallback mechanisms:

- **No Pulse API configured**: Automatically uses mock data for development
- **Pulse API unavailable**: Gracefully falls back to mock data with warning
- **Rate limit exceeded**: Displays user-friendly error with retry option

This ensures the application remains functional even when the Pulse API is unavailable.

---

## Build & Deployment

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Tests

```bash
# Run all tests
npm test

# Expected output: 419/419 tests passing
```

### Step 3: Build for Production

```bash
# Create production build
npm run build

# Output directory: dist/
# Expected build time: 30-60 seconds
```

### Step 4: Preview Production Build (Optional)

```bash
# Test production build locally
npm run preview

# Access at: http://localhost:4173
```

### Step 5: Deploy to Infrastructure

The deployment process varies by infrastructure:

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Set environment variables via Vercel dashboard
```

#### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to production
netlify deploy --prod

# Set environment variables via Netlify dashboard
```

#### Static Hosting (AWS S3, Azure Blob, etc.)

```bash
# Build for production
npm run build

# Upload dist/ folder to your static hosting service
# Configure environment variables in your CI/CD pipeline
```

---

## Pulse API Configuration

### What is Pulse?

Pulse is the communication intelligence platform that powers the Contacts redesign with:

- **Relationship Profiles**: Unified contact data with relationship scores
- **AI Insights**: Smart summaries, talking points, and next actions
- **Interaction History**: Unified log of all communications
- **Priority Actions**: AI-driven action queue for relationship management

### Obtaining Pulse API Credentials

1. **Contact Your Pulse Administrator** to obtain:
   - API Base URL (e.g., `https://pulse-api.yourdomain.com/api`)
   - API Key (for authentication)

2. **Set Environment Variables**:
   ```env
   VITE_PULSE_API_URL=https://pulse-api.yourdomain.com/api
   VITE_PULSE_API_KEY=your-api-key-here
   ```

### Testing Pulse API Connection

```bash
# Run health check in browser console
pulseContactService.checkHealth()
  .then(healthy => console.log('Pulse API healthy:', healthy))
  .catch(err => console.error('Pulse API error:', err))
```

Or navigate to the Contacts page - a warning will appear if the API is not configured:

```
[WARN] Pulse Contact Service: API URL not configured, using mock data for development
```

### Pulse API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/contacts/relationship-profiles` | GET | Fetch all contacts with relationship data |
| `/api/contacts/:id/ai-insights` | GET | Get AI-generated insights for a contact |
| `/api/contacts/:id/interactions` | GET | Fetch interaction history |
| `/api/contacts/recommended-actions` | GET | Get priority action queue |
| `/api/contacts/google-sync/trigger` | POST | Trigger Google Contacts sync |
| `/api/contacts/google-sync/status/:id` | GET | Check sync job status |

### Rate Limiting

The Pulse API implements rate limiting:

- **Default Limit**: 100 requests per minute
- **Response Headers**:
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets
- **429 Response**: Returns `Retry-After` header with seconds to wait

The application automatically handles rate limiting with user-friendly error messages.

---

## Verification Checklist

Use this checklist after deployment to verify everything is working correctly:

### Pre-Deployment Checks

- [ ] All tests passing (419/419)
- [ ] Production build succeeds without errors
- [ ] Environment variables configured correctly
- [ ] Pulse API credentials obtained (if using live API)
- [ ] Database migrations applied (if any)

### Post-Deployment Checks

#### Core Functionality

- [ ] Contacts page loads without errors
- [ ] Contact cards display correctly in gallery view
- [ ] Search and filters work as expected
- [ ] Clicking a contact opens detail view
- [ ] Back button returns to gallery view
- [ ] Light/dark mode toggle works smoothly

#### Priorities Feed

- [ ] Priorities tab displays action cards
- [ ] Filter chips work (all, overdue, today, week, high-value)
- [ ] Action cards show correct priority levels
- [ ] Completing an action removes it from the list
- [ ] Action count badge updates correctly

#### Pulse API Integration (if configured)

- [ ] Real contact data loads from Pulse API
- [ ] AI insights appear in contact detail view
- [ ] Interaction history displays correctly
- [ ] Recommended actions populate priorities feed
- [ ] No console errors related to API calls

#### Fallback Behavior (if Pulse not configured)

- [ ] Mock data displays correctly
- [ ] Warning message appears (only in dev mode)
- [ ] All features work with mock data
- [ ] No errors in production console

#### Responsive Design

- [ ] Mobile view (320px+): Cards stack vertically, navigation works
- [ ] Tablet view (768px+): 2-column grid displays
- [ ] Desktop view (1024px+): 3-4 column grid displays
- [ ] Large screen (1440px+): 4+ column grid with proper spacing

#### Performance

- [ ] Initial page load < 2 seconds
- [ ] Smooth 60fps animations
- [ ] No layout shifts during load
- [ ] Images load progressively with placeholders

#### Accessibility

- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces page sections
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast meets WCAG 2.1 AA standards

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Contacts page shows "Failed to load contacts"

**Symptoms:**
- Error message on Contacts page
- No contacts display

**Solutions:**

1. **Check Supabase connection**:
   ```bash
   # Verify environment variables
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. **Verify database permissions**:
   - Check RLS policies on `contacts` table
   - Ensure anonymous access is properly configured

3. **Check browser console** for specific error messages

#### Issue: Pulse API not connecting

**Symptoms:**
- Warning: "API URL not configured, using mock data"
- Mock data displays instead of real data

**Solutions:**

1. **Verify environment variables**:
   ```bash
   # Check if Pulse API URL is set
   echo $VITE_PULSE_API_URL
   ```

2. **Test API connectivity**:
   ```bash
   # Test API endpoint directly
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://pulse-api.yourdomain.com/api/health
   ```

3. **Check API key validity**:
   - Verify API key hasn't expired
   - Ensure API key has proper permissions

4. **Review CORS configuration**:
   - Pulse API must allow requests from your domain
   - Check CORS headers in network tab

#### Issue: Debug logging appears in production

**Symptoms:**
- Console logs visible in production
- Performance impact from excessive logging

**Solutions:**

1. **Check environment variable**:
   ```env
   # Should be false or not set in production
   VITE_DEBUG_LOGGING=false
   ```

2. **Rebuild application**:
   ```bash
   npm run build
   ```

3. **Clear browser cache** after redeployment

#### Issue: Rate limit errors from Pulse API

**Symptoms:**
- Error: "Rate limit exceeded. Retry after X seconds"
- 429 status codes in network tab

**Solutions:**

1. **Wait for rate limit to reset** (check `Retry-After` header)

2. **Reduce request frequency**:
   - Enable caching in Pulse API configuration
   - Increase polling intervals for sync jobs

3. **Contact Pulse administrator** to increase rate limits

#### Issue: Slow page load times

**Symptoms:**
- Initial load > 3 seconds
- Janky animations

**Solutions:**

1. **Enable production mode**:
   ```bash
   # Ensure building with production flag
   npm run build  # Already uses production mode
   ```

2. **Optimize images**:
   - Use WebP format for avatars
   - Implement lazy loading for images below fold

3. **Enable CDN caching**:
   - Configure CDN to cache static assets
   - Set proper cache headers

4. **Check bundle size**:
   ```bash
   npm run build -- --profile
   # Review bundle analyzer output
   ```

### Enable Debug Logging

For troubleshooting in production, temporarily enable debug logging:

```env
# .env.production
VITE_DEBUG_LOGGING=true
```

Then rebuild and redeploy. Debug logs will appear in browser console with prefixes:

- `[DEBUG]` - Detailed flow information
- `[INFO]` - General operations
- `[WARN]` - Non-critical issues
- `[ERROR]` - Critical errors

**Remember to disable debug logging after troubleshooting:**

```env
VITE_DEBUG_LOGGING=false
```

### Getting Help

If issues persist:

1. **Check Documentation**:
   - Review `docs/CONTACTS_REDESIGN_COMPLETE_SUMMARY.md`
   - Read `docs/PULSE_CONTACT_INTEGRATION_README.md`

2. **Review Logs**:
   - Browser console (F12 → Console tab)
   - Network tab for API errors
   - Supabase logs in dashboard

3. **Contact Support**:
   - Email: support@yourcompany.com
   - Slack: #logos-vision-support
   - Include error messages, screenshots, and environment details

---

## Rollback Plan

If critical issues occur post-deployment, follow this rollback procedure:

### Immediate Rollback (< 5 minutes)

1. **Revert to previous deployment**:
   ```bash
   # For Vercel
   vercel rollback

   # For Netlify
   netlify rollback

   # For static hosting
   # Restore previous dist/ folder from backup
   ```

2. **Verify rollback**:
   - Load application in browser
   - Check that previous version is running
   - Confirm no errors in console

### Data Rollback (if needed)

If database changes need to be reverted:

1. **Run migration rollback** (if migrations were applied):
   ```bash
   # Example - adjust based on your migration tool
   npm run db:rollback
   ```

2. **Restore database backup**:
   - Access Supabase dashboard
   - Navigate to Database → Backups
   - Restore to point before deployment

### Communication Plan

1. **Notify stakeholders** of rollback via:
   - Email to key users
   - Status page update
   - Internal Slack notification

2. **Document issues** that caused rollback:
   - Error messages and logs
   - Steps to reproduce
   - Impact assessment

3. **Schedule post-mortem** to:
   - Identify root cause
   - Implement fixes
   - Plan redeployment strategy

---

## Monitoring & Support

### Key Metrics to Monitor

Monitor these metrics post-deployment:

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Page Load Time | < 2s | > 3s |
| Error Rate | < 1% | > 5% |
| Pulse API Uptime | > 99% | < 95% |
| User Session Duration | > 5 min | < 2 min |
| Bounce Rate | < 40% | > 60% |

### Monitoring Tools

Recommended monitoring setup:

1. **Performance Monitoring**:
   - Vercel Analytics (if using Vercel)
   - Google Analytics for user behavior
   - Lighthouse CI for performance metrics

2. **Error Tracking**:
   - Sentry for JavaScript errors
   - Supabase logs for database errors
   - Custom error boundaries in React

3. **API Monitoring**:
   - Pulse API health endpoint checks
   - Response time tracking
   - Rate limit monitoring

### Support Contacts

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| Critical Production Bug | support@yourcompany.com | 1 hour |
| Pulse API Issues | pulse-support@yourcompany.com | 4 hours |
| Feature Questions | product@yourcompany.com | 1 business day |
| Infrastructure | devops@yourcompany.com | 2 hours |

### Regular Maintenance

Schedule these maintenance tasks:

- **Daily**: Monitor error rates and performance metrics
- **Weekly**: Review Pulse API usage and rate limits
- **Monthly**: Update dependencies for security patches
- **Quarterly**: Performance audit and optimization review

---

## Additional Resources

- **Feature Documentation**: `docs/CONTACTS_REDESIGN_COMPLETE_SUMMARY.md`
- **Pulse Integration Guide**: `docs/PULSE_CONTACT_INTEGRATION_README.md`
- **Testing Guide**: `docs/CONTACTS_REDESIGN_TESTING_GUIDE.md`
- **Light Mode Implementation**: `docs/CONTACTS_LIGHT_MODE_IMPLEMENTATION.md`

---

## Deployment History

Track deployments in this section:

| Date | Version | Deployed By | Notes |
|------|---------|-------------|-------|
| 2026-01-26 | 1.0.0 | Initial | Contacts redesign with Pulse integration |

---

**Last Updated**: 2026-01-26
**Document Version**: 1.0.0
**Maintained By**: Logos Vision Development Team
