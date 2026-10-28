import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

type Props = { onAuthenticated?: () => void };

// Always send production sign-ups back to the deployed app, never to a stale localhost origin.
const APP_BASE_URL = import.meta.env.PROD
  ? 'https://tennis-tournament-app-alpha.vercel.app'
  : window.location.origin;
export const AuthScreen: React.FC<Props> = ({ onAuthenticated }) => {
 const [mode,setMode]=useState<'login'|'signup'>('login');
 const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
 const [error,setError]=useState(''); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');setMessage('');setBusy(true);try{
  if(mode==='signup'){
   if(!name.trim()) throw new Error('Please enter your name.');
   const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()},emailRedirectTo:`${APP_BASE_URL}/auth/callback`}});
   if(error) throw error;
   if(data.session){onAuthenticated?.();setMessage('Account created. You are signed in.');}
   else {setMode('login');setMessage('Account created. Check your email to confirm your address, then log in.');}
  } else {
   const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
   if(error) throw error;
   onAuthenticated?.();
  }
 }catch(err){setError(err instanceof Error?err.message:'Unable to authenticate. Please try again.')}finally{setBusy(false)}};
 return <main className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-[#354740] bg-[#20352F] p-6 sm:p-8">
 <div className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#354740] bg-[#151F24] text-2xl">🎾</div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D5FA63]">AURA Tennis</p><h1 className="mt-2 text-2xl font-extrabold">{mode==='login'?'Welcome back':'Create your account'}</h1><p className="mt-2 text-sm text-[#AAB9B3]">Your account keeps your tennis profile connected.</p></div>
 {mode==='signup'&&<label className="block text-sm font-semibold">Full name<input required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} maxLength={80} className="mt-1 w-full rounded-xl border border-[#354740] bg-[#151F24] px-3 py-3 outline-none focus:border-[#D5FA63]" placeholder="Your name"/></label>}
 <label className="block text-sm font-semibold">Email<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-[#354740] bg-[#151F24] px-3 py-3 outline-none focus:border-[#D5FA63]" placeholder="you@example.com"/></label>
 <label className="block text-sm font-semibold">Password<input type="password" required minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-[#354740] bg-[#151F24] px-3 py-3 outline-none focus:border-[#D5FA63]" placeholder="At least 6 characters"/></label>
 {error&&<p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}{message&&<p role="status" className="rounded-xl border border-[#536642] bg-[#151F24] p-3 text-sm text-[#D5FA63]">{message}</p>}
 <button disabled={busy} className="w-full rounded-xl bg-[#D5FA63] px-4 py-3 font-extrabold text-[#151F24] disabled:opacity-50">{busy?'Please wait…':mode==='login'?'Log in':'Create account'}</button>
 <p className="text-center text-sm text-[#AAB9B3]">{mode==='login'?"Don't have an account?":'Already have an account?'} <button type="button" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('')}} className="font-bold text-[#D5FA63] underline underline-offset-4">{mode==='login'?'Sign up':'Log in'}</button></p>
 </form></main>;
};
