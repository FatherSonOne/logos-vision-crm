# Pulse → Logos Vision Contacts Integration Plan

**Status:** Ready for Implementation
**Date:** 2026-01-25
**Architecture:** Hybrid (Periodic Sync + Real-time API)

---

## Executive Summary

This document outlines the complete backend integration plan for connecting Pulse Communication App contact intelligence to Logos Vision CRM Contacts. The integration will:

1. **Remove mock data** and replace with real contact intelligence from Pulse
2. **Sync contact data** from Pulse using existing `dataSyncEngine.ts` infrastructure
3. **Enrich with AI insights** via REST API calls for relationship intelligence
4. **Proxy Google Contacts** through Pulse's existing Google People API integration
5. **Display enhanced data** including relationship scores, AI insights, and interaction history

**Key Decision:** Hybrid Architecture (Score: 8.9/10)
- 15-minute periodic sync for core contact data (offline-capable)
- Real-time REST API for AI enrichment and recent interactions
- Leverages existing LV sync infrastructure with minimal new code

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema Design](#database-schema-design)
3. [Data Flow & Sync Strategy](#data-flow--sync-strategy)
4. [API Specifications](#api-specifications)
5. [Google Contacts Integration](#google-contacts-integration)
6. [Security & Privacy](#security--privacy)
7. [Implementation Phases](#implementation-phases)
8. [Testing Strategy](#testing-strategy)
9. [Rollback Plan](#rollback-plan)

---

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      Logos Vision CRM                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Contacts UI (React)                                     │   │
│  │  - Contact List (Table/Grid/Map)                         │   │
│  │  - Contact Detail View                                   │   │
│  │  - Engagement Dashboard                                  │   │
│  └────────┬─────────────────────────────────────────────────┘   │
│           │                                                      │
│  ┌────────▼──────────────────┐     ┌──────────────────────┐   │
│  │ contactService.ts         │     │ pulseContactService   │   │
│  │ (Local CRUD)              │◄────┤ (API Enrichment)      │   │
│  └────────┬──────────────────┘     └──────┬───────────────┘   │
│           │                                │                    │
│  ┌────────▼──────────────────┐     ┌──────▼───────────────┐   │
│  │ Supabase (LV)             │     │ dataSyncEngine.ts     │   │
│  │ - contacts (extended)     │◄────┤ (15-min sync)         │   │
│  │ - pulse_contact_inter...  │     │ - Queue management    │   │
│  │ - entity_mappings         │     │ - Conflict resolution │   │
│  └───────────────────────────┘     └──────┬───────────────┘   │
└───────────────────────────────────────────┼───────────────────┘
                                             │
                    ┌────────────────────────▼────────────────┐
                    │         REST API (HTTPS)                │
                    │   JWT Auth + Rate Limiting              │
                    └────────────────────────┬────────────────┘
                                             │
┌────────────────────────────────────────────▼────────────────┐
│                   Pulse Communication App (F:\pulse1)       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express API Server (Port 3003)                      │   │
│  │  - /api/contacts/relationship-profiles               │   │
│  │  - /api/contacts/interactions                        │   │
│  │  - /api/contacts/ai-insights                         │   │
│  │  - /api/contacts/sync-status                         │   │
│  └────────┬─────────────────────────────────────────────┘   │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────────────┐  │
│  │  Supabase (Pulse)                                     │  │
│  │  - relationship_profiles (AI intelligence)           │  │
│  │  - contact_interactions (unified log)                 │  │
│  │  - user_contact_annotations (tags, notes)            │  │
│  │  - contacts (basic records)                           │  │
│  └────────┬──────────────────────────────────────────────┘  │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────────────┐  │
│  │  Google People API Integration                        │  │
│  │  - googleContactsService.ts                           │  │
│  │  - contactEnrichmentService.ts                        │  │
│  │  - OAuth 2.0 flow with refresh tokens                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Integration Approach: Hybrid

**Periodic Sync (15 minutes):**
- Core contact data (name, email, phone, company, title)
- Relationship scores (0-100) and trends (rising/falling)
- Communication frequency and preferred channel
- Basic metadata (tags, VIP status, is_blocked)
- Uses existing `dataSyncEngine.ts` with queue and retry logic
- Stores in LV Supabase `contacts` table (extended schema)

**Real-time API (on-demand):**
- AI insights (communication style, topics, sentiment, summary)
- Recent interactions (last 30 days: emails, meetings, calls)
- Talking points and next action suggestions
- Meeting prep cards
- Only fetched when user opens contact detail view

**Why Hybrid?**
- ✅ Offline capability (core data synced locally)
- ✅ Always fresh AI insights (fetched real-time)
- ✅ Performance (list views fast, detail views enriched)
- ✅ Cost efficient (API calls only when needed)
- ✅ Graceful degradation (LV works if Pulse offline)

---

## 2. Database Schema Design

### 2.1 Extend Existing `contacts` Table

Add Pulse metadata columns to existing LV `contacts` table:

```sql
-- Migration: 20260125_add_pulse_contact_fields.sql
-- Add Pulse relationship intelligence fields to contacts table

ALTER TABLE contacts
  -- Pulse sync tracking
  ADD COLUMN IF NOT EXISTS pulse_profile_id UUID,
  ADD COLUMN IF NOT EXISTS pulse_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pulse_sync_status VARCHAR(20) DEFAULT 'pending'
    CHECK (pulse_sync_status IN ('pending', 'synced', 'error', 'conflict')),
  ADD COLUMN IF NOT EXISTS pulse_last_modified TIMESTAMPTZ,

  -- Google Contacts metadata
  ADD COLUMN IF NOT EXISTS google_contact_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS google_resource_name VARCHAR(512),
  ADD COLUMN IF NOT EXISTS google_synced_at TIMESTAMPTZ,

  -- Relationship intelligence (from Pulse relationship_profiles)
  ADD COLUMN IF NOT EXISTS relationship_score INTEGER DEFAULT 0 CHECK (relationship_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS relationship_trend VARCHAR(20)
    CHECK (relationship_trend IN ('rising', 'stable', 'falling', 'new', 'dormant')),
  ADD COLUMN IF NOT EXISTS communication_frequency VARCHAR(20)
    CHECK (communication_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'rare')),
  ADD COLUMN IF NOT EXISTS preferred_channel VARCHAR(20)
    CHECK (preferred_channel IN ('email', 'slack', 'phone', 'meeting', 'sms')),
  ADD COLUMN IF NOT EXISTS last_interaction_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_interactions INTEGER DEFAULT 0,

  -- Contact enrichment (from Pulse)
  ADD COLUMN IF NOT EXISTS company VARCHAR(255),
  ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(512),
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(100),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,

  -- Privacy flags (from Pulse user_contact_annotations)
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false,

  -- Tags (from Pulse, stored as JSONB array)
  ADD COLUMN IF NOT EXISTS pulse_tags JSONB DEFAULT '[]'::jsonb,

  -- Quick notes (from Pulse user_contact_annotations)
  ADD COLUMN IF NOT EXISTS pulse_notes TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_pulse_profile ON contacts(pulse_profile_id);
CREATE INDEX IF NOT EXISTS idx_contacts_pulse_sync_status ON contacts(pulse_sync_status);
CREATE INDEX IF NOT EXISTS idx_contacts_google_id ON contacts(google_contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_relationship_score ON contacts(relationship_score DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_last_interaction ON contacts(last_interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_is_favorite ON contacts(is_favorite) WHERE is_favorite = true;

-- GIN index for JSONB tags search
CREATE INDEX IF NOT EXISTS idx_contacts_pulse_tags ON contacts USING GIN (pulse_tags);

-- Update existing RLS policies to allow access to new columns
-- (Policies already exist from migration_contacts_organizations.sql)

-- Function to calculate relationship trend based on interaction history
CREATE OR REPLACE FUNCTION calculate_relationship_trend(
  contact_id UUID,
  current_score INTEGER,
  days_back INTEGER DEFAULT 30
) RETURNS VARCHAR(20) AS $$
DECLARE
  recent_interactions INTEGER;
  previous_interactions INTEGER;
  trend VARCHAR(20);
BEGIN
  -- Count interactions in last 30 days
  SELECT COUNT(*) INTO recent_interactions
  FROM pulse_contact_interactions
  WHERE contact_id = contact_id
    AND interaction_date >= NOW() - INTERVAL '30 days';

  -- Count interactions in previous 30 days
  SELECT COUNT(*) INTO previous_interactions
  FROM pulse_contact_interactions
  WHERE contact_id = contact_id
    AND interaction_date >= NOW() - INTERVAL '60 days'
    AND interaction_date < NOW() - INTERVAL '30 days';

  -- Determine trend
  IF recent_interactions = 0 AND previous_interactions = 0 THEN
    trend := 'new';
  ELSIF recent_interactions = 0 THEN
    trend := 'dormant';
  ELSIF recent_interactions > previous_interactions * 1.5 THEN
    trend := 'rising';
  ELSIF recent_interactions < previous_interactions * 0.5 THEN
    trend := 'falling';
  ELSE
    trend := 'stable';
  END IF;

  RETURN trend;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE contacts IS 'CRM contacts with Pulse relationship intelligence integration';
COMMENT ON COLUMN contacts.pulse_profile_id IS 'Reference to Pulse relationship_profiles.id';
COMMENT ON COLUMN contacts.relationship_score IS '0-100 score calculated by Pulse AI based on interaction quality/frequency';
COMMENT ON COLUMN contacts.relationship_trend IS 'Trend direction: rising (more engaged), stable, falling (less engaged), new, dormant';
COMMENT ON COLUMN contacts.pulse_tags IS 'User-defined tags from Pulse stored as JSON array, e.g. ["investor", "advisor", "warm-lead"]';
```

### 2.2 New Table: `pulse_contact_interactions`

Store recent interaction history synced from Pulse (rolling 30-90 day window):

```sql
-- Migration: 20260125_create_pulse_interactions.sql
-- Recent contact interactions synced from Pulse for display in LV

CREATE TABLE IF NOT EXISTS pulse_contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  pulse_interaction_id UUID NOT NULL UNIQUE, -- Original ID from Pulse

  -- Interaction details
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
    'email_sent', 'email_received', 'meeting', 'call', 'slack_message',
    'slack_received', 'sms_sent', 'sms_received', 'linkedin', 'other'
  )),
  interaction_date TIMESTAMPTZ NOT NULL,
  subject TEXT,
  snippet TEXT, -- First 200 chars of content

  -- AI analysis (from Pulse contact_interactions)
  sentiment_score DECIMAL(3, 2) CHECK (sentiment_score BETWEEN -1 AND 1), -- -1 (negative) to +1 (positive)
  ai_topics JSONB DEFAULT '[]'::jsonb, -- ["fundraising", "partnership", "product feedback"]
  ai_action_items JSONB DEFAULT '[]'::jsonb, -- ["Schedule follow-up", "Send proposal"]
  ai_summary TEXT, -- AI-generated summary of interaction

  -- Metadata
  channel_metadata JSONB DEFAULT '{}'::jsonb, -- email_id, meeting_id, slack_thread_id, etc.
  duration_minutes INTEGER, -- For meetings/calls

  -- Sync tracking
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON pulse_contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON pulse_contact_interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON pulse_contact_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_pulse_id ON pulse_contact_interactions(pulse_interaction_id);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_interactions_topics ON pulse_contact_interactions USING GIN (ai_topics);
CREATE INDEX IF NOT EXISTS idx_interactions_actions ON pulse_contact_interactions USING GIN (ai_action_items);

-- RLS policies
ALTER TABLE pulse_contact_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access to pulse_interactions" ON pulse_contact_interactions;
CREATE POLICY "Allow authenticated access to pulse_interactions"
  ON pulse_contact_interactions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon access to pulse_interactions" ON pulse_contact_interactions;
CREATE POLICY "Allow anon access to pulse_interactions"
  ON pulse_contact_interactions FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Automatic cleanup of old interactions (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_pulse_interactions()
RETURNS void AS $$
BEGIN
  DELETE FROM pulse_contact_interactions
  WHERE interaction_date < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- Run daily at 2 AM: SELECT cron.schedule('cleanup-pulse-interactions', '0 2 * * *', 'SELECT cleanup_old_pulse_interactions()');

COMMENT ON TABLE pulse_contact_interactions IS 'Recent contact interactions synced from Pulse (rolling 90-day window)';
COMMENT ON COLUMN pulse_contact_interactions.snippet IS 'First 200 characters for preview, full content stays in Pulse';
COMMENT ON COLUMN pulse_contact_interactions.ai_topics IS 'AI-extracted topics, e.g. ["fundraising", "partnership"]';
```

### 2.3 Reuse Existing `entity_mappings` Table

The existing `entity_mappings` table (created in initial sync engine setup) will track Pulse ↔ LV contact mappings:

```sql
-- Already exists from dataSyncEngine infrastructure:
-- entity_mappings (
--   id UUID PRIMARY KEY,
--   logos_entity_type VARCHAR(50), -- 'contact'
--   logos_entity_id UUID,          -- LV contacts.id
--   pulse_entity_type VARCHAR(50), -- 'relationship_profile'
--   pulse_entity_id UUID,          -- Pulse relationship_profiles.id
--   last_logos_update TIMESTAMPTZ,
--   last_pulse_update TIMESTAMPTZ,
--   last_synced_at TIMESTAMPTZ,
--   sync_status VARCHAR(20)        -- 'pending', 'synced', 'error', 'conflict'
-- )

-- Add index for contact lookups if not exists
CREATE INDEX IF NOT EXISTS idx_entity_mappings_contact
  ON entity_mappings(logos_entity_type, logos_entity_id)
  WHERE logos_entity_type = 'contact';
```

### 2.4 Data Mapping: Pulse → LV

| Pulse Table | Pulse Column | LV Table | LV Column | Notes |
|-------------|--------------|----------|-----------|-------|
| `relationship_profiles` | `id` | `contacts` | `pulse_profile_id` | Foreign key reference |
| `relationship_profiles` | `canonical_email` | `contacts` | `email` | Primary identifier |
| `relationship_profiles` | `display_name` | `contacts` | `name` | Fallback if name not set |
| `relationship_profiles` | `first_name` | `contacts` | `first_name` | - |
| `relationship_profiles` | `last_name` | `contacts` | `last_name` | - |
| `relationship_profiles` | `phone_number` | `contacts` | `phone` | - |
| `relationship_profiles` | `company` | `contacts` | `company` | New field |
| `relationship_profiles` | `title` | `contacts` | `job_title` | New field |
| `relationship_profiles` | `linkedin_url` | `contacts` | `linkedin_url` | New field |
| `relationship_profiles` | `timezone` | `contacts` | `timezone` | New field |
| `relationship_profiles` | `avatar_url` | `contacts` | `avatar_url` | New field |
| `relationship_profiles` | `relationship_score` | `contacts` | `relationship_score` | 0-100 |
| `relationship_profiles` | `total_interactions` | `contacts` | `total_interactions` | Count |
| `relationship_profiles` | `last_interaction_date` | `contacts` | `last_interaction_date` | Timestamp |
| `relationship_profiles` | `communication_frequency` | `contacts` | `communication_frequency` | Enum |
| `relationship_profiles` | `preferred_channel` | `contacts` | `preferred_channel` | Enum |
| `user_contact_annotations` | `tags` | `contacts` | `pulse_tags` | JSONB array |
| `user_contact_annotations` | `notes` | `contacts` | `pulse_notes` | Text |
| `user_contact_annotations` | `is_favorite` | `contacts` | `is_favorite` | Boolean |
| `user_contact_annotations` | `is_blocked` | `contacts` | `is_blocked` | Boolean |
| `contact_interactions` | `*` | `pulse_contact_interactions` | `*` | Recent 90 days only |

**AI Insights (API only, NOT synced to DB):**
- `ai_communication_style` - Fetched on-demand from Pulse API
- `ai_topics` - Array of discussion topics
- `ai_sentiment_average` - Overall sentiment (-1 to +1)
- `ai_relationship_summary` - Paragraph summary
- `ai_talking_points` - Suggested topics for next conversation
- `ai_next_actions` - Recommended follow-up actions

---

## 3. Data Flow & Sync Strategy

### 3.1 Initial Bulk Import

**Phase 1: First-time setup (one-time)**

1. **User initiates sync** from LV Settings → Integrations → Pulse
2. **Fetch all Pulse contacts** via REST API:
   ```
   GET https://pulse-api.example.com/api/contacts/relationship-profiles?limit=1000
   ```
3. **Match with existing LV contacts** by email (deduplication)
4. **Queue sync items** in `dataSyncEngine`:
   ```typescript
   for (const pulseProfile of pulseProfiles) {
     await dataSyncEngine.queueSync(
       'contact',
       pulseProfile.id,
       'from_pulse',
       'update', // or 'create' if new
       pulseProfile,
       5 // normal priority
     );
   }
   ```
5. **Process queue** in batches of 50 (existing `dataSyncEngine` logic)
6. **Update entity_mappings** to track Pulse ↔ LV relationships
7. **Display progress** in UI (X of Y contacts synced)

**Expected Duration:** ~30 seconds for 1,000 contacts

### 3.2 Incremental Sync (Every 15 Minutes)

**Scheduled sync loop:**

```typescript
// In pulseContactSyncService.ts

const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export async function startPulseSyncSchedule() {
  setInterval(async () => {
    try {
      console.log('[Pulse Sync] Starting incremental sync...');

      // 1. Get last sync timestamp from entity_mappings
      const lastSync = await getLastSyncTimestamp('contact');

      // 2. Fetch modified Pulse contacts since last sync
      const modifiedContacts = await fetchPulseContactsModifiedSince(lastSync);

      console.log(`[Pulse Sync] Found ${modifiedContacts.length} modified contacts`);

      // 3. Queue sync for each modified contact
      for (const contact of modifiedContacts) {
        await dataSyncEngine.queueSync(
          'contact',
          contact.id,
          'from_pulse',
          'update',
          contact,
          5
        );
      }

      // 4. Process queue
      await dataSyncEngine.processQueue();

      console.log('[Pulse Sync] Incremental sync complete');
    } catch (error) {
      console.error('[Pulse Sync] Error during sync:', error);
      // Continue on error, will retry next interval
    }
  }, SYNC_INTERVAL_MS);

  console.log(`[Pulse Sync] Scheduled sync started (every ${SYNC_INTERVAL_MS / 1000}s)`);
}

async function fetchPulseContactsModifiedSince(timestamp: string): Promise<any[]> {
  const response = await fetch(
    `${PULSE_API_URL}/api/contacts/relationship-profiles?modified_since=${timestamp}`,
    {
      headers: {
        'Authorization': `Bearer ${PULSE_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Pulse API error: ${response.statusText}`);
  }

  return await response.json();
}
```

### 3.3 Real-time API Enrichment

**When user opens contact detail view:**

```typescript
// In ContactDetailView.tsx

useEffect(() => {
  async function loadContactEnrichment() {
    if (!contact.pulse_profile_id) return;

    setLoadingEnrichment(true);

    try {
      // Fetch AI insights from Pulse API (not stored in LV DB)
      const aiInsights = await pulseContactService.getAIInsights(
        contact.pulse_profile_id
      );

      // Fetch recent interactions (stored in pulse_contact_interactions)
      const interactions = await contactService.getRecentInteractions(
        contact.id,
        { limit: 30, days: 30 }
      );

      setEnrichmentData({
        aiInsights,
        interactions
      });
    } catch (error) {
      console.error('Failed to load enrichment:', error);
      // Degrade gracefully - show contact data without enrichment
    } finally {
      setLoadingEnrichment(false);
    }
  }

  loadContactEnrichment();
}, [contact.id]);
```

### 3.4 Conflict Resolution

**Scenario:** Contact modified in both Pulse and LV since last sync

**Resolution Rules:**
1. **Contact info (name, email, phone)**: Pulse wins (source of truth)
2. **Donor data (total_lifetime_giving, donor_stage)**: LV wins (not in Pulse)
3. **Tags**: Merge both (union of LV `pulse_tags` + new Pulse tags)
4. **Notes**: Append Pulse notes to LV notes with separator
5. **Manual conflicts**: Queue for user review in LV UI

```typescript
// In dataSyncEngine.ts conflict resolution

private resolveContactConflict(conflict: SyncConflict): any {
  const { logosData, pulseData } = conflict;

  return {
    // Pulse wins for contact info
    name: pulseData.display_name,
    email: pulseData.canonical_email,
    phone: pulseData.phone_number,
    company: pulseData.company,
    job_title: pulseData.title,

    // LV wins for donor data
    donor_stage: logosData.donor_stage,
    total_lifetime_giving: logosData.total_lifetime_giving,
    engagement_score: logosData.engagement_score,

    // Pulse wins for relationship intelligence
    relationship_score: pulseData.relationship_score,
    last_interaction_date: pulseData.last_interaction_date,

    // Merge tags (union)
    pulse_tags: [...new Set([
      ...(logosData.pulse_tags || []),
      ...(pulseData.tags || [])
    ])],

    // Append notes
    pulse_notes: [logosData.pulse_notes, pulseData.notes]
      .filter(Boolean)
      .join('\n\n---\n\n'),

    updated_at: new Date().toISOString()
  };
}
```

### 3.5 Sync Status Monitoring

**UI Indicator in LV:**

```typescript
// Sync status badge component
function SyncStatusBadge({ contact }: { contact: Contact }) {
  const { pulse_sync_status, pulse_synced_at } = contact;

  const statusConfig = {
    synced: { color: 'green', icon: '✓', text: 'Synced' },
    pending: { color: 'yellow', icon: '⏳', text: 'Pending' },
    error: { color: 'red', icon: '⚠', text: 'Error' },
    conflict: { color: 'orange', icon: '⚡', text: 'Conflict' }
  };

  const { color, icon, text } = statusConfig[pulse_sync_status];
  const timeAgo = formatTimeAgo(pulse_synced_at);

  return (
    <Tooltip content={`Last synced: ${timeAgo}`}>
      <Badge color={color}>
        {icon} {text}
      </Badge>
    </Tooltip>
  );
}
```

---

## 4. API Specifications

### 4.1 Pulse REST API Endpoints

**Base URL:** `https://pulse-api.example.com` (from Pulse Express server, port 3003)

**Authentication:** JWT tokens issued by Pulse Supabase Auth

#### Endpoint 1: Get Relationship Profiles (Bulk)

```
GET /api/contacts/relationship-profiles
```

**Query Parameters:**
- `limit` (integer, default: 100, max: 1000) - Number of contacts to return
- `offset` (integer, default: 0) - Pagination offset
- `modified_since` (ISO timestamp) - Only return contacts modified after this time
- `email` (string) - Filter by email (exact match or comma-separated list)
- `include_annotations` (boolean, default: true) - Include user tags/notes

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "canonical_email": "john@example.com",
      "display_name": "John Smith",
      "first_name": "John",
      "last_name": "Smith",
      "phone_number": "+1-555-0100",
      "company": "Acme Corp",
      "title": "VP of Engineering",
      "linkedin_url": "https://linkedin.com/in/johnsmith",
      "timezone": "America/New_York",
      "avatar_url": "https://...",
      "relationship_score": 85,
      "total_interactions": 247,
      "last_interaction_date": "2026-01-24T10:30:00Z",
      "communication_frequency": "weekly",
      "preferred_channel": "email",
      "tags": ["investor", "technical", "warm-lead"],
      "notes": "Met at Web Summit 2025. Interested in our API product.",
      "is_favorite": true,
      "is_blocked": false,
      "created_at": "2025-06-01T12:00:00Z",
      "updated_at": "2026-01-24T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1523,
    "limit": 100,
    "offset": 0,
    "has_more": true
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid/expired JWT
- `403 Forbidden` - User doesn't have access
- `429 Too Many Requests` - Rate limit exceeded (60 req/min)
- `500 Internal Server Error` - Server error

#### Endpoint 2: Get AI Insights (Single Contact)

```
GET /api/contacts/:profileId/ai-insights
```

**Path Parameters:**
- `profileId` (UUID) - Pulse relationship_profiles.id

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "profile_id": "uuid",
  "ai_communication_style": "professional and detail-oriented, prefers data-driven discussions",
  "ai_topics": [
    "API integration",
    "enterprise pricing",
    "security compliance",
    "technical architecture"
  ],
  "ai_sentiment_average": 0.72,
  "ai_relationship_summary": "Strong technical relationship. John is the key decision-maker for API tooling at Acme Corp. Has expressed interest in our enterprise plan but needs buy-in from his VP of Product. Responds well to technical demos and case studies.",
  "ai_talking_points": [
    "Follow up on enterprise demo scheduled for next Tuesday",
    "Share case study from similar fintech company",
    "Discuss API rate limits and custom SLA options",
    "Ask about their Q2 budget timeline"
  ],
  "ai_next_actions": [
    {
      "action": "Send enterprise pricing proposal",
      "priority": "high",
      "due_date": "2026-01-27"
    },
    {
      "action": "Schedule technical deep-dive with their engineering team",
      "priority": "medium",
      "due_date": "2026-02-03"
    }
  ],
  "confidence_score": 0.89,
  "last_analyzed_at": "2026-01-24T15:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid/expired JWT
- `404 Not Found` - Profile not found or no AI insights available
- `429 Too Many Requests` - Rate limit (10 req/min per profile)
- `500 Internal Server Error` - Server error

#### Endpoint 3: Get Recent Interactions

```
GET /api/contacts/:profileId/interactions
```

**Path Parameters:**
- `profileId` (UUID) - Pulse relationship_profiles.id

**Query Parameters:**
- `limit` (integer, default: 30, max: 100) - Number of interactions
- `days` (integer, default: 30, max: 90) - Days to look back
- `types` (string) - Comma-separated interaction types to filter
  - Options: `email_sent`, `email_received`, `meeting`, `call`, `slack_message`, `slack_received`, `sms_sent`, `sms_received`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "profile_id": "uuid",
  "interactions": [
    {
      "id": "uuid",
      "interaction_type": "email_sent",
      "interaction_date": "2026-01-24T10:30:00Z",
      "subject": "Re: Enterprise API Pricing Discussion",
      "snippet": "Thanks for the detailed questions. Here's our enterprise pricing structure...",
      "sentiment_score": 0.8,
      "ai_topics": ["pricing", "enterprise features"],
      "ai_action_items": ["Schedule follow-up call"],
      "ai_summary": "Positive email discussing enterprise pricing options. Customer is interested but needs more details on custom SLAs.",
      "channel_metadata": {
        "email_id": "msg_abc123",
        "thread_id": "thread_xyz789",
        "recipients": ["john@example.com"],
        "cc": ["sarah@example.com"]
      },
      "duration_minutes": null
    },
    {
      "id": "uuid",
      "interaction_type": "meeting",
      "interaction_date": "2026-01-20T14:00:00Z",
      "subject": "Product Demo - Acme Corp",
      "snippet": "Conducted live demo of API platform. John asked excellent technical questions about...",
      "sentiment_score": 0.9,
      "ai_topics": ["product demo", "API integration", "technical requirements"],
      "ai_action_items": [
        "Send follow-up with answers to technical questions",
        "Schedule deeper technical dive with engineering team"
      ],
      "ai_summary": "Very positive demo. John was highly engaged and asked detailed technical questions. Strong buying signals. Ready to move to enterprise pricing discussion.",
      "channel_metadata": {
        "meeting_id": "mtg_def456",
        "calendar_event_id": "cal_ghi789",
        "attendees": ["john@example.com", "sarah@example.com", "me@mycompany.com"]
      },
      "duration_minutes": 45
    }
  ],
  "summary": {
    "total_interactions": 2,
    "by_type": {
      "email_sent": 1,
      "meeting": 1
    },
    "average_sentiment": 0.85,
    "top_topics": ["pricing", "API integration", "product demo"]
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid/expired JWT
- `404 Not Found` - Profile not found
- `429 Too Many Requests` - Rate limit (30 req/min)
- `500 Internal Server Error` - Server error

#### Endpoint 4: Trigger Google Contacts Sync

```
POST /api/contacts/google-sync/trigger
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "sync_type": "full" | "incremental",
  "options": {
    "enrich_contacts": true,
    "sync_photos": true,
    "sync_groups": false
  }
}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response (202 Accepted):**
```json
{
  "sync_job_id": "uuid",
  "status": "queued",
  "estimated_duration_seconds": 120,
  "message": "Google Contacts sync initiated. Check status at /api/contacts/google-sync/status/{sync_job_id}"
}
```

**Response (200 OK) - Check Status:**
```
GET /api/contacts/google-sync/status/:syncJobId
```

```json
{
  "sync_job_id": "uuid",
  "status": "completed" | "in_progress" | "failed",
  "progress": {
    "total_contacts": 523,
    "processed": 523,
    "created": 45,
    "updated": 312,
    "skipped": 166,
    "errors": 0
  },
  "started_at": "2026-01-24T16:00:00Z",
  "completed_at": "2026-01-24T16:03:15Z",
  "error_message": null
}
```

### 4.2 Rate Limiting

**Pulse API Rate Limits:**
- **Authentication**: 10 requests/minute per IP
- **Bulk endpoints** (`/relationship-profiles`): 60 requests/minute per user
- **Single resource** (`/:profileId/*`): 120 requests/minute per user
- **AI insights**: 10 requests/minute per profile (prevent abuse)
- **Interactions**: 30 requests/minute per user

**Headers in Response:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706122800
```

**429 Response:**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Limit is 60 requests per minute.",
  "retry_after_seconds": 15
}
```

### 4.3 Authentication Flow

**JWT Token Acquisition:**

1. User logs into LV with Supabase Auth
2. LV exchanges Supabase JWT for Pulse API token:
   ```typescript
   async function getPulseApiToken(): Promise<string> {
     const { data: { session } } = await supabase.auth.getSession();

     if (!session) {
       throw new Error('User not authenticated');
     }

     // Exchange LV JWT for Pulse JWT (if separate auth)
     // OR reuse same JWT if Pulse trusts LV Supabase instance
     const response = await fetch(`${PULSE_API_URL}/auth/exchange`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${session.access_token}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         source: 'logos-vision-crm'
       })
     });

     const { pulse_token } = await response.json();
     return pulse_token;
   }
   ```

3. Cache token in LV (expires in 1 hour, refresh if needed)
4. Include in all Pulse API requests

---

## 5. Google Contacts Integration

### 5.1 Architecture: Proxy Through Pulse

**Recommendation:** Use Pulse as the single source of truth for Google Contacts sync.

**Why Proxy?**
- ✅ Pulse already has full Google People API integration (`googleContactsService.ts`)
- ✅ Pulse includes email signature parsing for enrichment (`contactEnrichmentService.ts`)
- ✅ Single OAuth flow (user grants access to Pulse, not both apps)
- ✅ Pulse handles rate limits, retries, and incremental sync logic
- ✅ LV automatically gets enriched contact data (company, title from signatures)

**Flow:**

```
┌──────────────────┐
│  Logos Vision    │
│                  │
│  User clicks     │
│  "Sync Google    │
│   Contacts"      │
└────────┬─────────┘
         │
         │ POST /api/contacts/google-sync/trigger
         ▼
┌──────────────────┐
│  Pulse API       │
│                  │
│  1. Check OAuth  │
│  2. Trigger sync │
│  3. Return job   │
└────────┬─────────┘
         │
         │ Google People API calls
         ▼
┌──────────────────┐
│  Google Contacts │
│                  │
│  Return contact  │
│  data (name,     │
│  email, phone)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Pulse Database  │
│                  │
│  Store in:       │
│  - contacts      │
│  - relationship_ │
│    profiles      │
│  - enrichment    │
└────────┬─────────┘
         │
         │ Incremental sync (15 min)
         ▼
┌──────────────────┐
│  LV Database     │
│                  │
│  Synced via      │
│  dataSyncEngine  │
│  to contacts     │
└──────────────────┘
```

### 5.2 Implementation in LV

**New Component: `GoogleContactsSyncButton.tsx`**

```typescript
import React, { useState } from 'react';
import { pulseContactService } from '../services/pulseContactService';

export function GoogleContactsSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(null);

  async function handleSync() {
    setSyncing(true);

    try {
      // Trigger sync in Pulse
      const { sync_job_id } = await pulseContactService.triggerGoogleSync({
        sync_type: 'full',
        enrich_contacts: true
      });

      // Poll for status
      const interval = setInterval(async () => {
        const status = await pulseContactService.getGoogleSyncStatus(sync_job_id);
        setProgress(status.progress);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setSyncing(false);

          if (status.status === 'completed') {
            // Trigger immediate LV sync to pull new contacts
            await dataSyncEngine.performFullSync('from_pulse', [], [], [], [], []);

            toast.success(`Synced ${status.progress.created + status.progress.updated} contacts from Google`);
          } else {
            toast.error('Google sync failed. Please try again.');
          }
        }
      }, 2000); // Poll every 2 seconds

    } catch (error) {
      console.error('Google sync error:', error);
      toast.error('Failed to start Google sync');
      setSyncing(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="btn btn-primary"
      >
        {syncing ? (
          <>
            <SpinnerIcon />
            Syncing... {progress?.processed || 0} / {progress?.total_contacts || 0}
          </>
        ) : (
          <>
            <GoogleIcon />
            Sync Google Contacts
          </>
        )}
      </button>

      {progress && (
        <div className="mt-2 text-sm text-gray-600">
          Created: {progress.created}, Updated: {progress.updated}, Errors: {progress.errors}
        </div>
      )}
    </div>
  );
}
```

### 5.3 Google OAuth Consent Screen

**Pulse handles Google OAuth:**
- User is redirected to Google consent screen (from Pulse)
- Scopes requested:
  - `https://www.googleapis.com/auth/contacts.readonly` - Read contacts
  - `https://www.googleapis.com/auth/userinfo.profile` - User profile (for linking)
- Tokens stored in Pulse database (refresh token for background sync)
- LV never sees Google credentials (more secure)

### 5.4 Incremental Sync Schedule

**Pulse triggers Google sync automatically:**
- Frequency: Every 6 hours (configurable)
- Only fetches contacts modified since last sync (uses `syncToken` from Google API)
- Enrichment runs on new/updated contacts (email signature parsing)
- Results flow to LV via standard 15-minute Pulse → LV sync

---

## 6. Security & Privacy

### 6.1 Authentication & Authorization

**JWT Token Security:**
- Tokens expire after 1 hour (configurable)
- Refresh tokens stored securely in Supabase Auth
- API calls include `Authorization: Bearer <token>` header
- Invalid tokens return `401 Unauthorized`

**Row-Level Security (RLS):**
- LV Supabase RLS policies ensure users only see their contacts
- Pulse Supabase RLS policies filter by `user_id`
- API endpoints enforce user ownership (can't access other users' data)

**API Key Management:**
- Pulse API URL and keys stored in `.env.local` (never committed to git)
- Rotate keys quarterly
- Use separate keys for dev/staging/production

### 6.2 Privacy Flags

**Respect User Privacy Preferences:**

| Flag | LV Behavior | Pulse Behavior |
|------|------------|----------------|
| `do_not_email` | Hide from email campaign lists | Mark in annotations |
| `do_not_call` | Hide from call lists | Mark in annotations |
| `is_blocked` | Hide from all views (soft delete) | No interaction tracking |
| `do_not_sync` | Contact not synced to Pulse | - |

**Implementation:**

```sql
-- Add privacy flag to control sync
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS do_not_sync BOOLEAN DEFAULT false;

-- Filter in sync query
SELECT * FROM contacts
WHERE is_active = true
  AND do_not_sync = false
  AND pulse_sync_status != 'blocked';
```

### 6.3 Data Encryption

**At Rest:**
- Supabase encrypts all data at rest (AES-256)
- Sensitive fields (notes, emails) stored as encrypted text
- API tokens stored using Supabase Vault (encrypted secrets)

**In Transit:**
- All API calls use HTTPS (TLS 1.3)
- Certificate pinning for production (prevent MITM attacks)
- WebSocket connections use WSS (secure WebSocket)

### 6.4 GDPR Compliance

**Data Subject Rights:**

1. **Right to Access**: Export all contact data via API
   ```
   GET /api/contacts/:id/export?format=json
   ```

2. **Right to Rectification**: Update contact info via UI or API
   ```
   PUT /api/contacts/:id
   ```

3. **Right to Erasure** ("Right to be Forgotten"):
   - Hard delete from LV: `contactService.hardDelete(id)`
   - Delete from Pulse: `POST /api/contacts/:id/delete-permanently`
   - Cascades to `pulse_contact_interactions`, `entity_mappings`

4. **Right to Data Portability**: Export in JSON/CSV format
   ```typescript
   async function exportContactData(contactId: string): Promise<Blob> {
     const contact = await contactService.getById(contactId);
     const interactions = await contactService.getRecentInteractions(contactId, { limit: 1000 });
     const aiInsights = await pulseContactService.getAIInsights(contact.pulse_profile_id);

     const exportData = {
       contact,
       interactions,
       aiInsights,
       exported_at: new Date().toISOString()
     };

     return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
   }
   ```

5. **Right to Object**: Add `do_not_sync` flag to stop Pulse sync

**Data Retention:**
- Interactions: 90 days in LV (full history in Pulse)
- Deleted contacts: Soft delete for 30 days, then hard delete
- Audit logs: 1 year retention

### 6.5 Audit Logging

**Track all contact data access:**

```sql
-- Migration: 20260125_create_contact_audit_log.sql

CREATE TABLE IF NOT EXISTS contact_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'view', 'create', 'update', 'delete', 'export',
    'sync_from_pulse', 'sync_to_pulse', 'google_import'
  )),
  changes JSONB, -- Before/after values for updates
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_contact ON contact_audit_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON contact_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON contact_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_date ON contact_audit_log(created_at DESC);

-- Auto-delete logs older than 1 year
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM contact_audit_log
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1) ⭐ **START HERE**

**Goal:** Establish API connectivity and basic sync infrastructure

**Tasks:**
1. ✅ Add Pulse environment variables to `.env.example` and `.env.local`
   ```
   VITE_PULSE_API_URL=https://pulse-api.example.com
   VITE_PULSE_API_KEY=your_api_key_here
   ```

2. ✅ Run database migrations:
   ```bash
   psql -h <supabase-host> -U postgres -d postgres -f supabase/migrations/20260125_add_pulse_contact_fields.sql
   psql -h <supabase-host> -U postgres -d postgres -f supabase/migrations/20260125_create_pulse_interactions.sql
   ```

3. ✅ Create `pulseContactService.ts`:
   ```typescript
   // src/services/pulseContactService.ts

   const PULSE_API_URL = import.meta.env.VITE_PULSE_API_URL;
   const PULSE_API_KEY = import.meta.env.VITE_PULSE_API_KEY;

   export const pulseContactService = {
     async fetchRelationshipProfiles(options?: {
       limit?: number;
       offset?: number;
       modifiedSince?: string;
     }): Promise<any[]> {
       const params = new URLSearchParams({
         limit: String(options?.limit || 100),
         offset: String(options?.offset || 0),
         ...(options?.modifiedSince && { modified_since: options.modifiedSince })
       });

       const response = await fetch(
         `${PULSE_API_URL}/api/contacts/relationship-profiles?${params}`,
         {
           headers: {
             'Authorization': `Bearer ${PULSE_API_KEY}`,
             'Content-Type': 'application/json'
           }
         }
       );

       if (!response.ok) {
         throw new Error(`Pulse API error: ${response.statusText}`);
       }

       const { data } = await response.json();
       return data;
     },

     async getAIInsights(profileId: string): Promise<any> {
       const response = await fetch(
         `${PULSE_API_URL}/api/contacts/${profileId}/ai-insights`,
         {
           headers: {
             'Authorization': `Bearer ${PULSE_API_KEY}`,
             'Content-Type': 'application/json'
           }
         }
       );

       if (!response.ok) {
         if (response.status === 404) return null;
         throw new Error(`Pulse API error: ${response.statusText}`);
       }

       return await response.json();
     },

     async getRecentInteractions(profileId: string, options?: {
       limit?: number;
       days?: number;
     }): Promise<any> {
       const params = new URLSearchParams({
         limit: String(options?.limit || 30),
         days: String(options?.days || 30)
       });

       const response = await fetch(
         `${PULSE_API_URL}/api/contacts/${profileId}/interactions?${params}`,
         {
           headers: {
             'Authorization': `Bearer ${PULSE_API_KEY}`,
             'Content-Type': 'application/json'
           }
         }
       );

       if (!response.ok) {
         throw new Error(`Pulse API error: ${response.statusText}`);
       }

       return await response.json();
     }
   };
   ```

4. ✅ Extend `dataSyncEngine.ts` to support contact entity type:
   ```typescript
   // Add 'contact' to EntityType union in dataSyncEngine.ts
   export type EntityType = 'project' | 'client' | 'activity' | 'document' | 'team_member' | 'meeting' | 'case' | 'task' | 'contact';

   // Add contact transformation logic
   private transformFromPulse(entityType: EntityType, data: any): any {
     // ... existing cases ...

     case 'contact':
       return {
         id: data.id, // Use Pulse profile ID as primary key
         pulse_profile_id: data.id,
         first_name: data.first_name,
         last_name: data.last_name,
         name: data.display_name || [data.first_name, data.last_name].filter(Boolean).join(' '),
         email: data.canonical_email,
         phone: data.phone_number,
         company: data.company,
         job_title: data.title,
         linkedin_url: data.linkedin_url,
         timezone: data.timezone,
         avatar_url: data.avatar_url,
         relationship_score: data.relationship_score,
         total_interactions: data.total_interactions,
         last_interaction_date: data.last_interaction_date,
         communication_frequency: data.communication_frequency,
         preferred_channel: data.preferred_channel,
         pulse_tags: data.tags || [],
         pulse_notes: data.notes,
         is_favorite: data.is_favorite || false,
         is_blocked: data.is_blocked || false,
         pulse_synced_at: new Date().toISOString(),
         pulse_sync_status: 'synced',
         pulse_last_modified: data.updated_at
       };

     default:
       return data;
   }
   ```

5. ✅ Test API connectivity:
   ```bash
   npm run dev
   # Open browser console, run:
   # await pulseContactService.fetchRelationshipProfiles({ limit: 5 })
   ```

**Success Criteria:**
- ✅ Can fetch contacts from Pulse API
- ✅ Contacts sync to LV database via dataSyncEngine
- ✅ Entity mappings track Pulse ↔ LV relationships

---

### Phase 2: Bulk Import (Week 1-2)

**Goal:** Initial one-time sync of all Pulse contacts to LV

**Tasks:**
1. ✅ Create `pulseSyncService.ts` (orchestrates bulk import):
   ```typescript
   // src/services/pulseSyncService.ts

   import { dataSyncEngine } from './dataSyncEngine';
   import { pulseContactService } from './pulseContactService';
   import { contactService } from './contactService';

   export async function performBulkContactImport(): Promise<{
     success: boolean;
     imported: number;
     updated: number;
     errors: number;
   }> {
     const result = {
       success: false,
       imported: 0,
       updated: 0,
       errors: 0
     };

     try {
       console.log('[Pulse Bulk Import] Starting...');

       // Fetch all contacts from Pulse in batches
       let offset = 0;
       const limit = 100;
       let hasMore = true;

       while (hasMore) {
         const pulseProfiles = await pulseContactService.fetchRelationshipProfiles({
           limit,
           offset
         });

         console.log(`[Pulse Bulk Import] Fetched ${pulseProfiles.length} contacts (offset ${offset})`);

         if (pulseProfiles.length === 0) {
           hasMore = false;
           break;
         }

         // Check for existing contacts by email (deduplication)
         for (const profile of pulseProfiles) {
           try {
             const existingContact = await contactService.search(profile.canonical_email);
             const isUpdate = existingContact.length > 0;

             // Queue sync
             await dataSyncEngine.queueSync(
               'contact',
               profile.id,
               'from_pulse',
               isUpdate ? 'update' : 'create',
               profile,
               5
             );

             if (isUpdate) {
               result.updated++;
             } else {
               result.imported++;
             }
           } catch (error) {
             console.error(`[Pulse Bulk Import] Error processing ${profile.canonical_email}:`, error);
             result.errors++;
           }
         }

         offset += limit;
         hasMore = pulseProfiles.length === limit; // More pages if we got full batch
       }

       // Process queue
       console.log('[Pulse Bulk Import] Processing sync queue...');
       await dataSyncEngine.processQueue();

       result.success = result.errors === 0;
       console.log('[Pulse Bulk Import] Complete:', result);

       return result;
     } catch (error) {
       console.error('[Pulse Bulk Import] Fatal error:', error);
       return { ...result, success: false };
     }
   }
   ```

2. ✅ Add UI trigger in Settings page:
   ```typescript
   // In Settings.tsx or Integrations.tsx

   import { performBulkContactImport } from '../services/pulseSyncService';

   function PulseIntegrationSettings() {
     const [importing, setImporting] = useState(false);
     const [result, setResult] = useState(null);

     async function handleBulkImport() {
       setImporting(true);
       const importResult = await performBulkContactImport();
       setResult(importResult);
       setImporting(false);
     }

     return (
       <div className="border rounded p-4">
         <h3>Pulse Communication Integration</h3>

         <button
           onClick={handleBulkImport}
           disabled={importing}
           className="btn btn-primary"
         >
           {importing ? 'Importing...' : 'Import Contacts from Pulse'}
         </button>

         {result && (
           <div className="mt-4 text-sm">
             <p>✅ Imported: {result.imported}</p>
             <p>🔄 Updated: {result.updated}</p>
             {result.errors > 0 && <p>⚠️ Errors: {result.errors}</p>}
           </div>
         )}
       </div>
     );
   }
   ```

3. ✅ Remove mock contact data from codebase:
   ```bash
   # Find and remove mock data files
   grep -r "MOCK.*CONTACTS" src/
   # Delete or comment out mock data generation
   ```

**Success Criteria:**
- ✅ All Pulse contacts imported to LV (1000+ contacts in ~30 seconds)
- ✅ Deduplication works (existing contacts updated, not duplicated)
- ✅ Entity mappings created for tracking
- ✅ Mock data removed

---

### Phase 3: Incremental Sync (Week 2)

**Goal:** Automated 15-minute sync for modified contacts

**Tasks:**
1. ✅ Create scheduled sync service:
   ```typescript
   // In pulseSyncService.ts

   let syncInterval: NodeJS.Timeout | null = null;

   export function startIncrementalSync() {
     if (syncInterval) {
       console.warn('[Pulse Sync] Already running, stopping previous interval');
       stopIncrementalSync();
     }

     const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

     syncInterval = setInterval(async () => {
       try {
         console.log('[Pulse Sync] Starting incremental sync...');

         // Get last sync timestamp
         const lastSync = await getLastSyncTimestamp('contact');

         // Fetch modified contacts since last sync
         const modifiedContacts = await pulseContactService.fetchRelationshipProfiles({
           modifiedSince: lastSync,
           limit: 1000
         });

         console.log(`[Pulse Sync] Found ${modifiedContacts.length} modified contacts`);

         if (modifiedContacts.length === 0) {
           console.log('[Pulse Sync] No changes, skipping');
           return;
         }

         // Queue sync for each
         for (const contact of modifiedContacts) {
           await dataSyncEngine.queueSync(
             'contact',
             contact.id,
             'from_pulse',
             'update',
             contact,
             5
           );
         }

         // Process queue
         await dataSyncEngine.processQueue();

         console.log('[Pulse Sync] Incremental sync complete');
       } catch (error) {
         console.error('[Pulse Sync] Error:', error);
         // Continue, will retry next interval
       }
     }, SYNC_INTERVAL_MS);

     console.log(`[Pulse Sync] Scheduled sync started (every ${SYNC_INTERVAL_MS / 1000}s)`);
   }

   export function stopIncrementalSync() {
     if (syncInterval) {
       clearInterval(syncInterval);
       syncInterval = null;
       console.log('[Pulse Sync] Scheduled sync stopped');
     }
   }

   async function getLastSyncTimestamp(entityType: string): Promise<string> {
     const { data, error } = await supabase
       .from('entity_mappings')
       .select('last_synced_at')
       .eq('logos_entity_type', entityType)
       .order('last_synced_at', { ascending: false })
       .limit(1)
       .single();

     if (error || !data) {
       // Default to 24 hours ago if no sync history
       return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
     }

     return data.last_synced_at;
   }
   ```

2. ✅ Start sync on app init:
   ```typescript
   // In App.tsx or main.tsx

   import { startIncrementalSync } from './services/pulseSyncService';

   useEffect(() => {
     // Start Pulse sync when app loads
     startIncrementalSync();

     // Cleanup on unmount
     return () => {
       stopIncrementalSync();
     };
   }, []);
   ```

3. ✅ Add sync status indicator in UI:
   ```typescript
   // In Header.tsx or StatusBar.tsx

   function PulseSyncStatus() {
     const [status, setStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
     const [lastSync, setLastSync] = useState<Date | null>(null);

     useEffect(() => {
       const unsubscribe = dataSyncEngine.on((event, data) => {
         if (event === 'sync:started') {
           setStatus('syncing');
         } else if (event === 'sync:completed') {
           setStatus('idle');
           setLastSync(new Date());
         } else if (event === 'sync:item:failed') {
           setStatus('error');
         }
       });

       return unsubscribe;
     }, []);

     return (
       <div className="flex items-center gap-2 text-sm text-gray-600">
         {status === 'syncing' && (
           <>
             <SpinnerIcon className="animate-spin" />
             <span>Syncing with Pulse...</span>
           </>
         )}
         {status === 'idle' && lastSync && (
           <>
             <CheckIcon className="text-green-500" />
             <span>Synced {formatTimeAgo(lastSync)}</span>
           </>
         )}
         {status === 'error' && (
           <>
             <AlertIcon className="text-red-500" />
             <span>Sync error</span>
           </>
         )}
       </div>
     );
   }
   ```

**Success Criteria:**
- ✅ Sync runs automatically every 15 minutes
- ✅ Only modified contacts are synced (efficient)
- ✅ UI shows sync status and last sync time
- ✅ Errors don't crash the app (graceful degradation)

---

### Phase 4: Real-time Enrichment (Week 2-3)

**Goal:** Fetch AI insights and interactions on-demand

**Tasks:**
1. ✅ Update `contactService.ts` to fetch interactions from local DB:
   ```typescript
   // In contactService.ts

   async getRecentInteractions(
     contactId: string,
     options?: { limit?: number; days?: number }
   ): Promise<any[]> {
     const { limit = 30, days = 30 } = options || {};

     const { data, error } = await supabase
       .from('pulse_contact_interactions')
       .select('*')
       .eq('contact_id', contactId)
       .gte('interaction_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
       .order('interaction_date', { ascending: false })
       .limit(limit);

     if (error) {
       console.error('Error fetching interactions:', error);
       throw error;
     }

     return data || [];
   }
   ```

2. ✅ Create enriched contact detail view:
   ```typescript
   // In ContactDetailView.tsx

   import { pulseContactService } from '../services/pulseContactService';
   import { contactService } from '../services/contactService';

   function ContactDetailView({ contactId }: { contactId: string }) {
     const [contact, setContact] = useState<Contact | null>(null);
     const [aiInsights, setAiInsights] = useState<any>(null);
     const [interactions, setInteractions] = useState<any[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       async function loadContact() {
         setLoading(true);

         try {
           // Load basic contact info
           const contactData = await contactService.getById(contactId);
           setContact(contactData);

           if (!contactData.pulse_profile_id) {
             // Not synced with Pulse, show basic info only
             setLoading(false);
             return;
           }

           // Fetch AI insights (real-time API)
           const insights = await pulseContactService.getAIInsights(
             contactData.pulse_profile_id
           );
           setAiInsights(insights);

           // Fetch recent interactions (from local DB)
           const recentInteractions = await contactService.getRecentInteractions(
             contactId,
             { limit: 30, days: 90 }
           );
           setInteractions(recentInteractions);

         } catch (error) {
           console.error('Error loading contact enrichment:', error);
           toast.error('Failed to load contact insights');
         } finally {
           setLoading(false);
         }
       }

       loadContact();
     }, [contactId]);

     if (loading) {
       return <LoadingSpinner />;
     }

     if (!contact) {
       return <div>Contact not found</div>;
     }

     return (
       <div className="contact-detail">
         {/* Basic Info */}
         <section className="mb-6">
           <div className="flex items-center gap-4">
             <img
               src={contact.avatar_url || '/default-avatar.png'}
               alt={contact.name}
               className="w-20 h-20 rounded-full"
             />
             <div>
               <h1 className="text-3xl font-bold">{contact.name}</h1>
               <p className="text-gray-600">{contact.job_title} at {contact.company}</p>
             </div>
           </div>

           {/* Relationship Score */}
           <div className="mt-4">
             <RelationshipScoreBadge score={contact.relationship_score} />
             <TrendIndicator trend={contact.relationship_trend} />
           </div>
         </section>

         {/* AI Insights Section */}
         {aiInsights && (
           <section className="mb-6 border rounded p-4">
             <h2 className="text-xl font-semibold mb-3">AI Insights</h2>

             <div className="mb-4">
               <h3 className="font-medium">Communication Style</h3>
               <p className="text-gray-700">{aiInsights.ai_communication_style}</p>
             </div>

             <div className="mb-4">
               <h3 className="font-medium">Relationship Summary</h3>
               <p className="text-gray-700">{aiInsights.ai_relationship_summary}</p>
             </div>

             <div className="mb-4">
               <h3 className="font-medium">Talking Points</h3>
               <ul className="list-disc list-inside">
                 {aiInsights.ai_talking_points?.map((point, i) => (
                   <li key={i} className="text-gray-700">{point}</li>
                 ))}
               </ul>
             </div>

             <div className="mb-4">
               <h3 className="font-medium">Topics Discussed</h3>
               <div className="flex flex-wrap gap-2">
                 {aiInsights.ai_topics?.map((topic, i) => (
                   <span key={i} className="badge badge-secondary">{topic}</span>
                 ))}
               </div>
             </div>

             <div>
               <h3 className="font-medium">Next Actions</h3>
               <ul className="space-y-2">
                 {aiInsights.ai_next_actions?.map((action, i) => (
                   <li key={i} className="flex items-center gap-2">
                     <input type="checkbox" />
                     <span>{action.action}</span>
                     <span className={`badge badge-${action.priority}`}>
                       {action.priority}
                     </span>
                   </li>
                 ))}
               </ul>
             </div>
           </section>
         )}

         {/* Recent Interactions */}
         <section className="mb-6">
           <h2 className="text-xl font-semibold mb-3">Recent Interactions</h2>

           {interactions.length === 0 ? (
             <p className="text-gray-500">No recent interactions</p>
           ) : (
             <div className="space-y-4">
               {interactions.map((interaction) => (
                 <InteractionCard key={interaction.id} interaction={interaction} />
               ))}
             </div>
           )}
         </section>

         {/* Donor Info (LV-specific) */}
         <section className="mb-6">
           <h2 className="text-xl font-semibold mb-3">Donor Information</h2>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <span className="text-gray-600">Donor Stage:</span>
               <span className="ml-2 font-medium">{contact.donor_stage}</span>
             </div>
             <div>
               <span className="text-gray-600">Lifetime Giving:</span>
               <span className="ml-2 font-medium">
                 ${contact.total_lifetime_giving?.toLocaleString()}
               </span>
             </div>
             <div>
               <span className="text-gray-600">Engagement Score:</span>
               <span className="ml-2 font-medium">{contact.engagement_score}</span>
             </div>
             <div>
               <span className="text-gray-600">Last Gift:</span>
               <span className="ml-2 font-medium">
                 {contact.last_gift_date ? new Date(contact.last_gift_date).toLocaleDateString() : 'Never'}
               </span>
             </div>
           </div>
         </section>
       </div>
     );
   }
   ```

3. ✅ Create interaction card component:
   ```typescript
   function InteractionCard({ interaction }: { interaction: any }) {
     const typeIcons = {
       email_sent: '📧',
       email_received: '📬',
       meeting: '🗓️',
       call: '📞',
       slack_message: '💬',
       sms_sent: '💬'
     };

     return (
       <div className="border rounded p-3 hover:bg-gray-50">
         <div className="flex items-start gap-3">
           <span className="text-2xl">{typeIcons[interaction.interaction_type]}</span>

           <div className="flex-1">
             <div className="flex items-center justify-between mb-1">
               <h4 className="font-medium">{interaction.subject || 'No subject'}</h4>
               <span className="text-sm text-gray-500">
                 {formatTimeAgo(interaction.interaction_date)}
               </span>
             </div>

             <p className="text-sm text-gray-700 mb-2">{interaction.snippet}</p>

             {/* Sentiment */}
             {interaction.sentiment_score !== null && (
               <SentimentBadge score={interaction.sentiment_score} />
             )}

             {/* AI Topics */}
             {interaction.ai_topics && interaction.ai_topics.length > 0 && (
               <div className="flex flex-wrap gap-1 mt-2">
                 {interaction.ai_topics.map((topic, i) => (
                   <span key={i} className="badge badge-sm">{topic}</span>
                 ))}
               </div>
             )}

             {/* Action Items */}
             {interaction.ai_action_items && interaction.ai_action_items.length > 0 && (
               <div className="mt-2">
                 <p className="text-xs font-medium text-gray-600">Action Items:</p>
                 <ul className="text-xs text-gray-700 list-disc list-inside">
                   {interaction.ai_action_items.map((item, i) => (
                     <li key={i}>{item}</li>
                   ))}
                 </ul>
               </div>
             )}
           </div>
         </div>
       </div>
     );
   }
   ```

**Success Criteria:**
- ✅ Contact detail view shows AI insights from Pulse
- ✅ Recent interactions display with sentiment and topics
- ✅ Enrichment loads fast (<200ms P95)
- ✅ Graceful fallback if Pulse API unavailable

---

### Phase 5: Google Contacts Sync (Week 3)

**Goal:** One-click Google Contacts import via Pulse proxy

**Tasks:**
1. ✅ Add Google sync button to Settings:
   ```typescript
   // In PulseIntegrationSettings.tsx

   import { GoogleContactsSyncButton } from '../components/GoogleContactsSyncButton';

   function PulseIntegrationSettings() {
     return (
       <div className="space-y-6">
         {/* Pulse bulk import (from Phase 2) */}
         <div>
           <h3>Import Contacts from Pulse</h3>
           <button onClick={handleBulkImport}>Import Now</button>
         </div>

         {/* Google Contacts sync */}
         <div>
           <h3>Google Contacts Integration</h3>
           <p className="text-sm text-gray-600 mb-3">
             Import contacts from your Google account. Contacts will sync through Pulse with automatic enrichment.
           </p>
           <GoogleContactsSyncButton />
         </div>

         {/* Sync schedule settings */}
         <div>
           <h3>Automatic Sync</h3>
           <label>
             <input
               type="checkbox"
               checked={autoSyncEnabled}
               onChange={(e) => setAutoSyncEnabled(e.target.checked)}
             />
             Enable automatic sync (every 15 minutes)
           </label>
         </div>
       </div>
     );
   }
   ```

2. ✅ Implement `GoogleContactsSyncButton` (from Section 5.2)

3. ✅ Add Pulse API methods:
   ```typescript
   // In pulseContactService.ts

   async triggerGoogleSync(options: {
     sync_type: 'full' | 'incremental';
     enrich_contacts?: boolean;
   }): Promise<{ sync_job_id: string }> {
     const response = await fetch(
       `${PULSE_API_URL}/api/contacts/google-sync/trigger`,
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${PULSE_API_KEY}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           sync_type: options.sync_type,
           options: {
             enrich_contacts: options.enrich_contacts ?? true,
             sync_photos: true,
             sync_groups: false
           }
         })
       }
     );

     if (!response.ok) {
       throw new Error(`Failed to trigger Google sync: ${response.statusText}`);
     }

     return await response.json();
   },

   async getGoogleSyncStatus(syncJobId: string): Promise<any> {
     const response = await fetch(
       `${PULSE_API_URL}/api/contacts/google-sync/status/${syncJobId}`,
       {
         headers: {
           'Authorization': `Bearer ${PULSE_API_KEY}`
         }
       }
     );

     if (!response.ok) {
       throw new Error(`Failed to get sync status: ${response.statusText}`);
     }

     return await response.json();
   }
   ```

**Success Criteria:**
- ✅ User can click button to trigger Google sync
- ✅ Progress bar shows sync status
- ✅ New contacts appear in LV after sync completes
- ✅ OAuth flow handled entirely by Pulse (LV never sees Google credentials)

---

### Phase 6: UI Polish & Testing (Week 3-4)

**Goal:** Production-ready UI and comprehensive testing

**Tasks:**
1. ✅ Update contact list view to show Pulse data:
   - Relationship score badges
   - Last interaction date
   - Favorite star icon
   - Company/title in subtitle

2. ✅ Add filters for Pulse-specific fields:
   - Filter by relationship score (0-25, 26-50, 51-75, 76-100)
   - Filter by communication frequency
   - Filter by tags
   - Filter by "Has recent interactions"

3. ✅ Performance optimization:
   - Virtual scrolling for large lists (react-window)
   - Debounce search input
   - Cache AI insights for 5 minutes
   - Lazy load interaction history

4. ✅ Error handling:
   - Retry failed API calls with exponential backoff
   - Show user-friendly error messages
   - Offline mode (show stale data with indicator)

5. ✅ Testing:
   ```typescript
   // __tests__/pulseContactSync.test.ts

   describe('Pulse Contact Sync', () => {
     test('fetches contacts from Pulse API', async () => {
       const contacts = await pulseContactService.fetchRelationshipProfiles({ limit: 10 });
       expect(contacts).toHaveLength(10);
       expect(contacts[0]).toHaveProperty('canonical_email');
     });

     test('syncs contact to LV database', async () => {
       const mockProfile = {
         id: 'test-123',
         canonical_email: 'test@example.com',
         display_name: 'Test User',
         relationship_score: 85
       };

       await dataSyncEngine.queueSync('contact', mockProfile.id, 'from_pulse', 'create', mockProfile, 5);
       await dataSyncEngine.processQueue();

       const contact = await contactService.getById(mockProfile.id);
       expect(contact.email).toBe('test@example.com');
       expect(contact.relationship_score).toBe(85);
     });

     test('handles API errors gracefully', async () => {
       // Mock API failure
       vi.spyOn(pulseContactService, 'fetchRelationshipProfiles').mockRejectedValue(
         new Error('Network error')
       );

       const result = await performBulkContactImport();
       expect(result.success).toBe(false);
       expect(result.errors).toBeGreaterThan(0);
     });
   });
   ```

**Success Criteria:**
- ✅ All Pulse fields visible in UI
- ✅ Filtering and search work with Pulse data
- ✅ Performance: List view loads <500ms for 10k contacts
- ✅ Unit tests pass (80%+ coverage)
- ✅ E2E tests pass (happy path + error scenarios)

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Services to Test:**
- `pulseContactService.ts` - API calls with mocked fetch
- `pulseSyncService.ts` - Bulk import and incremental sync logic
- `contactService.ts` - CRUD with extended schema
- `dataSyncEngine.ts` - Contact entity transformation

**Example Test Suite:**

```typescript
// __tests__/services/pulseContactService.test.ts

import { vi, describe, test, expect, beforeEach } from 'vitest';
import { pulseContactService } from '../../src/services/pulseContactService';

global.fetch = vi.fn();

describe('pulseContactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('fetchRelationshipProfiles returns data', async () => {
    const mockResponse = {
      data: [
        { id: '1', canonical_email: 'test@example.com', display_name: 'Test User' }
      ],
      pagination: { total: 1, has_more: false }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await pulseContactService.fetchRelationshipProfiles({ limit: 10 });

    expect(result).toHaveLength(1);
    expect(result[0].canonical_email).toBe('test@example.com');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/contacts/relationship-profiles'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer')
        })
      })
    );
  });

  test('getAIInsights returns null for 404', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await pulseContactService.getAIInsights('non-existent-id');
    expect(result).toBeNull();
  });

  test('getAIInsights throws on other errors', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(
      pulseContactService.getAIInsights('test-id')
    ).rejects.toThrow('Pulse API error');
  });
});
```

### 8.2 Integration Tests

**Scenarios:**
1. End-to-end bulk import from Pulse to LV
2. Incremental sync detects and syncs modified contacts
3. Real-time enrichment fetches AI insights
4. Google Contacts sync flows through Pulse

**Example:**

```typescript
// __tests__/integration/contactSync.test.ts

describe('Contact Sync Integration', () => {
  test('bulk import creates contacts in LV', async () => {
    // Start with empty contacts table
    await supabase.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Trigger bulk import
    const result = await performBulkContactImport();

    expect(result.success).toBe(true);
    expect(result.imported).toBeGreaterThan(0);

    // Verify contacts in database
    const { data: contacts } = await supabase.from('contacts').select('*');
    expect(contacts).toHaveLength(result.imported);
    expect(contacts[0]).toHaveProperty('pulse_profile_id');
  });
});
```

### 8.3 Manual Testing Checklist

**Pre-deployment:**

- [ ] Bulk import completes without errors (test with 100 contacts)
- [ ] Incremental sync updates modified contacts
- [ ] Contact detail view shows AI insights
- [ ] Recent interactions display correctly
- [ ] Google Contacts sync button works
- [ ] Sync status indicator updates in real-time
- [ ] Filters work with Pulse data (relationship score, tags)
- [ ] Search includes Pulse fields (company, job title)
- [ ] Privacy flags respected (do_not_email, is_blocked)
- [ ] Offline mode shows stale data with indicator
- [ ] Error messages are user-friendly
- [ ] Performance: 10k contacts load in <500ms

**Edge Cases:**
- [ ] Contact exists in LV but not Pulse (orphan)
- [ ] Contact exists in Pulse but not LV (new)
- [ ] Contact modified in both (conflict resolution)
- [ ] API rate limit exceeded (graceful degradation)
- [ ] Pulse server offline (fallback to cached data)
- [ ] Invalid JWT token (refresh and retry)
- [ ] Duplicate emails (merge logic)

---

## 9. Rollback Plan

### 9.1 Rollback Triggers

Rollback if ANY of these occur:
- Data corruption or loss
- Sync failures >10%
- Performance degradation (list view >2s)
- Critical security vulnerability
- Widespread user complaints

### 9.2 Rollback Procedure

**Step 1: Stop Sync**
```typescript
// In App.tsx, comment out:
// startIncrementalSync();

// Or via Settings UI, toggle "Enable automatic sync" OFF
```

**Step 2: Revert Database Migrations**
```sql
-- Rollback pulse fields
ALTER TABLE contacts
  DROP COLUMN IF EXISTS pulse_profile_id,
  DROP COLUMN IF EXISTS pulse_synced_at,
  DROP COLUMN IF EXISTS pulse_sync_status,
  DROP COLUMN IF EXISTS pulse_last_modified,
  DROP COLUMN IF EXISTS google_contact_id,
  DROP COLUMN IF EXISTS google_resource_name,
  DROP COLUMN IF EXISTS google_synced_at,
  DROP COLUMN IF EXISTS relationship_score,
  DROP COLUMN IF EXISTS relationship_trend,
  DROP COLUMN IF EXISTS communication_frequency,
  DROP COLUMN IF EXISTS preferred_channel,
  DROP COLUMN IF EXISTS last_interaction_date,
  DROP COLUMN IF EXISTS total_interactions,
  DROP COLUMN IF EXISTS company,
  DROP COLUMN IF EXISTS job_title,
  DROP COLUMN IF EXISTS linkedin_url,
  DROP COLUMN IF EXISTS timezone,
  DROP COLUMN IF EXISTS avatar_url,
  DROP COLUMN IF EXISTS is_favorite,
  DROP COLUMN IF EXISTS is_blocked,
  DROP COLUMN IF EXISTS is_vip,
  DROP COLUMN IF EXISTS pulse_tags,
  DROP COLUMN IF EXISTS pulse_notes;

-- Drop interactions table
DROP TABLE IF EXISTS pulse_contact_interactions CASCADE;
```

**Step 3: Restore Mock Data (Temporary)**
```typescript
// Uncomment mock data generation in contactService.ts
// Or restore from backup CSV
```

**Step 4: Redeploy Previous Version**
```bash
git revert <commit-hash-of-pulse-integration>
npm run build
npm run deploy
```

**Step 5: Communicate to Users**
```
Subject: Contacts Integration Issue - Rollback Complete

We've temporarily disabled the Pulse contacts integration due to [issue].
Your existing contact data is safe and accessible.

We're working on a fix and will re-enable the feature soon.

- Logos Vision Team
```

### 9.3 Data Backup

**Before Phase 1:**
```bash
# Export contacts table
pg_dump -h <supabase-host> -U postgres -t contacts -f contacts_backup_$(date +%Y%m%d).sql

# Or via Supabase dashboard: Database → Backups → Create backup
```

**Daily Backups (Automated):**
```typescript
// Supabase automatic backups (built-in)
// Retention: 7 days for free tier, 30 days for paid

// Manual export (weekly):
const { data: contacts } = await supabase.from('contacts').select('*');
const json = JSON.stringify(contacts, null, 2);
await fs.writeFile(`backups/contacts_${Date.now()}.json`, json);
```

---

## 10. Success Metrics

### 10.1 Performance KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial sync time (1000 contacts) | <30 seconds | Timer in bulk import |
| Incremental sync time | <10 seconds | Timer in scheduled sync |
| Contact list load (10k contacts) | <500ms (P95) | React Profiler |
| Contact detail load | <200ms (P95) | API response time |
| AI insights load | <300ms (P95) | API response time |
| Sync success rate | >99% | Errors / total syncs |
| API error rate | <1% | Failed requests / total |

### 10.2 Business KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Contacts synced | 100% of Pulse contacts | Entity mappings count |
| User adoption | >80% users enable sync | Settings toggle analytics |
| Google Contacts synced | >500 contacts/user | Sync job stats |
| AI insights usage | >50% users view | Detail view analytics |
| Engagement increase | +20% donor outreach | Activity logs |

### 10.3 Monitoring & Alerts

**Datadog/Sentry Setup:**

```typescript
// In pulseSyncService.ts

import * as Sentry from '@sentry/react';

async function performBulkContactImport() {
  const transaction = Sentry.startTransaction({
    op: 'pulse.sync.bulk_import',
    name: 'Bulk Contact Import'
  });

  try {
    // ... sync logic ...

    // Track metrics
    Sentry.metrics.distribution('pulse.sync.contacts_imported', result.imported);
    Sentry.metrics.distribution('pulse.sync.duration_ms', Date.now() - startTime);

    transaction.finish();
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: 'pulse-sync',
        operation: 'bulk_import'
      }
    });
    transaction.finish();
    throw error;
  }
}
```

**Alerts:**
- Sync failures >5 in 10 minutes → Slack alert
- API error rate >5% → Email alert
- Database connection errors → PagerDuty alert
- Sync queue backing up (>1000 pending items) → Slack alert

---

## Appendix A: API Error Codes

| Status Code | Error Code | Description | Action |
|-------------|-----------|-------------|--------|
| 400 | `invalid_request` | Malformed request body | Fix request format |
| 401 | `unauthorized` | Missing/invalid JWT token | Refresh token |
| 403 | `forbidden` | User doesn't have access | Check permissions |
| 404 | `not_found` | Resource doesn't exist | Verify ID |
| 429 | `rate_limit_exceeded` | Too many requests | Retry after delay |
| 500 | `internal_server_error` | Server error | Retry with backoff |
| 503 | `service_unavailable` | Pulse server down | Degrade gracefully |

---

## Appendix B: Conflict Resolution Matrix

| Field | LV Modified | Pulse Modified | Resolution |
|-------|------------|----------------|------------|
| Name | Yes | Yes | Pulse wins (source of truth) |
| Email | Yes | Yes | Pulse wins |
| Phone | Yes | Yes | Pulse wins |
| Company | Yes | Yes | Pulse wins |
| Job Title | Yes | Yes | Pulse wins |
| Donor Stage | Yes | No | LV wins (not in Pulse) |
| Total Lifetime Giving | Yes | No | LV wins |
| Engagement Score | Yes | No | LV wins |
| Relationship Score | No | Yes | Pulse wins |
| Tags | Yes | Yes | Merge (union) |
| Notes | Yes | Yes | Append both |

---

## Appendix C: Environment Variables Reference

```bash
# .env.local

# Pulse Integration
VITE_PULSE_API_URL=https://pulse-api.example.com
VITE_PULSE_API_KEY=your_api_key_here

# Pulse Supabase (for direct DB access if needed)
VITE_PULSE_SUPABASE_URL=https://your-pulse-instance.supabase.co
VITE_PULSE_SUPABASE_KEY=your_pulse_anon_key_here

# LV Supabase (existing)
VITE_SUPABASE_URL=https://your-lv-instance.supabase.co
VITE_SUPABASE_ANON_KEY=your_lv_anon_key_here

# Google OAuth (handled by Pulse)
# Not needed in LV if proxying through Pulse

# Feature Flags
VITE_PULSE_SYNC_ENABLED=true
VITE_PULSE_SYNC_INTERVAL_MINUTES=15
VITE_PULSE_API_TIMEOUT_MS=10000
VITE_PULSE_CACHE_DURATION_MINUTES=5
```

---

## Next Steps

1. **Review this plan** with your team
2. **Set up Pulse API credentials** in `.env.local`
3. **Run Phase 1 migrations** to extend contacts table
4. **Start implementation** following Phase 1 → Phase 6
5. **Deploy to staging** after Phase 3 for early testing
6. **Full production deployment** after Phase 6 complete

**Questions?** Reach out to the backend team for Pulse API access and testing support.

---

**Plan Version:** 1.0
**Last Updated:** 2026-01-25
**Status:** ✅ Ready for Implementation
