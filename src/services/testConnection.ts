// Connection Test - Run this to verify Supabase is working
// To run: Create a temporary button in your app that calls this function

import { testConnection } from './supabaseClient';
import { clientService } from './clientService';
import { projectService } from './projectService';
import { taskService } from './taskService';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  
  // Test 1: Basic connection
  console.log('\n1. Testing basic connection...');
  const connectionTest = await testConnection();
  console.log(connectionTest.success ? '✅ Connected!' : '❌ Connection failed:', connectionTest.message);
  
  if (!connectionTest.success) {
    return { success: false, error: 'Basic connection failed' };
  }

  // Test 2: Read clients
  console.log('\n2. Testing read clients...');
  try {
    const clients = await clientService.getAll();
    console.log(`✅ Successfully read ${clients.length} clients`);
  } catch (error) {
    console.log('❌ Failed to read clients:', error.message);
    return { success: false, error: 'Failed to read clients' };
  }

  // Test 3: Create a test client
  console.log('\n3. Testing create client...');
  try {
    const testClient = await clientService.create({
      name: 'Test Organization',
      contactPerson: 'Test Contact',
      email: 'test@example.com',
      phone: '555-0000',
      location: 'Test City',
      notes: 'This is a test client',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Successfully created test client:', testClient.id);

    // Test 4: Update the test client
    console.log('\n4. Testing update client...');
    const updatedClient = await clientService.update(testClient.id, {
      notes: 'Updated test notes'
    });
    console.log('✅ Successfully updated test client');

    // Test 5: Delete the test client
    console.log('\n5. Testing delete client...');
    await clientService.delete(testClient.id);
    console.log('✅ Successfully deleted test client');

  } catch (error) {
    console.log('❌ Failed CRUD operations:', error.message);
    return { success: false, error: 'Failed CRUD operations' };
  }

  console.log('\n🎉 ALL TESTS PASSED! Supabase is working correctly!');
  return { success: true };
}

// Quick test function you can call from console
export async function quickTest() {
  const result = await testSupabaseConnection();
  if (result.success) {
    alert('✅ Supabase connection successful!');
  } else {
    alert('❌ Supabase connection failed: ' + result.error);
  }
}
