# GitHub and Auto-Deploy Setup Guide

This guide will help you set up your CRM on GitHub with automatic deployment to Vercel.

---

## 🚨 Getting a GitHub Actions Error?

**If you see: `Error: Input required and not supplied: vercel-token`**

👉 **[Go to the Quick Fix Guide →](./GITHUB_ACTIONS_TROUBLESHOOTING.md)**

This means your GitHub secrets aren't set up yet. The troubleshooting guide has step-by-step instructions to fix this in 5 minutes.

---

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `logos-vision-crm`
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Push Your Code to GitHub

After creating the repository, run these commands in your terminal:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/logos-vision-crm.git

# Push your code
git push -u origin master
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Set Up Vercel Deployment

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import your `logos-vision-crm` repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API key (if using AI features)
7. Click "Deploy"

**Auto-deploy is now enabled!** Every push to master/main will automatically deploy.

### Option B: Using GitHub Actions (Advanced)

If you want more control over the deployment process, you can use the included GitHub Actions workflow:

1. Get your Vercel credentials:
   ```bash
   # Install Vercel CLI (if not installed)
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link your project
   vercel link
   ```

2. Get the required tokens from `.vercel/project.json`:
   - `VERCEL_ORG_ID`: Found in the project.json file
   - `VERCEL_PROJECT_ID`: Found in the project.json file

3. Generate a Vercel token:
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token
   - Copy the `VERCEL_TOKEN`

4. Add GitHub Secrets:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add these secrets:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GEMINI_API_KEY`

5. The workflow will automatically deploy on every push to master/main

## Step 4: Alternative - Netlify Deployment

If you prefer Netlify instead of Vercel:

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select `logos-vision-crm`
4. Build settings (should auto-detect from netlify.toml):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables (same as Vercel)
6. Click "Deploy site"

## Step 5: Configure Environment Variables

Make sure you have a `.env` file locally (NOT committed to git):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Step 6: Test Your Deployment

1. Make a small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push
   ```
3. Check your Vercel/Netlify dashboard to see the deployment in progress
4. Once deployed, visit your live URL

## Deployment URLs

After deployment, you'll get URLs like:
- **Vercel**: `https://logos-vision-crm.vercel.app`
- **Netlify**: `https://logos-vision-crm.netlify.app`

You can also add a custom domain in the platform settings.

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Ensure `package.json` has all dependencies
- Review build logs in Vercel/Netlify dashboard

### Environment Variables Not Working
- Make sure variable names start with `VITE_` for Vite projects
- Redeploy after adding new environment variables
- Check that variables are set in the deployment platform (not just locally)

### Auto-deploy Not Triggering
- Verify the repository is connected to Vercel/Netlify
- Check that you're pushing to the correct branch (master/main)
- Review the GitHub Actions workflow if using that method

## Security Notes

- Never commit `.env` files to git
- Keep your Supabase keys secure
- Use Supabase Row Level Security (RLS) policies
- Rotate API keys if they're exposed
- Use environment-specific keys for development vs production

## Next Steps

1. Set up a custom domain
2. Configure SSL (automatic on Vercel/Netlify)
3. Set up database backups
4. Configure monitoring and analytics
5. Set up staging environment (optional)

---

Your CRM is now set up for continuous deployment! Every push to the main branch will automatically build and deploy your application.
