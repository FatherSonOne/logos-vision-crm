# 🔍 Global Search - Integration Guide

## How to Add Global Search to Your CRM

This guide shows you exactly how to integrate the Global Search component into your App.tsx.

---

## Step 1: Import the Component

At the top of `src/App.tsx`, add these imports:

```tsx
import { GlobalSearch, useGlobalSearchShortcut } from '../components/GlobalSearch';
```

---

## Step 2: Add State for Search Modal

Inside your App component, add state to control the search modal:

```tsx
function App() {
  const [page, setPage] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  
  // ADD THIS LINE:
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // ... rest of your code
}
```

---

## Step 3: Add the Keyboard Shortcut Hook

Right after your state declarations, add the hook to handle Ctrl+K and /:

```tsx
// Enable global search keyboard shortcuts (Ctrl+K or /)
useGlobalSearchShortcut(() => setIsSearchOpen(true));
```

---

## Step 4: Create a Navigation Handler

Add this function to handle navigation from search results:

```tsx
const handleSearchNavigation = (type: string, id: string, data?: any) => {
  // Navigate based on the search result type
  switch (type) {
    case 'organization':
      setPage('organizations');
      if (data) {
        setSelectedClient(data);
      }
      break;
      
    case 'project':
      setPage('projects');
      if (data) {
        setSelectedProject(data);
      }
      break;
      
    case 'volunteer':
      setPage('volunteers');
      break;
      
    case 'team-member':
      setPage('consultants');
      break;
      
    case 'case':
      setPage('cases');
      break;
      
    case 'donation':
      setPage('donations');
      break;
      
    case 'document':
      setPage('documents');
      break;
      
    case 'activity':
      setPage('dashboard'); // or wherever activities are shown
      break;
  }
};
```

---

## Step 5: Add GlobalSearch Component to Your Render

In your return statement, add the GlobalSearch component (put it before or after the Header):

```tsx
return (
  <div className={/* your classes */}>
    {/* Your existing Header component */}
    <Header 
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      onNavigate={setPage}
      currentPage={page}
    />

    {/* ADD THIS: Global Search Component */}
    <GlobalSearch
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      onNavigate={handleSearchNavigation}
      organizations={clients}
      projects={projects}
      volunteers={volunteers}
      teamMembers={teamMembers}
      cases={cases}
      donations={donations}
      activities={activities}
    />

    {/* Your existing content */}
    <div className="flex">
      <Sidebar />
      <main>
        {/* your page content */}
      </main>
    </div>
  </div>
);
```

---

## Step 6: (Optional) Add Search Button to Header

You can also add a button to your Header component to open search:

In `components/Header.tsx`, add a search button:

```tsx
<button
  onClick={() => {
    // You'll need to pass a prop to open search
    // Or use an event/context
  }}
  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
>
  <SearchIcon />
  <span className="text-sm text-slate-600 dark:text-slate-400">
    Search... 
    <kbd className="ml-2 px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded text-xs">
      Ctrl+K
    </kbd>
  </span>
</button>
```

---

## Complete Example

Here's what your App.tsx should look like with Global Search integrated:

```tsx
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { GlobalSearch, useGlobalSearchShortcut } from '../components/GlobalSearch';
// ... other imports

function App() {
  const [page, setPage] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // Your existing state and data
  const clients = [ /* your data */ ];
  const projects = [ /* your data */ ];
  const volunteers = [ /* your data */ ];
  // ... etc
  
  // Enable global search keyboard shortcuts
  useGlobalSearchShortcut(() => setIsSearchOpen(true));
  
  // Handle navigation from search results
  const handleSearchNavigation = (type: string, id: string, data?: any) => {
    switch (type) {
      case 'organization':
        setPage('organizations');
        if (data) setSelectedClient(data);
        break;
      case 'project':
        setPage('projects');
        if (data) setSelectedProject(data);
        break;
      case 'volunteer':
        setPage('volunteers');
        break;
      case 'team-member':
        setPage('consultants');
        break;
      case 'case':
        setPage('cases');
        break;
      case 'donation':
        setPage('donations');
        break;
      case 'document':
        setPage('documents');
        break;
      case 'activity':
        setPage('dashboard');
        break;
    }
  };
  
  return (
    <div className="min-h-screen">
      <Header 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onNavigate={setPage}
        currentPage={page}
      />

      {/* Global Search - accessible with Ctrl+K or / */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleSearchNavigation}
        organizations={clients}
        projects={projects}
        volunteers={volunteers}
        teamMembers={teamMembers}
        cases={cases}
        donations={donations}
        activities={activities}
      />

      <div className="flex">
        <Sidebar onNavigate={setPage} currentPage={page} />
        
        <main className="flex-1">
          {/* Your page content */}
        </main>
      </div>
    </div>
  );
}

export default App;
```

---

## Testing the Integration

Once you've added everything:

1. **Save your files**
2. **Reload your browser**
3. **Try these:**
   - Press `Ctrl+K` (or `Cmd+K` on Mac)
   - Press `/` (when not in a text field)
   - Type to search
   - Use arrow keys to navigate results
   - Press Enter to go to a result
   - Press Esc to close

---

## Troubleshooting

### Search doesn't open with Ctrl+K
- Make sure you imported `useGlobalSearchShortcut`
- Check that you called the hook: `useGlobalSearchShortcut(() => setIsSearchOpen(true));`
- Check browser console for errors

### No results showing
- Make sure you're passing your data arrays to the component
- Check that your data has `name`, `title`, or `subject` fields
- Try console.logging your data to verify it exists

### Navigation doesn't work
- Check that `handleSearchNavigation` is correctly implemented
- Make sure page names match your app's page state values
- Verify `setPage` is working correctly

### Search looks weird
- Make sure `index.html` has all the animation CSS
- Check that Tailwind is loading correctly
- Try toggling dark mode

---

## Next Steps

1. **Test the basic search**
2. **Customize the navigation logic** for your needs
3. **Add more data sources** if needed
4. **Consider adding** a search button in your Header
5. **Train your users** on the Ctrl+K shortcut!

---

## Pro Tips

### Tip 1: Add to Your Onboarding
Tell new users about Ctrl+K! It's a power-user feature they'll love.

### Tip 2: Show Search Hints
You could add a tooltip or hint near your header that says "Press Ctrl+K to search"

### Tip 3: Track Popular Searches
Consider logging what people search for to understand how they use your CRM

### Tip 4: Expand Searchable Fields
The search currently looks at basic fields. You can add more fields to search:
```tsx
searchInData(organizations, 'organization', [
  'name', 
  'type', 
  'location', 
  'description',
  'industry',  // add more!
  'email',
  'phone'
])
```

---

**You're ready to integrate Global Search!** 🔍✨