import { createClient } from '@supabase/supabase-js';

// This app is tied to the Aura Tennis Supabase project. Use its verified URL
// directly so an older mistyped Vercel VITE_SUPABASE_URL cannot break auth.
const supabaseUrl = 'https://dgpknbnhlvnxnstrdgvx.supabase.co';
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();

if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_PUBLISHABLE_KEY. Add the Supabase publishable key in Vercel Environment Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey || 'missing-publishable-key');
