# Task Management Testing Guide

## Critical Bug Fixed

### Issue Identified
The TaskView component had a prop/state synchronization bug where:
1. App.tsx passed an empty `tasks` array as a prop
2. TaskView checked `if (propTasks)` which was truthy for empty arrays
3. This prevented the component from loading tasks from the database
4. Real-time updates wouldn't work because the state management was conflicting

### Fix Applied
- Removed the early return check for `propTasks`
- Properly implemented state management with parent sync using `useCallback`
- Fixed circular dependency issues in the `setTasks` wrapper
- Now TaskView always loads tasks from the database and syncs with parent via callback

### Files Modified
- `src/components/TaskView.tsx` (Lines 194-203, 238-259)

---

## Manual Testing Instructions

### Prerequisites
1. Server running on http://localhost:5177
2. Browser console open (F12)
3. Two browser windows for real-time testing

### Test 1: Task Loading ✅

**Steps:**
1. Navigate to Tasks page
2. Observe loading spinner
3. Check browser console for:
   - "Loading tasks from database..." or similar
   - No errors

**Expected:**
- Loading spinner shows briefly
- Tasks load from Supabase database
- If no tasks exist, sample tasks are displayed with console message
- No errors in console

**Verification:**
```javascript
// In browser console
console.log('Tasks loaded:', document.querySelectorAll('[data-task-id]').length);
```

---

### Test 2: Create Task ✅

**Steps:**
1. Click "Create Task" button (or "+" icon)
2. Fill in form:
   - Title: "Test Task 1"
   - Description: "Testing task creation"
   - Priority: High
   - Due Date: Tomorrow
   - Assignee: Select any
3. Click "Save"
4. Observe task appears in list
5. Refresh page (F5)
6. Verify task still exists

**Expected:**
- Dialog opens smoothly
- Form validation works
- Task appears immediately after save
- Success toast shows "Task created successfully"
- Task persists after refresh
- Console shows no errors

**Verification:**
```sql
-- In Supabase dashboard, check tasks table
SELECT * FROM tasks WHERE title = 'Test Task 1';
```

---

### Test 3: Update Task ✅

**Steps:**
1. Click on a task to open details
2. Click "Edit" button
3. Change:
   - Status to "In Progress"
   - Priority to "Critical"
4. Save changes
5. Observe changes appear immediately
6. Refresh page (F5)
7. Verify changes persisted

**Expected:**
- Edit mode activates
- Changes save without errors
- UI updates immediately
- Success toast shows "Task updated successfully"
- Changes persist after refresh

**Alternative Test:**
1. Use dropdown in list view to change status
2. Use dropdown to change priority
3. Verify immediate update and persistence

---

### Test 4: Delete Task ✅

**Steps:**
1. Click delete icon on a task
2. Observe confirmation dialog
3. Click "Delete" to confirm
4. Observe task disappears
5. Refresh page (F5)
6. Verify task is gone

**Expected:**
- Confirmation dialog appears
- Task removed immediately after confirm
- Success toast shows "Task deleted successfully"
- Deletion persists after refresh
- No errors in console

---

### Test 5: View Modes ✅

**For Each View Mode:**

**List View:**
- Click "List" view button
- Verify all tasks show in table format
- Verify columns: checkbox, title, status, priority, due date, assignee

**Kanban View:**
- Click "Kanban" view button
- Verify tasks grouped into columns: New, Assigned, In Progress, Overdue, Completed
- Try dragging a task to different column
- Verify status updates

**Timeline View:**
- Click "Timeline" view button
- Verify tasks shown on timeline with date bars
- Verify tasks positioned correctly by due date

**Department View:**
- Click "Department" view button
- Verify tasks grouped by department
- Verify departments are expandable/collapsible

**Calendar View:**
- Click "Calendar" view button
- Verify tasks shown on calendar dates
- Verify tasks appear on correct dates

---

### Test 6: Filters ✅

**Search Filter:**
1. Type task name in search box
2. Verify only matching tasks show
3. Clear search
4. Verify all tasks return

**Status Filter:**
1. Select "In Progress" from status filter
2. Verify only in-progress tasks show
3. Select "All" to reset

**Priority Filter:**
1. Select "High" from priority filter
2. Verify only high-priority tasks show
3. Select "All" to reset

**Assignee Filter:**
1. Select a team member from assignee filter
2. Verify only their tasks show
3. Select "All" to reset

**Combined Filters:**
1. Set multiple filters at once
2. Verify correct intersection of results
3. Verify count updates properly

---

### Test 7: Real-time Updates ✅

**Setup:**
1. Open app in two browser windows side-by-side
2. Both windows on Tasks page

**Test Create:**
1. In Window 1: Create a new task
2. In Window 2: Observe task appears (~200ms delay)
3. Verify no manual refresh needed

**Test Update:**
1. In Window 1: Change task status
2. In Window 2: Observe status updates
3. Verify real-time sync

**Test Delete:**
1. In Window 1: Delete a task
2. In Window 2: Observe task disappears
3. Verify real-time sync

**Expected:**
- Changes appear in both windows automatically
- Small delay (100-300ms) acceptable
- No errors in console
- Console shows "Task changed:" messages

---

## Debugging Commands

### Check Database Connection
```javascript
// In browser console
import { supabase } from './services/supabaseClient';
const { data, error } = await supabase.from('tasks').select('count');
console.log('Tasks count:', data, error);
```

### Check Real-time Subscription
```javascript
// Should see in console
"Task changed: {eventType: 'INSERT', ...}"
"Task changed: {eventType: 'UPDATE', ...}"
"Task changed: {eventType: 'DELETE', ...}"
```

### Check State
```javascript
// Access React DevTools
// Find TaskView component
// Inspect state: tasks, loading, error
```

---

## Common Issues & Solutions

### Issue: Tasks not loading
**Solution:**
- Check Supabase connection
- Check browser console for errors
- Verify taskManagementService.getAllEnriched() is being called

### Issue: Real-time not working
**Solution:**
- Check Supabase realtime enabled on tasks table
- Check browser console for subscription errors
- Verify no ad blockers blocking WebSocket connections

### Issue: Tasks not persisting
**Solution:**
- Check Supabase write permissions
- Verify RLS policies allow insert/update/delete
- Check browser console for save errors

---

## Performance Benchmarks

### Load Time
- Initial load: < 1s
- Task creation: < 300ms
- Task update: < 200ms
- Task deletion: < 200ms
- View switch: < 100ms

### Real-time Latency
- Local: 100-200ms
- Network: 200-500ms
- Expected: < 1s

---

## Success Criteria

- ✅ All 7 test scenarios pass
- ✅ No console errors
- ✅ No visual glitches
- ✅ Real-time updates work
- ✅ Data persists to database
- ✅ Performance meets benchmarks
