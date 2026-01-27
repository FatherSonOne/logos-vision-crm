# Emergency Rollback & Gradual Rollout Procedures

## Overview

This document provides comprehensive procedures for rolling back the Contacts redesign deployment and implementing gradual rollout strategies to minimize risk.

**Last Updated:** 2026-01-25
**Version:** 1.0.0
**Criticality:** HIGH - Review before deployment

---

## Table of Contents

1. [Gradual Rollout Strategy](#gradual-rollout-strategy)
2. [Feature Flag Configuration](#feature-flag-configuration)
3. [Emergency Rollback Procedures](#emergency-rollback-procedures)
4. [Database Rollback](#database-rollback)
5. [Rollback Decision Tree](#rollback-decision-tree)
6. [Post-Rollback Actions](#post-rollback-actions)

---

## Gradual Rollout Strategy

### Phase 1: Internal Testing (10% - Week 1)

**Objective:** Validate functionality with internal team before exposing to users

**Implementation:**

1. **Enable for Internal Users Only**

```typescript
// In src/utils/featureFlags.ts
export function shouldShowNewContacts(userId: string): boolean {
  // Feature flag from environment
  const featureEnabled = import.meta.env.VITE_FEATURE_CONTACTS_REDESIGN === 'true';

  if (!featureEnabled) {
    return false;
  }

  // Internal team user IDs (from Supabase auth)
  const internalUsers = [
    'user-id-1',
    'user-id-2',
    'user-id-3',
    // Add internal team members
  ];

  return internalUsers.includes(userId);
}
```

2. **Update App.tsx**

```typescript
import { shouldShowNewContacts } from './utils/featureFlags';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();

  // Route to new or old contacts page
  const showNewContacts = shouldShowNewContacts(user?.id || '');

  return (
    <Routes>
      <Route path="/contacts" element={
        showNewContacts ? <ContactsPageNew /> : <ContactsPageOld />
      } />
    </Routes>
  );
}
```

3. **Monitor During Week 1**

Track these metrics:
- Error rate (target: < 0.1%)
- Page load time (target: < 2s)
- User feedback (via internal Slack channel)
- Feature usage (contacts viewed, actions completed)

**Go/No-Go Decision:**
- ✅ **GO** if error rate < 0.1% and no critical bugs
- ❌ **NO-GO** if critical bugs or performance issues

---

### Phase 2: A/B Test (50% - Week 2)

**Objective:** Compare new vs old experience with real users

**Implementation:**

1. **Random Assignment Strategy**

```typescript
// In src/utils/featureFlags.ts
export function shouldShowNewContacts(userId: string): boolean {
  const featureEnabled = import.meta.env.VITE_FEATURE_CONTACTS_REDESIGN === 'true';

  if (!featureEnabled) {
    return false;
  }

  // Internal users always see new version
  const internalUsers = ['user-id-1', 'user-id-2'];
  if (internalUsers.includes(userId)) {
    return true;
  }

  // 50% rollout using consistent hashing
  const rolloutPercentage = parseInt(import.meta.env.VITE_ROLLOUT_PERCENTAGE || '0');

  // Use user ID for consistent assignment (user always sees same version)
  const hash = hashCode(userId);
  const bucket = Math.abs(hash) % 100;

  return bucket < rolloutPercentage;
}

// Simple hash function for consistent bucketing
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
```

2. **Environment Configuration**

```bash
# .env.production
VITE_FEATURE_CONTACTS_REDESIGN=true
VITE_ROLLOUT_PERCENTAGE=50
```

3. **Monitor A/B Test Metrics**

Compare groups using PostHog:

| Metric | Old Version (Control) | New Version (Treatment) | Target |
|--------|----------------------|------------------------|--------|
| Session duration | Baseline | +30% | ✅ |
| Contacts viewed | Baseline | +40% | ✅ |
| Actions completed | 0 | 5+ per user | ✅ |
| Page load time | Baseline | < 2s | ✅ |
| Error rate | Baseline | < baseline + 0.1% | ✅ |

**Go/No-Go Decision:**
- ✅ **GO** if new version shows significant improvement and no regressions
- ❌ **NO-GO** if metrics are worse or error rate increases

---

### Phase 3: Full Rollout (100% - Week 3)

**Objective:** Release to all users

**Implementation:**

1. **Update Environment Variable**

```bash
VITE_ROLLOUT_PERCENTAGE=100
```

2. **Monitor Closely for 48 Hours**

- Check error rates every 2 hours
- Monitor Slack/support channels for user feedback
- Track performance metrics
- Review Sentry for new errors

3. **Success Criteria**

- Error rate < 0.5%
- No critical bugs reported
- Page load time < 2s (p95)
- Positive user feedback
- No database issues

**Go/No-Go Decision:**
- ✅ **SUCCESS** - Remove old contacts page after 1 week
- ❌ **ROLLBACK** - Follow emergency procedures below

---

## Feature Flag Configuration

### Remote Feature Flag Control (Recommended)

Use PostHog Feature Flags for instant control without redeployment:

```typescript
// In src/utils/featureFlags.ts
import { analytics } from './analytics';

export function shouldShowNewContacts(userId: string): boolean {
  // Check remote feature flag (PostHog)
  const remoteFlag = analytics.isFeatureEnabled('contacts_redesign');

  if (remoteFlag !== undefined) {
    return remoteFlag;
  }

  // Fallback to environment variable
  return import.meta.env.VITE_FEATURE_CONTACTS_REDESIGN === 'true';
}
```

**Benefits:**
- Instant rollback without redeployment
- User-specific targeting
- Percentage-based rollouts
- A/B testing built-in

**Setup in PostHog:**
1. Go to Feature Flags → New Feature Flag
2. Name: `contacts_redesign`
3. Rollout: 10% / 50% / 100%
4. Target: All users / Specific users / Cohorts

---

## Emergency Rollback Procedures

### Scenario 1: Critical Bug (Immediate Rollback)

**Trigger Conditions:**
- App crashes for users
- Data loss or corruption
- Security vulnerability
- Error rate > 5%
- Database connection failures

**Rollback Steps (< 5 minutes):**

#### Option A: Feature Flag Disable (FASTEST)

```bash
# 1. Disable via environment variable (Vercel/Netlify dashboard)
VITE_FEATURE_CONTACTS_REDESIGN=false

# Or via PostHog dashboard
# Feature Flags → contacts_redesign → Set to 0%
```

**Time to Rollback:** 30 seconds - 2 minutes

#### Option B: Revert Deployment

**Vercel:**
```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

**Netlify:**
```bash
# Via dashboard: Deploys → Previous deploy → Publish

# Or via CLI
netlify rollback
```

**Docker:**
```bash
# Rollback to previous image
docker-compose down
docker-compose pull logos-vision-crm:previous
docker-compose up -d
```

**Time to Rollback:** 2-5 minutes

#### Option C: Git Revert

```bash
# Find deployment commit
git log --oneline

# Revert deployment commit
git revert <commit-hash>

# Push to trigger redeployment
git push origin main
```

**Time to Rollback:** 5-10 minutes (includes build time)

---

### Scenario 2: Performance Issues (Gradual Rollback)

**Trigger Conditions:**
- Page load time > 5s (p95)
- High CPU/memory usage
- Database query slowness
- User complaints about slowness

**Rollback Steps:**

1. **Reduce Rollout Percentage**

```bash
# Reduce to 10% while investigating
VITE_ROLLOUT_PERCENTAGE=10
```

2. **Identify Root Cause**

```bash
# Check Sentry performance monitoring
# Review slow queries in database logs
# Analyze bundle size and network requests
```

3. **Decision:**
- **Fix identified** → Apply hotfix and re-increase rollout
- **No quick fix** → Full rollback and schedule fix

---

### Scenario 3: Data Sync Issues (Pulse Integration)

**Trigger Conditions:**
- Sync failures > 50%
- Data inconsistencies
- Missing contact data
- Pulse API errors

**Rollback Steps:**

1. **Disable Automatic Sync**

```bash
VITE_PULSE_SYNC_ENABLED=false
```

2. **Keep UI Active**

Users can still view cached data while sync is investigated.

3. **Investigate Sync Issues**

```typescript
// Check sync logs
const syncStatus = pulseSyncService.getSyncStatus();
console.log('Last sync:', syncStatus.lastSyncAt);
console.log('Sync errors:', syncStatus.errors);

// Test Pulse API connection
const healthCheck = await pulseContactService.testConnection();
```

4. **Decision:**
- **API issue** → Contact Pulse team, use mock data temporarily
- **Mapping issue** → Fix entity mappings, re-enable sync
- **Data corruption** → Full rollback and database restore

---

## Database Rollback

### Scenario: Need to Rollback Database Migrations

**CRITICAL:** Only perform if data corruption detected

**Steps:**

1. **Stop Application**

```bash
# Vercel/Netlify: Disable via dashboard
# Docker:
docker-compose down
```

2. **Create Emergency Backup**

```bash
# Run backup script
cd deployment
./migrate.sh --backup

# Verify backup exists
ls -lh backups/
```

3. **Run Rollback Migrations**

```bash
# Rollback all Pulse migrations
./migrate.sh --rollback

# Or rollback specific migration
./migrate.sh --rollback 002
```

4. **Verify Rollback**

```sql
-- Check contacts table structure
\d contacts

-- Verify Pulse columns removed
SELECT column_name FROM information_schema.columns
WHERE table_name = 'contacts' AND column_name LIKE 'pulse_%';

-- Should return 0 rows
```

5. **Restart Application with Old Version**

```bash
# Revert to previous deployment
git checkout <previous-version-tag>
git push origin main --force

# Or use deployment platform rollback
vercel rollback
```

**Time to Rollback:** 10-20 minutes

---

## Rollback Decision Tree

```
┌─────────────────────────────────┐
│   Issue Detected                │
└───────────┬─────────────────────┘
            │
            ▼
    ┌───────────────┐
    │ Severity?     │
    └───────┬───────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
Critical         Non-Critical
(Data loss,      (UI bugs,
App crash,       Slow performance,
Security)        Minor issues)
    │                │
    ▼                ▼
Immediate        Investigate
Rollback         (1-2 hours)
(< 5 min)            │
    │            ┌───┴────┐
    │            │        │
    │            ▼        ▼
    │         Fix      Can't Fix
    │      Available   Quickly
    │            │        │
    │            ▼        ▼
    │        Hotfix   Rollback
    │      Deploy    (Gradual)
    │            │        │
    └────────────┴────────┘
                 │
                 ▼
         ┌──────────────┐
         │ Post-Rollback│
         │   Actions    │
         └──────────────┘
```

---

## Rollback Communication Template

### Internal Team Notification (Slack)

```
🚨 ROLLBACK INITIATED - Contacts Redesign

**Severity:** [Critical / High / Medium]
**Time:** 2026-01-25 14:30 UTC
**Affected Users:** [10% / 50% / 100%]

**Issue:**
[Brief description of the problem]

**Action Taken:**
✅ Feature flag disabled
✅ Rollback to previous version initiated
⏳ ETA: 5 minutes

**Status:** IN PROGRESS

**Incident Lead:** [Name]
**Next Update:** 15 minutes
```

### User-Facing Communication (Status Page)

```
Contacts Feature Temporarily Unavailable

We've temporarily disabled the new Contacts interface while we investigate a technical issue.

Your contact data is safe and accessible via the original interface.

We apologize for any inconvenience and expect to restore the feature within [timeframe].

Status: Investigating → Identified → Monitoring → Resolved
```

---

## Post-Rollback Actions

### Immediate (Within 1 Hour)

- [ ] Verify rollback successful (test manually)
- [ ] Check error rates returned to baseline
- [ ] Confirm user reports stopped
- [ ] Post status update to team and users
- [ ] Create post-mortem document

### Within 24 Hours

- [ ] Root cause analysis completed
- [ ] Fix developed and tested in staging
- [ ] Post-mortem meeting scheduled
- [ ] User communication about re-deployment plan

### Within 1 Week

- [ ] Fix deployed to production
- [ ] Gradual re-rollout initiated (10% → 50% → 100%)
- [ ] Monitor closely for repeat issues
- [ ] Update runbooks with lessons learned

---

## Rollback Testing

### Pre-Deployment Rollback Drill

Test rollback procedures before production deployment:

```bash
# 1. Deploy to staging
./deploy-vercel.sh --staging

# 2. Enable feature flag
# Set VITE_FEATURE_CONTACTS_REDESIGN=true

# 3. Verify new contacts page works
# Navigate to staging.logosvision.com/contacts

# 4. Test rollback
# Set VITE_FEATURE_CONTACTS_REDESIGN=false

# 5. Verify old contacts page restored
# Navigate to staging.logosvision.com/contacts

# 6. Test deployment rollback
vercel rollback <staging-deployment-url>

# 7. Measure rollback time
# Target: < 5 minutes from decision to rollback complete
```

---

## Emergency Contacts

**Incident Lead:** [Name] - [Phone] - [Slack: @handle]
**DevOps Lead:** [Name] - [Phone] - [Slack: @handle]
**CTO:** [Name] - [Phone] - [Slack: @handle]

**Escalation Path:**
1. Incident detected → Notify Incident Lead
2. Rollback initiated → Notify DevOps Lead
3. Rollback failed → Escalate to CTO

**Communication Channels:**
- **Slack:** #incidents
- **Status Page:** status.logosvision.com
- **On-Call:** PagerDuty rotation

---

## Rollback Metrics

Track these metrics for each rollback:

| Metric | Target | Notes |
|--------|--------|-------|
| Time to detect | < 5 min | From issue start to detection |
| Time to decision | < 2 min | From detection to rollback decision |
| Time to rollback | < 5 min | From decision to rollback complete |
| Affected users | < 10% | Percentage of users impacted |
| Data loss | 0 | No data should be lost |
| Repeat incidents | 0 | Same issue should not recur |

---

## Appendix: Rollback Checklists

### Feature Flag Rollback Checklist

- [ ] Navigate to deployment platform dashboard (Vercel/Netlify)
- [ ] Environment Variables → VITE_FEATURE_CONTACTS_REDESIGN
- [ ] Change value from `true` to `false`
- [ ] Save changes
- [ ] Wait 1-2 minutes for propagation
- [ ] Test: Visit /contacts page (should show old version)
- [ ] Verify error rate decreased in Sentry
- [ ] Post status update to team

**Time Estimate:** 2-3 minutes

---

### Full Deployment Rollback Checklist

- [ ] Access deployment platform (Vercel/Netlify/Docker)
- [ ] Identify previous stable deployment
- [ ] Initiate rollback command
- [ ] Monitor deployment progress
- [ ] Wait for deployment complete
- [ ] Test: Visit /contacts page
- [ ] Check health endpoint: /health
- [ ] Verify error rate in Sentry
- [ ] Test key user flows (search, filter, view contact)
- [ ] Post status update to team

**Time Estimate:** 5-10 minutes

---

### Database Rollback Checklist

- [ ] **STOP**: Verify backup exists before proceeding
- [ ] Stop application (prevent new writes)
- [ ] Create emergency database backup
- [ ] Run rollback migrations (in order: 003, 002, 001)
- [ ] Verify migrations successful
- [ ] Check table structure matches pre-migration state
- [ ] Restart application with old version
- [ ] Test data integrity
- [ ] Verify no data loss
- [ ] Post incident report

**Time Estimate:** 15-20 minutes

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-25
**Next Review:** Before production deployment
**Owner:** DevOps Team
