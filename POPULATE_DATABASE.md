# 🎉 How to Populate Your Database with Sample Data

This will add **14 Projects** (with ~40 tasks) and **21 Activities** to your Supabase database so you can see everything in action!

---

## ⚡ Quick Start

### Step 1: Make Sure You Have Supabase Configured

Check that you have a `.env` file with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

If you don't have this set up yet, tell Claude and we'll configure it together!

---

### Step 2: Run the Migration Script

Open your terminal in the project directory and run:

```bash
npx tsx migrateProjectsActivities.ts
```

**What this does:**
- Reads sample data from `mockData.ts`
- Creates 14 projects with all their tasks
- Creates 21 activities
- Shows progress as it goes
- Gives you a summary at the end

---

### Step 3: Refresh Your CRM

1. Go to your browser at `http://localhost:5173/`
2. Press `F5` or `Ctrl+R` to refresh
3. Check the console (`F12`) - you should see:
   ```
   ✅ Loaded 14 projects from Supabase
   ✅ Loaded 21 activities from Supabase
   ```
4. **Explore your data!** 🎉

---

## 📊 What Data Gets Added

### **14 Projects** including:
- ✅ Annual Fundraising Gala Strategy (4 tasks)
- ✅ Grant Application for Youth Programs (3 tasks)
- ✅ Impact Assessment Report 2023 (3 tasks)
- ✅ Earth Day Awareness Campaign (2 tasks)
- ✅ Summer Reading Program (1 task)
- ✅ Website Redesign for ARS (3 tasks)
- ✅ Volunteer Recruitment Drive (3 tasks)
- ✅ Online Adoption Portal for HFP (3 tasks)
- ✅ Curriculum Development for FCI (2 tasks)
- ✅ Community Garden Build-out (2 tasks)
- ✅ Elderly Tech Literacy Program (2 tasks)
- ✅ Beach Cleanup Campaign 2024 (1 task)
- ✅ International Artist Exchange Program (1 task)
- ✅ Financial Audit for GHI (completed)

**Total: ~40 tasks across all projects**

### **21 Activities** including:
- Calls, Meetings, Emails, Notes
- Linked to various projects and clients
- Mix of Completed and Scheduled statuses
- Recent and historical dates

---

## 🔍 Expected Output

When you run the migration script, you'll see:

```
🚀 Starting migration of Projects and Activities to Supabase...

📁 Migrating Projects...
✅ Created project: Annual Fundraising Gala Strategy (4 tasks)
✅ Created project: Grant Application for Youth Programs (3 tasks)
✅ Created project: Impact Assessment Report 2023 (3 tasks)
...

📊 Projects Summary: 14 created, 0 failed

📝 Migrating Activities...
✅ Created activity: Initial outreach to new prospect "Hope Foundation"
✅ Created activity: Follow-up call with Dr. Carter
✅ Created activity: Gala planning session
...

📊 Activities Summary: 21 created, 0 failed

═══════════════════════════════════════
🎉 Migration Complete!
═══════════════════════════════════════
✅ Projects:   14/14
✅ Activities: 21/21
═══════════════════════════════════════

🎊 All data migrated successfully!

💡 Refresh your CRM to see the data!
```

---

## 🎯 After Migration - Test These Features

### **View Projects:**
1. Click "Projects" in the sidebar
2. See all 14 projects listed
3. Click on any project to see details
4. See tasks within each project

### **View Activities:**
1. Click "Activities" in the sidebar
2. See all 21 activities listed
3. Filter by type (Call, Meeting, Email, Note)
4. See which are completed vs scheduled

### **Edit Data:**
1. Click on any project or activity
2. Make changes
3. Save
4. **Refresh the page** → Changes persist! ✅

### **Create New Data:**
1. Use Quick Add button → New Project
2. Fill in details (no AI needed!)
3. Save
4. **Refresh** → New project is there! ✅

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'tsx'"
**Fix:** Install tsx as a dev dependency:
```bash
npm install -D tsx
```

### Error: "Cannot connect to Supabase"
**Fix:** Check your `.env` file has the correct credentials:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Error: "Duplicate key value violates unique constraint"
**This means:** Data already exists!
**Options:**
1. Skip migration (you already have data!)
2. Delete existing data in Supabase first
3. Tell Claude to modify the script to skip duplicates

### Error: "Failed to create project [name]"
**Check:**
- Are the client IDs (`cl1`, `cl2`, etc.) in your database?
- You may need to migrate clients first
- Or just ignore - projects without matching clients will fail

---

## 🔄 Re-running the Migration

**Important:** This script will try to create ALL projects and activities again.

If you've already run it once:
- Projects/activities with the same ID will fail (duplicate error)
- That's okay! Existing data won't be overwritten
- Check the summary to see what succeeded vs failed

**To start fresh:**
1. Go to Supabase dashboard
2. Delete all rows from `projects`, `tasks`, and `activities` tables
3. Run the migration again

---

## 📝 Next Steps

After populating the database:

1. **Test CRUD operations:**
   - Create new projects
   - Edit existing activities
   - Delete tasks
   - All should persist after refresh!

2. **Migrate more data:**
   - Cases
   - Volunteers
   - Donations
   - Documents

3. **Explore the CRM:**
   - Try Global Search (`Ctrl+K`)
   - Navigate between different pages
   - See everything working together!

---

**Ready?** Run the migration and watch your database fill up with data! 🚀

```bash
npx tsx migrateProjectsActivities.ts
```
