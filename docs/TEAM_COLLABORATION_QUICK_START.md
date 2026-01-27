# Team Collaboration - Quick Start Guide

**Status:** ✅ Database fully configured and ready
**Last Updated:** January 26, 2026

---

## 🎯 What's Ready to Use

Your Logos Vision CRM now has a complete Team Collaboration system with:

- ✅ **Comments & Threads** - Comment on any entity with threaded replies
- ✅ **@Mentions** - Mention team members with autocomplete
- ✅ **Notifications** - Real-time notification center
- ✅ **Activity Feeds** - Track all changes and actions
- ✅ **Entity Watching** - Follow entities for updates
- ✅ **Real-time Sync** - Live updates via Supabase

---

## 🚀 Quick Integration Steps

### 1. Add Comment Thread to Task View

```tsx
// In src/components/TaskView.tsx (or TaskDetail.tsx)
import { CommentThread } from './collaboration';

// Inside your component, add this to the UI:
<CommentThread
  entityType="task"
  entityId={task.id}
  currentUser={currentUser}
  teamMembers={teamMembers}
  title="Discussion"
  placeholder="Add a comment or @mention someone..."
/>
```

### 2. Add Notification Center to Header

```tsx
// In your Header/Navigation component
import { NotificationCenter } from './components/collaboration';

// Add to your header UI:
<NotificationCenter
  currentUser={currentUser}
  onNavigate={(url) => {
    // Handle navigation to the entity
    console.log('Navigate to:', url);
  }}
/>
```

### 3. Add Activity Feed to Sidebars

```tsx
// In entity detail pages (Task, Project, etc.)
import { ActivityFeed } from './components/collaboration';

// Add to sidebar:
<ActivityFeed
  entityType="task"
  entityId={taskId}
  currentUser={currentUser}
  compact={true}
/>
```

### 4. Log Activity When Data Changes

```typescript
// Import the service
import { logActivity } from './services/collaborationService';

// When you update a task:
await logActivity({
  entityType: 'task',
  entityId: task.id,
  action: 'updated',
  actor: currentUser,
  changes: {
    status: { old: 'To Do', new: 'In Progress' }
  }
});

// When you create a task:
await logActivity({
  entityType: 'task',
  entityId: newTask.id,
  action: 'created',
  actor: currentUser,
  description: `Created task: ${newTask.title}`
});
```

---

## 📁 File Locations

All collaboration code is ready in your project:

| Component | Location |
|-----------|----------|
| Comment Thread | `src/components/collaboration/CommentThread.tsx` |
| Notification Center | `src/components/collaboration/NotificationCenter.tsx` |
| Activity Feed | `src/components/collaboration/ActivityFeed.tsx` |
| Service Layer | `src/services/collaborationService.ts` |
| Mention Utils | `src/utils/mentionUtils.ts` |
| Types | `src/types.ts` (collaboration types added) |

---

## 🔧 Service API Reference

### Comments

```typescript
// Get comments for an entity
const comments = await getComments('task', taskId);

// Create a comment
await createComment({
  entityType: 'task',
  entityId: taskId,
  content: 'Great work on this @john!',
}, currentUser, teamMembers);

// Edit a comment
await updateComment(commentId, 'Updated text', currentUser, teamMembers);

// Delete a comment
await deleteComment(commentId, currentUser.id);
```

### Notifications

```typescript
// Get user notifications
const notifications = await getNotifications(userId);

// Get unread count
const count = await getUnreadNotificationCount(userId);

// Mark as read
await markNotificationRead(notificationId);

// Mark all as read
await markAllNotificationsRead(userId);
```

### Activity Log

```typescript
// Get activity for an entity
const activity = await getActivityLog('project', projectId);

// Log an action
await logActivity({
  entityType: 'project',
  entityId: projectId,
  action: 'status_changed',
  actor: currentUser,
  changes: {
    status: { old: 'Planning', new: 'Active' }
  }
});
```

### Entity Watching

```typescript
// Watch an entity
await watchEntity('task', taskId, userId, 'all');

// Check if watching
const isWatching = await isUserWatching('task', taskId, userId);

// Unwatch
await unwatchEntity('task', taskId, userId);
```

---

## 🎨 Component Examples

### Basic Comment Thread

```tsx
<CommentThread
  entityType="task"
  entityId={task.id}
  currentUser={currentUser}
  teamMembers={teamMembers}
/>
```

### Activity Feed with Filters

```tsx
<ActivityFeed
  entityType="project"
  entityId={project.id}
  currentUser={currentUser}
  title="Recent Activity"
  showFilters={true}
/>
```

### Compact Activity Feed (for sidebars)

```tsx
<ActivityFeed
  entityType="case"
  entityId={caseId}
  compact={true}
  limit={5}
/>
```

---

## 🔔 Notification Types

The system supports these notification types:

| Type | Description | Trigger |
|------|-------------|---------|
| `mention` | User was @mentioned | @username in comment |
| `comment` | New comment on watched entity | Comment created |
| `reply` | Reply to your comment | Reply added |
| `assignment` | Assigned to task/project | Assignee changed |
| `status_change` | Status changed | Status updated |
| `due_date` | Due date approaching | Scheduled check |
| `completion` | Entity completed | Status → Complete |

---

## ✅ Testing Checklist

Use this to verify collaboration features work:

- [ ] Create a comment on a task
- [ ] @mention a team member in a comment
- [ ] Verify mentioned user receives a notification
- [ ] Reply to a comment (threaded replies)
- [ ] Edit your own comment
- [ ] Delete your own comment
- [ ] Pin an important comment
- [ ] View activity feed on a task
- [ ] Filter activity feed by action type
- [ ] Mark a notification as read
- [ ] Mark all notifications as read
- [ ] Watch/unwatch an entity
- [ ] Verify real-time updates work (open in 2 browsers)

---

## 🎯 Next Steps

1. **Start with Task View** - Add comment thread to your existing task detail page
2. **Add Notification Center** - Put it in your header/navigation
3. **Test @Mentions** - Create some test comments mentioning team members
4. **Add Activity Logging** - Log actions when tasks are created/updated
5. **Customize Styling** - Adjust colors to match your brand

---

## 🆘 Need Help?

- **Service API**: See `src/services/collaborationService.ts` for full API
- **Component Props**: Check component files for all available props
- **Types**: See `src/types.ts` for TypeScript interfaces
- **Implementation Details**: See `docs/TEAM_COLLABORATION_IMPLEMENTATION.md`

---

## 🎉 You're All Set!

Your collaboration infrastructure is ready. Start integrating the components into your app and enjoy real-time team collaboration in Logos Vision CRM!
