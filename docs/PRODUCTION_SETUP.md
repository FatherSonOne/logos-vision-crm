# Production Setup Guide

This guide will walk you through deploying the Logos Vision CRM to production.

## Prerequisites

- Supabase project with database tables set up
- Vercel or Netlify account
- Node.js 20+ installed locally

## 1. Supabase Database Setup

### Create Required Tables

Your Supabase project needs the following tables (if not already created):

- `clients`
- `projects`
- `tasks`
- `activities`
- `team_members`
- `volunteers`
- `donations`
- `cases`
- `case_comments`
- `events`
- `email_campaigns`
- `documents`
- `webpages`

### Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Name it: `documents`
5. Set to **Public** or **Private** based on your needs
   - **Public**: Files are accessible via URL (recommended for public documents)
   - **Private**: Requires authentication to access (recommended for sensitive documents)
6. Click **Create Bucket**

### Configure Row Level Security (RLS)

Enable RLS on all tables to secure your data:

```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE webpages ENABLE ROW LEVEL SECURITY;

-- Example policy: Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read access" ON clients
  FOR SELECT
  TO authenticated
  USING (true);

-- Example policy: Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated write access" ON clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Repeat similar policies for other tables
```

### Enable Realtime

Enable realtime for tables that need live updates:

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `cases`
   - `projects`
   - `activities`
   - `tasks`
   - (any other tables you want real-time updates for)

### Create User Accounts

Since you'll be disabling dev mode, create actual user accounts:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User**
3. Enter email and password
4. Click **Create User**
5. Repeat for all team members who need access

## 2. Environment Variables

### Update `.env.local` for Production

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# IMPORTANT: Set to false for production
VITE_DEV_MODE=false
```

**Never commit `.env.local` to git!** It's already in `.gitignore`.

## 3. Deployment to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to link to your project
```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your Git repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_DEV_MODE`: `false`
6. Click **Deploy**

### Configure Vercel Environment Variables

After initial deployment:

1. Go to **Project Settings** → **Environment Variables**
2. Add the three environment variables mentioned above
3. Redeploy the project

## 4. Deployment to Netlify

### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify
netlify init

# Deploy
netlify deploy --prod
```

### Option B: Deploy via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **Add New Site** → **Import an existing project**
3. Connect to your Git repository
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_DEV_MODE`: `false`
6. Click **Deploy Site**

### Configure Netlify Environment Variables

1. Go to **Site Settings** → **Environment Variables**
2. Add the three environment variables
3. Trigger a redeploy

## 5. Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test user authentication (login/logout)
- [ ] Test creating/updating/deleting records
- [ ] Verify real-time updates are working
- [ ] Test document upload/download
- [ ] Check that RLS policies are working (users can only access authorized data)
- [ ] Test on mobile devices
- [ ] Monitor Supabase usage and set up billing alerts if needed

## 6. Continuous Deployment

Both Vercel and Netlify support automatic deployments:

- **Main branch**: Deploys to production automatically
- **Other branches**: Creates preview deployments

Configure this in your platform's settings.

## 7. Monitoring and Maintenance

### Supabase Dashboard

Monitor your Supabase project:
- **Database**: Check table sizes and query performance
- **Auth**: Monitor user signups and logins
- **Storage**: Track storage usage
- **API**: Monitor API request counts

### Vercel/Netlify Analytics

Enable analytics to track:
- Page views
- Performance metrics
- Error rates
- User geography

## 8. Security Best Practices

1. **Never expose your Supabase service role key** - Only use the anon key in the frontend
2. **Always use RLS policies** - Protect your data at the database level
3. **Validate user input** - Both frontend and backend (Supabase functions if needed)
4. **Use HTTPS only** - Both Vercel and Netlify provide this by default
5. **Regular security audits** - Review RLS policies and user permissions periodically
6. **Enable email verification** - In Supabase Auth settings
7. **Set up password requirements** - In Supabase Auth settings

## 9. Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node.js version (should be 20+)
- Check build logs for specific errors

### Authentication Not Working

- Verify `VITE_DEV_MODE` is set to `false`
- Check Supabase URL and anon key are correct
- Verify user accounts exist in Supabase Auth
- Check browser console for errors

### Real-time Updates Not Working

- Verify replication is enabled in Supabase for the table
- Check that the table name matches exactly (case-sensitive)
- Look for connection errors in browser console

### Cannot Upload Files

- Verify the `documents` bucket exists in Supabase Storage
- Check bucket permissions (public vs private)
- Verify RLS policies allow file uploads

## 10. Rollback Plan

If you need to rollback:

### Vercel
1. Go to **Deployments**
2. Find the previous working deployment
3. Click **...** → **Promote to Production**

### Netlify
1. Go to **Deploys**
2. Find the previous working deployment
3. Click **Publish deploy**

## Support

For issues:
- Check Supabase documentation: https://supabase.com/docs
- Check Vite documentation: https://vitejs.dev
- Review Vercel/Netlify deployment guides
