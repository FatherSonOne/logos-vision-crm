# Phase 3: Database Setup Guide

**Status:** 🟡 Action Required - Manual Database Migration
**Time Required:** 10-15 minutes
**Difficulty:** Easy (Copy & Paste SQL)

---

## What Was Fixed

### ✅ CORS Issue Resolved
**Problem:** Browser requests from Logos Vision (port 5182) were blocked by CORS policy
**Solution:** Added `http://localhost:5182` to allowed origins in Pulse [server.js:48-55](F:\pulse1\server.js#L48-L55)
**Status:** ✅ Fixed - Pulse API server restarted with new CORS config

### ✅ Schema Column Names Fixed
**Problem:** API was using wrong column names (display_name, last_interaction_date, tags)
**Solution:** Updated all references to use correct Pulse Supabase schema
**Status:** ✅ Fixed - All column names corrected

### 📝 Database Tables Missing (Action Required)
**Problem:** `google_contacts_sync_jobs` table doesn't exist in Pulse Supabase
**Solution:** Run manual SQL migration (instructions below)
**Status:** ⏸️ Pending - Requires user action

---

## Quick Start - Run Database Migrations

You need to run 2 SQL migrations in your Pulse Supabase dashboard.

### Step 1: Access Supabase SQL Editor

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Log in to your account

2. **Select Your Pulse Project**
   - Look for project with URL: `ucaeuszgoihoyrvhewxk.supabase.co`
   - Click to open the project

3. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New query** button

---

### Step 2: Run Migration 001 - Create Sync Jobs Table

**File:** [F:\pulse1\migrations\001_google_contacts_sync_jobs.sql](F:\pulse1\migrations\001_google_contacts_sync_jobs.sql)

**What it does:**
- ✅ Creates `google_contacts_sync_jobs` table
- ✅ Adds indexes for performance
- ✅ Sets up RLS policies for security
- ✅ Creates auto-update trigger for timestamps
- ✅ Grants permissions to service role

**Instructions:**
1. Open the migration file in VS Code
2. Select all (`Ctrl+A`) and copy (`Ctrl+C`)
3. Paste into Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`

**Expected Result:**
```
Success. No rows returned
```

---

### Step 3: Run Migration 002 - Enable API Access

**File:** [F:\pulse1\migrations\002_relationship_profiles_api_access.sql](F:\pulse1\migrations\002_relationship_profiles_api_access.sql)

**What it does:**
- ✅ Allows API to create/update relationship profiles
- ✅ Bypasses RLS for service role operations
- ✅ Enables enrichment endpoint to work

**Instructions:**
1. Open the migration file in VS Code
2. Select all (`Ctrl+A`) and copy (`Ctrl+C`)
3. Paste into Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`

**Expected Result:**
```
Success. No rows returned
```

---

### Step 4: Verify Migrations

**Run this query in SQL Editor:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('google_contacts_sync_jobs', 'relationship_profiles')
ORDER BY table_name;
```

**Expected Result:**
```
table_name
---------------------------
google_contacts_sync_jobs
relationship_profiles
```

If you see both tables, migrations are successful! ✅

---

## Optional: Add Service Role Key (For Full API Functionality)

To enable the enrichment endpoint to create new profiles without user authentication:

### Step 1: Get Service Role Key

1. Go to Supabase Dashboard → **Settings** → **API**
2. Scroll to **Project API keys**
3. Copy the **`service_role`** key (NOT the anon key)

### Step 2: Add to Environment

**Add to [F:\pulse1\.env.local](F:\pulse1\.env.local):**
```env
# Supabase Service Role Key (bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Update Server (Optional)

If you want the enrichment endpoint to bypass RLS and create profiles:

**Modify [F:\pulse1\server.js](F:\pulse1\server.js) around line 783:**
```javascript
// Use service role key for Logos Vision API endpoints
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// In /api/logos-vision/contacts endpoint:
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

**Note:** This is optional. The sync endpoint will work without it. The enrichment endpoint will only work for existing profiles without the service role key.

---

## Test After Migration

Once you've run the migrations, test the endpoints:

### Test 1: Sync Endpoint
```bash
curl -X POST \
  -H "X-API-Key: logos_vision_pulse_shared_secret_2026" \
  -H "Content-Type: application/json" \
  -d '{"workspace_id":"test-user","filter":{"label":"Logos Vision"}}' \
  http://localhost:3003/api/logos-vision/sync
```

**Expected Response:**
```json
{
  "sync_id": "some-uuid",
  "status": "in_progress",
  "message": "Sync job created"
}
```

### Test 2: Sync Status
```bash
curl -H "X-API-Key: logos_vision_pulse_shared_secret_2026" \
  http://localhost:3003/api/logos-vision/sync/SYNC_ID_FROM_ABOVE/status
```

**Expected Response:**
```json
{
  "sync_id": "some-uuid",
  "status": "in_progress",
  "total_contacts": 0,
  "synced": 0,
  "failed": 0
}
```

### Test 3: Browser UI Test

1. Open http://localhost:5182/contacts
2. Click **🔄 Sync with Pulse** button
3. Check browser console - should see successful API calls
4. No more CORS errors!

---

## What's Next After Migration?

Once database migrations are complete, we can proceed with:

### Phase 3B: Google OAuth Implementation (2-3 hours)
1. ✅ Environment configured
2. ✅ API endpoints ready
3. ⏳ Implement OAuth consent flow
4. ⏳ Create callback handler
5. ⏳ Implement token storage/refresh
6. ⏳ Fetch Google Contacts via People API

### Phase 3C: Bidirectional Sync (2-3 hours)
1. ⏳ Logos Vision → Google Contacts sync
2. ⏳ Auto-labeling in Google Contacts
3. ⏳ Conflict resolution
4. ⏳ Change detection

### Phase 3D: Import Modal (1 hour)
1. ⏳ Contact preview UI
2. ⏳ Selection checkboxes
3. ⏳ Import progress indicator

---

## Troubleshooting

### Migration Error: "permission denied"
**Solution:** Make sure you're logged in to Supabase with the project owner account.

### Migration Error: "relation already exists"
**Solution:** The table already exists. You can skip this migration or drop the table first.

### Sync endpoint returns error after migration
**Solution:**
1. Verify both migrations ran successfully
2. Check that tables exist (run Step 4 verification query)
3. Restart Pulse API server

### Enrichment endpoint still fails
**Solution:**
1. Add service role key to .env.local (see Optional section above)
2. Or test with an existing contact email that's already in the relationship_profiles table

---

## Files Created/Modified

### Created Files
1. ✅ [F:\pulse1\migrations\001_google_contacts_sync_jobs.sql](F:\pulse1\migrations\001_google_contacts_sync_jobs.sql)
2. ✅ [F:\pulse1\migrations\002_relationship_profiles_api_access.sql](F:\pulse1\migrations\002_relationship_profiles_api_access.sql)
3. ✅ [F:\pulse1\migrations\run-migrations.js](F:\pulse1\migrations\run-migrations.js)
4. ✅ [F:\pulse1\migrations\README.md](F:\pulse1\migrations\README.md)
5. ✅ [f:\logos-vision-crm\PHASE_3_DATABASE_SETUP_GUIDE.md](f:\logos-vision-crm\PHASE_3_DATABASE_SETUP_GUIDE.md) (this file)

### Modified Files
1. ✅ [F:\pulse1\server.js](F:\pulse1\server.js) - Added CORS origin for port 5182

---

## Summary

**What's Working Now:**
- ✅ CORS errors resolved
- ✅ Pulse API server running with correct configuration
- ✅ Schema column names all fixed
- ✅ API authentication working
- ✅ GET /api/logos-vision/contacts endpoint working

**What Needs Database Migration:**
- ⏸️ POST /api/logos-vision/sync (needs google_contacts_sync_jobs table)
- ⏸️ GET /api/logos-vision/sync/:id/status (needs google_contacts_sync_jobs table)
- ⏸️ POST /api/logos-vision/contacts/:email/enrich (optional: needs service role key)

**Your Action Required:**
1. Run Migration 001 in Supabase SQL Editor (5 min)
2. Run Migration 002 in Supabase SQL Editor (5 min)
3. Test endpoints (5 min)
4. Report back when done! 🎉

---

**Questions?** Let me know if you encounter any issues with the migrations!

**Ready to proceed?** After migrations are done, we can continue with Google OAuth implementation or test the full integration flow.
