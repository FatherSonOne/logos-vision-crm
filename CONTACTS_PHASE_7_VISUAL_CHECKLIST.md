# Contacts Phase 7: Visual Polish Checklist

**Quick Reference Guide for QA Testing**

---

## Animation Checklist

### Page Transitions
- [ ] Navigate to Contacts page - should fade in with scale effect (400ms)
- [ ] Switch between tabs - content should transition smoothly
- [ ] Open contact detail view - should animate in

### Card Gallery Animations
- [ ] Load contacts page - cards should appear in staggered sequence (50ms delay each)
- [ ] Hover over card - should scale to 105% and elevate shadow
- [ ] Click card - should activate without lag
- [ ] Hover state should reveal Email/Call buttons smoothly

### Button Animations
- [ ] Hover button - should scale to 105%
- [ ] Click button - should scale to 95% then return
- [ ] Button should show subtle ripple effect on click
- [ ] Focus via keyboard - should show blue ring with 2px offset

---

## Loading States

### Contact Gallery Loading
- [ ] 8 skeleton cards should appear in grid layout
- [ ] Each skeleton should have shimmer animation moving left to right
- [ ] Skeletons should match actual card dimensions
- [ ] Cards should fade in with 50ms stagger delay
- [ ] Dark mode: Skeletons should be dark gray with lighter shimmer

### Priorities Feed Loading
- [ ] 3 skeleton action cards should appear
- [ ] Each with 100ms stagger delay
- [ ] Shimmer animation should be smooth
- [ ] Should match actual action card layout

---

## Empty States

### Contact Gallery - No Results
**Visual Elements:**
- [ ] Blue-to-purple gradient background
- [ ] 🔍 Search icon with smooth bounce animation (2s cycle)
- [ ] Large title: "No Contacts Found"
- [ ] Descriptive text explaining situation
- [ ] Two buttons: "Clear Filters" (secondary), "Add Contact" (primary)
- [ ] Glass morphism effect with backdrop blur
- [ ] Rounded corners (rounded-2xl)
- [ ] Border with blue tint

**Dark Mode:**
- [ ] Darker gradient (blue-900/20 to purple-900/20)
- [ ] Blue glow on border and shadow
- [ ] Text remains readable

### Priorities Feed - All Caught Up
**Visual Elements:**
- [ ] Same gradient background as above
- [ ] 🎉 Party icon with smooth bounce
- [ ] Title: "All Caught Up!"
- [ ] Positive reinforcement message
- [ ] Single "View All Actions" button (if filtered)

### Priorities Feed - No Filter Results
- [ ] 🔍 Search icon (same as contact gallery)
- [ ] Title: "No Actions Found"
- [ ] Filter-specific message
- [ ] Button to clear filter

---

## Error States

### Contact Gallery Error
**Visual Elements:**
- [ ] Red-to-orange gradient background
- [ ] ⚠️ Warning icon
- [ ] Title: "Unable to Load Contacts"
- [ ] User-friendly error message
- [ ] Two buttons: "Try Again" (primary), "Go to Dashboard" (secondary)
- [ ] Red border with red shadow glow

**Dark Mode:**
- [ ] Darker red gradient
- [ ] Red glow effect on border/shadow
- [ ] Text remains readable

**Functionality:**
- [ ] "Try Again" button should reload page
- [ ] "Go to Dashboard" button should navigate to /
- [ ] Error message should be dynamic based on error type

### Priorities Feed Warning
- [ ] Yellow/amber banner at top
- [ ] Warning icon (🔔 or ⚠️)
- [ ] Non-blocking (shows warning but displays mock data)
- [ ] Does not prevent use of component

---

## Micro-interactions

### Button Feedback
- [ ] **Hover:** Scale 105%, color darkens slightly
- [ ] **Active (clicking):** Scale 95%, shows ripple effect
- [ ] **Focus (keyboard):** 2px blue ring with 2px offset
- [ ] **Disabled:** 50% opacity, cursor not-allowed

### Card Interactions
- [ ] **Hover:** Scale 105%, shadow elevates from md to xl
- [ ] **Hover:** Quick action buttons fade in (opacity 0 → 100)
- [ ] **Click:** Card activates without delay
- [ ] **Focus within:** Blue ring appears when buttons focused

### Input Interactions
- [ ] **Search Input Focus:** Border changes to blue, ring appears
- [ ] **Search Input with Text:** Clear (X) button appears on right
- [ ] **Clear Button Hover:** Icon color shifts slightly
- [ ] **Clear Button Click:** Clears text instantly

### Checkbox Interactions
- [ ] **Hover:** Background color shifts slightly
- [ ] **Check animation:** Smooth fill with blue color
- [ ] **Focus:** Blue ring appears
- [ ] **Checked items:** Text gets line-through and gray color

---

## Accessibility Testing

### Keyboard Navigation
**Tab Order:**
1. [ ] Search input
2. [ ] Filters button
3. [ ] Add Contact button
4. [ ] Priorities tab
5. [ ] All Contacts tab
6. [ ] Recent Activity tab
7. [ ] First contact card / action card
8. [ ] Subsequent cards in reading order

**Keyboard Shortcuts:**
- [ ] **Tab:** Move forward through elements
- [ ] **Shift + Tab:** Move backward
- [ ] **Enter/Space:** Activate buttons and cards
- [ ] **Escape:** Close modals (if detail view open)

### Focus Indicators
- [ ] All focusable elements show blue 2px ring on keyboard focus
- [ ] Ring has 2px offset from element
- [ ] Ring is NOT visible on mouse click (focus-visible)
- [ ] Ring works in both light and dark modes

### Screen Reader Testing
**Contact Card:**
- [ ] Reads: "Button, View profile for [Name]"
- [ ] Reads contact name, company, donor stage
- [ ] Reads Email/Call button labels

**Search Input:**
- [ ] Reads: "Search, Search contacts by name, email, or company"
- [ ] Announces when text is entered
- [ ] Announces when cleared

**Buttons:**
- [ ] All buttons have clear purpose read
- [ ] Icon-only buttons have ARIA labels
- [ ] Disabled buttons announce disabled state

### Color Contrast
**Light Mode:**
- [ ] Primary text (gray-900 on white): 15.5:1 ✅
- [ ] Secondary text (gray-600 on white): 7.3:1 ✅
- [ ] Button text (white on blue-500): 4.6:1 ✅

**Dark Mode:**
- [ ] Primary text (white on gray-900): 15.5:1 ✅
- [ ] Secondary text (gray-400 on gray-900): 5.7:1 ✅
- [ ] Button text (white on blue-500): 4.6:1 ✅

---

## Responsive Design

### Mobile (320px - 767px)
- [ ] 1 column card layout
- [ ] Touch targets minimum 44x44px
- [ ] Quick action buttons are tappable
- [ ] No horizontal scroll
- [ ] Empty states fit within viewport

### Tablet (768px - 1023px)
- [ ] 2 column card layout
- [ ] Adequate spacing between cards
- [ ] All interactions work on touch
- [ ] Search bar appropriately sized

### Desktop (1024px - 1279px)
- [ ] 3 column card layout
- [ ] Hover states work properly
- [ ] Focus states visible on keyboard nav
- [ ] Search bar on right side of header

### Large Desktop (1280px+)
- [ ] 4 column card layout
- [ ] Cards maintain aspect ratio
- [ ] No excessive whitespace
- [ ] All interactions remain functional

---

## Theme Testing

### Light Mode
- [ ] Background: Light gradient (gray-50 to blue-50 to purple-50)
- [ ] Cards: White background with gray borders
- [ ] Text: Dark gray on light backgrounds
- [ ] Shadows: Visible and appropriate
- [ ] Empty states: Blue/purple gradient
- [ ] Error states: Red/orange gradient

### Dark Mode
- [ ] Background: Dark gradient (gray-900 to blue-900 to purple-900)
- [ ] Cards: Dark gray/800 background with lighter borders
- [ ] Text: White/light gray on dark backgrounds
- [ ] Shadows: Subtle or colored glows
- [ ] Empty states: Dark blue/purple with glow
- [ ] Error states: Dark red/orange with glow

### High Contrast Mode
- [ ] Badges have 2px borders (increased from 1px)
- [ ] Buttons have 2px borders (increased from 1px)
- [ ] Cards have 4px borders (increased from 2px)
- [ ] All text remains readable
- [ ] Focus indicators remain visible

### Reduced Motion
- [ ] All animations reduced to 0.01ms
- [ ] Page remains functional without animations
- [ ] No vestibular motion sickness triggers
- [ ] Layout shifts minimized

---

## Browser Compatibility

### Chrome/Edge (Chromium)
- [ ] All animations smooth at 60 FPS
- [ ] Backdrop blur works
- [ ] Focus-visible works correctly
- [ ] Gradients render properly
- [ ] Shadows display correctly

### Firefox
- [ ] All animations smooth
- [ ] Backdrop blur works
- [ ] Focus-visible works
- [ ] CSS Grid layout correct
- [ ] Custom scrollbar styles work

### Safari (macOS/iOS)
- [ ] All animations smooth (webkit prefix if needed)
- [ ] Backdrop blur works
- [ ] Touch targets appropriate size
- [ ] Scroll behavior smooth
- [ ] Gradients render correctly

---

## Performance Testing

### Animation Performance
- [ ] 60 FPS maintained during page transition
- [ ] 60 FPS maintained during card hover
- [ ] 60 FPS maintained during staggered card load
- [ ] No layout shift during animations
- [ ] GPU acceleration confirmed (check DevTools Performance)

### Loading Performance
- [ ] Skeleton cards render in <100ms
- [ ] Shimmer animation starts immediately
- [ ] No jank when switching to real content
- [ ] Memory usage remains stable

### Interaction Performance
- [ ] Button click responds in <16ms
- [ ] Card click responds in <16ms
- [ ] Hover states apply in <16ms
- [ ] Search input responsive with no lag

---

## Edge Cases

### Empty States
- [ ] Shows when 0 contacts match filters
- [ ] Shows appropriate message based on context
- [ ] CTAs are functional and appropriate
- [ ] Works in both light and dark mode

### Error States
- [ ] Shows when API fails
- [ ] Error message is user-friendly (not technical)
- [ ] Retry button works correctly
- [ ] Dashboard button navigates correctly
- [ ] Works in both light and dark mode

### Loading States
- [ ] Shows immediately when loading starts
- [ ] Matches layout of real content
- [ ] Shimmer animation doesn't cause performance issues
- [ ] Transitions smoothly to real content

### Disabled States
- [ ] Disabled buttons show 50% opacity
- [ ] Disabled buttons show not-allowed cursor
- [ ] Disabled buttons don't respond to clicks
- [ ] Disabled state is announced to screen readers

---

## Sign-Off Checklist

### Visual Design
- [ ] All animations smooth and professional
- [ ] Empty states are polished and helpful
- [ ] Error states are user-friendly and actionable
- [ ] Loading states match content layout
- [ ] Micro-interactions feel responsive
- [ ] Color palette consistent across components

### Accessibility
- [ ] Lighthouse accessibility score: 100/100
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces all content
- [ ] Focus indicators always visible (keyboard)
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets meet 44px minimum

### Performance
- [ ] 60 FPS maintained during all animations
- [ ] No console errors or warnings
- [ ] Bundle size increase acceptable (<5KB gzipped)
- [ ] Memory usage stable
- [ ] No layout shift during transitions

### Functionality
- [ ] All buttons work as expected
- [ ] Error retry functionality works
- [ ] Empty state CTAs are functional
- [ ] Search clear button works
- [ ] Card interactions work correctly

### Cross-browser
- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile browsers tested (iOS Safari, Chrome Mobile)

### Responsive
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] Works on large desktop (1280px+)

---

## Final Approval

**Phase 7 Polish Complete:** [ ]

**Signed Off By:** ___________________________

**Date:** ___________________________

**Notes:**
