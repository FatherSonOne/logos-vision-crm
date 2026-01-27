# Deployment Documentation - Contacts Redesign

## Overview

This directory contains all deployment artifacts, scripts, and documentation for the Logos Vision CRM Contacts Redesign production deployment.

**Project:** Contacts Redesign with Pulse Integration
**Version:** 1.0.0
**Last Updated:** 2026-01-25

---

## Directory Contents

### Configuration Files

- **.env.production.example** - Production environment variable template
- **nginx.conf** - Nginx web server configuration with security headers
- **docker-compose.yml** - Docker Compose orchestration file
- **Dockerfile** - Multi-stage Docker image build definition
- **healthcheck.sh** - Container health check script

### Database Migration Scripts

- **migration-001-contacts-pulse-integration.sql** - Add Pulse fields to contacts table
- **migration-001-rollback.sql** - Rollback migration 001
- **migration-002-pulse-interactions.sql** - Create interactions tracking table
- **migration-003-entity-mappings.sql** - Create entity mappings table
- **migrate.sh** - Automated migration execution script

### Deployment Scripts

- **deploy-vercel.sh** - Automated Vercel deployment with pre-flight checks
- **deploy-netlify.sh** - (Create if using Netlify)
- **deploy-docker.sh** - (Create if using Docker)

### Documentation

- **README.md** - This file
- **PRODUCTION_DEPLOYMENT_CHECKLIST.md** - Comprehensive deployment checklist
- **MONITORING_SETUP_GUIDE.md** - Monitoring and analytics configuration guide
- **ROLLBACK_PROCEDURES.md** - Emergency rollback and gradual rollout procedures

---

## Quick Start

### Prerequisites

1. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.production.example ../.env.production

   # Edit with actual credentials
   nano ../.env.production
   ```

2. **Database Access**
   - Supabase project access
   - Database connection credentials
   - Backup storage location

3. **Deployment Platform Access**
   - Vercel/Netlify account
   - Docker registry credentials (if using Docker)
   - Domain configuration

### Deployment Steps

#### Step 1: Database Migration

```bash
# Navigate to deployment directory
cd deployment

# Test connection
./migrate.sh --dry-run

# Run migrations
./migrate.sh

# Verify success
# Check logs in deployment/logs/
```

#### Step 2: Deploy Application

**For Vercel:**
```bash
./deploy-vercel.sh --production
```

**For Docker:**
```bash
docker-compose up -d --build
```

#### Step 3: Verify Deployment

```bash
# Check health endpoint
curl https://app.logosvision.com/health

# Verify contacts page
curl https://app.logosvision.com/contacts
```

---

## Deployment Workflows

### Development → Staging → Production

```
┌─────────────┐
│ Development │ (feature branches)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Staging   │ (main branch, auto-deploy)
└──────┬──────┘
       │ Manual approval
       ▼
┌─────────────┐
│ Production  │ (release tag, manual deploy)
└─────────────┘
```

### Gradual Rollout Strategy

```
Week 1: Internal (10%)
   └─> Monitor: Error rate, feedback
        │
        ▼ Go/No-Go decision
Week 2: A/B Test (50%)
   └─> Monitor: Metrics comparison
        │
        ▼ Go/No-Go decision
Week 3: Full Rollout (100%)
   └─> Monitor: 48 hours intensive
        │
        ▼ Success!
```

---

## Database Migrations

### Migration Sequence

1. **Migration 001** - Contacts Pulse Integration
   - Adds Pulse relationship fields to contacts table
   - Creates indexes for performance
   - Estimated time: 5-10 minutes

2. **Migration 002** - Pulse Interactions
   - Creates interaction tracking table
   - Sets up triggers for aggregate stats
   - Estimated time: 3-5 minutes

3. **Migration 003** - Entity Mappings
   - Creates bidirectional sync mapping table
   - Estimated time: 2-3 minutes

### Running Migrations

```bash
# All migrations
./migrate.sh

# Specific migration
psql $DB_URL -f migration-001-contacts-pulse-integration.sql

# Rollback all
./migrate.sh --rollback

# Rollback specific
./migrate.sh --rollback 002
```

### Migration Safety

- ✅ Backup created automatically before execution
- ✅ Pre-flight validation checks
- ✅ Post-migration verification
- ✅ Rollback scripts tested
- ✅ Idempotent (safe to re-run)

---

## Environment Variables

### Required Variables

```bash
# Supabase (Database)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Pulse API (Contact Intelligence)
VITE_PULSE_API_URL=https://api.pulse.yourcompany.com
VITE_PULSE_API_KEY=your_pulse_api_key
VITE_PULSE_SYNC_ENABLED=true

# Feature Flags
VITE_FEATURE_CONTACTS_REDESIGN=true
VITE_ROLLOUT_PERCENTAGE=100

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io
VITE_POSTHOG_API_KEY=phc_your_posthog_key
```

See **.env.production.example** for complete list.

---

## Monitoring & Alerting

### Tools Setup

1. **Sentry** (Error Tracking)
   - Account: sentry.io
   - Project: Logos Vision CRM
   - Documentation: MONITORING_SETUP_GUIDE.md

2. **PostHog** (Analytics)
   - Account: posthog.com
   - Project: Logos Vision CRM
   - Documentation: MONITORING_SETUP_GUIDE.md

3. **Uptime Monitor** (Better Stack/UptimeRobot)
   - Endpoint: /health
   - Interval: 1-5 minutes
   - Alerts: Email, Slack, SMS

### Key Metrics to Monitor

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Error rate | < 0.5% | > 5% |
| Page load time | < 2s (p95) | > 5s |
| Uptime | > 99.9% | < 99% |
| Sync success | > 95% | < 80% |

---

## Rollback Procedures

### Quick Rollback (< 5 minutes)

**Option 1: Feature Flag**
```bash
# In Vercel/Netlify dashboard
VITE_FEATURE_CONTACTS_REDESIGN=false
```

**Option 2: Deployment Rollback**
```bash
vercel rollback <previous-deployment-url>
# or
netlify rollback
```

### Full Documentation

See **ROLLBACK_PROCEDURES.md** for:
- Detailed rollback steps
- Decision tree
- Communication templates
- Post-rollback actions

---

## Deployment Checklist

The **PRODUCTION_DEPLOYMENT_CHECKLIST.md** includes:

### Pre-Deployment
- [ ] Environment configuration
- [ ] Database preparation
- [ ] Build and testing
- [ ] Monitoring setup
- [ ] Documentation review

### Deployment Day
- [ ] Final checks
- [ ] Database migration
- [ ] Application deployment
- [ ] Verification testing
- [ ] Pulse integration test

### Post-Deployment
- [ ] 2-hour critical monitoring
- [ ] 24-hour extended monitoring
- [ ] Gradual rollout phases
- [ ] Success criteria evaluation

---

## Troubleshooting

### Common Issues

#### Issue: Migration fails

**Solution:**
```bash
# Check logs
cat deployment/logs/migration_*.log

# Verify database connection
psql $DB_URL -c "SELECT 1;"

# Rollback and retry
./migrate.sh --rollback
./migrate.sh
```

#### Issue: Build fails

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist
npm ci
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

#### Issue: Deployment health check fails

**Solution:**
```bash
# Check container logs
docker-compose logs app

# Test health endpoint
curl http://localhost/health

# Verify environment variables
docker-compose exec app env | grep VITE_
```

---

## Support & Escalation

### Deployment Team

**Deployment Lead:** [Name] - [Email] - [Slack: @handle]
**DevOps Engineer:** [Name] - [Email] - [Slack: @handle]
**Database Admin:** [Name] - [Email] - [Slack: @handle]

### Communication Channels

- **Slack:** #deployment, #incidents
- **Email:** devops@logosvision.com
- **On-Call:** PagerDuty rotation

### Escalation Path

1. **Minor issues** → Post in #deployment
2. **Blocking issues** → Notify Deployment Lead
3. **Critical issues** → Page on-call engineer
4. **Rollback needed** → Escalate to CTO

---

## Post-Deployment

### Immediate Actions

- [ ] Send success notification
- [ ] Update status page
- [ ] Archive deployment logs
- [ ] Document lessons learned

### Within 1 Week

- [ ] Post-mortem meeting
- [ ] Update documentation
- [ ] Refine procedures
- [ ] Plan next iteration

### Ongoing

- [ ] Monitor metrics weekly
- [ ] Review incidents monthly
- [ ] Update runbooks quarterly
- [ ] Security audits annually

---

## Additional Resources

### Internal Documentation

- Project handoff: `../CONTACTS_HANDOFF_DOCUMENT.md`
- Architecture: `../docs/PULSE_LV_CONTACTS_INTEGRATION_PLAN.md`
- UI specs: `../docs/CONTACTS_UI_IMPLEMENTATION_PLAN.md`

### External Resources

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Sentry Docs: https://docs.sentry.io
- PostHog Docs: https://posthog.com/docs

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-25 | DevOps Automator | Initial deployment documentation |

---

## License & Confidentiality

**Confidential** - For internal use only. Do not share outside organization.

**Maintained by:** DevOps Team
**Last Review:** 2026-01-25
**Next Review:** After production deployment
