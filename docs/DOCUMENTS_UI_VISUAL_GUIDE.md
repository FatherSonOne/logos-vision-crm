# Documents Section UI Visual Guide
**Phase 2 Integration Reference - Visual Design Specification**

This document provides comprehensive visual descriptions and wireframes for the Documents Library UI components to validate proper integration and appearance.

---

## Table of Contents
1. [Color Scheme & Design Tokens](#color-scheme--design-tokens)
2. [Main Layout Structure](#main-layout-structure)
3. [Component Hierarchy](#component-hierarchy)
4. [Grid View Layout](#grid-view-layout)
5. [List View Layout](#list-view-layout)
6. [Document Card Component](#document-card-component)
7. [Document Viewer Modal](#document-viewer-modal)
8. [AI Insights Panel](#ai-insights-panel)
9. [Search Interface](#search-interface)
10. [Filter Panels](#filter-panels)
11. [Visual States](#visual-states)
12. [Responsive Behavior](#responsive-behavior)
13. [Animation & Transitions](#animation--transitions)

---

## Color Scheme & Design Tokens

### Primary Colors
- **Brand Rose**: `#f43f5e` (rose-500) - Primary actions, active states
- **AI Cyan**: `#06b6d4` (cyan-500) - AI features, insights
- **AI Blue**: `#3b82f6` (blue-500) - AI indicators, gradients

### Category Gradient Colors
```
Contract:      from-rose-500 to-pink-500      (#f43f5e → #ec4899)
Invoice:       from-emerald-500 to-green-500  (#10b981 → #22c55e)
Proposal:      from-blue-500 to-cyan-500      (#3b82f6 → #06b6d4)
Report:        from-purple-500 to-violet-500  (#a855f7 → #8b5cf6)
Presentation:  from-orange-500 to-amber-500   (#f97316 → #f59e0b)
Memo:          from-slate-500 to-gray-500     (#64748b → #6b7280)
```

### Confidence Indicators
```
Very High (≥90%): emerald-500 (#10b981)
High (≥70%):      blue-500 (#3b82f6)
Medium (≥50%):    amber-500 (#f59e0b)
Low (<50%):       orange-500 (#f97316)
```

### Background Colors
- **Light Mode**:
  - Page: slate-50 (#f8fafc)
  - Cards: white (#ffffff)
  - Hover: slate-100 (#f1f5f9)
- **Dark Mode**:
  - Page: slate-900 (#0f172a)
  - Cards: slate-800 (#1e293b)
  - Hover: slate-700 (#334155)

### Shadow System
```css
sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
md:  0 4px 6px -1px rgb(0 0 0 / 0.1)
lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

---

## Main Layout Structure

### ASCII Wireframe - Full Page Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════════════╗ │
│ ║ HEADER BAR - White bg, border-b slate-200                         ║ │
│ ║ ┌────────┬──────────────────────────┬─────────────────────────┐  ║ │
│ ║ │ 📁     │                          │  [Library] [Analytics] │  ║ │
│ ║ │ FileHub│  Enterprise doc mgmt...  │  [Import from Pulse]   │  ║ │
│ ║ └────────┴──────────────────────────┴─────────────────────────┘  ║ │
│ ║                                                                   ║ │
│ ║ [DEV ONLY: Feature flags indicator - blue-50 bg]                 ║ │
│ ╚═══════════════════════════════════════════════════════════════════╝ │
│                                                                         │
│ ╔═══════════════════════════════════════════════════════════════════╗ │
│ ║ SEARCH BAR - White bg, border-b slate-200                         ║ │
│ ║ ┌───────────────────────────────────────────────────────────────┐ ║ │
│ ║ │ [🔍AI] Search documents with AI...                [🔽]      │ ║ │
│ ║ └───────────────────────────────────────────────────────────────┘ ║ │
│ ║ [Recent] [Favorites] [Shared] [From Pulse] [AI Enhanced]         ║ │
│ ╚═══════════════════════════════════════════════════════════════════╝ │
│                                                                         │
│ ╔═══════════════════════════════════════════════════════════════════╗ │
│ ║ TOOLBAR - slate-50 bg, border-b slate-200                         ║ │
│ ║  Showing 24 of 156 documents              [Grid Icon] [List Icon] ║ │
│ ╚═══════════════════════════════════════════════════════════════════╝ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ CONTENT AREA - slate-50 bg, overflow-auto, p-6                  │   │
│ │                                                                  │   │
│ │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐               │   │
│ │  │ [Card] │  │ [Card] │  │ [Card] │  │ [Card] │  Grid View    │   │
│ │  └────────┘  └────────┘  └────────┘  └────────┘               │   │
│ │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐               │   │
│ │  │ [Card] │  │ [Card] │  │ [Card] │  │ [Card] │               │   │
│ │  └────────┘  └────────┘  └────────┘  └────────┘               │   │
│ │                                                                  │   │
│ └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Dimension Specifications
- **Header Height**: 80px + 60px (if dev flags shown)
- **Search Bar Height**: 88px (with quick filters)
- **Toolbar Height**: 52px
- **Content Padding**: 24px (1.5rem)
- **Max Container Width**: Full viewport width
- **Responsive Breakpoints**:
  - Mobile: < 640px (1 column grid)
  - Tablet: 640px - 1023px (2 column grid)
  - Desktop: 1024px - 1279px (3 column grid)
  - Large: ≥ 1280px (4 column grid)

---

## Component Hierarchy

### Tree Structure
```
DocumentsHub (Main Container)
├── Header Section
│   ├── Logo & Title (FileHub with folder icon)
│   ├── Subtitle Text (Enterprise document management...)
│   ├── View Switcher Buttons
│   │   ├── Library Button (active: rose-500, inactive: slate-100)
│   │   └── Analytics Button (when enabled)
│   ├── Import from Pulse Button (purple-500, when enabled)
│   └── Feature Flags Indicator (dev only, blue-50 bg)
│
├── Search Section (DocumentSearch component)
│   ├── Search Input Bar
│   │   ├── Search Icon with AI Sparkle
│   │   ├── Input Field
│   │   ├── Loading Indicator (when searching)
│   │   ├── Clear Button (when query exists)
│   │   └── Filter Toggle Button
│   ├── AI Search Badge (gradient cyan-to-blue)
│   ├── Quick Filter Pills
│   │   ├── Recent (rose gradient when active)
│   │   ├── Favorites (amber gradient when active)
│   │   ├── Shared (blue gradient when active)
│   │   ├── From Pulse (cyan-purple gradient when active)
│   │   └── AI Enhanced (cyan-blue gradient when active)
│   ├── Advanced Filters Panel (expandable)
│   └── Search Results Dropdown
│
├── Toolbar Section
│   ├── Document Count Display
│   └── View Mode Toggles (Grid/List icons)
│
├── Content Area
│   ├── Grid View (default)
│   │   └── DocumentCard[] (responsive grid)
│   ├── List View
│   │   └── DocumentCard[] (vertical stack)
│   └── Empty State
│       ├── Large Document Icon
│       ├── "No documents" Message
│       └── Import from Pulse Button (when enabled)
│
├── Modals (Conditional)
│   ├── PulseBrowser (when Import clicked)
│   │   └── Full modal overlay (black/50 backdrop)
│   └── DocumentViewer (when document clicked)
│       ├── Document Preview Area
│       └── AI Insights Sidebar (when AI data exists)
```

---

## Grid View Layout

### Visual Layout Specification
```
┌─────────────────────────────────────────────────────────────────────┐
│  Grid: 1-4 columns (responsive), gap-6 (24px)                      │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ ┏━━━━━━━━━━━━━━┓│  │ ┏━━━━━━━━━━━━━━┓│  │ ┏━━━━━━━━━━━━━━┓│ │
│  │ ┃              ┃│  │ ┃              ┃│  │ ┃              ┃│ │
│  │ ┃  Thumbnail   ┃│  │ ┃  Icon Area   ┃│  │ ┃  Gradient    ┃│ │
│  │ ┃  192px tall  ┃│  │ ┃  h-48        ┃│  │ ┃  Background  ┃│ │
│  │ ┃              ┃│  │ ┃              ┃│  │ ┃              ┃│ │
│  │ ┗━━━━━━━━━━━━━━┛│  │ ┗━━━━━━━━━━━━━━┛│  │ ┗━━━━━━━━━━━━━━┛│ │
│  │ ┌──────────────┐│  │ ┌──────────────┐│  │ ┌──────────────┐│ │
│  │ │ Document.pdf ││  │ │ Report.docx  ││  │ │ Contract.pdf ││ │
│  │ │              ││  │ │              ││  │ │              ││ │
│  │ │ [AI Summary] ││  │ │ AI processed ││  │ │ [Tags x3 +2] ││ │
│  │ │              ││  │ │              ││  │ │              ││ │
│  │ │ Jan 15  2.5MB││  │ │ Jan 14  1.2MB││  │ │ Jan 13  850KB││ │
│  │ └──────────────┘│  │ └──────────────┘│  │ └──────────────┘│ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Grid Specifications
- **Card Width**: Auto (fills grid column)
- **Card Gap**: 24px (gap-6)
- **Grid Columns**:
  - Mobile (< 640px): 1 column
  - Tablet (640px - 1023px): 2 columns
  - Desktop (1024px - 1279px): 3 columns
  - Large (≥ 1280px): 4 columns

---

## List View Layout

### Visual Layout Specification
```
┌─────────────────────────────────────────────────────────────────────┐
│  Stack: vertical, gap-4 (16px)                                      │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ┏━━━━━━┓  Document Name.pdf              [Tags] Jan 15 2.5MB │ │
│  │ ┃ Icon ┃  AI summary preview text...     [Star] [Download]   │ │
│  │ ┗━━━━━━┛  Category: Contract   AI: 95%   [View] [⋮ Menu]     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ┏━━━━━━┓  Report Q4 2024.docx            [Tags] Jan 14 1.2MB │ │
│  │ ┃ Icon ┃  AI processed quarterly report  [Star] [Download]   │ │
│  │ ┗━━━━━━┛  Category: Report     AI: 88%   [View] [⋮ Menu]     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### List View Specifications
- **Card Height**: Auto (variable based on content)
- **Card Padding**: 16px
- **Gap Between Cards**: 16px (space-y-4)
- **Icon Size**: 64px × 64px (left side)
- **Full Width**: Stretches to container width

---

## Document Card Component

### Grid Card - Detailed Visual Breakdown
```
┌──────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │  ← Thumbnail/Icon Area (h-48)
│ ┃ [Pulse Badge]     [★ Favorite] ┃ │     Gradient background based on category
│ ┃                                 ┃ │     Opacity-80 white icon centered
│ ┃         [File Icon]             ┃ │     or Image thumbnail if available
│ ┃          64x64                  ┃ │
│ ┃                                 ┃ │  ← On Hover: Black/60 overlay appears
│ ┃ [AI Badge: Contract]            ┃ │     with [Eye] [Download] buttons
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │     and [⋮ More] in top-right
├──────────────────────────────────────┤
│ Quarterly Report 2024.pdf            │  ← Document name (font-semibold)
│                                      │     Max 2 lines (line-clamp-2)
│ This is the AI-generated summary     │  ← AI summary (text-xs, text-slate-600)
│ text that provides context...        │     Max 2 lines, only if AI processed
│                                      │
│ [contract] [legal] [2024] +2         │  ← Auto-tags (max 3 shown)
│                                      │     slate-100 bg, rounded-md
├──────────────────────────────────────┤     border-t divider
│ 📅 Jan 15, 2024        2.5 MB  [v2] │  ← Footer metadata
│                                      │     Date, size, version badge
│ ● AI Enhanced           95% confident│  ← AI indicator (if processed)
└──────────────────────────────────────┘     Cyan dot + confidence score
```

### Card Visual States

#### Default State
```
- Background: white (dark: slate-800)
- Border: 1px slate-200 (dark: slate-700)
- Shadow: sm
- Transform: none
```

#### Hover State
```
- Border: rose-300 (dark: rose-500/50)
- Shadow: lg
- Transform: translateY(-4px)
- Duration: 300ms
- Overlay appears on thumbnail with action buttons
- Favorite star button fades in (opacity 0→100)
```

#### Active/Clicked State
```
- Brief scale animation
- Triggers document viewer modal
```

### Badge Visual Specifications

#### Pulse Source Badge
```
┌──────────────────┐
│ [⚡] From Pulse  │  ← Purple-500 bg, white text
└──────────────────┘     Absolute positioned top-2 left-2
```

#### AI Classification Badge
```
┌─────────────────────┐
│ ● Contract         │  ← Gradient cyan-to-blue bg
└─────────────────────┘     Confidence dot (colored by level)
                            Rounded-full, shadow-lg
                            Shows classification + confidence
```

#### Version Badge
```
┌─────┐
│ v2  │  ← Blue-100 bg (dark: blue-900/30)
└─────┘     Blue-600 text, small, rounded
```

### Icon System
```
PDF/Document:    [📄] FileText icon (w-12 h-12)
Image:           [🖼️] Image icon
Spreadsheet:     [📊] FileSpreadsheet icon
Other:           [📁] Generic File icon

All icons: text-white opacity-80 on gradient background
```

---

## Document Viewer Modal

### Full Layout Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│ [████████████████████ Full Screen Overlay - black/80 backdrop ████████] │
│                                                                          │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ HEADER BAR - slate-800 bg, border-b slate-700, px-6 py-4          ┃ │
│ ┃ ┌──────────────────────────────────┬──────────────────────────┐  ┃ │
│ ┃ │ Quarterly Report 2024.pdf        │  [👁️] [⬇] [↗] [🖨] [⛶] │  ┃ │
│ ┃ │ PDF • 2.5 MB • v2                │  [X Close]               │  ┃ │
│ ┃ └──────────────────────────────────┴──────────────────────────┘  ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                          │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ CONTROLS - slate-800/50 bg         ┃                             ┃ │
│ ┃ [−] 100% [+] [↻] [Reset] [◄ Pg 1 ►]┃                             ┃ │
│ ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫  AI INSIGHTS SIDEBAR        ┃ │
│ ┃                                     ┃  (w-96, slate-800 bg)       ┃ │
│ ┃                                     ┃                             ┃ │
│ ┃    DOCUMENT PREVIEW AREA            ┃  ┌───────────────────────┐ ┃ │
│ ┃    (flex-1, slate-900 bg)           ┃  │ [✨] AI Insights      │ ┃ │
│ ┃                                     ┃  │ Powered by AI...      │ ┃ │
│ ┃    ┌─────────────────────────┐      ┃  ├───────────────────────┤ ┃ │
│ ┃    │                         │      ┃  │ Tabs: [Overview]     │ ┃ │
│ ┃    │  [Document Content]     │      ┃  │       [Tags]         │ ┃ │
│ ┃    │  • PDF renders here     │      ┃  │       [Entities]     │ ┃ │
│ ┃    │  • Image displays here  │      ┃  │       [Details]      │ ┃ │
│ ┃    │  • Text shows here      │      ┃  ├───────────────────────┤ ┃ │
│ ┃    │                         │      ┃  │                       │ ┃ │
│ ┃    │  Scaled & Transformed   │      ┃  │  [Tab Content]        │ ┃ │
│ ┃    │  by zoom & rotation     │      ┃  │  • Classification     │ ┃ │
│ ┃    │                         │      ┃  │  • Summary            │ ┃ │
│ ┃    └─────────────────────────┘      ┃  │  • Key Points         │ ┃ │
│ ┃                                     ┃  │  • Tags               │ ┃ │
│ ┃                                     ┃  │  • Entities           │ ┃ │
│ ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫  │                       │ ┃ │
│ ┃ FOOTER - slate-800 bg, border-t    ┃  └───────────────────────┘ ┃ │
│ ┃ Created: Jan 15  Modified: Jan 16  ┃                             ┃ │
│ ┃              Press [ESC] to close  ┃                             ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Header Section Specifications
- **Height**: 80px
- **Background**: slate-800
- **Border**: border-b slate-700
- **Padding**: px-6 py-4
- **Text**: white for title, slate-400 for metadata
- **Buttons**: All slate-700 bg with slate-300 text
  - Hover: slate-600 bg
  - Close button: rose-600 bg, white text

### Control Bar Specifications
- **Height**: 56px
- **Background**: slate-800/50 (semi-transparent)
- **Border**: border-b slate-700
- **Controls Layout**: Centered horizontally
- **Button Styles**:
  - Zoom controls: slate-700 bg, rounded-lg
  - Disabled state: opacity-50, cursor-not-allowed
  - Active zoom: slate-300 text, 4rem min-width

### Preview Area Specifications
- **Background**: slate-900
- **Padding**: p-8
- **Content**: Centered with flexbox
- **Transform**: Applied via inline style
  - Scale: zoom/100
  - Rotate: rotation deg
  - Origin: center
- **Transition**: 300ms for smooth transforms

### AI Sidebar Specifications
- **Width**: 384px (w-96)
- **Background**: slate-800
- **Border**: border-l slate-700
- **Animation**: slide-in-from-right 300ms
- **Toggle**: Eye/EyeOff button in header
  - Active (shown): cyan-500 bg
  - Inactive (hidden): slate-700 bg

### Footer Specifications
- **Height**: 48px
- **Background**: slate-800
- **Border**: border-t slate-700
- **Text**: xs, slate-400
- **Keyboard Hint**:
  - "Press" text: slate-500
  - ESC key: slate-700 bg, slate-300 text, rounded, font-mono

### Action Button Colors
```
Download:  slate-700 → slate-600 hover
Share:     slate-700 → slate-600 hover
Print:     slate-700 → slate-600 hover
External:  slate-700 → slate-600 hover
Fullscreen: slate-700 → slate-600 hover
Close:     rose-600 → rose-700 hover (white text)
```

---

## AI Insights Panel

### Panel Structure
```
┌─────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ [✨] AI Insights              ┃ │  ← Header (p-4, border-b)
│ ┃ Powered by AI analysis        ┃ │     Gradient cyan-blue icon box
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │     Title + subtitle
├─────────────────────────────────────┤
│ ┌──────┬──────┬──────┬──────────┐  │  ← Tab Bar (slate-50 bg)
│ │[🧠]  │[🏷️] │[👥] │[ℹ️]      │  │     4 tabs with icons
│ │Over- │Tags  │Enti- │Details   │  │     Active: white bg, cyan text
│ │view  │      │ties  │          │  │     Inactive: slate-600 text
│ └──────┴──────┴──────┴──────────┘  │     Active indicator: cyan gradient bottom border
├─────────────────────────────────────┤
│                                     │  ← Content Area (p-4, overflow-y-auto)
│ ┌─────────────────────────────────┐ │
│ │ 📊 Classification               │ │     Gradient cyan-blue background
│ │ ┌───────────────────────────┐   │ │     Large category name
│ │ │ Contract            [●95%]│   │ │     Confidence badge (white bg)
│ │ └───────────────────────────┘   │ │     Confidence bar (animated)
│ │ Confidence: ████████░░ 95%      │ │     Reasoning quote (italic)
│ │ "Legal document with terms..."  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📈 Summary                      │ │     slate-50 bg box
│ │ This document outlines the      │ │     Leading relaxed text
│ │ key contractual obligations...  │ │     Small font, slate-700 text
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⚡ Key Points                   │ │     slate-50 bg box
│ │ ① Payment terms net 30 days     │ │     Numbered gradient badges
│ │ ② Deliverables due Q1 2024      │ │     Cyan-to-blue gradient circles
│ │ ③ Termination clause included   │ │     Left-aligned text
│ └─────────────────────────────────┘ │
│                                     │
│ Detected Language: [en]             │  ← Language badge (slate-100 bg)
│                                     │
└─────────────────────────────────────┘
```

### Tab Content Variations

#### Overview Tab
```
┌─────────────────────────────────┐
│ Classification Card             │  ← Gradient background, rounded-lg
│   Category + Confidence         │     Confidence dot + percentage
│   Progress bar animation        │     Reasoning text (italic, xs)
│                                 │
│ Summary Card                    │  ← Plain slate-50 bg
│   AI-generated summary text     │     Leading relaxed, small text
│                                 │
│ Key Points Card                 │  ← Numbered list with gradient badges
│   Numbered bullet points        │     Each point on separate line
│                                 │
│ Language Badge                  │  ← Small inline badge
└─────────────────────────────────┘
```

#### Tags Tab
```
┌─────────────────────────────────┐
│ 🏷️ Auto-Generated Tags          │  ← Section header
│                                 │
│ [contract] [legal] [2024]       │  ← Tag pills, gradient bg
│ [client-facing] [confidential]  │     Cyan-blue gradient
│ +3 more                         │     Copy button on hover
│                                 │
│ ✨ Suggested Tags               │  ← Section header
│                                 │
│ [terms] [agreement] [vendor]    │  ← Tag pills, slate-100 bg
│ [services] [quarterly]          │     Hover: slate-200
│                                 │     Copy button on hover
└─────────────────────────────────┘
```

#### Entities Tab
```
┌─────────────────────────────────┐
│ 👥 People (3 found)             │  ← Section header with count
│                                 │
│ ┌───────────────────────────┐   │
│ │ John Doe            ●95%  │   │  ← Entity card
│ │ "CEO mentioned in intro"  │   │     Name + confidence dot
│ │                     [📋]  │   │     Context text (xs)
│ └───────────────────────────┘   │     Copy button on hover
│                                 │
│ 🏢 Organizations (2 found)      │
│ ┌───────────────────────────┐   │
│ │ ACME Corp           ●98%  │   │
│ │ "Primary contractor"      │   │
│ └───────────────────────────┘   │
│                                 │
│ 📅 Dates (5 found)              │
│ ┌───────────────────────────┐   │
│ │ 2024-01-15          ●100% │   │
│ │ "Contract start date"     │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

#### Details Tab
```
┌─────────────────────────────────┐
│ ⏱️ Processing Time     1,234 ms │  ← Stat row
│                                 │
│ 🧠 AI Model   gemini-2.0-flash  │  ← Stat row
│                                 │
│ Text Extraction Quality  95%    │  ← Stat row with progress bar
│ ████████████████████░ 95%       │     Animated bar
│                                 │
│ ✨ Processed At                 │  ← Timestamp
│    Jan 15, 2024 3:45 PM         │
│                                 │
│ Extracted Text Preview          │  ← Large text area
│ ┌───────────────────────────┐   │     Mono font, xs text
│ │ This is the extracted...  │   │     Scrollable (max-h-48)
│ │ text from the document... │   │     [Copy All] button
│ │ continuing for 500 chars  │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

### Color Specifications for Confidence Indicators
```
Confidence Dot Colors:
Very High (≥90%): emerald-500 circle
High (≥70%):      blue-500 circle
Medium (≥50%):    amber-500 circle
Low (<50%):       orange-500 circle
```

---

## Search Interface

### Search Bar Component Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ [🔍✨] Search documents with AI...          [⏳] [✖] [🔽]   │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────┐               │
│ │ ✨ AI-Powered Semantic Search Active           │  ← Gradient badge
│ └─────────────────────────────────────────────────┘               │
│                                                                     │
│ Quick Filters:                                                      │
│ [⏰ Recent] [⭐ Favorites] [👥 Shared] [⚡ Pulse] [✨ AI]          │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ Advanced Filters                            [Clear All]     │   │
│ │ ┌─────────────────────┬─────────────────────┐               │   │
│ │ │ Category: [▼]       │ File Type: [▼]      │               │   │
│ │ ├─────────────────────┼─────────────────────┤               │   │
│ │ │ Date From: [date]   │ Date To: [date]     │               │   │
│ │ └─────────────────────┴─────────────────────┘               │   │
│ └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Search Input States

#### Default State
```
- Border: 2px slate-200 (dark: slate-700)
- Background: white (dark: slate-800)
- Icon: slate-400
- Placeholder: slate-400
- Sparkle: cyan-500, animate-pulse (if AI enabled)
```

#### Focus/Active State
```
- Border: 2px cyan-500 (glowing)
- Shadow: lg shadow-cyan-500/20
- Background: white (dark: slate-800)
- Icon: cyan-500
```

#### Loading State
```
- Spinner: cyan-600 border, transparent top
- Animate: spin
- Text: "Searching..." cyan-600
- Position: Right side before filter button
```

### Quick Filter Pills

#### Inactive State
```
┌─────────────────┐
│ [Icon] Label    │  ← slate-100 bg (dark: slate-800)
└─────────────────┘     slate-600 text (dark: slate-300)
                        Hover: slate-200 (dark: slate-700)
```

#### Active State
```
┌─────────────────┐
│ [Icon] Label    │  ← Gradient background (varies by filter)
└─────────────────┘     White text
                        Shadow-md

Recent:      rose-500 to pink-500
Favorites:   amber-500 to orange-500
Shared:      blue-500 to cyan-500
Pulse:       cyan-500 to purple-500
AI Enhanced: cyan-500 to blue-500
```

### Search Results Dropdown

```
┌─────────────────────────────────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Found 24 results                     ✨ AI Search         ┃ │  ← Header (sticky)
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │     slate-50 bg
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Quarterly Report 2024.pdf            📈 95%               │ │  ← Result item
│ │ This section discusses the quarterly financial...         │ │     Hover: slate-50
│ │ [contract] Matched in: name, content                      │ │     bg (dark: slate-900/50)
│ └───────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Client Proposal.docx                 📈 88%               │ │
│ │ The proposal outlines service delivery timeline...        │ │
│ │ [proposal] Matched in: name, tags                         │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Result Item Specifications
- **Padding**: px-4 py-3
- **Hover**: slate-50 bg (dark: slate-900/50)
- **Title**: font-medium, slate-900 (dark: white)
  - Hover: cyan-600 (dark: cyan-400)
- **Snippet**: text-sm, slate-600 (dark: slate-400), line-clamp-2
- **Metadata**: text-xs, slate-500 (dark: slate-400)
- **Relevance**:
  - Icon: TrendingUp
  - Color: Based on score (emerald/blue/amber/orange)
  - Format: "95%" with label

---

## Filter Panels

### Advanced Filters Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Advanced Filters                            [Clear All]     │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │                                                             │ │
│ │ ┌──────────────────────┐  ┌──────────────────────┐         │ │
│ │ │ Category             │  │ File Type            │         │ │
│ │ │ ┌──────────────────┐ │  │ ┌──────────────────┐ │         │ │
│ │ │ │ All Categories ▼ │ │  │ │ All Types      ▼ │ │         │ │
│ │ │ └──────────────────┘ │  │ └──────────────────┘ │         │ │
│ │ └──────────────────────┘  └──────────────────────┘         │ │
│ │                                                             │ │
│ │ ┌──────────────────────┐  ┌──────────────────────┐         │ │
│ │ │ Date From            │  │ Date To              │         │ │
│ │ │ ┌──────────────────┐ │  │ ┌──────────────────┐ │         │ │
│ │ │ │ [date picker]    │ │  │ │ [date picker]    │ │         │ │
│ │ │ └──────────────────┘ │  │ └──────────────────┘ │         │ │
│ │ └──────────────────────┘  └──────────────────────┘         │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Filter Panel Specifications
- **Background**: white (dark: slate-800)
- **Border**: 1px slate-200 (dark: slate-700)
- **Shadow**: lg
- **Padding**: p-4
- **Animation**: slide-in-from-top 200ms
- **Grid**: 2 columns on md+ screens, 1 column on mobile
- **Gap**: 16px (gap-4)

### Filter Input Specifications
- **Label**: text-sm, font-medium, slate-700 (dark: slate-300)
- **Input Background**: slate-50 (dark: slate-900)
- **Input Border**: 1px slate-200 (dark: slate-700)
- **Input Text**: slate-900 (dark: white)
- **Focus Ring**: 2px cyan-500
- **Rounded**: rounded-lg

---

## Visual States

### Empty State
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        ┌────────┐                           │
│                        │        │                           │
│                        │  📄   │  ← Large document icon    │
│                        │        │     w-24 h-24             │
│                        └────────┘     slate-300 color       │
│                                       (dark: slate-600)     │
│                                                             │
│                  No documents yet                           │  ← text-xl, font-semibold
│                                                             │     slate-900 (dark: white)
│          Upload your first document to get started          │  ← text-sm, slate-600
│                                                             │     (dark: slate-400)
│                                                             │
│              ┌──────────────────────────┐                   │
│              │  Import from Pulse       │  ← Button        │
│              └──────────────────────────┘     (if enabled)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────────────┐
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │░░░░░░░░│  │░░░░░░░░│  │░░░░░░░░│    │  ← Skeleton cards
│  │░░░░░░░░│  │░░░░░░░░│  │░░░░░░░░│    │     Pulse animation
│  │░░░░░░░░│  │░░░░░░░░│  │░░░░░░░░│    │     slate-200 bg
│  └────────┘  └────────┘  └────────┘    │
└─────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        ┌────────┐                           │
│                        │   ⚠️   │  ← Warning icon          │
│                        └────────┘     w-16 h-16             │
│                                       rose-500 color        │
│                                                             │
│                  Failed to load documents                   │  ← text-xl, font-semibold
│                                                             │     rose-900 (dark: rose-300)
│                  Please try again later                     │  ← text-sm, slate-600
│                                                             │
│              ┌──────────────────────────┐                   │
│              │     Retry Loading        │  ← Retry button  │
│              └──────────────────────────┘     rose-600 bg   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Search "No Results" State
```
┌─────────────────────────────────────────────────────────────┐
│                        ┌────────┐                           │
│                        │   🔍   │  ← Search icon           │
│                        └────────┘     w-12 h-12             │
│                                       opacity-50            │
│                                                             │
│                  No documents found                         │  ← text-sm
│                                                             │
│          Try adjusting your search terms or filters         │  ← text-xs
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Breakpoint Behavior Matrix

| Viewport | Grid Columns | Card Width | AI Sidebar | Search Filters |
|----------|-------------|------------|------------|----------------|
| < 640px  | 1 column    | 100%       | Overlay    | Stacked        |
| 640-1023 | 2 columns   | ~50%       | Overlay    | 2 columns      |
| 1024-1279| 3 columns   | ~33%       | Side panel | 2 columns      |
| ≥ 1280px | 4 columns   | ~25%       | Side panel | 2 columns      |

### Mobile Adaptations (< 640px)

#### Header Layout
```
┌─────────────────────────┐
│ 📁 FileHub             │  ← Stack vertically
│ Enterprise doc mgmt... │     Reduce padding
│                         │
│ [Library] [Analytics]   │  ← Full width buttons
│ [Import from Pulse]     │     Stack vertically
└─────────────────────────┘
```

#### Search Bar
```
┌─────────────────────────┐
│ [🔍] Search...    [🔽] │  ← Simplified
└─────────────────────────┘
│ Quick Filters:          │  ← Horizontal scroll
│ ◄ [Recent][Fav][AI] ►  │     overflow-x-auto
└─────────────────────────┘
```

#### Document Cards
```
┌─────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━┓ │  ← Full width
│ ┃ [Icon Area]       ┃ │     Single column
│ ┗━━━━━━━━━━━━━━━━━━━┛ │     Larger tap targets
│ Document name...      │
│ [Tags]                │
│ Jan 15    2.5 MB      │
└─────────────────────────┘
```

#### Document Viewer
```
┌─────────────────────────┐
│ [X] Report.pdf          │  ← Simplified header
├─────────────────────────┤     Hide some buttons
│                         │
│   [Document Preview]    │  ← Full width
│                         │     No sidebar
├─────────────────────────┤     Swipe gestures
│ [⬇] [↗] [👁️ AI]        │  ← Bottom toolbar
└─────────────────────────┘
```

### Tablet Adaptations (640-1023px)

#### Grid View
- 2 columns
- Card size: ~310px width
- Larger touch targets
- Simplified hover states (touch-based)

#### Search & Filters
- Full width search bar
- 2-column filter grid
- Larger dropdown buttons

### Desktop Optimizations (≥ 1024px)

#### Grid View
- 3-4 columns based on viewport
- Rich hover interactions
- Larger preview thumbnails
- More metadata visible

#### Document Viewer
- Side-by-side preview + AI panel
- Full control toolbar
- Keyboard shortcuts enabled

---

## Animation & Transitions

### Card Hover Animation
```css
Transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)
Properties:
  - transform: translateY(-4px)
  - box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1)
  - border-color: rose-300
```

### Card Overlay Fade
```css
Overlay Background: black/60
Opacity Transition: 300ms
Initial: opacity-0
Hover: opacity-100
```

### Modal Animations
```css
Backdrop: fade-in 200ms
Modal Container: scale + fade 300ms
AI Sidebar: slide-in-from-right 300ms
```

### Search Results Dropdown
```css
Animation:
  - fade-in 200ms
  - slide-in-from-top-2 200ms
Max-height transition: 300ms ease-in-out
```

### Loading States
```css
Skeleton Pulse: 2s infinite
Spinner Rotation: 1s linear infinite
AI Sparkle: pulse 2s infinite
```

### Confidence Bar Fill
```css
Width Transition: 500ms ease-out
Delay: 100ms (stagger effect)
```

### Button Interactions
```css
Hover Scale: scale(1.02) 150ms
Active Scale: scale(0.98) 100ms
Background: 150ms ease
```

### Tab Switching
```css
Tab Indicator: slide 200ms ease
Content: fade-in 150ms
Stagger: 50ms between elements
```

---

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Focus Indicators**: 2px cyan-500 outline, 2px offset
- **Keyboard Shortcuts**:
  - `ESC` - Close modal/dropdown
  - `←/→` - Navigate pages (PDF viewer)
  - `+/-` - Zoom in/out
  - `0` - Reset zoom

### Screen Reader Support
- All icons have `aria-label` or `title` attributes
- Semantic HTML structure (`<nav>`, `<main>`, `<article>`)
- Live regions for search results count
- Alt text for all images/thumbnails

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements have 3:1 contrast minimum
- Focus states have 3:1 contrast against background

### Touch Targets
- Minimum size: 44×44px for all interactive elements
- Adequate spacing between clickable items (≥8px)

---

## Feature Flag Visual Indicators

### Development Mode Indicator
```
┌─────────────────────────────────────────────────────────────────┐
│ Active Features (Development):                                  │
│ [useEnhancedLibrary: OFF] [aiFeatures: ON] [pulseSync: OFF]    │
│ [versionControl: OFF] [analytics: OFF]                          │
└─────────────────────────────────────────────────────────────────┘

Styling:
- Background: blue-50 (dark: blue-900/20)
- Border: 1px blue-200 (dark: blue-800)
- Text: blue-900 (dark: blue-100), xs font
- Enabled badges: green-100 bg, green-700 text
- Disabled badges: slate-100 bg, slate-500 text
- Only shown in development environment
```

---

## Brand Consistency

### FileHub Branding
- **Icon**: Folder icon (rose-500 color)
- **Name**: "FileHub" (consistent naming)
- **Tagline**: "Enterprise document management with AI-powered features"
- **Primary Color**: Rose-500 (#f43f5e)
- **AI Color**: Cyan-500 (#06b6d4) to Blue-500 (#3b82f6) gradient

### Icon Library
- **Source**: Lucide React icons
- **Size**: Consistent sizing (w-4/h-4, w-5/h-5, w-12/h-12)
- **Color**: Context-appropriate (slate for neutral, brand colors for actions)

---

## Validation Checklist

Use this checklist to validate the integrated UI:

### Layout & Structure
- [ ] Header displays correctly with FileHub logo and title
- [ ] View switcher buttons (Library/Analytics) are visible
- [ ] Import from Pulse button appears when `pulseSync` enabled
- [ ] Feature flags indicator shows in development mode
- [ ] Search bar is positioned correctly below header
- [ ] Toolbar shows document count and view toggles
- [ ] Content area has proper padding (24px)

### Grid View
- [ ] Cards display in responsive grid (1-4 columns based on viewport)
- [ ] Card gap is 24px (gap-6)
- [ ] Each card has gradient background based on category
- [ ] File icons display correctly when no thumbnail
- [ ] Thumbnails display when available

### Document Cards
- [ ] Thumbnail area is 192px tall (h-48)
- [ ] Hover overlay appears with action buttons
- [ ] Favorite star fades in on hover
- [ ] Pulse badge shows for synced documents (top-left)
- [ ] AI classification badge displays (top-left, below Pulse)
- [ ] Document name truncates to 2 lines
- [ ] AI summary shows if available (2 lines max)
- [ ] Tags display (max 3 visible + count)
- [ ] Footer shows date, size, and version badge
- [ ] AI Enhanced indicator shows at bottom with confidence
- [ ] Hover transform: translateY(-4px)
- [ ] Hover shadow increases to lg
- [ ] Hover border changes to rose-300

### Search Interface
- [ ] Search icon has AI sparkle when semantic search enabled
- [ ] Input has 2px border (slate-200 default, cyan-500 focus)
- [ ] Loading spinner appears during search
- [ ] Clear button (X) shows when query exists
- [ ] Filter toggle button functions
- [ ] AI-Powered badge displays below search bar
- [ ] Quick filter pills respond to clicks
- [ ] Active filters show gradient backgrounds
- [ ] Advanced filters panel slides in from top
- [ ] Filter inputs styled correctly
- [ ] Search results dropdown appears below search
- [ ] Results show relevance scores with color coding
- [ ] No results state displays properly

### Document Viewer
- [ ] Modal opens with full-screen overlay (black/80)
- [ ] Header displays document name and metadata
- [ ] Action buttons (Download, Share, Print, etc.) visible
- [ ] AI panel toggle button works (Eye/EyeOff icon)
- [ ] Control bar shows zoom, rotation controls
- [ ] PDF page navigation appears for PDFs
- [ ] Document preview renders correctly
- [ ] Zoom and rotation transforms apply smoothly
- [ ] AI sidebar slides in from right (384px width)
- [ ] Footer shows dates and ESC hint
- [ ] Close button (X) works and is rose-600 bg
- [ ] ESC key closes modal

### AI Insights Panel
- [ ] Header shows AI Insights title with gradient icon
- [ ] Four tabs display: Overview, Tags, Entities, Details
- [ ] Active tab has white bg and cyan text
- [ ] Active tab shows gradient bottom border
- [ ] Classification card displays with gradient bg
- [ ] Confidence badge shows with colored dot
- [ ] Confidence bar animates to percentage
- [ ] Summary card displays AI summary
- [ ] Key Points show numbered with gradient badges
- [ ] Tags display with copy buttons on hover
- [ ] Entity cards show with confidence indicators
- [ ] Details tab shows processing stats
- [ ] Extracted text preview is scrollable
- [ ] Copy buttons work and show checkmark on success

### Colors & Styling
- [ ] Rose-500 used for primary actions
- [ ] Cyan-500/Blue-500 used for AI features
- [ ] Category gradients match specification
- [ ] Confidence colors correct (emerald/blue/amber/orange)
- [ ] Dark mode colors display correctly
- [ ] Shadows applied at correct levels (sm/md/lg/2xl)

### Responsive Behavior
- [ ] Mobile (< 640px): 1 column grid
- [ ] Tablet (640-1023px): 2 column grid
- [ ] Desktop (1024-1279px): 3 column grid
- [ ] Large (≥ 1280px): 4 column grid
- [ ] Mobile: AI sidebar becomes overlay
- [ ] Mobile: Simplified header layout
- [ ] Mobile: Quick filters scroll horizontally

### Animations
- [ ] Card hover transform smooth (300ms)
- [ ] Card overlay fade (300ms)
- [ ] Modal backdrop fade-in (200ms)
- [ ] AI sidebar slide-in (300ms)
- [ ] Search results fade + slide (200ms)
- [ ] Confidence bars animate to width (500ms)
- [ ] Button interactions scale smoothly
- [ ] Tab switching smooth (200ms)

### States
- [ ] Empty state displays correctly
- [ ] Loading skeletons show during fetch
- [ ] Error state displays with retry button
- [ ] No results state in search
- [ ] Disabled button states have 50% opacity

### Accessibility
- [ ] Focus indicators visible (2px cyan-500 outline)
- [ ] Keyboard navigation works (Tab/Enter/ESC/arrows)
- [ ] All icons have titles/aria-labels
- [ ] Touch targets minimum 44×44px
- [ ] Color contrast meets WCAG AA

---

## Quick Reference: Key Visual Identifiers

### What Makes a Feature "AI-Enhanced"
- Cyan (#06b6d4) or Blue (#3b82f6) accent colors
- Sparkles (✨) icon
- Gradient backgrounds (cyan-to-blue)
- Confidence percentages/scores
- "AI" or "AI-Powered" labels
- Pulsing/animated indicators

### Category Color Map Quick Reference
```
Contract      → Rose-Pink gradient
Invoice       → Emerald-Green gradient
Proposal      → Blue-Cyan gradient
Report        → Purple-Violet gradient
Presentation  → Orange-Amber gradient
Memo/Other    → Slate-Gray gradient
```

### Component Spacing Standards
```
Header padding:        px-6 py-4
Content padding:       p-6
Card padding:          p-4
Card gap:              gap-6
List item gap:         space-y-4
Button gap:            gap-2
```

---

## Integration Validation Process

### Phase 1: Visual Inspection
1. Open Documents section in browser
2. Check feature flag indicator (dev mode)
3. Verify header layout and branding
4. Confirm search bar appearance
5. Check grid/list view rendering

### Phase 2: Interaction Testing
1. Click view mode toggles (Grid/List)
2. Test search input and filters
3. Click quick filter pills
4. Hover over document cards
5. Click to open document viewer
6. Test AI panel toggle
7. Navigate between AI insight tabs

### Phase 3: Responsive Testing
1. Resize viewport to mobile (< 640px)
2. Verify 1-column grid
3. Check mobile header layout
4. Test horizontal scroll on quick filters
5. Resize to tablet (640-1023px)
6. Verify 2-column grid
7. Resize to desktop (≥ 1024px)
8. Verify 3-4 column grid

### Phase 4: Dark Mode Testing
1. Enable dark mode
2. Verify color scheme switches correctly
3. Check contrast on all elements
4. Test hover states in dark mode

### Phase 5: Accessibility Testing
1. Navigate with Tab key
2. Verify focus indicators visible
3. Test keyboard shortcuts (ESC, arrows, +/-)
4. Use screen reader to check labels

---

## Troubleshooting Common Visual Issues

### Issue: Cards Not Displaying in Grid
**Check:**
- Container has `grid` class
- Grid columns set correctly (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`)
- Gap applied (`gap-6`)

### Issue: Hover Effects Not Working
**Check:**
- `group` class on card container
- `group-hover:` prefixes on child elements
- Transitions defined (`transition-all duration-300`)

### Issue: AI Indicators Not Showing
**Check:**
- Feature flag `aiFeatures` is enabled
- Document has `ai_metadata` property
- Icons importing correctly from `lucide-react`

### Issue: Colors Look Wrong
**Check:**
- Tailwind CSS classes spelled correctly
- Dark mode classes using `dark:` prefix
- Category color mapping function working

### Issue: Modal Not Full Screen
**Check:**
- `fixed inset-0` classes applied
- `z-50` for proper layering
- Backdrop has `bg-black/80`

---

**End of Visual Guide**

This document should be used as the source of truth for validating the Documents section UI after integration. Compare the actual rendered UI against these specifications to ensure proper implementation.
