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
    const confirmEmail = async () => {
      // Supabase may return either a PKCE code in the query string or tokens in the URL hash.
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

      // The Supabase client can also process access/refresh tokens from the hash automatically.
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (!error && data.session) {
        setStatus('confirmed');
        return;
      }

      // A signup confirmation link can be valid even if the browser has not established a session.
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

  return <main className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex items-center justify-center p-5">
    <section className="w-full max-w-md rounded-3xl border border-[#354740] bg-[#20352F] p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D5FA63]/10 text-4xl">
        {confirmed ? '✓' : checking ? '⏳' : '✉️'}
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#D5FA63]">AURA TENNIS</p>
      <h1 className="mt-3 text-2xl font-extrabold">
        {confirmed ? '이메일 인증이 완료되었습니다!' : checking ? '이메일을 확인하고 있어요…' : '이메일 인증을 완료할 수 없습니다'}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#AAB9B3]">
        {confirmed
          ? 'AURA Tennis 계정의 이메일 인증이 성공적으로 완료되었어요. 이제 앱으로 돌아가 로그인하거나 프로필 설정을 계속해 주세요.'
          : checking
            ? '잠시만 기다려 주세요. 인증 상태를 확인하고 있습니다.'
            : '인증 링크가 만료되었거나 이미 사용되었을 수 있어요. AURA Tennis로 돌아가 다시 인증 이메일을 요청해 주세요.'}
      </p>
      <a href="/" className="mt-7 block w-full rounded-xl bg-[#D5FA63] px-4 py-3 font-extrabold text-[#151F24]">
        {confirmed ? 'AURA Tennis로 돌아가기' : 'AURA Tennis 열기'}
      </a>
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

  if (window.location.pathname === '/auth/callback') return <EmailConfirmationReturn />;
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
