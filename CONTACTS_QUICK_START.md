# Contacts Redesign - Quick Start Guide

**Get up and running with the new Contacts UI in 5 minutes**

---

## Installation

### 1. Install Dependencies

```bash
npm install react-window
npm install --save-dev @types/react-window
```

### 2. Verify Files Created

All files should be in place:

```
src/
├── components/contacts/
│   ├── ContactsPage.tsx
│   ├── ContactCardGallery.tsx
│   ├── ContactCard.tsx
│   ├── RelationshipScoreCircle.tsx
│   ├── TrendIndicator.tsx
│   ├── ContactStoryView.tsx
│   ├── RecentActivityFeed.tsx
│   ├── SentimentBadge.tsx
│   ├── ContactSearch.tsx
│   ├── ContactFilters.tsx
│   └── index.ts
├── styles/
│   └── contacts.css
└── types.ts (updated)

index.css (updated with import)
```

---

## Integration

### Option A: Add to Existing App.tsx

```tsx
// In App.tsx
import { ContactsPage } from './components/contacts';

// Add route:
<Route path="/contacts-new" element={<ContactsPage />} />
```

### Option B: Standalone Test Page

Create `test-contacts.tsx`:

```tsx
import React from 'react';
import { ContactsPage } from './components/contacts';

export function TestContactsPage() {
  return <ContactsPage />;
}
```

Then visit `/test-contacts` in your browser.

---

## Quick Test

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Contacts**
   - Visit `http://localhost:5173/contacts-new`

3. **Verify Everything Works**
   - ✅ 6 mock contacts display in grid
   - ✅ Search bar filters results
   - ✅ Filters dropdown opens
   - ✅ Click card → detail view opens
   - ✅ Back button returns to gallery
   - ✅ Hover effects work

---

## Using Components

### Import Individual Components

```tsx
import {
  ContactCard,
  RelationshipScoreCircle,
  TrendIndicator,
  ContactStoryView,
  SentimentBadge
} from './components/contacts';
```

### Use in Your Own Pages

```tsx
// Example: Show relationship score in profile
<RelationshipScoreCircle score={92} size="lg" />

// Example: Show trend badge
<TrendIndicator trend="rising" />

// Example: Display sentiment
<SentimentBadge score={0.7} />
```

---

## Customization

### Change Mock Data

Edit `ContactsPage.tsx`, find the `mockContacts` array (line ~60):

```tsx
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Your Contact',
    email: 'contact@example.com',
    relationship_score: 95,
    relationship_trend: 'rising',
    // ... more fields
  }
];
```

### Adjust Colors

Edit `src/styles/contacts.css`:

```css
/* Change relationship health colors */
.relationship-strong {
  @apply border-green-500 text-green-500;
}
```

### Modify Grid Columns

Edit `ContactCardGallery.tsx`, adjust breakpoints:

```tsx
const columnCount = useMemo(() => {
  if (window.innerWidth >= 1536) return 4; // Change to 5 for more columns
  if (window.innerWidth >= 1280) return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
}, []);
```

---

## Connect to Real API

### Step 1: Create Contact Service

Create `src/services/contactService.ts`:

```tsx
import { Contact } from '../types';

class ContactService {
  async getAll(): Promise<Contact[]> {
    // Replace with your actual API call
    const response = await fetch('/api/contacts');
    return response.json();
  }

  async getById(id: string): Promise<Contact> {
    const response = await fetch(`/api/contacts/${id}`);
    return response.json();
  }

  async getRecentInteractions(contactId: string, options?: any) {
    const response = await fetch(`/api/contacts/${contactId}/interactions`);
    return response.json();
  }
}

export const contactService = new ContactService();
```

### Step 2: Update ContactsPage.tsx

Replace mock data fetch:

```tsx
// Change this:
const mockContacts: Contact[] = [ ... ];
setContacts(mockContacts);

// To this:
const data = await contactService.getAll();
setContacts(data);
```

### Step 3: Create Pulse Service (for AI Insights)

Create `src/services/pulseContactService.ts`:

```tsx
class PulseContactService {
  async getAIInsights(pulseProfileId: string) {
    const response = await fetch(
      `${process.env.PULSE_API_URL}/api/contacts/${pulseProfileId}/ai-insights`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PULSE_API_KEY}`
        }
      }
    );
    return response.json();
  }
}

export const pulseContactService = new PulseContactService();
```

### Step 4: Update ContactStoryView.tsx

Replace mock AI insights:

```tsx
// Import service at top
import { pulseContactService } from '../../services/pulseContactService';

// In loadEnrichment():
if (contact.pulse_profile_id) {
  const insights = await pulseContactService.getAIInsights(
    contact.pulse_profile_id
  );
  setAiInsights(insights);
}
```

---

## Styling Reference

### Badge Classes

```tsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>
```

### Button Classes

```tsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-success">Success Button</button>
<button className="btn btn-sm btn-primary">Small Button</button>
```

### Relationship Health Classes

```tsx
<div className="relationship-strong">Strong (85-100)</div>
<div className="relationship-good">Good (70-84)</div>
<div className="relationship-moderate">Moderate (50-69)</div>
<div className="relationship-atrisk">At Risk (30-49)</div>
<div className="relationship-dormant">Dormant (0-29)</div>
```

---

## Troubleshooting

### Issue: Components Don't Render

**Solution:** Check imports

```tsx
// Make sure you're importing from the correct path:
import { ContactsPage } from './components/contacts';
// NOT from './components/contacts/ContactsPage'
```

### Issue: Styles Not Applied

**Solution:** Verify CSS import in `index.css`:

```css
@import './src/styles/contacts.css';
```

### Issue: TypeScript Errors on Contact Type

**Solution:** Ensure types.ts has Pulse fields:

```tsx
export interface Contact {
  // ... existing fields ...
  pulse_profile_id?: string | null;
  relationship_score?: number | null;
  relationship_trend?: 'rising' | 'stable' | 'falling' | 'new' | 'dormant' | null;
  // ... other Pulse fields ...
}
```

### Issue: Virtual Scrolling Not Working

**Solution:** Install react-window:

```bash
npm install react-window @types/react-window
```

### Issue: Card Hover Effects Not Showing

**Solution:** Ensure parent has `group` class:

```tsx
<div className="contact-card group">
  {/* Quick actions will show on hover */}
  <div className="card-actions opacity-0 group-hover:opacity-100">
    ...
  </div>
</div>
```

---

## Performance Tips

1. **Virtual Scrolling:** Already implemented with react-window
2. **Lazy Loading:** Import ContactsPage with React.lazy() if needed
3. **Memoization:** Wrap ContactCard in React.memo() for large lists
4. **Debouncing:** Search already has 300ms debounce (can adjust)

---

## Common Tasks

### Add New Contact Field

1. Update Contact interface in `types.ts`
2. Display in ContactCard or ContactStoryView
3. Update mock data for testing

### Change Card Layout

Edit `ContactCard.tsx`:

```tsx
// Rearrange JSX sections
<div className="contact-card">
  {/* Move sections around */}
  <div className="donor-info">...</div>
  <div className="communication-stats">...</div>
  <div className="relationship-header">...</div>
</div>
```

### Add New Filter

Edit `ContactFilters.tsx`:

```tsx
<div className="mb-4">
  <label>New Filter</label>
  <select
    value={filters.newFilter}
    onChange={(e) => onChange({ ...filters, newFilter: e.target.value })}
  >
    <option value="all">All</option>
    <option value="option1">Option 1</option>
  </select>
</div>
```

### Customize Empty State

Edit `ContactCardGallery.tsx`:

```tsx
if (contacts.length === 0) {
  return (
    <div className="text-center py-24">
      <h3 className="text-2xl text-white mb-2">Your Custom Message</h3>
      <p className="text-gray-400">Your custom description</p>
      <button className="btn btn-primary mt-4">Add Your First Contact</button>
    </div>
  );
}
```

---

## Best Practices

1. **Always Use TypeScript Types**
   ```tsx
   const contact: Contact = { ... };
   ```

2. **Handle Loading & Error States**
   ```tsx
   if (loading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Optimize Images**
   ```tsx
   <img loading="lazy" alt="..." />
   ```

4. **Test Responsiveness**
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1280px

5. **Accessibility First**
   ```tsx
   <button aria-label="Close dialog">
     <CloseIcon />
   </button>
   ```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Integrate into your app
3. ✅ Test with mock data
4. ✅ Verify all features work
5. 🔄 Connect to real API
6. 🔄 Implement Phase 2 (Priorities Feed)

---

## Need Help?

Refer to these documents:

- **Full Implementation:** `CONTACTS_PHASE_1_IMPLEMENTATION_COMPLETE.md`
- **Visual Checklist:** `CONTACTS_VISUAL_CHECKLIST.md`
- **Backend Integration:** `PULSE_LV_CONTACTS_INTEGRATION_PLAN.md`
- **UI Components:** `CONTACTS_UI_IMPLEMENTATION_PLAN.md`

---

**Quick Start Version:** 1.0
**Last Updated:** January 25, 2026
**Ready to Use:** ✅ Yes
