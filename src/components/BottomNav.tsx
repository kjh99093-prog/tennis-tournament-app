import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LayoutDashboard, CalendarCheck2, User, FileText } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, savedTournaments, notes } = useApp();
  const { t } = useLanguage();

  const savedCount = savedTournaments.length;
  const notesCount = notes.length;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#151F24]/95 backdrop-blur-lg border-t border-[#354740] pb-safe"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors relative ${
            activeTab === 'dashboard'
              ? 'text-[#D5FA63]'
              : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-tight">
            {t('nav_dashboard')}
          </span>
          {activeTab === 'dashboard' && (
            <span className="absolute -bottom-1 w-6 h-0.5 bg-[#D5FA63] rounded-full" />
          )}
        </button>

        {/* 2. My Events */}
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors relative ${
            activeTab === 'events'
              ? 'text-[#D5FA63]'
              : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
          }`}
        >
          <div className="relative">
            <CalendarCheck2 className="w-5 h-5 mb-0.5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-[#6677FF] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium leading-tight">
            {t('nav_my_events')}
          </span>
          {activeTab === 'events' && (
            <span className="absolute -bottom-1 w-6 h-0.5 bg-[#D5FA63] rounded-full" />
          )}
        </button>

        {/* 3. Notes */}
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors relative ${
            activeTab === 'notes'
              ? 'text-[#D5FA63]'
              : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
          }`}
        >
          <div className="relative">
            <FileText className="w-5 h-5 mb-0.5" />
            {notesCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-[#293B35] text-[#D5FA63] border border-[#354740] text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {notesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium leading-tight">
            {t('nav_notes')}
          </span>
          {activeTab === 'notes' && (
            <span className="absolute -bottom-1 w-6 h-0.5 bg-[#D5FA63] rounded-full" />
          )}
        </button>
        {/* 4. My Profile */}
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors relative ${
            activeTab === 'profile'
              ? 'text-[#D5FA63]'
              : 'text-[#AAB9B3] hover:text-[#F3F5F0]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium leading-tight">
            {t('nav_profile')}
          </span>
          {activeTab === 'profile' && (
            <span className="absolute -bottom-1 w-6 h-0.5 bg-[#D5FA63] rounded-full" />
          )}
        </button>

      </div>
    </nav>
  );
};
