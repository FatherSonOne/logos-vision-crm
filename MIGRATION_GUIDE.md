# MIGRATION GUIDE: From Mock Data to Supabase

## ✅ What You've Completed So Far

1. ✅ Supabase account created
2. ✅ Database schema created (14 tables)
3. ✅ Supabase client installed (`npm install @supabase/supabase-js`)
4. ✅ Service files created:
   - `supabaseClient.ts` - Connection handler
   - `clientService.ts` - Client operations
   - `projectService.ts` - Project operations
   - `taskService.ts` - Task operations
   - `testConnection.ts` - Test suite

---

## 🎯 Next Steps: Update Your App

### Step 1: Test the Connection First!

Before we migrate all the code, let's verify Supabase is working:

1. **Temporarily add this to your `App.tsx`** (at the top, after imports):

```typescript
import { testSupabaseConnection } from './services/testConnection';

// Add this inside your App component, before the return statement:
useEffect(() => {
  // Test connection on app load
  testSupabaseConnection();
}, []);
```

2. **Run your app**: `npm run dev`

3. **Open browser console** (F12) - you should see:
   ```
   🔍 Testing Supabase Connection...
   ✅ Connected!
   ✅ Successfully read 0 clients
   🎉 ALL TESTS PASSED!
   ```

**If you see errors:**
- Check your `.env.local` file has correct credentials
- Make sure you ran the SQL schema in Supabase
- Screenshot the error and share it with me

---

### Step 2: Update App.tsx - Phase 1 (Clients Only)

Let's start by migrating just CLIENTS to prove it works:

**FIND THIS CODE** in `App.tsx`:
```typescript
const [clients, setClients] = useState<Client[]>(mockClients);
```

**REPLACE IT WITH**:
```typescript
import { clientService } from './services/clientService';

const [clients, setClients] = useState<Client[]>([]);
const [isLoadingClients, setIsLoadingClients] = useState(true);

// Add this useEffect to load clients from Supabase
useEffect(() => {
  loadClients();
}, []);

async function loadClients() {
  try {
    setIsLoadingClients(true);
    const data = await clientService.getAll();
    setClients(data);
  } catch (error) {
    console.error('Error loading clients:', error);
    showToast('Failed to load clients', 'error');
  } finally {
    setIsLoadingClients(false);
  }
}
```

**Test it:**
1. Save the file
2. Refresh your browser
3. Your CRM should load (but with 0 clients since database is empty)
4. Try adding a client using the "Add Organization" button
5. Refresh - **the client should still be there!** 🎉

---

### Step 3: Seed Some Test Data

Your database is empty! Let's add some test data:

1. Go to Supabase → SQL Editor
2. Run this query:

```sql
-- Add test clients
INSERT INTO clients (name, contact_person, email, phone, location, notes)
VALUES 
  ('Hope Foundation', 'Sarah Johnson', 'sarah@hopefoundation.org', '555-0101', 'New York, NY', 'Focus on education'),
  ('Community Care', 'Michael Brown', 'michael@communitycare.org', '555-0102', 'Los Angeles, CA', 'Healthcare services'),
  ('Green Earth Initiative', 'Emma Davis', 'emma@greenearth.org', '555-0103', 'Seattle, WA', 'Environmental conservation');

-- Add test team members
INSERT INTO team_members (name, email, role, phone)
VALUES 
  ('Alice Johnson', 'alice@logosvision.com', 'Senior Consultant', '555-0201'),
  ('Bob Smith', 'bob@logosvision.com', 'Project Manager', '555-0202'),
  ('Carol White', 'carol@logosvision.com', 'Analyst', '555-0203');
```

3. Refresh your CRM - you should now see 3 clients!

---

### Step 4: Migrate Additional Data Types

Once clients are working, we can migrate other data types one by one:

**Priority Order:**
1. ✅ Clients (done!)
2. Projects
3. Tasks
4. Activities
5. Cases
6. (Others as needed)

**For each data type, follow the same pattern:**

```typescript
// 1. Import the service
import { projectService } from './services/projectService';

// 2. Change state initialization
const [projects, setProjects] = useState<Project[]>([]);

// 3. Add loading function
async function loadProjects() {
  try {
    const data = await projectService.getAll();
    setProjects(data);
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

// 4. Call it on mount
useEffect(() => {
  loadProjects();
}, []);
```

---

### Step 5: Update Create/Update/Delete Functions

**EXAMPLE: Update handleAddContact**

**BEFORE:**
```typescript
const handleAddContact = (client: Client) => {
  setClients([...clients, client]);
};
```

**AFTER:**
```typescript
const handleAddContact = async (client: Client) => {
  try {
    const newClient = await clientService.create(client);
    setClients([...clients, newClient]);
    showToast('Client added successfully!', 'success');
  } catch (error) {
    console.error('Error adding client:', error);
    showToast('Failed to add client', 'error');
  }
};
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after adding env variables

### "Failed to fetch"
- Check Supabase project is running
- Verify URL and API key are correct
- Check your internet connection

### "relation does not exist"
- You didn't run the SQL schema
- Go to Supabase SQL Editor and run `schema_simple.sql`

### Data not saving
- Open browser console (F12) for error messages
- Check Supabase Dashboard → Table Editor to see if data is there

---

## 🎯 Current Status Checklist

Track your progress:

- [ ] Connection test passed
- [ ] Clients migrated and working
- [ ] Test data added
- [ ] Can create new clients
- [ ] Can update clients
- [ ] Can delete clients
- [ ] Projects migrated
- [ ] Tasks migrated
- [ ] Other data types migrated

---

## 🆘 Need Help?

**Stuck?** Tell me:
1. Which step you're on
2. What error you're seeing (screenshot if possible)
3. What you've tried

I'm here to help you through each step!
