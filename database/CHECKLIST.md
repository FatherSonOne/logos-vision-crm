# SUPABASE SETUP CHECKLIST

## 📋 Complete These Steps in Order

### Phase 1: Supabase Account Setup
- [ ] Go to https://supabase.com
- [ ] Sign up with GitHub or Email
- [ ] Create new project named "logos-vision-crm"
- [ ] Choose FREE plan
- [ ] Save your database password somewhere safe
- [ ] Wait for project to finish setting up (2-3 minutes)

### Phase 2: Database Schema
- [ ] In Supabase, click "SQL Editor" in sidebar
- [ ] Click "New Query"
- [ ] Open file: `database/schema_simple.sql`
- [ ] Copy ENTIRE contents of that file
- [ ] Paste into Supabase SQL Editor
- [ ] Click "RUN" button
- [ ] Verify you see "Success. No rows returned"

### Phase 3: Get Connection Details
- [ ] In Supabase, click "Settings" → "API"
- [ ] Copy your "Project URL" (looks like: https://xxxxx.supabase.co)
- [ ] Copy your "anon public" API key (long string starting with "eyJ...")
- [ ] Save both somewhere - you'll need them next

### Phase 4: Install & Configure
- [ ] Open Command Prompt
- [ ] Run: `cd /d "C:\Users\Aegis{FM}\OneDrive\Documents\logos-vision-crm"`
- [ ] Run: `npm install @supabase/supabase-js`
- [ ] Open `.env.local` file
- [ ] Add your Supabase URL and API key (see CONNECTION_GUIDE.md)

### Phase 5: Update Code (I'll help with this!)
- [ ] Create supabaseClient.ts
- [ ] Create service files for each data type
- [ ] Update App.tsx to use Supabase
- [ ] Test the connection
- [ ] Celebrate! 🎉

---

## 🆘 Need Help?

**Stuck on any step?** Take a screenshot and share it with me.

**Everything working?** Tell me "Supabase is set up" and I'll help you with Phase 5!

---

## 📁 Important Files

All guides are in the `database/` folder:
- `SETUP_GUIDE.md` - Detailed setup instructions
- `schema_simple.sql` - Database schema to run in Supabase
- `CONNECTION_GUIDE.md` - How to connect your app
- `CHECKLIST.md` - This file!
