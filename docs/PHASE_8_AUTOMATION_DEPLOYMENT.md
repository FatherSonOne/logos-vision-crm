# Phase 8: Automation Scheduling - Deployment Guide

**Version:** 1.0
**Last Updated:** January 17, 2026
**Status:** Ready for Deployment

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Deployment Steps](#deployment-steps)
5. [Supabase Edge Functions](#supabase-edge-functions)
6. [Database Setup](#database-setup)
7. [Scheduling Configuration](#scheduling-configuration)
8. [Testing](#testing)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Phase 8 implements automated task management workflows using Supabase Edge Functions and pg_cron scheduling. This system provides:

- **Daily Overdue Task Escalation**: Automatically identifies and escalates tasks that need attention
- **Weekly Deadline Adjustments**: Suggests deadline changes based on progress analysis
- **Weekly Workload Rebalancing**: Analyzes team capacity and suggests task reassignments
- **Weekly AI Task Digests**: Generates personalized weekly summaries for team members

### Key Benefits

- **Zero Client Load**: All automation runs server-side on Supabase infrastructure
- **Automatic Execution**: Scheduled tasks run without manual intervention
- **Reliable Logging**: All executions tracked in `automation_logs` table
- **Cost Effective**: Uses Supabase free tier edge functions and cron

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase pg_cron                          │
│  (Scheduled triggers at specified times)                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─> Daily at 9:00 AM UTC
                 │   └─> task-automation-daily
                 │
                 ├─> Monday at 8:00 AM UTC
                 │   └─> task-automation-weekly (deadlines)
                 │
                 ├─> Monday at 10:00 AM UTC
                 │   └─> task-automation-rebalance
                 │
                 └─> Sunday at 6:00 PM UTC
                     └─> task-automation-digest

┌─────────────────────────────────────────────────────────────┐
│                 Supabase Edge Functions                      │
│  (Deno-based serverless functions)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─> Fetch tasks from database
                 ├─> Analyze and process
                 ├─> Update task_activity
                 └─> Log to automation_logs
```

---

## Prerequisites

Before deployment, ensure you have:

1. **Supabase Project**
   - Active Supabase project
   - Service role key (for admin operations)
   - Project URL

2. **Supabase CLI** (for deployment)
   ```bash
   npm install -g supabase
   ```

3. **Database Tables**
   - `tasks` table (existing)
   - `users` table (existing)
   - `task_activity` table (existing)
   - `automation_logs` table (will be created)

4. **Environment Variables**
   - `GEMINI_API_KEY` (optional, for AI-enhanced features)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## Deployment Steps

### Step 1: Initialize Supabase Connection

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

### Step 2: Deploy Database Migrations

Apply the database migrations to create the `automation_logs` table:

```bash
# Apply automation_logs table migration
supabase db push

# Or manually run the migration in Supabase SQL Editor:
# - Open supabase/migrations/20260117_create_automation_logs.sql
# - Copy and execute in SQL Editor
```

**Manual SQL Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the migration from `supabase/migrations/20260117_create_automation_logs.sql`
3. Verify table creation: `SELECT * FROM automation_logs LIMIT 1;`

### Step 3: Deploy Edge Functions

Deploy each edge function to Supabase:

```bash
# Deploy daily escalation function
supabase functions deploy task-automation-daily

# Deploy weekly deadline adjustment function
supabase functions deploy task-automation-weekly

# Deploy workload rebalancing function
supabase functions deploy task-automation-rebalance

# Deploy weekly digest function
supabase functions deploy task-automation-digest
```

### Step 4: Set Environment Secrets

Set required secrets for edge functions:

```bash
# Set Supabase URL
supabase secrets set SUPABASE_URL=https://your-project.supabase.co

# Set service role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Set Gemini API key for AI features
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
```

**Get your service role key:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (secret key)

### Step 5: Setup Cron Jobs

**Option A: Using Supabase Dashboard**

1. Go to Database → Extensions
2. Enable `pg_cron` extension
3. Go to SQL Editor
4. Run the cron setup script from `supabase/migrations/20260117_setup_cron_jobs.sql`

**Option B: Using Migration**

```bash
# Apply cron jobs migration
supabase db push
```

**Note:** You'll need to update the settings in the SQL:
```sql
-- Replace with your actual values
current_setting('app.settings.supabase_url') -- Your project URL
current_setting('app.settings.supabase_anon_key') -- Your anon key
```

**Recommended: Manual Cron Setup**

Since `current_setting` might not work in all environments, use direct values:

```sql
-- Daily Escalation (9:00 AM UTC)
SELECT cron.schedule(
  'daily-task-escalation',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-daily',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Weekly Deadline Adjustment (Monday 8:00 AM UTC)
SELECT cron.schedule(
  'weekly-deadline-adjustment',
  '0 8 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-weekly',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Weekly Workload Rebalancing (Monday 10:00 AM UTC)
SELECT cron.schedule(
  'weekly-workload-rebalancing',
  '0 10 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-rebalance',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Weekly Digest (Sunday 6:00 PM UTC)
SELECT cron.schedule(
  'weekly-task-digest',
  '0 18 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

### Step 6: Verify Deployment

Check that everything is deployed correctly:

```bash
# List deployed functions
supabase functions list

# View function logs
supabase functions logs task-automation-daily

# Check cron jobs
# In Supabase SQL Editor, run:
# SELECT * FROM cron.job;
```

---

## Supabase Edge Functions

### Function Details

#### 1. task-automation-daily
- **Purpose**: Escalate overdue tasks
- **Schedule**: Daily at 9:00 AM UTC
- **Endpoint**: `/functions/v1/task-automation-daily`

**What it does:**
- Fetches all overdue tasks (past due date, not completed)
- Applies rule-based escalation criteria:
  - Critical tasks: >1 day overdue
  - High priority: >3 days overdue
  - Medium priority: >7 days overdue
  - Low progress: <20% with >2 days overdue
- Logs escalations to `task_activity`
- Records execution in `automation_logs`

#### 2. task-automation-weekly
- **Purpose**: Suggest deadline adjustments
- **Schedule**: Every Monday at 8:00 AM UTC
- **Endpoint**: `/functions/v1/task-automation-weekly`

**What it does:**
- Fetches in-progress tasks with upcoming deadlines (next 30 days)
- Analyzes progress rate vs. time remaining
- Suggests deadline extensions/reductions when needed
- Logs suggestions to `task_activity`

#### 3. task-automation-rebalance
- **Purpose**: Balance team workload
- **Schedule**: Every Monday at 10:00 AM UTC
- **Endpoint**: `/functions/v1/task-automation-rebalance`

**What it does:**
- Calculates workload for all users
- Identifies overloaded (>100% capacity) and underutilized (<50%) members
- Suggests task reassignments to balance workload
- Logs suggestions to `task_activity`

#### 4. task-automation-digest
- **Purpose**: Generate weekly summaries
- **Schedule**: Every Sunday at 6:00 PM UTC
- **Endpoint**: `/functions/v1/task-automation-digest`

**What it does:**
- Generates personalized weekly digest for each user
- Identifies focus tasks, tasks to watch, and completed highlights
- Provides actionable suggestions
- Stores digests in `task_activity`

---

## Database Setup

### automation_logs Table Schema

```sql
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_type VARCHAR(100) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  result JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Automation Types:**
- `daily_escalation`
- `weekly_deadline_adjustment`
- `weekly_workload_rebalancing`
- `weekly_digest`

---

## Scheduling Configuration

### Cron Schedule Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

### Current Schedule

| Automation | Cron Expression | Frequency | Time (UTC) |
|------------|----------------|-----------|------------|
| Daily Escalation | `0 9 * * *` | Daily | 9:00 AM |
| Deadline Adjustment | `0 8 * * 1` | Weekly | Monday 8:00 AM |
| Workload Rebalancing | `0 10 * * 1` | Weekly | Monday 10:00 AM |
| Weekly Digest | `0 18 * * 0` | Weekly | Sunday 6:00 PM |

### Modifying Schedule

To change the schedule, update the cron expression in the SQL:

```sql
-- Example: Change daily escalation to run at 10:00 AM instead
SELECT cron.unschedule('daily-task-escalation');
SELECT cron.schedule('daily-task-escalation', '0 10 * * *', $$...$$);
```

---

## Testing

### Manual Function Testing

Test each function manually before relying on automated execution:

```bash
# Test daily escalation
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-daily' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'

# Test weekly deadline adjustment
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-weekly' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'

# Test workload rebalancing
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-rebalance' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'

# Test weekly digest
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-digest' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### Expected Responses

**Success Response:**
```json
{
  "success": true,
  "escalated": 3,
  "notifications": [...],
  "tasksAnalyzed": 15
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Verify Automation Logs

Check that executions are being logged:

```sql
-- View recent automation runs
SELECT
  automation_type,
  executed_at,
  success,
  result
FROM automation_logs
ORDER BY executed_at DESC
LIMIT 10;

-- View execution statistics
SELECT
  automation_type,
  COUNT(*) as total_runs,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_runs,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_runs
FROM automation_logs
GROUP BY automation_type;
```

---

## Monitoring

### View Cron Job Execution History

```sql
-- Check cron job history
SELECT
  jobid,
  jobname,
  status,
  start_time,
  end_time,
  return_message
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 50;
```

### View Active Cron Jobs

```sql
-- List all scheduled cron jobs
SELECT
  jobid,
  jobname,
  schedule,
  active,
  database
FROM cron.job;
```

### Monitor Function Performance

```bash
# View real-time logs for a function
supabase functions logs task-automation-daily --tail

# View logs for all functions
supabase functions logs --tail
```

### Create Monitoring Dashboard

Add automation metrics to your admin dashboard:

```typescript
// Example component to display automation status
const AutomationMonitor = () => {
  const [stats, setStats] = useState({
    lastEscalationRun: null,
    recentExecutions: [],
    successRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('automation_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20);

      // Process and display stats
      setStats({
        lastEscalationRun: data.find(d => d.automation_type === 'daily_escalation')?.executed_at,
        recentExecutions: data,
        successRate: (data.filter(d => d.success).length / data.length) * 100,
      });
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="automation-monitor">
      <h3>Automation Status</h3>
      <p>Last Escalation: {stats.lastEscalationRun}</p>
      <p>Success Rate: {stats.successRate.toFixed(1)}%</p>
    </div>
  );
};
```

---

## Troubleshooting

### Common Issues

#### 1. Functions Not Executing

**Symptoms:**
- Cron jobs not triggering
- No entries in `automation_logs`

**Solutions:**
```sql
-- Check if cron jobs are active
SELECT * FROM cron.job WHERE active = true;

-- Check cron execution history for errors
SELECT * FROM cron.job_run_details WHERE status = 'failed' ORDER BY start_time DESC;

-- Ensure pg_cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

#### 2. Function Errors

**Symptoms:**
- Functions return 500 errors
- Logs show error messages

**Solutions:**
```bash
# View detailed error logs
supabase functions logs task-automation-daily --tail

# Check environment secrets are set
supabase secrets list

# Verify database connection
# Test by manually calling function via curl
```

#### 3. No Tasks Being Processed

**Symptoms:**
- Functions run successfully but no tasks are escalated/analyzed

**Solutions:**
```sql
-- Check if there are tasks to process
SELECT COUNT(*) FROM tasks WHERE status != 'completed';

-- Check task due dates
SELECT id, title, due_date, status FROM tasks WHERE due_date < CURRENT_DATE;

-- Verify task data integrity
SELECT * FROM tasks WHERE assigned_to_id IS NULL AND status != 'completed';
```

#### 4. Permission Errors

**Symptoms:**
- "permission denied" errors in logs
- Functions can't access tables

**Solutions:**
```sql
-- Grant necessary permissions to service role
GRANT SELECT, INSERT, UPDATE ON tasks TO service_role;
GRANT SELECT, INSERT ON task_activity TO service_role;
GRANT SELECT, INSERT ON automation_logs TO service_role;
GRANT SELECT ON users TO service_role;
```

#### 5. Timezone Issues

**Symptoms:**
- Automations running at unexpected times

**Solutions:**
- All times in pg_cron are UTC
- Adjust cron schedule to match your desired local time
- Example: For 9 AM PST (UTC-8), use `0 17 * * *` (5 PM UTC)

---

## Maintenance

### Updating Edge Functions

When you make changes to edge functions:

```bash
# 1. Make code changes
# 2. Redeploy function
supabase functions deploy task-automation-daily

# 3. Test manually
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-daily' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# 4. Monitor logs for issues
supabase functions logs task-automation-daily --tail
```

### Disabling Automation Temporarily

```sql
-- Disable specific cron job
SELECT cron.unschedule('daily-task-escalation');

-- Re-enable later
SELECT cron.schedule('daily-task-escalation', '0 9 * * *', $$...$$);
```

### Cleaning Up Old Logs

```sql
-- Delete automation logs older than 90 days
DELETE FROM automation_logs WHERE executed_at < NOW() - INTERVAL '90 days';

-- Delete cron execution history older than 30 days
DELETE FROM cron.job_run_details WHERE start_time < NOW() - INTERVAL '30 days';
```

---

## Next Steps

After successful deployment:

1. **Monitor for 1 week** - Watch automation logs and verify executions
2. **Gather feedback** - Ask team about digest usefulness and accuracy
3. **Adjust schedules** - Fine-tune timing based on team preferences
4. **Add AI integration** - Integrate Gemini API for smarter recommendations
5. **Enhance notifications** - Add email/Slack notifications for escalations
6. **Build dashboard** - Create admin UI for automation monitoring

---

## Support

For issues or questions:

1. Check Supabase function logs: `supabase functions logs <function-name>`
2. Review automation_logs table for execution history
3. Consult [docs/TASK_AUTOMATION_GUIDE.md](./TASK_AUTOMATION_GUIDE.md) for feature details
4. Check Supabase documentation: https://supabase.com/docs

---

**Document Version:** 1.0
**Last Updated:** January 17, 2026
**Maintained By:** Backend Automation Team
