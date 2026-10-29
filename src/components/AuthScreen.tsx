import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Props = { onAuthenticated?: () => void };
type Mode = 'login' | 'signup' | 'forgot' | 'reset';

// Always send production auth links back to the deployed app.
const APP_BASE_URL = import.meta.env.PROD
  ? 'https://tennis-tournament-app-alpha.vercel.app'
  : window.location.origin;

export const AuthScreen: React.FC<Props> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        setError('');
        setMessage('Choose a new password for your account.');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your name.');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${APP_BASE_URL}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data.session) {
          onAuthenticated?.();
          setMessage('Account created successfully. You are now signed in.');
        } else {
          setMode('login');
          setMessage('Account request received. If email confirmation is enabled, check your inbox to finish signing up.');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${APP_BASE_URL}/auth/reset-password`,
        });
        if (error) throw error;
        setMessage('If an account exists for this email, a password reset link will be sent when email delivery is available.');
      } else if (mode === 'reset') {
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword('');
        setMode('login');
        setMessage('Password updated successfully. Please log in with your new password.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        onAuthenticated?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete this request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const heading = mode === 'login' ? 'Welcome back'
    : mode === 'signup' ? 'Create your account'
    : mode === 'forgot' ? 'Reset your password'
    : 'Choose a new password';

  return (
    <main className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-[#354740] bg-[#20352F] p-6 sm:p-8">
        <div className="text-center">
          <img src="/icons/atoni-symbol.svg" alt="ATONI symbol" className="mx-auto mb-3 h-12 w-12 rounded-2xl" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D5FA63]">ATONI</p>
          <h1 className="mt-2 text-2xl font-extrabold">{heading}</h1>
          <p className="mt-2 text-sm text-[#AAB9B3]">
            {mode === 'signup' ? 'Create an account to keep your tennis profile connected.'
              : mode === 'forgot' ? 'Enter your account email to request a password reset link.'
              : mode === 'reset' ? 'Enter a new password below.'
              : 'Your account keeps your tennis profile connected.'}
          </p>
        </div>

        {mode === 'signup' && (
          <label className="block text-sm font-semibold">Full name
            <input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={80}
              className="mt-1 w-full rounded-xl border border-[#354740] bg-[#151F24] px-3 py-3 outline-none focus:border-[#D5FA63]" placeholder="Your name" />
          </label>
        )}

        {mode !== 'reset' && (
          <label className="block text-sm font-semibold">Email
            <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#354740] bg-[#151F24] px-3 py-3 outline-none focus:border-[#D5FA63]" placeholder="you@example.com" />
          </label>
        )}

        {mode !== 'forgot' && (
          <label className="block text-sm font-semibold">{mode === 'reset' ? 'New password' : 'Password'}
            <input type="password" required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#354740] bg-[#151F24] px-3 py-3 outline-none focus:border-[#D5FA63]"
              placeholder={mode === 'reset' ? 'New password (at least 6 characters)' : 'At least 6 characters'} />
          </label>
        )}

        {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
        {message && <p role="status" className="rounded-xl border border-[#536642] bg-[#151F24] p-3 text-sm text-[#D5FA63]">{message}</p>}

        <button disabled={busy} className="w-full rounded-xl bg-[#D5FA63] px-4 py-3 font-extrabold text-[#151F24] disabled:opacity-50">
          {busy ? 'Please wait…'
            : mode === 'login' ? 'Log in'
            : mode === 'signup' ? 'Create account'
            : mode === 'forgot' ? 'Send reset link'
            : 'Update password'}
        </button>

        {mode === 'login' && (
          <p className="text-center text-sm">
            <button type="button" onClick={() => switchMode('forgot')} className="font-bold text-[#D5FA63] underline underline-offset-4">Forgot password?</button>
          </p>
        )}

        {(mode === 'signup' || mode === 'forgot') && (
          <p className="text-center text-sm text-[#AAB9B3]">
            {mode === 'signup' ? 'Already have an account?' : 'Remembered your password?'}{' '}
            <button type="button" onClick={() => switchMode('login')}
              className="font-bold text-[#D5FA63] underline underline-offset-4">
              {mode === 'signup' ? 'Log in' : 'Back to log in'}
            </button>
          </p>
        )}
        {mode === 'login' && (
          <p className="text-center text-sm text-[#AAB9B3]">
            Need an account?{' '}
            <button type="button" onClick={() => switchMode('signup')} className="font-bold text-[#D5FA63] underline underline-offset-4">Sign up</button>
          </p>
        )}
      </form>
    </main>
  );
};
