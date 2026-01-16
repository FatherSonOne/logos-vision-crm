# 📋 HOW TO LOAD SAMPLE DATA INTO YOUR CRM

## Quick Start (3 Simple Steps)

### Step 1: Open Supabase SQL Editor
1. Go to [supabase.com](https://supabase.com)
2. Log into your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Copy & Paste the SQL
1. Open the file: `comprehensive-sample-data.sql`
2. Select ALL the text (Ctrl+A)
3. Copy it (Ctrl+C)
4. Paste into the Supabase SQL Editor (Ctrl+V)

### Step 3: Run the Script
1. Click the **"RUN"** button (or press Ctrl+Enter)
2. Wait 5-10 seconds for it to complete
3. Look for the success message at the bottom

---

## What Data Gets Created

This script creates REALISTIC sample data for EVERY menu item:

### 📊 **CRM Section**
- ✅ **5 Organizations** (Non-profits from your area)
- ✅ **8 Contacts** (Real people with roles)
- ✅ **7 Projects** (Planning, In Progress, Completed, On Hold)
- ✅ **7 Cases** (Technical, Consulting, Marketing)
- ✅ **8 Activities** (Recent calls, meetings, emails)

### 🎯 **Outreach Section**
- ✅ **10 Donations** ($10,900 total with various payment methods)
- ✅ **8 Volunteers** (With skills and availability)
- ✅ **4 Events** (Gala, cleanup, showcase, orientation)
- ✅ **5 Email Campaigns** (Sent, scheduled, and drafts)
- ✅ **Charity Tracker data** (Built from donations)

### 💼 **Workspace Section**
- ✅ **11 Tasks** (Across multiple projects with different statuses)
- ✅ **5 Calendar Events** (Meetings, deadlines, milestones)
- ✅ **10 Documents** (PDFs, Word docs, spreadsheets)
- ✅ **Reports data** (Generated from all activities)

### 🤝 **Team Section**
- ✅ **5 Team Members** (Including you as Founder!)

### 🔗 **Connect Section**
- Data will appear once you use chat/video features

### 🤖 **AI Suite**
- Ready for AI tools to analyze your sample data

### 👥 **Client Suite**
- Portal builder ready with sample client

---

## Verification Checklist

After running the script, check each menu item:

- [ ] **Dashboard** - Should show activity summary
- [ ] **Organizations** - See 5 clients
- [ ] **Contacts** - See 8 contacts
- [ ] **Projects** - See 7 projects
- [ ] **Case Management** - See 7 cases with comments
- [ ] **Activities** - See 8 activities
- [ ] **Donations** - See 10 donations
- [ ] **Volunteers** - See 8 volunteers
- [ ] **Events** - See 4 events
- [ ] **Email Campaigns** - See 5 campaigns
- [ ] **Tasks** - See 11 tasks
- [ ] **Calendar** - See 5 calendar events
- [ ] **Documents** - See 10 documents
- [ ] **Team Members** - See 5 team members

---

## ⚠️ Important Notes

1. **Run this AFTER your database schema is set up**
   - Make sure all your tables exist first
   - If you get errors, check that your schema matches

2. **This adds NEW data, doesn't replace existing data**
   - Safe to run even if you have some data
   - Won't duplicate if you run it twice (has safety checks)

3. **All dates are relative to TODAY**
   - Recent activities show as recent
   - Upcoming events show in the future
   - Everything feels current and realistic

---

## 🎉 What Makes This Data Special

- **Realistic names and details** from South Carolina area
- **Connected relationships** (clients have contacts, projects have tasks)
- **Varied statuses** (see planning, in-progress, and completed items)
- **Recent activity** (calls and meetings from the last few days)
- **Future events** (upcoming deadlines and appointments)
- **Real-world scenarios** (grant applications, fundraising, events)

---

## Need Help?

If you see any errors:
1. Copy the error message
2. Check that your database schema is up to date
3. Make sure you're connected to the right Supabase project

---

**Ready to explore your CRM with real data!** 🚀
