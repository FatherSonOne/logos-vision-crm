# Phase 3 Testing Guide

## Quick Testing Checklist

Use this guide to verify that TaskView.tsx is properly connected to the database.

---

## Pre-Testing Setup

### 1. Verify Database Migrations
Before testing, ensure these migrations have been run:

```bash
# Check if required columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tasks';
```

Required columns:
- `id` (uuid)
- `title` (varchar/text)
- `description` (text)
- `status` (varchar)
- `priority` (varchar)
- `due_date` (date)
- `assigned_to` (uuid)
- `time_estimate_hours` (numeric)
- `time_spent_hours` (numeric)
- `tags` (text array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. Verify Supabase Connection
```typescript
// In browser console
import { supabase } from './services/supabaseClient';
const { data, error } = await supabase.from('tasks').select('count');
console.log('Connection test:', { data, error });
```

Expected: `{ data: [{count: N}], error: null }`

### 3. Enable Real-time
In Supabase dashboard:
1. Go to Database → Replication
2. Enable replication for `tasks` table
3. Publish changes

---

## Test Scenarios

### Test 1: Initial Load

**Steps**:
1. Navigate to Tasks section
2. Observe loading spinner
3. Wait for tasks to load

**Expected**:
- Spinner with "Loading tasks..." appears briefly
- Tasks load from database
- Metrics update with correct counts
- No errors in console

**If Empty**:
- "No tasks yet" empty state displays
- "Create Task" button visible

---

### Test 2: Create Task

**Steps**:
1. Click "New Task" button
2. Fill in task details:
   - Title: "Test Task 1"
   - Description: "Testing database integration"
   - Status: New
   - Priority: Medium
   - Due Date: (select a date)
   - Department: Consulting
   - Time Estimate: 4 hours
3. Click "Save"

**Expected**:
- Task appears immediately in list (optimistic update)
- Green toast: "Task created successfully"
- Task persists after page refresh
- Metrics update (+1 total)
- Console shows: "Task changed: INSERT"

**Verify in Database**:
```sql
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 1;
```

---

### Test 3: Update Task

**Steps**:
1. Click on a task to open detail modal
2. Click "Edit" button
3. Change title to "Updated Test Task"
4. Change status to "In Progress"
5. Change priority to "High"
6. Click "Save"

**Expected**:
- UI updates immediately
- Green toast: "Task updated successfully"
- Changes persist after page refresh
- Metrics update (if status changed)
- Console shows: "Task changed: UPDATE"

**Verify in Database**:
```sql
SELECT title, status, priority FROM tasks WHERE id = 'task-id';
```

---

### Test 4: Delete Task

**Steps**:
1. Click "Delete" button on a task
2. Confirm deletion

**Expected**:
- Task disappears immediately from UI
- Green toast: "Task deleted successfully"
- Task doesn't reappear after refresh
- Metrics update (-1 total)
- Console shows: "Task changed: DELETE"

**Verify in Database**:
```sql
SELECT * FROM tasks WHERE id = 'deleted-task-id';
-- Should return no rows
```

---

### Test 5: Bulk Status Update

**Steps**:
1. Select multiple tasks (checkboxes)
2. Click bulk action menu
3. Select "Mark as In Progress"
4. Confirm

**Expected**:
- All selected tasks update status immediately
- Green toast: "N tasks updated"
- Changes persist after refresh
- Metrics update
- Console shows multiple "Task changed: UPDATE" events

---

### Test 6: Real-time Sync

**Setup**: Open Tasks page in two browser windows side-by-side

**Steps**:
1. In Window 1: Create a new task
2. Observe Window 2

**Expected**:
- Window 2 automatically reloads tasks
- New task appears in Window 2 without refresh
- Console in Window 2 shows: "Task changed: INSERT"

**Repeat for Update and Delete**:
- Window 1: Update a task → Window 2 sees change
- Window 1: Delete a task → Window 2 sees removal

---

### Test 7: Error Handling

#### Simulate Network Error

**Steps**:
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to create a task
4. Observe error handling

**Expected**:
- Red toast: "Failed to create task"
- Error banner appears with message
- Task not added to list
- User can dismiss error

#### Simulate Database Error

**Steps**:
1. Temporarily break RLS policy in Supabase
2. Try to create a task
3. Restore RLS policy

**Expected**:
- Error caught and displayed
- User-friendly error message
- Console shows detailed error
- Application doesn't crash

---

### Test 8: Loading States

**Steps**:
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Refresh Tasks page
4. Observe loading behavior

**Expected**:
- Spinner appears during initial load
- "Loading tasks..." message displays
- UI waits for data before rendering
- No flash of empty state

---

### Test 9: Empty State

**Steps**:
1. Delete all tasks from database
2. Refresh Tasks page

**Expected**:
- No loading spinner after load completes
- Empty state displays:
  - CheckSquare icon (gray)
  - "No tasks yet" heading
  - "Create your first task to get started" message
  - "Create Task" button
- Clicking button opens create dialog

---

### Test 10: Metrics Calculation

**Steps**:
1. Create tasks with various statuses:
   - 5 New
   - 3 In Progress
   - 2 Completed
   - 1 Overdue
   - 1 with Critical priority
   - 1 due today
2. Observe metrics cards

**Expected Metrics**:
- Total Tasks: 11
- In Progress: 3
- Overdue: 1 (with red alert)
- Due Today: 1
- Critical: 1 (with red alert)
- Completed: 2

**Verify**:
- Metrics match actual task counts
- Alerts show for Overdue and Critical
- Metrics update when tasks change

---

### Test 11: All View Modes

#### List View
**Expected**:
- Table displays all tasks
- Columns: Title, Status, Priority, Due Date, Assignee, Department, Progress, Actions
- Status/Priority dropdowns work
- Progress bars display correctly
- Actions menu works

#### Kanban View
**Expected**:
- 5 columns: New, Assigned, In Progress, Overdue, Completed
- Tasks grouped by status
- Drag-and-drop between columns works
- Status updates on drop
- Card shows: title, priority, assignee, department, due date, subtasks

#### Timeline View
**Expected**:
- Visual bars positioned by dates
- "Today" red line visible
- Tasks span from creation to due date
- Progress percentage shown for in-progress tasks
- Toggle 2-week / 5-week view works

#### Department View
**Expected**:
- 5 sections: Consulting, Operations, Finance, HR, Marketing
- Collapsible sections work
- Summary stats show: completed count, overdue count
- Progress bars show completion percentage
- Tasks listed within each department

#### Calendar View
**Expected**:
- Monthly calendar grid
- Tasks appear on due dates
- Shows first 3 tasks per day
- "+N more" indicator for additional tasks
- Prev/Next month navigation works
- "Today" button returns to current month
- Today's date highlighted

---

### Test 12: Filtering

**Steps**:
1. Create tasks with various properties
2. Test each filter:

**Search**:
- Type "test" → Only tasks with "test" in title/description show

**Status Filter**:
- Select "In Progress" → Only in-progress tasks show

**Priority Filter**:
- Select "High" → Only high-priority tasks show

**Department Filter**:
- Select "Consulting" → Only consulting tasks show

**Assignee Filter**:
- Select a team member → Only their tasks show

**Combined Filters**:
- Search "report" + Status "In Progress" + Priority "High"
- Only tasks matching ALL criteria show

**Expected**:
- Filters apply instantly
- All view modes respect filters
- Metrics update based on filtered tasks
- Clearing filters restores all tasks

---

## Console Debugging

### Enable Verbose Logging

Add to browser console:
```javascript
// Monitor all task changes
window.taskDebug = true;

// Override console methods
const originalLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes?.('Task') || args[0]?.includes?.('task')) {
    originalLog.apply(console, ['[TASK DEBUG]', ...args]);
  } else {
    originalLog.apply(console, args);
  }
};
```

### Expected Console Output

**On Initial Load**:
```
Loading tasks...
Fetched N tasks from database
Calculating metrics...
```

**On Create**:
```
Creating task: { title: "...", status: "new", ... }
Task created successfully: { id: "...", ... }
Task changed: { eventType: "INSERT", new: {...} }
```

**On Update**:
```
Updating task ID: ...
Task updated successfully
Task changed: { eventType: "UPDATE", new: {...}, old: {...} }
```

**On Delete**:
```
Deleting task ID: ...
Task deleted successfully
Task changed: { eventType: "DELETE", old: {...} }
```

**On Real-time Event**:
```
Task changed: { ... }
Reloading tasks due to real-time update...
```

---

## Common Issues & Solutions

### Issue: "Failed to load tasks"

**Possible Causes**:
1. Supabase environment variables not set
2. Database migrations not run
3. RLS policies blocking access
4. Network connectivity issue

**Solutions**:
1. Check `.env.local` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Run database migrations
3. Check RLS policies allow authenticated users to read tasks
4. Check network tab for failed requests

---

### Issue: "Task created but doesn't appear"

**Possible Causes**:
1. RLS policies blocking SELECT after INSERT
2. Real-time subscription not established
3. Task filtered out by active filters

**Solutions**:
1. Check RLS policies allow user to read their own tasks
2. Check browser console for subscription errors
3. Clear all filters and check again

---

### Issue: "Real-time updates not working"

**Possible Causes**:
1. Real-time not enabled in Supabase
2. Subscription failed to establish
3. Browser blocking WebSocket connections

**Solutions**:
1. Enable replication for tasks table in Supabase dashboard
2. Check console for subscription errors
3. Check browser network tab for WebSocket upgrade
4. Disable ad blockers/extensions that might block WebSockets

---

### Issue: "Metrics not updating"

**Possible Causes**:
1. Metrics calculation failing
2. Tasks not triggering metrics reload
3. Service layer error

**Solutions**:
1. Check console for errors in `loadMetrics()`
2. Verify `useEffect` is triggering on task changes
3. Test `taskMetricsService.getOverallMetrics()` directly

---

### Issue: "Optimistic update reverted"

**Expected Behavior**: This is normal when a database operation fails

**Check**:
1. Console shows error message
2. Toast notification: "Failed to ..."
3. Error banner displays
4. UI reverts to previous state

**This indicates proper error handling is working**

---

## Performance Benchmarks

### Target Performance
- Initial load: < 1 second
- Task creation: < 100ms perceived (optimistic)
- Task update: < 100ms perceived (optimistic)
- Task deletion: < 100ms perceived (optimistic)
- Filter application: Instant (< 50ms)
- View mode switch: Instant (< 50ms)
- Real-time sync: < 500ms

### Measure Performance

**In Browser Console**:
```javascript
// Measure initial load
performance.mark('tasks-load-start');
// ... wait for load ...
performance.mark('tasks-load-end');
performance.measure('tasks-load', 'tasks-load-start', 'tasks-load-end');
console.log(performance.getEntriesByName('tasks-load')[0].duration);

// Measure task creation
performance.mark('task-create-start');
// ... create task ...
performance.mark('task-create-end');
performance.measure('task-create', 'task-create-start', 'task-create-end');
```

---

## Sign-off Checklist

Before considering Phase 3 complete, verify:

- [ ] All 12 test scenarios pass
- [ ] All 5 view modes work correctly
- [ ] All filters work correctly
- [ ] Real-time updates work in multi-window test
- [ ] Error handling works as expected
- [ ] Loading states display correctly
- [ ] Empty state displays correctly
- [ ] Metrics calculate accurately
- [ ] No console errors during normal operation
- [ ] Performance meets benchmarks
- [ ] All CRUD operations persist to database
- [ ] Optimistic updates provide instant feedback

---

## Next Steps After Testing

Once all tests pass:
1. Commit changes with message: "feat: connect TaskView to database backend (Phase 3)"
2. Update project documentation
3. Notify team that Phase 3 is complete
4. Begin planning Phase 4 (AI Integration)

---

## Support

If you encounter issues not covered in this guide:
1. Check browser console for detailed errors
2. Check Supabase logs for database errors
3. Review Phase 3 implementation in `PHASE_3_FRONTEND_INTEGRATION_COMPLETE.md`
4. Check service layer implementations:
   - `taskManagementService.ts`
   - `taskMetricsService.ts`
