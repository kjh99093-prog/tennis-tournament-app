import React, { useEffect, useRef, useState } from 'react';
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
import { InstallPage } from './components/InstallPage';


const EmailConfirmationReturn: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'confirmed' | 'error'>('checking');

  useEffect(() => {
    let active = true;
    const confirmEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const authError = params.get('error_description') || hash.get('error_description') || params.get('error') || hash.get('error');

      if (authError) {
        if (active) setStatus('error');
        return;
      }

      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (active) setStatus(error ? 'error' : 'confirmed');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (!error && data.session) {
        setStatus('confirmed');
        return;
      }

      if (params.get('type') === 'signup' || hash.get('type') === 'signup' ||
          params.has('token_hash') || hash.has('access_token')) {
        setStatus('confirmed');
        return;
      }
      setStatus('error');
    };

    void confirmEmail();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setStatus('confirmed');
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const confirmed = status === 'confirmed';
  const checking = status === 'checking';

  return <main className="min-h-screen bg-white flex items-center justify-center p-2 sm:p-6">
    <section className="w-full max-w-7xl rounded-[28px] sm:rounded-[40px] border border-[#354740] bg-gradient-to-br from-[#203A32] to-[#1B332C] px-5 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12 text-center text-[#F3F5F0] shadow-sm">
      <img src="/icons/atoni-symbol.svg" alt="ATONI symbol" className="mx-auto h-20 w-20 sm:h-28 sm:w-28 rounded-3xl" />
      <p className="mt-5 sm:mt-7 text-sm sm:text-lg font-bold uppercase tracking-[0.12em] text-[#D5FA63]">ATONI / TOURNAMENT TRACKER</p>
      <h1 className="mt-4 text-2xl sm:text-3xl md:text-[40px] leading-tight font-extrabold tracking-tight">
        {confirmed ? 'Email verified successfully!' : checking ? 'Verifying your email…' : 'We couldn’t verify your email'}
      </h1>
      <p className="mx-auto mt-5 sm:mt-6 max-w-6xl text-base sm:text-xl md:text-[28px] leading-relaxed text-[#AAB9B3]">
        {confirmed
          ? 'Your email has been verified. Please return to the app and log in.'
          : checking
            ? 'Please wait while we confirm your email address.'
            : 'This confirmation link may have expired or already been used. Return to ATONI and request a new confirmation email.'}
      </p>
    </section>
  </main>;
};

const AppContent: React.FC = () => {
  const { activeTab, activeModalTournament, closeTournamentModal, setCategory, updatePlayerProfile, playerProfile } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const closeTournamentModalRef = useRef(closeTournamentModal);
  closeTournamentModalRef.current = closeTournamentModal;

  // Treat an open tournament detail as an in-app navigation layer.
  // The device/browser Back action closes the modal instead of leaving ATONI.
  useEffect(() => {
    if (!activeModalTournament) return;

    const marker = { ...(window.history.state || {}), atoniTournamentModal: true };
    window.history.pushState(marker, '', window.location.pathname + window.location.search);

    const handlePopState = () => {
      closeTournamentModalRef.current();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If the modal was closed using its own UI, remove the temporary
      // history entry so the next Back press does not get stuck on a stale layer.
      if (window.history.state?.atoniTournamentModal) {
        window.history.back();
      }
    };
  }, [activeModalTournament]);

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
    const confirmed = window.confirm(
      'Before you log out: your saved tournaments and match notes are currently stored on this device only. Logging out will clear those local records, and they may not be recoverable. To keep using them for now, choose Cancel and stay signed in.'
    );
    if (!confirmed) return;

    const { error } = await supabase.auth.signOut();
    if (error) { window.alert('Could not log out. Please try again.'); return; }
    ['aura_tennis_setup_complete','aura_tennis_profile','aura_tennis_category','aura_tennis_saved_tournaments','aura_tennis_notes']
      .forEach((key) => localStorage.removeItem(key));
    setSetupComplete(false);
  };

  if (window.location.pathname === '/install') return <InstallPage />;
  if (window.location.pathname === '/auth/callback') return <EmailConfirmationReturn />;
  if (window.location.pathname === '/auth/reset-password') return <AuthScreen />;
  if (authLoading) return <main className="min-h-screen bg-[#151F24] text-[#D5FA63] flex items-center justify-center">Loading your account…</main>;
  if (!user) return <AuthScreen />;
  if (!setupComplete) return <Onboarding initialName={String(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player')} onComplete={(category, profile) => {
    setCategory(category); updatePlayerProfile(profile); setSetupComplete(true);
  }} />;

  return <div className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex flex-col font-sans transition-colors duration-200">
    <Header />
    <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-5 md:p-6">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'events' && <MyEventsView />}
      {activeTab === 'profile' && <ProfileView onLogout={handleSignOut} />}
      {activeTab === 'notes' && <NotesView />}
    </main>
    <TournamentModal />
    <BottomNav />
  </div>;
};

export default function App() {
  return <ThemeProvider><LanguageProvider><AppProvider><AppContent /></AppProvider></LanguageProvider></ThemeProvider>;
}
