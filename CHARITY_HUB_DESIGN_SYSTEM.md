# 🎨 Charity Hub Design System - Apply Everywhere

## Overview
Apply these EXACT design patterns from Charity Hub to ALL components in the CRM.

---

## 📊 STAT CARDS PATTERN

### ❌ OLD STYLE (Remove this):
```tsx
<div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Label</p>
      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">Value</p>
    </div>
    <Icon className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-50" />
  </div>
</div>
```

### ✅ NEW STYLE (Use this):
```tsx
<div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg text-white p-6 cursor-pointer transform hover:scale-105 transition-transform">
  <div className="flex items-center justify-between">
    <div>
      <div className="text-white/80 text-sm font-medium">Label</div>
      <div className="text-3xl font-bold mt-1">Value</div>
      <div className="text-white/80 text-xs mt-1">Subtitle</div>
    </div>
    <Icon className="w-12 h-12 text-white/30" />
  </div>
</div>
```

### 🎨 GRADIENT COLOR PAIRS:
- Blue Stats: `from-blue-500 to-cyan-600`
- Green Stats: `from-green-500 to-emerald-600`
- Purple Stats: `from-purple-500 to-pink-600`
- Orange Stats: `from-orange-500 to-red-600`
- Pink Stats: `from-rose-500 to-pink-600`
- Indigo Stats: `from-indigo-500 to-blue-600`

---

## 🎴 FEATURE/ACTION CARDS PATTERN

### ✅ USE THIS:
```tsx
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all group">
  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
    <Icon className="w-8 h-8 text-white" />
  </div>
  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Title</h3>
  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Description</p>
  <div className="mt-4 flex items-center text-rose-600 dark:text-rose-400 font-medium text-sm group-hover:gap-2 transition-all">
    Learn More
    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
  </div>
</div>
```

---

## 🎯 SEARCH BAR PATTERN

### ✅ USE THIS:
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-slate-800 dark:border-slate-700">
  <input
    type="text"
    placeholder="Search..."
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
  />
</div>
```

---

## 🎨 AI INSIGHTS PATTERN

### ✅ USE THIS:
```tsx
<div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700/30 p-4">
  <div className="flex items-start gap-3">
    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Insights</h3>
      <div className="text-sm text-green-700 dark:text-green-400">• Success message</div>
      <div className="text-sm text-orange-700 dark:text-orange-400">• Warning message</div>
      <div className="text-sm text-blue-700 dark:text-blue-400">• Info message</div>
    </div>
  </div>
</div>
```

---

## 🎨 PROJECT/ITEM CARDS PATTERN

### ✅ USE THIS:
```tsx
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all transform hover:scale-[1.02]">
  {/* Card content */}
</div>
```

---

## 📋 LIST ITEMS PATTERN

### ✅ USE THIS:
```tsx
<div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
  {/* List item content */}
</div>
```

---

## 🎨 BUTTONS PATTERN

### Primary Button:
```tsx
<button className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition flex items-center gap-2">
  <Plus className="w-4 h-4" />
  Action
</button>
```

### Secondary Button:
```tsx
<button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
  Action
</button>
```

---

## 🎨 BACKGROUND COLORS

- **Page Background**: Use `bg-white dark:bg-slate-800` (NOT gray-800)
- **Card Background**: Use `bg-white dark:bg-slate-800`
- **Borders**: Use `border-gray-200 dark:border-slate-700`
- **Hover States**: Use `hover:bg-gray-50 dark:hover:bg-slate-700/50`

---

## 🎨 TEXT COLORS

- **Headings**: `text-gray-900 dark:text-white`
- **Body Text**: `text-gray-600 dark:text-gray-400`
- **Labels**: `text-gray-700 dark:text-gray-300`

---

## ✨ ANIMATIONS TO KEEP

- **Scale on hover**: `hover:scale-105 transition-transform`
- **Shadow transition**: `hover:shadow-xl transition-all`
- **Smooth transitions**: `transition-colors`, `transition-all`

---

## 📝 QUICK REPLACEMENT GUIDE

### In ProjectHub.tsx (line ~405-460):

FIND the stat cards section starting with:
```
<div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20...
```

REPLACE each stat card with:
```tsx
<div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg text-white p-6 cursor-pointer transform hover:scale-105 transition-transform">
  <div className="flex items-center justify-between">
    <div>
      <div className="text-white/80 text-sm font-medium">Total Projects</div>
      <div className="text-3xl font-bold mt-1">{projectStats.total}</div>
      {projectStats.pinnedCount > 0 && (
        <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
          <PinIcon className="w-3 h-3" filled />
          {projectStats.pinnedCount} pinned
        </div>
      )}
    </div>
    <FolderIcon className="w-12 h-12 text-white/30" />
  </div>
</div>
```

Apply similar changes to the other 3 stat cards using the gradient pairs listed above.

---

## 🎯 FILES TO UPDATE (Priority Order):

1. ✅ **ProjectHub.tsx** - Stat cards (lines ~405-460)
2. **Dashboard.tsx** - All stat cards and widgets
3. **ClientList.tsx** - Card styling
4. **ContactList.tsx** - Card styling  
5. **ActivityFeed.tsx** - List items
6. **TaskView.tsx** - Task cards

---

## 💡 KEY PRINCIPLE:

**Charity Hub uses BOLD, COLORFUL gradients with white text.**
**Everything else should match this vibrant, modern aesthetic!**

All pale backgrounds (`from-blue-50`, `dark:from-blue-900/20`) should become
bold gradients (`from-blue-500 to-cyan-600`) with white text.