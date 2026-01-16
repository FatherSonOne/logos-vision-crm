# Tabs Component Guide 📑

Complete guide for using the Tabs component in Logos Vision CRM

---

## 🎯 What Are Tabs?

Tabs organize content into separate sections that users can switch between. Instead of scrolling through a long page, users can click tabs to see different categories of information.

**Perfect for:**
- Client details (Overview, Projects, Activities, Documents)
- Project views (Tasks, Timeline, Team, Files)
- Settings pages (General, Account, Notifications)
- Any content that can be grouped into categories

---

## 📦 Installation

The Tabs component is already created at `components/Tabs.tsx`

No installation needed! Just import and use.

---

## 🚀 Quick Start

### Method 1: Simple Tabs (Easiest)

This is the simplest way to use tabs - perfect when you're starting out!

```tsx
import { SimpleTabs, TabPanel } from './Tabs';

function MyComponent() {
  return (
    <SimpleTabs>
      <TabPanel label="Overview" badge={5}>
        <div>Overview content here</div>
      </TabPanel>
      
      <TabPanel label="Projects">
        <div>Projects content here</div>
      </TabPanel>
      
      <TabPanel label="Documents" badge="New">
        <div>Documents content here</div>
      </TabPanel>
    </SimpleTabs>
  );
}
```

### Method 2: Advanced Tabs (More Control)

Use this when you need more control and dynamic content:

```tsx
import { Tabs, Tab } from './Tabs';
import { FolderIcon, UsersIcon } from './icons';

function MyComponent() {
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FolderIcon />,
      content: <div>Overview content</div>
    },
    {
      id: 'team',
      label: 'Team',
      icon: <UsersIcon />,
      badge: 12,
      content: <div>Team content</div>
    }
  ];

  return <Tabs tabs={tabs} />;
}
```

---

## 🎨 Styling Variants

### Default Variant (with sliding indicator)
```tsx
<SimpleTabs variant="default">
  {/* tabs */}
</SimpleTabs>
```

### Pills Variant (rounded buttons)
```tsx
<SimpleTabs variant="pills">
  {/* tabs */}
</SimpleTabs>
```

### Underline Variant (minimal style)
```tsx
<SimpleTabs variant="underline">
  {/* tabs */}
</SimpleTabs>
```

---

## 📏 Size Options

### Small
```tsx
<SimpleTabs size="sm">
```

### Medium (default)
```tsx
<SimpleTabs size="md">
```

### Large
```tsx
<SimpleTabs size="lg">
```

---

## ✨ Features

### 1. Icons
Add icons to your tabs:

```tsx
import { FolderIcon, CalendarIcon, UsersIcon } from './icons';

<SimpleTabs>
  <TabPanel label="Projects" icon={<FolderIcon />}>
    Content
  </TabPanel>
  <TabPanel label="Calendar" icon={<CalendarIcon />}>
    Content
  </TabPanel>
</SimpleTabs>
```

### 2. Badges
Show counts or labels:

```tsx
<SimpleTabs>
  <TabPanel label="Notifications" badge={12}>
    Content
  </TabPanel>
  <TabPanel label="Messages" badge="New">
    Content
  </TabPanel>
</SimpleTabs>
```

### 3. Disabled Tabs
Prevent access to certain tabs:

```tsx
<TabPanel label="Premium" disabled>
  Content
</TabPanel>
```

### 4. Full Width
Make tabs stretch across the container:

```tsx
<Tabs tabs={tabs} fullWidth />
```

### 5. Default Tab
Set which tab opens first:

```tsx
<SimpleTabs defaultTab={1}>  {/* Opens second tab */}
```

### 6. Controlled Mode
Control active tab from parent component:

```tsx
const [activeTab, setActiveTab] = useState('overview');

<Tabs 
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={(tabId) => {
    setActiveTab(tabId);
    console.log('Tab changed to:', tabId);
  }}
/>
```

---

## 💡 Real Examples for Your CRM

### Example 1: Client Detail Page

```tsx
import { SimpleTabs, TabPanel } from './Tabs';
import { BuildingIcon, FolderIcon, ClipboardListIcon, DocumentsIcon } from './icons';

interface ClientDetailProps {
  client: any;
}

function ClientDetail({ client }: ClientDetailProps) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{client.name}</h1>
      
      <SimpleTabs variant="default" size="md">
        <TabPanel 
          label="Overview" 
          icon={<BuildingIcon />}
        >
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Organization Details</h3>
              <p>{client.description}</p>
            </div>
          </div>
        </TabPanel>

        <TabPanel 
          label="Projects" 
          icon={<FolderIcon />}
          badge={client.projects?.length}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {client.projects?.map(project => (
              <div key={project.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl">
                <h4 className="font-semibold">{project.name}</h4>
                <p className="text-sm text-slate-600">{project.status}</p>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel 
          label="Activities" 
          icon={<ClipboardListIcon />}
          badge={client.activities?.length}
        >
          <div className="space-y-3">
            {client.activities?.map(activity => (
              <div key={activity.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-slate-500">{activity.date}</p>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel 
          label="Documents" 
          icon={<DocumentsIcon />}
          badge={client.documents?.length}
        >
          <div className="space-y-2">
            {client.documents?.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg flex items-center justify-between">
                <span>{doc.name}</span>
                <button className="text-cyan-600 hover:text-cyan-700">Download</button>
              </div>
            ))}
          </div>
        </TabPanel>
      </SimpleTabs>
    </div>
  );
}
```

### Example 2: Project View

```tsx
function ProjectView({ project }: { project: any }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{project.name}</h1>
      
      <SimpleTabs variant="pills" size="md">
        <TabPanel label="Tasks" badge={project.tasks?.length}>
          {/* Task list */}
          <div className="space-y-3">
            {project.tasks?.map(task => (
              <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span>{task.title}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel label="Timeline">
          {/* Timeline view */}
          <div className="relative border-l-2 border-slate-300 dark:border-slate-600 ml-3">
            {project.milestones?.map((milestone, idx) => (
              <div key={idx} className="mb-6 ml-6">
                <div className="absolute -left-3 w-6 h-6 bg-cyan-500 rounded-full border-4 border-white dark:border-slate-900"></div>
                <h4 className="font-semibold">{milestone.title}</h4>
                <p className="text-sm text-slate-500">{milestone.date}</p>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel label="Team" badge={project.team?.length}>
          {/* Team members */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.team?.map(member => (
              <div key={member.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">{member.name.charAt(0)}</span>
                </div>
                <h4 className="font-semibold">{member.name}</h4>
                <p className="text-sm text-slate-500">{member.role}</p>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel label="Files" badge={project.files?.length}>
          {/* File list */}
          <div className="space-y-2">
            {project.files?.map(file => (
              <div key={file.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-slate-500">{file.size} • {file.date}</p>
                </div>
                <button className="text-cyan-600 hover:text-cyan-700">View</button>
              </div>
            ))}
          </div>
        </TabPanel>
      </SimpleTabs>
    </div>
  );
}
```

### Example 3: Settings Page

```tsx
function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <SimpleTabs variant="underline">
        <TabPanel label="General">
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Organization Name</label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-300 rounded-lg"
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Email</label>
              <input 
                type="email" 
                className="w-full p-3 border border-slate-300 rounded-lg"
                placeholder="Enter email"
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel label="Account">
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Current Password</label>
              <input 
                type="password" 
                className="w-full p-3 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">New Password</label>
              <input 
                type="password" 
                className="w-full p-3 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel label="Notifications" badge="3">
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5" />
              <span>Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5" />
              <span>Push notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5" />
              <span>Weekly summary</span>
            </label>
          </div>
        </TabPanel>

        <TabPanel label="Privacy">
          <div className="space-y-4">
            <p className="text-slate-600">Configure your privacy settings</p>
            {/* Privacy settings */}
          </div>
        </TabPanel>
      </SimpleTabs>
    </div>
  );
}
```

---

## ⌨️ Keyboard Navigation

Users can navigate tabs with their keyboard:
- **Arrow Left/Right**: Move between tabs
- **Home**: Jump to first tab
- **End**: Jump to last tab
- **Tab**: Focus tab controls
- **Enter**: Activate focused tab

This happens automatically - no extra code needed!

---

## 🎯 Best Practices

### 1. Don't Use Too Many Tabs
- ✅ **Good**: 3-6 tabs
- ❌ **Bad**: 10+ tabs (consider a different layout)

### 2. Clear Labels
- ✅ **Good**: "Projects", "Team Members", "Documents"
- ❌ **Bad**: "Stuff", "Things", "Other"

### 3. Use Badges Wisely
```tsx
// Show counts
<TabPanel label="Messages" badge={unreadCount}>

// Show status
<TabPanel label="Updates" badge="New">

// Don't overuse
<TabPanel label="Home" badge="😀">  {/* Maybe not */}
```

### 4. Content Should Be Related
All tabs should be about the same subject (e.g., all about one client).

### 5. Don't Nest Tabs
```tsx
// ❌ Don't do this
<SimpleTabs>
  <TabPanel label="Settings">
    <SimpleTabs>  {/* Nested tabs = confusing! */}
      <TabPanel label="General">...</TabPanel>
    </SimpleTabs>
  </TabPanel>
</SimpleTabs>
```

---

## 🎨 Styling Tips

### Custom Container
```tsx
<SimpleTabs className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
```

### With Cards
```tsx
<SimpleTabs>
  <TabPanel label="Overview">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl">
      Content in a card
    </div>
  </TabPanel>
</SimpleTabs>
```

---

## 🐛 Common Issues

### Issue: Tabs not showing
**Solution**: Make sure you import correctly:
```tsx
import { SimpleTabs, TabPanel } from './components/Tabs';
```

### Issue: Content jumps when switching
**Solution**: Add a min-height to your tab content:
```tsx
<TabPanel label="Content">
  <div className="min-h-[400px]">
    {/* content */}
  </div>
</TabPanel>
```

### Issue: Tabs too wide on mobile
**Solution**: The component is already responsive! Just make sure your content inside is too.

---

## 📝 Complete Working Example

Here's a full, copy-paste-ready example:

```tsx
import React from 'react';
import { SimpleTabs, TabPanel } from './components/Tabs';
import { BuildingIcon, UsersIcon, FolderIcon } from './components/icons';

function ExamplePage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Acme Corporation</h1>
        
        <SimpleTabs variant="default" size="md">
          <TabPanel 
            label="Overview" 
            icon={<BuildingIcon />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
                <p className="text-3xl font-bold text-cyan-600">12</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Team Members</h3>
                <p className="text-3xl font-bold text-cyan-600">8</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Documents</h3>
                <p className="text-3xl font-bold text-cyan-600">45</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel 
            label="Projects" 
            icon={<FolderIcon />}
            badge={12}
          >
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl">
                <h4 className="font-semibold text-lg">Website Redesign</h4>
                <p className="text-slate-600 mt-2">Due: Dec 15, 2024</p>
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">75% Complete</p>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel 
            label="Team" 
            icon={<UsersIcon />}
            badge={8}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl text-center">
                  <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h4 className="font-semibold">Team Member {i}</h4>
                  <p className="text-sm text-slate-500">Role</p>
                </div>
              ))}
            </div>
          </TabPanel>
        </SimpleTabs>
      </div>
    </div>
  );
}

export default ExamplePage;
```

---

## 🚀 Next Steps

1. **Add animations to your index.html** (if not already there):
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-in;
}
```

2. **Start using tabs in your existing components**:
   - OrganizationDetail.tsx
   - ProjectDetail.tsx
   - ClientPortal.tsx

3. **Customize the styling** to match your brand colors

---

## 💡 Tips for Success

- Start with SimpleTabs - it's easier
- Use meaningful labels
- Add icons for visual clarity
- Use badges to show counts
- Test on mobile devices
- Keep content organized and related

---

## 🎉 You're Ready!

You now have a professional, accessible Tabs component. Start adding it to your pages and watch your CRM become more organized and user-friendly!

**Questions?** Review the examples above or experiment with the component. It's designed to be flexible and easy to use.

---

**Created for Logos Vision CRM**
*Making your CRM more organized, one tab at a time* 📑✨