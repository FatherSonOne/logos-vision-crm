# Phase 4+ Implementation Guide

This guide shows you how to apply all Phase 4+ features to the remaining components in your CRM.

## 🎯 Quick Reference

### Files Updated
- ✅ `ClientList.tsx` - Added pagination
- ✅ `VolunteerList.tsx` - Added pagination
- ✅ `AddTeamMemberDialog.tsx` - Added validation
- ✅ `AddVolunteerDialog.tsx` - Added validation
- ✅ `ProjectList.tsx` - Added pagination + permissions

### New Features Added
- ✅ Pagination system (`/src/components/ui/Pagination.tsx`)
- ✅ Form validation (`/src/utils/validations.ts`)
- ✅ Permission system (`/src/contexts/PermissionContext.tsx`)
- ✅ Error boundaries (`/src/components/ErrorBoundary.tsx`)
- ✅ Retry mechanism (`/src/utils/retry.ts`)
- ✅ Image optimization (`/src/components/ui/OptimizedImage.tsx`)
- ✅ Keyboard shortcuts (`/src/hooks/useKeyboardShortcuts.ts`)
- ✅ Loading state hooks (`/src/hooks/useLoadingState.ts`)
- ✅ Supabase RLS policies (`/database/rls_policies.sql`)

---

## 📄 1. Adding Pagination to List Components

### Template for Any List Component

```tsx
import { usePagination, Pagination } from './ui/Pagination';

export const MyListComponent = ({ items }) => {
  // Add pagination hook
  const {
    paginatedItems,
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(items, 12); // 12 items per page

  return (
    <div>
      {/* Render paginated items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paginatedItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Add pagination component */}
      {items.length > itemsPerPage && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={items.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[12, 24, 48]}
          />
        </div>
      )}
    </div>
  );
};
```

### With Filtering/Sorting

If your component has filtering or sorting, apply pagination to the filtered results:

```tsx
const filteredItems = useMemo(() => {
  return items.filter(/* your filter logic */);
}, [items, /* filter dependencies */]);

// Paginate the filtered results
const {
  paginatedItems,
  currentPage,
  resetPagination,
  // ...
} = usePagination(filteredItems, 12);

// Reset pagination when filters change
useEffect(() => {
  resetPagination();
}, [filterValue, resetPagination]);
```

### Components That Need Pagination

- ⏳ `TaskView.tsx` - Task list
- ⏳ `CaseManagement.tsx` - Case list
- ⏳ `ContactList.tsx` - Contact list
- ⏳ `ActivityFeed.tsx` - Activity list
- ⏳ `DocumentLibrary.tsx` - Document list
- ⏳ `DonationList.tsx` - Donation list
- ⏳ `EventList.tsx` - Event list

---

## ✅ 2. Adding Form Validation to Dialogs

### Template for Dialog with Validation

```tsx
import { z } from 'zod';
import { yourSchema } from '../utils/validations';

export const MyDialog = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ /* initial state */ });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate with Zod
      const validData = yourSchema.parse(formData);

      // Save valid data
      onSave(validData);

      // Reset form
      setFormData({ /* initial state */ });
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
    }
  };

  // Input styles
  const inputStyles = "w-full p-2 bg-slate-100 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500";
  const errorInputStyles = "w-full p-2 bg-slate-100 border border-red-500 rounded-md focus:ring-red-500 focus:border-red-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Dialog">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Field Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            className={errors.field ? errorInputStyles : inputStyles}
          />
          {errors.field && (
            <p className="mt-1 text-sm text-red-600">{errors.field}</p>
          )}
        </div>

        {/* More fields... */}

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};
```

### Components That Need Validation

- ⏳ `AddClientDialog.tsx` - Use `clientSchema`
- ⏳ `AddProjectDialog.tsx` - Use `projectSchema`
- ⏳ `AddTaskDialog.tsx` - Use `taskSchema`
- ⏳ `AddCaseDialog.tsx` - Use `caseSchema`
- ⏳ `AddActivityDialog.tsx` - Use `activitySchema`
- ⏳ `AddDonationDialog.tsx` - Use `donationSchema`
- ⏳ `AddEventDialog.tsx` - Use `eventSchema`

---

## 🔐 3. Adding Permission Checks

### In Components

```tsx
import { usePermissions } from '../contexts/PermissionContext';
import { Permission } from '../types';

const MyComponent = () => {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {/* Conditional rendering based on permission */}
      {hasPermission(Permission.ProjectCreate) && (
        <button onClick={handleCreate}>Create Project</button>
      )}

      {/* Disable button without permission */}
      <button
        onClick={handleDelete}
        disabled={!hasPermission(Permission.ProjectDelete)}
      >
        Delete
      </button>
    </div>
  );
};
```

### With ProtectedComponent

```tsx
import { ProtectedComponent } from '../components/ProtectedComponent';
import { Permission } from '../types';

<ProtectedComponent permission={Permission.ProjectCreate}>
  <button onClick={handleCreate}>Create Project</button>
</ProtectedComponent>

{/* With multiple permissions (any) */}
<ProtectedComponent
  permissions={[Permission.ProjectEdit, Permission.ProjectDelete]}
  requireAll={false}
>
  <button>Manage Project</button>
</ProtectedComponent>
```

### In Context Menus

```tsx
const menuItems: ContextMenuItem[] = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <EditIcon />,
    onClick: handleEdit,
    disabled: !hasPermission(Permission.ClientEdit),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    onClick: handleDelete,
    disabled: !hasPermission(Permission.ClientDelete),
    danger: true,
  },
];
```

---

## ⏳ 4. Adding Loading States

### With useLoadingState Hook

```tsx
import { useLoadingState } from '../hooks/useLoadingState';

const MyComponent = () => {
  const { isLoading, error, execute } = useLoadingState();
  const [data, setData] = useState([]);

  const loadData = async () => {
    await execute(async () => {
      const result = await fetchData();
      setData(result);
    });
  };

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render data */}</div>;
};
```

### With AsyncData Component

```tsx
import { AsyncData } from '../hooks/useLoadingState';
import { Loading } from './ui/Loading';

<AsyncData
  isLoading={isLoading}
  error={error}
  data={data}
  loadingComponent={<Loading />}
  errorComponent={(err) => <div>Error: {err.message}</div>}
>
  {(data) => (
    <div>{/* render with data */}</div>
  )}
</AsyncData>
```

### With Multiple Operations

```tsx
import { useMultipleLoadingStates } from '../hooks/useLoadingState';

const Dashboard = () => {
  const { states, executeAll } = useMultipleLoadingStates(['users', 'projects', 'tasks']);

  useEffect(() => {
    executeAll({
      users: () => fetchUsers(),
      projects: () => fetchProjects(),
      tasks: () => fetchTasks(),
    });
  }, []);

  if (states.users.isLoading) return <div>Loading users...</div>;
  if (states.projects.isLoading) return <div>Loading projects...</div>;

  return <div>{/* render */}</div>;
};
```

---

## ⌨️ 5. Adding Keyboard Shortcuts

### In Your Main App Component

```tsx
import { useState } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '../components/KeyboardShortcutsHelp';

const App = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Register shortcuts
  useKeyboardShortcuts([
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => setShowHelp(true),
      category: 'Help',
    },
    {
      key: 'p',
      ctrl: true,
      shift: true,
      description: 'Go to Projects',
      action: () => setCurrentPage('projects'),
      category: 'Navigation',
    },
    {
      key: 'n',
      ctrl: true,
      description: 'New Project',
      action: () => setShowNewProject(true),
      category: 'Actions',
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Search',
      action: () => setShowSearch(true),
      category: 'Actions',
    },
  ]);

  return (
    <>
      {/* Your app */}

      {/* Help modal */}
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        shortcuts={/* pass all shortcuts */}
      />
    </>
  );
};
```

### Show Hints in UI

```tsx
import { ShortcutHint } from '../components/KeyboardShortcutsHelp';

<button onClick={handleNewProject}>
  New Project
  <ShortcutHint shortcut={{ key: 'n', ctrl: true }} />
</button>
```

---

## 🔄 6. Adding Retry Logic

### To Service Calls

```tsx
import { retryWithBackoff, networkRetryOptions } from '../utils/retry';

const loadProjects = async () => {
  try {
    const projects = await retryWithBackoff(
      () => projectService.getAll(),
      networkRetryOptions
    );
    setProjects(projects);
  } catch (error) {
    // All retries failed
    showError('Failed to load projects');
  }
};
```

### With React Hook

```tsx
import { useRetry } from '../utils/retry';

const MyComponent = () => {
  const { retry, isRetrying, retryCount } = useRetry({
    maxAttempts: 3,
    onRetry: (error, attempt) => {
      console.log(`Retry ${attempt} after error:`, error);
    },
  });

  const loadData = async () => {
    await retry(() => fetchData());
  };

  return (
    <button onClick={loadData} disabled={isRetrying}>
      {isRetrying ? `Retrying... (${retryCount})` : 'Load Data'}
    </button>
  );
};
```

---

## 🗄️ 7. Implementing Supabase RLS

### Apply the RLS Policies

```bash
# Connect to your Supabase project
psql $DATABASE_URL

# Run the RLS policies
\i database/rls_policies.sql
```

### Set User Roles

When creating users, set their role in metadata:

```tsx
// In your signup function
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      name: 'John Doe',
      role: 'Manager', // or 'Admin', 'Consultant', 'Client'
    },
  },
});
```

### Update Existing Users

```sql
-- Update user role in Supabase dashboard or via SQL
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"Manager"'
)
WHERE email = 'user@example.com';
```

---

## 🧪 8. Testing Checklist

### Before Committing

- [ ] Run `npm run build` - Ensure no TypeScript errors
- [ ] Test pagination on large lists (100+ items)
- [ ] Test form validation with invalid data
- [ ] Test permission checks for each role
- [ ] Test keyboard shortcuts
- [ ] Test loading states
- [ ] Test retry mechanism with network failures
- [ ] Test RLS policies in Supabase

### User Acceptance Testing

- [ ] Admin can access all features
- [ ] Manager has limited delete capabilities
- [ ] Consultant can only edit assigned items
- [ ] Client has view-only access
- [ ] Pagination works on all list views
- [ ] Forms show helpful validation errors
- [ ] Keyboard shortcuts work as expected
- [ ] Loading states display properly
- [ ] Errors are handled gracefully

---

## 📦 9. Remaining Components to Update

### High Priority

1. **TaskView.tsx** - Add pagination
2. **CaseManagement.tsx** - Add pagination
3. **AddClientDialog.tsx** - Add validation
4. **ActivityFeed.tsx** - Add pagination + loading states

### Medium Priority

5. **DocumentLibrary.tsx** - Add pagination + permissions
6. **ContactList.tsx** - Add pagination
7. **AddTaskDialog.tsx** - Add validation
8. **AddCaseDialog.tsx** - Add validation

### Low Priority

9. **DonationList.tsx** - Add pagination
10. **EventList.tsx** - Add pagination
11. **EmailCampaigns.tsx** - Add permissions
12. **Reports.tsx** - Add loading states

---

## 🚀 10. Next Steps

1. **Apply to 3-4 more components** using templates above
2. **Test thoroughly** with different user roles
3. **Set up Supabase RLS** in production
4. **Add more keyboard shortcuts** as needed
5. **Monitor performance** with pagination
6. **Gather user feedback** on UX improvements

---

## 💡 Tips & Best Practices

### Pagination
- Use 12-24 items per page for card grids
- Use 25-50 items per page for tables
- Always reset pagination when filters change

### Validation
- Show errors immediately after first submission attempt
- Use red borders + error text for invalid fields
- Mark required fields with asterisks

### Permissions
- Disable (don't hide) actions user can't perform
- Show helpful tooltips explaining why disabled
- Test with actual user accounts, not just mock data

### Loading States
- Always show loading for operations > 500ms
- Use skeleton screens for initial loads
- Use spinners for quick updates

### Keyboard Shortcuts
- Don't override browser shortcuts
- Use Ctrl/Cmd for primary actions
- Use Shift for variations
- Show hints in tooltips

---

## 🆘 Troubleshooting

### "Permission denied" errors
- Check user role is set correctly in auth metadata
- Verify RLS policies are applied
- Check function `get_user_role()` returns correct value

### Pagination not resetting
- Ensure `resetPagination()` is called in `useEffect`
- Add all filter dependencies to dependency array

### Validation not showing errors
- Check schema matches form data structure
- Verify error state is being set
- Check error messages in console

### Keyboard shortcuts not working
- Verify shortcuts aren't conflicting
- Check if focus is on input field
- Test with different browsers

---

**For questions or issues, check the main documentation:**
- `/PHASE4_IMPLEMENTATION.md` - Phase 4 features overview
- `/database/SETUP_GUIDE.md` - Database setup
- `/database/rls_policies.sql` - RLS policy reference

Happy coding! 🎉
