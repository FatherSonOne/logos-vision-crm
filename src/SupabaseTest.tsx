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

    addResult('--- Testing Read Operation ---');
    try {
      const clients = await clientService.getAll();
      addResult(`Successfully read ${clients.length} clients`);
      if (clients.length > 0) {
        addResult(`Sample: ${clients[0].name}`);
      }
    } catch (err: any) {
      addResult(`Read failed: ${err.message}`, true);
    }

    addResult('--- Testing Create & Delete ---');
    try {
      const testClient = await clientService.create({
        name: 'TEST-' + Date.now(),
        contactPerson: 'Test',
        email: 'test@test.com',
        phone: '555-0000',
        location: 'Test',
        createdAt: new Date().toISOString()
      });
      addResult('Created test client');
      await clientService.delete(testClient.id);
      addResult('Deleted test client');
    } catch (err: any) {
      addResult(`CRUD failed: ${err.message}`, true);
    }

    addResult('--- ALL TESTS COMPLETE ---');
    setIsRunning(false);
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '900px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', fontSize: '32px' }}>
        🔍 Supabase Connection Test
      </h1>
      <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
        This will verify your Supabase database connection.
      </p>
      
      <button 
        onClick={runTests} 
        disabled={isRunning}
        style={{ 
          padding: '20px 50px', 
          fontSize: '20px', 
          marginBottom: '30px', 
          backgroundColor: isRunning ? '#999' : '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: isRunning ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
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
        fontSize: '15px'
      }}>
        {results.length === 0 ? (
          <p style={{ 
            color: '#6c757d', 
            textAlign: 'center', 
            paddingTop: '100px',
            fontSize: '18px'
          }}>
            👆 Click the green button above to run tests
          </p>
        ) : (
          results.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '12px', 
                padding: '10px',
                color: result.includes('❌') ? '#dc3545' : '#28a745',
                fontWeight: result.includes('---') ? 'bold' : 'normal',
                backgroundColor: result.includes('---') ? '#e9ecef' : 'transparent',
                borderRadius: '4px',
                fontSize: '15px'
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
        border: '2px solid #ffc107'
      }}>
        <h3 style={{ marginTop: 0, color: '#856404' }}>📋 What This Tests:</h3>
        <ul style={{ color: '#856404' }}>
          <li>Environment variables (URL and API key)</li>
          <li>Connection to Supabase</li>
          <li>Reading data</li>
          <li>Creating records</li>
          <li>Deleting records</li>
        </ul>
        <p style={{ color: '#856404', marginBottom: 0, fontWeight: 'bold' }}>
          ✅ All green? Perfect!<br />
          ❌ Red errors? Share them with me and I'll help fix it!
        </p>
      </div>
    </div>
  );
};
