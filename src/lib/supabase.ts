const PROJECT_URL = 'https://dgpknbnhlvnxnstrdgvx.supabase.co';
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: { id: string; email?: string; user_metadata?: { full_name?: string } };
};
const SESSION_KEY = 'aura_supabase_session';

export function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    return session?.access_token && session?.user?.id ? session : null;
  } catch { return null; }
}
function saveSession(session: AuthSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}
async function request(path: string, body?: unknown, accessToken?: string) {
  if (!API_KEY) throw new Error('Supabase key is missing. Add VITE_SUPABASE_PUBLISHABLE_KEY in Vercel.');
  const response = await fetch(`${PROJECT_URL}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { apikey: API_KEY, 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || data?.error || 'Request failed. Please try again.');
  return data;
}
export async function signUp(email: string, password: string, fullName: string): Promise<AuthSession | null> {
  const data = await request('/auth/v1/signup', { email: email.trim().toLowerCase(), password, data: { full_name: fullName.trim() } });
  if (!data.access_token || !data.user) return null;
  const session: AuthSession = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at, user: data.user };
  saveSession(session);
  return session;
}
export async function signIn(email: string, password: string): Promise<AuthSession> {
  const data = await request('/auth/v1/token?grant_type=password', { email: email.trim().toLowerCase(), password });
  const session: AuthSession = { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at, user: data.user };
  saveSession(session);
  return session;
}
export async function signOut(session: AuthSession | null) {
  try { if (session?.access_token) await request('/auth/v1/logout', undefined, session.access_token); }
  finally { saveSession(null); }
}
