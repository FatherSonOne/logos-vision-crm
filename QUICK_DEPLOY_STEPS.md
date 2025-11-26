# Quick Deployment Steps

## Fastest Path to Deployment (5 minutes)

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `logos-vision-crm`
3. Keep it **public** or **private** (your choice)
4. **DO NOT** check any initialization options
5. Click "Create repository"

### Step 2: Push Your Code
Copy the commands shown on GitHub, or run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/logos-vision-crm.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (Easiest Option)

1. **Go to**: https://vercel.com
2. **Click**: "Add New Project"
3. **Import**: `logos-vision-crm` from GitHub
4. **Add Environment Variables**:
   ```
   VITE_SUPABASE_URL = your_supabase_url_here
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key_here
   VITE_GEMINI_API_KEY = your_gemini_key_here (optional)
   ```
5. **Click**: "Deploy"

**Done!** Your app will be live in ~2 minutes at `https://your-project.vercel.app`

### Step 4: Auto-Deploy is Now Active

Every time you push to GitHub, Vercel will automatically:
- Build your app
- Run tests
- Deploy to production

## Alternative: Netlify

Same process, just use https://netlify.com instead of Vercel.

## Test Auto-Deploy

```bash
# Make a change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push

# Watch it deploy automatically in Vercel/Netlify dashboard
```

## Your Repository is Ready

Your git repository is initialized and ready to push. Just complete Steps 1-3 above!

## Where to Get API Keys

- **Supabase URL & Key**: https://app.supabase.com > Your Project > Settings > API
- **Gemini API Key**: https://makersuite.google.com/app/apikey

---

**Need detailed instructions?** See `GITHUB_DEPLOYMENT_SETUP.md`
