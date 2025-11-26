// Supabase Client Configuration
// This file handles all connections to your Supabase database

import { createClient } from '@supabase/supabase-js';

// Get environment variables - works in both Vite and Node.js
const supabaseUrl = 
  typeof import.meta !== 'undefined' && import.meta.env 
    ? import.meta.env.VITE_SUPABASE_URL 
    : process.env.VITE_SUPABASE_URL;

const supabaseAnonKey = 
  typeof import.meta !== 'undefined' && import.meta.env 
    ? import.meta.env.VITE_SUPABASE_ANON_KEY 
    : process.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if connection is working
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('clients').select('count');
    if (error) throw error;
    return { success: true, message: 'Connected to Supabase!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
