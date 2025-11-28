# 🚀 How to Run & View Your CRM Locally

## Quick Start (First Time Setup)

### Step 1: Open Terminal in Your OneDrive Folder
1. Navigate to: `C:\Users\Aegis{FM}\Onedrive\Documents\logos-vision-crm`
2. **Right-click in the folder** → Select "Open in Terminal" (or "Git Bash Here")
   - Or open PowerShell/Command Prompt and run:
     ```bash
     cd C:\Users\Aegis{FM}\Onedrive\Documents\logos-vision-crm
     ```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```
⏱️ This takes 1-2 minutes. Only needed once!

### Step 3: Start the Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
1. Look for this message in terminal:
   ```
   ➜  Local:   http://localhost:5173/
   ```
2. **Open your browser** → Go to: `http://localhost:5173/`
3. **You'll see your CRM!** 🎉

---

## 🔄 Every Time After (Quick Start)

Once you've done the first-time setup, starting the CRM is super easy:

1. **Open Terminal** in the logos-vision-crm folder
2. **Run:** `npm run dev`
3. **Open browser:** `http://localhost:5173/`
4. **Done!** ✅

---

## 📺 What You'll See

When you open `http://localhost:5173/`, you'll see:

✅ **Your Full CRM Application:**
- Dashboard with stats
- Sidebar navigation
- Client management
- Project tracking
- All the features we've built!

✅ **Global Search Working:**
- Press `Ctrl+K` to search
- Click the search button in header
- Try it out!

✅ **Dark/Light Mode Toggle:**
- Switch themes in real-time

---

## 🔥 Hot Reload - See Changes Instantly!

**The magic part:** When the dev server is running, any changes we make will show up **automatically** in your browser!

**Workflow:**
1. Dev server running → Browser open
2. Claude makes changes → Pushes to GitHub
3. You run sync script → Files update in OneDrive
4. Browser **automatically refreshes** with new changes! ⚡

No need to restart anything!

---

## 🛠️ Useful Commands

### Start Development Server:
```bash
npm run dev
```

### Build for Production:
```bash
npm run build
```

### Preview Production Build:
```bash
npm run preview
```

### Stop the Server:
- Press `Ctrl+C` in the terminal

---

## 🌐 Port Numbers Explained

- **Development:** `http://localhost:5173/` (default Vite port)
- If port 5173 is busy, Vite will use 5174, 5175, etc.
- The terminal will tell you which port it's using!

---

## ✅ Verification Checklist

After running `npm run dev`, you should see:

```
✓ [check] No issues found
✓ Starting dev server...
✓ Local:   http://localhost:5173/
✓ Network: http://192.168.x.x:5173/
```

Then in your browser at `localhost:5173`:
- [ ] CRM loads without errors
- [ ] You can see the dashboard
- [ ] Sidebar navigation works
- [ ] You can click around and explore
- [ ] Console has no red errors (press F12 to check)

**All checked?** → You're good to go! 🎉

---

## 🔍 Testing Features

### Test Global Search:
1. Press `Ctrl+K`
2. Type something
3. Should see search modal!

### Test Dark Mode:
1. Look for moon/sun icon in header
2. Click to toggle themes
3. Should switch smoothly!

### Test Navigation:
1. Click sidebar items
2. Should navigate to different pages
3. Breadcrumbs should update

---

## 🆘 Troubleshooting

### Problem: "npm: command not found"
**Solution:** Install Node.js
1. Go to: https://nodejs.org/
2. Download LTS version
3. Install and restart terminal
4. Try again!

### Problem: "Cannot find package.json"
**Solution:** Wrong directory
```bash
# Make sure you're in the right folder:
cd C:\Users\Aegis{FM}\Onedrive\Documents\logos-vision-crm

# Check if package.json exists:
dir package.json  # Windows
ls package.json   # Git Bash
```

### Problem: "Port 5173 already in use"
**Solution:** Either:
- Stop the other process using that port
- Or let Vite use a different port (it will tell you which one)

### Problem: "Page shows errors"
**Solution:**
1. Check browser console (F12)
2. Look for red error messages
3. Tell Claude: "Getting error: [paste error]"
4. I'll help fix it!

### Problem: "Blank white screen"
**Solution:**
1. Open console (F12)
2. Look for errors
3. Try hard refresh: `Ctrl+Shift+R`
4. If still blank, tell Claude!

---

## 📊 Development Workflow

### Perfect Workflow:
```
1. Sync from GitHub
   ↓
2. Run: npm run dev
   ↓
3. Open: http://localhost:5173/
   ↓
4. Tell Claude: "Let's add feature X"
   ↓
5. Claude makes changes → pushes to GitHub
   ↓
6. Run sync script
   ↓
7. Browser automatically refreshes with changes! ✨
   ↓
8. Test the new feature
   ↓
9. Repeat!
```

---

## 🎯 Pro Tips

### Tip 1: Keep Terminal Open
While working, keep the terminal with `npm run dev` running in the background. Don't close it!

### Tip 2: Keep Browser Open
Keep the browser tab open at `localhost:5173` - it will auto-refresh when files change!

### Tip 3: Use Browser DevTools
Press `F12` to open developer tools:
- **Console:** See logs and errors
- **Network:** See API calls
- **Elements:** Inspect HTML/CSS

### Tip 4: Test in Incognito
Sometimes cache causes issues. Test in incognito mode:
- Chrome: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`

---

## 🔐 Environment Variables (If Needed)

If you need to configure Supabase or other services, create a `.env` file:

```bash
# In the project root, create .env file:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

**Note:** The `.env` file is already in `.gitignore` so it won't be committed!

---

## 🌟 What's Running?

When you run `npm run dev`, you're starting:

1. **Vite Dev Server** - Fast development server
2. **Hot Module Replacement (HMR)** - Auto-reload on changes
3. **TypeScript Compiler** - Type checking
4. **React Renderer** - Your UI components

All working together to give you a smooth development experience! 🚀

---

## ✅ Success!

If you can:
- Run `npm run dev` without errors
- Open `localhost:5173` and see your CRM
- Click around and it works
- Press `Ctrl+K` and search works

**You're all set!** Now you can see every change we make in real-time! 🎉

---

## 📞 Need Help?

Tell Claude:
- "Dev server won't start, error: [paste error]"
- "Browser shows blank page"
- "Getting this error in console: [paste error]"
- "npm install failed with: [paste error]"

I'll help immediately! 🚀

---

**Ready to see your CRM in action?** Run `npm run dev` and let's go! 🎉
