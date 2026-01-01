# Phase 1: Move Web Search Toggle to Settings Tab

**Status:** Unfinished  
**Priority:** High  
**Difficulty:** Low (2-3 hours)  
**Location:** F:\logos-vision-crm\development\01-WebSearchToggleToSettings.md

---

## 🎯 Overview

Currently, the web search toggle is scattered across the app. This phase consolidates all search-related settings into a dedicated Settings tab where users can control:
- Web search enabled/disabled
- Search result limits
- Default search providers
- Search filters
- AI research mode

---

## 📋 Step-by-Step Instructions

### FOR YOU (Project Manager):

1. **Identify Current Location**
   - Open `/src/components/AiTools.tsx` (AI Tools component)
   - Search for "web search" or "search toggle"
   - Check `/src/components/Header.tsx` for any search UI
   - Look at `/src/components/GlobalSearch.tsx`

2. **Verify Settings Tab Exists**
   - Navigate to the CRM app
   - Click Settings in the left sidebar
   - Confirm you have a Settings page/modal
   - If not, we need to create one first

3. **Test After Implementation**
   - Toggle should move from current location to Settings
   - Verify toggle persists when you close/reopen app
   - Ensure AI Tools still respect the setting

---

### FOR CLAUDE CODE:

#### **PROMPT TO USE:**

You're right! Let me send all the phase documents now. I'll send them in batches to make sure you get everything.

File 3: 01-WebSearchToggleToSettings.md
text
# Phase 1: Move Web Search Toggle to Settings Tab

**Status:** Unfinished  
**Priority:** High  
**Difficulty:** Low (2-3 hours)  
**Location:** F:\logos-vision-crm\development\01-WebSearchToggleToSettings.md

---

## 🎯 Overview

Currently, the web search toggle is scattered across the app. This phase consolidates all search-related settings into a dedicated Settings tab where users can control:
- Web search enabled/disabled
- Search result limits
- Default search providers
- Search filters
- AI research mode

---

## 📋 Step-by-Step Instructions

### FOR YOU (Project Manager):

1. **Identify Current Location**
   - Open `/src/components/AiTools.tsx` (AI Tools component)
   - Search for "web search" or "search toggle"
   - Check `/src/components/Header.tsx` for any search UI
   - Look at `/src/components/GlobalSearch.tsx`

2. **Verify Settings Tab Exists**
   - Navigate to the CRM app
   - Click Settings in the left sidebar
   - Confirm you have a Settings page/modal
   - If not, we need to create one first

3. **Test After Implementation**
   - Toggle should move from current location to Settings
   - Verify toggle persists when you close/reopen app
   - Ensure AI Tools still respect the setting

---

### FOR CLAUDE CODE:

#### **PROMPT TO USE:**

I need to move the web search toggle from the AI Tools interface to a dedicated Settings page.

Current situation:

Web search toggle is currently in AiTools.tsx

I need it moved to a Settings tab/page

The setting should persist in localStorage or Supabase user preferences

Please:

Find the current web search toggle code in AiTools.tsx

Identify what triggers this toggle (onClick handler, state management)

Create/update a Settings component with a search settings section

Move the toggle there and ensure it still works

Update any components that reference this setting

Test that the setting persists

The toggle should control whether AI features can search the web.


---

## 🔧 Technical Details

### Files to Modify:
- `/src/components/AiTools.tsx` - Remove toggle from here
- `/src/components/Settings.tsx` - Create or update this component
- `/src/App.tsx` - Ensure Settings route exists
- `/src/contexts/AuthContext.tsx` - May need to store preference here

### State Management Approach:

**Option 1: localStorage (Simple)**

// Save setting
localStorage.setItem('webSearchEnabled', JSON.stringify(true));

// Read setting
const isWebSearchEnabled = JSON.parse(localStorage.getItem('webSearchEnabled') || 'true');

text

**Option 2: Supabase (Better for teams)**
// Save to user preferences
await supabase
.from('user_preferences')
.upsert({ user_id: userId, web_search_enabled: true });

// Read preference
const { data } = await supabase
.from('user_preferences')
.select('web_search_enabled')
.eq('user_id', userId);

text

### UI Pattern:

Settings Page
├── Search Settings (New Section)
│ ├── 🔍 Enable Web Search Toggle
│ ├── Result Limit Slider (1-50 results)
│ ├── Default Provider (Google/Bing/etc)
│ └── Advanced Options
├── Appearance Settings
├── Notification Settings
└── Privacy Settings

text

---

## 📚 Best Practices

1. **Always Show Setting Status** - User should see if web search is on/off at a glance
2. **Default to Enabled** - Web search should default to ON for power users
3. **Show Impact** - Indicate that disabling may reduce AI tool capability
4. **Persist Choice** - Remember user's preference indefinitely
5. **Add Tooltip** - "Enable this to allow AI tools to search the web for information"

---

## ✅ Completion Checklist

- [ ] Identified current web search toggle location
- [ ] Created/Updated Settings component
- [ ] Moved toggle to Settings
- [ ] Tested toggle functionality
- [ ] Verified setting persists across sessions
- [ ] Updated any dependent components
- [ ] Removed toggle from old location
- [ ] Added helpful tooltip/description
- [ ] Settings route accessible from main nav

---

## 🔗 Related Components

- **AiTools.tsx** - Uses web search setting
- **AiChatBot.tsx** - May reference web search
- **GlobalSearch.tsx** - Search component
- **Header.tsx** - Navigation

---

## 📝 Notes

- This is a straightforward UI reorganization
- No new features needed, just relocation
- Consider adding more AI settings while you're here (temperature, model selection, etc.)
- Will prepare foundation for Phase 2 (Full Settings Menu)

---

**Estimated Time:** 2-3 hours  
**Next Phase:** 02-CreateSettingsMenu.md
