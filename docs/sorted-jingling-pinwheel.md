# Comprehensive Collaboration Features Integration Plan

## Overview

This plan details the integration of advanced collaboration features throughout Logos Vision CRM, leveraging the newly created collaboration database tables and backend services. The implementation adds comments, @mentions, notifications, activity tracking, and entity watching to all major entity types (Tasks, Projects, Cases, Contacts, Documents).

## What's Already Built (Ready to Use)

### Database Schema ✅
All tables created and verified in Supabase:
- `comments` - Threaded comments with soft delete
- `mentions` - @mention tracking with read status
- `notifications` - User notifications with filtering
- `activity_log` - Audit trail for collaboration
- `entity_watchers` - Entity following/watching
- `notification_preferences` - User notification settings

### Backend Services ✅
**File**: `src/services/collaborationService.ts` (~800 lines)

Complete API for:
- Comment CRUD with threading (`getComments`, `createComment`, `updateComment`, `deleteComment`)
- Mention management (`getMentionsForUser`, `markMentionRead`)
- Notifications (`getNotifications`, `createNotification`, `markNotificationRead`)
- Activity logging (`logActivity`, `getActivityLog`)
- Entity watching (`watchEntity`, `unwatchEntity`, `isUserWatching`)
- Real-time subscriptions (`subscribeToComments`, `subscribeToNotifications`)

### UI Components ✅
**Location**: `src/components/collaboration/`

1. **CommentThread.tsx** - Threaded comments with @mentions, edit/delete, pinning, real-time updates
2. **NotificationCenter.tsx** - Full notification panel with filtering, grouping, mark as read, archive
3. **ActivityFeed.tsx** - Activity timeline with filtering, compact mode, change tracking

### Utilities ✅
- **mentionUtils.ts** - @mention parsing, rendering, autocomplete suggestions

## Architecture Context

**Current State**:
- No global state management (service layer pattern)
- Current user stored in `App.tsx` state (`currentUserId: 'tm-5'`)
- Team members fetched via `teamMemberService.getAll()`
- Real-time handled via `realtimeService` with Supabase subscriptions
- Component-level state with `useState`/`useEffect`

**Integration Strategy**:
- Pass `currentUser` and `teamMembers` as props from `App.tsx`
- Use existing `useRealtime` hook for subscriptions
- Follow established service layer pattern for data fetching
- Add activity logging to all entity CRUD operations

---

## Phase 1: Foundation & Header Integration

**Objective**: Replace basic NotificationCenter with advanced version, establish current user pattern

### Task 1.1: Update App.tsx for User Context

**File**: `src/App.tsx`

Add current user state:
```typescript
const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);

// In loadAllData(), after team members load:
const loadedTeamMembers = await teamMemberService.getAll();
setTeamMembers(loadedTeamMembers);
const user = loadedTeamMembers.find(tm => tm.id === currentUserId);
setCurrentUser(user || null);
```

Pass to Header:
```typescript
<Header
  currentUser={currentUser}
  onNavigate={handleNotificationNavigate}
  // ... other props
/>
```

### Task 1.2: Implement Notification Navigation Handler

**File**: `src/App.tsx`

```typescript
const handleNotificationNavigate = useCallback((url: string) => {
  const urlObj = new URL(url, window.location.origin);
  const path = urlObj.pathname.slice(1);
  const params = new URLSearchParams(urlObj.search);

  switch(path) {
    case 'tasks':
      setCurrentPage('tasks');
      if (params.get('id')) {
        // Set selected task
      }
      break;
    case 'projects':
      setCurrentPage('projects');
      break;
    // ... other cases
  }
}, []);
```

### Task 1.3: Update Header Component

**File**: `src/components/Header.tsx`

Update props:
```typescript
interface HeaderProps {
  currentUser: TeamMember | null;
  onNavigate?: (url: string) => void;
  // ... existing props
}
```

Replace NotificationCenter:
```typescript
import { NotificationCenter } from './collaboration/NotificationCenter';

// In JSX:
{currentUser && (
  <NotificationCenter
    currentUser={currentUser}
    onNavigate={onNavigate}
  />
)}
```

### Verification
- [ ] Notification bell shows unread count
- [ ] Clicking notifications marks as read
- [ ] Navigation from notifications works
- [ ] Real-time notifications appear
- [ ] Mark all as read functions

---

## Phase 2: TaskView Integration

**Objective**: Add CommentThread and ActivityFeed to task detail view

### Task 2.1: Add Collaboration Tabs to TaskView

**File**: `src/components/TaskView.tsx`

Update props:
```typescript
interface TaskViewProps {
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  // ... existing props
}
```

Add tabs to task detail panel:
```typescript
const [activeTab, setActiveTab] = useState<'details' | 'discussion' | 'activity'>('details');

// Tab buttons
<div className="flex border-b">
  <button onClick={() => setActiveTab('details')}>Details</button>
  <button onClick={() => setActiveTab('discussion')}>
    Discussion {commentCount > 0 && `(${commentCount})`}
  </button>
  <button onClick={() => setActiveTab('activity')}>Activity</button>
</div>

// Tab content
{activeTab === 'discussion' && (
  <CommentThread
    entityType="task"
    entityId={task.id}
    currentUser={currentUser}
    teamMembers={teamMembers}
    title="Task Discussion"
    placeholder="Comment on this task... Use @ to mention someone"
  />
)}

{activeTab === 'activity' && (
  <ActivityFeed
    entityType="task"
    entityId={task.id}
    currentUser={currentUser}
    title="Task Activity"
  />
)}
```

### Task 2.2: Add Activity Logging to Task Service

**File**: `src/services/taskManagementService.ts`

Add to all mutations:
```typescript
import { logActivity } from './collaborationService';

// After task creation
await logActivity({
  entityType: 'task',
  entityId: newTask.id,
  action: 'created',
  actor: currentUser,
  description: `Created task: ${taskData.title}`
});

// After task update
await logActivity({
  entityType: 'task',
  entityId: taskId,
  action: 'updated',
  actor: currentUser,
  changes: calculateChanges(oldTask, updatedTask)
});
```

### Verification
- [ ] Comments appear in task detail
- [ ] @mentions work and create notifications
- [ ] Real-time comments update
- [ ] Activity feed shows task changes
- [ ] Activity logged on task creation/update

---

## Phase 3: ProjectDetail Integration

**Objective**: Add collaboration sidebar to project detail page

### Task 3.1: Create WatchEntityButton Component

**File**: `src/components/collaboration/WatchEntityButton.tsx` (NEW)

```typescript
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { isUserWatching, watchEntity, unwatchEntity } from '../../services/collaborationService';

interface WatchEntityButtonProps {
  entityType: CollaborationEntityType;
  entityId: string;
  currentUserId: string;
}

export const WatchEntityButton: React.FC<WatchEntityButtonProps> = ({
  entityType, entityId, currentUserId
}) => {
  const [watching, setWatching] = useState<EntityWatcher | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await isUserWatching(entityType, entityId, currentUserId);
      setWatching(status);
    };
    checkStatus();
  }, [entityType, entityId, currentUserId]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (watching) {
        await unwatchEntity(entityType, entityId, currentUserId);
        setWatching(null);
      } else {
        const watcher = await watchEntity(entityType, entityId, currentUserId, 'all');
        setWatching(watcher);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        watching ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-gray-100 dark:bg-gray-800'
      }`}
    >
      {watching ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      {watching ? 'Watching' : 'Watch'}
    </button>
  );
};
```

### Task 3.2: Update ProjectDetail Layout

**File**: `src/components/ProjectDetail.tsx`

Update props:
```typescript
interface ProjectDetailProps {
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  // ... existing props
}
```

Add collaboration sidebar:
```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main content - 2 columns */}
  <div className="lg:col-span-2">
    {/* Existing project details */}
  </div>

  {/* Collaboration sidebar - 1 column */}
  <div className="space-y-4">
    <WatchEntityButton
      entityType="project"
      entityId={project.id}
      currentUserId={currentUser.id}
    />

    <CommentThread
      entityType="project"
      entityId={project.id}
      currentUser={currentUser}
      teamMembers={teamMembers}
      title="Project Discussion"
    />

    <ActivityFeed
      entityType="project"
      entityId={project.id}
      currentUser={currentUser}
      title="Recent Activity"
      limit={10}
      compact={true}
    />
  </div>
</div>
```

### Task 3.3: Add Activity Logging to Project Service

**File**: `src/services/projectService.ts`

Add logging to create, update, status change operations.

### Verification
- [ ] Comments appear in project sidebar
- [ ] Activity feed shows project changes
- [ ] Watch/unwatch toggles correctly
- [ ] Watchers receive notifications
- [ ] Real-time updates work

---

## Phase 4: CaseDetail Integration

**Objective**: Upgrade existing comments tab to real-time collaboration

### Task 4.1: Replace Comments with CommentThread

**File**: `src/components/CaseDetail.tsx`

Update props to include `currentUser` (from `currentUserId`).

Replace comments tab:
```typescript
{activeTab === 'comments' && (
  <CommentThread
    entityType="case"
    entityId={caseItem.id}
    currentUser={currentUser}
    teamMembers={teamMembers}
    title="Case Comments"
    placeholder="Add a comment... Use @ to mention team members"
  />
)}
```

Add activity tab:
```typescript
{activeTab === 'activity' && (
  <ActivityFeed
    entityType="case"
    entityId={caseItem.id}
    currentUser={currentUser}
    title="Case Activity"
    showFilters={true}
  />
)}
```

### Task 4.2: Add Activity Logging to Case Service

**File**: `src/services/caseService.ts`

Add logging to all mutations.

### Verification
- [ ] Comments work in cases
- [ ] @mentions create notifications
- [ ] Activity shows case updates

---

## Phase 5: ContactDetail & ContactsPage Integration

**Objective**: Add team notes and activity to contact pages

### Task 5.1: Add Notes Section to ContactDetail

**File**: `src/components/ContactDetail.tsx`

Add collaboration sections:
```typescript
<section className="mt-6">
  <h3 className="text-lg font-semibold mb-4">Team Notes</h3>
  <CommentThread
    entityType="client"
    entityId={client.id}
    currentUser={currentUser}
    teamMembers={teamMembers}
    title=""
    placeholder="Add internal notes about this contact..."
  />
</section>

<section className="mt-6">
  <h3 className="text-lg font-semibold mb-4">Activity History</h3>
  <ActivityFeed
    entityType="client"
    entityId={client.id}
    currentUser={currentUser}
    compact={true}
    limit={15}
  />
</section>
```

### Task 5.2: Add Activity Indicators to ContactsPage

**File**: `src/components/contacts/ContactsPage.tsx`

In ContactCard component:
```typescript
const [commentCount, setCommentCount] = useState(0);
const [recentActivityCount, setRecentActivityCount] = useState(0);

// In card UI
<div className="flex items-center gap-2 text-xs text-muted">
  <MessageSquare className="w-3 h-3" />
  {commentCount} comments
  <Activity className="w-3 h-3" />
  {recentActivityCount} recent
</div>
```

### Task 5.3: Add Activity Logging to Client Service

**File**: `src/services/clientService.ts`

Add logging to create and update operations.

### Verification
- [ ] Contact notes work
- [ ] Activity shows contact interactions
- [ ] Activity indicators display on cards
- [ ] Performance acceptable

---

## Phase 6: DocumentsHub Integration

**Objective**: Add activity sidebar to documents

### Task 6.1: Extend CollaborationEntityType

**File**: `src/types.ts`

```typescript
export type CollaborationEntityType =
  | 'task'
  | 'project'
  | 'case'
  | 'client'
  | 'activity'
  | 'document';
```

### Task 6.2: Add Activity Sidebar to DocumentsHub

**File**: `src/components/documents/DocumentsHub.tsx`

When document selected:
```typescript
{selectedDocument && (
  <div className="lg:col-span-1 space-y-4">
    <ActivityFeed
      entityType="document"
      entityId={selectedDocument.id}
      currentUser={currentUser}
      title="Document Activity"
      compact={true}
    />

    <CommentThread
      entityType="document"
      entityId={selectedDocument.id}
      currentUser={currentUser}
      teamMembers={teamMembers}
      title="Comments"
    />
  </div>
)}
```

### Task 6.3: Add Activity Logging to Document Service

**File**: `src/services/documentService.ts`

Log create, update, delete, version changes.

### Verification
- [ ] Document comments work
- [ ] Activity tracks document changes
- [ ] Version changes logged

---

## Phase 7: Performance & Polish

**Objective**: Optimize performance, add loading states, handle edge cases

### Task 7.1: Add Loading States

Add to all integrations:
```typescript
{isLoadingComments ? (
  <div className="animate-pulse">Loading comments...</div>
) : (
  <CommentThread ... />
)}
```

### Task 7.2: Add Error Boundaries

Wrap collaboration components:
```typescript
<ErrorBoundary fallback={<CollaborationError />}>
  <CommentThread ... />
</ErrorBoundary>
```

### Task 7.3: Verify Real-time Cleanup

Ensure all subscriptions clean up:
```typescript
useEffect(() => {
  const unsubscribe = subscribeToComments(...);
  return () => unsubscribe(); // CRITICAL
}, [entityType, entityId]);
```

### Task 7.4: Edge Case Handling

- Missing current user → show login prompt
- Team members not loaded → show loading state
- Entity not found → show error state
- Subscription errors → fall back gracefully
- Comment creation fails → keep for retry

### Verification
- [ ] No memory leaks from subscriptions
- [ ] Loading states smooth
- [ ] Errors handled gracefully
- [ ] Empty states informative
- [ ] Performance acceptable

---

## Phase 8: Activity Logging Integration

**Objective**: Ensure all entity CRUD operations log activity

### Services to Update

Add activity logging to all mutations in:

1. **projectService.ts** - created, updated, status_changed, completed, archived
2. **taskManagementService.ts** - created, updated, assigned, status_changed, completed
3. **caseService.ts** - created, updated, status_changed, assigned, priority_changed
4. **clientService.ts** - created, updated
5. **documentService.ts** - created, updated, deleted

### Pattern

```typescript
import { logActivity } from './collaborationService';

export async function updateEntity(id: string, updates: Partial<Entity>, currentUser: TeamMember) {
  const old = await getEntity(id);
  const updated = await supabase.from('entities').update(updates)...

  const changes = {};
  for (const key in updates) {
    if (old[key] !== updates[key]) {
      changes[key] = { old: old[key], new: updates[key] };
    }
  }

  await logActivity({
    entityType: 'entity',
    entityId: id,
    action: 'updated',
    actor: currentUser,
    description: `Updated entity`,
    changes
  });

  return updated;
}
```

### Verification
- [x] All CRUD operations logged
- [x] Changes tracked accurately
- [x] Activity appears in feeds (ready for testing)
- [x] No duplicate logging

**Status**: ✅ COMPLETE - See PHASE_8_ACTIVITY_LOGGING_VERIFICATION.md for detailed report

---

## Implementation Timeline

### Week 1: Foundation
- Days 1-2: Phase 1 (Header integration)
- Days 3-4: Phase 2 (TaskView)
- Day 5: Testing & fixes

### Week 2: Detail Pages
- Days 1-2: Phase 3 (ProjectDetail)
- Days 3-4: Phase 4 (CaseDetail)
- Day 5: Testing & fixes

### Week 3: Contacts & Documents
- Days 1-3: Phase 5 (ContactDetail & ContactsPage)
- Days 4-5: Phase 6 (DocumentsHub)

### Week 4: Polish & Activity
- Days 1-2: Phase 7 (Performance & polish)
- Days 3-4: Phase 8 (Activity logging)
- Day 5: Integration testing

---

## Critical Files Reference

### Core Collaboration (Already Complete)
- `src/components/collaboration/CommentThread.tsx`
- `src/components/collaboration/NotificationCenter.tsx`
- `src/components/collaboration/ActivityFeed.tsx`
- `src/services/collaborationService.ts`
- `src/utils/mentionUtils.ts`
- `src/types.ts` (collaboration types lines 2396-2620)

### Files to Modify

**Phase 1 (Foundation)**
- `src/App.tsx`
- `src/components/Header.tsx`

**Phase 2 (TaskView)**
- `src/components/TaskView.tsx`
- `src/services/taskManagementService.ts`

**Phase 3 (ProjectDetail)**
- `src/components/ProjectDetail.tsx`
- `src/components/collaboration/WatchEntityButton.tsx` (NEW)
- `src/services/projectService.ts`

**Phase 4 (CaseDetail)**
- `src/components/CaseDetail.tsx`
- `src/services/caseService.ts`

**Phase 5 (Contacts)**
- `src/components/ContactDetail.tsx`
- `src/components/contacts/ContactsPage.tsx`
- `src/services/clientService.ts`

**Phase 6 (Documents)**
- `src/components/documents/DocumentsHub.tsx`
- `src/services/documentService.ts`
- `src/types.ts` (extend CollaborationEntityType)

---

## Testing Strategy

### Integration Tests
1. Create comment → verify notification → mark as read
2. @mention user → verify notification sent → navigate from notification
3. Update entity → verify activity logged → appears in feed
4. Watch entity → update entity → verify watcher notified
5. Real-time: Open 2 browsers → comment in one → appears in other

### Manual Testing Checklist
- [ ] Create comment on each entity type (task, project, case, contact, document)
- [ ] @mention team member, verify notification received
- [ ] Edit and delete own comments
- [ ] Pin important comments
- [ ] Watch entity, verify notifications on changes
- [ ] Filter activity feed by action type
- [ ] Mark notifications as read
- [ ] Navigate from notifications to entities
- [ ] Test real-time updates with two browsers
- [ ] Verify subscription cleanup (check browser memory)

### Performance Tests
- Comment load time: <500ms
- Real-time latency: <2s
- Page load impact: <10%
- Memory leaks: None

---

## Edge Cases & Error Handling

### Missing Current User
```typescript
if (!currentUser) {
  return <div>Please log in to view comments</div>;
}
```

### Team Members Not Loaded
```typescript
if (teamMembers.length === 0) {
  return <div>Loading team members...</div>;
}
```

### Entity Not Found
```typescript
if (!entity) {
  return <ErrorState message="Entity not found" />;
}
```

### Subscription Errors
```typescript
try {
  const unsubscribe = subscribeToComments(...);
  return () => unsubscribe();
} catch (error) {
  console.error('Subscription error:', error);
  // Fall back to polling or show error
}
```

### Comment Creation Fails
```typescript
try {
  await createComment(...);
} catch (error) {
  toast.error('Failed to create comment');
  // Keep comment in draft for retry
}
```

---

## Performance Considerations

### Pagination
- Load 20 comments initially
- "Load more" for older comments
- Activity feed: 10-20 entries initially

### Real-time Optimization
- Single subscription per entity type
- Debounce rapid updates
- Unsubscribe when component unmounts

### Caching
- Cache team members in parent component
- Don't refetch on every comment
- Invalidate cache on team member changes

### Lazy Loading
- Load activity feed on tab activation
- Defer comment loading until visible

---

## Rollback Plan

### Phase-by-Phase Rollback
Each phase is independent - can rollback individual phases.

### Feature Flag
```typescript
const ENABLE_COLLABORATION = true; // Set to false to disable

{ENABLE_COLLABORATION && (
  <CommentThread ... />
)}
```

### Database Rollback
SQL rollback scripts available in `deployment/migration-*-rollback.sql`

---

## Success Metrics

### Adoption
- % of entities with comments (target: >40% in 3 months)
- @mentions per week (target: >20)
- Active watchers per entity (target: >2)

### Performance
- Comment load time: <500ms
- Real-time latency: <2s
- Page load impact: <10%

### Quality
- Zero memory leaks
- <1% error rate on comment creation
- 100% subscription cleanup

---

## Questions for Clarification

1. **Authentication**: Is current user ID (`tm-5`) hardcoded or from actual auth?
2. **Permissions**: Should comments have role-based visibility?
3. **Email Notifications**: Should @mentions send emails?
4. **Mobile**: Should collaboration features work on mobile view?
5. **Analytics**: Track collaboration metrics in dashboard?
