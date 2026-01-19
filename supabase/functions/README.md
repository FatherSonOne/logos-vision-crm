# Supabase Edge Functions - Task Automation

This directory contains Supabase Edge Functions for automated task management workflows.

## Functions Overview

### 1. task-automation-daily
**Schedule:** Daily at 9:00 AM UTC
**Purpose:** Escalate overdue tasks that need management attention

- Fetches all overdue tasks (past due date, not completed)
- Applies rule-based escalation criteria based on priority and days overdue
- Creates escalation notifications in task_activity
- Logs execution to automation_logs

**Escalation Rules:**
- Critical tasks: >1 day overdue → Escalate
- High priority: >3 days overdue → Escalate
- Medium priority: >7 days overdue → Escalate
- Low progress: <20% with >2 days overdue → Escalate

### 2. task-automation-weekly
**Schedule:** Every Monday at 8:00 AM UTC
**Purpose:** Suggest deadline adjustments for in-progress tasks

- Analyzes in-progress tasks with upcoming deadlines (next 30 days)
- Calculates progress rate vs. time remaining
- Suggests deadline extensions when tasks are behind schedule
- Suggests deadline reductions when tasks are ahead of schedule
- Logs suggestions to task_activity

**Adjustment Criteria:**
- >20% behind expected progress → Suggest extension
- >20% ahead of schedule → Suggest earlier deadline
- <30% progress with <3 days remaining → High risk, suggest extension

### 3. task-automation-rebalance
**Schedule:** Every Monday at 10:00 AM UTC
**Purpose:** Balance team workload by suggesting task reassignments

- Calculates workload for all users (based on assigned tasks and estimated hours)
- Identifies overloaded members (>100% capacity)
- Identifies underutilized members (<50% capacity)
- Suggests task reassignments to balance workload
- Logs suggestions to task_activity

**Capacity Calculation:**
```
Capacity = (Total Estimated Hours / 40 hours per week) * 100%
Overloaded: >100%
Balanced: 50-100%
Underutilized: <50%
```

### 4. task-automation-digest
**Schedule:** Every Sunday at 6:00 PM UTC
**Purpose:** Generate personalized weekly summaries for team members

- Creates digest for each user with assigned tasks
- Identifies focus tasks (high priority, due soon)
- Flags at-risk tasks (overdue, low progress, tight deadline)
- Highlights completed tasks from the past week
- Provides actionable suggestions
- Stores digests in task_activity

**Digest Contents:**
- Focus tasks (top 5 priority/upcoming)
- Watch out for (at-risk tasks)
- Completed highlights (past week achievements)
- Week summary statistics
- Personalized suggestions

## Local Development

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Deno](https://deno.land/) installed (for local testing)

### Testing Functions Locally

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve task-automation-daily

# Test with curl
curl -X POST http://localhost:54321/functions/v1/task-automation-daily \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### Deployment

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy task-automation-daily
supabase functions deploy task-automation-weekly
supabase functions deploy task-automation-rebalance
supabase functions deploy task-automation-digest

# Or deploy all at once
supabase functions deploy
```

### Setting Secrets

```bash
# Set required environment variables
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set GEMINI_API_KEY=your-gemini-api-key  # Optional
```

## Environment Variables

Each function requires these environment variables:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `GEMINI_API_KEY` - (Optional) Google Gemini API key for AI features

## Monitoring

### View Function Logs

```bash
# Real-time logs for specific function
supabase functions logs task-automation-daily --tail

# View all function logs
supabase functions logs --tail

# View logs for specific time period
supabase functions logs task-automation-daily --since 1h
```

### Check Execution History

Query the `automation_logs` table in your database:

```sql
-- Recent executions
SELECT * FROM automation_logs
ORDER BY executed_at DESC
LIMIT 20;

-- Success rate by automation type
SELECT
  automation_type,
  COUNT(*) as total,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM automation_logs
GROUP BY automation_type;
```

## Troubleshooting

### Function Not Executing

1. Check cron jobs are scheduled:
   ```sql
   SELECT * FROM cron.job;
   ```

2. Check cron execution history:
   ```sql
   SELECT * FROM cron.job_run_details
   ORDER BY start_time DESC
   LIMIT 10;
   ```

3. Verify function is deployed:
   ```bash
   supabase functions list
   ```

### Function Errors

1. Check function logs:
   ```bash
   supabase functions logs task-automation-daily
   ```

2. Test function manually:
   ```bash
   curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/task-automation-daily' \
     -H 'Authorization: Bearer YOUR_ANON_KEY'
   ```

3. Verify environment secrets:
   ```bash
   supabase secrets list
   ```

### No Tasks Being Processed

1. Verify tasks exist in database:
   ```sql
   SELECT COUNT(*) FROM tasks WHERE status != 'completed';
   ```

2. Check task data matches criteria:
   ```sql
   -- Overdue tasks
   SELECT * FROM tasks
   WHERE due_date < CURRENT_DATE
   AND status IN ('todo', 'in_progress');
   ```

## Architecture

```
Edge Function
    │
    ├─> Initialize Supabase Client (with service role)
    │
    ├─> Fetch Relevant Tasks
    │   └─> Apply filters (status, due_date, etc.)
    │
    ├─> Process/Analyze Tasks
    │   ├─> Rule-based logic
    │   └─> Optional: AI enhancement with Gemini
    │
    ├─> Update Database
    │   ├─> task_activity (log actions)
    │   ├─> tasks (update metadata if needed)
    │   └─> automation_logs (execution record)
    │
    └─> Return Results
        └─> JSON response with statistics
```

## Security

- Functions use `SUPABASE_SERVICE_ROLE_KEY` for admin-level database access
- Row Level Security (RLS) is bypassed when using service role
- Functions are only accessible via:
  - Authenticated API calls with proper authorization
  - Scheduled pg_cron jobs (internal to Supabase)
- CORS headers configured for cross-origin requests

## Performance

- Each function is designed to complete in <10 seconds
- Functions process up to 1000 tasks per execution
- Database queries use indexes for optimal performance
- Edge functions run on Supabase global infrastructure
- Auto-scaling based on demand

## Cost Optimization

- Edge Functions: Free tier includes 500,000 invocations/month
- Each automation runs once per schedule (4-7 times per week)
- Estimated monthly cost: $0 (well within free tier)
- Database queries optimized to minimize row scans

## Future Enhancements

Planned improvements:

1. **AI Integration**
   - Enhanced escalation logic using Gemini API
   - Smarter workload balancing recommendations
   - Natural language digest summaries

2. **Notifications**
   - Email notifications for escalations
   - Slack integration for team updates
   - In-app notification system

3. **Analytics**
   - Automation effectiveness metrics
   - Team productivity insights
   - Trend analysis and predictions

4. **Customization**
   - Per-project automation rules
   - User-configurable schedules
   - Custom escalation criteria

## Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [Project Task Automation Guide](../docs/TASK_AUTOMATION_GUIDE.md)
- [Phase 8 Deployment Guide](../docs/PHASE_8_AUTOMATION_DEPLOYMENT.md)

---

**Last Updated:** January 17, 2026
**Maintained By:** Backend Automation Team
