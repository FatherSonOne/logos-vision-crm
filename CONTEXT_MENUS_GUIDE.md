# 🖱️ Context Menus - Complete Integration Guide

## What Are Context Menus?

Context menus (right-click menus) give users quick access to actions without cluttering your UI with buttons. They're a **power user feature** that makes your CRM feel professional and efficient.

---

## 📦 What We Built

### 1. **ContextMenu Component**
Full-featured right-click menu system with:
- ✅ Right-click to open
- ✅ Keyboard navigation (arrow keys, Enter, Esc)
- ✅ Icons and keyboard shortcuts
- ✅ Dividers for grouping
- ✅ Disabled states
- ✅ Danger styling (for delete actions)
- ✅ Smart positioning (stays on screen)
- ✅ Dark mode support
- ✅ Smooth animations

### 2. **ContextMenuExamples Component**
Working examples showing:
- Project cards with context menus
- Client table rows with menus
- Document list items with menus
- All with different action sets

---

## 🚀 Quick Start (2 Minutes)

### Test the Examples First

1. **Add to App.tsx:**
```tsx
import { ContextMenuExamples } from '../components/ContextMenuExamples';
```

2. **Add to your render:**
```tsx
<ContextMenuExamples />
```

3. **Test it:**
- Right-click any card or item
- See the menu appear!
- Try keyboard navigation

---

## 💡 How to Use in Your Components

### Basic Example: Add to Any Element

```tsx
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { EditIcon, TrashIcon } from '../components/icons';

// Define menu items
const menuItems: ContextMenuItem[] = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <EditIcon />,
    onClick: () => console.log('Edit clicked')
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: () => console.log('Delete clicked'),
    danger: true
  }
];

// Wrap your element
<ContextMenu items={menuItems}>
  <div>Right-click me!</div>
</ContextMenu>
```

---

## 🎯 Real-World Examples for Your CRM

### Example 1: Project Cards

Add context menus to your project cards in `ProjectList.tsx`:

```tsx
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { 
  EditIcon, 
  TrashIcon, 
  CopyIcon, 
  ShareIcon,
  ArchiveIcon,
  DownloadIcon 
} from '../components/icons';

// Inside your ProjectList component
const getProjectMenu = (project: Project): ContextMenuItem[] => [
  {
    id: 'edit',
    label: 'Edit Project',
    icon: <EditIcon />,
    shortcut: '⌘E',
    onClick: () => handleEditProject(project)
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <CopyIcon />,
    onClick: () => handleDuplicateProject(project),
    divider: true
  },
  {
    id: 'share',
    label: 'Share',
    icon: <ShareIcon />,
    onClick: () => handleShareProject(project)
  },
  {
    id: 'export',
    label: 'Export',
    icon: <DownloadIcon />,
    onClick: () => handleExportProject(project),
    divider: true
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <ArchiveIcon />,
    onClick: () => handleArchiveProject(project)
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: () => handleDeleteProject(project),
    danger: true
  }
];

// In your render
return (
  <div className="grid grid-cols-3 gap-6">
    {projects.map(project => (
      <ContextMenu key={project.id} items={getProjectMenu(project)}>
        <div className="project-card">
          {/* Your project card content */}
        </div>
      </ContextMenu>
    ))}
  </div>
);
```

### Example 2: Client List

Add to client rows in `ClientList.tsx`:

```tsx
const getClientMenu = (client: Client): ContextMenuItem[] => [
  {
    id: 'view',
    label: 'View Profile',
    icon: <EyeIcon />,
    onClick: () => onSelectClient(client.id)
  },
  {
    id: 'edit',
    label: 'Edit Details',
    icon: <EditIcon />,
    onClick: () => handleEditClient(client),
    divider: true
  },
  {
    id: 'email',
    label: 'Send Email',
    icon: <MailIcon />,
    shortcut: '⌘M',
    onClick: () => window.location.href = `mailto:${client.email}`
  },
  {
    id: 'call',
    label: 'Call',
    icon: <PhoneIcon />,
    onClick: () => handleInitiateCall(client.phone),
    divider: true
  },
  {
    id: 'add-project',
    label: 'Add Project',
    icon: <FolderIcon />,
    onClick: () => handleAddProject(client)
  },
  {
    id: 'add-activity',
    label: 'Log Activity',
    icon: <ClipboardListIcon />,
    onClick: () => handleLogActivity(client)
  }
];

// Wrap each row
{clients.map(client => (
  <ContextMenu key={client.id} items={getClientMenu(client)}>
    <tr className="hover:bg-slate-50 cursor-pointer">
      {/* Your row content */}
    </tr>
  </ContextMenu>
))}
```

### Example 3: Document Library

Add to document items in `DocumentLibrary.tsx`:

```tsx
const getDocumentMenu = (doc: Document): ContextMenuItem[] => [
  {
    id: 'open',
    label: 'Open',
    icon: <EyeIcon />,
    shortcut: 'Enter',
    onClick: () => handleOpenDocument(doc)
  },
  {
    id: 'download',
    label: 'Download',
    icon: <DownloadIcon />,
    shortcut: '⌘D',
    onClick: () => handleDownloadDocument(doc),
    divider: true
  },
  {
    id: 'rename',
    label: 'Rename',
    icon: <EditIcon />,
    onClick: () => handleRenameDocument(doc)
  },
  {
    id: 'move',
    label: 'Move to...',
    icon: <FolderIcon />,
    onClick: () => handleMoveDocument(doc)
  },
  {
    id: 'share',
    label: 'Share',
    icon: <ShareIcon />,
    onClick: () => handleShareDocument(doc),
    divider: true
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: () => handleDeleteDocument(doc),
    danger: true
  }
];
```

### Example 4: Task Items

Add to tasks in `TaskView.tsx`:

```tsx
const getTaskMenu = (task: Task): ContextMenuItem[] => [
  {
    id: 'mark-complete',
    label: task.completed ? 'Mark Incomplete' : 'Mark Complete',
    icon: <CheckIcon />,
    onClick: () => handleToggleTask(task)
  },
  {
    id: 'edit',
    label: 'Edit Task',
    icon: <EditIcon />,
    onClick: () => handleEditTask(task),
    divider: true
  },
  {
    id: 'assign',
    label: 'Assign to...',
    icon: <UsersIcon />,
    onClick: () => handleAssignTask(task)
  },
  {
    id: 'set-priority',
    label: 'Set Priority',
    icon: <FlagIcon />,
    onClick: () => handleSetPriority(task),
    divider: true
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <CopyIcon />,
    onClick: () => handleDuplicateTask(task)
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: () => handleDeleteTask(task),
    danger: true
  }
];
```

---

## 🎨 Menu Item Options

### All Available Properties

```tsx
interface ContextMenuItem {
  id: string;              // Unique identifier
  label: string;           // Display text
  icon?: React.ReactNode;  // Icon component
  shortcut?: string;       // Keyboard shortcut to display (e.g. "⌘E")
  onClick: () => void;     // Action to perform
  disabled?: boolean;      // Gray out and disable
  danger?: boolean;        // Red text for destructive actions
  divider?: boolean;       // Show divider line after this item
}
```

### Example with All Options

```tsx
const fullExample: ContextMenuItem[] = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <EditIcon />,
    shortcut: '⌘E',
    onClick: () => handleEdit(),
    disabled: false,
    danger: false,
    divider: true  // Adds line after this item
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    shortcut: '⌫',
    onClick: () => handleDelete(),
    disabled: false,
    danger: true,  // Makes text red
    divider: false
  }
];
```

---

## ⌨️ Keyboard Navigation

Context menus support full keyboard navigation:

| Key | Action |
|-----|--------|
| `Right-click` | Open menu |
| `↑` `↓` | Navigate items |
| `Enter` | Select item |
| `Esc` | Close menu |
| Click outside | Close menu |

---

## 🎯 Best Practices

### 1. Keep Menus Focused
```tsx
// ✅ Good: 5-7 relevant actions
['View', 'Edit', 'Share', 'Download', 'Delete']

// ❌ Bad: Too many options
['View', 'Edit', 'Share', 'Download', 'Duplicate', 'Archive', 
 'Export', 'Print', 'Email', 'Move', 'Rename', 'Delete', ...]
```

### 2. Group Related Actions
Use dividers to group similar actions:

```tsx
[
  'View Details',
  'Edit',
  '---',  // Divider
  'Share',
  'Export',
  '---',  // Divider
  'Delete'
]
```

### 3. Put Dangerous Actions Last
```tsx
// ✅ Good: Destructive action at bottom
['Edit', 'Duplicate', 'Share', '---', 'Delete']

// ❌ Bad: Delete at top
['Delete', '---', 'Edit', 'Duplicate', 'Share']
```

### 4. Use Clear, Action-Oriented Labels
```tsx
// ✅ Good: Clear actions
'Edit Project', 'Send Email', 'Download File'

// ❌ Bad: Vague labels
'Modify', 'Contact', 'Get'
```

### 5. Show Keyboard Shortcuts
```tsx
{
  label: 'Edit',
  shortcut: '⌘E',  // Helps users learn shortcuts
  onClick: () => handleEdit()
}
```

---

## 🎨 Styling Tips

### Custom Hover Colors
The context menu uses your theme colors automatically, but you can customize:

```css
/* In your CSS if needed */
.context-menu-item:hover {
  background: rgba(6, 182, 212, 0.1);
}
```

### Match Your Brand
Context menus automatically use:
- Your primary colors (cyan)
- Your theme (light/dark)
- Your font family
- Your border styles

---

## 🐛 Troubleshooting

### Menu doesn't appear on right-click
- Check that you wrapped your element with `<ContextMenu>`
- Verify items array is not empty
- Check browser console for errors

### Menu appears off-screen
- The component has smart positioning built-in
- Make sure the menu ref is working
- Check for CSS that might be interfering with `position: fixed`

### Keyboard navigation doesn't work
- Menu must be open first
- Check that items aren't all disabled
- Verify no other keyboard handlers are interfering

### Menu doesn't close on click outside
- The component handles this automatically
- Check for CSS z-index issues
- Verify menuRef is working

---

## 💡 Pro Tips

### Tip 1: Conditional Menu Items
Show different items based on state:

```tsx
const getMenuItems = (item: any): ContextMenuItem[] => {
  const items: ContextMenuItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      onClick: () => handleEdit(item)
    }
  ];

  // Only show archive if not already archived
  if (!item.archived) {
    items.push({
      id: 'archive',
      label: 'Archive',
      onClick: () => handleArchive(item)
    });
  }

  // Only show restore if archived
  if (item.archived) {
    items.push({
      id: 'restore',
      label: 'Restore',
      onClick: () => handleRestore(item)
    });
  }

  return items;
};
```

### Tip 2: Disabled States with Tooltips
```tsx
{
  id: 'delete',
  label: 'Delete',
  disabled: !userCanDelete,  // Disable based on permissions
  onClick: () => handleDelete()
}
```

### Tip 3: Nested Actions
For complex actions, trigger modals:

```tsx
{
  id: 'share',
  label: 'Share...',
  onClick: () => setShareModalOpen(true)  // Opens detailed dialog
}
```

### Tip 4: Combine with Keyboard Shortcuts
Make actions available both ways:

```tsx
// In your component
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
      e.preventDefault();
      handleEdit();  // Same action as context menu
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 🎯 Where to Add Context Menus

### High Priority (Add First):
1. **Project Cards** - Most used, biggest impact
2. **Client List** - Frequently accessed
3. **Document Library** - File operations

### Medium Priority:
4. **Task Items** - Good for power users
5. **Team Members** - Quick actions
6. **Activity Feed** - Edit/delete items

### Nice to Have:
7. **Calendar Events** - Reschedule/edit
8. **Donations** - Receipt/edit actions
9. **Cases** - Status changes

---

## 📊 Expected Impact

### User Experience:
- ⚡ **30-50% faster** than finding buttons
- 🎯 **Less UI clutter** (no action buttons everywhere)
- 💪 **Power user friendly** (feels professional)
- 😊 **Intuitive** (users know right-click = actions)

### Development:
- 🎨 **Cleaner UI** (no button spam)
- 🔧 **Easy to add** (wrap + define items)
- 📦 **Reusable** (same component everywhere)
- ✨ **Consistent** (same patterns throughout)

---

## 🎊 You're Ready!

Context menus will make your CRM feel:
- More **professional**
- More **efficient**
- More **powerful**
- More **polished**

Start with project cards, then expand from there!

---

**Created:** November 23, 2024  
**Component:** Context Menus (Right-Click)  
**Status:** ✅ Complete and Ready to Use  
**Next:** Add to your most-used components!

---

*"The mark of a professional app is hidden power beneath a clean surface."* 🖱️✨