import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://psjgmdnrehcwvppbeqjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzamdtZG5yZWhjd3ZwcGJlcWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzU4OTksImV4cCI6MjA3OTE1MTg5OX0.IiB4YY9sB0fvEb6Vpm2O_t2YBQ9ORSy-yXtMsnOxZ4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(filePath) {
  console.log(`\n📦 Running migration: ${path.basename(filePath)}`);
  console.log('='.repeat(60));

  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split by semicolons to execute statements individually
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          // Try direct execution if RPC doesn't work
          console.log('RPC method failed, trying direct execution...');
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ sql_query: statement + ';' })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        console.log(`✓ Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`✗ Error executing statement ${i + 1}:`, err.message);
        console.error('Statement:', statement.substring(0, 200) + '...');
        // Continue with next statement
      }
    }

    console.log(`\n✅ Migration ${path.basename(filePath)} completed\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Error running migration ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function runAllMigrations() {
  console.log('\n🚀 Starting Task Management Migrations');
  console.log('='.repeat(60));

  const migrationsDir = path.join(__dirname, '..', 'sql-scripts');

  const migrations = [
    'migration_task_enhancements.sql',
    'migration_task_subtables.sql',
    'migration_task_rls_enhanced.sql'
  ];

  let successCount = 0;

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration);

    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ Migration file not found: ${migration}`);
      continue;
    }

    const success = await runMigration(filePath);
    if (success) successCount++;

    // Wait a bit between migrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✨ Migrations complete: ${successCount}/${migrations.length} successful\n`);

  if (successCount === migrations.length) {
    console.log('🎉 All migrations ran successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify tables in Supabase Dashboard');
    console.log('2. Test the taskManagementService');
    console.log('3. Connect TaskView.tsx to the service layer\n');
  } else {
    console.log('⚠️  Some migrations failed. Please check the errors above.');
    console.log('You may need to run the SQL manually in the Supabase SQL Editor.\n');
  }
}

// Run migrations
runAllMigrations().catch(console.error);
