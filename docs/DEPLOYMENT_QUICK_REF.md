# 🚀 Deployment Quick Reference

## 📋 Your Project Info

```
Supabase URL: https://psjgmdnrehcwvppbeqjy.supabase.co
Project ID: psjgmdnrehcwvppbeqjy
Dashboard: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy
```

---

## ⚡ Quick Commands

### Local Development
```bash
# Start dev server (with dev mode)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run type-check
```

### Deploy to Vercel
```bash
# Install CLI (once)
npm install -g vercel

# Login (once)
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploy to Netlify
```bash
# Install CLI (once)
npm install -g netlify-cli

# Login (once)
netlify login

# Deploy
netlify deploy --prod
```

---

## 🔐 Environment Variables

### Local (.env.local) - Keep dev mode ON
```env
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_DEV_MODE=true
VITE_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
```

### Production (Vercel/Netlify) - Turn dev mode OFF
```env
VITE_SUPABASE_URL=https://psjgmdnrehcwvppbeqjy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_DEV_MODE=false  ← MUST BE FALSE!
VITE_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `SUPABASE_QUICK_SETUP.sql` | Run this in Supabase SQL Editor |
| `SUPABASE_STEP_BY_STEP.md` | Detailed Supabase setup guide |
| `PRODUCTION_DEPLOYMENT_CHECKLIST.md` | Full deployment checklist |
| `DEPLOYMENT_QUICK_REF.md` | This file - quick reference |
| `.env.local` | Local environment variables |
| `vercel.json` | Vercel configuration |
| `netlify.toml` | Netlify configuration |

---

## 🎯 Deployment Sequence

```
1. Fix Schema (5 min)
   → Open Supabase SQL Editor
   → Copy/paste SUPABASE_QUICK_SETUP.sql
   → Run it

2. Enable Realtime (2 min)
   → Database → Replication
   → Toggle ON for: clients, projects, tasks, activities, cases

3. Create Users (3 min)
   → Authentication → Users
   → Add User (at least 1)
   → Save credentials

4. Test Build (2 min)
   → npm run build
   → npm run preview
   → Check for errors

5. Deploy (10 min)
   → Choose Vercel or Netlify
   → Run deploy commands
   → Add environment variables
   → Set VITE_DEV_MODE=false
   → Redeploy

Total: ~22 minutes
```

---

## ✅ Pre-Deploy Checklist

**Supabase:**
- [ ] Schema SQL run successfully
- [ ] Tables visible in Table Editor
- [ ] Realtime enabled (6 tables minimum)
- [ ] 1+ user account created
- [ ] Credentials saved

**Local:**
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] `npm run preview` works
- [ ] Console has no errors

**Deployment:**
- [ ] Chose platform (Vercel/Netlify)
- [ ] CLI installed and logged in
- [ ] Environment variables ready
- [ ] `VITE_DEV_MODE=false` for production

---

## 🔧 Troubleshooting Quick Fixes

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build
```

### Type Errors
```bash
# Check types
npx tsc --noEmit
```

### Environment Variables Not Working
- Must start with `VITE_`
- Must redeploy after adding
- Check exact spelling

### Supabase Connection Failed
- Verify URL is correct
- Check anon key is correct
- Ensure RLS policies exist

### Login Not Working in Production
- Verify `VITE_DEV_MODE=false`
- Check user exists in Supabase Auth
- Verify RLS policies enabled

---

## 📊 Tables Requiring Realtime

**Priority (Enable These):**
- clients
- projects
- tasks
- activities
- cases
- team_members

**Optional (Enable If Using):**
- chat_messages
- documents
- events
- donations
- volunteers

---

## 🌐 After Deployment

### Test Production Site

1. **Visit URL** - Open production URL
2. **Login** - Use created user credentials
3. **Test Features:**
   - [ ] Login works
   - [ ] Clients load
   - [ ] Can create client
   - [ ] Data persists
   - [ ] Navigation works
   - [ ] Search works (Ctrl+K)
   - [ ] No console errors

### Share With Team

1. Share production URL
2. Share user credentials (securely!)
3. Create accounts for team members
4. Test with multiple users

---

## 🆘 Emergency Commands

### Rollback Vercel Deployment
```bash
vercel rollback
```

### Rebuild and Redeploy
```bash
npm run build && vercel --prod
```

### Check Deployment Logs
```bash
# Vercel
vercel logs

# Netlify
netlify logs
```

---

## 📞 Important Links

**Supabase:**
- Dashboard: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy
- SQL Editor: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/sql
- Table Editor: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/editor
- Authentication: https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy/auth/users

**Deployment:**
- Vercel: https://vercel.com/dashboard
- Netlify: https://app.netlify.com/sites

---

## 💡 Tips

1. **Always test locally first** with `npm run build && npm run preview`
2. **Keep dev mode ON locally** for easier development
3. **Use dev mode OFF in production** for security
4. **Save user credentials securely** (password manager)
5. **Enable Realtime** for better UX
6. **Check console** for errors after deploy

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Production URL loads
- ✅ Login page shows (not bypassed)
- ✅ Can log in with created user
- ✅ Clients load from Supabase
- ✅ Can create/edit data
- ✅ Data persists after refresh
- ✅ No console errors
- ✅ Mobile responsive

---

**Keep this file open while deploying!** 📌
