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
