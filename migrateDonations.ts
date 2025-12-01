// Migration Script: Donations to Supabase
// Run this with: npx tsx --env-file=.env.local migrateDonations.ts

// Load environment variables first
import { config } from 'dotenv';
const result = config({ path: '.env.local' });

// Debug: Check if env vars loaded
console.log('Environment check:');
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Found' : 'Missing');
console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
console.log('');

import { supabase } from './src/services/supabaseClient.ts';
import { mockDonations } from './src/data/mockData.ts';

async function migrateDonations() {
  console.log('🚀 Starting Donations migration...\n');

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

    console.log(`📊 Found ${clients?.length || 0} clients in Supabase`);

    // Prepare donations for insertion
    const donationsToInsert = mockDonations.map(donation => {
      // Try to find client ID
      let clientId = null;
      if (donation.clientId) {
        clientId = clientNameToId.get(donation.clientId.toLowerCase().trim());
      }

      return {
        client_id: clientId,
        donor_name: donation.donorName,
        donor_email: donation.donorEmail || null,
        amount: donation.amount,
        donation_date: donation.donationDate,
        payment_method: donation.paymentMethod || 'Credit Card',
        campaign: donation.campaign || null,
        is_recurring: donation.isRecurring || false,
        notes: donation.notes || null,
        tax_receipt_sent: false
      };
    });

    console.log(`\n📝 Prepared ${donationsToInsert.length} donations for migration`);

    if (donationsToInsert.length === 0) {
      console.log('⚠️  No donations to migrate!');
      return;
    }

    // Insert donations in batches of 50
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < donationsToInsert.length; i += batchSize) {
      const batch = donationsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('donations')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += data?.length || 0;
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Inserted ${data?.length} donations`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${successCount} donations`);
    console.log(`❌ Failed: ${errorCount} donations`);
    console.log(`💰 Total amount: $${donationsToInsert.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}`);
    console.log('='.repeat(50) + '\n');

    if (successCount > 0) {
      console.log('🎉 Donations migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDonations();
