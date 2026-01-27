# Day 5: Manual Testing Checklist for Pulse API Integration

**Purpose**: Manual validation scenarios to complement automated tests
**Status**: 🟡 Partially Complete (automated tests passing, manual scenarios pending real API)

---

## Pre-Test Setup

### Environment Configuration

- [ ] Verify `.env.local` exists with Pulse API credentials
  ```bash
  VITE_PULSE_API_URL=https://pulse-api.example.com
  VITE_PULSE_API_KEY=your_api_key_here
  ```

- [ ] Check API configuration status in browser console
  ```javascript
  // Should log API status on app load
  [Pulse Contact Service] API URL not configured, using mock data
  // OR
  [Pulse Contact Service] Health check passed
  ```

- [ ] Verify no console errors on app startup

### Development Server

- [ ] Start dev server: `npm run dev`
- [ ] Navigate to: `http://localhost:5176`
- [ ] Open browser DevTools → Console tab
- [ ] Open browser DevTools → Network tab

---

## Test Scenario 1: ContactsPage with Mock Data

### Expected Behavior: Graceful Fallback

**Steps**:
1. [ ] Navigate to Contacts page
2. [ ] Wait for initial load (skeleton cards should appear)
3. [ ] Observe console logs

**Expected Console Output**:
```
[ContactsPage] Fetching relationship profiles from Pulse API...
[Pulse Contact Service] API URL not configured, using mock data
[ContactsPage] Loaded X contacts from Pulse API
```

**UI Validation**:
- [ ] Skeleton cards display during load (~300ms)
- [ ] Mock contacts appear (Sarah Johnson, Michael Chen, etc.)
- [ ] No error messages visible
- [ ] Contacts display with relationship scores
- [ ] Relationship trends show (rising, stable, falling badges)
- [ ] Contact cards are clickable

**Performance**:
- [ ] Initial load < 500ms
- [ ] No flickering or layout shifts
- [ ] Smooth transition from skeleton to content

---

## Test Scenario 2: ContactStoryView with Mock Data

### Expected Behavior: AI Insights and Interactions Load

**Steps**:
1. [ ] Click on any contact card (e.g., "Sarah Johnson")
2. [ ] Wait for detail view to load
3. [ ] Observe console logs

**Expected Console Output**:
```
[ContactStoryView] Using mock AI insights (no Pulse data available)
[ContactStoryView] Using mock interactions (no Pulse data available)
```

**UI Validation**:
- [ ] "Loading interactions..." message displays briefly
- [ ] Contact header shows name, job title, company
- [ ] Relationship score circle displays
- [ ] AI Insights section appears with:
  - [ ] Relationship summary
  - [ ] Talking points (3-5 bullets)
  - [ ] Recommended actions with priorities
- [ ] Communication Profile section shows:
  - [ ] Preferred channel
  - [ ] Communication style
  - [ ] AI topics as badges
- [ ] Recent Activity section displays:
  - [ ] Interaction timeline
  - [ ] Interaction types (email, meeting, etc.)
  - [ ] Sentiment scores
- [ ] Quick Actions bar is sticky at bottom

**Performance**:
- [ ] Detail view loads < 1 second
- [ ] No loading spinners stuck
- [ ] Smooth scroll behavior

---

## Test Scenario 3: ContactsPage with Real Pulse API

### Prerequisites: Valid API Configuration

**Steps**:
1. [ ] Configure `.env.local` with real Pulse API URL and key
2. [ ] Restart dev server
3. [ ] Navigate to Contacts page
4. [ ] Monitor Network tab for API calls

**Expected Network Requests**:
- [ ] `GET /api/contacts/relationship-profiles?limit=1000&include_annotations=true`
  - Status: 200 OK
  - Response time: < 500ms
  - Headers include `Authorization: Bearer {token}`

**Expected Console Output**:
```
[ContactsPage] Fetching relationship profiles from Pulse API...
[Pulse API] GET /api/contacts/relationship-profiles
[Pulse API] Rate limit remaining: 999
[Pulse Contact Service] Fetched X relationship profiles
[ContactsPage] Loaded X contacts from Pulse API
```

**UI Validation**:
- [ ] Real contacts from Pulse API display
- [ ] Contact names match Pulse data
- [ ] Email addresses correct
- [ ] Relationship scores accurate
- [ ] Trends calculated correctly
- [ ] All metadata fields populated

**Data Quality Checks**:
- [ ] No duplicate contacts
- [ ] All required fields present
- [ ] Phone numbers formatted correctly
- [ ] Avatar images load (if available)
- [ ] LinkedIn links valid (if available)

---

## Test Scenario 4: ContactStoryView with Real Pulse API

### Prerequisites: Valid API + Contact with Pulse Profile ID

**Steps**:
1. [ ] Click on a contact that has `pulse_profile_id`
2. [ ] Monitor Network tab for parallel API calls
3. [ ] Observe data enrichment

**Expected Network Requests**:
- [ ] `GET /api/contacts/{profile_id}/ai-insights`
  - Status: 200 OK or 404 Not Found
  - Response time: < 300ms
- [ ] `GET /api/contacts/{profile_id}/interactions?limit=30&days=90`
  - Status: 200 OK
  - Response time: < 400ms

**Expected Console Output**:
```
[ContactStoryView] Fetching AI insights for {profile_id}...
[Pulse API] GET /api/contacts/{profile_id}/ai-insights
[ContactStoryView] Successfully loaded AI insights from Pulse API
[ContactStoryView] Fetching recent interactions for {profile_id}...
[Pulse API] GET /api/contacts/{profile_id}/interactions
[ContactStoryView] Successfully loaded X interactions from Pulse API
```

**UI Validation**:
- [ ] Real AI-generated relationship summary displays
- [ ] Talking points are personalized and relevant
- [ ] Recommended actions have realistic due dates
- [ ] Communication style matches actual patterns
- [ ] AI topics reflect recent conversations
- [ ] Recent interactions show real email/meeting history
- [ ] Interaction dates are correct and sorted
- [ ] Sentiment scores display with visual indicators

---

## Test Scenario 5: Error Handling - API Unavailable

### Expected Behavior: Graceful Fallback to Mock Data

**Steps**:
1. [ ] Set invalid API URL in `.env.local`: `VITE_PULSE_API_URL=https://invalid-url.com`
2. [ ] Restart dev server
3. [ ] Navigate to Contacts page
4. [ ] Monitor console for errors

**Expected Console Output**:
```
[ContactsPage] Fetching relationship profiles from Pulse API...
[Pulse API] Error: Network error / Timeout
[ContactsPage] Falling back to mock data
[ContactsPage] Successfully loaded mock data as fallback
```

**UI Validation**:
- [ ] NO error messages visible to user
- [ ] NO white screen of death
- [ ] Mock contacts display seamlessly
- [ ] User experience uninterrupted
- [ ] Console shows warning but no errors

**User Experience**:
- [ ] Page loads in reasonable time (< 2 seconds)
- [ ] Fallback is invisible to end user
- [ ] All features work with mock data

---

## Test Scenario 6: Error Handling - Empty API Response

### Expected Behavior: Empty State or Fallback

**Steps**:
1. [ ] Mock API to return empty array: `{ data: [], pagination: {...} }`
2. [ ] Reload Contacts page

**Expected Behavior**:
- [ ] ContactsPage shows empty state OR
- [ ] Falls back to mock data

**UI Validation**:
- [ ] Appropriate empty state message
- [ ] No JavaScript errors
- [ ] Filters and search still functional

---

## Test Scenario 7: Error Handling - Null AI Insights

### Expected Behavior: Use Mock Insights

**Steps**:
1. [ ] Open ContactStoryView for a contact
2. [ ] API returns 404 for AI insights endpoint

**Expected Console Output**:
```
[ContactStoryView] Fetching AI insights for {profile_id}...
[Pulse API] 404 Not Found: /api/contacts/{profile_id}/ai-insights
[ContactStoryView] No AI insights available for this contact
[ContactStoryView] Using mock AI insights (no Pulse data available)
```

**UI Validation**:
- [ ] Default AI insights display
- [ ] No broken UI elements
- [ ] Generic but helpful talking points shown

---

## Test Scenario 8: Performance - Large Dataset

### Expected Behavior: Handles 100+ Contacts Efficiently

**Steps**:
1. [ ] Configure API to return 100+ contacts
2. [ ] Navigate to Contacts page
3. [ ] Measure load time and responsiveness

**Performance Metrics**:
- [ ] Initial fetch: < 1 second
- [ ] Rendering 100 cards: < 500ms
- [ ] Scroll performance: 60 FPS
- [ ] Search/filter response: < 100ms

**UI Validation**:
- [ ] All contacts render correctly
- [ ] No layout overflow issues
- [ ] Virtualization works (if implemented)
- [ ] Memory usage reasonable (< 200MB)

---

## Test Scenario 9: Edge Cases - Missing Fields

### Expected Behavior: Graceful Handling of Incomplete Data

**Test Data**: Contact with missing fields
```json
{
  "id": "test-123",
  "canonical_email": "test@example.com",
  "display_name": "Test User",
  // Missing: phone, company, title, avatar_url, linkedin_url
  "relationship_score": null,
  "last_interaction_date": null
}
```

**UI Validation**:
- [ ] Contact card renders without errors
- [ ] Missing fields don't show "undefined" or "null"
- [ ] Default values used appropriately
- [ ] Contact detail view handles missing data
- [ ] No broken images for missing avatars

---

## Test Scenario 10: Rapid Navigation

### Expected Behavior: No Race Conditions

**Steps**:
1. [ ] Click on Contact A
2. [ ] Immediately click Back
3. [ ] Immediately click on Contact B
4. [ ] Repeat 5-10 times rapidly

**Expected Behavior**:
- [ ] No loading state stuck
- [ ] Correct contact displayed each time
- [ ] No data mixing between contacts
- [ ] No JavaScript errors in console
- [ ] API requests cancelled properly

---

## Test Scenario 11: Rate Limiting

### Expected Behavior: Handles 429 Responses

**Steps**:
1. [ ] Configure API to return 429 rate limit error
2. [ ] Navigate to Contacts page

**Expected Console Output**:
```
[Pulse API] Rate limit exceeded. Retry after 60 seconds.
[ContactsPage] Falling back to mock data
```

**UI Validation**:
- [ ] User sees mock data instead of error
- [ ] Optional: Info message about rate limiting
- [ ] App continues to function normally

---

## Test Scenario 12: Network Timeout

### Expected Behavior: Timeout After 10 Seconds

**Steps**:
1. [ ] Configure API to delay response > 10 seconds
2. [ ] Navigate to Contacts page
3. [ ] Observe timeout behavior

**Expected Behavior**:
- [ ] Request times out after 10s (if configured)
- [ ] Falls back to mock data
- [ ] No indefinite loading state

---

## Test Scenario 13: Priorities Feed Integration

### Expected Behavior: Loads Recommended Actions

**Steps**:
1. [ ] Navigate to Contacts page
2. [ ] Click "Priorities" view mode
3. [ ] Monitor API call for recommended actions

**Expected Network Request**:
- [ ] `GET /api/contacts/recommended-actions`
  - Status: 200 OK
  - Response time: < 500ms

**Expected Console Output**:
```
[Pulse Contact Service] Loaded X recommended actions
```

**UI Validation**:
- [ ] Action cards display with priorities (high/medium/low)
- [ ] Contact names show for each action
- [ ] Action descriptions are clear
- [ ] Due dates formatted correctly
- [ ] Badges show priority levels

---

## Test Scenario 14: Google Sync (Future Feature)

### Expected Behavior: Trigger and Monitor Sync

**Note**: This feature may not be fully implemented yet.

**Steps**:
1. [ ] Look for "Sync with Google" button (if available)
2. [ ] Click to trigger sync
3. [ ] Monitor sync progress

**Expected API Calls**:
- [ ] `POST /api/contacts/google-sync/trigger`
  - Body: `{ sync_type: "full", options: {...} }`
- [ ] `GET /api/contacts/google-sync/status/{jobId}`
  - Poll every 2-5 seconds

**UI Validation**:
- [ ] Sync progress indicator shows
- [ ] Contacts updated count displays
- [ ] Completion message shows
- [ ] Contacts list refreshes after sync

---

## Browser Compatibility Testing

### Desktop Browsers

- [ ] **Chrome** (latest): All features work
- [ ] **Firefox** (latest): All features work
- [ ] **Safari** (latest): All features work
- [ ] **Edge** (latest): All features work

### Mobile Browsers (if responsive)

- [ ] **iOS Safari**: Contact cards responsive
- [ ] **Chrome Mobile**: Touch interactions work
- [ ] **Samsung Internet**: No layout issues

---

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through contact cards
- [ ] Enter key opens contact detail
- [ ] Esc key closes detail view
- [ ] All buttons keyboard accessible

### Screen Reader

- [ ] Contact cards announce properly
- [ ] Relationship scores read aloud
- [ ] AI insights accessible
- [ ] Loading states announced

---

## Security Testing

### API Security

- [ ] API key never visible in Network tab responses
- [ ] API key never logged to console
- [ ] HTTPS enforced for API calls
- [ ] No sensitive data in URLs (query params)

### Data Privacy

- [ ] Email addresses not exposed unnecessarily
- [ ] Phone numbers formatted but secure
- [ ] No password fields returned from API
- [ ] User data isolated per session

---

## Test Results Summary

**Date Tested**: __________
**Tester Name**: __________
**Environment**: Production / Staging / Development

### Scenarios Completed

- [ ] Scenario 1: Mock Data ContactsPage
- [ ] Scenario 2: Mock Data ContactStoryView
- [ ] Scenario 3: Real API ContactsPage
- [ ] Scenario 4: Real API ContactStoryView
- [ ] Scenario 5: API Unavailable
- [ ] Scenario 6: Empty Response
- [ ] Scenario 7: Null AI Insights
- [ ] Scenario 8: Large Dataset
- [ ] Scenario 9: Missing Fields
- [ ] Scenario 10: Rapid Navigation
- [ ] Scenario 11: Rate Limiting
- [ ] Scenario 12: Network Timeout
- [ ] Scenario 13: Priorities Feed
- [ ] Scenario 14: Google Sync

### Issues Found

1. **Issue**: ___________
   - **Severity**: Critical / High / Medium / Low
   - **Steps to Reproduce**: ___________
   - **Expected**: ___________
   - **Actual**: ___________
   - **Status**: Open / Fixed / Deferred

2. **Issue**: ___________
   - **Severity**: ___________
   - **Steps to Reproduce**: ___________
   - **Expected**: ___________
   - **Actual**: ___________
   - **Status**: ___________

### Overall Assessment

- **Pass Rate**: ____/14 scenarios passed
- **Blockers**: ____
- **Production Ready**: Yes / No / Conditional

---

## Notes and Observations

_Add any additional observations, performance notes, or feedback here_

---

**Checklist Version**: 1.0
**Last Updated**: 2026-01-26
