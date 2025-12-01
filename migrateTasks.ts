// Migration Script: Tasks to Supabase
// Run this with: npx tsx migrateTasks.ts

// Load environment variables first
import { config } from 'dotenv';
const result = config({ path: '.env.local' });

// Debug: Check if env vars loaded
console.log('Environment check:');
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Found' : 'Missing');
console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
console.log('');

import { supabase } from './src/services/supabaseClient.ts';
import { mockProjects } from './src/data/mockData.ts';

async function migrateTasks() {
  console.log('🚀 Starting Tasks migration...\n');

  try {
    // First, get all projects from Supabase to map old IDs to new IDs
    const { data: supabaseProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name');
    
    if (projectsError) {
      throw new Error(`Error fetching projects: ${projectsError.message}`);
    }

    if (!supabaseProjects || supabaseProjects.length === 0) {
      console.log('⚠️  No projects found in Supabase. Please migrate projects first!');
      return;
    }

    // Create a map of project names to IDs for matching
    const projectNameToId = new Map(
      supabaseProjects.map(p => [p.name.toLowerCase().trim(), p.id])
    );

    console.log(`📊 Found ${supabaseProjects.length} projects in Supabase`);

    // Get all team members for mapping
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, name');
    
    if (teamError) {
      throw new Error(`Error fetching team members: ${teamError.message}`);
    }

    const teamNameToId = new Map(
      teamMembers?.map(t => [t.name.toLowerCase().trim(), t.id]) || []
    );

    // Extract all tasks from mock projects
    let allTasks: any[] = [];
    let taskCount = 0;
    
    for (const project of mockProjects) {
      const projectId = projectNameToId.get(project.name.toLowerCase().trim());
      
      if (!projectId) {
        console.log(`⚠️  Skipping tasks for project "${project.name}" - not found in Supabase`);
        continue;
      }

      for (const task of project.tasks || []) {
        const teamMemberId = task.teamMemberId 
          ? teamNameToId.get(task.teamMemberId.toLowerCase().trim())
          : null;

        allTasks.push({
          project_id: projectId,
          description: task.description,
          team_member_id: teamMemberId,
          status: task.status,
          due_date: task.dueDate,
          completed_date: task.status === 'Done' ? task.dueDate : null,
          priority: 'Medium', // Default priority
          phase: task.phase || null,
          notes: task.notes || null,
          shared_with_client: task.sharedWithClient || false
        });
        taskCount++;
      }
    }

    console.log(`\n📝 Prepared ${taskCount} tasks for migration`);

    if (allTasks.length === 0) {
      console.log('⚠️  No tasks to migrate!');
      return;
    }

    // Insert tasks in batches of 50
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allTasks.length; i += batchSize) {
      const batch = allTasks.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += data?.length || 0;
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Inserted ${data?.length} tasks`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${successCount} tasks`);
    console.log(`❌ Failed: ${errorCount} tasks`);
    console.log('='.repeat(50) + '\n');

    if (successCount > 0) {
      console.log('🎉 Tasks migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateTasks();
