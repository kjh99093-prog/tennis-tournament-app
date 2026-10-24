/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { AuthScreen } from './components/AuthScreen';
import { readSession, signOut, AuthSession } from './lib/supabase';

const AppContent: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { activeTab, setCategory, updatePlayerProfile } = useApp();
  const [setupComplete, setSetupComplete] = useState(() => {
    try {
      if (localStorage.getItem('aura_tennis_setup_complete') === 'true') return true;
      const saved = localStorage.getItem('aura_tennis_profile');
      if (!saved) return false;
      const profile = JSON.parse(saved);
      const name = String(profile?.name || '').trim().toLowerCase();
      return Boolean(name && name !== 'leo zhang' && name !== 'your name');
    } catch { return false; }
  });

  if (!setupComplete) {
    return (
      <Onboarding
        onComplete={(category, profile) => {
          setCategory(category);
          updatePlayerProfile(profile);
          setSetupComplete(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header with Junior/Adult toggle, EN/中文 language toggle, and Dark/Light toggle */}
      <Header onLogout={onLogout} />

      {/* Main View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-5 md:p-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'events' && <MyEventsView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'notes' && <NotesView />}
      </main>

      {/* Full Tournament Specs & Fit Breakdown Modal */}
      <TournamentModal />

      {/* Bottom Navigation with 4 items: Dashboard, My Events, My Profile, Notes */}
      <BottomNav />
    </div>
  );
};

const AuthenticatedShell: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const handleLogout = async () => {
    try { await signOut(session); } catch (error) { console.error('Logout error:', error); }
    setSession(null);
    for (const key of ['aura_tennis_setup_complete', 'aura_tennis_profile', 'aura_tennis_category', 'aura_tennis_saved_tournaments', 'aura_tennis_notes']) localStorage.removeItem(key);
    window.location.reload();
  };
  if (!session) return <AuthScreen onAuthenticated={() => setSession(readSession())} />;
  return <AppProvider><AppContent onLogout={handleLogout} /></AppProvider>;
};

export default function App() {
  return <ThemeProvider><LanguageProvider><AuthenticatedShell /></LanguageProvider></ThemeProvider>;
}
