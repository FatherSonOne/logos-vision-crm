# 🚀 Context Menus - Quick Start (5 Minutes)

## Test the Examples First!

### Step 1: Add to App.tsx (1 minute)

Open `src/App.tsx` and add the import:

```tsx
import { ContextMenuExamples } from '../components/ContextMenuExamples';
```

Find where you render content and temporarily add:

```tsx
// In your renderContent() function or wherever you want to test
case 'context-menu-test':
  return <ContextMenuExamples />;
```

Then navigate to that page, or just add it to your dashboard temporarily:

```tsx
case 'dashboard':
  return (
    <>
      <Dashboard {...props} />
      <ContextMenuExamples />
    </>
  );
```

### Step 2: Test It! (2 minutes)

1. **Save** and refresh browser
2. **Right-click** any card/item
3. **See the menu** appear! 🎉
4. **Try keyboard navigation** (↑↓, Enter, Esc)
5. **Click an action** to see it work

---

## Add to Real Components (2 minutes)

### Quick Example: Project Cards

Open `components/ProjectList.tsx` and add at the top:

```tsx
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { EditIcon, TrashIcon, CopyIcon } from './icons';
```

Create menu items function:

```tsx
const getProjectMenu = (project: Project): ContextMenuItem[] => [
  {
    id: 'edit',
    label: 'Edit Project',
    icon: <EditIcon />,
    onClick: () => handleEditProject(project.id)
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <CopyIcon />,
    onClick: () => handleDuplicateProject(project)
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: () => handleDeleteProject(project.id),
    danger: true
  }
];
```

Wrap your project cards:

```tsx
// Before:
{projects.map(project => (
  <div key={project.id} className="project-card">
    {/* card content */}
  </div>
))}

// After:
{projects.map(project => (
  <ContextMenu key={project.id} items={getProjectMenu(project)}>
    <div className="project-card">
      {/* card content */}
    </div>
  </ContextMenu>
))}
```

**That's it!** Right-click your project cards now! 🎉

---

## Quick Integration Checklist

- [ ] Import ContextMenu component
- [ ] Import icons you'll use
- [ ] Create getMenu function with items array
- [ ] Wrap your element with `<ContextMenu>`
- [ ] Pass items prop
- [ ] Test by right-clicking!

---

## Common Patterns

### Pattern 1: Cards/Grid Items
```tsx
<ContextMenu items={getItemMenu(item)}>
  <div className="card">
    {/* card content */}
  </div>
</ContextMenu>
```

### Pattern 2: Table Rows
```tsx
<ContextMenu items={getRowMenu(row)}>
  <tr>
    {/* row content */}
  </tr>
</ContextMenu>
```

### Pattern 3: List Items
```tsx
<ContextMenu items={getItemMenu(item)}>
  <li>
    {/* list item content */}
  </li>
</ContextMenu>
```

---

## Menu Items Template

Copy/paste and customize:

```tsx
const menuItems: ContextMenuItem[] = [
  {
    id: 'view',
    label: 'View Details',
    icon: <EyeIcon />,
    onClick: () => handleView()
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: <EditIcon />,
    shortcut: '⌘E',
    onClick: () => handleEdit(),
    divider: true  // Adds separator line
  },
  {
    id: 'share',
    label: 'Share',
    icon: <ShareIcon />,
    onClick: () => handleShare()
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: () => handleDelete(),
    danger: true  // Makes text red
  }
];
```

---

## Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Open menu | Right-click |
| Navigate | ↑ ↓ |
| Select | Enter |
| Close | Esc |

---

## Where to Add First

### Start Here (Biggest Impact):
1. ✅ **Project cards** - Most clicked
2. ✅ **Client list rows** - Frequently used
3. ✅ **Document items** - Natural fit

### Then Add To:
4. Task items
5. Team member cards
6. Activity feed items

---

## 5-Minute Integration

```tsx
// 1. Import (30 seconds)
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { EditIcon, TrashIcon } from './icons';

// 2. Create menu function (2 minutes)
const getMenu = (item: any): ContextMenuItem[] => [
  {
    id: 'edit',
    label: 'Edit',
    icon: <EditIcon />,
    onClick: () => handleEdit(item)
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: () => handleDelete(item),
    danger: true
  }
];

// 3. Wrap your element (1 minute)
<ContextMenu items={getMenu(item)}>
  <div>{/* your content */}</div>
</ContextMenu>

// 4. Test it! (1.5 minutes)
// Right-click and enjoy! 🎉
```

---

## Troubleshooting (30 seconds)

**Menu doesn't appear?**
- Check you wrapped element with `<ContextMenu>`
- Verify items array is not empty
- Check console for errors

**Menu goes off screen?**
- It auto-positions! But check z-index if issues

**Keyboard nav doesn't work?**
- Menu must be open first
- Items can't all be disabled

---

## Next Steps

1. ✅ Test the examples
2. ✅ Add to project cards
3. ✅ Add to client list
4. ✅ Expand to other components
5. ✅ Show your team!

---

**Time to Complete:** 5 minutes  
**Impact:** 🔥🔥🔥 HUGE  
**Difficulty:** ⭐ Easy  

You got this! 🚀