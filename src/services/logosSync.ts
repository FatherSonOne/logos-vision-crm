const SUPABASE_URL = 'https://ucaeuszgoihoyrvhewxk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYWV1c3pnb2lob3lydmhld3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjg5ODYsImV4cCI6MjA4MDgwNDk4Nn0.0VGjpsPBYjyk6QTG5rAQX4_NcpfBTyR85ofE5jiHTKo';

export async function syncProjectToChannel(project: any) {
  console.log(`🔄 Syncing "${project.name}"...`);
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/logos_projects`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      client_id: project.clientId,
      start_date: project.startDate,
      due_date: project.endDate,
      synced_at: new Date().toISOString(),
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const result = await response.json();
  console.log(`✅ Synced!`);
  return result[0]?.id || project.id;
}

export async function syncClientToContact(client: any) {
  console.log(`🔄 Syncing client "${client.name}"...`);
  
  const nameParts = (client.contactPerson || '').split(' ');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/logos_contacts`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      id: client.id,
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' '),
      email: client.email,
      phone: client.phone,
      company: client.location,
      synced_at: new Date().toISOString(),
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const result = await response.json();
  console.log(`✅ Contact synced!`);
  return result[0]?.id || client.id;
}

export async function syncAll(projects: any[], clients: any[], cases: any[], tasks: any[], activities: any[]) {
  console.log('🚀 Syncing all...');
  let synced = 0;
  
  for (const client of clients) {
    try {
      await syncClientToContact(client);
      synced++;
    } catch (e) {
      console.error('Failed:', e);
    }
  }

  for (const project of projects) {
    try {
      await syncProjectToChannel(project);
      synced++;
    } catch (e) {
      console.error('Failed:', e);
    }
  }

  console.log(`✅ Synced ${synced} items`);
  return { synced };
}
