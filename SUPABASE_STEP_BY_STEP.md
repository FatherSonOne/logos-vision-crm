# 🚀 Supabase Setup - Step by Step

Follow these steps in order. Should take ~15 minutes total.

---

## 📍 Step 1: Run the Schema (5 minutes)

### 1.1 Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy
2. Log in if needed
3. Click **SQL Editor** in the left sidebar
4. Click **New query** button

### 1.2 Copy the Schema

1. Open the file: `SUPABASE_QUICK_SETUP.sql`
2. Copy **ALL** the contents (Ctrl+A, Ctrl+C)

### 1.3 Paste and Run

1. Paste into the SQL Editor (Ctrl+V)
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for completion

### 1.4 Verify Success

You should see at the bottom:
```
✓ Success. No rows returned
```

And a table showing your database tables:
- activities
- cases
- case_comments
- chat_messages
- chat_room_members
- chat_rooms
- clients
- documents
- donations
- email_campaigns
- events
- portal_layouts
- project_team_assignments
- projects
- tasks
- team_members
- volunteers
- volunteer_assignments
- webpages

**✅ If you see this list, schema is ready!**

---

## 🔄 Step 2: Enable Realtime (2 minutes)

Realtime allows multiple users to see live updates instantly.

### 2.1 Open Replication Settings

1. Click **Database** in left sidebar
2. Click **Replication**
3. You'll see a list of all your tables

### 2.2 Enable for Key Tables

Toggle ON (enable) these tables:

Priority tables (do these first):
- [ ] **clients** - Click the toggle switch → Enable
- [ ] **projects** - Click toggle → Enable
- [ ] **tasks** - Click toggle → Enable
- [ ] **activities** - Click toggle → Enable
- [ ] **cases** - Click toggle → Enable
- [ ] **team_members** - Click toggle → Enable

Optional (if using these features):
- [ ] **chat_messages** - Click toggle → Enable
- [ ] **documents** - Click toggle → Enable
- [ ] **events** - Click toggle → Enable

### 2.3 Confirm

For each table, when you click the toggle:
- You'll see a modal: "Enable Replication?"
- Click **Enable**
- Toggle turns green ✅

**✅ Done! Realtime is enabled.**

---

## 👥 Step 3: Create User Accounts (3 minutes)

You need at least one user account to log in (can't use dev mode in production).

### 3.1 Open Authentication

1. Click **Authentication** in left sidebar
2. Click **Users**
3. You'll see an empty list (or existing test users)

### 3.2 Create Admin User

1. Click **Add User** button (top right)
2. Fill in the form:
   - **Email:** your-email@logosvision.com
   - **Password:** [Choose strong password - at least 8 characters]
   - **Auto Confirm User:** ✅ Check this box!
3. Click **Create User**

### 3.3 Create Additional Users (Optional)

Repeat for team members:

**Example User 2:**
- Email: consultant@logosvision.com
- Password: [secure password]
- Auto Confirm: ✅

**Example User 3:**
- Email: manager@logosvision.com
- Password: [secure password]
- Auto Confirm: ✅

### 3.4 Save Credentials

**IMPORTANT:** Write down these credentials somewhere secure!

You'll need them to log into the CRM after deployment.

**✅ Users created!**

---

## 🔐 Step 4: Verify RLS Policies (1 minute)

Row Level Security (RLS) controls who can access what data.

### 4.1 Check Policies

1. Click **Authentication** in left sidebar
2. Click **Policies**
3. You should see policies for each table

### 4.2 What to Look For

Each table should have **2 policies**:
- "Allow authenticated read access" (SELECT)
- "Allow authenticated write access" (ALL)

These policies mean: **Any logged-in user can access all data.**

### 4.3 Is This Secure?

For now, **YES** - you trust all your team members.

Later, you can tighten security:
- Users only see their assigned projects
- Admins see everything
- Clients only see their own data

But for initial deployment, current policies are fine.

**✅ Policies verified!**

---

## ✅ Step 5: Test the Connection (2 minutes)

Let's make sure your app can connect to Supabase.

### 5.1 Check Your Local Dev Server

```bash
cd "C:\Users\Aegis{FM}\OneDrive\Documents\logos-vision-crm"
npm run dev
```

### 5.2 Open Browser

Go to: http://localhost:5173

### 5.3 What You Should See

**In Dev Mode (VITE_DEV_MODE=true):**
- App loads without login
- You see the dashboard
- Clients load from Supabase
- Console shows: `✅ Loaded X clients from Supabase`

**This is normal for local dev!**

### 5.4 Check Console

Press F12 to open console. You should see:
- ✅ No red errors
- ✅ "Loaded clients from Supabase"
- ✅ Supabase connection working

**✅ Connection works!**

---

## 🏗️ Step 6: Test Production Build (2 minutes)

Before deploying, test that the build works.

### 6.1 Build the App

```bash
npm run build
```

**Expected output:**
```
vite v5.x.x building for production...
✓ XXX modules transformed
dist/index.html              X.XX kB
dist/assets/index-XXXXX.js   XXX kB
✓ built in X.XXs
```

### 6.2 Preview Production Build

```bash
npm run preview
```

This starts a local server with the production build.

### 6.3 Test Preview

1. Go to: http://localhost:4173
2. You should see the CRM (still in dev mode locally)
3. Check console for errors (F12)
4. Click around to test

### 6.4 Stop Preview

Press Ctrl+C in terminal to stop.

**✅ Build successful!**

---

## 🎯 Quick Checklist

Before deploying, verify:

**Supabase Setup:**
- [x] Schema SQL script run successfully
- [x] Tables visible in Table Editor
- [x] Realtime enabled for key tables
- [x] At least 1 user account created
- [x] User credentials saved securely
- [x] RLS policies exist

**Local Testing:**
- [x] Dev server runs without errors
- [x] Clients load from Supabase
- [x] Console shows no errors
- [x] Build completes successfully
- [x] Preview works

**Ready to Deploy?**
- [ ] All above checkboxes checked ✅
- [ ] Environment variables ready
- [ ] Chose deployment platform (Vercel/Netlify)

---

## 🚀 Next Steps

You're ready to deploy! Choose one:

### Option A: Deploy to Vercel (Recommended)
See: `PRODUCTION_DEPLOYMENT_CHECKLIST.md` → Section "Deploy to Vercel"

Quick commands:
```bash
npm install -g vercel
vercel login
vercel
```

### Option B: Deploy to Netlify
See: `PRODUCTION_DEPLOYMENT_CHECKLIST.md` → Section "Deploy to Netlify"

Quick commands:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 🆘 Troubleshooting

### "Permission denied" in SQL Editor
- Make sure you're logged in as the project owner
- Check you're in the right project

### "Table already exists" errors
- Some tables might already exist from earlier setup
- This is OK! The `IF NOT EXISTS` clause handles this
- Just verify tables exist in Table Editor

### No tables showing after running SQL
- Check for error messages at bottom of SQL Editor
- Look for red error text
- Most common: Missing semicolons or typos

### Can't create user accounts
- Make sure you're in correct project
- Try refreshing the page
- Check you have owner permissions

### Build fails
- Check error message carefully
- Usually TypeScript errors
- Run `npm run build` to see detailed errors
- Fix errors before deploying

---

## 📞 All Done?

Once you complete all steps:

1. ✅ Schema is set up
2. ✅ Realtime enabled
3. ✅ Users created
4. ✅ Build tested
5. ✅ Ready to deploy!

**Time to go to production!** 🎉

Refer to `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for deployment steps.

---

**Good luck with deployment!** 🚀
