# Pulse Contact Integration - Quick Start Guide

**Quick setup guide for testing Pulse contact integration**

---

## Development Mode (Mock Data)

The fastest way to test the integration without configuring Pulse API:

### 1. No Configuration Needed

The services automatically use mock data when `VITE_PULSE_API_URL` is not configured. Just start using the services!

### 2. Test in Console

Open browser console and test the services:

```javascript
// Import services
import { pulseContactService } from './services/pulseContactService';
import { pulseSyncService } from './services/pulseSyncService';

// Fetch mock relationship profiles
const profiles = await pulseContactService.fetchRelationshipProfiles({ limit: 5 });
console.log('Profiles:', profiles);

// Get mock AI insights
const insights = await pulseContactService.getAIInsights('profile-1');
console.log('AI Insights:', insights);

// Get mock interactions
const interactions = await pulseContactService.getRecentInteractions('profile-1');
console.log('Interactions:', interactions);

// Check service status
const status = pulseContactService.getConfigStatus();
console.log('Service Status:', status);
// Output: { configured: false, usingMockData: true, ... }
```

### 3. Test Bulk Import with Mock Data

```javascript
// Perform bulk import (uses mock data)
const result = await pulseSyncService.performBulkContactImport();
console.log('Import Result:', result);
// Output: { success: true, imported: 5, updated: 0, errors: 0 }
```

### 4. Available Mock Data

The following mock data is available:

- **5 Relationship Profiles** with varied scores (28, 45, 72, 85, 92)
- **2 Complete AI Insights** with communication styles, talking points, next actions
- **Multiple Interactions** including emails, meetings, calls, Slack messages
- **4 Recommended Actions** covering different priorities (high, medium, opportunity)

---

## Production Mode (Pulse API)

To connect to real Pulse API:

### 1. Configure Environment Variables

Create or update `.env.local`:

```bash
# Pulse Contact API
VITE_PULSE_API_URL=https://pulse-api.example.com
VITE_PULSE_API_KEY=your_api_key_here

# Optional: Sync configuration
VITE_PULSE_SYNC_ENABLED=true
VITE_PULSE_SYNC_INTERVAL_MINUTES=15
```

### 2. Test API Connection

```javascript
// Check if API is configured and healthy
const isHealthy = await pulseContactService.checkHealth();
console.log('API Health:', isHealthy);

const status = pulseContactService.getConfigStatus();
console.log('Service Status:', status);
// Output: { configured: true, usingMockData: false, ... }
```

### 3. Perform Bulk Import

```javascript
// Import all contacts from Pulse
const result = await pulseSyncService.performBulkContactImport();
console.log('Import Result:', result);

// Check import status
console.log(`Imported: ${result.imported} contacts`);
console.log(`Updated: ${result.updated} contacts`);
console.log(`Errors: ${result.errors}`);
console.log(`Duration: ${result.duration}ms`);
```

### 4. Start Incremental Sync

Add to your `App.tsx`:

```typescript
import { pulseSyncService } from './services/pulseSyncService';

function App() {
  useEffect(() => {
    // Start 15-minute incremental sync
    pulseSyncService.startIncrementalSync();

    // Cleanup on unmount
    return () => {
      pulseSyncService.stopIncrementalSync();
    };
  }, []);

  // ... rest of app
}
```

### 5. Use in Contact Detail View

```typescript
function ContactDetailView({ contactId }: { contactId: string }) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [interactions, setInteractions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // Load contact
      const contactData = await contactService.getById(contactId);
      setContact(contactData);

      if (contactData.pulse_profile_id) {
        // Load AI insights from Pulse API
        const insights = await pulseContactService.getAIInsights(
          contactData.pulse_profile_id
        );
        setAiInsights(insights);
      }

      // Load interactions from local DB
      const recentInteractions = await contactService.getRecentInteractions(
        contactId,
        { limit: 30, days: 90 }
      );
      setInteractions(recentInteractions);
    }

    loadData();
  }, [contactId]);

  return (
    <div>
      <h1>{contact?.name}</h1>

      {aiInsights && (
        <div className="ai-insights">
          <h2>AI Insights</h2>
          <p>{aiInsights.ai_relationship_summary}</p>

          <h3>Talking Points</h3>
          <ul>
            {aiInsights.ai_talking_points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>

          <h3>Next Actions</h3>
          <ul>
            {aiInsights.ai_next_actions.map((action, i) => (
              <li key={i}>
                <span className={`priority-${action.priority}`}>
                  {action.priority}
                </span>
                {action.action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {interactions.length > 0 && (
        <div className="interactions">
          <h2>Recent Activity</h2>
          {interactions.map(interaction => (
            <div key={interaction.id} className="interaction-card">
              <strong>{interaction.subject}</strong>
              <p>{interaction.snippet}</p>
              <small>{new Date(interaction.interaction_date).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Database Setup

Before using production mode, run the database migrations:

### 1. Extend Contacts Table

Run SQL migration in Supabase dashboard or via CLI:

```bash
psql -h <supabase-host> -U postgres -d postgres -f supabase/migrations/20260125_add_pulse_contact_fields.sql
```

Or manually in SQL editor:

```sql
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS pulse_profile_id UUID,
  ADD COLUMN IF NOT EXISTS relationship_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS communication_frequency VARCHAR(20),
  ADD COLUMN IF NOT EXISTS pulse_tags JSONB DEFAULT '[]'::jsonb;
  -- ... (see full migration in PULSE_CONTACT_INTEGRATION_README.md)
```

### 2. Create Interactions Table

```sql
CREATE TABLE IF NOT EXISTS pulse_contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  pulse_interaction_id UUID NOT NULL UNIQUE,
  interaction_type VARCHAR(50) NOT NULL,
  interaction_date TIMESTAMPTZ NOT NULL,
  -- ... (see full schema in PULSE_CONTACT_INTEGRATION_README.md)
);
```

---

## Troubleshooting

### Mock Data Not Loading

**Issue:** Services not returning data

**Solution:**
```javascript
// Check service configuration
const status = pulseContactService.getConfigStatus();
console.log(status);

// Should show: { configured: false, usingMockData: true }
```

### API Connection Failed

**Issue:** `pulseContactService.checkHealth()` returns false

**Solution:**
1. Verify `VITE_PULSE_API_URL` is set correctly
2. Check API key is valid
3. Ensure Pulse API server is running
4. Check network/firewall settings

### Sync Not Starting

**Issue:** Incremental sync not running

**Solution:**
```javascript
// Check if sync is running
const isSyncing = pulseSyncService.isSyncing();
console.log('Is syncing:', isSyncing);

// Get sync status
const status = await pulseSyncService.getSyncStatus();
console.log('Sync status:', status);

// Manually trigger sync
await pulseSyncService.runIncrementalSync();
```

### No Interactions Loading

**Issue:** `contactService.getRecentInteractions()` returns empty array

**Solution:**
1. Verify `pulse_contact_interactions` table exists
2. Check if interactions were synced during bulk import
3. Verify contact has `pulse_profile_id` set
4. Check date range (default is 90 days)

---

## Next Steps

1. **Test Mock Data** - Verify services work with mock data
2. **Configure API** - Add Pulse API credentials to `.env.local`
3. **Run Bulk Import** - Import contacts from Pulse
4. **Start Sync** - Enable 15-minute incremental sync
5. **Build UI** - Implement contact cards and detail views
6. **Test Google Sync** - Trigger Google Contacts import

---

## Resources

- **Full Documentation**: `PULSE_CONTACT_INTEGRATION_README.md`
- **Integration Plan**: `PULSE_LV_CONTACTS_INTEGRATION_PLAN.md`
- **UI Implementation**: `CONTACTS_UI_IMPLEMENTATION_PLAN.md`
- **Type Definitions**: `src/types/pulseContacts.ts`

---

**Quick Start Version:** 1.0
**Last Updated:** 2026-01-25
