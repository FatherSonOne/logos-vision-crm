# 🚀 SUPABASE MIGRATION - QUICK START GUIDE

## What We're Migrating

✅ **Already Migrated:**
- Clients
- Team Members  
- Volunteers
- Activities
- Projects

⏳ **Migrating Now:**
- Tasks (project tasks)
- Cases (support cases)
- Donations (fundraising data)

---

## STEP-BY-STEP INSTRUCTIONS

### Option 1: Run All Migrations at Once (RECOMMENDED)

**Single Command:**
```bash
npx ts-node migrateAllRemaining.ts
```

This will run all 3 migrations in sequence with a nice summary at the end!

---

### Option 2: Run Individual Migrations

If you want to run them one at a time:

**1. Migrate Tasks:**
```bash
npx ts-node migrateTasks.ts
```

**2. Migrate Cases:**
```bash
npx ts-node migrateCases.ts
```

**3. Migrate Donations:**
```bash
npx ts-node migrateDonations.ts
```

---

## What to Expect

Each migration will:
1. ✅ Connect to your Supabase database
2. ✅ Map your mock data to real database IDs
3. ✅ Insert data in batches
4. ✅ Show you a summary of what was migrated
5. ✅ Report any errors

---

## After Migration

Once complete, your App.tsx should load:
- ✅ Projects (already working)
- ✅ Tasks (from Supabase!)
- ✅ Cases (from Supabase!)
- ✅ Donations (from Supabase!)

---

## Troubleshooting

**If you get "Cannot find module" errors:**
Make sure you've installed dependencies:
```bash
npm install
```

**If migrations fail:**
- Check that your .env files have the correct Supabase credentials
- Verify your Supabase database has all the tables (check schema.sql)
- Read the error messages - they'll tell you what's wrong

---

## Ready to Start?

1. Open your terminal in the project folder
2. Run: `npx ts-node migrateAllRemaining.ts`
3. Watch the magic happen! ✨

---

**Need help?** Just let me know what errors you see!
