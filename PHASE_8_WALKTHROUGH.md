# Phase 8 Deployment Walkthrough - Step by Step

**Your Project:** Logos Vision CRM
**Supabase URL:** https://psjgmdnrehcwvppbeqjy.supabase.co
**Project Ref:** psjgmdnrehcwvppbeqjy
**Status:** Ready to deploy
**Estimated Time:** 30-60 minutes

---

## ✅ Pre-Deployment Status

**What you have:**
- ✅ Supabase CLI installed
- ✅ Supabase project active (psjgmdnrehcwvppbeqjy)
- ✅ Anon key configured
- ✅ Gemini API key configured
- ✅ All edge function code ready
- ✅ All database migrations ready

**What you need to get:**
- ⬜ Supabase Service Role Key
- ⬜ Project linked to Supabase CLI

---

## Step 1: Get Your Supabase Service Role Key

### Option A: From Supabase Dashboard (Easiest)

1. **Go to:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/settings/api

2. **Find:** "Project API keys" section

3. **Copy:** The `service_role` key (it's a long JWT token starting with `eyJ...`)
   - ⚠️ This is the **secret** key, not the anon key
   - It should say "service_role" next to it
   - Keep this secure - it has admin access!

4. **Save it** - You'll need it in the next steps

---

## Step 2: Link Your Project to Supabase CLI

Since you're on Windows and Docker might have issues, we'll use the remote deployment approach:

```bash
# Login to Supabase (opens browser)
supabase login

# Link to your project
supabase link --project-ref psjgmdnrehcwvppbeqjy
```

**Expected output:**
```
Enter your project database password (or leave blank to skip):
```

**What to do:**
- You can skip the password for now (just press Enter)
- The link will complete and show: "Linked to project psjgmdnrehcwvppbeqjy"

---

## Step 3: Deploy Database Migrations

We need to create the `automation_logs` table. You have two options:

### Option A: Manual (Recommended for first time)

1. **Go to:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/sql/new

2. **Copy the SQL** from: `supabase/migrations/20260117_create_automation_logs.sql`

3. **Paste and Run** in the SQL Editor

4. **Verify:** Run this query to check the table was created:
   ```sql
   SELECT * FROM automation_logs LIMIT 1;
   ```

   You should see column headers (even if no rows yet)

### Option B: Using CLI (If link works)

```bash
cd f:/logos-vision-crm
supabase db push
```

---

## Step 4: Deploy Edge Functions

Now let's deploy all 4 edge functions:

```bash
# Make sure you're in the project directory
cd f:/logos-vision-crm

# Deploy all functions
supabase functions deploy task-automation-daily
supabase functions deploy task-automation-weekly
supabase functions deploy task-automation-rebalance
supabase functions deploy task-automation-digest
```

**Expected output for each:**
```
Deploying function task-automation-daily...
Function deployed successfully!
Function URL: https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-daily
```

**Save these URLs** - you'll need them for testing!

---

## Step 5: Set Environment Secrets

The edge functions need access to your Supabase database. Set these secrets:

```bash
# Set your Supabase URL
supabase secrets set SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co

# Set your service role key (paste the key you got in Step 1)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Optional: Set Gemini API key for AI features
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

**Verify secrets are set:**
```bash
supabase secrets list
```

**Expected output:**
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

---

## Step 6: Test Functions Manually

Before setting up automation, let's test each function works:

### Test 1: Daily Escalation

```bash
curl -X POST "https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-daily" \
  -H "Authorization: Bearer your_supabase_anon_key_here" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "success": true,
  "escalated": 0,
  "notifications": [],
  "tasksAnalyzed": 0,
  "message": "No overdue tasks found"
}
```

### Test 2: Weekly Deadline Adjustment

```bash
curl -X POST "https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-weekly" \
  -H "Authorization: Bearer your_supabase_anon_key_here" \
  -H "Content-Type: application/json"
```

### Test 3: Workload Rebalancing

```bash
curl -X POST "https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-rebalance" \
  -H "Authorization: Bearer your_supabase_anon_key_here" \
  -H "Content-Type: application/json"
```

### Test 4: Weekly Digest

```bash
curl -X POST "https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-digest" \
  -H "Authorization: Bearer your_supabase_anon_key_here" \
  -H "Content-Type: application/json"
```

**What success looks like:**
- All commands return JSON with `"success": true`
- No error messages
- Functions complete in < 10 seconds

---

## Step 7: Verify Database Logs

Check that the tests created log entries:

1. **Go to:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/editor

2. **Select:** `automation_logs` table

3. **You should see:** 4 rows (one for each test)
   - automation_type: 'daily_escalation', 'weekly_deadline_adjustment', etc.
   - success: true
   - executed_at: recent timestamp

**SQL to check:**
```sql
SELECT
  automation_type,
  executed_at,
  success,
  result
FROM automation_logs
ORDER BY executed_at DESC
LIMIT 10;
```

---

## Step 8: Setup Cron Jobs (Scheduling)

Now let's set up the automated scheduling:

1. **Go to:** https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/sql/new

2. **Enable pg_cron extension:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

3. **Schedule Daily Escalation (9 AM UTC):**
   ```sql
   SELECT cron.schedule(
     'daily-task-escalation',
     '0 9 * * *',
     $$
     SELECT net.http_post(
       url := 'https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-daily',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer your_supabase_anon_key_here"}'::jsonb,
       body := '{}'::jsonb
     );
     $$
   );
   ```

4. **Schedule Weekly Deadline Adjustment (Monday 8 AM UTC):**
   ```sql
   SELECT cron.schedule(
     'weekly-deadline-adjustment',
     '0 8 * * 1',
     $$
     SELECT net.http_post(
       url := 'https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-weekly',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer your_supabase_anon_key_here"}'::jsonb,
       body := '{}'::jsonb
     );
     $$
   );
   ```

5. **Schedule Weekly Workload Rebalancing (Monday 10 AM UTC):**
   ```sql
   SELECT cron.schedule(
     'weekly-workload-rebalancing',
     '0 10 * * 1',
     $$
     SELECT net.http_post(
       url := 'https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-rebalance',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer your_supabase_anon_key_here"}'::jsonb,
       body := '{}'::jsonb
     );
     $$
   );
   ```

6. **Schedule Weekly Digest (Sunday 6 PM UTC):**
   ```sql
   SELECT cron.schedule(
     'weekly-task-digest',
     '0 18 * * 0',
     $$
     SELECT net.http_post(
       url := 'https://psjgmdnrehcwvppbeqjy.supabase.co/functions/v1/task-automation-digest',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer your_supabase_anon_key_here"}'::jsonb,
       body := '{}'::jsonb
     );
     $$
   );
   ```

7. **Verify all cron jobs are scheduled:**
   ```sql
   SELECT jobid, jobname, schedule, active FROM cron.job;
   ```

**Expected output:**
You should see 4 jobs, all with `active = true`

---

## Step 9: Monitor Setup

Create a monitoring dashboard query:

```sql
-- Save this query for regular monitoring
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

---

## Step 10: Verify Scheduled Executions (Next 24-48 Hours)

After setup, wait for the scheduled times and verify:

### Check Tomorrow (Daily Escalation)
**Time:** 9:00 AM UTC (tomorrow)

**SQL to verify:**
```sql
SELECT * FROM automation_logs
WHERE automation_type = 'daily_escalation'
AND executed_at > NOW() - INTERVAL '1 day'
ORDER BY executed_at DESC;
```

### Check Next Monday (Weekly Functions)
**Times:** 8:00 AM and 10:00 AM UTC (next Monday)

**SQL to verify:**
```sql
SELECT * FROM automation_logs
WHERE automation_type IN ('weekly_deadline_adjustment', 'weekly_workload_rebalancing')
AND executed_at > NOW() - INTERVAL '7 days'
ORDER BY executed_at DESC;
```

### Check Next Sunday (Weekly Digest)
**Time:** 6:00 PM UTC (next Sunday)

**SQL to verify:**
```sql
SELECT * FROM automation_logs
WHERE automation_type = 'weekly_digest'
AND executed_at > NOW() - INTERVAL '7 days'
ORDER BY executed_at DESC;
```

---

## Troubleshooting

### Functions returning 500 errors?

**Check function logs:**
```bash
supabase functions logs task-automation-daily
```

**Common issues:**
1. Service role key not set → Go back to Step 5
2. automation_logs table doesn't exist → Go back to Step 3
3. Permission errors → Check RLS policies in database

### Cron jobs not executing?

**Check cron execution history:**
```sql
SELECT * FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '24 hours'
ORDER BY start_time DESC;
```

**Look for:**
- `status = 'failed'` → Check the error message
- No rows → Jobs haven't run yet (check schedule)

### No tasks being processed?

**Verify you have tasks:**
```sql
-- Check for overdue tasks
SELECT COUNT(*) FROM tasks
WHERE due_date < CURRENT_DATE
AND status IN ('todo', 'in_progress');

-- Check for in-progress tasks
SELECT COUNT(*) FROM tasks
WHERE status = 'in_progress';

-- Check for users with tasks
SELECT assigned_to_id, COUNT(*)
FROM tasks
WHERE assigned_to_id IS NOT NULL
GROUP BY assigned_to_id;
```

---

## Success Checklist

✅ **After completing all steps, you should have:**

- [ ] automation_logs table exists
- [ ] 4 edge functions deployed and accessible
- [ ] Environment secrets configured
- [ ] 4 cron jobs scheduled and active
- [ ] Manual test of each function succeeded
- [ ] automation_logs has test entries
- [ ] Cron jobs execute at scheduled times (verify tomorrow)

---

## Quick Command Reference

```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref psjgmdnrehcwvppbeqjy

# Deploy all functions
supabase functions deploy task-automation-daily
supabase functions deploy task-automation-weekly
supabase functions deploy task-automation-rebalance
supabase functions deploy task-automation-digest

# Set secrets
supabase secrets set SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key-here
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# View logs
supabase functions logs task-automation-daily
supabase functions logs --tail  # All functions, real-time
```

---

## What's Next?

Once deployed and verified:

1. **Monitor for 1 week** - Check automation_logs daily
2. **Gather feedback** - Ask team about digest usefulness
3. **Adjust schedules** - Change timing if needed
4. **Add notifications** - Email/Slack integration (Phase 9)
5. **Build dashboard** - Admin UI for monitoring (Phase 9)

---

**Need Help?**
- Check logs: `supabase functions logs <function-name>`
- Review docs: [docs/PHASE_8_AUTOMATION_DEPLOYMENT.md](docs/PHASE_8_AUTOMATION_DEPLOYMENT.md)
- Verify setup: Run SQL queries above

**Deployment complete when all boxes checked! 🎉**
