import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { RegistrationStatus, Tournament } from '../types';
import {
  CalendarCheck2,
  Calendar,
  MapPin,
  ExternalLink,
  Trash2,
  FileText,
  DollarSign,
  Trophy,
  ChevronRight,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Archive,
  CheckCheck
} from 'lucide-react';

export const MyEventsView: React.FC = () => {
  const {
    savedTournaments,
    tournaments,
    updateTournamentStatus,
    toggleSaveTournament,
    openTournamentModal,
    setActiveTab,
    createNoteForTournament
  } = useApp();
  const { t } = useLanguage();
  const { theme } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'all' | RegistrationStatus>('all');
  const [expandedFactors, setExpandedFactors] = useState<Record<string, boolean>>({});

  const toggleFactorExpand = (id: string) => {
    setExpandedFactors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Join saved records with tournament details
  const savedItems = savedTournaments
    .map((record) => {
      const tourney = tournaments.find((t) => t.id === record.tournamentId);
      return {
        record,
        tourney
      };
    })
    .filter((item): item is { record: typeof item.record; tourney: NonNullable<typeof item.tourney> } =>
      Boolean(item.tourney)
    );

  const filteredItems = savedItems.filter((item) => {
    if (activeSubTab === 'all') return true;
    return item.record.status === activeSubTab;
  });

  const registeredCount = savedItems.filter((i) => i.record.status === 'registered').length;
  const interestedCount = savedItems.filter((i) => i.record.status === 'interested').length;
  const waitlistedCount = savedItems.filter((i) => i.record.status === 'waitlisted').length;
  const completedCount = savedItems.filter((i) => i.record.status === 'completed').length;

  const getFitBadge = (score: number, isCompleted: boolean) => {
    if (isCompleted) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs border border-slate-700/80 shadow-xs shrink-0">
          <Archive className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm font-bold font-mono">{score}%</span>
          <span className="text-[10px] uppercase tracking-wider">{t('reg_status_completed')}</span>
        </div>
      );
    }
    if (score >= 90) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D5FA63] text-[#151F24] font-black text-xs shadow-xs shrink-0">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span className="text-sm font-extrabold">{score}%</span>
          <span className="font-bold text-[10px] uppercase tracking-wider">{t('fit_high')}</span>
        </div>
      );
    }
    if (score >= 80) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6677FF] text-white font-black text-xs shadow-xs shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-sm font-extrabold">{score}%</span>
          <span className="font-bold text-[10px] uppercase tracking-wider">{t('fit_good')}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#293B35] text-[#AAB9B3] font-bold text-xs border border-[#354740] shrink-0">
        <span className="text-sm font-bold text-[#F3F5F0]">{score}%</span>
        <span className="font-medium text-[10px]">{t('fit_moderate')}</span>
      </div>
    );
  };

  const getProgressBarColor = (score: number, isCompleted: boolean) => {
    if (isCompleted) return 'bg-slate-500';
    if (score >= 90) return 'bg-[#D5FA63]';
    if (score >= 80) return 'bg-[#6677FF]';
    return 'bg-[#AAB9B3]';
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-lg md:text-xl font-extrabold text-[#F3F5F0]">
          {t('my_events_title')}
        </h1>
        <p className="text-xs text-[#AAB9B3] mt-0.5">
          {t('my_events_subtitle')}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#20352F] border border-[#354740] rounded-xl p-2 sm:p-3 text-center min-w-0">
          <span className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider block truncate">
            {t('stats_tracked')}
          </span>
          <span className="text-base sm:text-xl font-extrabold text-[#D5FA63] block mt-0.5">
            {savedItems.length}
          </span>
        </div>

        <div className="bg-[#20352F] border border-[#354740] rounded-xl p-2 sm:p-3 text-center min-w-0">
          <span className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider block truncate">
            {t('stats_confirmed')}
          </span>
          <span className="text-base sm:text-xl font-extrabold text-[#6677FF] block mt-0.5">
            {registeredCount}
          </span>
        </div>

        <div className="bg-[#20352F] border border-[#354740] rounded-xl p-2 sm:p-3 text-center min-w-0">
          <span className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider block truncate">
            {t('stats_total_fees')}
          </span>
          <span className="text-xs sm:text-base font-extrabold text-[#F3F5F0] block mt-0.5 truncate">
            ~${registeredCount * 85}
          </span>
        </div>
      </div>

      {/* Horizontally Scrollable Sub Tabs without line wrap */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none w-full min-w-0 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
            activeSubTab === 'all'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          {t('tab_all')} ({savedItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('registered')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
            activeSubTab === 'registered'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          {t('tab_registered')} ({registeredCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('interested')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
            activeSubTab === 'interested'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          {t('tab_interested')} ({interestedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('waitlisted')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
            activeSubTab === 'waitlisted'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          {t('tab_waitlisted')} ({waitlistedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
            activeSubTab === 'completed'
              ? 'bg-slate-700 text-white border-slate-600 font-bold'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          {t('tab_completed')} ({completedCount})
        </button>
      </div>

      {/* List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map(({ record, tourney }) => {
            const isCompleted = record.status === 'completed';
            const isFactorsOpen = !!expandedFactors[tourney.id];

            return (
              <div
                key={tourney.id}
                className={`rounded-2xl p-3.5 sm:p-4 transition-all space-y-2.5 border ${
                  isCompleted
                    ? 'bg-[#182320]/80 border-slate-700/70 shadow-none'
                    : 'bg-[#20352F] border-[#354740] shadow-sm hover:border-[#6677FF]/40'
                }`}
              >
                {/* Completed / Unactivated Banner Indicator */}
                {isCompleted && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{t('event_unactivated')}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium truncate ml-2">
                      {t('unactivated_desc')}
                    </span>
                  </div>
                )}

                {/* Top Row: Badges on Left, Fit Score Percentage Badge on Right */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isCompleted
                        ? 'bg-slate-800/90 text-slate-400 border-slate-700'
                        : 'bg-[#151F24] text-[#D5FA63] border-[#354740]'
                    }`}>
                      {tourney.sanctioningBody}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      isCompleted
                        ? 'bg-slate-800/60 text-slate-400'
                        : 'bg-[#293B35] text-[#A78BFA]'
                    }`}>
                      {tourney.surface}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      isCompleted
                        ? 'bg-slate-800/60 text-slate-400'
                        : 'bg-[#293B35] text-[#AAB9B3]'
                    }`}>
                      {tourney.country === 'Canada' ? '🇨🇦 Canada' : '🇺🇸 USA'}
                    </span>
                  </div>
                  {getFitBadge(tourney.fitScore, isCompleted)}
                </div>

                {/* Full-Width Tournament Title */}
                <h3
                  onClick={() => openTournamentModal(tourney)}
                  className={`font-bold text-base cursor-pointer transition-colors leading-snug ${
                    isCompleted
                      ? 'text-slate-300 hover:text-white'
                      : 'text-[#F3F5F0] hover:text-[#D5FA63]'
                  }`}
                >
                  {tourney.title}
                </h3>

                {/* Age & Level Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tourney.ageCategory && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isCompleted
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-[#293B35] text-[#D5FA63] border-[#354740]'
                    }`}>
                      {t('badge_age')}: {tourney.ageCategory}
                    </span>
                  )}
                  {tourney.levelCategory && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isCompleted
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-[#293B35] text-[#6677FF] border-[#354740]'
                    }`}>
                      {t('badge_level')}: {tourney.levelCategory}
                    </span>
                  )}
                </div>

                {/* Venue, City & Distance */}
                <div className="flex items-center gap-1.5 text-xs text-[#AAB9B3]">
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-slate-500' : 'text-[#D5FA63]'}`} />
                  <span className="truncate">{tourney.venueName}, {tourney.city}</span>
                  <span className="text-[#354740]">•</span>
                  <span className={`font-medium shrink-0 ${isCompleted ? 'text-slate-400' : 'text-[#6677FF]'}`}>
                    {tourney.distanceKm} km
                  </span>
                </div>

                {/* Schedule Dates & Deadline */}
                <div className="flex items-center gap-1.5 text-xs text-[#F3F5F0] flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#AAB9B3]" />
                    <span className={isCompleted ? 'text-slate-400' : ''}>
                      {tourney.startDate} ~ {tourney.endDate}
                    </span>
                  </div>
                  <span className="text-[#354740] hidden sm:inline">•</span>
                  <span className={`text-[11px] font-medium ${isCompleted ? 'text-slate-500' : 'text-[#FF5D64]'}`}>
                    {t('deadline')}: {tourney.entryDeadline}
                  </span>
                </div>

                {/* Status Switcher Row - Dedicated, Never Overlapping */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#151F24]/75 border border-[#354740]/70">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#AAB9B3] shrink-0">
                      {t('update_status')}:
                    </span>
                    <select
                      value={record.status}
                      onChange={(e) => updateTournamentStatus(tourney.id, e.target.value as RegistrationStatus)}
                      className={`border text-xs font-bold rounded-lg px-2 py-1 outline-hidden cursor-pointer ${
                        isCompleted
                          ? 'bg-slate-800 border-slate-600 text-slate-300'
                          : 'bg-[#20352F] border-[#354740] text-[#D5FA63]'
                      }`}
                    >
                      <option value="interested">{t('reg_status_interested')}</option>
                      <option value="registered">{t('reg_status_registered')}</option>
                      <option value="waitlisted">{t('reg_status_waitlisted')}</option>
                      <option value="completed">{t('reg_status_completed')}</option>
                      <option value="withdrawn">{t('reg_status_withdrawn')}</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSaveTournament(tourney.id)}
                    className="p-1.5 rounded-lg text-[#AAB9B3] hover:text-[#FF5D64] hover:bg-[#FF5D64]/10 transition-colors shrink-0"
                    title={t('remove_from_schedule')}
                    aria-label={t('remove_from_schedule')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Fit Score Percentage Meter */}
                <div className={`p-2.5 rounded-xl border space-y-1.5 ${
                  isCompleted
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-[#151F24]/75 border-[#354740]/70'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={`text-xs font-mono font-black ${isCompleted ? 'text-slate-400' : 'text-[#D5FA63]'}`}>
                        {tourney.fitScore}%
                      </span>
                      <span className="text-[11px] text-[#AAB9B3] font-medium">
                        {t('fit_score')} {isCompleted ? `(${t('reg_status_completed')})` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFactorExpand(tourney.id)}
                      className="text-[10px] font-semibold text-[#AAB9B3] hover:text-[#D5FA63] flex items-center gap-0.5 transition-colors"
                    >
                      <span>{t('breakdown_preview')}</span>
                      {isFactorsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Visual Percentage Progress Bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isCompleted ? 'bg-slate-800' : 'bg-[#293B35]'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(tourney.fitScore, isCompleted)}`}
                      style={{ width: `${tourney.fitScore}%` }}
                    />
                  </div>

                  {/* Quick inline breakdown visible on the card */}
                  {isFactorsOpen && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#354740]/50 text-[10px] text-[#AAB9B3] animate-in fade-in duration-150">
                      <div className="flex justify-between">
                        <span>{t('factor_distance')}:</span>
                        <span className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-[#D5FA63]'}`}>
                          {tourney.fitFactors.distanceFit}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('factor_surface')}:</span>
                        <span className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-[#6677FF]'}`}>
                          {tourney.fitFactors.surfaceFit}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('factor_rating')}:</span>
                        <span className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-[#A78BFA]'}`}>
                          {tourney.fitFactors.ratingFit}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('factor_category')}:</span>
                        <span className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-[#F3F5F0]'}`}>
                          {tourney.fitFactors.categoryFit}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions for saved item */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#354740]/60 text-xs">
                  <button
                    type="button"
                    onClick={() => createNoteForTournament(tourney)}
                    className="inline-flex items-center gap-1.5 text-[#AAB9B3] hover:text-[#D5FA63] font-semibold transition-colors shrink-0"
                  >
                    <FileText className={`w-3.5 h-3.5 ${isCompleted ? 'text-slate-500' : 'text-[#D5FA63]'}`} />
                    <span>{t('notes_for_tournament')}</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={tourney.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#293B35] hover:bg-[#6677FF] hover:text-white text-xs font-semibold text-[#AAB9B3] border border-[#354740] transition-colors"
                      title={t('official_link')}
                    >
                      <span className="hidden xs:inline">{t('official_link')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => openTournamentModal(tourney)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                        isCompleted
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-[#D5FA63] hover:bg-[#cbf74e] text-[#151F24]'
                      }`}
                    >
                      <span>{t('view_details')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#20352F] border border-[#354740] rounded-2xl p-8 text-center space-y-3">
          <CalendarCheck2 className="w-10 h-10 text-[#AAB9B3]/60 mx-auto" />
          <h3 className="font-bold text-base text-[#F3F5F0]">
            {t('empty_events_title')}
          </h3>
          <p className="text-xs text-[#AAB9B3] max-w-sm mx-auto leading-relaxed">
            {t('empty_events_desc')}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#D5FA63] text-[#151F24] text-xs font-bold shadow-md hover:bg-[#cbf74e] transition-colors"
          >
            {t('browse_tournaments')}
          </button>
        </div>
      )}
    </div>
  );
};
