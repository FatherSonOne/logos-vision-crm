# 🎯 CALENDAR INTEGRATION - FINAL SETUP STEPS

## ✅ WHAT'S COMPLETE:

1. ✅ Added "Calendar Settings" to sidebar (Workspace section)
2. ✅ Fixed port issue - Updated to `localhost:3000`
3. ✅ Added SettingsIcon to icons
4. ✅ Calendar integration component ready
5. ✅ All routing configured

---

## 🔴 CRITICAL STEPS YOU MUST DO NOW - IN ORDER:

### **STEP 1: Update Google Cloud Console Redirect URIs** ⭐ *MOST IMPORTANT*

The redirect URI must match your port. Since your app is on `localhost:3000`, you need to update Google Cloud Console:

**ACTION REQUIRED:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized JavaScript origins", make sure you have:
   - `http://localhost:3000`
4. Under "Authorized redirect URIs", you do **NOT** need to add anything
   - We're using URL parameters, not a callback route
   - Just having the JavaScript origin is enough
5. Click **"SAVE"**

**⚠️ If you skip this step, the connection will fail with "redirect_uri_mismatch" error!**

---

### **STEP 2: Restart Your Dev Server**

**IMPORTANT:** Environment variables only load when the server starts!

1. In your terminal, press `Ctrl+C` to stop the server
2. Run: `npm run dev`
3. Wait for it to say it's running

---

### **STEP 3: Test the Connection**

1. Open your app at `http://localhost:3000`
2. Click on **"Calendar Settings"** in the sidebar (Workspace section)
3. Click the **"Connect Calendar"** button
4. You'll be redirected to Google
5. Sign in with your Google account (the one you added as a test user)
6. Grant permissions
7. You'll be redirected back to your app
8. You should see "Successfully Connected!" message
9. Your calendars will be listed

---

## 🐛 TROUBLESHOOTING:

### **Issue: "redirect_uri_mismatch" error**

**Cause:** The redirect URI in Google Cloud Console doesn't match your app's port

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Make sure `http://localhost:3000` is in "Authorized JavaScript origins"
3. Click SAVE
4. Wait 5 minutes for Google to propagate the changes
5. Try again

---

### **Issue: Calendar Settings button not showing**

**Cause:** Need to restart dev server

**Fix:**
1. Press `Ctrl+C` in terminal
2. Run `npm run dev`
3. Refresh browser

---

### **Issue: "Access Blocked: This app's request is invalid"**

**Cause:** OAuth consent screen not configured or test user not added

**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Make sure status is "Testing"
3. Add your email as a test user
4. Save

---

### **Issue: Environment variables not loading**

**Cause:** Server wasn't restarted after changing `.env.local`

**Fix:**
1. Always restart the dev server after changing `.env.local`
2. Run `npm run dev`

---

## 📋 CHECKLIST BEFORE TESTING:

- [ ] Updated Google Cloud Console redirect URI to `http://localhost:3000`
- [ ] Clicked SAVE in Google Cloud Console
- [ ] Restarted dev server (`Ctrl+C` then `npm run dev`)
- [ ] Opened app at `http://localhost:3000`
- [ ] Can see "Calendar Settings" in sidebar

---

## 🎉 ONCE IT'S WORKING:

You'll see:
- ✅ "Successfully Connected!" message
- ✅ Your Google calendars listed with colors
- ✅ Green checkmark next to "Connected" status
- ✅ "Disconnect" button available

---

## 📝 FILES MODIFIED TODAY:

1. `.env.local` - Updated port to 3000
2. `src/components/icons.tsx` - Added SettingsIcon
3. `src/components/navigationConfig.tsx` - Added Calendar Settings nav item
4. `src/components/CalendarIntegration.tsx` - Created (NEW)
5. `src/App.tsx` - Added calendar-settings route
6. `src/types.ts` - Added 'calendar-settings' page type

---

## 🚀 NEXT STEPS (AFTER CONNECTION WORKS):

1. **Sync events** - Pull events from Google Calendar
2. **Create events** - Add events to Google Calendar from CRM
3. **Two-way sync** - Keep calendars in sync
4. **Team scheduling** - View team availability

---

**Ready to test! Follow the steps in order and let me know how it goes!** 😊
