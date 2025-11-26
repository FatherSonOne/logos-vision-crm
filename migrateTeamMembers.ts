/**
 * Migrate Team Members - FRESH VERSION
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

import { mockTeamMembers } from './src/data/mockData.js';

async function migrate() {
  console.log('🚀 Migrating Team Members...\n');
  
  let successCount = 0;
  
  for (const tm of mockTeamMembers) {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert([{
          id: tm.id,
          name: tm.name,
          email: tm.email,
          role: tm.role,
          phone: tm.phone || null,
          is_active: true
        }]);
      
      if (error) throw error;
      console.log(`  ✅ ${tm.name} (${tm.role})`);
      successCount++;
    } catch (error: any) {
      console.error(`  ❌ ${tm.name}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ Migrated: ${successCount}/${mockTeamMembers.length}\n`);
}

migrate().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
