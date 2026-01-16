# Logos Vision CRM v1.0 Deployment Guide

Complete step-by-step instructions for deploying Logos Vision CRM at crm.logosvision.org

---

## Overview

This guide covers:
1. Google OAuth Setup (for authentication)
2. Google Calendar API Setup (for calendar integration)
3. Microsoft Calendar API Setup (optional)
4. Resend Email Setup (for notifications & invitations)
5. IONOS DNS Configuration
6. Vercel Deployment
7. Environment Variables
8. Testing Your Deployment

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name: `Logos Vision CRM` → Click **Create**

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → Click **Create**
3. Fill in:
   - App name: `Logos Vision CRM`
   - User support email: Your email
   - Developer contact email: Your email
4. Click **Save and Continue**
5. **Scopes**: Click **Add or Remove Scopes**
   - Select: `email`, `profile`, `openid`
   - Click **Update** → **Save and Continue**
6. **Test users**: Add your email and team emails for testing
7. Click **Save and Continue** → **Back to Dashboard**

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Logos Vision CRM Web Client`
5. **Authorized JavaScript origins**:
   ```
   https://crm.logosvision.org
   http://localhost:5176
   ```
6. **Authorized redirect URIs**:
   ```
   https://crm.logosvision.org
   https://crm.logosvision.org/auth/callback
   https://crm.logosvision.org/auth/callback/google
   https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback
   http://localhost:5176
   http://localhost:5176/auth/callback
   http://localhost:5176/auth/callback/google
   ```
7. Click **Create**
8. **Save your Client ID and Client Secret** - you'll need these!

### Step 4: Add Google to Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Logos Vision CRM project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Toggle **Enable Sign in with Google** ON
6. Enter:
   - Client ID: (from step 3)
   - Client Secret: (from step 3)
7. Copy the **Callback URL** shown - add this to Google OAuth redirect URIs
8. Click **Save**

---

## 2. Google Calendar API Setup

### Step 1: Enable Calendar API
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it → Click **Enable**

### Step 2: Configure Calendar Scopes
1. Go back to **OAuth consent screen** → **Edit App**
2. Go to **Scopes** section
3. Click **Add or Remove Scopes**
4. Add these scopes:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/calendar.readonly
   ```
5. Click **Update** → **Save and Continue**

### Step 3: Update OAuth Credentials
The same OAuth credentials from Step 1 will work for Calendar API - no additional credentials needed.

---

## 3. Microsoft Calendar API Setup (Optional)

### Step 1: Register App in Azure
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: `Logos Vision CRM`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: Select **Web** and enter:
     ```
     https://crm.logosvision.org/auth/callback/microsoft
     ```
5. Click **Register**

### Step 2: Configure API Permissions
1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph**
3. Choose **Delegated permissions**
4. Add:
   - `Calendars.Read`
   - `Calendars.ReadWrite`
   - `User.Read`
5. Click **Add permissions**
6. Click **Grant admin consent** (if you're an admin)

### Step 3: Create Client Secret
1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Logos Vision CRM Production`
4. Expiry: Choose appropriate duration
5. Click **Add**
6. **Copy the secret value immediately** - it won't be shown again!

### Step 4: Get Application IDs
From the **Overview** page, copy:
- **Application (client) ID** → This is your `VITE_MICROSOFT_CLIENT_ID`
- The secret from Step 3 → This is your `VITE_MICROSOFT_CLIENT_SECRET`

---

## 4. Resend Email Setup (For Notifications & Invitations)

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Click **Get Started** and create account
3. Verify your email

### Step 2: Add Your Domain
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `logosvision.org`
4. You'll receive DNS records to add

### Step 3: Configure DNS for Resend
Add these records in IONOS DNS (see Section 5 for how):

| Type  | Name                         | Value                                |
|-------|------------------------------|--------------------------------------|
| TXT   | resend._domainkey           | (copy from Resend dashboard)         |
| TXT   | @                            | v=spf1 include:resend.com ~all      |

### Step 4: Get API Key
1. In Resend, go to **API Keys**
2. Click **Create API Key**
3. Name: `Logos Vision CRM Production`
4. Permission: **Full Access**
5. Click **Create**
6. **Copy and save the API key immediately** - it won't be shown again!

---

## 5. IONOS DNS Configuration

### Step 1: Access DNS Settings
1. Log in to [IONOS](https://my.ionos.com)
2. Go to **Domains & SSL** → **Your Domains**
3. Find `logosvision.org` → Click **DNS**

### Step 2: Add CNAME for CRM Subdomain
Add this record to point crm.logosvision.org to Vercel:

| Type  | Name | Value                | TTL    |
|-------|------|----------------------|--------|
| CNAME | crm  | cname.vercel-dns.com | 1 Hour |

### Step 3: Add Resend DNS Records
Add the TXT records from Resend (Section 4, Step 3)

### Step 4: Wait for Propagation
DNS changes can take up to 48 hours, but usually complete within 1-4 hours.

Check propagation: [whatsmydns.net](https://www.whatsmydns.net/) - search for `crm.logosvision.org`

---

## 6. Vercel Deployment

### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 2: Deploy via GitHub (Recommended)
1. Push your Logos Vision CRM code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **Deploy**

### Step 3: Add Custom Domain
1. In Vercel project dashboard, go to **Settings** → **Domains**
2. Enter: `crm.logosvision.org`
3. Click **Add**
4. Vercel will verify DNS (should work if CNAME is set correctly)

### Step 4: Configure Environment Variables
In Vercel dashboard → **Settings** → **Environment Variables**, add all variables from Section 7.

Click **Save** and redeploy.

---

## 7. Environment Variables Reference

### Local Development (.env.local file)
Create `.env.local` in your project root:

```env
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# ==========================================
# APP CONFIGURATION
# ==========================================
VITE_APP_URL=http://localhost:5176

# ==========================================
# GOOGLE CALENDAR OAUTH
# ==========================================
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5176/auth/callback/google

# ==========================================
# MICROSOFT CALENDAR OAUTH (Optional)
# ==========================================
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
VITE_MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
VITE_MICROSOFT_REDIRECT_URI=http://localhost:5176/auth/callback/microsoft

# ==========================================
# APPLE CALENDAR (Optional - Future)
# ==========================================
VITE_APPLE_CLIENT_ID=
VITE_APPLE_CLIENT_SECRET=
VITE_APPLE_REDIRECT_URI=http://localhost:5176/auth/callback/apple

# ==========================================
# ENTOMATE INTEGRATION (Optional)
# ==========================================
VITE_ENTOMATE_WEBHOOK_SECRET=your_webhook_secret_here
VITE_ENTOMATE_SUPABASE_URL=
VITE_ENTOMATE_SUPABASE_ANON_KEY=

# ==========================================
# EMAIL SERVICE
# ==========================================
VITE_RESEND_API_KEY=re_xxxxxxxxx

# ==========================================
# AI FEATURES (Optional)
# ==========================================
GEMINI_API_KEY=AIza...
```

### Production (Vercel Environment Variables)

| Name                           | Value                                           |
|--------------------------------|-------------------------------------------------|
| VITE_SUPABASE_URL              | https://[your-project].supabase.co             |
| VITE_SUPABASE_ANON_KEY         | (your Supabase anon key)                       |
| VITE_APP_URL                   | https://crm.logosvision.org                    |
| VITE_GOOGLE_CLIENT_ID          | (from Google Cloud Console)                    |
| VITE_GOOGLE_CLIENT_SECRET      | (from Google Cloud Console)                    |
| VITE_GOOGLE_REDIRECT_URI       | https://crm.logosvision.org/auth/callback/google |
| VITE_MICROSOFT_CLIENT_ID       | (from Azure Portal - optional)                 |
| VITE_MICROSOFT_CLIENT_SECRET   | (from Azure Portal - optional)                 |
| VITE_MICROSOFT_REDIRECT_URI    | https://crm.logosvision.org/auth/callback/microsoft |
| VITE_RESEND_API_KEY            | re_xxxxxxxxx (from Resend)                     |
| GEMINI_API_KEY                 | (your Gemini API key for AI features)          |

---

## 8. Testing Your Deployment

### Test Checklist

- [ ] **Google Sign-In**: Click "Continue with Google" and complete OAuth flow
- [ ] **Google Calendar Sync**: Connect calendar and verify events sync
- [ ] **Microsoft Calendar Sync**: Connect calendar (if configured)
- [ ] **Email Notifications**: Test sending an email from the system
- [ ] **Database Connection**: Verify Supabase connection works
- [ ] **AI Features**: Test AI-powered features (if configured)

### Troubleshooting

**Google OAuth not working?**
- Check redirect URIs match exactly (including trailing slashes)
- Ensure Supabase Google provider is enabled
- Check browser console for errors
- Verify the OAuth consent screen is properly configured

**Calendar sync not working?**
- Ensure Calendar API is enabled in Google Cloud Console
- Check that calendar scopes are added to OAuth consent screen
- Verify redirect URIs include the calendar callback paths

**Microsoft Calendar not working?**
- Check Azure App registration redirect URIs
- Ensure API permissions are granted (admin consent if required)
- Verify client secret hasn't expired

**Emails not sending?**
- Verify Resend API key is correct
- Check Resend dashboard for email logs
- Verify domain DNS is properly configured
- Check for bounce or spam issues

**Database connection issues?**
- Verify Supabase URL and anon key are correct
- Check Supabase Row Level Security (RLS) policies
- Look at Supabase logs for connection errors

---

## 9. Post-Launch Checklist

- [ ] Add all team member emails to Google OAuth test users (if still in testing mode)
- [ ] Publish Google OAuth app for production (removes test user limit)
- [ ] Set up monitoring (Vercel Analytics is already included in package.json)
- [ ] Configure Supabase database backups
- [ ] Create team onboarding documentation
- [ ] Test all calendar integrations with real user accounts
- [ ] Verify email deliverability

---

## Quick Reference

| Service           | Dashboard URL                          |
|-------------------|----------------------------------------|
| Google Cloud      | console.cloud.google.com               |
| Azure Portal      | portal.azure.com                       |
| Supabase          | supabase.com/dashboard                 |
| Resend            | resend.com/emails                      |
| Vercel            | vercel.com/dashboard                   |
| IONOS             | my.ionos.com                           |

---

## Support

If you encounter issues:
1. Check browser console for errors (F12 → Console)
2. Check Vercel deployment logs
3. Check Supabase logs (Dashboard → Logs)
4. Check Resend email logs
5. Verify all environment variables are set correctly

---

*Guide generated for Logos Vision CRM v1.0 deployment*
