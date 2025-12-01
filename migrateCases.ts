// Migration Script: Cases to Supabase
// Run this with: npx tsx --env-file=.env.local migrateCases.ts

// Load environment variables first
import { config } from 'dotenv';
const result = config({ path: '.env.local' });

// Debug: Check if env vars loaded
console.log('Environment check:');
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Found' : 'Missing');
console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
console.log('');

import { supabase } from './src/services/supabaseClient.ts';
import { mockCases } from './src/data/mockData.ts';

async function migrateCases() {
  console.log('🚀 Starting Cases migration...\n');

  try {
    // Get all clients from Supabase
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name');
    
    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }

    const clientNameToId = new Map(
      clients?.map(c => [c.name.toLowerCase().trim(), c.id]) || []
    );

    // Get all team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, name');
    
    if (teamError) {
      throw new Error(`Error fetching team members: ${teamError.message}`);
    }

    const teamNameToId = new Map(
      teamMembers?.map(t => [t.name.toLowerCase().trim(), t.id]) || []
    );

    console.log(`📊 Found ${clients?.length || 0} clients and ${teamMembers?.length || 0} team members`);

    // Prepare cases for insertion
    const casesToInsert = mockCases.map(caseItem => {
      // Try to find client ID
      let clientId = null;
      if (caseItem.clientId) {
        // Search for client by name in the clientId field (it might be a name)
        clientId = clientNameToId.get(caseItem.clientId.toLowerCase().trim());
      }

      // Try to find assigned team member
      let assignedToId = null;
      if (caseItem.assignedToId) {
        assignedToId = teamNameToId.get(caseItem.assignedToId.toLowerCase().trim());
      }

      return {
        title: caseItem.title,
        description: caseItem.description,
        client_id: clientId,
        assigned_to_id: assignedToId,
        status: caseItem.status,
        priority: caseItem.priority || 'Medium',
        category: null, // Add if you have category in your mock data
        opened_date: caseItem.createdAt || new Date().toISOString().split('T')[0],
        closed_date: caseItem.status === 'Closed' ? caseItem.lastUpdatedAt : null,
        resolution: null
      };
    });

    console.log(`\n📝 Prepared ${casesToInsert.length} cases for migration`);

    if (casesToInsert.length === 0) {
      console.log('⚠️  No cases to migrate!');
      return;
    }

    // Insert cases
    const { data, error } = await supabase
      .from('cases')
      .insert(casesToInsert)
      .select();

    if (error) {
      throw new Error(`Error inserting cases: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${data?.length || 0} cases`);
    console.log('='.repeat(50) + '\n');
    console.log('🎉 Cases migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateCases();
