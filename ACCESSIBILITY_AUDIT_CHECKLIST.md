# Accessibility Audit Checklist - Contacts Redesign

**Audit Date:** January 26, 2026
**Current Compliance:** 78% WCAG 2.1 AA
**Target Compliance:** 95%+ WCAG 2.1 AA

---

## 🔴 CRITICAL ISSUES (9) - BLOCKS RELEASE

### Keyboard Navigation

- [ ] **1.1** ContactCard: Convert div to button or add keyboard handlers
  - **File:** `src/components/contacts/ContactCard.tsx` Line 42
  - **Time:** 30 min
  - **WCAG:** 2.1.1 Keyboard (Level A)

- [ ] **1.2** ContactFilters: Add Escape key handler to close dropdown
  - **File:** `src/components/contacts/ContactFilters.tsx` Lines 40-121
  - **Time:** 20 min
  - **WCAG:** 2.1.2 No Keyboard Trap (Level A)

- [ ] **1.3** ContactCard: Add visible focus indicator (ring-4)
  - **File:** `src/components/contacts/ContactCard.tsx` Line 51
  - **Time:** 5 min
  - **WCAG:** 2.4.7 Focus Visible (Level AA)

### Semantic HTML & Landmarks

- [ ] **2.1** ContactsPage: Change root div to `<main>` landmark
  - **File:** `src/components/contacts/ContactsPage.tsx` Line 294
  - **Time:** 2 min
  - **WCAG:** 2.4.1 Bypass Blocks (Level A)

- [ ] **2.2** ContactStoryView: Add h1 heading or convert h2 to h1
  - **File:** `src/components/contacts/ContactStoryView.tsx` Line 190
  - **Time:** 5 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

### ARIA Attributes

- [ ] **3.1** ContactFilters button: Add aria-expanded, aria-haspopup, aria-controls
  - **File:** `src/components/contacts/ContactFilters.tsx` Line 28
  - **Time:** 5 min
  - **WCAG:** 4.1.2 Name, Role, Value (Level A)

- [ ] **3.2** RelationshipScoreCircle: Add role="img" and descriptive aria-label
  - **File:** `src/components/contacts/RelationshipScoreCircle.tsx` Line 25
  - **Time:** 10 min
  - **WCAG:** 1.1.1 Non-text Content (Level A)

- [ ] **3.3** ContactStoryView quick actions: Add aria-labels with contact name
  - **File:** `src/components/contacts/ContactStoryView.tsx` Lines 415-429
  - **Time:** 10 min
  - **WCAG:** 4.1.2 Name, Role, Value (Level A)

### Non-text Content

- [ ] **4.1** All emoji icons: Add aria-hidden="true" (or aria-labels if meaningful)
  - **Files:** ContactCard, ContactStoryView, ActionCard, PrioritiesFeedView
  - **Time:** 30 min
  - **WCAG:** 1.1.1 Non-text Content (Level A)

**Critical Issues Total Time: ~2 hours**

---

## 🟠 HIGH PRIORITY ISSUES (12) - FIX BEFORE RELEASE

### Dynamic Content Announcements

- [ ] **5.1** ContactsPage LoadingState: Add role="status" aria-live="polite"
  - **File:** `src/components/contacts/ContactsPage.tsx` Line 420
  - **Time:** 5 min
  - **WCAG:** 4.1.3 Status Messages (Level AA)

- [ ] **5.2** ContactsPage ErrorState: Add role="alert" aria-live="assertive"
  - **File:** `src/components/contacts/ContactsPage.tsx` Line 443
  - **Time:** 5 min
  - **WCAG:** 4.1.3 Status Messages (Level AA)

- [ ] **5.3** ContactsPage: Add aria-live region for filter result count
  - **File:** `src/components/contacts/ContactsPage.tsx` After Line 322
  - **Time:** 10 min
  - **WCAG:** 4.1.3 Status Messages (Level AA)

- [ ] **5.4** ContactStoryView: Add role="status" to interactions loading state
  - **File:** `src/components/contacts/ContactStoryView.tsx` Line 398
  - **Time:** 5 min
  - **WCAG:** 4.1.3 Status Messages (Level AA)

- [ ] **5.5** PrioritiesFeedView: Add role="alert" to error message
  - **File:** `src/components/contacts/PrioritiesFeedView.tsx` Line 214
  - **Time:** 5 min
  - **WCAG:** 4.1.3 Status Messages (Level AA)

### Form Labels & Associations

- [ ] **6.1** ContactFilters: Add id/htmlFor to Relationship Score select
  - **File:** `src/components/contacts/ContactFilters.tsx` Lines 44-57
  - **Time:** 5 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

- [ ] **6.2** ContactFilters: Add id/htmlFor to Trend select
  - **File:** `src/components/contacts/ContactFilters.tsx` Lines 62-77
  - **Time:** 5 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

- [ ] **6.3** ContactFilters: Add id/htmlFor to Donor Stage select
  - **File:** `src/components/contacts/ContactFilters.tsx` Lines 81-95
  - **Time:** 5 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

### Semantic Structure

- [ ] **7.1** ContactCardGallery: Convert grid div to semantic ul/li list
  - **File:** `src/components/contacts/ContactCardGallery.tsx` Line 72
  - **Time:** 15 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

- [ ] **7.2** ContactStoryView AI insights: Convert talking points to ul/li
  - **File:** `src/components/contacts/ContactStoryView.tsx` Line 258
  - **Time:** 10 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

- [ ] **7.3** ContactStoryView AI insights: Convert actions to ul/li
  - **File:** `src/components/contacts/ContactStoryView.tsx` Line 276
  - **Time:** 10 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

- [ ] **7.4** RecentActivityFeed: Convert feed container to ul/li
  - **File:** `src/components/contacts/RecentActivityFeed.tsx` Line 23
  - **Time:** 10 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

### Button & Link Context

- [ ] **8.1** ActionCard: Add contact name to all button aria-labels
  - **File:** `src/components/contacts/ActionCard.tsx` Lines 252-289
  - **Time:** 15 min
  - **WCAG:** 4.1.2 Name, Role, Value (Level A)

- [ ] **8.2** ActionCard: Add aria-expanded to expand/collapse button
  - **File:** `src/components/contacts/ActionCard.tsx` Line 142
  - **Time:** 5 min
  - **WCAG:** 4.1.2 Name, Role, Value (Level A)

- [ ] **8.3** ContactStoryView: Add contact context to all link aria-labels
  - **File:** `src/components/contacts/ContactStoryView.tsx` Lines 201-222
  - **Time:** 10 min
  - **WCAG:** 2.4.4 Link Purpose (Level A)

- [ ] **8.4** ActionCard checkboxes: Add id/htmlFor associations
  - **File:** `src/components/contacts/ActionCard.tsx` Lines 197-216
  - **Time:** 15 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

### Contrast & Visual

- [ ] **9.1** RecentActivityFeed: Fix hardcoded dark mode colors
  - **File:** `src/components/contacts/RecentActivityFeed.tsx` Lines 44-97
  - **Time:** 20 min
  - **WCAG:** 1.4.3 Contrast (Level AA)

- [ ] **9.2** ActionCard: Fix line-through text contrast (dark:text-gray-600)
  - **File:** `src/components/contacts/ActionCard.tsx` Line 209
  - **Time:** 5 min
  - **WCAG:** 1.4.3 Contrast (Level AA)

**High Priority Total Time: ~2.5 hours**

---

## 🟡 MEDIUM PRIORITY ISSUES (8) - FIX SOON

### ARIA Patterns

- [ ] **10.1** ContactsPage tabs: Implement proper tablist/tab/tabpanel pattern
  - **File:** `src/components/contacts/ContactsPage.tsx` Lines 309-331
  - **Time:** 30 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

- [ ] **10.2** ActionCard: Add aria-controls linking expand button to content
  - **File:** `src/components/contacts/ActionCard.tsx` Line 142
  - **Time:** 10 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

### Decorative Content

- [ ] **11.1** ContactCard: Add aria-hidden to channel icon emoji
  - **File:** `src/components/contacts/ContactCard.tsx` Line 94
  - **Time:** 2 min
  - **WCAG:** 1.1.1 Non-text Content (Level A)

- [ ] **11.2** TrendIndicator: Add aria-hidden to emoji icon
  - **File:** `src/components/contacts/TrendIndicator.tsx` Line 48
  - **Time:** 2 min
  - **WCAG:** 1.1.1 Non-text Content (Level A)

- [ ] **11.3** ContactCardGallery: Add aria-hidden to empty state emoji
  - **File:** `src/components/contacts/ContactCardGallery.tsx` Line 31
  - **Time:** 2 min
  - **WCAG:** 1.1.1 Non-text Content (Level A)

- [ ] **11.4** PrioritiesFeedView: Add aria-hidden to empty state emoji
  - **File:** `src/components/contacts/PrioritiesFeedView.tsx` Line 256
  - **Time:** 2 min
  - **WCAG:** 1.1.1 Non-text Content (Level A)

- [ ] **11.5** RecentActivityFeed: Add aria-hidden to interaction type emoji
  - **File:** `src/components/contacts/RecentActivityFeed.tsx` Line 47
  - **Time:** 2 min
  - **WCAG:** 1.1.1 Non-text Content (Level A)

### Focus Indicators

- [ ] **12.1** ContactSearch clear button: Add focus ring styles
  - **File:** `src/components/contacts/ContactSearch.tsx` Line 42
  - **Time:** 5 min
  - **WCAG:** 2.4.7 Focus Visible (Level AA)

- [ ] **12.2** PrioritiesFeedView filter chips: Add focus ring styles
  - **File:** `src/components/contacts/PrioritiesFeedView.tsx` Line 161
  - **Time:** 5 min
  - **WCAG:** 2.4.7 Focus Visible (Level AA)

### Semantic Lists

- [ ] **13.1** PrioritiesFeedView completed actions: Convert to ul/li
  - **File:** `src/components/contacts/PrioritiesFeedView.tsx` Line 317
  - **Time:** 10 min
  - **WCAG:** 1.3.1 Info and Relationships (Level A)

**Medium Priority Total Time: ~1.5 hours**

---

## 🟢 LOW PRIORITY ISSUES (6) - BEST PRACTICES

### Enhancement Opportunities

- [ ] **14.1** Replace emoji system with proper icon library (e.g., Heroicons)
  - **Files:** All components
  - **Time:** 4 hours
  - **WCAG:** 1.1.1 Non-text Content (Level A)

- [ ] **14.2** ContactsPage: Add skip navigation link
  - **File:** `src/components/contacts/ContactsPage.tsx` Top of page
  - **Time:** 15 min
  - **WCAG:** 2.4.1 Bypass Blocks (Level A)

- [ ] **14.3** ContactSearch: Add aria-describedby to result count
  - **File:** `src/components/contacts/ContactSearch.tsx` Line 26
  - **Time:** 10 min
  - **WCAG:** Best practice

- [ ] **14.4** Add tooltips to all icon-only buttons
  - **Files:** ContactCard, ContactStoryView, ActionCard
  - **Time:** 30 min
  - **WCAG:** Best practice

- [ ] **14.5** PrioritiesFeedView: Add aria-current to active filter chip
  - **File:** `src/components/contacts/PrioritiesFeedView.tsx` Line 161
  - **Time:** 5 min
  - **WCAG:** Best practice

- [ ] **14.6** ContactStoryView: Add print-friendly styles
  - **File:** `src/styles/contacts.css` Print media query
  - **Time:** 20 min
  - **WCAG:** Best practice

**Low Priority Total Time: ~6 hours**

---

## Testing Checklist

### Automated Testing

- [ ] Install axe DevTools browser extension
- [ ] Run axe on ContactsPage (All Contacts view)
- [ ] Run axe on ContactsPage (Priorities view)
- [ ] Run axe on ContactStoryView (detail page)
- [ ] Run axe on ContactFilters (dropdown open)
- [ ] Run Pa11y command line tests
- [ ] Run Lighthouse accessibility audit
- [ ] Verify 0 critical errors from automated tools

### Manual Keyboard Testing (No Mouse)

- [ ] Tab through all interactive elements on ContactsPage
- [ ] Tab through ContactFilters dropdown
- [ ] Open and close filters with Enter/Space
- [ ] Close filters with Escape key
- [ ] Navigate to contact card and activate with Enter/Space
- [ ] Tab through ContactStoryView
- [ ] Activate all buttons and links with Enter/Space
- [ ] Navigate back to contacts list
- [ ] Switch between tabs (All/Priorities/Recent) with keyboard
- [ ] Verify no keyboard traps anywhere
- [ ] Verify focus indicator visible on ALL elements

### Screen Reader Testing

**NVDA (Windows) or VoiceOver (Mac):**

- [ ] Navigate by landmarks (main, navigation, etc.)
- [ ] Navigate by headings (H1, H2, H3)
- [ ] Navigate by buttons
- [ ] Navigate by links
- [ ] Navigate by form elements
- [ ] Verify contact cards announced with complete info
- [ ] Verify relationship scores announced meaningfully
- [ ] Verify filter changes announced
- [ ] Verify loading states announced
- [ ] Verify error states announced
- [ ] Verify all buttons have clear, contextual names
- [ ] Verify no confusing emoji announcements

### Visual Testing

- [ ] Zoom browser to 200%
- [ ] Verify no horizontal scrolling at 200% zoom
- [ ] Verify all content still readable at 200% zoom
- [ ] Verify touch targets ≥ 44x44px on mobile
- [ ] Test color blindness simulation (Protanopia)
- [ ] Test color blindness simulation (Deuteranopia)
- [ ] Test color blindness simulation (Tritanopia)
- [ ] Verify information not conveyed by color alone

### Contrast Testing

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Light Mode:**
- [ ] Badge primary: Blue-700 on blue-100 (≥ 4.5:1)
- [ ] Badge success: Green-700 on green-100 (≥ 4.5:1)
- [ ] Badge secondary: Gray-700 on gray-200 (≥ 4.5:1)
- [ ] Badge warning: Amber-700 on amber-100 (≥ 4.5:1)
- [ ] Badge danger: Red-700 on red-100 (≥ 4.5:1)
- [ ] Search placeholder: Gray-400 on white (≥ 4.5:1)
- [ ] Button text: Gray-800 on gray-200 (≥ 4.5:1)

**Dark Mode:**
- [ ] Badge primary: Blue-300 on blue-500/20 (≥ 4.5:1)
- [ ] Badge success: Green-300 on green-500/20 (≥ 4.5:1)
- [ ] Badge secondary: Gray-300 on gray-600/20 (≥ 4.5:1)
- [ ] Button text: Gray-200 on gray-700 (≥ 4.5:1)
- [ ] Line-through text: Fixed to gray-600 (≥ 4.5:1)

**Focus Indicators:**
- [ ] Blue-500 ring on white background (≥ 3:1)
- [ ] Blue-500 ring on gray-900 background (≥ 3:1)

### High Contrast Mode Testing

**Windows High Contrast Mode:**
- [ ] Enable High Contrast Mode
- [ ] Verify all focus indicators visible
- [ ] Verify all text readable
- [ ] Verify all borders visible
- [ ] Verify all interactive elements distinguishable

### Reduced Motion Testing

- [ ] Enable prefers-reduced-motion in browser
- [ ] Verify animations disabled or minimal
- [ ] Verify no unexpected motion
- [ ] Verify transitions < 0.01ms

---

## Acceptance Criteria

### Before Marking Component Complete:

Each component must meet these criteria:

- [ ] Zero critical accessibility errors (axe/pa11y)
- [ ] All interactive elements keyboard accessible
- [ ] All interactive elements have visible focus indicators
- [ ] All images/icons have appropriate text alternatives
- [ ] All form inputs have associated labels
- [ ] All buttons have clear, contextual names
- [ ] Loading states announced to screen readers
- [ ] Error states announced to screen readers
- [ ] Dynamic content changes announced
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Semantic HTML used (nav, main, section, ul/li)
- [ ] Contrast ratios ≥ 4.5:1 for text
- [ ] Contrast ratios ≥ 3:1 for UI components
- [ ] No information conveyed by color alone
- [ ] Passes manual screen reader testing

### Before Release to Production:

- [ ] All critical issues resolved (9/9)
- [ ] All high priority issues resolved (12/12)
- [ ] At least 75% of medium priority issues resolved (6+/8)
- [ ] WCAG 2.1 AA compliance ≥ 95% (currently 78%)
- [ ] Automated tests pass with 0 critical errors
- [ ] Manual keyboard test passes completely
- [ ] Manual screen reader test passes completely
- [ ] All contrast ratios verified and passing
- [ ] Accessibility testing documentation complete

---

## Progress Tracking

### Overall Status:

| Category | Total | Complete | Remaining | Progress |
|----------|-------|----------|-----------|----------|
| Critical | 9 | 0 | 9 | ████░░░░░░ 0% |
| High | 12 | 0 | 12 | ████░░░░░░ 0% |
| Medium | 8 | 0 | 8 | ████░░░░░░ 0% |
| Low | 6 | 0 | 6 | ████░░░░░░ 0% |
| **Total** | **35** | **0** | **35** | **████░░░░░░ 0%** |

### Compliance Score:

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| WCAG 2.1 AA | 78% | 95% | ❌ FAIL |
| Critical Issues | 9 | 0 | ❌ FAIL |
| High Issues | 12 | <3 | ❌ FAIL |
| Keyboard Access | ~85% | 100% | ⚠️ WARN |
| Screen Reader | Poor | Excellent | ❌ FAIL |

---

## Time Estimates by Developer

### Senior Frontend Developer (5 YOE):
- Critical: 2 hours
- High: 2.5 hours
- Medium: 1.5 hours
- Low: 6 hours
- **Total: 12 hours (1.5 days)**

### Mid-level Frontend Developer (2-3 YOE):
- Critical: 3 hours
- High: 4 hours
- Medium: 2 hours
- Low: 8 hours
- **Total: 17 hours (2 days)**

### Junior Frontend Developer (<2 YOE):
- Critical: 4 hours
- High: 6 hours
- Medium: 3 hours
- Low: 12 hours
- **Total: 25 hours (3 days)**

**Recommended:** Pair junior dev with senior for faster completion and knowledge transfer.

---

## Next Steps

1. **Day 1:** Fix all 9 Critical issues
2. **Day 2:** Fix High Priority issues 5.1-5.5, 6.1-6.3 (announcements & labels)
3. **Day 3:** Fix High Priority issues 7.1-7.4, 8.1-8.4 (structure & buttons)
4. **Day 4:** Fix High Priority issues 9.1-9.2 and Medium Priority issues
5. **Day 5:** Testing, validation, and documentation

**Sprint Goal:** Complete all Critical and High Priority issues. Target ≥ 95% WCAG 2.1 AA compliance.

---

**Checklist last updated:** January 26, 2026
**Assigned to:** [Developer Name]
**Target completion:** [Sprint End Date]
**Reviewed by:** UX Researcher (Accessibility Specialist)
