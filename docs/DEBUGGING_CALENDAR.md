# 🐛 DEBUGGING GUIDE - Why Features Aren't Showing

## 🔍 Common Issues & Solutions

### Issue 1: Orb Not Visible

**Possible Causes:**
1. Timeline not actually showing (viewMode not set to timeline)
2. Z-index issues with other elements
3. CSS animations not loading
4. Mouse position not being tracked

**Quick Test:**
Open browser console (F12) and check for errors related to:
- `mousePosition`
- `hoveredDate`
- `fixed` positioning

**Fix 1 - Check Timeline is Showing:**
```typescript
// In CalendarView, check if this is true:
console.log('Timeline showing:', showTimeline);
```

**Fix 2 - Force Orb to Show (Test):**
Add this temporary code to LivingTimeline.tsx after line 245 (after the timeline track div starts):

```typescript
{/* TEST ORB - ALWAYS VISIBLE */}
<div
  className="fixed z-50 pointer-events-none"
  style={{
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  }}
>
  <div className="w-12 h-12 bg-pink-500 rounded-full animate-ping opacity-75" />
  <div className="absolute inset-0 w-8 h-8 bg-pink-600 rounded-full -translate-x-1/2 -translate-y-1/2" />
</div>
```

If you see a pink circle in the middle of the screen, the orb CSS is working!

---

### Issue 2: Right-Click Menu Not Appearing

**Possible Causes:**
1. Context menu event being prevented by parent
2. TimelineContextMenu component not imported correctly
3. `contextMenu` state not being set
4. Z-index too low

**Quick Test:**
Add console.log to the handleContextMenu function:

```typescript
const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
  e.preventDefault();
  console.log('RIGHT CLICK DETECTED!', { x: e.clientX, y: e.clientY, hoveredDate });
  
  if (!timelineRef.current || !hoveredDate) {
    console.log('Missing:', { hasRef: !!timelineRef.current, hasDate: !!hoveredDate });
    return;
  }
  
  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    date: hoveredDate,
  });
  console.log('Context menu should show now!');
};
```

Check console when you right-click the timeline.

---

### Issue 3: Events Not Using Enhanced Styling

**Check if EnhancedCalendarEvent is being used:**

Search your CalendarView.tsx for `<EnhancedCalendarEvent`

If you see old `<button` tags instead, the events aren't using the new component!

**Quick Fix:**
Find this pattern in month/week/day views:
```typescript
<button onClick={() => ...} className="w-full text-left...">
```

Replace with:
```typescript
<EnhancedCalendarEvent
  event={{...}}
  onClick={() => ...}
/>
```

---

## 🚀 COMPLETE DIAGNOSTIC SCRIPT

Add this to the TOP of your LivingTimeline component (right after the state declarations):

```typescript
// 🐛 DEBUGGING - Remove after fixing
useEffect(() => {
  console.log('=== LIVING TIMELINE DEBUG ===');
  console.log('Events:', events.length);
  console.log('Pins:', pins.length);
  console.log('Mouse Position:', mousePosition);
  console.log('Hovered Date:', hoveredDate);
  console.log('Context Menu:', contextMenu);
  console.log('Has onCreateEvent:', !!onCreateEvent);
}, [mousePosition, hoveredDate, contextMenu, events, pins]);

// Add this to handleMouseMove
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  console.log('Mouse moving!', { x: e.clientX, y: e.clientY });
  // ... rest of function
};
```

---

## 🎯 STEP-BY-STEP FIX PROCEDURE

### Step 1: Verify Timeline Renders

1. Click the "Timeline" button
2. Should see timeline header with zoom controls
3. Check console for "LIVING TIMELINE DEBUG"

**If timeline doesn't show:** The `showTimeline` state isn't toggling.

---

### Step 2: Test Mouse Tracking

1. Move mouse over timeline area
2. Check console for "Mouse moving!" messages
3. If NO messages: Mouse events aren't being captured

**Fix:** Check that the timeline div has:
```typescript
onMouseMove={handleMouseMove}
onMouseLeave={handleMouseLeave}
onContextMenu={handleContextMenu}
```

---

### Step 3: Test Orb Rendering

1. With mouse over timeline, check console for `mousePosition` values
2. Should see: `{ x: 500, y: 300 }` or similar
3. If `null`: handleMouseMove isn't setting state

**Add debug to handleMouseMove:**
```typescript
setMousePosition({ x: e.clientX, y: e.clientY });
console.log('SET MOUSE POS:', { x: e.clientX, y: e.clientY });
```

---

### Step 4: Test Context Menu

1. Right-click timeline
2. Check console for "RIGHT CLICK DETECTED!"
3. Check if contextMenu state is set
4. Look for menu div in Elements tab (F12)

**If menu doesn't show but state is set:**
Z-index issue! The menu needs `z-50` or higher.

---

## 🔧 QUICK FIXES

### Fix 1: Orb Not Visible (Z-Index)

Change orb div from:
```typescript
className="fixed z-30 pointer-events-none"
```

To:
```typescript
className="fixed z-[9999] pointer-events-none"
```

### Fix 2: Menu Hidden Behind Elements

Change menu wrapper from:
```typescript
<div className="fixed z-50 ...">
```

To:
```typescript
<div className="fixed z-[10000] ...">
```

### Fix 3: Mouse Events Not Working

Make sure timeline container has:
```typescript
<div 
  ref={timelineRef}
  className="relative preserve-3d cursor-crosshair"
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
  onContextMenu={handleContextMenu}
  style={{ minHeight: '400px' }}
>
```

---

## 📊 Expected Console Output

When working correctly, you should see:

```
=== LIVING TIMELINE DEBUG ===
Events: 10
Pins: 0
Mouse Position: null
Hovered Date: null
Context Menu: null
Has onCreateEvent: true

(mouse enters timeline)
Mouse moving! {x: 450, y: 250}
SET MOUSE POS: {x: 450, y: 250}

(right-click)
RIGHT CLICK DETECTED! {x: 450, y: 250, hoveredDate: Mon Dec 04 2024...}
Context menu should show now!
```

---

## 🎨 CSS Animation Check

Open index.css and search for these:
- `@keyframes ping` ✅
- `@keyframes glow-pulse` ✅
- `@keyframes marker-pulse` ✅
- `@keyframes pop-in` ✅

If ANY are missing, the animations won't work!

---

## 🚨 EMERGENCY: Nothing Works?

If absolutely nothing works, try this minimal test:

1. Create a NEW test file: `TestOrb.tsx`

```typescript
import React, { useState } from 'react';

export const TestOrb = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div 
      className="w-full h-screen bg-gray-100"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      <h1 className="text-2xl p-4">Move mouse to see orb</h1>
      
      {/* Orb */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-12 h-12 bg-pink-500 rounded-full animate-ping opacity-75" />
        <div className="absolute inset-0 w-8 h-8 bg-pink-600 rounded-full" />
      </div>
    </div>
  );
};
```

2. Import and test in a simple page
3. If THIS works, the problem is in LivingTimeline integration

---

## 📞 NEED MORE HELP?

Let me know which step fails and I'll dig deeper!

Provide:
1. Console errors (if any)
2. Which step in diagnostic fails
3. Screenshot of what you see
