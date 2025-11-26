/**
 * Migrate ONLY Activities
 * Run this after clients and projects are already migrated
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
const envFile = readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) return;
  
  const [key, ...valueParts] = trimmedLine.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim();
    if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value;
    if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value;
  }
});

const supabase = createClient(supabaseUrl, supabaseKey);

import { mockActivities } from './src/data/mockData.js';

async function migrateActivities() {
  console.log('🚀 Migrating Activities...\n');
  
  // Get existing clients and projects to map IDs
  const { data: clients } = await supabase.from('clients').select('id, name');
  const { data: projects } = await supabase.from('projects').select('id, name');
  
  // Create name-based lookup (since we don't have old IDs)
  const clientMap = new Map(clients?.map(c => [c.name, c.id]) || []);
  const projectMap = new Map(projects?.map(p => [p.name, p.id]) || []);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const activity of mockActivities) {
    try {
      // Try to match by project name if projectId exists
      let projectId = null;
      if (activity.projectId) {
        // Find project by old ID in mock data
        const { mockProjects } = await import('./src/data/mockData.js');
        const mockProject = mockProjects.find(p => p.id === activity.projectId);
        if (mockProject) {
          projectId = projectMap.get(mockProject.name) || null;
        }
      }
      
      // Try to match by client name if clientId exists
      let clientId = null;
      if (activity.clientId) {
        const { mockClients } = await import('./src/data/mockData.js');
        const mockClient = mockClients.find(c => c.id === activity.clientId);
        if (mockClient) {
          clientId = clientMap.get(mockClient.name) || null;
        }
      }
      
      const { error } = await supabase
        .from('activities')
        .insert([{
          type: activity.type,
          title: activity.title,
          project_id: projectId,
          client_id: clientId,
          activity_date: activity.activityDate,
          status: activity.status,
          created_by_id: null,
          shared_with_client: activity.sharedWithClient || false
        }]);
      
      if (error) throw error;
      console.log(`  ✅ ${activity.title}`);
      successCount++;
    } catch (error: any) {
      console.error(`  ❌ ${activity.title}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n✨ Activities: ${successCount}/${mockActivities.length} migrated`);
  console.log(`❌ Errors: ${errorCount}`);
}

migrateActivities()
  .then(() => {
    console.log('\n✨ Done! Run "npm run dev" to see your data!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
