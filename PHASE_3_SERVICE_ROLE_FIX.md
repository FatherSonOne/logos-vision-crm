# Quick Fix: Add Supabase Service Role Key

**Issue:** RLS error when clicking "Sync with Pulse"
**Cause:** Pulse API needs service role key to bypass RLS policies
**Time:** 2 minutes

---

## Fix Steps

### Step 1: Get Your Service Role Key (1 min)

1. Go to your Pulse Supabase Dashboard
2. Click **Settings** → **API**
3. Scroll to **Project API keys**
4. Find the **`service_role`** key (NOT the anon key!)
5. Click **Reveal** and copy the entire key

**IMPORTANT:** This is the `service_role` key, NOT the `anon` key!

---

### Step 2: Add to Pulse .env.local (30 seconds)

Open `F:\pulse1\.env.local` and add this line at the bottom:

```env
# Supabase Service Role Key (bypasses RLS for API operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace `your_service_role_key_here` with the key you copied.

**Example:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...very_long_key_here
```

---

### Step 3: I'll Restart the Server

Once you've added the key, let me know and I'll restart the Pulse API server with the new configuration.

---

## What This Fixes

- ✅ Removes RLS errors when creating sync jobs
- ✅ Allows OAuth token storage/retrieval
- ✅ Enables contact fetching and storage
- ✅ Makes all Logos Vision API endpoints work properly

---

## After This Fix

The sync button will work, but you'll need to **authorize Google Contacts first**:

1. The button should show "🔐 Authorize Google Contacts" (green)
2. Click it to authorize
3. After authorizing, it changes to "🔄 Sync with Pulse" (blue)
4. Then you can sync!

---

**Let me know when you've added the service role key to .env.local!**
