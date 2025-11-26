/**
 * Migrate Volunteers to Supabase
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

import { mockVolunteers, mockClients } from './src/data/mockData.js';

async function migrateVolunteers() {
  console.log('🚀 Migrating Volunteers...\n');
  
  // Get existing clients to map IDs
  const { data: clients } = await supabase.from('clients').select('id, name');
  const clientMap = new Map(clients?.map(c => [c.name, c.id]) || []);
  
  // Also create a map of old client IDs to new UUIDs
  const oldClientIdMap = new Map<string, string>();
  for (const mockClient of mockClients) {
    const newId = clientMap.get(mockClient.name);
    if (newId) {
      oldClientIdMap.set(mockClient.id, newId);
    }
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const volunteer of mockVolunteers) {
    try {
      // Map old client IDs to new UUIDs
      const clientId = volunteer.assignedClientIds && volunteer.assignedClientIds.length > 0
        ? oldClientIdMap.get(volunteer.assignedClientIds[0]) || null
        : null;
      
      // Store location and availability in notes
      const notes = [
        volunteer.location ? `Location: ${volunteer.location}` : '',
        volunteer.availability ? `Availability: ${volunteer.availability}` : ''
      ].filter(Boolean).join('\n');
      
      const { error } = await supabase
        .from('volunteers')
        .insert([{
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          skills: volunteer.skills || [],
          client_id: clientId,
          status: 'Active',
          notes: notes || null
        }]);
      
      if (error) throw error;
      console.log(`  ✅ ${volunteer.name} (${volunteer.skills?.join(', ') || 'No skills listed'})`);
      successCount++;
    } catch (error: any) {
      console.error(`  ❌ ${volunteer.name}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n✨ Volunteers: ${successCount}/${mockVolunteers.length} migrated`);
  console.log(`❌ Errors: ${errorCount}\n`);
  
  if (successCount > 0) {
    console.log('💡 Note: Location and availability stored in notes field');
    console.log('💡 Note: Only first assigned client was migrated to client_id');
  }
}

migrateVolunteers()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
