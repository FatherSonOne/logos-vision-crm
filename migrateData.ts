/**
 * ONE-TIME DATA MIGRATION SCRIPT
 * Migrates mock data to Supabase with proper UUID handling
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('✅ Loaded Supabase credentials\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Import mock data
import { mockClients, mockProjects, mockActivities } from './src/data/mockData.js';

async function migrateData() {
  console.log('🚀 Starting Supabase migration...\n');
  
  let totalSuccess = 0;
  let totalErrors = 0;
  
  // Maps to track old ID -> new UUID
  const clientIdMap = new Map();
  const projectIdMap = new Map();
  
  // ========================================
  // STEP 1: Migrate Clients
  // ========================================
  console.log('📋 Migrating Clients...');
  let successCount = 0;
  
  for (const client of mockClients) {
    try {
      // Don't pass id - let Supabase generate UUID
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: client.name,
          contact_person: client.contactPerson,
          email: client.email,
          phone: client.phone,
          location: client.location,
          notes: client.notes || '',
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Map old ID to new UUID
      clientIdMap.set(client.id, data.id);
      
      console.log(`  ✅ ${client.name}`);
      successCount++;
      totalSuccess++;
    } catch (error: any) {
      console.error(`  ❌ ${client.name}: ${error.message}`);
      totalErrors++;
    }
  }
  console.log(`\n✨ Clients: ${successCount}/${mockClients.length} migrated\n`);
  
  // ========================================
  // STEP 2: Migrate Projects
  // ========================================
  console.log('📁 Migrating Projects...');
  successCount = 0;
  
  for (const project of mockProjects) {
    try {
      // Map old client ID to new UUID
      const newClientId = clientIdMap.get(project.clientId);
      if (!newClientId) {
        throw new Error(`Client ID ${project.clientId} not found in mapping`);
      }
      
      // Insert project without 'notes' field and without id
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: project.name,
          description: project.description,
          client_id: newClientId,
          status: project.status,
          start_date: project.startDate,
          end_date: project.endDate
        }])
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Map old project ID to new UUID
      projectIdMap.set(project.id, projectData.id);
      
      // Insert tasks for this project
      if (project.tasks && project.tasks.length > 0) {
        const tasksToInsert = project.tasks.map(task => ({
          project_id: projectData.id,
          description: task.description,
          team_member_id: null, // No team members migrated yet
          status: task.status,
          due_date: task.dueDate,
          shared_with_client: task.sharedWithClient || false,
          phase: task.phase
        }));
        
        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksToInsert);
        
        if (tasksError) {
          console.error(`    ⚠️  Tasks error: ${tasksError.message}`);
        }
      }
      
      console.log(`  ✅ ${project.name} (${project.tasks?.length || 0} tasks)`);
      successCount++;
      totalSuccess++;
    } catch (error: any) {
      console.error(`  ❌ ${project.name}: ${error.message}`);
      totalErrors++;
    }
  }
  console.log(`\n✨ Projects: ${successCount}/${mockProjects.length} migrated\n`);
  
  // ========================================
  // STEP 3: Migrate Activities
  // ========================================
  console.log('📅 Migrating Activities...');
  successCount = 0;
  
  for (const activity of mockActivities) {
    try {
      // Map old IDs to new UUIDs
      const newClientId = activity.clientId ? clientIdMap.get(activity.clientId) : null;
      const newProjectId = activity.projectId ? projectIdMap.get(activity.projectId) : null;
      
      // Don't include notes - it doesn't exist in actual schema
      const { error } = await supabase
        .from('activities')
        .insert([{
          type: activity.type,
          title: activity.title,
          project_id: newProjectId,
          client_id: newClientId,
          activity_date: activity.activityDate,
          status: activity.status,
          created_by_id: null, // No team members migrated yet
          shared_with_client: activity.sharedWithClient || false
        }]);
      
      if (error) throw error;
      console.log(`  ✅ ${activity.title}`);
      successCount++;
      totalSuccess++;
    } catch (error: any) {
      console.error(`  ❌ ${activity.title}: ${error.message}`);
      totalErrors++;
    }
  }
  console.log(`\n✨ Activities: ${successCount}/${mockActivities.length} migrated\n`);
  
  // ========================================
  // FINAL SUMMARY
  // ========================================
  console.log('='.repeat(50));
  console.log('🎉 MIGRATION COMPLETE!');
  console.log('='.repeat(50));
  console.log(`✅ Total Success: ${totalSuccess}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log('\n💡 Next: Run "npm run dev" to see your data!');
  console.log('\n📝 Note: Team member assignments were not migrated.');
  console.log('   You can assign team members through the UI.');
}

// Run migration
migrateData()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
