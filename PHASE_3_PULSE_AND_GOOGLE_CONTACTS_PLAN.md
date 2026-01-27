# Phase 3: Pulse API Integration + Google Contacts Import

**Date:** 2026-01-26
**Combined:** Option A (Pulse Enrichment) + Option C (Real Client Import)
**Strategy:** Two-pronged approach for maximum value

---

## Overview

We'll implement both features together because they complement each other:
1. **Google Contacts Import** → Get real contacts into Logos Vision CRM
2. **Pulse API Enrichment** → Add AI relationship intelligence to those contacts

---

## Part 1: Pulse API Setup

### Current State Analysis

✅ **Pulse Already Has:**
- Express server running on port 3003
- Supabase database integration
- CRM integration endpoints (`/api/crm/*`)
- `relationshipIntelligenceService.ts` - AI relationship scoring
- `contactEnrichmentService.ts` - Contact data enrichment
- `googleContactsService.ts` - Google Contacts integration
- `userContactService.ts` - Contact management

### What We Need to Add

**New Pulse API Endpoints for Logos Vision CRM:**

#### 1. `/api/logos-vision/contacts` (GET)
**Purpose:** Fetch contacts with relationship intelligence

**Query Parameters:**
- `email` - Filter by email
- `limit` - Number of results (default: 100)
- `offset` - Pagination offset
- `includeScore` - Include relationship scores (boolean)
- `includeTrends` - Include trend data (boolean)
- `includeInsights` - Include AI insights (boolean)

**Response:**
```json
{
  "contacts": [
    {
      "id": "uuid",
      "email": "contact@example.com",
      "name": "John Doe",
      "company": "Acme Corp",
      "title": "CEO",
      "phone": "+1234567890",
      "relationship_score": 85,
      "relationship_trend": "rising",
      "communication_frequency": "weekly",
      "preferred_channel": "email",
      "last_interaction_date": "2026-01-25T10:00:00Z",
      "total_interactions": 47,
      "tags": ["major-donor", "board-member"],
      "ai_insights": {
        "talking_points": ["Recent donation of $10k", "Interested in education programs"],
        "next_best_action": "Follow up on education program interest",
        "sentiment": "positive"
      }
    }
  ],
  "total": 31,
  "page": 1,
  "limit": 100
}
```

#### 2. `/api/logos-vision/contacts/:email/enrich` (POST)
**Purpose:** Enrich a single contact with AI intelligence

**Request Body:**
```json
{
  "email": "contact@example.com",
  "name": "John Doe",
  "company": "Acme Corp"
}
```

**Response:**
```json
{
  "email": "contact@example.com",
  "enrichment": {
    "relationship_score": 85,
    "relationship_trend": "rising",
    "communication_frequency": "weekly",
    "preferred_channel": "email",
    "last_interaction_date": "2026-01-25T10:00:00Z",
    "total_interactions": 47,
    "tags": ["major-donor"],
    "ai_insights": {...}
  }
}
```

#### 3. `/api/logos-vision/sync` (POST)
**Purpose:** Trigger manual sync from Google Contacts → Pulse

**Request Body:**
```json
{
  "workspace_id": "user-uuid",
  "sync_type": "contacts",
  "filter": {
    "label": "Logos Vision" // Optional: only sync contacts with this label
  }
}
```

**Response:**
```json
{
  "sync_id": "uuid",
  "status": "in_progress",
  "total_contacts": 150,
  "synced": 0
}
```

#### 4. `/api/logos-vision/sync/:id/status` (GET)
**Purpose:** Check sync progress

**Response:**
```json
{
  "sync_id": "uuid",
  "status": "completed",
  "total_contacts": 150,
  "synced": 150,
  "failed": 0,
  "completed_at": "2026-01-26T11:30:00Z"
}
```

---

## Part 2: Google Contacts Import Strategy

### The Challenge

**User Concern:** "Although Google Contacts for user will not all be contacts related to Logos Vision - How will this work?"

### Solution: Multi-Tier Filtering System

#### Tier 1: Pre-Import Filtering (Recommended)

**Option A: Google Contacts Label Filtering**
```
User creates "Logos Vision" label in Google Contacts
  ↓
Only contacts with that label are imported
  ↓
Clean separation of personal vs business contacts
```

**Option B: Domain Filtering**
```
Only import contacts with specific domains:
  - @logosvision.org
  - @partnerdomain.com
  - Custom domain list
```

**Option C: Manual Selection UI**
```
Show preview of all Google Contacts
  ↓
User checks/unchecks which contacts to import
  ↓
Import only selected contacts
```

#### Tier 2: Post-Import Tagging

**After import, user can:**
1. Tag contacts as "Personal" vs "Logos Vision"
2. Bulk actions to categorize
3. Search and filter by tags
4. Export/archive personal contacts

#### Tier 3: Authentication Strategy

**Google OAuth for Both Auth AND Import:**

```
User logs in with Google Account
  ↓
Google OAuth gives us:
  - User identity (authentication)
  - Contacts API access (data import)
  - Email API access (Pulse integration)
  ↓
Logos Vision CRM stores:
  - User's Google ID (for future logins)
  - Refresh token (for ongoing sync)
  - User's email (contact)
```

**Benefits:**
- Single sign-on (SSO) with Google
- Automatic contact sync when user logs in
- User controls which contacts to share via Google Labels
- No separate username/password needed

---

## Implementation Plan

### Step 1: Create Pulse API Endpoints (F:\pulse1)

**File:** `F:\pulse1\server.js`

Add new routes:
```javascript
// Logos Vision CRM Integration Routes
app.get('/api/logos-vision/contacts', async (req, res) => {
  // Implementation using relationshipIntelligenceService
});

app.post('/api/logos-vision/contacts/:email/enrich', async (req, res) => {
  // Implementation using contactEnrichmentService
});

app.post('/api/logos-vision/sync', async (req, res) => {
  // Implementation using googleContactsService
});

app.get('/api/logos-vision/sync/:id/status', async (req, res) => {
  // Check sync status from database
});
```

**Estimated Time:** 2 hours

---

### Step 2: Create Logos Vision CRM Integration (F:\logos-vision-crm)

**Files to Create:**

#### 1. `src/services/pulseApiService.ts`
```typescript
export async function fetchContactsFromPulse(options: {
  email?: string;
  limit?: number;
  includeScore?: boolean;
}): Promise<PulseContact[]> {
  // Call Pulse API endpoint
}

export async function enrichContact(email: string): Promise<PulseEnrichment> {
  // Enrich single contact
}

export async function triggerPulseSync(): Promise<SyncJob> {
  // Trigger Google Contacts sync
}

export async function checkSyncStatus(syncId: string): Promise<SyncStatus> {
  // Check sync progress
}
```

#### 2. `src/components/contacts/PulseSyncButton.tsx`
```tsx
export function PulseSyncButton() {
  const handleSync = async () => {
    // Trigger sync
    // Show progress modal
    // Poll for status
  };

  return (
    <button onClick={handleSync}>
      🔄 Sync with Google Contacts
    </button>
  );
}
```

#### 3. `src/components/contacts/GoogleContactsImportModal.tsx`
```tsx
export function GoogleContactsImportModal() {
  // Preview Google Contacts
  // Let user select which to import
  // Show import progress
}
```

**Estimated Time:** 3 hours

---

### Step 3: Google OAuth Setup

#### A. Configure Google Cloud Console

1. **Create OAuth 2.0 Credentials:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:5182/auth/google/callback` (development)
     - `https://your-domain.com/auth/google/callback` (production)

2. **Enable APIs:**
   - Google Contacts API
   - Google People API
   - Gmail API (for Pulse sync)

3. **Get Credentials:**
   - Client ID: `GOOGLE_CLIENT_ID`
   - Client Secret: `GOOGLE_CLIENT_SECRET`

#### B. Environment Variables

**F:\logos-vision-crm\.env.local**
```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5182/auth/google/callback

# Pulse API
VITE_PULSE_API_URL=http://localhost:3003
VITE_PULSE_API_KEY=your_pulse_api_key_here
```

**F:\pulse1\.env.local**
```env
# Google OAuth (same credentials)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3002/auth/google/callback

# Logos Vision CRM (for callbacks)
LOGOS_VISION_URL=http://localhost:5182
LOGOS_VISION_API_KEY=shared_secret_key
```

**Estimated Time:** 1 hour

---

### Step 4: Import Flow Implementation

```
┌─────────────────────────────────────────────────────────┐
│           Google Contacts Import Flow                    │
└─────────────────────────────────────────────────────────┘

1. User clicks "Import from Google" in Logos Vision CRM
     ↓
2. Redirects to Google OAuth consent screen
     ↓
3. User authorizes access to Contacts
     ↓
4. Google redirects back to Logos Vision with auth code
     ↓
5. Logos Vision exchanges code for tokens
     ↓
6. Logos Vision calls Pulse API: POST /api/logos-vision/sync
     ↓
7. Pulse fetches contacts from Google Contacts API
     ↓
8. Pulse filters contacts (by label or domain)
     ↓
9. Pulse enriches contacts with AI intelligence
     ↓
10. Pulse returns contact data to Logos Vision
     ↓
11. Logos Vision imports contacts to `clients` table
     ↓
12. Success! Contacts appear in gallery
```

**Estimated Time:** 2 hours

---

### Step 5: UI Implementation

#### Contacts Page Enhancements

**Add to ContactsPage header:**
```tsx
<div className="flex gap-3">
  <button
    onClick={() => setShowImportModal(true)}
    className="btn btn-secondary"
  >
    📥 Import from Google
  </button>

  <PulseSyncButton />

  <button
    onClick={() => setShowAddContactModal(true)}
    className="btn btn-primary"
  >
    + Add Contact
  </button>
</div>
```

#### Contact Cards - Show AI Insights

**Update ContactCard.tsx:**
```tsx
{contact.pulse_profile_id && (
  <div className="ai-insights">
    <div className="relationship-score">
      Score: {contact.relationship_score}/100
      <TrendIndicator trend={contact.relationship_trend} />
    </div>

    {contact.ai_insights?.talking_points && (
      <div className="talking-points">
        💡 {contact.ai_insights.talking_points[0]}
      </div>
    )}
  </div>
)}
```

**Estimated Time:** 2 hours

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 Logos Vision CRM                             │
│  (F:\logos-vision-crm)                                       │
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  ContactsPage    │───▶│ pulseApiService  │               │
│  │  (Frontend UI)   │    │  (API Client)    │               │
│  └──────────────────┘    └────────┬─────────┘               │
│                                   │                          │
│         Entity Type: [Clients ▼] │                          │
│         📥 Import from Google     │                          │
│         🔄 Sync with Pulse        │                          │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │
                                    │ HTTP Requests
                                    │ http://localhost:3003/api/logos-vision/*
                                    │
┌───────────────────────────────────▼──────────────────────────┐
│                    Pulse API Server                          │
│  (F:\pulse1\server.js)                                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Logos Vision API Routes                              │   │
│  │                                                        │   │
│  │  GET  /api/logos-vision/contacts                      │   │
│  │  POST /api/logos-vision/contacts/:email/enrich        │   │
│  │  POST /api/logos-vision/sync                          │   │
│  │  GET  /api/logos-vision/sync/:id/status               │   │
│  └────────┬─────────────────────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼─────────────────────────────────────┐           │
│  │  Services                                     │           │
│  │  - relationshipIntelligenceService.ts         │           │
│  │  - contactEnrichmentService.ts                │           │
│  │  - googleContactsService.ts                   │           │
│  │  - userContactService.ts                      │           │
│  └────────┬─────────────────────────────────────┘           │
│           │                                                   │
└───────────┼───────────────────────────────────────────────────┘
            │
            │ Supabase DB
            ▼
┌───────────────────────────────┐
│  Pulse Supabase Database      │
│  - relationship_profiles       │
│  - contact_enrichments         │
│  - google_contacts_sync        │
│  - sync_jobs                   │
└───────────────────────────────┘

            ┌──────────────────┐
            │  Google APIs     │
            │  - Contacts API  │
            │  - People API    │
            │  - Gmail API     │
            └──────────────────┘
```

---

## Security & Privacy

### Data Flow

1. **User authorizes Google OAuth** → Only user's contacts, with user's permission
2. **Pulse syncs contacts** → Stored in Pulse database with user_id isolation
3. **Logos Vision fetches via API** → Authenticated with API key
4. **User controls visibility** → Label filtering + manual selection

### Privacy Guarantees

✅ **User owns their data**
- User must explicitly authorize Google access
- User controls which contacts are synced (labels)
- User can revoke access anytime via Google account

✅ **Data isolation**
- Each user's contacts stored separately (RLS policies)
- API requires authentication
- No cross-user data leakage

✅ **Transparency**
- Clear UI showing what will be imported
- Import preview before final action
- Audit log of all imports

---

## Testing Plan

### Phase A: Local Testing (Development)

1. **Set up Google OAuth:**
   - Create test Google Cloud project
   - Configure OAuth credentials
   - Test authorization flow

2. **Test Pulse API endpoints:**
   ```bash
   curl http://localhost:3003/api/logos-vision/contacts
   ```

3. **Test import flow:**
   - Create test Google Contacts with "Logos Vision" label
   - Trigger import
   - Verify contacts appear in Logos Vision CRM

4. **Test enrichment:**
   - Enrich a contact
   - Verify AI insights appear
   - Check relationship scores

### Phase B: Production Testing

1. **Deploy Pulse API:**
   - Deploy to production server
   - Update CORS settings
   - Test API accessibility

2. **Deploy Logos Vision CRM:**
   - Update API URL to production Pulse
   - Test end-to-end flow

3. **User Acceptance Testing:**
   - Real user imports their contacts
   - Verify data accuracy
   - Check performance with full dataset

---

## Expected Outcomes

### After Implementation

**Logos Vision CRM will have:**
1. ✅ Import contacts directly from Google Contacts
2. ✅ Filter by label ("Logos Vision" contacts only)
3. ✅ AI relationship scoring (0-100)
4. ✅ Relationship trend indicators (rising, stable, falling)
5. ✅ AI-generated talking points
6. ✅ Communication frequency tracking
7. ✅ Preferred channel recommendations
8. ✅ Manual sync button
9. ✅ Auto-sync option (future)

**User Experience:**
```
1. Click "Import from Google"
2. Authorize Google access (one-time)
3. Select contacts to import (or auto-import with label)
4. Wait 30-60 seconds
5. See all contacts with AI insights
6. Start engaging with intelligent recommendations
```

---

## Timeline

| Task | Time | Total |
|------|------|-------|
| **Step 1:** Create Pulse API endpoints | 2 hours | 2h |
| **Step 2:** Create Logos Vision integration | 3 hours | 5h |
| **Step 3:** Google OAuth setup | 1 hour | 6h |
| **Step 4:** Import flow implementation | 2 hours | 8h |
| **Step 5:** UI implementation | 2 hours | 10h |
| **Testing & debugging** | 2 hours | 12h |

**Total Estimated Time:** 12 hours (~1.5 days of focused work)

---

## Next Steps - Decision Required

**I need your input on:**

### 1. Google OAuth Credentials

**Do you already have Google Cloud OAuth credentials?**
- [ ] Yes, I have them (provide Client ID and Secret)
- [ ] No, need to create them (I'll guide you)

### 2. Import Strategy

**Which filtering method do you prefer?**
- [ ] **Option A:** Label-based filtering (user creates "Logos Vision" label)
- [ ] **Option B:** Domain-based filtering (only @logosvision.org)
- [ ] **Option C:** Manual selection UI (preview and choose)
- [ ] **Option D:** Import all, tag later

### 3. Pulse API Port

**What port should Pulse API run on?**
- [ ] Port 3003 (current default)
- [ ] Port 3001 (different from CRM)
- [ ] Other: ____________

### 4. Immediate Priority

**Which should we implement first?**
- [ ] **Priority A:** Get Pulse API endpoints working first
- [ ] **Priority B:** Get Google import working first
- [ ] **Priority C:** Do both in parallel (I'll guide step-by-step)

---

## Quick Start Option

**If you want to start immediately, we can:**

1. **Quick Test (30 minutes):**
   - I'll create one Pulse API endpoint
   - You test it with curl
   - Verify it works before full implementation

2. **Full Implementation (12 hours):**
   - Complete all steps
   - End-to-end working system
   - Production-ready

**Which approach do you prefer?**

Let me know your answers to the questions above, and we'll proceed!
