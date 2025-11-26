# CONNECTING YOUR CRM TO SUPABASE

## Step 1: Install Supabase Client

Open Command Prompt in your project folder and run:

```cmd
cd /d "C:\Users\Aegis{FM}\OneDrive\Documents\logos-vision-crm"
npm install @supabase/supabase-js
```

## Step 2: Add Supabase Credentials to .env.local

Open your `.env.local` file and add these lines:

```
GEMINI_API_KEY=your_gemini_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to find these values:**
1. Go to your Supabase project
2. Click "Settings" (gear icon) → "API"
3. Copy:
   - Project URL → goes in VITE_SUPABASE_URL
   - Project API Key (anon, public) → goes in VITE_SUPABASE_ANON_KEY

## Step 3: Create Supabase Client Config

I'll create this file for you automatically: `src/services/supabaseClient.ts`

This file will handle all database connections.

## Step 4: Update Your Data Services

I'll help you create new service files that use Supabase instead of mock data:
- `src/services/clientService.ts` - for clients
- `src/services/projectService.ts` - for projects
- `src/services/taskService.ts` - for tasks
- etc.

## What Changes?

**BEFORE (Mock Data):**
```typescript
const [clients, setClients] = useState<Client[]>(mockClients);
```

**AFTER (Supabase):**
```typescript
const [clients, setClients] = useState<Client[]>([]);

useEffect(() => {
  loadClients();
}, []);

async function loadClients() {
  const data = await clientService.getAll();
  setClients(data);
}
```

---

## Ready?

Complete these steps:
1. ✅ Create Supabase account
2. ✅ Run the SQL schema in Supabase
3. ⏳ Install Supabase client (npm install)
4. ⏳ Add credentials to .env.local

Once you've done steps 3 & 4, I'll help you update the code!
