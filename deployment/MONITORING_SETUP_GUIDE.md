# Monitoring & Analytics Setup Guide

## Overview

This guide provides comprehensive instructions for setting up production monitoring, error tracking, and analytics for the Logos Vision CRM Contacts Redesign.

**Last Updated:** 2026-01-25
**Version:** 1.0.0

---

## Table of Contents

1. [Error Tracking (Sentry)](#error-tracking-sentry)
2. [Analytics (PostHog)](#analytics-posthog)
3. [Performance Monitoring](#performance-monitoring)
4. [Uptime Monitoring](#uptime-monitoring)
5. [Custom Dashboards](#custom-dashboards)
6. [Alerting Rules](#alerting-rules)

---

## Error Tracking (Sentry)

### 1. Create Sentry Account

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project:
   - Platform: **React**
   - Name: **Logos Vision CRM**
   - Alert frequency: **On every new issue**

### 2. Install Sentry SDK

```bash
npm install @sentry/react @sentry/tracing
```

### 3. Configure Sentry

Create `f:\logos-vision-crm\src\utils\sentry.ts`:

```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export function initSentry() {
  // Only initialize in production
  if (import.meta.env.MODE !== 'production') {
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',

    // Performance monitoring
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance sampling
    tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),

    // Session replay
    replaysSessionSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1'),
    replaysOnErrorSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_ERROR_SAMPLE_RATE || '1.0'),

    // Release tracking
    release: `logos-vision-crm@${import.meta.env.VITE_APP_VERSION || 'unknown'}`,

    // Filter out non-critical errors
    beforeSend(event, hint) {
      // Don't send errors from browser extensions
      if (event.exception?.values?.[0]?.value?.includes('extension://')) {
        return null;
      }

      // Don't send network errors (handled separately)
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }

      return event;
    },

    // User context
    beforeSendTransaction(event) {
      // Add custom context
      event.contexts = {
        ...event.contexts,
        app: {
          feature: 'contacts_redesign',
          version: import.meta.env.VITE_APP_VERSION,
        },
      };
      return event;
    },
  });
}

// Helper to capture custom events
export function captureEvent(eventName: string, data?: Record<string, any>) {
  Sentry.captureMessage(eventName, {
    level: 'info',
    extra: data,
  });
}

// Helper to set user context
export function setUserContext(userId: string, email?: string, name?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
}
```

### 4. Initialize in App

Update `f:\logos-vision-crm\src\main.tsx`:

```typescript
import { initSentry } from './utils/sentry';

// Initialize Sentry before React
initSentry();

// Wrap App with Sentry error boundary
import * as Sentry from "@sentry/react";

const SentryApp = Sentry.withProfiler(App);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryApp />
  </React.StrictMode>
);
```

### 5. Add Environment Variables

In `.env.production`:

```bash
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_ERROR_SAMPLE_RATE=1.0
VITE_APP_VERSION=1.0.0
```

### 6. Configure Alerts

In Sentry dashboard:

1. **Critical Errors** (Immediate notification)
   - New error in last 1 minute
   - Error count > 10 in 5 minutes
   - Error rate > 5% of total requests

2. **Performance Issues** (Daily digest)
   - P95 response time > 2 seconds
   - Slow database queries (> 500ms)
   - Large bundle sizes (> 1MB)

3. **User Impact** (Hourly notification)
   - Affected users > 10 in 1 hour
   - Error volume increase > 50%

---

## Analytics (PostHog)

### 1. Create PostHog Account

1. Sign up at [posthog.com](https://posthog.com)
2. Create new project: **Logos Vision CRM**

### 2. Install PostHog SDK

```bash
npm install posthog-js
```

### 3. Configure PostHog

Create `f:\logos-vision-crm\src\utils\analytics.ts`:

```typescript
import posthog from 'posthog-js';

export function initAnalytics() {
  // Only track in production
  if (import.meta.env.MODE !== 'production') {
    return;
  }

  if (!import.meta.env.VITE_ANALYTICS_ENABLED) {
    return;
  }

  posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',

    // Capture options
    autocapture: false, // Manual capture for better control
    capture_pageview: true,
    capture_pageleave: true,

    // Performance
    loaded: (posthog) => {
      if (import.meta.env.DEV) posthog.debug();
    },

    // Session recording
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-sensitive]',
    },
  });
}

// Event tracking
export const analytics = {
  // Page views
  pageView: (pageName: string) => {
    posthog.capture('$pageview', { page: pageName });
  },

  // Contact events
  contactViewed: (contactId: string, score: number) => {
    posthog.capture('contact_viewed', {
      contact_id: contactId,
      relationship_score: score,
    });
  },

  contactSearched: (query: string, resultsCount: number) => {
    posthog.capture('contact_searched', {
      query,
      results_count: resultsCount,
    });
  },

  contactFiltered: (filterType: string, value: string) => {
    posthog.capture('contact_filtered', {
      filter_type: filterType,
      filter_value: value,
    });
  },

  // Priorities feed
  actionCompleted: (actionId: string, priority: string) => {
    posthog.capture('action_completed', {
      action_id: actionId,
      priority,
    });
  },

  actionDismissed: (actionId: string, reason?: string) => {
    posthog.capture('action_dismissed', {
      action_id: actionId,
      reason,
    });
  },

  // Pulse sync
  pulseSyncTriggered: (syncType: 'bulk' | 'incremental') => {
    posthog.capture('pulse_sync_triggered', {
      sync_type: syncType,
    });
  },

  pulseSyncCompleted: (
    syncType: string,
    imported: number,
    updated: number,
    errors: number,
    duration: number
  ) => {
    posthog.capture('pulse_sync_completed', {
      sync_type: syncType,
      imported_count: imported,
      updated_count: updated,
      error_count: errors,
      duration_ms: duration,
    });
  },

  // Performance
  pagePerformance: (page: string, loadTime: number) => {
    posthog.capture('page_performance', {
      page,
      load_time_ms: loadTime,
    });
  },

  // User actions
  buttonClicked: (buttonName: string, context?: string) => {
    posthog.capture('button_clicked', {
      button_name: buttonName,
      context,
    });
  },

  // Errors (non-critical)
  userError: (errorType: string, message: string) => {
    posthog.capture('user_error', {
      error_type: errorType,
      error_message: message,
    });
  },

  // Identify user
  identify: (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits);
  },

  // Feature flags
  isFeatureEnabled: (featureName: string): boolean => {
    return posthog.isFeatureEnabled(featureName) ?? false;
  },
};
```

### 4. Track Key Events

Add tracking to components:

```typescript
// In ContactsPage.tsx
import { analytics } from '../../utils/analytics';

useEffect(() => {
  analytics.pageView('contacts');
}, []);

const handleContactClick = (contact: Contact) => {
  analytics.contactViewed(contact.id, contact.relationship_score);
  setSelectedContact(contact);
};

// In PrioritiesFeedView.tsx
const handleActionComplete = (action: RecommendedAction) => {
  analytics.actionCompleted(action.id, action.priority);
  // ... rest of logic
};
```

### 5. Environment Variables

```bash
VITE_ANALYTICS_ENABLED=true
VITE_POSTHOG_API_KEY=phc_your_posthog_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 6. Create Dashboards

In PostHog, create these dashboards:

#### **Contacts Overview Dashboard**
- Total contacts viewed (daily)
- Average relationship score
- Search queries (top 10)
- Filter usage breakdown
- Time spent on contacts page

#### **Priorities Feed Dashboard**
- Actions completed (daily/weekly)
- Action completion rate (%)
- Action dismissal reasons
- High-priority action completion time
- User engagement score

#### **Pulse Sync Dashboard**
- Sync success rate (%)
- Average sync duration
- Error rate by sync type
- Contacts imported/updated (daily)
- Last sync timestamp

---

## Performance Monitoring

### 1. Web Vitals Tracking

Create `f:\logos-vision-crm\src\utils\webVitals.ts`:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { analytics } from './analytics';

export function initWebVitals() {
  // Cumulative Layout Shift
  getCLS((metric) => {
    analytics.pagePerformance('cls', metric.value * 1000);
  });

  // First Input Delay
  getFID((metric) => {
    analytics.pagePerformance('fid', metric.value);
  });

  // First Contentful Paint
  getFCP((metric) => {
    analytics.pagePerformance('fcp', metric.value);
  });

  // Largest Contentful Paint
  getLCP((metric) => {
    analytics.pagePerformance('lcp', metric.value);
  });

  // Time to First Byte
  getTTFB((metric) => {
    analytics.pagePerformance('ttfb', metric.value);
  });
}
```

### 2. Custom Performance Tracking

```typescript
// Track component render time
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      analytics.pagePerformance(componentName, duration);
    };
  }, [componentName]);
}

// Track API call performance
export async function trackApiCall<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await apiCall();
    const duration = performance.now() - start;

    analytics.pagePerformance(`api_${apiName}`, duration);

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    analytics.userError('api_error', `${apiName} failed after ${duration}ms`);
    throw error;
  }
}
```

---

## Uptime Monitoring

### Option 1: UptimeRobot (Free)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Create HTTP(s) monitor:
   - URL: `https://app.logosvision.com/health`
   - Interval: 5 minutes
   - Alert contacts: Email, Slack

### Option 2: Better Stack (Recommended)

1. Sign up at [betterstack.com](https://betterstack.com)
2. Create uptime monitor:
   - URL: `https://app.logosvision.com`
   - Interval: 1 minute
   - Regions: US, EU, Asia
   - Expected status code: 200
   - Alert channels: Email, Slack, SMS

3. Create incident workflows:
   - **Critical:** App down > 2 minutes → SMS + Slack
   - **Warning:** Response time > 3s → Slack
   - **Info:** SSL expiring < 14 days → Email

---

## Custom Dashboards

### Grafana Dashboard (Advanced)

If using custom metrics endpoint:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'logos-vision-crm'
    static_configs:
      - targets: ['app.logosvision.com:9090']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

Create Grafana dashboard with panels:

1. **Application Health**
   - Uptime percentage
   - Error rate
   - Request rate
   - Response time (p50, p95, p99)

2. **Business Metrics**
   - Active users
   - Contacts viewed
   - Actions completed
   - Sync success rate

3. **Infrastructure**
   - CPU usage
   - Memory usage
   - Network I/O
   - Disk usage

---

## Alerting Rules

### Critical Alerts (Immediate Action Required)

| Condition | Threshold | Channels |
|-----------|-----------|----------|
| App down | > 2 minutes | SMS, Slack, Email |
| Error rate | > 5% of requests | SMS, Slack |
| Database down | > 1 minute | SMS, Slack |
| SSL expires | < 7 days | Email |

### Warning Alerts (Review Within 1 Hour)

| Condition | Threshold | Channels |
|-----------|-----------|----------|
| High response time | p95 > 2s | Slack |
| Error spike | +50% from baseline | Slack |
| Sync failures | > 3 in 1 hour | Slack, Email |
| Disk space | > 80% | Email |

### Info Alerts (Daily Digest)

| Condition | Threshold | Channels |
|-----------|-----------|----------|
| Low engagement | < 10 users/day | Email |
| Performance regression | +20% load time | Email |
| New error type | First occurrence | Email |

---

## Testing Monitoring Setup

### 1. Test Sentry

```typescript
// Add temporary test button
<button onClick={() => {
  throw new Error('Test Sentry error');
}}>
  Test Sentry
</button>
```

### 2. Test Analytics

```typescript
// Trigger test event
analytics.buttonClicked('test_button', 'monitoring_setup');
```

### 3. Test Uptime Monitor

```bash
# Temporarily stop app
docker-compose down

# Wait for alert (should arrive within 5 minutes)
# Restart app
docker-compose up -d
```

### 4. Test Performance Monitoring

```bash
# Run Lighthouse audit
npx lighthouse https://app.logosvision.com --view

# Check Web Vitals in browser console
# Should see metrics logged to PostHog
```

---

## Monitoring Checklist

- [ ] Sentry account created and DSN added to `.env.production`
- [ ] Sentry SDK installed and initialized
- [ ] Sentry alerts configured (critical, warning, info)
- [ ] PostHog account created and API key added
- [ ] PostHog SDK installed and initialized
- [ ] Key events tracked (contacts, actions, sync)
- [ ] Dashboards created (contacts, priorities, sync)
- [ ] Web Vitals tracking implemented
- [ ] Uptime monitoring configured (UptimeRobot/Better Stack)
- [ ] Alert channels set up (Slack, Email, SMS)
- [ ] Test alerts verified
- [ ] Performance baselines established
- [ ] Error rate baselines established
- [ ] Team notified of monitoring channels

---

## Maintenance

### Weekly Tasks
- Review error trends in Sentry
- Check performance metrics in PostHog
- Verify uptime percentage > 99.9%
- Review and resolve low-priority alerts

### Monthly Tasks
- Update alert thresholds based on trends
- Clean up resolved Sentry issues
- Archive old dashboard snapshots
- Review and optimize monitoring costs

### Quarterly Tasks
- Performance audit and optimization
- Update monitoring strategy
- Review SLO/SLA compliance
- Disaster recovery drill

---

## Support Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/react/
- **PostHog Docs:** https://posthog.com/docs
- **Web Vitals:** https://web.dev/vitals/
- **Better Stack:** https://betterstack.com/docs

---

**Last Updated:** 2026-01-25
**Version:** 1.0.0
**Maintained by:** DevOps Team
