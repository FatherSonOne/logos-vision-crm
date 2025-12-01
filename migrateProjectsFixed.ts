// Migration Script: Projects with ID Mapping
// This script properly maps mock client IDs to real Supabase UUIDs
// Run this with: npx tsx --env-file=.env.local migrateProjectsFixed.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { supabase } from './src/services/supabaseClient';
import { mockProjects } from './src/data/mockData';

async function migrateProjects() {
  console.log('🚀 Starting Projects migration with ID mapping...\n');

  try {
    // Step 1: Get all clients from Supabase and mock data to create ID mapping
    const { data: supabaseClients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name');
    
    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }

    if (!supabaseClients || supabaseClients.length === 0) {
      console.log('⚠️  No clients found in Supabase. Please migrate clients first!');
      return;
    }

    console.log(`✅ Found ${supabaseClients.length} clients in Supabase\n`);

    // Import mock clients to get the name-to-mockID mapping
    const { mockClients } = await import('./src/data/mockData');
    
    // Create a mapping from mock client IDs to real Supabase UUIDs by matching names
    const clientIdMap = new Map();

    for (const mockClient of mockClients) {
      // Find the Supabase client with the same name
      const supabaseClient = supabaseClients.find(sc => sc.name === mockClient.name);
      if (supabaseClient) {
        clientIdMap.set(mockClient.id, supabaseClient.id);
        console.log(`🔗 Mapped "${mockClient.name}": ${mockClient.id} → ${supabaseClient.id}`);
      }
    }

    console.log(`\n📋 Created ID mapping for ${clientIdMap.size} clients\n`);

    // Step 2: Migrate projects with mapped client IDs
    console.log('📁 Migrating Projects...\n');
    let projectsCreated = 0;
    let projectsSkipped = 0;
    let projectsFailed = 0;

    for (const project of mockProjects) {
      // Map the old client ID to the new UUID
      const mappedClientId = clientIdMap.get(project.clientId);
      
      if (!mappedClientId) {
        console.log(`⏭️  Skipping project "${project.name}" - client not found in mapping`);
        projectsSkipped++;
        continue;
      }

      // Prepare project data with mapped ID
      const projectData = {
        name: project.name,
        description: project.description || null,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate || null,
        budget: project.budget || null,
        client_id: mappedClientId,  // Use the mapped UUID
        notes: project.notes || null
      };

      try {
        // Insert the project
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();

        if (projectError) {
          console.error(`❌ Failed to create project "${project.name}":`, projectError.message);
          projectsFailed++;
          continue;
        }

        console.log(`✅ Created project: ${project.name}`);
        projectsCreated++;

        // Insert tasks for this project
        if (project.tasks && project.tasks.length > 0) {
          const tasksData = project.tasks.map(task => ({
            title: task.title,
            description: task.description || null,
            status: task.status,
            due_date: task.dueDate || null,
            project_id: newProject.id,
            assigned_to_id: null  // We'll handle team member mapping later if needed
          }));

          const { error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksData);

          if (tasksError) {
            console.log(`   ⚠️  Failed to create ${project.tasks.length} tasks: ${tasksError.message}`);
          } else {
            console.log(`   ✅ Created ${project.tasks.length} tasks`);
          }
        }

      } catch (error: any) {
        console.error(`❌ Error creating project "${project.name}":`, error.message);
        projectsFailed++;
      }
    }

    // Final Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Successfully created: ${projectsCreated} projects`);
    console.log(`⏭️  Skipped: ${projectsSkipped} projects`);
    console.log(`❌ Failed: ${projectsFailed} projects`);
    console.log('═'.repeat(60) + '\n');

    if (projectsCreated > 0) {
      console.log('🎉 Migration completed! Your projects are now in Supabase.');
    }

  } catch (error: any) {
    console.error('💥 Migration failed:', error.message);
    throw error;
  }
}

// Run the migration
migrateProjects()
  .then(() => {
    console.log('\n✨ Migration script finished.');
  })
  .catch((error) => {
    console.error('\n❌ Migration script encountered an error');
    process.exit(1);
  });
