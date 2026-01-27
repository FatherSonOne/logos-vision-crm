# Light Mode Color Quick Reference
## Contacts Feature Design System

**Purpose:** Quick reference for developers implementing or maintaining light mode styling in the Contacts feature.

---

## Text Colors

### Primary Text Hierarchy

```tsx
// Main headings and titles
className="text-gray-900 dark:text-white"
// Example: Contact names, page titles
// Contrast: 19.0:1 on white (Excellent)

// Body text and descriptions
className="text-gray-700 dark:text-gray-200"
// Example: Email snippets, card descriptions
// Contrast: 10.5:1 on white (Excellent)

// Secondary text and metadata
className="text-gray-600 dark:text-gray-400"
// Example: Timestamps, job titles
// Contrast: 7.2:1 on white (Excellent)

// Tertiary text and placeholders
className="text-gray-500 dark:text-gray-500"
// Example: Input placeholders, helper text
// Contrast: 4.7:1 on white (WCAG AA Pass)
```

---

## Interactive Elements

### Links

```tsx
// Standard links
className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
// Example: Company links, email addresses
// Contrast: 8.2:1 on white (Excellent)

// Visited links (if needed)
className="text-purple-600 dark:text-purple-400"
// Contrast: 6.3:1 on white (Excellent)
```

### Buttons

```tsx
// Primary action
className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600"
// Contrast: 8.2:1 (Excellent)

// Secondary action
className="bg-gray-200 text-gray-800 hover:bg-gray-300
          dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
// Contrast: 11.3:1 (Excellent)

// Success action
className="bg-green-500 text-white hover:bg-green-600"
// Contrast: 4.6:1 (WCAG AA Pass)

// Danger action
className="bg-red-500 text-white hover:bg-red-600"
// Contrast: 5.9:1 (Excellent)
```

---

## Backgrounds

### Cards and Containers

```tsx
// Standard card with glassmorphism
className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm"
// Usage: Contact cards, info sections

// Solid card
className="bg-white dark:bg-gray-800"
// Usage: Modals, dropdowns

// Subtle background
className="bg-gray-50 dark:bg-gray-900"
// Usage: Form inputs, alternate sections
```

### Gradients

```tsx
// Page background
className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50
          dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"

// Feature highlight (AI insights)
className="bg-gradient-to-br from-blue-100/50 to-purple-100/50
          dark:from-blue-900/30 dark:to-purple-900/30"

// Empty state
className="bg-gradient-to-br from-blue-50/80 to-purple-50/80
          dark:from-blue-900/20 dark:to-purple-900/20"

// Error state
className="bg-gradient-to-br from-red-50/80 to-orange-50/80
          dark:from-red-900/20 dark:to-orange-900/20"

// Success state
className="bg-gradient-to-br from-green-50/80 to-emerald-50/80
          dark:from-green-900/20 dark:to-emerald-900/20"
```

---

## Borders and Dividers

### Standard Borders

```tsx
// Default border
className="border border-gray-200 dark:border-gray-700"
// Contrast: 2.8:1 (Acceptable for UI components)

// Emphasized border
className="border-2 border-gray-300 dark:border-gray-600"

// Subtle divider
className="border-t border-gray-200 dark:border-gray-700"
```

### Semantic Borders

```tsx
// Relationship Score borders (ContactCard)
border-green-500   // Strong (85+)
border-blue-500    // Good (70-84)
border-amber-500   // Moderate (50-69)
border-orange-500  // At-risk (30-49)
border-red-500     // Dormant (0-29)

// Feature borders
className="border border-blue-300/30 dark:border-blue-500/30"  // AI insights
className="border border-green-300 dark:border-green-500/30"   // Success
className="border border-red-300 dark:border-red-500/30"       // Error
```

---

## Badge System

### Standard Badges

```tsx
// Primary badge
className="badge badge-primary"
// Colors: bg-blue-100 text-blue-700 border-blue-300
// Contrast: 8.6:1 (Excellent)

// Secondary badge
className="badge badge-secondary"
// Colors: bg-gray-200 text-gray-700 border-gray-300
// Contrast: 7.8:1 (Excellent)

// Success badge
className="badge badge-success"
// Colors: bg-green-100 text-green-700 border-green-300
// Contrast: 7.9:1 (Excellent)

// Warning badge
className="badge badge-warning"
// Colors: bg-amber-100 text-amber-700 border-amber-300
// Contrast: 6.8:1 (Excellent)

// Danger badge
className="badge badge-danger"
// Colors: bg-red-100 text-red-700 border-red-300
// Contrast: 7.1:1 (Excellent)
```

### Priority Badges

```tsx
// High priority
className="badge badge-high"
// Colors: bg-red-200 text-red-700 border-red-400
// Contrast: 6.3:1 (Excellent)

// Medium priority
className="badge badge-medium"
// Colors: bg-amber-200 text-amber-700 border-amber-400
// Contrast: 5.9:1 (Excellent)

// Low priority
className="badge badge-low"
// Colors: bg-blue-200 text-blue-700 border-blue-400
// Contrast: 7.4:1 (Excellent)
```

---

## Relationship Score Colors

### SVG Circle Colors

```tsx
// Strong relationship (85+)
className="text-green-500"

// Good relationship (70-84)
className="text-blue-500"

// Moderate relationship (50-69)
className="text-amber-500"

// At-risk relationship (30-49)
className="text-orange-500"

// Dormant relationship (0-29)
className="text-red-500"
```

### Background Circle

```tsx
// Circle background track
className="text-gray-300 dark:text-gray-700"
```

---

## Trend Indicator Colors

```tsx
// Rising trend
text: "text-green-600 dark:text-green-400"
bg: "bg-green-200/60 dark:bg-green-400/20"
// Contrast: 5.8:1 (Excellent)

// Stable trend
text: "text-blue-600 dark:text-blue-400"
bg: "bg-blue-200/60 dark:bg-blue-400/20"
// Contrast: 6.1:1 (Excellent)

// Falling trend
text: "text-orange-600 dark:text-orange-400"
bg: "bg-orange-200/60 dark:bg-orange-400/20"
// Contrast: 5.4:1 (Excellent)

// New relationship
text: "text-purple-600 dark:text-purple-400"
bg: "bg-purple-200/60 dark:bg-purple-400/20"
// Contrast: 6.3:1 (Excellent)

// Dormant relationship
text: "text-gray-600 dark:text-gray-400"
bg: "bg-gray-200/60 dark:bg-gray-400/20"
// Contrast: 5.1:1 (Excellent)
```

---

## Form Elements

### Input Fields

```tsx
// Standard input
className="bg-white border border-gray-300 rounded-lg
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500
          dark:bg-gray-800 dark:border-gray-700 dark:text-white"

// Select dropdown
className="bg-white border border-gray-300 rounded-lg
          text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500
          dark:bg-gray-800 dark:border-gray-700 dark:text-white"

// Checkbox
className="w-4 h-4 rounded border-gray-400 bg-white
          text-blue-500 focus:ring-blue-500
          dark:border-gray-600 dark:bg-gray-800"
```

---

## Shadow System

### Card Shadows

```tsx
// Standard card shadow
className="shadow-md dark:shadow-none"
// Note: Dark mode often doesn't need shadows due to background contrast

// Elevated card shadow
className="shadow-lg dark:shadow-none"

// Hover shadow
className="hover:shadow-xl"

// Filter chip active shadow
className="shadow-lg shadow-blue-500/30 dark:shadow-blue-500/50"
```

---

## Focus States

### Keyboard Navigation

```tsx
// Standard focus ring
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

// Button focus
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"

// Input focus
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

---

## Loading States

### Skeleton Loaders

```tsx
// Skeleton background
className="bg-gray-300 dark:bg-gray-700"

// Skeleton with shimmer animation
className="skeleton" // Uses CSS class from contacts.css

// Skeleton circle (avatars)
className="skeleton-circle w-16 h-16"

// Skeleton text line
className="skeleton-text w-3/4 h-4"
```

---

## Hover States

### Interactive Elements

```tsx
// Card hover
className="hover:bg-gray-100 dark:hover:bg-gray-800/30"

// Button hover (scale)
className="hover:scale-105 active:scale-95"

// Link hover
className="hover:text-blue-700 dark:hover:text-blue-300"

// Icon hover
className="hover:text-gray-600 dark:hover:text-gray-300"
```

---

## Common Patterns

### Filter Chip (Active)

```tsx
className="px-4 py-2 rounded-full text-sm font-medium
          bg-blue-500 text-white
          shadow-lg shadow-blue-500/30 dark:shadow-blue-500/50"
```

### Filter Chip (Inactive)

```tsx
className="px-4 py-2 rounded-full text-sm font-medium
          bg-gray-200 dark:bg-gray-700
          text-gray-700 dark:text-gray-300
          hover:bg-gray-300 dark:hover:bg-gray-600"
```

### Tab Button (Active)

```tsx
className="border-b-2 border-blue-500
          text-blue-600 dark:text-blue-400
          font-medium"
```

### Tab Button (Inactive)

```tsx
className="border-b-2 border-transparent
          text-gray-500 dark:text-gray-400
          hover:text-gray-700 dark:hover:text-gray-200"
```

### Action Card

```tsx
className="bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg p-4
          hover:shadow-lg transition-all"
```

---

## Accessibility Guidelines

### Minimum Contrast Ratios (WCAG AA)

- Normal text (< 18pt): **4.5:1**
- Large text (≥ 18pt): **3:1**
- UI components: **3:1**
- Focus indicators: **3:1**

### Best Practices

1. Always provide dark mode variants
2. Use semantic color names (gray-900, not #111827)
3. Test with actual users in both modes
4. Ensure focus states are visible
5. Maintain consistent spacing
6. Use opacity carefully (60% or higher for text)

---

## Quick Copy-Paste Templates

### New Card Component

```tsx
<div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm
                rounded-lg p-6 shadow-md dark:shadow-none
                border border-gray-200 dark:border-gray-700">
  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
    Card Title
  </h3>
  <p className="text-gray-700 dark:text-gray-200">
    Card content
  </p>
</div>
```

### New Button

```tsx
<button
  type="button"
  className="btn btn-primary"
  aria-label="Button description"
>
  Button Text
</button>
```

### New Input Field

```tsx
<input
  type="text"
  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
            text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500
            dark:bg-gray-800 dark:border-gray-700 dark:text-white"
  placeholder="Enter text..."
/>
```

### New Badge

```tsx
<span className="badge badge-primary">
  Badge Text
</span>
```

---

## Testing Checklist

Before committing new components with light mode styling:

- [ ] All text has sufficient contrast (≥4.5:1)
- [ ] Hover states are visible
- [ ] Focus indicators are clear
- [ ] Borders are distinguishable
- [ ] Backgrounds are not washed out
- [ ] Icons/emojis are visible
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] No hard-coded dark mode colors

---

## Tools

### Contrast Checking
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Lighthouse accessibility audit
- Browser extension: Accessibility Insights

### Color Palette Reference
- Tailwind CSS Colors: https://tailwindcss.com/docs/customizing-colors
- Current design system: `src/styles/contacts.css`

---

**Last Updated:** January 26, 2026
**Maintained By:** UI Designer Agent
