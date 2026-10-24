import React, { useState } from 'react';
import { Tournament } from '../types';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Calendar,
  MapPin,
  Bookmark,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Archive
} from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const { toggleSaveTournament, isTournamentSaved, getTournamentStatus, openTournamentModal } = useApp();
  const { t } = useLanguage();
  const [showFactorDetails, setShowFactorDetails] = useState(false);

  const saved = isTournamentSaved(tournament.id);
  const status = getTournamentStatus(tournament.id);
  const isCompleted = status === 'completed';
  // Real listings show a fit score only when at least one profile factor can be compared.
  const hasCalculatedFit = (tournament as Tournament & { fitScoreAvailable?: boolean }).fitScoreAvailable ?? !tournament.id.startsWith('real-');
  const locationLabel = [tournament.venueName, tournament.city, tournament.stateProvince].filter(Boolean).join(', ');

  // Compute days until deadline
  const today = new Date();
  const deadlineDate = tournament.entryDeadline ? new Date(tournament.entryDeadline) : null;
  const diffTime = deadlineDate ? deadlineDate.getTime() - today.getTime() : Number.NaN;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isDeadlineSoon = diffDays > 0 && diffDays <= 7;
  const isDeadlinePassed = diffDays < 0;

  // Fit score badge color and styling
  const getFitBadge = (score: number) => {
    if (isCompleted) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs border border-slate-700 shadow-xs shrink-0">
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

  const getProgressBarColor = (score: number) => {
    if (isCompleted) return 'bg-slate-500';
    if (score >= 90) return 'bg-[#D5FA63]';
    if (score >= 80) return 'bg-[#6677FF]';
    return 'bg-[#AAB9B3]';
  };

  return (
    <div className={`rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between gap-3 border ${
      isCompleted
        ? 'bg-[#182320]/80 border-slate-700/70 shadow-none'
        : 'bg-[#20352F] border-[#354740] hover:border-[#6677FF]/50 shadow-md'
    }`}>
      {/* Completed / Unactivated Banner */}
      {isCompleted && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('event_unactivated')}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {t('status_completed_badge')}
          </span>
        </div>
      )}

      {/* Top row: Sanction badge & Prominent Fit Score Percentage */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 ${
              isCompleted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-[#151F24] text-[#D5FA63] border-[#354740]'
            }`}>
              {tournament.sanctioningBody}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
              isCompleted ? 'bg-slate-800 text-slate-400' : 'bg-[#293B35] text-[#AAB9B3]'
            }`}>
              {tournament.country === 'Canada' ? '🇨🇦 Canada' : '🇺🇸 USA'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
              isCompleted ? 'bg-slate-800 text-slate-400' : 'bg-[#293B35] text-[#A78BFA] border border-[#354740]'
            }`}>
              {tournament.surface}
            </span>
          </div>
          {hasCalculatedFit && <div className="shrink-0">{getFitBadge(tournament.fitScore)}</div>}
        </div>

        {/* Title */}
        <h3 
          onClick={() => openTournamentModal(tournament)}
          className={`font-bold text-base cursor-pointer transition-colors leading-snug line-clamp-2 ${
            isCompleted
              ? 'text-slate-300 hover:text-white'
              : 'text-[#F3F5F0] hover:text-[#D5FA63]'
          }`}
        >
          {tournament.title}
        </h3>

        {/* Venue & Location */}
        {(locationLabel || hasCalculatedFit) && <div className="flex items-center gap-1.5 text-xs text-[#AAB9B3] mt-1.5">
          <MapPin className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-slate-500' : 'text-[#D5FA63]'}`} />
          {locationLabel && <span className="truncate">{locationLabel}</span>}
          {hasCalculatedFit && <><span className="text-[#354740]">•</span><span className={`font-medium shrink-0 ${isCompleted ? 'text-slate-400' : 'text-[#6677FF]'}`}>{t('distance_from_base', { distance: tournament.distanceKm })}</span></>}
        </div>}

        {/* Prominent Visual Fit Score Percentage Bar before clicking view details */}
        {hasCalculatedFit && <div className={`mt-2.5 p-2 rounded-xl border space-y-1.5 ${
          isCompleted ? 'bg-slate-900/60 border-slate-800' : 'bg-[#151F24]/75 border-[#354740]/70'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`text-xs font-mono font-black ${isCompleted ? 'text-slate-400' : 'text-[#D5FA63]'}`}>
                {tournament.fitScore}%
              </span>
              <span className="text-[11px] text-[#AAB9B3] font-medium">
                {t('fit_score')} {isCompleted ? `(${t('reg_status_completed')})` : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowFactorDetails(!showFactorDetails)}
              className="text-[10px] font-semibold text-[#AAB9B3] hover:text-[#D5FA63] flex items-center gap-0.5 transition-colors"
            >
              <span>{t('breakdown_preview')}</span>
              {showFactorDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Visual Percentage Progress Bar */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isCompleted ? 'bg-slate-800' : 'bg-[#293B35]'}`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(tournament.fitScore)}`}
              style={{ width: `${tournament.fitScore}%` }}
            />
          </div>

          {/* Quick inline breakdown visible on the card */}
          {showFactorDetails && (
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#354740]/50 text-[10px] text-[#AAB9B3] animate-in fade-in duration-150">
              <div className="flex justify-between">
                <span>{t('factor_distance')}:</span>
                <span className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-[#D5FA63]'}`}>
                  {tournament.fitFactors.distanceFit}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('factor_surface')}:</span>
                <span className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-[#6677FF]'}`}>
                  {tournament.fitFactors.surfaceFit}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('factor_rating')}:</span>
                <span className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-[#A78BFA]'}`}>
                  {tournament.fitFactors.ratingFit}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('factor_category')}:</span>
                <span className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-[#F3F5F0]'}`}>
                  {tournament.fitFactors.categoryFit}%
                </span>
              </div>
            </div>
          )}
        </div>}

        {/* Category: Age & Level Badges + Divisions */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {tournament.ageCategory && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              isCompleted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-[#293B35] text-[#D5FA63] border-[#354740]'
            }`}>
              {t('badge_age')}: {tournament.ageCategory}
            </span>
          )}
          {tournament.levelCategory && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              isCompleted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-[#293B35] text-[#6677FF] border-[#354740]'
            }`}>
              {t('badge_level')}: {tournament.levelCategory}
            </span>
          )}
          {tournament.ageDivisions.map((div) => (
            <span
              key={div}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                isCompleted
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-[#151F24] text-[#F3F5F0] border-[#354740]'
              }`}
            >
              {div}
            </span>
          ))}
        </div>
      </div>

      {/* Schedule Dates & Deadlines */}
      <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-xl border text-xs ${
        isCompleted ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-[#151F24]/60 border-[#354740]/60'
      }`}>
        <div>
          <span className="text-[10px] uppercase text-[#AAB9B3] font-bold tracking-wider block">
            {t('dates')}
          </span>
          <div className="flex items-center gap-1 mt-0.5 font-medium">
            <Calendar className="w-3 h-3 text-[#AAB9B3]" />
            <span className={isCompleted ? 'text-slate-400' : 'text-[#F3F5F0]'}>
              {tournament.startDate.slice(5)} ~ {tournament.endDate.slice(5)}
            </span>
          </div>
        </div>

        {tournament.entryDeadline && <div>
          <span className="text-[10px] uppercase text-[#AAB9B3] font-bold tracking-wider block">
            {t('deadline')}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {isCompleted ? (
              <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-slate-500" />
                {t('reg_status_completed')}
              </span>
            ) : isDeadlineSoon ? (
              <span className="text-[#FF5D64] font-bold flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3 h-3" />
                {diffDays === 0 ? t('deadline_today') : t('deadline_left', { days: diffDays })}
              </span>
            ) : isDeadlinePassed ? (
              <span className="text-[#AAB9B3] text-[11px]">{t('deadline_passed')}</span>
            ) : (
              <span className="text-[#D5FA63] font-medium flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" />
                {t('deadline_left', { days: diffDays })}
              </span>
            )}
          </div>
        </div>}
      </div>

      {/* Bottom actions: Details, Save, Official Link */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#354740]/60">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleSaveTournament(tournament.id)}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
              saved
                ? isCompleted
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
                : 'bg-[#293B35] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
            }`}
            title={saved ? t('saved_badge') : t('save_event')}
            aria-label={saved ? t('saved_badge') : t('save_event')}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>

          <a
            href={tournament.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-[#293B35] hover:bg-[#6677FF] hover:text-white text-xs font-semibold text-[#AAB9B3] border border-[#354740] transition-colors flex items-center gap-1"
            title={t('official_link')}
          >
            <span className="hidden sm:inline">{t('official_link')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => openTournamentModal(tournament)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-[#293B35] hover:bg-[#D5FA63] hover:text-[#151F24] text-[#F3F5F0] border border-[#354740]'
          }`}
        >
          <span>{t('view_details')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
