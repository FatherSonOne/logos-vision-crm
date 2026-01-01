import { createClient } from '@supabase/supabase-js';

const LOGOS_SUPABASE_URL = import.meta.env.VITE_LOGOS_SUPABASE_URL as string;
const LOGOS_SUPABASE_KEY = import.meta.env.VITE_LOGOS_SUPABASE_KEY as string;

if (!LOGOS_SUPABASE_URL || !LOGOS_SUPABASE_KEY) {
  console.error('❌ Logos Vision Supabase env vars are missing');
}

export const logosSupabase = createClient(LOGOS_SUPABASE_URL, LOGOS_SUPABASE_KEY);
