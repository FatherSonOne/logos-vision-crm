# AIXHost.exe Error — Troubleshooting Guide

## What’s happening

You’re seeing:

**“Windows cannot access the specified device, path, or file. You may not have the appropriate permissions to access the item.”**

…for `C:\WINDOWS\SystemApps\MicrosoftWindows.Client.AIX_...\AIXHost.exe`.

- **AIXHost.exe** is part of **Microsoft Windows Client AIX** (Windows’ built‑in AI: Copilot, Recall, etc.).
- Windows (or something triggering it) keeps trying to run `AIXHost.exe`, fails (permissions/corruption), and shows that dialog.
- When the dialog appears **while you’re using Cursor**, it steals focus and can freeze or crash Cursor, especially during tests, AI, or heavy UI use.

**This is a Windows / system-app issue, not a bug in Cursor or your project.** Cursor doesn’t reference AIXHost; the popup just happens to occur while you’re in Cursor.

---

## Fixes to try (in order)

**If `Remove-AppxPackage` failed with 0x80073CFA:** That’s normal — the AIX package is protected. Skip to **step 4** (Turn Windows features on or off) and **step 2** (wsreset), then continue as needed.

### 1. Remove the AIX app package (often stops the popups)

Many users report this resolves the error.

1. **Right‑click Start** → **Terminal (Admin)** or **PowerShell (Admin)**.
2. Run:
   ```powershell
   Get-AppxPackage MicrosoftWindows.Client.AIX | Remove-AppxPackage
   ```
3. **Restart** your PC. Windows may re‑initialize the component; if the popup is gone, you’re done.

**Note:** On many Windows 11 installs this fails with `0x80073CFA` ("This app is part of Windows and cannot be uninstalled on a per-user basis"). If you see that, **do not retry** — use **"Turn Windows features on or off"** (step 4) and the other steps below instead.

---

### 2. Reset Microsoft Store cache

1. **Win + R** → type `wsreset.exe` → Enter.
2. Wait for it to finish, then restart and see if the popup still appears.

---

### 3. Repair system files (DISM + SFC)

1. Open **Command Prompt** or **PowerShell** as **Administrator**.
2. Run:
   ```cmd
   DISM /Online /Cleanup-Image /RestoreHealth
   sfc /scannow
   ```
3. **Restart** when both complete.

---

### 4. Turn Windows features on or off — **use this if Remove-AppxPackage failed (0x80073CFA)**

Windows says to use this when the AIX package can’t be removed. Disabling Recall (and any AI-related features) often stops AIXHost from being invoked.

1. **Win + R** → type **`optionalfeatures`** → Enter.
2. In **Turn Windows features on or off**, look for **Recall** (Windows 11 24H2+) or any **Windows AI** / **Copilot**-related entries.
3. **Uncheck** them → OK → restart when prompted.

---

### 5. Re‑register Microsoft Store apps

1. **PowerShell (Admin)**.
2. Run:
   ```powershell
   Get-AppxPackage -AllUsers | ForEach-Object { Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml" }
   ```
3. Restart.

---

### 6. Test with a new Windows user

1. Create a **new local administrator** account.
2. Sign in there and use Cursor. If the error **doesn’t** appear, the problem is likely **profile‑specific** (corrupted profile).
3. You can then migrate your work to the new profile or use it as your main account.

---

### 7. Install Windows updates

**Settings** → **Windows Update** → **Check for updates** → install everything → restart.  
Sometimes an update fixes Store / system‑app issues.

---

## If Cursor keeps crashing

- **Minimize Cursor** when you’re not actively coding so the AIXHost dialog is less likely to appear over it and trigger a freeze.
- Apply the steps above; stopping the AIXHost popups is the reliable way to prevent those interruptions.

---

## Summary

| Step | Action |
|------|--------|
| 1 | `Get-AppxPackage MicrosoftWindows.Client.AIX \| Remove-AppxPackage` in PowerShell (Admin), then restart |
| 2 | Run `wsreset.exe`, restart |
| 3 | `DISM /Online /Cleanup-Image /RestoreHealth` then `sfc /scannow`, restart |
| 4 | Disable Recall in “Turn Windows features on or off” (if available) |
| 5 | Re‑register Store apps (PowerShell command above), restart |
| 6 | Test with a new Windows user |
| 7 | Install all pending Windows updates |

Start with **step 1**; it fixes the issue for many people. If the remove command fails, continue with 2–7. As a last resort, Microsoft suggests an **in‑place upgrade** (repair reinstall) of Windows 11, which can refresh system components including Store apps.

---

## References

- [How do I resolve error message ... AIXHost.exe](https://learn.microsoft.com/en-us/answers/questions/5708366/how-do-i-resolve-error-message-c-windowssystemapps) (Microsoft Q&A)
- [Continuous error from AIXHost.exe](https://learn.microsoft.com/en-us/answers/questions/3875084/continuous-error-from-aixhost-exe-the-application) (Microsoft Q&A)
