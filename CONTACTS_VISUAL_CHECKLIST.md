# Contacts Phase 1 - Visual Design Checklist

**Purpose:** Visual QA checklist to ensure pixel-perfect implementation
**Date:** January 25, 2026
**Status:** Ready for Visual Testing

---

## Color Palette Verification

### Relationship Health Colors (Border & Text)

- [ ] **Strong (85-100):** Green `#10b981` / `border-green-500`
- [ ] **Good (70-84):** Blue `#3b82f6` / `border-blue-500`
- [ ] **Moderate (50-69):** Amber `#f59e0b` / `border-amber-500`
- [ ] **At-Risk (30-49):** Orange `#f97316` / `border-orange-500`
- [ ] **Dormant (0-29):** Red `#ef4444` / `border-red-500`

### Trend Badge Colors

- [ ] **Rising:** Green `text-green-400` / `bg-green-400/20` with ↗ icon
- [ ] **Stable:** Blue `text-blue-400` / `bg-blue-400/20` with ━ icon
- [ ] **Falling:** Orange `text-orange-400` / `bg-orange-400/20` with ↘ icon
- [ ] **New:** Purple `text-purple-400` / `bg-purple-400/20` with ✨ icon
- [ ] **Dormant:** Gray `text-gray-400` / `bg-gray-400/20` with 💤 icon

### Background Gradients

- [ ] **Page Background:** `from-gray-900 via-blue-900 to-purple-900`
- [ ] **Card Background:** `bg-gray-800/50` with `backdrop-blur-sm`
- [ ] **AI Insights Panel:** `from-blue-900/30 to-purple-900/30` with `border-blue-500/30`

---

## Typography Verification

### Font Sizes

- [ ] **Page Title (h1):** `text-3xl` (30px) bold white
- [ ] **Section Titles (h2):** `text-xl` (20px) semibold white
- [ ] **Contact Names:** `text-lg` (18px) semibold white
- [ ] **Body Text:** `text-base` (16px) regular gray-300
- [ ] **Labels:** `text-sm` (14px) gray-400
- [ ] **Badges:** `text-xs` (12px) medium weight

### Font Weights

- [ ] **Bold:** Page titles, contact names
- [ ] **Semibold:** Section headings
- [ ] **Medium:** Badges, labels
- [ ] **Regular:** Body text

---

## Spacing Verification

### Card Padding & Margins

- [ ] **Card Padding:** `p-4` (16px)
- [ ] **Card Gap in Grid:** `p-3` (12px) wrapper
- [ ] **Section Margins:** `mb-6` (24px)
- [ ] **Element Gaps:** `gap-2` (8px) for buttons, `gap-3` (12px) for sections

### Component Internal Spacing

- [ ] **RelationshipScoreCircle:** Centered with `mb-4`
- [ ] **TrendIndicator:** `mt-2` below score circle
- [ ] **Contact Info:** `mb-4` between sections
- [ ] **Stats Border:** `border-t` with `pt-3`
- [ ] **Quick Actions:** `mt-3` with `gap-2`

---

## Component Visual Checks

### ContactCard Component

- [ ] **Border:** 2px solid, color-coded by relationship score
- [ ] **Border Radius:** `rounded-lg` (8px)
- [ ] **Background:** Glass effect `bg-gray-800/50 backdrop-blur-sm`
- [ ] **Hover Effect:** Scale 1.05 with `shadow-xl`
- [ ] **Transition:** `duration-200` smooth
- [ ] **Avatar:** 64px circle (w-16 h-16) or gradient initials
- [ ] **Company Link:** Blue `text-blue-400` with hover underline
- [ ] **Stats:** Border-top separator, centered text
- [ ] **Quick Actions:** Hidden until hover, `opacity-0 group-hover:opacity-100`

### RelationshipScoreCircle Component

#### Size Variants
- [ ] **Small:** 60x60px, stroke 4px, text `text-lg`
- [ ] **Medium:** 80x80px, stroke 6px, text `text-2xl`
- [ ] **Large:** 120x120px, stroke 8px, text `text-4xl`

#### Visual Elements
- [ ] **Background Circle:** Gray `text-gray-700`
- [ ] **Progress Circle:** Color-coded, smooth arc
- [ ] **Rotation:** Transform `-rotate-90` (starts at top)
- [ ] **Score Text:** Bold white in center
- [ ] **Label Text:** Small gray-400 below score (Strong/Good/etc.)
- [ ] **Transition:** `duration-500` on render

### TrendIndicator Component

- [ ] **Padding:** `px-3 py-1` (12px horizontal, 4px vertical)
- [ ] **Border Radius:** `rounded-full` (pill shape)
- [ ] **Icon Size:** `text-lg` (18px)
- [ ] **Label Size:** `text-sm` (14px)
- [ ] **Gap:** `gap-1.5` (6px) between icon and label
- [ ] **Color Match:** Icon and text same color, background 20% opacity

### ContactStoryView Component

- [ ] **Back Button:** Blue `text-blue-400` with left arrow, hover lighter
- [ ] **Hero Section:** Centered, `mb-8`
- [ ] **Large Score Circle:** Size lg (120px)
- [ ] **Contact Header Card:** Glass effect, `p-6`, rounded
- [ ] **Avatar/Initials:** 80px (w-20 h-20)
- [ ] **Name:** `text-3xl` bold white
- [ ] **Job Title:** `text-lg` gray-300
- [ ] **Company:** Blue with @ symbol
- [ ] **Contact Links:** Gray-400 with hover blue-400
- [ ] **AI Insights Panel:** Gradient background with blue border glow
- [ ] **Section Cards:** Glass effect, `p-6`, `mb-6`
- [ ] **Quick Actions Bar:** Sticky bottom, `bottom-6`, blur background
- [ ] **Action Buttons:** Full width with icon + text

### ContactSearch Component

- [ ] **Search Icon:** Left-aligned, gray-400
- [ ] **Input Padding:** `pl-10` for icon, `pr-4 py-2`
- [ ] **Background:** Dark `bg-gray-800`
- [ ] **Border:** `border-gray-700`
- [ ] **Focus Ring:** Blue `ring-2 ring-blue-500`
- [ ] **Placeholder:** Gray-400 text
- [ ] **Width:** Fixed `w-64` (256px)

### ContactFilters Component

- [ ] **Dropdown Position:** Absolute right-0
- [ ] **Dropdown Width:** `w-80` (320px)
- [ ] **Dropdown Background:** Dark `bg-gray-800` with border
- [ ] **Shadow:** `shadow-xl` for elevation
- [ ] **Padding:** `p-4` (16px)
- [ ] **Filter Badge:** Blue circle with count
- [ ] **Select Dropdowns:** Full width, dark background
- [ ] **Button Gap:** `gap-2` between Clear/Apply

### RecentActivityFeed Component

- [ ] **Card Border:** `border-gray-700`
- [ ] **Card Padding:** `p-4`
- [ ] **Card Hover:** Light background `bg-gray-800/30`
- [ ] **Icon Size:** `text-2xl` (24px)
- [ ] **Icon Gap:** `gap-3` (12px) from content
- [ ] **Header Flex:** Space-between alignment
- [ ] **Sentiment Badge:** Inline with timestamp
- [ ] **Topics:** Flex wrap with `gap-1`
- [ ] **Action Items:** Dark background box, `p-2`
- [ ] **AI Summary:** Blue background with border glow

### SentimentBadge Component

- [ ] **Padding:** `px-2 py-1` (8px horizontal, 4px vertical)
- [ ] **Font Size:** `text-xs` (12px)
- [ ] **Border Radius:** `rounded` (4px)
- [ ] **Gap:** `gap-1` (4px) between emoji and score
- [ ] **Color Variants:**
  - Positive (≥0.6): Green background/border
  - Somewhat Positive (≥0.2): Blue background/border
  - Neutral: Gray background
  - Somewhat Negative (≤-0.2): Orange background/border
  - Negative (≤-0.6): Red background/border

---

## Responsive Design Checks

### Breakpoints

- [ ] **Mobile (<640px):** 1 column grid
- [ ] **Tablet (640-767px):** 2 column grid
- [ ] **Desktop (768-1023px):** 3 column grid
- [ ] **Large Desktop (1024-1279px):** 3 column grid
- [ ] **XL Desktop (1280-1535px):** 3 column grid
- [ ] **2XL Desktop (≥1536px):** 4 column grid

### Mobile Optimizations

- [ ] **Text Readable:** Minimum 16px base font
- [ ] **Touch Targets:** Minimum 44px for buttons
- [ ] **Spacing:** Adequate padding for thumbs
- [ ] **Scrolling:** Smooth virtual scroll on touch
- [ ] **Modals:** Full screen on mobile

### Tablet Optimizations

- [ ] **2 Column Grid:** Proper spacing
- [ ] **Filters:** Dropdown doesn't overflow
- [ ] **Detail View:** Readable layout
- [ ] **Actions Bar:** Buttons not cramped

### Desktop Optimizations

- [ ] **3-4 Column Grid:** Fills width nicely
- [ ] **Hover Effects:** Work with mouse
- [ ] **Sidebar + Content:** Proper layout
- [ ] **Max Width:** Cards don't stretch too wide

---

## Interaction Checks

### Hover States

- [ ] **Contact Card:** Scale 1.05, shadow-xl, smooth transition
- [ ] **Quick Actions:** Fade in opacity 0 → 100
- [ ] **Buttons:** Background darkens
- [ ] **Links:** Color changes, underline appears
- [ ] **Interaction Cards:** Light background on hover

### Active States

- [ ] **Buttons:** Darker background when pressed
- [ ] **Tabs:** Blue underline border when active
- [ ] **Filters:** Highlighted when open
- [ ] **Checkboxes:** Blue background when checked

### Focus States

- [ ] **Keyboard Navigation:** Clear focus ring `ring-2 ring-blue-500`
- [ ] **Tab Order:** Logical flow
- [ ] **Skip Links:** Available for accessibility
- [ ] **Focus Visible:** Only on keyboard, not mouse

### Loading States

- [ ] **Initial Load:** Centered spinner, blue color
- [ ] **Empty State:** Centered message, helpful text
- [ ] **Skeleton Loaders:** Pulse animation (if implemented)

---

## Animation Timing Checks

### Transitions

- [ ] **Card Hover:** `duration-200` (200ms)
- [ ] **Score Circle:** `duration-500` (500ms)
- [ ] **Opacity Fade:** `duration-200` (200ms)
- [ ] **Button Hover:** `transition-all` default (150ms)

### Keyframe Animations

- [ ] **Spinner:** Smooth rotation, continuous
- [ ] **Pulse:** Slow 3s loop
- [ ] **Slide Up:** 300ms ease-out
- [ ] **Fade In:** 200ms ease-in

---

## Accessibility Checks

### WCAG AA Compliance

- [ ] **Color Contrast:** 4.5:1 ratio for text (white on dark backgrounds)
- [ ] **Focus Indicators:** Visible blue ring on all interactive elements
- [ ] **Semantic HTML:** Proper heading hierarchy (h1 → h2 → h3)
- [ ] **Alt Text:** All images have descriptive alt attributes
- [ ] **ARIA Labels:** Buttons/icons have labels or visible text
- [ ] **Keyboard Navigation:** All features accessible without mouse

### Special Considerations

- [ ] **Reduced Motion:** Animations disabled if user prefers
- [ ] **High Contrast:** Borders thicker in high contrast mode
- [ ] **Screen Readers:** Meaningful text, not just icons
- [ ] **Touch Targets:** 44px minimum for mobile

---

## Browser Compatibility

- [ ] **Chrome 90+:** All features working
- [ ] **Firefox 88+:** All features working
- [ ] **Safari 14+:** All features working
- [ ] **Edge 90+:** All features working
- [ ] **Mobile Safari:** Touch interactions smooth
- [ ] **Mobile Chrome:** Virtual scroll performant

---

## Performance Checks

### Virtual Scrolling

- [ ] **Smooth 60fps:** No jank when scrolling
- [ ] **Visible Cards Only:** ~30-40 rendered at once
- [ ] **Large Datasets:** Test with 1000+ contacts
- [ ] **Memory Stable:** No memory leaks on long sessions

### Load Times

- [ ] **Initial Render:** <500ms for gallery
- [ ] **Detail View:** <300ms transition
- [ ] **Search Filter:** <100ms response
- [ ] **Hover Effects:** Instant, no lag

### Image Optimization

- [ ] **Avatars:** Lazy loaded if needed
- [ ] **Fallback:** Gradient initials if no avatar
- [ ] **No Layout Shift:** Placeholder dimensions

---

## Final Visual Polish

### Overall Aesthetic

- [ ] **Consistent Spacing:** All elements aligned properly
- [ ] **Visual Hierarchy:** Clear importance flow
- [ ] **Color Harmony:** Relationship colors complement design
- [ ] **Typography Scale:** Readable at all sizes
- [ ] **White Space:** Not cramped, breathing room
- [ ] **Shadows:** Subtle elevation, not overdone
- [ ] **Borders:** Consistent thickness and radius
- [ ] **Icons:** Aligned, proper size

### Dark Theme Quality

- [ ] **No Pure Black:** Use gray-900 for depth
- [ ] **Glass Effects:** Subtle blur enhances design
- [ ] **Glow Effects:** AI panel has soft blue glow
- [ ] **Contrast:** White text readable on all backgrounds
- [ ] **Gradients:** Smooth transitions, no banding

### Micro-interactions

- [ ] **Button Press:** Slight scale or color shift
- [ ] **Card Click:** Smooth transition to detail
- [ ] **Tab Switch:** Content fades in
- [ ] **Dropdown Open:** Slide down animation
- [ ] **Checkbox Toggle:** Instant feedback

---

## Testing Scenarios

### Scenario 1: First Visit
1. Page loads with spinner
2. 6 mock contacts appear in grid
3. Relationship colors match scores
4. Hover effects work on all cards
5. Search filters results
6. Filters panel opens/closes

### Scenario 2: Browse Contacts
1. Scroll through contacts smoothly
2. Virtual scrolling loads seamlessly
3. Click contact card
4. Detail view opens with all sections
5. Back button returns to gallery
6. Previous scroll position preserved

### Scenario 3: AI Insights
1. Open contact detail
2. AI insights panel displays
3. Talking points readable
4. Recommended actions have checkboxes
5. Topics displayed as badges
6. Communication style visible

### Scenario 4: Mobile Experience
1. Single column grid
2. Cards stack vertically
3. Touch scroll is smooth
4. Detail view readable
5. Actions bar not overlapping
6. Filters dropdown fits screen

### Scenario 5: Accessibility
1. Tab through all interactive elements
2. Focus indicators visible
3. Screen reader announces content
4. Keyboard shortcuts work
5. Reduced motion respected
6. High contrast mode readable

---

## Sign-Off Checklist

- [ ] **Colors:** All relationship health colors correct
- [ ] **Typography:** Font sizes and weights match spec
- [ ] **Spacing:** Consistent padding and margins
- [ ] **Components:** All 10 components render correctly
- [ ] **Responsive:** Works on mobile, tablet, desktop
- [ ] **Interactions:** Hover, active, focus states working
- [ ] **Animations:** Smooth and performant
- [ ] **Accessibility:** WCAG AA compliant
- [ ] **Performance:** Virtual scroll smooth at 60fps
- [ ] **Browser:** Works in all modern browsers

---

**Visual QA Sign-Off:**

- [ ] Designer Approval
- [ ] Developer Approval
- [ ] QA Approval
- [ ] Product Owner Approval

**Date:** _________________

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

**Status:** Ready for Visual Review
**Next Step:** Complete visual QA, then proceed to Phase 2 (Priorities Feed)
