# 🔧 COORDINATE OFFSET FIX

## Problem: 2.5" down, 4" right offset

This means ~240px down, ~384px right offset at standard DPI.

## 🎯 Possible Causes:

### 1. **Browser Zoom** (Most Likely!)
If browser zoom is NOT 100%, coordinates get messed up!

**FIX:** Press `Ctrl + 0` to reset browser zoom to 100%

### 2. **Page has margins/padding**
The main app container might have offset

### 3. **Coordinate calculation issue**
Using wrong reference point

---

## ✅ IMMEDIATE FIX - Test Browser Zoom

1. Press `Ctrl + 0` (zero) to reset zoom
2. Hard refresh: `Ctrl + Shift + R`
3. Test orb - is it centered now?

---

## 🔍 If Still Offset - Add Debug

Add this to `LivingTimeline.tsx` at line 118 (in handleMouseMove):

```typescript
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!timelineRef.current) return;

  // DEBUG COORDINATES
  console.log('📍 COORDS:', {
    'cursor on screen': { x: e.clientX, y: e.clientY },
    'page scroll': { x: window.pageXOffset, y: window.pageYOffset },
    'window size': { w: window.innerWidth, h: window.innerHeight },
    'browser zoom': window.devicePixelRatio
  });

  const rect = timelineRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  console.log('📦 TIMELINE:', {
    'container position': { left: rect.left, top: rect.top },
    'container size': { width: rect.width, height: rect.height },
    'relative mouse': { x, y }
  });

  // ... rest of function
```

Move mouse and check console - look for:
- `browser zoom` - should be `1` (if not, that's the problem!)
- `container position` - should be near `{left: 0, top: X}` where X is header height

---

## 🎯 Manual Offset Correction

If zoom is 100% and still offset, manually correct:

### For ORB - in LivingTimeline.tsx (line 375):

Change:
```typescript
style={{
  left: `${mousePosition.x}px`,
  top: `${mousePosition.y}px`,
  transform: 'translate(-50%, -50%)',
}}
```

To:
```typescript
style={{
  left: `${mousePosition.x - 384}px`,  // Subtract X offset
  top: `${mousePosition.y - 240}px`,   // Subtract Y offset
  transform: 'translate(-50%, -50%)',
}}
```

### For MENU - in TimelineContextMenu.tsx (line 165):

Change:
```typescript
style={{
  left: `${adjustedX}px`,
  top: `${adjustedY}px`,
```

To:
```typescript
style={{
  left: `${adjustedX - 384}px`,  // Subtract X offset
  top: `${adjustedY - 240}px`,   // Subtract Y offset
```

---

## 🔬 Advanced Debug - Check Transforms

Add to LivingTimeline render (line 185):

```typescript
useEffect(() => {
  if (timelineRef.current) {
    const rect = timelineRef.current.getBoundingClientRect();
    const computed = window.getComputedStyle(timelineRef.current);
    console.log('🎨 TIMELINE COMPUTED STYLES:', {
      position: computed.position,
      transform: computed.transform,
      top: computed.top,
      left: computed.left,
      rect: { top: rect.top, left: rect.left }
    });
  }
}, []);
```

This shows if timeline has unexpected transforms!

---

## 🚀 QUICKEST TEST

Create this test file: `src/components/CursorTest.tsx`

```typescript
import React, { useState } from 'react';

export const CursorTest = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[99999]"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onClick={() => console.log('CLICKED AT:', pos)}
    >
      <div className="text-white text-2xl p-4">
        CURSOR TEST - Move mouse
        <div className="text-sm mt-2">X: {pos.x} Y: {pos.y}</div>
        <div className="text-sm">Zoom: {window.devicePixelRatio}</div>
      </div>

      {/* Crosshair at cursor */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-0.5 h-8 bg-red-500 absolute -translate-x-1/2 -translate-y-1/2" />
        <div className="h-0.5 w-8 bg-red-500 absolute -translate-x-1/2 -translate-y-1/2" />
        <div className="w-4 h-4 border-2 border-red-500 rounded-full absolute -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};
```

In `App.tsx` add temporarily:
```typescript
import { CursorTest } from './components/CursorTest';
// In render: <CursorTest />
```

If the crosshair is PERFECT, the problem is in LivingTimeline!
If the crosshair is OFFSET, the problem is browser/system!

---

## 📊 Report Back:

1. What's the browser zoom level? (Check top-right of browser)
2. What does console show for `devicePixelRatio`?
3. Does CursorTest show crosshair perfectly centered?
4. What's the `container position` from debug logs?

This will tell me EXACTLY what's wrong!
