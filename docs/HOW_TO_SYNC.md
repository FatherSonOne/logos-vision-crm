# 🔄 How to Keep OneDrive & GitHub in Sync

## Quick Answer

**Where Claude works:** Cloud container (you can't see this)
**Where GitHub stores code:** https://github.com/FatherSonOne/logos-vision-crm
**Where you see files:** `C:\Users\Aegis{FM}\Onedrive\Documents\logos-vision-crm`

---

## 🎯 Easy 3-Step Sync Process

### Step 1: Download the Sync Script
1. Go to GitHub: https://github.com/FatherSonOne/logos-vision-crm
2. Click on branch: `claude/backup-repo-onedrive-0171kP3Mk3qsh9oHbjn4pkzX`
3. Download the file: `sync-to-onedrive.bat`
4. Save it to your Desktop

### Step 2: Run the Script
1. Double-click `sync-to-onedrive.bat` on your Desktop
2. Wait for it to complete (5-10 seconds)
3. Done! ✅

### Step 3: When to Sync
Run the script whenever:
- ✅ After Claude finishes working on something
- ✅ Before you start working on files
- ✅ You want to see the latest changes
- ✅ Anytime you're not sure if you have the latest version

---

## 📋 Alternative: Manual Sync (If Script Doesn't Work)

### First Time Setup:
```bash
cd C:\Users\Aegis{FM}\Onedrive\Documents
git clone https://github.com/FatherSonOne/logos-vision-crm.git
cd logos-vision-crm
git checkout claude/backup-repo-onedrive-0171kP3Mk3qsh9oHbjn4pkzX
```

### Every Time After:
```bash
cd C:\Users\Aegis{FM}\Onedrive\Documents\logos-vision-crm
git pull origin claude/backup-repo-onedrive-0171kP3Mk3qsh9oHbjn4pkzX
```

---

## 🔍 How to Check If You're Up to Date

### Option 1: Use the Script
Just run `sync-to-onedrive.bat` - it will tell you if you're up to date!

### Option 2: Check Manually
1. Open Command Prompt or PowerShell
2. Navigate to your OneDrive directory:
   ```bash
   cd C:\Users\Aegis{FM}\Onedrive\Documents\logos-vision-crm
   ```
3. Check status:
   ```bash
   git fetch
   git status
   ```
4. If it says "Your branch is up to date" ✅ You're good!
5. If it says "Your branch is behind" ⚠️ Run: `git pull`

---

## 🎨 Visual Indicator

After syncing, check the file `LAST_SYNC.txt` in your directory.
It shows when the last update was made and what changed.

---

## ❓ Common Questions

### Q: Do I need to sync before every session with Claude?
**A:** No! But it's a good idea to sync:
- After Claude says "I've pushed the changes"
- Before you start editing files yourself
- When you want to see what's new

### Q: Will this overwrite my local changes?
**A:** If you've made changes locally that aren't committed, git will warn you.
Best practice: Let Claude make changes, then sync to see them.

### Q: Can I work directly in the OneDrive folder?
**A:** Yes! You can edit files there. Just make sure to:
1. Commit your changes: `git add . && git commit -m "Your message"`
2. Push to GitHub: `git push`
3. Tell Claude you made changes

### Q: What if the script fails?
**A:** Use the manual commands above, or let me know and I'll help debug!

---

## 🚀 Best Workflow

### When Working with Claude:
1. **Tell Claude what you want to build**
2. **Wait for Claude to say "Changes pushed to GitHub"**
3. **Run sync script** → See changes in OneDrive
4. **Test locally** → Everything works!
5. **Repeat!**

### When Working Solo:
1. **Edit files in OneDrive directory**
2. **Commit changes:** `git add . && git commit -m "Description"`
3. **Push to GitHub:** `git push`
4. **Tell Claude:** "I made some changes, can you pull them?"

---

## 📞 Need Help?

If you're confused or something doesn't work:
1. Tell Claude: "I'm having trouble syncing to OneDrive"
2. Share any error messages you see
3. I'll help you fix it immediately!

---

**Remember:** GitHub is the "source of truth" - everything flows through there!
