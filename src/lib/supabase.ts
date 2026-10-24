const PROJECT_URL = 'https://dgpknbnhlvnxnstrdgvx.supabase.co';
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export function getSupabaseConfig() { return { PROJECT_URL, API_KEY }; }
