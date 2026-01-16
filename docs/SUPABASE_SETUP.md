# 🚀 Supabase Setup Guide

Your CRM needs to connect to Supabase (the database). This guide will help you set up your credentials in **5 minutes!**

---

## ⚡ Quick Setup (3 Steps)

### **Step 1: Get Your Supabase Credentials**

**If you already have a Supabase project:**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on your project
3. Click **Settings** (gear icon in sidebar)
4. Click **API** in the settings menu
5. Find these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

**If you DON'T have a Supabase project yet:**
1. Go to [https://supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up (free tier is fine!)
4. Click **New Project**
5. Fill in:
   - Name: `logos-vision-crm`
   - Database Password: (choose a strong password - save it!)
   - Region: (choose closest to you)
6. Click **Create new project**
7. Wait 2-3 minutes for setup
8. Follow "If you already have a Supabase project" steps above

---

### **Step 2: Create .env File**

In your project folder (`C:\Users\Aegis{FM}\OneDrive\Documents\logos-vision-crm`):

1. Create a new file called `.env` (exactly that name, starting with a dot)
2. Open it in Notepad or VS Code
3. Copy and paste this:

```
VITE_SUPABASE_URL=your-url-here
VITE_SUPABASE_ANON_KEY=your-key-here
```

4. Replace `your-url-here` with your **Project URL**
5. Replace `your-key-here` with your **anon public key**
6. Save the file

**Example:**
```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxOTQ1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 3: Set Up Database Tables**

You need to create the database tables. Run this SQL in Supabase:

1. Go to your Supabase dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New query**
4. Copy the contents of `supabase-schema.sql` from your project
5. Paste into the SQL editor
6. Click **Run**

**Or use the quick setup file:**
- Open `SUPABASE_QUICK_SETUP.sql` in your project
- Copy all the SQL
- Paste into Supabase SQL Editor
- Run it

---

## ✅ Verify It's Working

### **Test 1: Run Migration Script**

```bash
npx tsx migrateProjectsActivities.ts
```

**Success looks like:**
```
🚀 Starting migration of Projects and Activities to Supabase...
✅ Created project: Annual Fundraising Gala Strategy (4 tasks)
✅ Created project: Grant Application for Youth Programs (3 tasks)
...
```

**Failure looks like:**
```
❌ Missing Supabase environment variables
```
→ Check your .env file!

---

### **Test 2: Start Dev Server**

```bash
npm run dev
```

Open `http://localhost:5173/` and check the console (F12):

**Success:**
```
✅ Loaded 14 projects from Supabase
✅ Loaded 21 activities from Supabase
```

**Failure:**
```
❌ Error loading projects: ...
```
→ Check your .env file and Supabase connection

---

## 🔧 Troubleshooting

### **Problem: ".env file not found"**

**On Windows:**
1. Open Notepad
2. Type your config (example above)
3. Click **File → Save As**
4. Change "Save as type" to **All Files**
5. Name it exactly: `.env` (with the dot!)
6. Save in your project folder

**Or use Command Prompt:**
```bash
cd C:\Users\Aegis{FM}\OneDrive\Documents\logos-vision-crm
echo VITE_SUPABASE_URL=your-url > .env
echo VITE_SUPABASE_ANON_KEY=your-key >> .env
```
Then edit the file to add real values.

---

### **Problem: "Missing Supabase environment variables"**

**Check these:**
1. File is named exactly `.env` (not `.env.txt`)
2. File is in the project root folder
3. No spaces around the `=` sign
4. No quotes around the values
5. Values are on separate lines

**Good:**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Bad:**
```
VITE_SUPABASE_URL = "https://xxx.supabase.co"  ❌ (has spaces and quotes)
```

---

### **Problem: "Cannot connect to Supabase"**

**Check these:**
1. URL starts with `https://` and ends with `.supabase.co`
2. Key is the **anon** key (not service_role key!)
3. Your Supabase project is active (not paused)
4. You have internet connection

**Test connection:**
Go to Supabase dashboard → SQL Editor → Run:
```sql
SELECT * FROM clients LIMIT 1;
```

If this works, your database is fine. Problem is with .env file.

---

### **Problem: "relation 'clients' does not exist"**

You haven't created the database tables yet!

**Fix:**
1. Open `supabase-schema.sql` or `SUPABASE_QUICK_SETUP.sql`
2. Copy all the SQL
3. Go to Supabase → SQL Editor
4. Paste and run

---

### **Problem: Changes to .env not taking effect**

**Fix:**
1. **Restart your dev server** (Ctrl+C, then `npm run dev`)
2. .env files are only read at startup!

---

## 📁 File Structure

After setup, you should have:

```
logos-vision-crm/
├── .env                    ← Your credentials (DO NOT COMMIT!)
├── .env.example           ← Template (safe to commit)
├── .gitignore             ← Should include .env
├── supabase-schema.sql    ← Database tables
└── src/
    └── services/
        └── supabaseClient.ts  ← Reads .env file
```

---

## 🔒 Security Notes

**IMPORTANT:**
- ✅ `.env` is in `.gitignore` - won't be committed
- ✅ Only use the **anon** key (public key)
- ❌ **NEVER** commit `.env` to GitHub
- ❌ **NEVER** share your service_role key

The anon key is safe to use in your app - it has limited permissions controlled by Row Level Security (RLS).

---

## 🎯 What Each Variable Does

### **VITE_SUPABASE_URL**
- Your Supabase project's URL
- Tells the app where your database is
- Format: `https://[project-ref].supabase.co`

### **VITE_SUPABASE_ANON_KEY**
- Public/anonymous key for client-side use
- Safe to use in browser apps
- Has limited permissions (controlled by RLS policies)
- Starts with `eyJ...`

---

## ✨ Next Steps

After setup is complete:

1. **Run migration:**
   ```bash
   npx tsx migrateProjectsActivities.ts
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Open CRM:**
   ```
   http://localhost:5173/
   ```

4. **Check console:**
   ```
   ✅ Loaded 14 projects from Supabase
   ✅ Loaded 21 activities from Supabase
   ```

5. **Celebrate!** 🎉

---

## 📞 Still Having Issues?

If you're stuck, tell Claude:
- What error message you're seeing
- Contents of your `.env` file (replace values with `XXX` for security)
- Whether you can log into Supabase dashboard
- Whether database tables are created

I'll help you fix it! 🚀

---

**Quick Reference:**

```bash
# Create .env file
# Add these two lines with your real values:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-key...

# Test it works
npx tsx migrateProjectsActivities.ts

# Start CRM
npm run dev
```

That's it! 🎊
