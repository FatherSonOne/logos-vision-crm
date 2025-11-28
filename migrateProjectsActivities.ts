// Migration Script: Populate Supabase with Sample Projects and Activities
// Run this with: npx tsx migrateProjectsActivities.ts

import { projectService } from './src/services/projectService';
import { activityService } from './src/services/activityService';
import { mockProjects, mockActivities } from './src/data/mockData';

async function migrateProjectsAndActivities() {
  console.log('🚀 Starting migration of Projects and Activities to Supabase...\n');

  // Migrate Projects (with their tasks)
  console.log('📁 Migrating Projects...');
  let projectsCreated = 0;
  let projectsFailed = 0;

  for (const project of mockProjects) {
    try {
      await projectService.create(project);
      console.log(`✅ Created project: ${project.name} (${project.tasks.length} tasks)`);
      projectsCreated++;
    } catch (error: any) {
      console.error(`❌ Failed to create project ${project.name}:`, error.message);
      projectsFailed++;
    }
  }

  console.log(`\n📊 Projects Summary: ${projectsCreated} created, ${projectsFailed} failed\n`);

  // Migrate Activities
  console.log('📝 Migrating Activities...');
  let activitiesCreated = 0;
  let activitiesFailed = 0;

  for (const activity of mockActivities) {
    try {
      await activityService.create(activity);
      console.log(`✅ Created activity: ${activity.title}`);
      activitiesCreated++;
    } catch (error: any) {
      console.error(`❌ Failed to create activity ${activity.title}:`, error.message);
      activitiesFailed++;
    }
  }

  console.log(`\n📊 Activities Summary: ${activitiesCreated} created, ${activitiesFailed} failed\n`);

  // Final Summary
  console.log('═══════════════════════════════════════');
  console.log('🎉 Migration Complete!');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Projects:   ${projectsCreated}/${mockProjects.length}`);
  console.log(`✅ Activities: ${activitiesCreated}/${mockActivities.length}`);
  console.log('═══════════════════════════════════════\n');

  if (projectsFailed > 0 || activitiesFailed > 0) {
    console.log('⚠️  Some items failed to migrate. Check errors above.');
  } else {
    console.log('🎊 All data migrated successfully!');
    console.log('\n💡 Refresh your CRM to see the data!');
  }
}

// Run the migration
migrateProjectsAndActivities()
  .then(() => {
    console.log('\n✨ Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
