# Task Management Database Migrations

## Running the Migrations

Since we don't have direct database access via psql, please run these migrations **in order** through the Supabase Dashboard SQL Editor:

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy
2. Navigate to: **SQL Editor** (left sidebar)
3. Click: **New Query**

---

### Step 2: Run Migration 1 - Task Enhancements

**File:** `sql-scripts/migration_task_enhancements.sql`

**What it does:**
- Adds 6 new columns to the `tasks` table (title, time_estimate_hours, time_spent_hours, tags, assigned_to, created_by)
- Migrates existing data (copies description to title, team_member_id to assigned_to)
- Creates 5 performance indexes

**Steps:**
1. Copy the entire contents of `f:\logos-vision-crm\sql-scripts\migration_task_enhancements.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)
4. Wait for "Success" message

---

### Step 3: Run Migration 2 - Task Subtables

**File:** `sql-scripts/migration_task_subtables.sql`

**What it does:**
- Creates 5 new tables: task_subtasks, task_comments, task_attachments, task_activity, task_dependencies
- Creates 6 indexes for performance
- Creates 4 intelligent triggers (auto-update timestamps, circular dependency prevention, activity logging)

**Steps:**
1. Copy the entire contents of `f:\logos-vision-crm\sql-scripts\migration_task_subtables.sql`
2. Paste into the SQL Editor
3. Click **Run**
4. Wait for "Success" message

---

### Step 4: Run Migration 3 - Enhanced RLS Policies

**File:** `sql-scripts/migration_task_rls_enhanced.sql`

**What it does:**
- Drops permissive RLS policies
- Creates granular role-based security policies (18+ policies)
- Creates helper view: tasks_with_metrics

**Steps:**
1. Copy the entire contents of `f:\logos-vision-crm\sql-scripts\migration_task_rls_enhanced.sql`
2. Paste into the SQL Editor
3. Click **Run**
4. Wait for "Success" message

---

## Verification

After running all migrations, verify in Supabase Dashboard:

### Check Tables (Database → Tables)
- ✅ tasks (should have 6 new columns)
- ✅ task_subtasks (new table)
- ✅ task_comments (new table)
- ✅ task_attachments (new table)
- ✅ task_activity (new table)
- ✅ task_dependencies (new table)

### Check Indexes (Database → Indexes)
Should see 11 new indexes starting with `idx_task_`

### Check Triggers (Database → Triggers)
Should see 4 new triggers:
- update_task_subtasks_updated_at
- update_task_comments_updated_at
- prevent_circular_dependencies
- log_task_changes

### Check RLS Policies (Database → Tables → [table] → Policies)
Each table should have multiple policies (not just "allow all")

---

## Troubleshooting

### If Migration 1 Fails:
- Check if columns already exist: `SELECT * FROM information_schema.columns WHERE table_name = 'tasks';`
- The migration uses `IF NOT EXISTS` so it's safe to re-run

### If Migration 2 Fails:
- Check if tables already exist: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'task_%';`
- If tables exist, you can skip or drop them first

### If Migration 3 Fails:
- RLS policies might already exist - you can drop all policies first:
  ```sql
  DROP POLICY IF EXISTS "Users can read assigned or project tasks" ON tasks;
  -- etc...
  ```

---

## Alternative: Manual SQL Execution

If the Supabase Dashboard method doesn't work, you can also:

1. Install PostgreSQL client (psql)
2. Get the connection string from Supabase Settings → Database
3. Run: `psql "connection_string" -f sql-scripts/migration_task_enhancements.sql`

---

## What's Next?

Once migrations are complete, Claude will proceed with Phase 3:
- Connect TaskView.tsx to the new taskManagementService
- Replace mock data with real database queries
- Add loading states and error handling
- Implement real-time subscriptions
- Test all 5 view modes with real data
