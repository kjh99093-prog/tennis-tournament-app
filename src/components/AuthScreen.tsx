import React, { useState } from 'react';
import { signIn, signUp } from '../lib/supabase';

type Props = { onAuthenticated: () => void };

export const AuthScreen: React.FC<Props> = ({ onAuthenticated }) => {
 const [mode, setMode] = useState<'signup' | 'login'>('login');
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [busy, setBusy] = useState(false);
 const submit = async (e: React.FormEvent) => {
  e.preventDefault(); setError(''); setBusy(true);
  try {
   if (mode === 'signup') { const session = await signUp(email, password, name); if (session) onAuthenticated(); else { setMode('login'); setError('Check your email to confirm your account, then log in.'); } }
   else { await signIn(email, password); onAuthenticated(); }
  } catch (err) { setError(err instanceof Error ? err.message : 'Could not authenticate.'); }
  finally { setBusy(false); }
 };
 return <main className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl border border-[#354740] bg-[#182320] p-6">
 <div className="text-center"><div className="text-3xl">🎾</div><p className="text-xs font-bold uppercase tracking-widest text-[#D5FA63]">AuraTennis</p><h1 className="mt-2 text-2xl font-extrabold">{mode === 'signup' ? 'Create account' : 'Welcome back'}</h1></div>
 <div role="tablist" aria-label="Authentication mode" className="grid grid-cols-2 gap-2 rounded-2xl bg-[#111B1F] p-1">
 <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => {setMode('signup');setError('');}} className={`rounded-xl p-3 transition-colors ${mode === 'signup' ? 'bg-[#D5FA63] font-bold text-[#151F24] shadow-sm' : 'text-[#AAB7B0] hover:bg-[#20352F] hover:text-[#F3F5F0]'}`}>Sign up</button>
 <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => {setMode('login');setError('');}} className={`rounded-xl p-3 transition-colors ${mode === 'login' ? 'bg-[#D5FA63] font-bold text-[#151F24] shadow-sm' : 'text-[#AAB7B0] hover:bg-[#20352F] hover:text-[#F3F5F0]'}`}>Log in</button>
 </div>
 {mode === 'signup' && <input aria-label="Full name" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required className="w-full rounded-xl border border-[#354740] bg-[#151F24] p-3"/>}
 <input aria-label="Email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required className="w-full rounded-xl border border-[#354740] bg-[#151F24] p-3"/>
 <input aria-label="Password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (6+ characters)" required className="w-full rounded-xl border border-[#354740] bg-[#151F24] p-3"/>
 {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
 <button disabled={busy} className="w-full rounded-xl bg-[#D5FA63] p-3 font-extrabold text-[#151F24]">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}</button>
 </form></main>;
};
