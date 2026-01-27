# Light Mode Issues - Contacts Feature

**Date:** January 26, 2026
**Total Issues:** 1 Medium, 2 Low Priority

---

## Medium Priority Issues

### M1: RecentActivityFeed - Hard-coded Dark Mode Colors

**File:** `src/components/contacts/RecentActivityFeed.tsx`

**Issue:**
The `InteractionCard` component uses hard-coded dark mode color classes that do not adapt to light mode, resulting in white text on light backgrounds with insufficient contrast.

**Lines Affected:**
- Line 44: `border border-gray-700` (should be conditional)
- Line 53: `text-white` (should be `text-gray-900 dark:text-white`)
- Line 71: `text-gray-300` (should be `text-gray-700 dark:text-gray-300`)

**Current Code:**
```tsx
<div className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800/30 transition-all">
  <h4 className="font-medium text-white">
    {interaction.subject || config.label}
  </h4>
  <p className="text-sm text-gray-300 mb-2">{interaction.snippet}</p>
```

**Recommended Fix:**
```tsx
<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4
              hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all">
  <h4 className="font-medium text-gray-900 dark:text-white">
    {interaction.subject || config.label}
  </h4>
  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{interaction.snippet}</p>
```

**Additional Changes Needed:**
```tsx
// Line 61: Date text
className="text-sm text-gray-600 dark:text-gray-400"

// Line 88: Action items background
className="mt-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded"

// Line 89: Action items label
className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"

// Line 91: Action items text
className="text-xs text-gray-700 dark:text-gray-300 list-disc list-inside"
```

**Impact:**
- Text is unreadable in light mode (contrast ratio ~1.1:1)
- Fails WCAG AA accessibility standards
- Poor user experience for light mode users

**Severity:** 🟡 **MEDIUM**

**Estimated Fix Time:** 5-10 minutes

**Testing Required:**
- Visual inspection in light mode
- Contrast ratio verification (should be ≥4.5:1)
- Browser testing (Chrome, Firefox, Safari, Edge)

---

## Low Priority Issues

### L1: Optimization - Remove Redundant Dark Mode Classes

**Files:** Multiple button components

**Issue:**
Some components specify the same color for both base and dark mode, resulting in unnecessary code duplication.

**Example:**
```tsx
// Current (redundant)
className="bg-blue-500 dark:bg-blue-500"

// Optimized
className="bg-blue-500"
```

**Affected Components:**
- ContactsPage: Tab buttons
- Various button instances with `btn-primary` class

**Impact:**
- Minor code bloat
- No functional or visual impact
- Slightly harder to maintain

**Severity:** 🟢 **LOW**

**Estimated Fix Time:** 10-15 minutes

**Recommendation:**
Clean up during next code refactoring cycle. Not blocking for production.

---

### L2: Enhancement - Expand High Contrast Mode Support

**File:** `src/styles/contacts.css`

**Issue:**
The CSS includes basic high contrast mode support but could be expanded for better accessibility.

**Current Implementation:**
```css
@media (prefers-contrast: high) {
  .badge {
    @apply border-2;
  }
  .btn {
    @apply border-2;
  }
  .contact-card {
    @apply border-4;
  }
}
```

**Recommended Enhancement:**
```css
@media (prefers-contrast: high) {
  /* Existing styles */
  .badge {
    @apply border-2;
  }
  .btn {
    @apply border-2;
  }
  .contact-card {
    @apply border-4;
  }

  /* Additional enhancements */
  .form-input {
    @apply border-2;
  }

  /* Increase text weight for better readability */
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold;
  }

  /* Remove transparency effects */
  .glass,
  .glass-strong {
    @apply bg-white dark:bg-gray-800;
  }
}
```

**Impact:**
- Enhanced accessibility for users with contrast preferences
- Better compliance with accessibility guidelines
- No impact on standard viewing mode

**Severity:** 🟢 **LOW**

**Estimated Fix Time:** 30 minutes

**Recommendation:**
Nice-to-have enhancement for future iteration. Not blocking for production.

---

## Issue Priority Matrix

| Priority | Count | Blocking? | Action |
|----------|-------|-----------|--------|
| Critical | 0 | N/A | N/A |
| High | 0 | N/A | N/A |
| Medium | 1 | ⚠️ Recommended | Fix before production |
| Low | 2 | ❌ No | Post-launch optimization |

---

## Recommended Action Plan

### Phase 1: Pre-Production (Required)
1. ✅ Fix RecentActivityFeed light mode colors
2. ✅ Test in all major browsers
3. ✅ Verify WCAG AA compliance

**Estimated Time:** 15-20 minutes

### Phase 2: Post-Launch (Optional)
1. Code optimization (remove redundant classes)
2. High contrast mode enhancements
3. Performance audit of backdrop-blur effects

**Estimated Time:** 1-2 hours

---

## Testing Checklist

Before marking M1 as complete, verify:

- [ ] All text in RecentActivityFeed is readable in light mode
- [ ] Contrast ratios meet WCAG AA (≥4.5:1 for normal text)
- [ ] Hover states work in light mode
- [ ] Borders are visible in light mode
- [ ] No visual regressions in dark mode
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested in Edge

---

## Contact

For questions about these issues, contact the UI Designer Agent or refer to the comprehensive verification report: `LIGHT_MODE_VERIFICATION_REPORT.md`

---

**Last Updated:** January 26, 2026
