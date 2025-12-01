import React, { useState } from 'react';
import { supabase } from './services/supabaseClient';
import { clientService } from './services/clientService';

export const SupabaseTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (msg: string, isError = false) => {
    const emoji = isError ? '❌' : '✅';
    setResults(prev => [...prev, `${emoji} ${msg}`]);
    console.log(`${emoji} ${msg}`);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    addResult('Starting Supabase tests...');
    
    // Test 1: Check environment variables
    addResult('--- Checking Environment Variables ---');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url) addResult('VITE_SUPABASE_URL missing!', true);
    else addResult('VITE_SUPABASE_URL found');
    
    if (!key) addResult('VITE_SUPABASE_ANON_KEY missing!', true);
    else addResult('VITE_SUPABASE_ANON_KEY found');
    
    if (!url || !key) {
      addResult('FAILED: Fix .env.local and restart server', true);
      setIsRunning(false);
      return;
    }

    // Test 2: Test basic connection
    addResult('--- Testing Connection ---');
    try {
      const { error } = await supabase.from('clients').select('count');
      if (error) throw error;
      addResult('Successfully connected to Supabase!');
    } catch (err: any) {
      addResult(`Connection failed: ${err.message}`, true);
      setIsRunning(false);
      return;
    }

    // Test 3: Try to read clients
    addResult('--- Testing Read Operation ---');
    try {
      const clients = await clientService.getAll();
      addResult(`Successfully read ${clients.length} clients from database`);
      if (clients.length > 0) {
        addResult(`Sample client: ${clients[0].name}`);
      }
    } catch (err: any) {
      addResult(`Read failed: ${err.message}`, true);
    }

    // Test 4: Try to create and delete
    addResult('--- Testing Create & Delete ---');
    try {
      const testClient = await clientService.create({
        name: 'TEST-' + Date.now(),
        contactPerson: 'Test Person',
        email: 'test@test.com',
        phone: '555-0000',
        location: 'Test City',
        createdAt: new Date().toISOString()
      });
      addResult('Successfully created test client');
      
      await clientService.delete(testClient.id);
      addResult('Successfully deleted test client');
      
    } catch (err: any) {
      addResult(`Create/Delete failed: ${err.message}`, true);
    }

    addResult('--- ALL TESTS COMPLETE ---');
    addResult('If all green, your Supabase is working perfectly! 🎉');
    setIsRunning(false);
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '900px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#333' }}>🔍 Supabase Connection Test</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        This will verify your Supabase database connection and permissions.
      </p>
      
      <button 
        onClick={runTests} 
        disabled={isRunning}
        style={{ 
          padding: '15px 40px', 
          fontSize: '18px', 
          marginBottom: '30px', 
          backgroundColor: isRunning ? '#999' : '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: isRunning ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {isRunning ? '⏳ Running Tests...' : '▶️ Run Connection Tests'}
      </button>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '25px', 
        borderRadius: '8px', 
        minHeight: '400px',
        border: '2px solid #dee2e6',
        fontFamily: 'Consolas, monospace',
        fontSize: '14px'
      }}>
        {results.length === 0 ? (
          <p style={{ color: '#6c757d', textAlign: 'center', paddingTop: '50px' }}>
            👆 Click the button above to run the tests
          </p>
        ) : (
          results.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '10px', 
                padding: '8px',
                color: result.includes('❌') ? '#dc3545' : '#28a745',
                fontWeight: result.includes('---') ? 'bold' : 'normal',
                backgroundColor: result.includes('---') ? '#e9ecef' : 'transparent',
                borderRadius: '4px'
              }}
            >
              {result}
            </div>
          ))
        )}
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '8px',
        border: '1px solid #ffc107'
      }}>
        <h3 style={{ marginTop: 0, color: '#856404' }}>📋 What This Tests:</h3>
        <ul style={{ color: '#856404' }}>
          <li><strong>Environment Variables:</strong> Checks if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set</li>
          <li><strong>Connection:</strong> Verifies it can reach your Supabase database</li>
          <li><strong>Read:</strong> Tests reading data from the clients table</li>
          <li><strong>Write:</strong> Tests creating a new record</li>
          <li><strong>Delete:</strong> Tests deleting a record</li>
        </ul>
        <hr style={{ borderColor: '#ffc107' }} />
        <p style={{ color: '#856404', marginBottom: 0 }}>
          <strong>✅ All tests pass?</strong> Your Supabase is working perfectly!<br />
          <strong>❌ Tests fail?</strong> Screenshot the results and share them with me - I'll help fix it!
        </p>
      </div>
    </div>
  );
};