# Phase 8: Automation Scheduling - Deployment Checklist

**Quick Reference Guide for Deploying Task Automation**

## Pre-Deployment Checklist

- [ ] Supabase project is active and accessible
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Service role key obtained from Supabase dashboard
- [ ] Existing tables verified: `tasks`, `users`, `task_activity`
- [ ] (Optional) Gemini API key obtained for AI features

## Step 1: Database Setup

- [ ] Run migration to create `automation_logs` table
  ```bash
  # Option A: Using Supabase CLI
  supabase db push

  # Option B: Manual SQL execution
  # Copy supabase/migrations/20260117_create_automation_logs.sql
  # Run in Supabase SQL Editor
  ```

- [ ] Verify table creation
  ```sql
  SELECT * FROM automation_logs LIMIT 1;
  ```

- [ ] Check table permissions
  ```sql
  -- Should return rows showing grants
  SELECT grantee, privilege_type
  FROM information_schema.role_table_grants
  WHERE table_name = 'automation_logs';
  ```

## Step 2: Deploy Edge Functions

- [ ] Login to Supabase CLI
  ```bash
  supabase login
  ```

- [ ] Link to your project
  ```bash
  supabase link --project-ref YOUR_PROJECT_REF
  ```

- [ ] Deploy daily escalation function
  ```bash
  supabase functions deploy task-automation-daily
  ```

- [ ] Deploy weekly deadline function
  ```bash
  supabase functions deploy task-automation-weekly
  ```

- [ ] Deploy workload rebalancing function
  ```bash
  supabase functions deploy task-automation-rebalance
  ```

- [ ] Deploy weekly digest function
  ```bash
  supabase functions deploy task-automation-digest
  ```

- [ ] Verify all functions deployed
  ```bash
  supabase functions list
  # Should show all 4 functions
  ```

## Step 3: Configure Environment Secrets

- [ ] Set Supabase URL
  ```bash
  supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  ```

- [ ] Set service role key
  ```bash
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
  ```

- [ ] (Optional) Set Gemini API key
  ```bash
  supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
  ```

- [ ] Verify secrets are set
  ```bash
  supabase secrets list
  # Should show: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, (GEMINI_API_KEY)
  ```

## Step 4: Setup Cron Jobs

- [ ] Enable pg_cron extension
  ```sql
  -- In Supabase SQL Editor
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  ```

- [ ] Verify extension is enabled
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'pg_cron';
  ```

- [ ] Schedule daily escalation job
  ```sql
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
  ```

- [ ] Schedule weekly deadline adjustment job
  ```sql
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
  ```

- [ ] Schedule weekly workload rebalancing job
  ```sql
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
  ```

- [ ] Schedule weekly digest job
  ```sql
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

- [ ] Verify all cron jobs are scheduled
  ```sql
  SELECT jobid, jobname, schedule, active FROM cron.job;
  # Should show 4 jobs, all active = true
  ```

## Step 5: Testing

### Test Each Function Manually

- [ ] Test daily escalation
  ```bash
  curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-daily' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'Content-Type: application/json'
  ```
  Expected: `{"success": true, ...}`

- [ ] Test weekly deadline adjustment
  ```bash
  curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-weekly' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'Content-Type: application/json'
  ```
  Expected: `{"success": true, ...}`

- [ ] Test workload rebalancing
  ```bash
  curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-rebalance' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'Content-Type: application/json'
  ```
  Expected: `{"success": true, ...}`

- [ ] Test weekly digest
  ```bash
  curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-digest' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'Content-Type: application/json'
  ```
  Expected: `{"success": true, ...}`

### Verify Database Updates

- [ ] Check automation_logs has entries
  ```sql
  SELECT * FROM automation_logs ORDER BY executed_at DESC LIMIT 10;
  ```

- [ ] Check task_activity has automation entries
  ```sql
  SELECT * FROM task_activity
  WHERE metadata->>'automated' = 'true'
  ORDER BY created_at DESC
  LIMIT 10;
  ```

- [ ] View function logs
  ```bash
  supabase functions logs task-automation-daily
  ```

## Step 6: Monitoring Setup

- [ ] Create monitoring query for automation health
  ```sql
  -- Save this as a view or bookmark
  SELECT
    automation_type,
    COUNT(*) as total_runs,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed,
    MAX(executed_at) as last_run,
    ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
  FROM automation_logs
  WHERE executed_at > NOW() - INTERVAL '7 days'
  GROUP BY automation_type;
  ```

- [ ] Set up cron execution monitoring
  ```sql
  -- Check recent cron executions
  SELECT
    jobname,
    status,
    start_time,
    end_time,
    return_message
  FROM cron.job_run_details
  WHERE start_time > NOW() - INTERVAL '7 days'
  ORDER BY start_time DESC;
  ```

- [ ] (Optional) Create admin dashboard component
  - Add automation status widget to admin panel
  - Display last execution times
  - Show success rates

## Step 7: Validation (Wait 24-48 Hours)

After deployment, wait for scheduled executions and verify:

- [ ] Daily escalation ran at scheduled time (9 AM UTC)
  ```sql
  SELECT * FROM automation_logs
  WHERE automation_type = 'daily_escalation'
  ORDER BY executed_at DESC LIMIT 1;
  ```

- [ ] Weekly functions ran on Monday (if applicable)
  ```sql
  SELECT * FROM automation_logs
  WHERE automation_type IN ('weekly_deadline_adjustment', 'weekly_workload_rebalancing')
  ORDER BY executed_at DESC;
  ```

- [ ] Weekly digest ran on Sunday (if applicable)
  ```sql
  SELECT * FROM automation_logs
  WHERE automation_type = 'weekly_digest'
  ORDER BY executed_at DESC LIMIT 1;
  ```

- [ ] All executions marked as successful
  ```sql
  SELECT automation_type, success, error_message
  FROM automation_logs
  WHERE success = false
  ORDER BY executed_at DESC;
  ```

- [ ] Task activity logs created for automated actions
  ```sql
  SELECT COUNT(*) FROM task_activity
  WHERE metadata->>'automated' = 'true'
  AND created_at > NOW() - INTERVAL '7 days';
  ```

## Troubleshooting

### If functions don't execute:

1. [ ] Check cron jobs are active
   ```sql
   SELECT * FROM cron.job WHERE active = false;
   ```

2. [ ] Review cron execution errors
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE status = 'failed'
   ORDER BY start_time DESC;
   ```

3. [ ] Verify function URLs in cron jobs are correct
   ```sql
   SELECT jobname, command FROM cron.job;
   ```

### If functions return errors:

1. [ ] Check function logs
   ```bash
   supabase functions logs task-automation-daily
   ```

2. [ ] Verify environment secrets
   ```bash
   supabase secrets list
   ```

3. [ ] Test database connection from function
   - Run manual test with curl
   - Check if service role key has permissions

### If no tasks are processed:

1. [ ] Verify tasks exist with correct status
   ```sql
   SELECT COUNT(*) FROM tasks WHERE status != 'completed';
   ```

2. [ ] Check task due dates
   ```sql
   SELECT * FROM tasks WHERE due_date < CURRENT_DATE LIMIT 10;
   ```

3. [ ] Ensure users have assigned tasks
   ```sql
   SELECT assigned_to_id, COUNT(*) FROM tasks
   WHERE assigned_to_id IS NOT NULL
   GROUP BY assigned_to_id;
   ```

## Post-Deployment

- [ ] Document actual cron schedule in team wiki
- [ ] Share automation capabilities with team
- [ ] Set up weekly review of automation_logs
- [ ] Gather feedback on digest usefulness
- [ ] Plan Phase 9 enhancements based on usage

## Quick Reference

### Get Your Keys

**Project URL:**
```
Supabase Dashboard → Settings → API → Project URL
```

**Service Role Key:**
```
Supabase Dashboard → Settings → API → service_role (secret)
```

**Anon Key:**
```
Supabase Dashboard → Settings → API → anon (public)
```

**Project Ref:**
```
Supabase Dashboard → Settings → General → Reference ID
```

### Useful Commands

```bash
# Deploy all functions
supabase functions deploy

# View all function logs
supabase functions logs --tail

# List all secrets
supabase secrets list

# Unschedule all cron jobs (for maintenance)
SELECT cron.unschedule('daily-task-escalation');
SELECT cron.unschedule('weekly-deadline-adjustment');
SELECT cron.unschedule('weekly-workload-rebalancing');
SELECT cron.unschedule('weekly-task-digest');
```

---

## Success Criteria

Deployment is successful when:

✅ All 4 edge functions deployed and accessible
✅ All 4 cron jobs scheduled and active
✅ Manual test of each function returns success
✅ automation_logs table receiving entries
✅ task_activity table receiving automated entries
✅ Functions execute at scheduled times (verify after 24-48 hours)
✅ No errors in function logs or cron execution history

---

**Document Version:** 1.0
**Last Updated:** January 17, 2026
**Completion Time:** ~30-60 minutes
