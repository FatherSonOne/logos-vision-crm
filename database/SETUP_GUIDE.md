# SUPABASE SETUP GUIDE FOR LOGOS VISION CRM

## Part 1: Create Your Supabase Account

1. Go to: https://supabase.com
2. Click "Start your project" or "Sign Up"
3. Sign up with GitHub (recommended) or Email
4. Click "New Project"
5. Fill in:
   - Project Name: `logos-vision-crm`
   - Database Password: (Create strong password - SAVE IT!)
   - Region: East US (or closest to you)
   - Pricing: FREE
6. Click "Create new project"
7. Wait 2-3 minutes for provisioning

## Part 2: Get Your Connection Details

After your project is created:

1. Click on "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API Key (anon public)**: `eyJhbGc...`
   
**SAVE THESE TWO VALUES!** You'll need them in Step 4.

## Part 3: Run the Database Schema

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the ENTIRE contents from:
   `database/schema_simple.sql` (I'll create this next)
4. Paste into the SQL editor
5. Click "RUN" button
6. You should see "Success. No rows returned"

That's it! Your database is now set up with all 14 tables!

## Part 4: Configure Your App

I'll help you create the configuration file next with your credentials.

---

## Troubleshooting

**If you see errors:**
- "extension uuid-ossp already exists" - That's OK, ignore it
- "relation already exists" - Tables already created, you're good!
- Other errors - Take a screenshot and share it

## Next Steps

After completing this, I'll help you:
1. Install Supabase client library
2. Create connection configuration
3. Update your code to use Supabase instead of mock data
