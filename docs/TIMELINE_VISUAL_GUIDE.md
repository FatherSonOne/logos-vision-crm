# Living Timeline - Visual Design Guide

**Quick Reference**: Visual changes and design patterns implemented in the timeline redesign.

---

## Color Palette

### Primary Theme Colors
```
Pink/Rose Theme (Timeline Brand)
├── Primary: #ec4899 (pink-500)
├── Secondary: #f43f5e (rose-500)
├── Accent: #fb7185 (rose-400)
└── Dark: #be123c (rose-700)
```

### Event Priority Colors (Left Border)
```
Critical/Deadline  → Red      #ef4444 (red-500)
High/Meeting       → Orange   #f97316 (orange-500)
Medium/Project     → Amber    #f59e0b (amber-500)
Low/Note           → Slate    #64748b (slate-500)
Milestone          → Purple   #a855f7 (purple-500)
```

### Temporal States
```
Past Events   → 60% opacity (faded)
Present       → 100% opacity (bright)
Future        → 80% opacity (soft)
```

---

## Component Anatomy

### Event Card Structure
```
┌────────────────────────────────────┐
│ ┃ Event Title                   │  ← 4px colored left border
│ ┃ 🕐 2:00 PM - 3:00 PM          │  ← Clock icon + time
│ ┃ 📍 Conference Room A          │  ← MapPin icon + location
│ ┃                               │
│ ┃ [Description on hover]        │  ← Appears on hover
└────────────────────────────────────┘
     ↑ Soft tinted background
```

**CSS Classes**:
```tsx
className={`
  bg-blue-50 dark:bg-blue-900/20       // Soft background
  text-blue-900 dark:text-blue-100     // High contrast text
  border-l-4 border-blue-500           // Left accent border
  rounded-lg shadow-md                 // Rounded corners, shadow
  hover:shadow-xl hover:scale-105      // Lift on hover
  ring-2 ring-pink-400/50              // Ring when hovered
`}
```

---

### Pin Flag Design
```
    ┌─────────────┐
    │ 🚩 Pin Name │  ← Waving flag
    └─────────────┘
         │           ← Pin pole (gradient)
         │
         ●           ← Pin point
```

**Structure**:
- Flag: Gradient background, rounded-right with triangular cutout
- Pole: 0.5px wide, 16px height, purple gradient
- Point: Small dot at bottom
- Animation: Gentle wave (3s cycle)

**CSS Classes**:
```tsx
// Flag
className="bg-gradient-to-br from-purple-500 to-purple-600
           rounded-r-md shadow-lg px-3 py-1.5 pin-flag"

// Pole
className="w-0.5 h-16 bg-gradient-to-b from-purple-600 to-purple-800"
```

---

### Today Marker
```
        ●  NOW     ← Pulsing dot + label
        ║           ← 1px red line
        ║           ← Glowing shadow
        ║
        ║
        ║
```

**Implementation**:
```tsx
<div className="w-1 bg-rose-500 today-marker-line shadow-lg shadow-rose-500/50">
  <div className="w-6 h-6 bg-rose-500 rounded-full today-marker-dot">
    <div className="inset-1 bg-white rounded-full opacity-60" />
  </div>
  <div className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-md">
    NOW
  </div>
</div>
```

---

### Zoom Slider (Desktop)
```
[Hour]─●─[Day]─●─[Week]─●─[Month]─○─[Year]
                    ↑
              Active (pink, scaled)
```

**Visual States**:
- **Active**: Pink gradient, scale 110%, ring effect
- **Passed**: Pink tinted background
- **Future**: Gray background
- **Connector**: Pink if passed, gray if future

**CSS for Active**:
```tsx
className="bg-gradient-to-r from-pink-500 to-rose-600
           text-white shadow-lg scale-110
           ring-2 ring-pink-300"
```

---

### Context Menu Layout
```
┌──────────────────────────────────────┐
│  📅 Create at                        │  ← Gradient header
│     Dec 16, 2025, 2:00 PM        [×] │
├──────────────────────────────────────┤
│  🎯 Drop Pin Marker                  │
├─────── Quick Actions ────────────────┤  ← Visual separator
│  📁 Create Project                   │  ← Icon in circle
│  📋 Create Activity                  │
│  🎯 Schedule Meeting                 │
│  📞 Schedule Phone Call              │
│  🎉 Create Event                     │
│  🏆 Set Milestone                    │
│  ⏰ Set Deadline                     │
│  📄 Add Note/Reminder                │
│  ⚠️ Mark as Urgent                   │
├──────────────────────────────────────┤
│  Right-click anywhere to create      │  ← Footer hint
└──────────────────────────────────────┘
```

**Header Gradient**:
```tsx
className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600"
```

**Menu Item Pattern**:
```tsx
<div className="p-2 rounded-lg bg-current/10">
  <Icon className="w-4 h-4 text-blue-600" />
</div>
<span className="font-semibold text-sm">Label</span>
```

---

## Animation Timing

### Event Lifecycle
```
Load      →  Appear (0.4s ease-out)
Hover     →  Lift (0.2s ease)
Drag      →  Ghost (1s infinite pulse)
Drop      →  Settle (0.2s ease)
```

### Pin Lifecycle
```
Create    →  Drop (0.6s bounce, staggered)
Idle      →  Wave (3s infinite)
Hover     →  Scale (0.2s)
Remove    →  Fade (0.3s)
```

### Timeline Markers
```
Today     →  Pulse (2s infinite)
Grid      →  Subtle pulse (3s infinite)
Zoom      →  Transition (0.3s)
```

---

## Spacing System

### Event Cards
```
Padding:     p-2 (8px all sides)
Gap:         gap-2 (8px between elements)
Min Height:  Auto (content-driven)
Border:      4px left, 0 elsewhere
```

### Grid
```
Column Min:  96px
Column Gap:  1px borders
Row Height:  400px minimum
Header:      p-3 (12px padding)
```

### Pins
```
Flag:        px-3 py-1.5 (12px h, 6px v)
Pole Height: 16px (4rem)
Min Width:   80px
```

---

## Typography Scale

### Timeline Headers
```
Month/Year:  text-sm font-semibold
Day Labels:  text-sm font-semibold
Today Badge: text-xs font-bold
```

### Event Cards
```
Title:       text-sm font-semibold leading-tight
Time:        text-xs opacity-75
Location:    text-xs opacity-75
```

### Zoom Controls
```
Level Name:  text-xs font-bold uppercase tracking-wider
Active:      Same + pink text
```

### Context Menu
```
Header Date: text-sm font-bold
Menu Items:  text-sm font-semibold
Footer:      text-xs
```

---

## Shadow Hierarchy

### Depth Levels
```
Level 1 (Default):    shadow-md
Level 2 (Hover):      shadow-xl
Level 3 (Active):     shadow-2xl
Special (Glow):       shadow-lg shadow-{color}-500/50
```

### Usage
```
Event Cards:          shadow-md → shadow-xl (hover)
Pins:                 shadow-lg → shadow-xl (hover)
Context Menu:         shadow-2xl (always)
Today Marker:         shadow-lg shadow-rose-500/50 (glow)
Zoom Active:          shadow-lg
```

---

## Interaction States

### Buttons
```
Default   →  bg-gray-100 text-gray-700
Hover     →  bg-gray-200 scale-110
Active    →  bg-pink-500 text-white scale-110 ring-2
Disabled  →  opacity-30 cursor-not-allowed
```

### Event Cards
```
Default   →  shadow-md opacity-[60|80|100]
Hover     →  shadow-xl scale-105 ring-2 ring-pink-400/50
Dragging  →  opacity-50 scale-105 z-50 cursor-grabbing
```

### Grid Cells
```
Default   →  border-gray-300/40
Today     →  border-rose-300/60 bg-rose-50/10
Hover     →  bg-gray-50/30
```

---

## Responsive Breakpoints

### Mobile (< 768px)
```
- Full screen timeline
- Native select for zoom
- Simplified event metadata (hide location)
- Larger touch targets (min 44px)
- Single column grid when very narrow
```

### Tablet (768px - 1023px)
```
- 90% width timeline
- Full zoom slider visible
- Condensed event cards
- All metadata shown
```

### Desktop (≥ 1024px)
```
- Full width timeline
- Visual zoom slider
- Complete event details
- Hover states active
- Optimized for mouse
```

---

## Dark Mode Adaptations

### Background Adjustments
```
Light:  bg-blue-50
Dark:   bg-blue-900/20     (20% opacity for subtlety)
```

### Border Adjustments
```
Light:  border-gray-200
Dark:   border-gray-700    (darker for contrast)
```

### Text Adjustments
```
Light:  text-blue-900
Dark:   text-blue-100      (near white for readability)
```

### Shadow Adjustments
```
Light:  shadow-md (subtle)
Dark:   shadow-xl (more prominent)
```

---

## Accessibility Features

### Keyboard Navigation
```
Tab         →  Move between interactive elements
Enter/Space →  Activate button or link
Escape      →  Close context menu
Arrow Keys  →  (Future: Navigate timeline)
```

### ARIA Labels
```
Zoom Select:    aria-label="Zoom level"
Close Button:   aria-label="Close menu"
Today Button:   Disabled when viewing today
All Buttons:    type="button" attribute
```

### Focus Indicators
```
Default browser focus visible
Enhanced with ring-2 ring-offset-2
Minimum 2px outline
High contrast in dark mode
```

### Color Contrast
```
Event Text:     4.5:1 minimum (WCAG AA)
Button Text:    4.5:1 minimum
Border:         3:1 minimum (non-text)
Today Marker:   High visibility red
```

---

## Performance Optimizations

### GPU Acceleration
```
All animations use:
  - transform (not top/left)
  - opacity (not visibility)
  - No layout-triggering properties
```

### Animation Frame Budget
```
Transform:   0.2ms per frame
Opacity:     0.1ms per frame
Shadow:      0.5ms per frame
Total:       < 16ms (60fps)
```

### CSS vs JavaScript
```
✅ CSS animations (GPU accelerated)
❌ JavaScript animations (avoided)
✅ RequestAnimationFrame (for tracking)
✅ Memoization (expensive calculations)
```

---

## Browser Support Matrix

### Full Support
```
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Safari 14+
✅ Chrome Android 90+
```

### Fallback Behavior
```
Older browsers:
  - Animations degrade gracefully
  - Gradients fallback to solid
  - Shadows simplified
  - Functionality preserved
```

---

## Component Import

### Required Imports
```tsx
import { LivingTimeline } from './components/calendar/LivingTimeline';
import './components/calendar/TimelineAnimations.css';
```

### Usage Example
```tsx
<LivingTimeline
  events={calendarEvents}
  pins={userPins}
  onAddPin={handleAddPin}
  onRemovePin={handleRemovePin}
  viewDate={currentDate}
  zoom={zoomLevel}
  onZoomChange={handleZoomChange}
  onDateChange={handleDateChange}
  onCreateEvent={handleCreateEvent}
  onEventClick={handleEventClick}
  onEventDrag={handleEventDrag}
/>
```

---

## Quick Customization

### Change Theme Color
Replace all instances of:
```
pink-500  →  your-color-500
rose-500  →  your-color-600
rose-600  →  your-color-700
```

### Adjust Animation Speed
```css
/* TimelineAnimations.css */
pulse-today: 2s → 1.5s (faster)
event-lift: 0.2s → 0.3s (slower)
```

### Modify Event Opacity
```tsx
// LivingTimeline.tsx
Past:    opacity-60 → opacity-50 (more faded)
Future:  opacity-80 → opacity-90 (brighter)
```

---

## Common Patterns

### Adding New Event Type
1. Add to `eventBgColors` object
2. Add to `textColors` object
3. Add to `getPriorityBorderColor()`
4. Add icon to context menu

### Creating Custom Animation
1. Add keyframes to `TimelineAnimations.css`
2. Add utility class
3. Apply to component with `className`
4. Test across browsers

### Adjusting Spacing
1. Use Tailwind spacing scale (p-2, m-4, gap-3)
2. Keep consistent with design system
3. Test on mobile for touch targets
4. Ensure minimum 44px for touch

---

**Visual Guide**: Frontend Developer Agent
**Last Updated**: January 16, 2026
**Version**: 1.0
**Status**: Production Ready ✅
