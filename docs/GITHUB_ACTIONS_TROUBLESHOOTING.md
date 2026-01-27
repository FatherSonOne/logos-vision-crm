# 🔧 GitHub Actions Deployment Error - Quick Fix Guide

## Error You're Seeing

```
Error: Input required and not supplied: vercel-token
```

This error occurs when the GitHub Actions workflow tries to deploy to Vercel but can't find the required `VERCEL_TOKEN` secret.

---

## ✅ Quick Fix (5 Steps)

### Step 1: Get Your Vercel Token

1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Give it a name like `GitHub Actions - Logos Vision CRM`
4. Set scope to **Full Account** (or specific project if preferred)
5. Click **"Create"**
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### Step 2: Link Your Project to Vercel (If Not Already Done)

If you haven't deployed to Vercel yet, run these commands locally:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (this creates .vercel/project.json)
vercel link
```

Answer the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N** (if new) or **Y** (if exists)
- What's your project's name? `logos-vision-crm`
- In which directory is your code located? `./`

### Step 3: Get Your Vercel Project IDs

After linking, check the `.vercel/project.json` file:

```bash
# View the project.json file
cat .vercel/project.json
```

You'll see something like:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

**Copy both values!**

### Step 4: Add GitHub Secrets

1. Go to your GitHub repository page
2. Click **Settings** (top menu)
3. In the left sidebar, expand **Secrets and variables** → Click **Actions**
4. Click **"New repository secret"** for each of these:

   **Secret 1:**
   - Name: `VERCEL_TOKEN`
   - Value: [Paste the token from Step 1]
   - Click **"Add secret"**

   **Secret 2:**
   - Name: `VERCEL_ORG_ID`
   - Value: [Paste the `orgId` from Step 3]
   - Click **"Add secret"**

   **Secret 3:**
   - Name: `VERCEL_PROJECT_ID`
   - Value: [Paste the `projectId` from Step 3]
   - Click **"Add secret"**

   **Secret 4:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://psjgmdnrehcwvppbeqjy.supabase.co`
   - Click **"Add secret"**

   **Secret 5:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `your_supabase_anon_key_here`
   - Click **"Add secret"**

   **Secret 6 (Optional, if using AI features):**
   - Name: `VITE_GEMINI_API_KEY`
   - Value: [Your Gemini API key]
   - Click **"Add secret"**

### Step 5: Trigger a New Deployment

Once all secrets are added, trigger a new deployment:

**Option A: Push a new commit**
```bash
git commit --allow-empty -m "Trigger deployment with Vercel secrets"
git push
```

**Option B: Re-run the failed workflow**
1. Go to your repository → **Actions** tab
2. Click on the failed workflow run
3. Click **"Re-run all jobs"**

---

## ✅ Verification

After pushing or re-running:

1. Go to **Actions** tab in your GitHub repository
2. You should see a new workflow running
3. Click on it to watch the progress
4. All steps should turn green ✅
5. Your site will be deployed to Vercel!

---

## 📋 Required GitHub Secrets Checklist

Make sure you have ALL of these secrets set:

- [ ] `VERCEL_TOKEN` - Your Vercel authentication token
- [ ] `VERCEL_ORG_ID` - Your Vercel organization/team ID
- [ ] `VERCEL_PROJECT_ID` - Your Vercel project ID
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `VITE_GEMINI_API_KEY` - Your Gemini API key (optional)

---

## 🔍 How to Check Your Secrets Are Set

1. Go to your repository on GitHub
2. Click **Settings**
3. Click **Secrets and variables** → **Actions**
4. You should see all 6 secrets listed (values are hidden for security)

---

## 🐛 Still Getting Errors?

### Error: "Invalid token"
- Your `VERCEL_TOKEN` may be expired or incorrect
- Generate a new token from [Vercel Account Settings](https://vercel.com/account/tokens)
- Update the `VERCEL_TOKEN` secret in GitHub

### Error: "Project not found"
- Your `VERCEL_PROJECT_ID` may be incorrect
- Re-run `vercel link` locally
- Check `.vercel/project.json` for the correct ID
- Update the secret in GitHub

### Error: "Organization not found"
- Your `VERCEL_ORG_ID` may be incorrect
- Check `.vercel/project.json` for the correct ID
- Update the secret in GitHub

### Error: Build fails but deployment works
- Check your environment variables are set correctly
- Make sure `VITE_` prefix is on all Vite-specific variables
- Verify the values don't have extra spaces or quotes

---

## 🎯 Expected Workflow Behavior

When everything is set up correctly:

1. **On Push to Main/Master:**
   - GitHub Actions workflow starts automatically
   - Checks out your code
   - Sets up Node.js
   - Installs dependencies
   - Builds your project with environment variables
   - Deploys to Vercel using the token
   - Shows deployment URL in the logs

2. **On Pull Request:**
   - Same as above, but deploys to a preview URL
   - You can test changes before merging

---

## 📞 Helpful Links

- [Vercel Tokens](https://vercel.com/account/tokens)
- [Vercel Projects](https://vercel.com/dashboard)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel GitHub Actions Guide](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)

---

## 💡 Pro Tips

1. **Never commit** `.vercel/project.json` to git if it contains sensitive info
2. **Rotate tokens** periodically for security
3. **Use different tokens** for different projects
4. **Keep secrets updated** if you regenerate any API keys
5. **Test locally first** with `npm run build` before relying on CI/CD

---

## ✅ Success!

Once all secrets are set and the workflow runs successfully, you'll see:

- ✅ All workflow steps pass
- ✅ Deployment URL in the logs
- ✅ Your site is live on Vercel
- ✅ Future pushes automatically deploy

🎉 **Your GitHub Actions auto-deployment is now working!**
