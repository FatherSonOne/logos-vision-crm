# 🚀 Production Deployment Checklist

## Current Status
- ✅ Supabase project created: `psjgmdnrehcwvppbeqjy.supabase.co`
- ✅ Environment variables configured locally
- ✅ Vercel config file ready
- ✅ Netlify config file ready
- ⚠️ Currently in **DEV MODE** (`VITE_DEV_MODE=true`)

---

## 📋 Pre-Deployment Checklist

### ✅ Step 1: Fix Supabase Schema (COMPLETED)
- [x] Fixed UUID vs TEXT type mismatch
- [x] Created `CORRECTED_SUPABASE_SCHEMA.sql`
- [ ] **TODO:** Run corrected schema in Supabase SQL Editor

---

### 🔄 Step 2: Enable Realtime in Supabase

**Why?** Live updates for collaborative features

**How to do it:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy)
2. Click **Database** → **Replication** in left sidebar
3. Enable replication for these tables:
   - [ ] `clients`
   - [ ] `projects`
   - [ ] `tasks`
   - [ ] `activities`
   - [ ] `cases`
   - [ ] `team_members`
   - [ ] `chat_messages` (if using chat)

**How to enable:**
- Toggle the switch next to each table name
- Click **Enable** when prompted

**Time:** ~2 minutes

---

### 👥 Step 3: Create User Accounts

**Why?** Can't use dev mode in production!

**How to do it:**

1. Go to [Authentication](https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/auth/users)
2. Click **Add User** button
3. For each team member:
   - Enter **Email address**
   - Enter **Password** (min 6 characters)
   - Click **Create User**
   - ✅ User will be auto-confirmed

**Example users to create:**
```
Email: admin@logosvision.com
Password: [secure password]
Role: Admin

Email: consultant@logosvision.com
Password: [secure password]
Role: Consultant

Email: manager@logosvision.com
Password: [secure password]
Role: Manager
```

**User Checklist:**
- [ ] Admin user created
- [ ] Additional team members created
- [ ] Passwords saved securely (use password manager!)
- [ ] Test login with one user

**Time:** ~5 minutes

---

### 🔐 Step 4: Review Row Level Security (RLS)

**Current Status:** RLS is enabled but allows all authenticated users

**What to check:**

1. Go to **Authentication** → **Policies**
2. Verify these policies exist:
   - [ ] `clients` - Allow authenticated read/write
   - [ ] `projects` - Allow authenticated read/write
   - [ ] `tasks` - Allow authenticated read/write
   - [ ] `activities` - Allow authenticated read/write
   - [ ] `cases` - Allow authenticated read/write

**Optional:** Tighten security later (e.g., users can only see their assigned projects)

**For now:** Basic "authenticated users can access all" is fine

**Time:** ~2 minutes

---

### 🌍 Step 5: Update Environment Variables

#### A. For Local Development (Keep Dev Mode ON)

Your `.env.local` is already correct for local dev:
```env
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DEV_MODE=true  # ← Keep TRUE for local development
```

✅ **No changes needed for local!**

#### B. For Production Deployment

**IMPORTANT:** Production must have `VITE_DEV_MODE=false`

You'll set these in Vercel/Netlify dashboard (not in `.env.local`):

```env
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzamdtZG5yZWhjd3ZwcGJlcWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzU4OTksImV4cCI6MjA3OTE1MTg5OX0.IiB4YY9sB0fvEb6Vpm2O_t2YBQ9ORSy-yXtMsnOxZ4Q
VITE_DEV_MODE=false  # ← MUST be FALSE in production!
VITE_API_KEY=AIzaSyAxjKjbzJTzOEg2dQ_S7z6NciiPUqFrX7o
VITE_GOOGLE_MAPS_KEY=AIzaSyD3CAVYUQfY2cQ0tqF00ABSRJZUxVcCMF0
```

**Checklist:**
- [ ] Verified local `.env.local` has `VITE_DEV_MODE=true`
- [ ] Ready to set production vars with `VITE_DEV_MODE=false`

**Time:** ~1 minute

---

### 🏗️ Step 6: Test Build Locally

Before deploying, make sure the build works:

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

**What to check:**
- [ ] Build completes without errors
- [ ] Preview runs at http://localhost:4173
- [ ] Can see the login page
- [ ] No console errors in browser

**If build fails:**
- Check for TypeScript errors
- Check for missing imports
- Fix issues before deploying

**Time:** ~5 minutes

---

## 🚀 Deployment Options

### Option A: Deploy to Vercel (Recommended)

**Why Vercel?**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Instant rollbacks
- ✅ Great performance
- ✅ Free tier is generous

**Steps:**

#### 1. Install Vercel CLI (if not already)
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy
```bash
cd "C:\Users\Aegis{FM}\OneDrive\Documents\logos-vision-crm"
vercel
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time)
- Project name? **logos-vision-crm**
- Directory? **./** (just press Enter)
- Override settings? **N**

#### 4. Add Environment Variables in Vercel Dashboard

After first deploy:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project **logos-vision-crm**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
Name: VITE_SUPABASE_URL
Value: https://psjgmdnrehcwvppbeqjy.supabase.co
Environment: Production, Preview, Development

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzamdtZG5yZWhjd3ZwcGJlcWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzU4OTksImV4cCI6MjA3OTE1MTg5OX0.IiB4YY9sB0fvEb6Vpm2O_t2YBQ9ORSy-yXtMsnOxZ4Q
Environment: Production, Preview, Development

Name: VITE_DEV_MODE
Value: false
Environment: Production, Preview, Development

Name: VITE_API_KEY
Value: AIzaSyAxjKjbzJTzOEg2dQ_S7z6NciiPUqFrX7o
Environment: Production, Preview, Development

Name: VITE_GOOGLE_MAPS_KEY
Value: AIzaSyD3CAVYUQfY2cQ0tqF00ABSRJZUxVcCMF0
Environment: Production, Preview, Development
```

#### 5. Redeploy
```bash
vercel --prod
```

**Checklist:**
- [ ] Vercel CLI installed
- [ ] Logged into Vercel
- [ ] Project deployed
- [ ] Environment variables added
- [ ] Redeployed with `--prod`
- [ ] Got production URL (e.g., `logos-vision-crm.vercel.app`)

**Time:** ~10-15 minutes

---

### Option B: Deploy to Netlify

**Why Netlify?**
- ✅ Simple deployment
- ✅ Great for static sites
- ✅ Good free tier
- ✅ Easy rollbacks

**Steps:**

#### 1. Install Netlify CLI (if not already)
```bash
npm install -g netlify-cli
```

#### 2. Login to Netlify
```bash
netlify login
```

#### 3. Deploy
```bash
cd "C:\Users\Aegis{FM}\OneDrive\Documents\logos-vision-crm"
netlify deploy
```

**Follow the prompts:**
- Create & configure new site? **Y**
- Team? Select your team
- Site name? **logos-vision-crm**
- Deploy path? **./dist**

#### 4. Build and Deploy
```bash
npm run build
netlify deploy --prod
```

#### 5. Add Environment Variables in Netlify

1. Go to [netlify.com/sites](https://app.netlify.com/sites)
2. Click on your site **logos-vision-crm**
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add each variable (same as Vercel list above)

**Checklist:**
- [ ] Netlify CLI installed
- [ ] Logged into Netlify
- [ ] Site created
- [ ] Deployed to production
- [ ] Environment variables added
- [ ] Got production URL (e.g., `logos-vision-crm.netlify.app`)

**Time:** ~10-15 minutes

---

## ✅ Post-Deployment Verification

After deployment, test these:

### 1. Login Works
- [ ] Navigate to production URL
- [ ] See login page (not bypassed!)
- [ ] Login with test user account
- [ ] Successfully authenticated

### 2. Data Loads
- [ ] Clients load from Supabase
- [ ] Can create new client
- [ ] Can view client details
- [ ] Data persists after refresh

### 3. Navigation Works
- [ ] All tabs work (Clients, Projects, etc.)
- [ ] Global search works (Ctrl+K)
- [ ] Sidebar collapses/expands
- [ ] Breadcrumbs show correctly

### 4. No Console Errors
- [ ] Open browser console (F12)
- [ ] No red errors
- [ ] Supabase connection successful
- [ ] No authentication errors

### 5. Mobile Responsive
- [ ] Test on mobile device or Chrome DevTools
- [ ] Layout adjusts properly
- [ ] All features accessible

**Time:** ~10 minutes

---

## 🔄 Continuous Deployment Setup (Optional)

### Connect Git Repository

**For automatic deployments on every push:**

#### Vercel:
1. Go to project settings
2. Click **Git** → **Connect Git Repository**
3. Choose GitHub/GitLab/Bitbucket
4. Select your repo
5. ✅ Auto-deploys on every commit to main!

#### Netlify:
1. Go to site settings
2. Click **Build & deploy** → **Link repository**
3. Choose provider and repo
4. Configure build settings (already in `netlify.toml`)
5. ✅ Auto-deploys on every commit!

**Checklist:**
- [ ] Git repo connected
- [ ] Auto-deploy enabled
- [ ] Test by pushing a small change

---

## 🎯 Summary

### Before Production:
- [x] Fix Supabase schema
- [ ] Enable Realtime for tables
- [ ] Create user accounts
- [ ] Test local build
- [ ] Review environment variables

### Deploy:
- [ ] Choose Vercel or Netlify
- [ ] Deploy project
- [ ] Add environment variables
- [ ] Set `VITE_DEV_MODE=false`
- [ ] Redeploy

### After Deployment:
- [ ] Test login
- [ ] Test data loading
- [ ] Test all features
- [ ] Check console for errors
- [ ] Test on mobile

### Optional:
- [ ] Connect Git for auto-deploy
- [ ] Set up custom domain
- [ ] Configure monitoring/analytics

---

## 🆘 Troubleshooting

### "User not found" after login
- Check user exists in Supabase Auth
- Verify `VITE_DEV_MODE=false` in production
- Check RLS policies enabled

### "Failed to fetch" errors
- Verify Supabase URL is correct
- Check anon key is correct
- Ensure RLS policies exist

### Build fails
- Run `npm run build` locally to see errors
- Check TypeScript errors
- Verify all imports are correct

### Environment variables not working
- Make sure variable names start with `VITE_`
- Redeploy after adding variables
- Check spelling exactly matches

---

## 📞 Ready to Deploy?

### Quick Deploy Path:

1. **First** - Fix schema in Supabase (5 min)
2. **Then** - Create user accounts (5 min)
3. **Then** - Test local build (5 min)
4. **Finally** - Deploy to Vercel (15 min)

**Total time: ~30 minutes to production!** 🚀

---

## 🎉 Next Steps After Production

Once deployed:
1. Share URL with team
2. Create user accounts for everyone
3. Migrate test data
4. Set up custom domain (optional)
5. Enable monitoring (optional)
6. Continue building features!

---

**You're almost there!** Let me know when you're ready to start! 🎊
