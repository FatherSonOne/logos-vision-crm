# Light Mode Verification Checklist

## Quick Visual Verification Guide

Use this checklist to verify light mode implementation is working correctly.

---

## 🔍 How to Test

### Switch to Light Mode
**On Windows:**
1. Settings → Personalization → Colors
2. Choose "Light" under "Choose your default app mode"

**On macOS:**
1. System Preferences → General
2. Select "Light" under Appearance

**On Browser DevTools:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Click ⋮ menu → More tools → Rendering
4. Find "Emulate CSS media feature prefers-color-scheme"
5. Select "prefers-color-scheme: light"

---

## ✅ Visual Verification Checklist

### ContactsPage (Main View)

#### Background & Layout
- [ ] Page background is light gradient (gray-50 → blue-50 → purple-50)
- [ ] Page title "Contacts" is dark gray/black
- [ ] Search bar has white background
- [ ] "Add Contact" button is blue with good contrast

#### Tab Navigation
- [ ] Active tab (e.g., "All Contacts") is blue with light badge
- [ ] Inactive tabs are gray with lighter text
- [ ] Tab border bottom is light gray
- [ ] Count badges are readable

#### Empty State (if visible)
- [ ] Empty state card has light blue/purple gradient
- [ ] Card has visible shadow
- [ ] Text is dark and readable
- [ ] Border is light blue

---

### ContactCard (Gallery View)

#### Card Appearance
- [ ] Cards have white/off-white background
- [ ] Cards have subtle shadow (not dark!)
- [ ] Card borders show relationship color (green/blue/amber/orange/red)
- [ ] Hover effect adds more shadow

#### Card Content
- [ ] Contact name is dark gray/black
- [ ] Job title is medium gray
- [ ] Company name is blue (clickable link style)
- [ ] "Last contact" text is readable gray
- [ ] Donor stage badge is colored appropriately

#### Relationship Score Circle
- [ ] Background circle is light gray (not dark!)
- [ ] Progress circle shows relationship color
- [ ] Score number is dark and bold
- [ ] Score label (Strong/Good/etc.) is readable

#### Trend Indicator
- [ ] Badge has light colored background
- [ ] Icon is visible
- [ ] Text is dark and readable
- [ ] Rising = green, Stable = blue, Falling = orange, etc.

---

### ContactStoryView (Detail View)

#### Header Section
- [ ] "Back to Contacts" link is blue
- [ ] Contact name is large and dark
- [ ] Job title and company are readable
- [ ] Contact details (email/phone) are gray with blue hover

#### Contact Header Card
- [ ] Card has white background with shadow
- [ ] Avatar border is light gray
- [ ] All text is readable
- [ ] Edit/Archive buttons have proper contrast

#### AI Insights Panel (Blue/Purple Gradient)
- [ ] Panel has light blue/purple gradient background
- [ ] Panel has subtle shadow
- [ ] Border is light blue
- [ ] "What You Need to Know" heading is dark
- [ ] Talking points checkmarks are green
- [ ] AI recommendation text is readable

#### Communication Profile Card
- [ ] Card has white background
- [ ] Section heading is dark
- [ ] Labels are medium gray
- [ ] Values are dark/bold
- [ ] Topic badges are properly colored

#### Donor Profile Card
- [ ] Card has white background
- [ ] Grid layout is clear
- [ ] Lifetime giving amount stands out
- [ ] Stage badge is colored correctly

#### Recent Activity Card
- [ ] Card has white background
- [ ] Activity items are readable
- [ ] Timestamps are gray
- [ ] "View All" button has contrast

#### Quick Actions Bar (Bottom)
- [ ] Bar has white background
- [ ] Border is visible
- [ ] Shadow is prominent
- [ ] All buttons are readable

---

### PrioritiesFeedView (Priorities Tab)

#### Header
- [ ] "Your Priorities" heading is dark
- [ ] Description text is readable gray
- [ ] Error message (if any) has light amber background

#### Filter Chips
- [ ] Active filter is blue with white text
- [ ] Inactive filters are light gray
- [ ] Count numbers are visible
- [ ] Hover effect works

#### Empty State (if no priorities)
- [ ] Card has light gradient
- [ ] Shadow is visible
- [ ] "All Caught Up!" is dark
- [ ] Message text is readable

#### Action Cards
- [ ] Cards have white background
- [ ] Cards have shadows
- [ ] Priority badges are colored (red/amber/blue/purple)
- [ ] Contact names are dark
- [ ] Company info is readable

#### AI Recommendation Panel (in action card)
- [ ] Panel has light blue background
- [ ] Robot icon is visible
- [ ] "AI Recommendation" heading is blue
- [ ] Recommendation text is dark

#### Checkboxes
- [ ] Checkboxes have light border
- [ ] Checked state is blue
- [ ] Labels are dark gray
- [ ] Strikethrough works when checked

#### Metadata Section (when expanded)
- [ ] Divider line is visible
- [ ] Labels are gray
- [ ] Values are dark
- [ ] Lifetime Giving is green
- [ ] Overdue dates are red (if applicable)

---

### ActionCard (Individual Priority)

#### Card Border
- [ ] Border color matches priority (red/amber/blue/purple)
- [ ] Border is visible in light mode

#### Priority Badge
- [ ] High = light red background with dark red text
- [ ] Medium = light amber background with dark amber text
- [ ] Low = light blue background with dark blue text
- [ ] Opportunity = light purple background with dark purple text

#### Contact Info
- [ ] Relationship score circle has light background circle
- [ ] Contact name is dark
- [ ] Trend indicator has light colored badge
- [ ] Company name is readable

#### Suggested Actions
- [ ] Action items are dark text
- [ ] Hover makes text darker
- [ ] Checked items have strikethrough

#### Buttons
- [ ] "Mark Complete" button is green
- [ ] "Draft Email" button is gray (light mode)
- [ ] Calendar/Profile buttons are visible
- [ ] All have proper hover states

#### Value Indicator
- [ ] Badge has light background (green for high value, gray for standard)
- [ ] Text is dark and readable

---

### Completed Today Section

- [ ] Section has light green background
- [ ] Border is green
- [ ] Checkmark icon is visible
- [ ] Contact names are dark
- [ ] "View Profile" button has contrast

---

### Help Text Panel

- [ ] Panel has light blue background
- [ ] Info icon is blue
- [ ] "Pro Tip" text is bold blue
- [ ] Message text is dark

---

## 🎨 Color Verification

### Backgrounds Should Be:
- **Light gray/white**: Most cards and panels
- **Light blue/purple**: Accent panels (AI insights, info boxes)
- **Light green**: Success/completed items
- **Light amber**: Warning messages
- **Light red**: Error messages

### Text Should Be:
- **Dark gray/black**: Headings, primary text
- **Medium gray**: Labels, secondary text
- **Blue**: Links and active states
- **Relationship colors**: Green/blue/amber/orange/red (unchanged from dark mode)

### Should NOT See:
- ❌ Dark backgrounds (gray-800, gray-900)
- ❌ White text on light backgrounds
- ❌ Invisible borders
- ❌ Missing shadows on cards
- ❌ Unreadable gray-on-gray text

---

## 🔧 Common Issues

### If text is hard to read:
- Verify `dark:` classes are properly applied
- Check that `text-gray-900 dark:text-white` pattern is used

### If cards disappear into background:
- Verify shadows are present: `shadow-md dark:shadow-none`
- Check borders: `border-gray-200 dark:border-gray-700`

### If colors look wrong:
- Ensure relationship colors (green/blue/amber/orange/red) are unchanged
- Verify badge backgrounds have light mode variants

---

## 📊 Accessibility Quick Check

### Contrast Ratios (Use browser DevTools)
1. Right-click on text → Inspect
2. Check contrast ratio in computed styles
3. Should be **4.5:1 minimum** for normal text
4. Should be **3:1 minimum** for large text (18px+)

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus ring is clearly visible (blue)
- [ ] Can activate buttons with Enter/Space
- [ ] Can navigate tabs with arrow keys

---

## ✅ Sign-Off

Once all items are verified, light mode is working correctly!

**Verified By**: _______________
**Date**: _______________
**Notes**: _______________

---

**Quick Tip**: Take screenshots of both light and dark modes to compare and ensure consistency!
