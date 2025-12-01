// MASTER MIGRATION SCRIPT
// Runs all remaining migrations in the correct order
// Run this with: npx tsx --env-file=.env.local migrateAllRemaining.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const migrations = [
  { name: 'Projects & Tasks', file: 'migrateProjectsFixed.ts', description: 'Projects with tasks (with ID mapping)' },
  { name: 'Cases', file: 'migrateCases.ts', description: 'Client support cases' },
  { name: 'Donations', file: 'migrateDonations.ts', description: 'Fundraising donations' }
];

async function runMigration(file: string): Promise<{ success: boolean; output: string }> {
  try {
    const { stdout, stderr } = await execAsync(`npx tsx --env-file=.env.local ${file}`);
    return {
      success: true,
      output: stdout + (stderr || '')
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout + error.stderr
    };
  }
}

async function runAllMigrations() {
  console.log('╔' + '═'.repeat(70) + '╗');
  console.log('║' + ' '.repeat(15) + 'LOGOS VISION CRM - MASTER MIGRATION' + ' '.repeat(20) + '║');
  console.log('╚' + '═'.repeat(70) + '╝\n');
  
  console.log('📋 Migration Plan:');
  migrations.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} - ${m.description}`);
  });
  console.log('\n' + '─'.repeat(72) + '\n');

  const results: Array<{ name: string; success: boolean; output: string }> = [];

  for (const migration of migrations) {
    console.log(`\n${'='.repeat(72)}`);
    console.log(`🚀 Running: ${migration.name} Migration`);
    console.log('='.repeat(72) + '\n');

    const result = await runMigration(migration.file);
    results.push({
      name: migration.name,
      success: result.success,
      output: result.output
    });

    console.log(result.output);

    if (!result.success) {
      console.log(`\n⚠️  ${migration.name} migration encountered errors. Continuing with next migration...\n`);
    } else {
      console.log(`\n✅ ${migration.name} migration completed!\n`);
    }

    // Wait 2 seconds between migrations
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Print final summary
  console.log('\n' + '╔' + '═'.repeat(70) + '╗');
  console.log('║' + ' '.repeat(25) + 'FINAL SUMMARY' + ' '.repeat(32) + '║');
  console.log('╚' + '═'.repeat(70) + '╝\n');

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  });

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log('\n' + '─'.repeat(72));
  console.log(`📊 Completed ${successCount}/${totalCount} migrations successfully`);
  console.log('─'.repeat(72) + '\n');

  if (successCount === totalCount) {
    console.log('🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY! 🎉\n');
    console.log('✨ Your Supabase database is now fully populated!\n');
  } else {
    console.log('⚠️  Some migrations failed. Please review the errors above.\n');
  }
}

// Run all migrations
runAllMigrations().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
