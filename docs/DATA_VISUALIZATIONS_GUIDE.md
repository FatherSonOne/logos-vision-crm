# Data Visualizations & Micro-interactions Guide

## 🎨 Overview

Your Logos Vision CRM now has **beautiful data visualizations** and **smooth micro-interactions** that bring your data to life and create a delightful user experience!

---

## 📊 Data Visualization Components

### 1. **Sparklines** ⚡

Tiny, inline charts that show trends at a glance.

**Location:** `src/components/charts/Sparkline.tsx`

**Usage:**
```tsx
import { Sparkline } from '../src/components/charts/Sparkline';

<Sparkline 
  data={[5, 10, 5, 20, 8, 15, 12, 18, 14, 22, 19, 25]}
  color="#06b6d4"
  strokeWidth={2}
  height={40}
/>
```

**Props:**
- `data`: number[] - Array of data points
- `color`: string - Line color (default: '#06b6d4')
- `strokeWidth`: number - Line thickness (default: 2)
- `height`: number - Chart height in pixels (default: 40)

**Features:**
- ✅ Smooth animations (800ms ease-in-out)
- ✅ Minimal footprint
- ✅ Perfect for stat cards
- ✅ Responsive

**Where Used:**
- Dashboard stat cards (Organizations, Contacts, Pipeline, Projects)

---

### 2. **Progress Rings** 🎯

Circular progress indicators with percentage display.

**Location:** `src/components/charts/ProgressRing.tsx`

**Usage:**
```tsx
import { ProgressRing } from '../src/components/charts/ProgressRing';

<ProgressRing 
  progress={75}
  size={80}
  strokeWidth={6}
  color="#06b6d4"
  backgroundColor="#e2e8f0"
  showPercentage={true}
/>
```

**Props:**
- `progress`: number (0-100) - Completion percentage
- `size`: number - Ring diameter (default: 80)
- `strokeWidth`: number - Ring thickness (default: 6)
- `color`: string - Progress color (default: '#06b6d4')
- `backgroundColor`: string - Track color (default: '#e2e8f0')
- `showPercentage`: boolean - Display percentage text (default: true)

**Features:**
- ✅ Smooth SVG animations (1000ms)
- ✅ Responsive sizing
- ✅ Rounded stroke caps
- ✅ Dark mode compatible

**Where Used:**
- Project cards (appears on hover)
- Task completion indicators
- Any percentage-based metric

---

### 3. **Mini Area Charts** 📈

Compact area charts for displaying trends.

**Location:** `src/components/charts/MiniAreaChart.tsx`

**Usage:**
```tsx
import { MiniAreaChart } from '../src/components/charts/MiniAreaChart';

const data = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 45 },
  { name: 'Mar', value: 35 },
  { name: 'Apr', value: 60 }
];

<MiniAreaChart 
  data={data}
  color="#06b6d4"
  height={200}
  showAxis={true}
  showTooltip={true}
/>
```

**Props:**
- `data`: Array<{ name: string; value: number }> - Chart data
- `color`: string - Fill/stroke color (default: '#06b6d4')
- `height`: number - Chart height (default: 200)
- `showAxis`: boolean - Show axes (default: true)
- `showTooltip`: boolean - Show hover tooltip (default: true)

**Features:**
- ✅ Smooth gradient fills (20% opacity)
- ✅ Interactive tooltips
- ✅ Responsive container
- ✅ 1000ms animations

---

### 4. **Project Status Chart** 📊

Bar chart showing project distribution by status.

**Location:** `src/components/charts/ProjectStatusChart.tsx`

**Usage:**
```tsx
import { ProjectStatusChart } from '../src/components/charts/ProjectStatusChart';

const data = [
  { status: 'Planning', count: 5, color: '#94a3b8' },
  { status: 'In Progress', count: 12, color: '#10b981' },
  { status: 'Completed', count: 8, color: '#3b82f6' },
  { status: 'On Hold', count: 2, color: '#f59e0b' }
];

<ProjectStatusChart data={data} height={300} />
```

**Props:**
- `data`: Array<{ status: string; count: number; color: string }>
- `height`: number - Chart height (default: 300)

**Features:**
- ✅ Rounded bar tops
- ✅ Color-coded by status
- ✅ Interactive tooltips
- ✅ Grid lines and axes
- ✅ 1000ms animations

---

### 5. **Activity Timeline Chart** 📉

Multi-line chart tracking activity trends over time.

**Location:** `src/components/charts/ActivityTimelineChart.tsx`

**Usage:**
```tsx
import { ActivityTimelineChart } from '../src/components/charts/ActivityTimelineChart';

const data = [
  { date: 'Mon', calls: 5, emails: 12, meetings: 3 },
  { date: 'Tue', calls: 8, emails: 15, meetings: 5 },
  { date: 'Wed', calls: 6, emails: 10, meetings: 4 },
  { date: 'Thu', calls: 10, emails: 18, meetings: 6 },
  { date: 'Fri', calls: 7, emails: 14, meetings: 4 }
];

<ActivityTimelineChart data={data} height={300} />
```

**Props:**
- `data`: Array<{ date: string; calls: number; emails: number; meetings: number }>
- `height`: number - Chart height (default: 300)

**Features:**
- ✅ Three colored lines (Calls, Emails, Meetings)
- ✅ Interactive dots
- ✅ Tooltips with all metrics
- ✅ Legend
- ✅ 1000ms smooth animations

---

## ✨ Micro-interactions

### 1. **Page Transitions** 🎬

Smooth fade-in and slide-up when pages load.

**CSS Class:** `.page-transition`

**Usage:**
```tsx
<div className="page-transition">
  {/* Your page content */}
</div>
```

**Animation:**
- Slides up 20px while fading in
- Duration: 400ms
- Easing: ease-out

**Where Applied:**
- Dashboard
- ProjectList
- ClientList
- All major page components

---

### 2. **Staggered List Animations** 🎭

Items fade in one after another with a delay.

**CSS Class:** `.stagger-item`

**Usage:**
```tsx
{items.map((item, index) => (
  <div 
    key={item.id} 
    className="stagger-item"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    {/* Item content */}
  </div>
))}
```

**Animation:**
- Fades in from opacity 0
- Slides up 10px
- Duration: 400ms
- Easing: ease-out
- Recommended delay increment: 60-80ms per item

**Where Applied:**
- Project cards
- Organization cards
- List items throughout

---

### 3. **Progress Bar Shimmer** ✨

Animated shine effect on progress bars.

**CSS Class:** `.animate-shimmer`

**Usage:**
```tsx
<div className="progress-bar relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
</div>
```

**Animation:**
- Slides across from -100% to 100%
- Duration: 2s
- Loop: infinite
- Creates a "loading" shimmer effect

**Where Applied:**
- Project card progress bars
- Any loading or progress indicator

---

### 4. **Card Hover Effects** 🎨

Enhanced from previous phase with data visualizations.

**Features:**
- Progress rings appear on hover
- Scale transformations (1.02x)
- Shadow depth changes
- Border color transitions
- Icon rotations (+6deg)

**Where Applied:**
- All cards throughout the app

---

### 5. **Loading States** ⏳

Beautiful loading indicators for async operations.

**Components:**
- `<LoadingSpinner />` - Rotating spinner
- `<LoadingDots />` - Bouncing dots
- `<LoadingBar />` - Progress bar (determinate/indeterminate)

**Location:** `src/components/ui/Loading.tsx`

**Usage:**
```tsx
import { LoadingSpinner, LoadingDots, LoadingBar } from '../src/components/ui/Loading';

// Spinner
<LoadingSpinner size="md" color="primary" text="Loading..." />

// Dots
<LoadingDots color="primary" />

// Bar
<LoadingBar progress={75} color="primary" height="h-1" />
```

---

## 🎯 Implementation Examples

### Enhanced Stat Card with Sparkline

```tsx
<StatCard 
  title="Active Projects" 
  value={12} 
  subtitle="+3 this month"
  icon={<ProjectIcon />} 
  color="text-primary-500 dark:text-primary-400"
  sparklineData={[8, 9, 7, 10, 9, 11, 10, 12]}
  trend="up"
/>
```

**Result:**
- Large number display (12)
- Trend indicator with icon (↑ +3 this month)
- Sparkline at bottom showing 8-week trend
- Hover reveals more detail

---

### Project Card with Progress Ring

```tsx
<div className="project-card group">
  {/* Card content */}
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    <ProgressRing progress={75} size={50} />
  </div>
</div>
```

**Result:**
- Normal card view shows linear progress bar
- Hover reveals circular progress ring
- Smooth fade-in transition

---

### Page with Staggered Cards

```tsx
<div className="page-transition">
  <div className="grid grid-cols-3 gap-6">
    {projects.map((project, index) => (
      <div 
        key={project.id} 
        className="stagger-item"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <ProjectCard project={project} />
      </div>
    ))}
  </div>
</div>
```

**Result:**
- Page slides up and fades in
- Cards appear one by one with 80ms delay
- Creates waterfall effect

---

## 🎨 Color Coordination

All charts use your refined color system:

**Primary (Cyan):** `#06b6d4`
- Sparklines, primary metrics, calls

**Secondary (Indigo):** `#6366f1`
- Alternative metrics, meetings

**Success (Green):** `#10b981`
- Positive trends, completed items

**Info (Blue):** `#3b82f6`
- Informational charts, emails

**Warning (Amber):** `#f59e0b`
- Cautionary metrics, pending items

---

## 📊 Data Sources

### Current Implementation
Charts use **mock data** generated via `generateSparklineData()`:
- Base value ± variance
- Slight upward trend
- 12 data points (representing weeks/months)

### Production Implementation
Replace with real data from your Supabase database:

```tsx
// Example: Get last 12 weeks of project counts
const projectsSparkline = useMemo(() => {
  const weeklyData = getWeeklyProjectCounts(projects, 12);
  return weeklyData.map(week => week.count);
}, [projects]);
```

---

## 🚀 Performance Optimizations

### 1. **Memoization**
All sparkline data is memoized:
```tsx
const sparklineData = useMemo(() => generateData(), [dependencies]);
```

### 2. **Lazy Loading**
Charts only render when visible (via ResponsiveContainer)

### 3. **Animation Timing**
- Sparklines: 800ms
- Progress rings: 1000ms
- Charts: 1000ms
- Page transitions: 400ms

All use hardware-accelerated transforms when possible.

---

## 📱 Responsive Behavior

All charts are fully responsive:
- `<ResponsiveContainer>` adapts to parent width
- Touch-friendly interactions
- Mobile-optimized tooltips
- Scales gracefully from 320px to 4K

---

## 🎨 Customization Guide

### Change Sparkline Color
```tsx
<Sparkline 
  data={data}
  color="#10b981" // Green instead of cyan
/>
```

### Adjust Animation Speed
In CSS:
```css
.stagger-item {
  animation-duration: 300ms; /* Faster: was 400ms */
}
```

### Modify Trend Indicators
In Dashboard.tsx StatCard:
```tsx
const trendIcons = {
  up: <YourUpIcon />,
  down: <YourDownIcon />,
  neutral: null
};
```

---

## 🎯 Where Visualizations Appear

### Dashboard
- ✅ Sparklines in all 4 stat cards
- ✅ Trend indicators (↑ ↓)
- ✅ Page transition animation

### Projects Page
- ✅ Progress rings on hover
- ✅ Animated progress bars with shimmer
- ✅ Staggered card animations
- ✅ Page transition

### Organizations Page
- ✅ Staggered card animations
- ✅ Page transition

### Coming Soon
- Activity timeline chart
- Project status distribution chart
- Weekly activity breakdown
- Client engagement metrics

---

## 📚 Quick Reference

### Import All Charts
```tsx
import {
  Sparkline,
  MiniAreaChart,
  ProgressRing,
  ProjectStatusChart,
  ActivityTimelineChart
} from '../src/components/charts';
```

### Import Animations
```tsx
// CSS classes are global, just use them:
className="page-transition"
className="stagger-item"
className="animate-shimmer"
```

### Import Loading States
```tsx
import { LoadingSpinner, LoadingDots, LoadingBar } from '../src/components/ui/Loading';
```

---

## 🎊 Results

Your CRM now has:
- ✅ **5 chart types** for data visualization
- ✅ **Sparklines** in stat cards showing trends
- ✅ **Progress rings** for task completion
- ✅ **Smooth page transitions** (400ms)
- ✅ **Staggered animations** for lists
- ✅ **Shimmer effects** on progress bars
- ✅ **3 loading states** (spinner, dots, bar)
- ✅ **Fully responsive** charts
- ✅ **Dark mode compatible** visualizations

**Data comes alive with beautiful, meaningful visualizations!** 📊✨
