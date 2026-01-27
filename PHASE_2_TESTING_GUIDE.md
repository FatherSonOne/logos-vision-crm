# Phase 2: Priorities Feed - Testing Guide

## Quick Start Testing

### 1. Navigate to the Priorities Feed

**Option A: Using new route (recommended for testing)**
```
Navigate to: http://localhost:5176
Click on sidebar: Contacts → Click "Priorities" tab
```

**Option B: Direct URL**
```
You can also navigate directly by setting currentPage to 'contacts-new'
```

### 2. What You Should See

#### Initial Load
- Loading spinner (brief)
- Priorities feed header with count
- 5 filter chips with counts (All, Overdue, Today, This Week, High Value)
- Multiple action cards sorted by priority

#### Action Cards
Each card should display:
- Priority badge (high/medium/low/opportunity) with icon
- Contact name, company, donor stage
- Relationship score circle
- Trend indicator (rising/falling/stable/etc.)
- AI recommendation panel (blue background)
- Checklist with suggested actions
- Action buttons at bottom

---

## Detailed Testing Steps

### Test 1: Filter Functionality

1. **Click "All" filter**
   - Should show all 12 mock actions
   - Badge should highlight in blue
   - Count should show (12)

2. **Click "Overdue" filter**
   - Should show only overdue actions
   - Count badge updates
   - Emily Thompson should appear (birthday overdue)

3. **Click "Today" filter**
   - Should show actions due today
   - Michael Rodriguez and Thomas Brown should appear

4. **Click "This Week" filter**
   - Should show actions due within 7 days
   - Multiple actions should appear

5. **Click "High Value" filter**
   - Should show only high-value donors
   - Actions with "High Value" or "Very High Value" badges

### Test 2: Action Card Interactions

1. **Expand/Collapse**
   - Click the down arrow in top-right corner
   - Card should expand showing metadata
   - Click again to collapse

2. **Checkbox Interactions**
   - Check off action items in the checklist
   - Text should get strikethrough styling
   - Uncheck to remove strikethrough

3. **Complete Action**
   - Click "Mark Complete" button
   - Action should disappear from main feed
   - Should appear in "Completed Today" section at bottom

4. **View Profile**
   - Click profile icon button
   - Check console for log message with contact ID
   - (Full navigation will be implemented in Phase 3)

### Test 3: Visual Elements

1. **Priority Colors**
   - High Priority: Red badge and border
   - Medium Priority: Amber/yellow badge and border
   - Low Priority: Blue badge and border
   - Opportunity: Purple badge and border

2. **Overdue Indicator**
   - Emily Thompson (overdue birthday) should show red "Overdue" badge
   - Due date should be highlighted in red

3. **AI Recommendation Panel**
   - Should have blue background
   - Robot emoji icon
   - Clear reasoning text

4. **Metadata Section (when expanded)**
   - Last Contact: Shows relative time (e.g., "30 days ago")
   - Lifetime Giving: Formatted currency (e.g., "$125,000")
   - Sentiment: Percentage (e.g., "75% Positive")
   - Due Date: Formatted with relative time

### Test 4: Empty States

1. **Filter with no results**
   - Click "Today" filter
   - If no actions due today, should show:
     - Celebration emoji
     - "All Caught Up!" message
     - Button to "View All Actions"

2. **All actions completed**
   - Complete all visible actions
   - Should show success state

### Test 5: Completed Today Section

1. **Complete an action**
   - Click "Mark Complete" on any action
   - Section should appear at bottom
   - Shows green success styling
   - Displays count: "Completed Today (1)"

2. **Complete multiple actions**
   - Complete 3-4 actions
   - All should appear in completed section
   - Each shows contact name and reason
   - "View Profile" button available

### Test 6: Responsive Design

1. **Desktop (1920px+)**
   - Cards should be full width with max-width constraint
   - All buttons visible in single row
   - Optimal spacing and layout

2. **Tablet (768px-1200px)**
   - Cards adjust width
   - Buttons may wrap to 2 rows
   - Filters remain horizontal

3. **Mobile (320px-768px)**
   - Cards stack vertically
   - Buttons stack vertically
   - Filter chips scroll horizontally
   - Touch-friendly button sizes

### Test 7: Sorting Verification

Actions should appear in this order:

**High Priority (Red)**
1. Sarah Mitchell - Tomorrow
2. Robert Chen - 2 days
3. Michael Rodriguez - Today
4. Thomas Brown - Today

**Medium Priority (Amber)**
5. Jennifer Lopez - 5 days
6. Emily Thompson - Yesterday (overdue)
7. Amanda Foster - 1 week
8. Rachel Green - 6 days

**Low Priority (Blue)**
9. James Wilson - 10 days
10. Christopher Lee - 2 weeks

**Opportunity (Purple)**
11. David Kim - 3 days
12. Lisa Anderson - 4 days

---

## Expected Mock Data

### Contact Examples

#### High Priority
1. **Sarah Mitchell** - Major Donor, $125k lifetime
   - Score: 45 (falling)
   - Reason: Re-engage dormant donor (67 days)
   - Due: Tomorrow

2. **Robert Chen** - Major Donor, $250k lifetime
   - Score: 88 (rising)
   - Reason: Perfect timing for year-end giving
   - Due: 2 days

3. **Michael Rodriguez** - Major Donor, $500k lifetime
   - Score: 92 (rising)
   - Reason: Grant renewal deadline
   - Due: Today

4. **Thomas Brown** - Major Donor, $175k lifetime
   - Score: 82 (rising)
   - Reason: Anniversary of first gift
   - Due: Today

#### Opportunities
1. **David Kim** - New Prospect, $0 lifetime
   - Score: 15 (new)
   - Reason: High-potential prospect from event
   - Due: 3 days

2. **Lisa Anderson** - Prospect, $0 lifetime
   - Score: 25 (new)
   - Reason: Referred by existing major donor
   - Due: 4 days

---

## Console Logs to Watch For

### On Page Load
```
[Pulse Contact Service] Using mock data (API not configured)
[Pulse Contact Service] Loaded 12 recommended actions
```

### On Action Complete
```
Action completed: [Contact Name]
Action [action-id] marked as complete
```

### On Profile View
```
Navigate to contact profile: [contact-id]
```

---

## Common Issues & Solutions

### Issue: No actions showing
**Solution:** Check console for errors. Service should fall back to mock data automatically.

### Issue: Filters not working
**Solution:** Verify filter counts are showing. Check that due dates in mock data are relative to current date.

### Issue: Styling looks wrong
**Solution:** Ensure contacts.css is loaded. Check that Tailwind classes are processing correctly.

### Issue: Can't check off action items
**Solution:** Verify checkboxes have `.checkbox` class from contacts.css.

### Issue: Cards not expanding
**Solution:** Check React state updates in ActionCard component.

---

## Performance Checks

### Load Time
- Initial render: < 1 second
- Filter changes: < 100ms
- Action completion: Instant

### Memory Usage
- Should remain stable when filtering
- No memory leaks on repeated interactions

### Animations
- Smooth 60fps transitions
- No janky animations
- Respects prefers-reduced-motion

---

## Browser Testing

### Required Browsers
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### Feature Support
- CSS Grid (all modern browsers)
- Backdrop filter (all modern browsers)
- Flexbox (all browsers)
- Custom properties (all modern browsers)

---

## Accessibility Testing

### Keyboard Navigation
1. Tab through all interactive elements
2. Space/Enter activates buttons
3. Focus indicators clearly visible
4. Logical tab order

### Screen Reader Testing
1. VoiceOver (Mac): Action cards should be announced properly
2. NVDA (Windows): All labels and buttons readable
3. Action buttons have descriptive labels

### Color Contrast
- All text meets WCAG AA standards
- Priority colors have sufficient contrast
- Links and buttons clearly visible

---

## Success Criteria

✅ All 12 mock actions load successfully
✅ All 5 filters work correctly with accurate counts
✅ Actions sort by priority then due date
✅ Checkboxes toggle action item completion
✅ "Mark Complete" moves action to completed section
✅ Cards expand/collapse smoothly
✅ Responsive design works on all screen sizes
✅ No console errors (except expected mock data warnings)
✅ All animations smooth and performant
✅ Accessible via keyboard navigation
✅ Works in all major browsers

---

## Next Steps After Testing

1. **Report Issues:** Document any bugs or unexpected behavior
2. **User Feedback:** Gather feedback on UX and visual design
3. **Performance Metrics:** Monitor load times and interaction speeds
4. **Accessibility Audit:** Full WCAG 2.1 AA compliance check
5. **Phase 3 Planning:** Begin Contact Detail Story View development

---

**Testing Guide Version:** 1.0
**Last Updated:** January 25, 2026
**Status:** Ready for QA Testing
