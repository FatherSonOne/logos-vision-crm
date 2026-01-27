# Light Mode Color Reference Guide

## Quick Reference: Light vs Dark Mode Colors

### Background Gradients

#### Page Background
```tsx
// Light Mode
className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"

// Dark Mode
className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"

// Combined (Recommended)
className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"
```

#### Card Backgrounds
```tsx
// Standard Card
className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm shadow-md dark:shadow-none"

// Accent Card (AI Insights, etc.)
className="bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-300/30 dark:border-blue-500/30 shadow-lg dark:shadow-none"

// Completed Items
className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-500/30"

// Info Panels
className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/30"

// Warning Panels
className="bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/50"
```

### Typography Colors

#### Headings and Primary Text
```tsx
// Page Titles (H1)
className="text-gray-900 dark:text-white"

// Section Headings (H2-H3)
className="text-gray-900 dark:text-white"

// Body Text
className="text-gray-700 dark:text-gray-200"
```

#### Secondary and Tertiary Text
```tsx
// Secondary Text (descriptions, labels)
className="text-gray-600 dark:text-gray-400"

// Tertiary Text (metadata, timestamps)
className="text-gray-500 dark:text-gray-500"

// Disabled Text
className="text-gray-400 dark:text-gray-600"
```

#### Links and Interactive Text
```tsx
// Standard Links
className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"

// Company Names (special links)
className="text-blue-600 dark:text-blue-400 hover:underline"

// Active Tab
className="text-blue-600 dark:text-blue-400"

// Inactive Tab
className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
```

### Border Colors

#### Standard Borders
```tsx
// Dividers and Card Borders
className="border-gray-200 dark:border-gray-700"

// Section Dividers
className="border-t border-gray-200 dark:border-gray-700"

// Avatar/Image Borders
className="border-2 border-gray-300 dark:border-gray-600"
```

#### Accent Borders
```tsx
// Primary Accent
className="border border-blue-300 dark:border-blue-500/30"

// Success Accent
className="border border-green-300 dark:border-green-500/30"

// Warning Accent
className="border border-amber-300 dark:border-amber-500/50"

// Danger Accent
className="border border-red-300 dark:border-red-500/30"
```

#### Relationship Score Borders (Consistent across modes)
```tsx
// Strong (85-100)
className="border-2 border-green-500"

// Good (70-84)
className="border-2 border-blue-500"

// Moderate (50-69)
className="border-2 border-amber-500"

// At-risk (30-49)
className="border-2 border-orange-500"

// Dormant (0-29)
className="border-2 border-red-500"
```

### Badge Colors

#### Badge Component Base
```tsx
// Primary Badge
className="bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"

// Secondary Badge
className="bg-gray-200 text-gray-700 border border-gray-300 dark:bg-gray-600/20 dark:text-gray-300 dark:border-gray-600/30"

// Success Badge
className="bg-green-100 text-green-700 border border-green-300 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30"

// Info Badge
className="bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-400/20 dark:text-blue-300 dark:border-blue-400/30"

// Warning Badge
className="bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"

// Danger Badge
className="bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30"
```

#### Priority Badges
```tsx
// High Priority
bg: "bg-red-200/80 dark:bg-red-500/20"
text: "text-red-700 dark:text-red-300"
border: "border-red-400 dark:border-red-500/50"

// Medium Priority
bg: "bg-amber-200/80 dark:bg-amber-500/20"
text: "text-amber-700 dark:text-amber-300"
border: "border-amber-400 dark:border-amber-500/50"

// Low Priority
bg: "bg-blue-200/80 dark:bg-blue-500/20"
text: "text-blue-700 dark:text-blue-300"
border: "border-blue-400 dark:border-blue-500/50"

// Opportunity
bg: "bg-purple-200/80 dark:bg-purple-500/20"
text: "text-purple-700 dark:text-purple-300"
border: "border-purple-400 dark:border-purple-500/50"
```

### Trend Indicator Colors

```tsx
// Rising Trend
bg: "bg-green-200/60 dark:bg-green-400/20"
text: "text-green-600 dark:text-green-400"

// Stable Trend
bg: "bg-blue-200/60 dark:bg-blue-400/20"
text: "text-blue-600 dark:text-blue-400"

// Falling Trend
bg: "bg-orange-200/60 dark:bg-orange-400/20"
text: "text-orange-600 dark:text-orange-400"

// New Contact
bg: "bg-purple-200/60 dark:bg-purple-400/20"
text: "text-purple-600 dark:text-purple-400"

// Dormant
bg: "bg-gray-200/60 dark:bg-gray-400/20"
text: "text-gray-600 dark:text-gray-400"
```

### Button Colors

#### Primary Button
```tsx
className="bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm hover:shadow-md"
// Same in both modes
```

#### Secondary Button
```tsx
// Light Mode
className="bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 border border-gray-300"

// Dark Mode
className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500 dark:border-gray-600"

// Combined
className="bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600"
```

#### Success Button
```tsx
className="bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-sm hover:shadow-md"
// Same in both modes
```

#### Danger Button
```tsx
className="bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md"
// Same in both modes
```

### Form Elements

#### Input Fields
```tsx
// Light Mode
className="bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"

// Dark Mode
className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"

// Combined
className="bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
```

#### Checkboxes
```tsx
// Light Mode
className="border-gray-400 bg-white text-blue-500 focus:ring-blue-500 focus:ring-offset-white"

// Dark Mode
className="dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-offset-gray-900"

// Combined
className="border-gray-400 bg-white text-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-offset-gray-900"
```

#### Filter Chips (Active)
```tsx
className="bg-blue-500 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/50"
```

#### Filter Chips (Inactive)
```tsx
className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
```

### Loading States

#### Spinner
```tsx
className="border-blue-500 dark:border-blue-400"
```

#### Skeleton Elements
```tsx
className="bg-gray-300 dark:bg-gray-700 animate-pulse"
```

### Shadow System

#### Cards
```tsx
// Light Mode: Add depth with shadows
className="shadow-md"

// Dark Mode: Remove shadows (rely on borders/backgrounds)
className="dark:shadow-none"

// Combined
className="shadow-md dark:shadow-none"
```

#### Accent Cards
```tsx
className="shadow-lg dark:shadow-none"
```

#### Hover States
```tsx
className="hover:shadow-xl"
```

### Special Components

#### Tab Count Badges
```tsx
// Active Tab
className="bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300"

// Inactive Tab
className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
```

#### Value Indicator Badges
```tsx
// High Value
className="bg-green-200 text-green-700 border border-green-400 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30"

// Standard Value
className="bg-gray-200 text-gray-700 border border-gray-300 dark:bg-gray-600/20 dark:text-gray-300 dark:border-gray-600/30"
```

## Color Consistency Rules

### 1. Relationship Colors
Never change across modes - they're semantic and need instant recognition:
- Green = Strong/Success
- Blue = Good/Info
- Amber = Moderate/Warning
- Orange = At-risk
- Red = Dormant/Danger

### 2. Text Hierarchy
Maintain 3 levels:
1. **Primary**: Headings, important content (`gray-900`/`white`)
2. **Secondary**: Body text, labels (`gray-600-700`/`gray-200-400`)
3. **Tertiary**: Metadata, timestamps (`gray-500`/`gray-500`)

### 3. Interactive States
Always provide visual feedback:
- **Hover**: Slightly darker shade
- **Active**: Even darker
- **Focus**: Blue ring with proper offset
- **Disabled**: 50% opacity

### 4. Contrast Requirements
- **Normal text**: 4.5:1 minimum
- **Large text** (18px+): 3:1 minimum
- **UI Components**: 3:1 minimum
- **Graphical objects**: 3:1 minimum

## Quick Copy-Paste Snippets

### Standard Card Pattern
```tsx
<div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-md dark:shadow-none border border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
    Title
  </h2>
  <p className="text-gray-700 dark:text-gray-200">
    Content
  </p>
</div>
```

### Accent Panel Pattern
```tsx
<div className="bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm rounded-lg p-6 border border-blue-300/30 dark:border-blue-500/30 shadow-lg dark:shadow-none">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
    Accent Content
  </h3>
  <p className="text-gray-700 dark:text-gray-200">
    Description
  </p>
</div>
```

### Badge Pattern
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
  Badge Text
</span>
```

### Button Pattern
```tsx
// Primary
<button className="btn btn-primary">
  Action
</button>

// Secondary
<button className="btn btn-secondary">
  Action
</button>
```

---

**Last Updated**: January 25, 2026
**Maintained By**: UI Designer Agent
