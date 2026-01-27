# GitHub Secrets Setup for Vercel Deployment

## 🔐 Required Secrets

Your GitHub Actions workflow needs these secrets to deploy to Vercel automatically.

---

## Step 1: Get Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name it: `GitHub Actions - logos-vision-crm`
4. Click **"Create"**
5. **Copy the token** (you'll only see it once!)

---

## Step 2: Get Vercel Project IDs

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (run this in your project directory)
vercel link

# Get your project details
cat .vercel/project.json
```

This will show:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

### Option B: From Vercel Dashboard

1. Go to your project: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings**
4. **Project ID** is shown in the "General" section
5. **Org ID**: Click your profile → Settings → find your Team/Org ID

---

## Step 3: Add Secrets to GitHub

1. Go to your repository: https://github.com/FatherSonOne/logos-vision-crm
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add each of these secrets:

### Vercel Secrets:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `VERCEL_TOKEN` | Your token from Step 1 | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Your orgId from Step 2 | `.vercel/project.json` or Dashboard |
| `VERCEL_PROJECT_ID` | Your projectId from Step 2 | `.vercel/project.json` or Dashboard |

### Environment Variable Secrets:

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `VITE_SUPABASE_URL` | `https://psjgmdnrehcwvppbeqjy.supabase.co` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | From Supabase Dashboard |
| `VITE_GEMINI_API_KEY` | Your Gemini API key | Your Google AI API key |

**From DEPLOYMENT_QUICK_REF.md, your values are:**
```
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here (or use VITE_API_KEY)
```

---

## Step 4: Re-run the Failed Workflow

After adding all secrets:

1. Go to: https://github.com/FatherSonOne/logos-vision-crm/actions
2. Click on the failed workflow run
3. Click **"Re-run all jobs"**

Or simply push a new commit to trigger it again.

---

## Step 5: Verify Deployment

Once the workflow succeeds:

1. Check GitHub Actions for green checkmark ✅
2. Visit your Vercel deployment URL
3. Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
4. Your Charity Page should now be visible!

---

## 🚨 Troubleshooting

### Still Getting Errors?

**Check secrets are spelled correctly:**
- Names must match exactly (case-sensitive)
- No extra spaces
- No quotes around values

**Vercel Token Issues:**
- Make sure token has correct permissions
- Token must be from the account that owns the project

**Project Not Found:**
- Verify `VERCEL_PROJECT_ID` matches your project
- Verify `VERCEL_ORG_ID` is correct
- Make sure you're using the right Vercel account

---

## 📞 Quick Links

- **GitHub Secrets**: https://github.com/FatherSonOne/logos-vision-crm/settings/secrets/actions
- **Vercel Tokens**: https://vercel.com/account/tokens
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/FatherSonOne/logos-vision-crm/actions

---

## ✅ Checklist

Before re-running the workflow:

- [ ] Created Vercel token
- [ ] Got Vercel Org ID
- [ ] Got Vercel Project ID
- [ ] Added `VERCEL_TOKEN` to GitHub secrets
- [ ] Added `VERCEL_ORG_ID` to GitHub secrets
- [ ] Added `VERCEL_PROJECT_ID` to GitHub secrets
- [ ] Added `VITE_SUPABASE_URL` to GitHub secrets
- [ ] Added `VITE_SUPABASE_ANON_KEY` to GitHub secrets
- [ ] Added `VITE_GEMINI_API_KEY` to GitHub secrets
- [ ] All secrets verified (no typos)

---

## 🎯 About the Build Settings Warning

The second error you saw is just a warning, not a real error:

> "Unused build and development settings"

**This is expected and fine!** It means Vercel is using the `vercel.json` configuration (which we want) instead of the dashboard settings. This gives us more control over the build process.

---

## 🎉 After Setup

Once all secrets are configured:
- Every push to `main` will automatically deploy to production
- Pull requests will create preview deployments
- You can force rebuild anytime via GitHub Actions

Your Charity Page updates will be live! 🚀
