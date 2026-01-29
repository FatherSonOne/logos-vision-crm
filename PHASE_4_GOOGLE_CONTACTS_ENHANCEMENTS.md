# Phase 4: Google Contacts Integration - Advanced Enhancements

**Date:** 2026-01-27
**Status:** Planning
**Prerequisites:** Phase 3 Complete (Basic Google Contacts sync working)
**Estimated Time:** 16-20 hours

---

## Overview

Building on the successful Phase 3 implementation, this phase adds sophisticated features to make the Google Contacts integration production-ready and user-friendly.

### What We Built in Phase 3 ✅

- ✅ Google OAuth 2.0 authorization flow
- ✅ Manual sync trigger with progress tracking
- ✅ Google Contacts fetching via People API (428 contacts)
- ✅ Background sync job processing
- ✅ Smart UI (Authorize → Sync flow)
- ✅ Contact import to relationship_profiles
- ✅ Real-time progress polling

### What We're Adding in Phase 4 🚀

1. **Auto-Sync Scheduler** - Automatic daily sync in background
2. **Bidirectional Sync** - Logos Vision contacts → Google Contacts
3. **Auto-Labeling** - Automatically add "Logos Vision" label in Google
4. **Selective Import UI** - Preview and choose specific contacts
5. **Incremental Sync** - Only sync changed contacts (faster)
6. **Better Error Handling** - Gracefully handle contacts without emails

---

## Enhancement 1: Auto-Sync Scheduler

### Problem
Users must manually click "Sync" button to update contacts. If they forget, they miss new contacts or updates.

### Solution
Automatic background sync every 24 hours, with user control.

### Implementation

#### Backend: Pulse API (`F:\pulse1\server.js`)

**New Database Table:** `google_contacts_auto_sync_config`

```sql
CREATE TABLE IF NOT EXISTS public.google_contacts_auto_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  interval_hours INTEGER NOT NULL DEFAULT 24,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**New Endpoint:** `PUT /api/logos-vision/auto-sync/config`

```javascript
app.put('/api/logos-vision/auto-sync/config', verifyLogosVisionAuth, async (req, res) => {
  const { workspace_id, enabled, interval_hours } = req.body;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Calculate next sync time
  const next_sync_at = new Date();
  next_sync_at.setHours(next_sync_at.getHours() + (interval_hours || 24));

  const { data, error } = await supabase
    .from('google_contacts_auto_sync_config')
    .upsert({
      user_id: workspace_id,
      enabled,
      interval_hours: interval_hours || 24,
      next_sync_at: next_sync_at.toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});
```

**New Endpoint:** `GET /api/logos-vision/auto-sync/config`

```javascript
app.get('/api/logos-vision/auto-sync/config', verifyLogosVisionAuth, async (req, res) => {
  const { workspace_id } = req.query;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data, error } = await supabase
    .from('google_contacts_auto_sync_config')
    .select('*')
    .eq('user_id', workspace_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  // Return default config if not found
  res.json(data || {
    enabled: false,
    interval_hours: 24,
    last_sync_at: null,
    next_sync_at: null
  });
});
```

**Background Scheduler:**

```javascript
// Run every hour to check for due syncs
setInterval(async () => {
  console.log('[AutoSync] Checking for due syncs...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get all users with auto-sync enabled and due for sync
  const { data: configs, error } = await supabase
    .from('google_contacts_auto_sync_config')
    .select('*')
    .eq('enabled', true)
    .lte('next_sync_at', new Date().toISOString());

  if (error) {
    console.error('[AutoSync] Error fetching configs:', error);
    return;
  }

  console.log(`[AutoSync] Found ${configs?.length || 0} users due for sync`);

  for (const config of configs || []) {
    try {
      console.log(`[AutoSync] Starting sync for user ${config.user_id}`);

      // Trigger sync
      const syncJobId = crypto.randomUUID();
      await fetchGoogleContactsInBackground(config.user_id, syncJobId, {
        label: 'Logos Vision'
      });

      // Update next sync time
      const next_sync_at = new Date();
      next_sync_at.setHours(next_sync_at.getHours() + config.interval_hours);

      await supabase
        .from('google_contacts_auto_sync_config')
        .update({
          last_sync_at: new Date().toISOString(),
          next_sync_at: next_sync_at.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', config.user_id);

      console.log(`[AutoSync] Completed sync for user ${config.user_id}`);
    } catch (err) {
      console.error(`[AutoSync] Failed sync for user ${config.user_id}:`, err);
    }
  }
}, 60 * 60 * 1000); // Every hour
```

#### Frontend: Logos Vision CRM

**New Component:** `src/components/contacts/AutoSyncSettings.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { getAutoSyncConfig, updateAutoSyncConfig } from '../../services/pulseApiService';
import { logger } from '../../utils/logger';

export function AutoSyncSettings() {
  const [config, setConfig] = useState({ enabled: false, interval_hours: 24 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const userId = 'current-user-id'; // TODO: Get from auth
    const data = await getAutoSyncConfig(userId);
    setConfig(data);
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      const userId = 'current-user-id';
      const newConfig = await updateAutoSyncConfig(userId, {
        enabled: !config.enabled,
        interval_hours: config.interval_hours
      });
      setConfig(newConfig);
      logger.info(`[AutoSync] ${newConfig.enabled ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      logger.error('[AutoSync] Failed to update config:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Automatic Sync
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sync contacts from Google every {config.interval_hours} hours
          </p>
          {config.next_sync_at && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Next sync: {new Date(config.next_sync_at).toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out
            ${config.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white
              transition-transform duration-200 ease-in-out
              ${config.enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
}
```

**Update:** `src/services/pulseApiService.ts`

```typescript
export async function getAutoSyncConfig(workspaceId: string) {
  const response = await fetch(
    `${PULSE_API_URL}/api/logos-vision/auto-sync/config?workspace_id=${workspaceId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
    }
  );
  return await response.json();
}

export async function updateAutoSyncConfig(
  workspaceId: string,
  config: { enabled: boolean; interval_hours: number }
) {
  const response = await fetch(
    `${PULSE_API_URL}/api/logos-vision/auto-sync/config`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PULSE_API_KEY,
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        ...config,
      }),
    }
  );
  return await response.json();
}
```

**Estimated Time:** 4 hours

---

## Enhancement 2: Bidirectional Sync

### Problem
Users create contacts in Logos Vision but they don't appear in Google Contacts. Data is one-way only.

### Solution
When user creates/updates contact in Logos Vision, push changes to Google Contacts.

### Implementation

#### Backend: Pulse API

**New Endpoint:** `POST /api/logos-vision/contacts/push`

```javascript
app.post('/api/logos-vision/contacts/push', verifyLogosVisionAuth, async (req, res) => {
  const { workspace_id, contacts } = req.body;

  try {
    // Get OAuth tokens
    const tokens = await getGoogleTokens(workspace_id);
    if (!tokens) {
      return res.status(401).json({ error: 'No Google OAuth tokens found' });
    }

    oauth2Client.setCredentials(tokens);
    const people = google.people({ version: 'v1', auth: oauth2Client });

    const results = [];

    for (const contact of contacts) {
      try {
        // Check if contact already exists
        const existingContact = await findGoogleContactByEmail(people, contact.email);

        if (existingContact) {
          // Update existing contact
          const response = await people.people.updateContact({
            resourceName: existingContact.resourceName,
            updatePersonFields: 'names,emailAddresses,phoneNumbers,organizations',
            requestBody: {
              names: [{
                givenName: contact.first_name,
                familyName: contact.last_name
              }],
              emailAddresses: [{
                value: contact.email,
                type: 'work'
              }],
              phoneNumbers: contact.phone ? [{
                value: contact.phone,
                type: 'work'
              }] : undefined,
              organizations: contact.company ? [{
                name: contact.company,
                title: contact.title
              }] : undefined
            }
          });

          results.push({
            email: contact.email,
            action: 'updated',
            resourceName: response.data.resourceName
          });
        } else {
          // Create new contact
          const response = await people.people.createContact({
            requestBody: {
              names: [{
                givenName: contact.first_name,
                familyName: contact.last_name
              }],
              emailAddresses: [{
                value: contact.email,
                type: 'work'
              }],
              phoneNumbers: contact.phone ? [{
                value: contact.phone,
                type: 'work'
              }] : undefined,
              organizations: contact.company ? [{
                name: contact.company,
                title: contact.title
              }] : undefined
            }
          });

          results.push({
            email: contact.email,
            action: 'created',
            resourceName: response.data.resourceName
          });
        }
      } catch (err) {
        results.push({
          email: contact.email,
          action: 'failed',
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      results,
      total: contacts.length,
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      failed: results.filter(r => r.action === 'failed').length
    });
  } catch (err) {
    console.error('[PushToGoogle] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

async function findGoogleContactByEmail(people, email) {
  const response = await people.people.searchContacts({
    query: email,
    readMask: 'names,emailAddresses'
  });

  const results = response.data.results || [];
  return results.find(r =>
    r.person?.emailAddresses?.some(e => e.value === email)
  )?.person;
}
```

#### Frontend: Logos Vision CRM

**Hook into Contact Create/Update:**

```typescript
// In contactService.ts
export async function createContact(contact: ContactInput): Promise<Contact> {
  // 1. Create in Supabase
  const newContact = await supabase
    .from('relationship_profiles')
    .insert(contact)
    .select()
    .single();

  // 2. Push to Google Contacts (if enabled)
  try {
    await pushContactsToGoogle([newContact]);
  } catch (err) {
    logger.warn('[ContactService] Failed to push to Google:', err);
    // Don't fail the whole operation
  }

  return newContact;
}

async function pushContactsToGoogle(contacts: Contact[]) {
  const userId = 'current-user-id';
  const response = await fetch(`${PULSE_API_URL}/api/logos-vision/contacts/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': PULSE_API_KEY,
    },
    body: JSON.stringify({
      workspace_id: userId,
      contacts: contacts.map(c => ({
        email: c.canonical_email,
        first_name: c.first_name,
        last_name: c.last_name,
        phone: c.phone,
        company: c.company,
        title: c.title
      }))
    })
  });

  return await response.json();
}
```

**Estimated Time:** 5 hours

---

## Enhancement 3: Auto-Labeling in Google Contacts

### Problem
Contacts synced from Logos Vision don't have the "Logos Vision" label in Google Contacts, making it hard to identify them.

### Solution
Automatically add "Logos Vision" label to contacts when they're pushed to Google.

### Implementation

```javascript
// In pushContactsToGoogle function

// Create or get "Logos Vision" label
async function getOrCreateLogosVisionLabel(people) {
  // Search for existing label
  const response = await people.contactGroups.list({
    groupFields: 'name'
  });

  const groups = response.data.contactGroups || [];
  let logosVisionGroup = groups.find(g => g.name === 'Logos Vision');

  if (!logosVisionGroup) {
    // Create new label
    const createResponse = await people.contactGroups.create({
      requestBody: {
        contactGroup: {
          name: 'Logos Vision'
        }
      }
    });
    logosVisionGroup = createResponse.data;
  }

  return logosVisionGroup.resourceName;
}

// Add contact to label group
async function addContactToLabel(people, contactResourceName, labelResourceName) {
  await people.contactGroups.members.modify({
    resourceName: labelResourceName,
    requestBody: {
      resourceNamesToAdd: [contactResourceName]
    }
  });
}

// Update push endpoint to auto-label
app.post('/api/logos-vision/contacts/push', verifyLogosVisionAuth, async (req, res) => {
  // ... existing code ...

  // Get or create label
  const labelResourceName = await getOrCreateLogosVisionLabel(people);

  for (const contact of contacts) {
    // ... create/update contact ...

    // Add to label group
    await addContactToLabel(people, response.data.resourceName, labelResourceName);
  }

  // ... rest of code ...
});
```

**Estimated Time:** 2 hours

---

## Enhancement 4: Selective Import UI with Preview

### Problem
Users can't see what contacts will be imported before clicking sync. No way to choose specific contacts.

### Solution
Show preview modal with all Google Contacts, allow user to select which ones to import.

### Implementation

**New Component:** `src/components/contacts/SelectiveImportModal.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { fetchGoogleContactsPreview, importSelectedContacts } from '../../services/pulseApiService';

interface GoogleContact {
  resourceName: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  hasLogosVisionLabel: boolean;
}

export function SelectiveImportModal({ onClose }: { onClose: () => void }) {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const userId = 'current-user-id';
    const data = await fetchGoogleContactsPreview(userId);
    setContacts(data.contacts);

    // Auto-select contacts with "Logos Vision" label
    const autoSelect = new Set(
      data.contacts
        .filter(c => c.hasLogosVisionLabel)
        .map(c => c.resourceName)
    );
    setSelected(autoSelect);
    setLoading(false);
  };

  const handleToggle = (resourceName: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(resourceName)) {
      newSelected.delete(resourceName);
    } else {
      newSelected.add(resourceName);
    }
    setSelected(newSelected);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const userId = 'current-user-id';
      const selectedContacts = contacts.filter(c => selected.has(c.resourceName));

      await importSelectedContacts(userId, selectedContacts);

      // Refresh page
      window.location.reload();
    } catch (err) {
      console.error('[SelectiveImport] Import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="mt-4">Loading Google Contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Select Contacts to Import</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selected.size} of {contacts.length} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(new Set(contacts.map(c => c.resourceName)))}
              className="text-sm text-blue-600 hover:underline"
            >
              Select All
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-blue-600 hover:underline"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {contacts.map(contact => (
            <div
              key={contact.resourceName}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <input
                type="checkbox"
                checked={selected.has(contact.resourceName)}
                onChange={() => handleToggle(contact.resourceName)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {contact.email}
                  {contact.company && ` • ${contact.company}`}
                  {contact.phone && ` • ${contact.phone}`}
                </div>
                {contact.hasLogosVisionLabel && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Logos Vision
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || selected.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : `Import ${selected.size} Contacts`}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**New Endpoint:** `GET /api/logos-vision/contacts/preview`

```javascript
app.get('/api/logos-vision/contacts/preview', verifyLogosVisionAuth, async (req, res) => {
  const { workspace_id } = req.query;

  try {
    const tokens = await getGoogleTokens(workspace_id);
    if (!tokens) {
      return res.status(401).json({ error: 'No Google OAuth tokens found' });
    }

    oauth2Client.setCredentials(tokens);
    const people = google.people({ version: 'v1', auth: oauth2Client });

    // Get all contact groups (labels)
    const groupsResponse = await people.contactGroups.list({
      groupFields: 'name'
    });
    const logosVisionGroup = groupsResponse.data.contactGroups?.find(
      g => g.name === 'Logos Vision'
    );

    // Get all contacts
    let allContacts = [];
    let pageToken = null;

    do {
      const response = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 100,
        personFields: 'names,emailAddresses,phoneNumbers,organizations,memberships',
        pageToken
      });

      allContacts = allContacts.concat(response.data.connections || []);
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    // Transform contacts
    const contacts = allContacts
      .filter(c => c.emailAddresses && c.emailAddresses.length > 0)
      .map(contact => {
        const email = contact.emailAddresses[0].value;
        const name = contact.names?.[0];
        const org = contact.organizations?.[0];
        const phone = contact.phoneNumbers?.[0];

        // Check if has Logos Vision label
        const hasLogosVisionLabel = contact.memberships?.some(
          m => m.contactGroupMembership?.contactGroupResourceName === logosVisionGroup?.resourceName
        ) || false;

        return {
          resourceName: contact.resourceName,
          email,
          name: name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() : email,
          company: org?.name,
          title: org?.title,
          phone: phone?.value,
          hasLogosVisionLabel
        };
      });

    res.json({
      contacts,
      total: contacts.length
    });
  } catch (err) {
    console.error('[ContactsPreview] Error:', err);
    res.status(500).json({ error: err.message });
  }
});
```

**Estimated Time:** 4 hours

---

## Enhancement 5: Incremental Sync

### Problem
Every sync fetches all 428 contacts, even if only 2 changed. Slow and wasteful.

### Solution
Track `sync_token` from Google API, only fetch changed contacts.

### Implementation

**Update Database Table:**

```sql
ALTER TABLE google_contacts_auto_sync_config
ADD COLUMN sync_token TEXT;
```

**Update Sync Function:**

```javascript
async function fetchGoogleContactsInBackground(userId, syncJobId, filter = {}) {
  // ... existing code ...

  // Get last sync token
  const { data: config } = await supabase
    .from('google_contacts_auto_sync_config')
    .select('sync_token')
    .eq('user_id', userId)
    .single();

  const syncToken = config?.sync_token;

  let allContacts = [];
  let pageToken = null;
  let newSyncToken = null;

  do {
    const requestParams = {
      resourceName: 'people/me',
      pageSize: 100,
      personFields: 'names,emailAddresses,phoneNumbers,organizations,addresses,biographies',
      pageToken
    };

    // Use sync token for incremental sync
    if (syncToken && !pageToken) {
      requestParams.requestSyncToken = true;
      requestParams.syncToken = syncToken;
    } else if (!syncToken) {
      requestParams.requestSyncToken = true;
    }

    const response = await people.people.connections.list(requestParams);

    allContacts = allContacts.concat(response.data.connections || []);
    pageToken = response.data.nextPageToken;

    // Save new sync token
    if (!pageToken && response.data.nextSyncToken) {
      newSyncToken = response.data.nextSyncToken;
    }
  } while (pageToken);

  console.log(`[GoogleContacts] Incremental sync: ${allContacts.length} contacts (changed only)`);

  // ... existing import logic ...

  // Save new sync token
  if (newSyncToken) {
    await supabase
      .from('google_contacts_auto_sync_config')
      .update({ sync_token: newSyncToken })
      .eq('user_id', userId);
  }
}
```

**Estimated Time:** 3 hours

---

## Enhancement 6: Better Handling for Contacts Without Emails

### Problem
416 out of 428 contacts failed because they don't have email addresses. No user feedback.

### Solution
Import them anyway with alternative identifiers, show clear status.

### Implementation

**Update Import Logic:**

```javascript
async function importContactToSupabase(supabase, userId, contact) {
  const email = contact.emailAddresses?.[0]?.value;
  const name = contact.names?.[0];
  const phone = contact.phoneNumbers?.[0]?.value;

  // Use email OR phone as identifier
  const identifier = email || phone;

  if (!identifier) {
    return {
      success: false,
      reason: 'no_email_or_phone',
      contact: name ? `${name.givenName} ${name.familyName}` : 'Unknown'
    };
  }

  const contactData = {
    user_id: userId,
    source: 'google_contacts',
    canonical_email: email || null,
    phone: phone || null,
    first_name: name?.givenName || '',
    last_name: name?.familyName || '',
    contact_name: name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() : (email || phone),
    // ... rest of fields
  };

  // Use upsert with phone if no email
  const { data, error } = await supabase
    .from('relationship_profiles')
    .upsert(contactData, {
      onConflict: email ? 'canonical_email' : 'phone',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      reason: 'database_error',
      error: error.message
    };
  }

  return { success: true, data };
}
```

**Update UI to Show Detailed Status:**

```tsx
{syncProgress && syncProgress.status === 'completed' && (
  <div className="text-xs space-y-1">
    <div className="text-green-600 dark:text-green-400">
      ✅ {syncProgress.synced} contacts imported
    </div>
    {syncProgress.failed > 0 && (
      <div className="text-yellow-600 dark:text-yellow-400">
        ⚠️ {syncProgress.skipped_no_email || 0} skipped (no email/phone)
      </div>
    )}
    {syncProgress.failed - (syncProgress.skipped_no_email || 0) > 0 && (
      <div className="text-red-600 dark:text-red-400">
        ❌ {syncProgress.failed - (syncProgress.skipped_no_email || 0)} failed
      </div>
    )}
  </div>
)}
```

**Estimated Time:** 2 hours

---

## Testing Plan

### Phase A: Unit Testing

1. **Auto-Sync Config:**
   - Create/read/update config
   - Verify next_sync_at calculation
   - Test scheduler trigger logic

2. **Bidirectional Sync:**
   - Create contact → pushed to Google
   - Update contact → updated in Google
   - Delete contact → (optional) removed from Google

3. **Auto-Labeling:**
   - Verify "Logos Vision" label created
   - Verify contacts added to label
   - Verify label persists

4. **Selective Import:**
   - Fetch preview with correct data
   - Import only selected contacts
   - Verify import success

5. **Incremental Sync:**
   - Test with sync_token
   - Verify only changed contacts fetched
   - Test initial sync (no token)

### Phase B: Integration Testing

1. **End-to-End Auto-Sync:**
   - Enable auto-sync
   - Wait for scheduled time
   - Verify sync executed
   - Check database updated

2. **Bidirectional Flow:**
   - Create contact in Logos Vision
   - Verify appears in Google Contacts
   - Update in Logos Vision
   - Verify updated in Google
   - Update in Google
   - Verify updated in Logos Vision (next sync)

3. **Selective Import:**
   - Open import modal
   - Preview contacts
   - Select subset
   - Import
   - Verify only selected imported

### Phase C: Performance Testing

1. **Large Dataset:**
   - Test with 1000+ contacts
   - Measure sync time
   - Verify no timeouts

2. **Incremental Sync:**
   - Initial sync: 1000 contacts
   - Change 10 contacts in Google
   - Run incremental sync
   - Verify only 10 fetched

---

## Timeline

| Enhancement | Estimated Time |
|-------------|----------------|
| 1. Auto-Sync Scheduler | 4 hours |
| 2. Bidirectional Sync | 5 hours |
| 3. Auto-Labeling | 2 hours |
| 4. Selective Import UI | 4 hours |
| 5. Incremental Sync | 3 hours |
| 6. Better Error Handling | 2 hours |
| **Testing & Debugging** | 4 hours |
| **Total** | **24 hours** (~3 days) |

---

## Deployment Checklist

### Pre-Deployment

- [ ] All enhancements tested locally
- [ ] Database migrations prepared
- [ ] Environment variables documented
- [ ] Rollback plan documented

### Deployment Steps

1. **Database Migrations:**
   ```sql
   -- Run in Pulse Supabase
   \i F:/pulse1/migrations/005_auto_sync_config.sql
   ```

2. **Deploy Pulse API:**
   - Update `F:\pulse1\server.js`
   - Restart Pulse server
   - Verify endpoints accessible

3. **Deploy Logos Vision CRM:**
   - Build production bundle
   - Deploy to hosting
   - Verify auto-sync UI appears

### Post-Deployment

- [ ] Test auto-sync configuration
- [ ] Test bidirectional sync
- [ ] Test selective import
- [ ] Monitor error logs
- [ ] Verify incremental sync working

---

## Success Criteria

### Functional Requirements

- ✅ Auto-sync runs every 24 hours (configurable)
- ✅ Users can enable/disable auto-sync
- ✅ Contacts created in Logos Vision appear in Google
- ✅ "Logos Vision" label automatically applied
- ✅ Users can preview and select contacts to import
- ✅ Incremental sync only fetches changed contacts
- ✅ Contacts without emails handled gracefully

### Performance Requirements

- ✅ Selective import loads in < 5 seconds
- ✅ Incremental sync 10x faster than full sync
- ✅ Bidirectional push completes in < 2 seconds per contact
- ✅ Auto-sync doesn't impact user experience

### User Experience

- ✅ Clear UI for auto-sync settings
- ✅ Detailed import status with counts
- ✅ Easy contact selection interface
- ✅ No data loss or duplication
- ✅ Smooth, intuitive workflows

---

## Next Steps

After Phase 4 completion:

1. **Phase 5: Analytics Dashboard** - Visualize sync metrics, contact growth
2. **Phase 6: Conflict Resolution** - Handle conflicts when same contact edited in both places
3. **Phase 7: Multi-Account Support** - Support multiple Google accounts
4. **Phase 8: Webhooks** - Real-time sync using Google push notifications

---

**Ready to Start?**

We can tackle these enhancements in order, or prioritize specific features. Which enhancement would you like to implement first?
