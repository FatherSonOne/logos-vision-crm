# 🤖 Automatic Deployment & Cache Management

This guide covers the automatic deployment setup for Logos Vision CRM with proper cache invalidation.

---

## 📋 Overview

Your project is configured for automatic deployments with:
- ✅ GitHub Actions integration
- ✅ Automatic cache-busting headers
- ✅ Manual force rebuild option
- ✅ Preview deployments for PRs
- ✅ Production deployments for main/master

---

## 🚀 How Automatic Deployment Works

### On Every Push to main/master:
1. GitHub Actions triggers automatically
2. Code is checked out and Node.js is set up
3. Dependencies are installed
4. Project is built with your environment variables
5. Deployed to Vercel production automatically
6. Cache headers ensure browsers get fresh content

### On Every Pull Request:
1. Preview deployment is created
2. Comment is added to PR with deployment status
3. Team can review changes before merging

### Manual Deployment (Force Rebuild):
1. Go to GitHub Actions tab
2. Select "Deploy to Vercel" workflow
3. Click "Run workflow"
4. Choose "Force rebuild without cache: true"
5. This clears all caches and builds fresh

---

## 🔧 Cache Strategy

### vercel.json Configuration

Your project now has smart caching:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

**What this means:**
- **Static assets** (JS, CSS, images): Cached for 1 year because Vite adds content hashes
- **HTML files**: Always revalidated, ensuring users get the latest version
- **Result**: Fast loading + always up-to-date content

---

## 🛠️ Ensuring Fresh Builds

### Method 1: Automatic (Recommended)
Just push your changes to main/master:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

The deployment happens automatically with proper cache management.

### Method 2: Manual Force Rebuild
If you suspect caching issues:

1. **Via GitHub Actions:**
   - Go to: `https://github.com/YOUR_USERNAME/logos-vision-crm/actions`
   - Click "Deploy to Vercel" workflow
   - Click "Run workflow" button
   - Select branch: `main`
   - Choose "Force rebuild without cache: **true**"
   - Click "Run workflow"

2. **Via Vercel CLI:**
   ```bash
   vercel --prod --force
   ```

### Method 3: Clear Vercel Build Cache
Via Vercel Dashboard:
1. Go to your project in Vercel
2. Click on a deployment
3. Click "..." menu → "Redeploy"
4. **Uncheck** "Use existing Build Cache"
5. Click "Redeploy"

---

## 🔐 Required GitHub Secrets

Ensure these secrets are set in your repository:
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `VITE_SUPABASE_URL` - Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_GEMINI_API_KEY` - Your Gemini API key

**To add/verify secrets:**
1. Go to: `https://github.com/YOUR_USERNAME/logos-vision-crm/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret with its value

---

## 📊 Vercel Project Setup

### Getting Vercel IDs:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project (in your project directory)
vercel link

# Get project details
cat .vercel/project.json
```

This will show your `orgId` and `projectId`.

---

## 🎯 Deployment Workflow

### Standard Workflow:
```
Developer pushes to branch
         ↓
Create Pull Request
         ↓
GitHub Actions builds preview
         ↓
Team reviews preview deployment
         ↓
Merge to main
         ↓
Automatic production deployment
         ↓
Cache headers ensure fresh content
```

### Emergency Hot-fix Workflow:
```
Fix bug in main branch
         ↓
Push to main
         ↓
Automatic deployment (~2-3 min)
         ↓
Verify deployment
         ↓
If issues: Rollback in Vercel
```

---

## 🧪 Testing Deployments

### After Deployment:
1. **Hard refresh** your browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Check Network tab** in DevTools:
   - Look for `Cache-Control` headers
   - Verify assets have content hashes (e.g., `main-abc123.js`)
3. **Test functionality**:
   - Login works
   - Data loads correctly
   - Features work as expected

### Verify Fresh Deployment:
```bash
# Check when files were built
curl -I https://your-domain.vercel.app/assets/index-[hash].js | grep -i "last-modified"

# Check cache headers
curl -I https://your-domain.vercel.app/ | grep -i "cache-control"
```

---

## 🚨 Troubleshooting

### Build Shows Old Code
**Cause:** Browser cache or Vercel build cache
**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear browser cache completely
3. Try incognito/private mode
4. Force rebuild via GitHub Actions

### GitHub Action Fails
**Cause:** Missing secrets or build errors
**Solution:**
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Test build locally: `npm run build`
4. Check environment variables

### Deployment Succeeds but Shows Errors
**Cause:** Missing environment variables or runtime errors
**Solution:**
1. Check Vercel deployment logs
2. Verify environment variables in Vercel dashboard
3. Ensure `VITE_DEV_MODE=false` in production
4. Check browser console for errors

### Changes Not Visible After Deployment
**Try these in order:**
1. Hard refresh: `Ctrl+Shift+R`
2. Clear browser cache
3. Check different browser
4. Check incognito mode
5. Verify deployment timestamp in Vercel
6. Force rebuild without cache

---

## 📈 Monitoring Deployments

### GitHub Actions:
- View workflow runs: `https://github.com/YOUR_USERNAME/logos-vision-crm/actions`
- Check build logs for errors
- Monitor deployment duration

### Vercel Dashboard:
- View all deployments
- Check deployment status
- Review build logs
- Monitor performance metrics

---

## ⚡ Performance Tips

### Automatic Optimizations:
- ✅ Content hashing for cache busting
- ✅ Immutable caching for static assets
- ✅ Compressed assets (gzip/brotli)
- ✅ CDN distribution via Vercel

### Manual Optimizations:
- Keep dependencies up to date
- Minimize bundle size
- Use lazy loading where appropriate
- Monitor bundle size in build logs

---

## 🎉 Success Checklist

Your automatic deployment is working correctly when:

- ✅ Pushing to main triggers automatic deployment
- ✅ Pull requests create preview deployments
- ✅ Build completes successfully (no errors)
- ✅ Environment variables are properly set
- ✅ Fresh content appears after hard refresh
- ✅ Static assets are cached appropriately
- ✅ HTML is always revalidated
- ✅ No console errors in production
- ✅ Can force rebuild when needed

---

## 📞 Quick Commands

```bash
# View deployment status
vercel ls

# View recent logs
vercel logs

# Rollback to previous deployment
vercel rollback

# Force new production deployment
vercel --prod --force

# Check build locally
npm run build && npm run preview
```

---

## 🔗 Related Documentation

- `DEPLOYMENT_QUICK_REF.md` - Quick deployment reference
- `DEPLOYMENT_FLOWCHART.md` - Visual deployment guide
- `vercel.json` - Vercel configuration
- `.github/workflows/deploy.yml` - GitHub Actions workflow

---

## 💡 Best Practices

1. **Always test locally** before pushing to main
2. **Use pull requests** for feature development
3. **Review preview deployments** before merging
4. **Monitor build logs** for warnings
5. **Keep secrets secure** - never commit to git
6. **Use force rebuild sparingly** - only when needed
7. **Hard refresh** after deployment to see changes
8. **Check Vercel dashboard** for deployment health

---

## 🆘 Emergency Procedures

### Site is Down:
1. Check Vercel status: https://vercel-status.com
2. View deployment logs in Vercel
3. Rollback to last working deployment: `vercel rollback`
4. Contact Vercel support if needed

### Bad Deployment:
1. Immediately rollback: `vercel rollback`
2. Fix issue locally and test
3. Create new deployment with fix
4. Verify fix works

### Cache Issues:
1. Force rebuild via GitHub Actions
2. Clear browser cache
3. Test in incognito mode
4. If persistent, check Vercel cache settings

---

**Your deployment pipeline is now fully automated!** 🎊

Every push to main will automatically build and deploy with proper cache management, ensuring your users always see the latest version.
