# Phase 4: CaseDetail Collaboration - Verification Checklist

## Pre-Testing Setup

### Database Setup
- [ ] Run `migration_team_collaboration.sql` if not already applied
- [ ] Run `enable_realtime_collaboration.sql` to enable real-time subscriptions
- [ ] Verify tables exist:
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_name IN ('comments', 'mentions', 'notifications', 'activity_log');
  ```

### Application Setup
- [ ] Build successful: `npm run build`
- [ ] No TypeScript errors
- [ ] Start dev server: `npm run dev`
- [ ] Login with test user

## Feature Testing

### 1. Basic UI Integration
- [ ] Navigate to Cases page
- [ ] Select/open a case
- [ ] Verify three tabs are visible:
  - Activities (existing linked activities)
  - Comments (new collaboration comments)
  - Activity Log (new activity feed)
- [ ] Switch between all three tabs - verify no errors
- [ ] Verify each tab loads content correctly

### 2. Comments Tab - Basic Functionality
- [ ] Click "Comments" tab
- [ ] Verify CommentThread component renders
- [ ] Text input area is visible
- [ ] "Add a comment... Use @ to mention team members" placeholder shows
- [ ] Type a simple comment (e.g., "Test comment")
- [ ] Click send button
- [ ] Verify comment appears in the list
- [ ] Verify your name/avatar shows correctly
- [ ] Verify timestamp displays (e.g., "Just now")

### 3. Comments Tab - @Mentions
- [ ] Start typing "@" in comment box
- [ ] Verify mention suggestions dropdown appears
- [ ] Verify team members are listed (excluding yourself)
- [ ] Type first letter of a team member's name
- [ ] Verify suggestions filter
- [ ] Select a team member from dropdown (click or Enter)
- [ ] Verify "@username" is inserted in comment
- [ ] Submit comment
- [ ] Verify mention is highlighted in posted comment

### 4. Comments Tab - Threaded Replies
- [ ] Hover over an existing comment
- [ ] Click the "⋯" (more) menu
- [ ] Select "Reply"
- [ ] Verify "Replying to [username]" indicator appears
- [ ] Type a reply
- [ ] Submit reply
- [ ] Verify reply is nested under original comment
- [ ] Verify reply depth is limited (max 2 levels)

### 5. Comments Tab - Edit & Delete
- [ ] Click "⋯" menu on your own comment
- [ ] Select "Edit"
- [ ] Modify the comment text
- [ ] Click "Save"
- [ ] Verify comment updates
- [ ] Verify "(edited)" indicator appears
- [ ] Click "⋯" menu again
- [ ] Select "Delete"
- [ ] Confirm deletion
- [ ] Verify comment is removed

### 6. Comments Tab - Pin Comments
- [ ] Click "⋯" menu on any comment
- [ ] Select "Pin"
- [ ] Verify pin icon appears on comment
- [ ] Verify comment has amber ring/highlight
- [ ] Click "⋯" menu again
- [ ] Select "Unpin"
- [ ] Verify pin is removed

### 7. Activity Log Tab - Display
- [ ] Click "Activity Log" tab
- [ ] Verify ActivityFeed component renders
- [ ] Verify timeline view with dots and lines
- [ ] Verify activities are listed chronologically (newest first)
- [ ] Check for various activity types:
  - Case created
  - Case updated
  - Status changed
  - Comments added
  - Mentions

### 8. Activity Log Tab - Filters
- [ ] Click filter button (top right of activity feed)
- [ ] Verify filter dropdown appears
- [ ] Select one or more action types (e.g., "Commented", "Updated")
- [ ] Verify activity list filters accordingly
- [ ] Click "Clear" to remove filters
- [ ] Verify all activities show again

### 9. Activity Log Tab - Load More
- [ ] Scroll to bottom of activity feed
- [ ] If "Load more activity" button appears, click it
- [ ] Verify older activities load
- [ ] Verify no duplicate activities

### 10. Case Updates Generate Activities
#### Create Case
- [ ] Navigate to Cases page
- [ ] Click "Add Case" or equivalent
- [ ] Fill in case details (title, description, priority, status)
- [ ] Save case
- [ ] Open the new case
- [ ] Go to "Activity Log" tab
- [ ] Verify "created" activity appears with:
  - Actor name
  - Creation timestamp
  - Case metadata (status, priority)

#### Update Case Status
- [ ] Change case status (e.g., New → In Progress)
- [ ] Save/update
- [ ] Check "Activity Log" tab
- [ ] Verify "status_changed" activity appears
- [ ] Verify old and new status are shown (e.g., "New → In Progress")

#### Update Case Priority
- [ ] Change case priority (e.g., Medium → High)
- [ ] Save/update
- [ ] Check "Activity Log" tab
- [ ] Verify "priority_changed" activity appears
- [ ] Verify old and new priority are shown

#### Assign Case
- [ ] Assign case to a team member (or reassign)
- [ ] Save/update
- [ ] Check "Activity Log" tab
- [ ] Verify "assigned" activity appears
- [ ] Verify team member name is shown

#### Update Case Details
- [ ] Update case title or description
- [ ] Save/update
- [ ] Check "Activity Log" tab
- [ ] Verify "updated" activity appears
- [ ] Verify changes are listed with old → new values

## Real-Time Testing (Requires 2+ Browser Sessions)

### Setup
- [ ] Open app in Chrome (User A)
- [ ] Open app in Firefox or Incognito (User B)
- [ ] Both navigate to the same case
- [ ] Both open "Comments" tab

### Real-Time Comments
- [ ] User A: Post a comment
- [ ] User B: Verify comment appears automatically (no refresh)
- [ ] User B: Post a reply
- [ ] User A: Verify reply appears automatically

### Real-Time Activity
- [ ] User A: Open "Activity Log" tab
- [ ] User B: Update case status
- [ ] User A: Verify activity appears automatically

### Real-Time Mentions
- [ ] User A: Post comment with @mention of User B
- [ ] User B: Check notifications (bell icon or notification center)
- [ ] Verify User B receives mention notification

## Edge Cases & Error Handling

### Empty States
- [ ] Open a brand new case with no comments
- [ ] Verify "No comments yet" message in Comments tab
- [ ] Verify empty state in Activity Log tab

### Network Issues
- [ ] Disconnect internet
- [ ] Try to post a comment
- [ ] Verify error handling (error message or retry)
- [ ] Reconnect internet
- [ ] Verify comment syncs

### Validation
- [ ] Try to submit empty comment
- [ ] Verify send button is disabled
- [ ] Type whitespace only
- [ ] Verify send button remains disabled

### Long Comments
- [ ] Post a very long comment (500+ characters)
- [ ] Verify it displays correctly
- [ ] Verify no layout breaks

### Special Characters
- [ ] Post comment with special characters: @#$%^&*()
- [ ] Post comment with emojis: 😀🎉✅
- [ ] Verify displays correctly

## Performance

### Load Time
- [ ] Open case with 20+ comments
- [ ] Measure load time (should be < 2 seconds)
- [ ] Verify smooth scrolling

### Real-Time Updates
- [ ] With case open, have another user post 5 comments rapidly
- [ ] Verify all comments appear in order
- [ ] Verify no duplicates

## Accessibility

### Keyboard Navigation
- [ ] Tab through comment input
- [ ] Verify focus indicators
- [ ] Press Enter to submit comment
- [ ] Use arrow keys in mention suggestions
- [ ] Press Escape to close mention dropdown

### Screen Reader (if available)
- [ ] Enable screen reader
- [ ] Navigate through comments
- [ ] Verify labels are read correctly

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browser (responsive view)

## Regression Testing

Verify existing features still work:
- [ ] Legacy "Activities" tab still shows linked activities
- [ ] Case details (title, description, status, priority) display correctly
- [ ] Case assignee shows correctly
- [ ] Client information displays
- [ ] Back button works
- [ ] Case list page still functions

## Cleanup & Documentation

- [ ] No console errors in browser DevTools
- [ ] No TypeScript errors in terminal
- [ ] No ESLint warnings
- [ ] Build succeeds: `npm run build`
- [ ] Documentation updated (this file)

## Success Criteria

All checkboxes above should be checked ✅

## Issues Found

Document any issues below:

### Issue 1: [Title]
- **Severity**: Critical / High / Medium / Low
- **Description**:
- **Steps to Reproduce**:
- **Expected Behavior**:
- **Actual Behavior**:
- **Screenshots**: (if applicable)

### Issue 2: [Title]
- ...

## Test Results Summary

- **Total Tests**: 80+
- **Tests Passed**: ___ / 80
- **Tests Failed**: ___ / 80
- **Tests Skipped**: ___ / 80

**Overall Status**: ✅ PASS / ⚠️ PASS WITH ISSUES / ❌ FAIL

---

**Tested By**: __________________
**Date**: __________________
**Environment**: Development / Staging / Production
**Build Version**: __________________
