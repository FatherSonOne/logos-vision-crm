/**
 * Check what columns exist in team_members table
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

async function checkSchema() {
  console.log('🔍 Testing team_members table...\n');
  
  // Try inserting with minimal fields
  console.log('Test 1: Minimal fields (name, email, role)');
  const { data: test1, error: error1 } = await supabase
    .from('team_members')
    .insert([{
      name: 'Test User',
      email: 'test@example.com',
      role: 'Tester'
    }])
    .select();
  
  if (error1) {
    console.log('❌ Error:', error1.message);
  } else {
    console.log('✅ Success! Inserted:', test1);
    
    // Delete the test record
    await supabase.from('team_members').delete().eq('email', 'test@example.com');
    console.log('🗑️  Cleaned up test record\n');
  }
}

checkSchema()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
