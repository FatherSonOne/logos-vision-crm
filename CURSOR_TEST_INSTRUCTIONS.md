# 🎯 CURSOR TEST - Quick Diagnostic

## 🚀 How to Use:

### Step 1: Add to App.tsx

Open `src/App.tsx` and add at the TOP with other imports:

```typescript
import { CursorTest } from './components/CursorTest';
```

### Step 2: Render CursorTest

Find your main return/render and add AT THE VERY TOP:

```typescript
return (
  <>
    <CursorTest />  {/* ADD THIS LINE */}
    
    {/* ... rest of your app */}
  </>
);
```

### Step 3: Test

1. Save files
2. Browser will auto-refresh
3. You'll see black overlay with crosshair

### Step 4: Move Mouse

- Crosshair should be **PERFECTLY** on your cursor
- Numbers show cursor position
- Shows browser zoom level

### Step 5: Diagnose

#### ✅ If Crosshair is PERFECT:
**Problem is in LivingTimeline component!**
→ Use manual offset correction from COORDINATE_DEBUG.md

#### ❌ If Crosshair is OFFSET:
Check the zoom level shown:
- **If NOT 1.0**: Press `Ctrl + 0` to reset zoom
- **If IS 1.0**: Might be system display scaling

### Step 6: Remove Test

After testing, remove/comment out:
```typescript
// <CursorTest />
```

---

## 🎯 What the Results Mean:

### Result A: Crosshair Perfect, Zoom = 1.0
✅ **Browser and coordinates are fine**
❌ **Problem is in LivingTimeline**
→ Apply manual offset in LivingTimeline.tsx

### Result B: Crosshair Offset, Zoom ≠ 1.0
✅ **FOUND THE PROBLEM!**
→ Press `Ctrl + 0` to fix zoom
→ Test again

### Result C: Crosshair Offset, Zoom = 1.0
⚠️ **System display scaling issue**
→ Check Windows/Mac display settings
→ Or apply manual offset as workaround

---

## 📊 What to Report:

Tell me:
1. **Is crosshair perfect or offset?**
2. **What's the zoom number shown?**
3. **What are the X/Y coordinates when cursor is in center of screen?**

This tells me EXACTLY what to fix!

---

## 🔧 Quick Manual Fix (If Needed)

If crosshair is PERFECT but timeline orb is OFFSET, then we know it's a LivingTimeline issue.

Add these constants at the TOP of LivingTimeline.tsx (line 44):

```typescript
// MANUAL OFFSET CORRECTION
const OFFSET_X = 384; // Adjust this!
const OFFSET_Y = 240; // Adjust this!
```

Then in handleMouseMove (line 118):

```typescript
setMousePosition({ 
  x: e.clientX - OFFSET_X, 
  y: e.clientY - OFFSET_Y 
});
```

And in handleContextMenu (line 135):

```typescript
setContextMenu({
  x: e.clientX - OFFSET_X,
  y: e.clientY - OFFSET_Y,
  date: hoveredDate,
});
```

Adjust OFFSET_X and OFFSET_Y until it's perfect!
