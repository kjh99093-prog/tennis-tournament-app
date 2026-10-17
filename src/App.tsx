/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#151F24] text-[#F3F5F0] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header with Junior/Adult toggle, EN/中文 language toggle, and Dark/Light toggle */}
      <Header />

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

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
