import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { MyEventsView } from './components/MyEventsView';
import { ProfileView } from './components/ProfileView';
import { NotesView } from './components/NotesView';
import { TournamentModal } from './components/TournamentModal';
import { Onboarding } from './components/Onboarding';


const EmailConfirmationReturn: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'confirmed' | 'error'>('checking');
  useEffect(() => {
    let active = true;
    const check = async () => {
      // Supabase processes the confirmation code from the URL during client initialization.
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (!error && data.session) setStatus('confirmed');
      else {
        const params = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const authError = params.get('error_description') || hash.get('error_description') || params.get('error') || hash.get('error');
        setStatus(authError ? 'error' : 'checking');
        if (!authError) {
          window.setTimeout(async () => {
            const retry = await supabase.auth.getSession();
            if (active) setStatus(retry.data.session ? 'confirmed' : 'error');
          }, 1200);
        }
      }
    };
    void check();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setStatus('confirmed');
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  return <main className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex items-center justify-center p-5">
    <section className="w-full max-w-md rounded-3xl border border-[#354740] bg-[#20352F] p-8 text-center">
      <div className="text-4xl">{status === 'confirmed' ? '🎾' : status === 'checking' ? '⏳' : '⚠️'}</div>
      <h1 className="mt-4 text-2xl font-extrabold">{status === 'confirmed' ? 'Email confirmed!' : status === 'checking' ? 'Confirming your email…' : 'We couldn’t confirm your email'}</h1>
      <p className="mt-3 text-sm leading-6 text-[#AAB9B3]">{status === 'confirmed' ? 'Your email address is verified. Return to AURA Tennis to continue setting up your profile.' : status === 'checking' ? 'Please wait while we verify your account.' : 'This confirmation link may have expired or the redirect settings may be incorrect. Open AURA Tennis and request a new confirmation email.'}</p>
      <a href="/" className="mt-6 block w-full rounded-xl bg-[#D5FA63] px-4 py-3 font-extrabold text-[#151F24]">{status === 'confirmed' ? 'Return to AURA Tennis' : 'Open AURA Tennis'}</a>
    </section>
  </main>;
};

const AppContent: React.FC = () => {
  const { activeTab, setCategory, updatePlayerProfile, playerProfile } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    let alive = true;
    const restoreUser = async (nextUser: User | null) => {
      if (!alive) return;
      setUser(nextUser);
      if (!nextUser) { setSetupComplete(false); return; }
      const { data, error } = await supabase.from('profiles')
        .select('full_name, category, profile_data').eq('id', nextUser.id).maybeSingle();
      if (!alive) return;
      if (error) console.error('Could not load saved profile:', error.message);
      const savedProfile = data?.profile_data;
      if (savedProfile && typeof savedProfile === 'object' && String((savedProfile as any).name || '').trim()) {
        const profile = savedProfile as any;
        const category = profile.category === 'adult' ? 'adult' : 'junior';
        setCategory(category);
        updatePlayerProfile(profile);
        localStorage.setItem('aura_tennis_profile', JSON.stringify(profile));
        localStorage.setItem('aura_tennis_category', category);
        localStorage.setItem('aura_tennis_setup_complete', 'true');
        setSetupComplete(true);
      } else {
        localStorage.removeItem('aura_tennis_setup_complete');
        localStorage.removeItem('aura_tennis_profile');
        setSetupComplete(false);
      }
    };
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Could not restore login session:', error.message);
      return restoreUser(data.session?.user ?? null);
    }).finally(() => { if (alive) setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void restoreUser(session?.user ?? null);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user || !setupComplete || !playerProfile.name.trim()) return;
    const timer = window.setTimeout(async () => {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: playerProfile.name.trim(),
        category: playerProfile.category === 'adult' ? 'adult' : 'junior',
        profile_data: playerProfile,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error('Could not save profile:', error.message);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [user, setupComplete, playerProfile]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { window.alert('Could not log out. Please try again.'); return; }
    ['aura_tennis_setup_complete','aura_tennis_profile','aura_tennis_category','aura_tennis_saved_tournaments','aura_tennis_notes']
      .forEach((key) => localStorage.removeItem(key));
    setSetupComplete(false);
  };

  if (window.location.pathname === '/auth/callback') return <EmailConfirmationReturn />;
  if (authLoading) return <main className="min-h-screen bg-[#151F24] text-[#D5FA63] flex items-center justify-center">Loading your account…</main>;
  if (!user) return <AuthScreen />;
  if (!setupComplete) return <Onboarding initialName={String(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player')} onComplete={(category, profile) => {
    setCategory(category); updatePlayerProfile(profile); setSetupComplete(true);
  }} />;

  return <div className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex flex-col font-sans transition-colors duration-200">
    <Header onLogout={handleSignOut} />
    <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-5 md:p-6">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'events' && <MyEventsView />}
      {activeTab === 'profile' && <ProfileView />}
      {activeTab === 'notes' && <NotesView />}
    </main>
    <TournamentModal />
    <BottomNav />
  </div>;
};

export default function App() {
  return <ThemeProvider><LanguageProvider><AppProvider><AppContent /></AppProvider></LanguageProvider></ThemeProvider>;
}
