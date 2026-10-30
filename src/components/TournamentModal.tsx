import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { RegistrationStatus } from '../types';
import {
  X,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Trophy,
  CheckCircle2,
  FilePlus2,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export const TournamentModal: React.FC = () => {
  const {
    activeModalTournament,
    closeTournamentModal,
    getTournamentStatus,
    updateTournamentStatus,
    createNoteForTournament
  } = useApp();
  const { t } = useLanguage();

  if (!activeModalTournament) return null;

  const currentStatus = getTournamentStatus(activeModalTournament.id);

  const statusOptions: { value: RegistrationStatus; label: string }[] = [
    { value: 'interested', label: t('reg_status_interested') },
    { value: 'registered', label: t('reg_status_registered') },
    { value: 'waitlisted', label: t('reg_status_waitlisted') },
    { value: 'completed', label: t('reg_status_completed') }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#20352F] border border-[#354740] rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#151F24] p-4 md:p-5 border-b border-[#354740] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#20352F] text-[#D5FA63] border border-[#354740]">
                {activeModalTournament.sanctioningBody}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#293B35] text-[#A78BFA]">
                {activeModalTournament.surface}
              </span>
              {activeModalTournament.sanctionCode && (
                <span className="text-[10px] text-[#AAB9B3] font-mono">
                  {t('modal_sanction_code')}: {activeModalTournament.sanctionCode}
                </span>
              )}
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#F3F5F0] leading-snug">
              {activeModalTournament.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeTournamentModal}
            className="p-1.5 rounded-lg bg-[#293B35] hover:bg-[#354740] text-[#AAB9B3] hover:text-[#F3F5F0] transition-colors shrink-0"
            aria-label={t('modal_close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Fit Score Analysis Box */}
          <div className="p-4 rounded-xl bg-[#151F24] border border-[#354740] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D5FA63]" />
                <h4 className="font-bold text-sm text-[#F3F5F0]">
                  {t('modal_why_fit')}
                </h4>
              </div>
              <div className="px-3 py-1 rounded-lg bg-[#D5FA63] text-[#151F24] font-black text-sm">
                {activeModalTournament.fitScore}% {t('fit_score')}
              </div>
            </div>

            <p className="text-xs text-[#AAB9B3] leading-relaxed">
              {t('fit_explanation')}
            </p>

            {/* Factor Bars */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#AAB9B3]">{t('factor_distance')}</span>
                  <span className="text-[#D5FA63] font-semibold">{activeModalTournament.fitFactors.distanceFit}%</span>
                </div>
                <div className="w-full bg-[#293B35] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#D5FA63] h-full rounded-full" 
                    style={{ width: `${activeModalTournament.fitFactors.distanceFit}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#AAB9B3]">{t('factor_surface')}</span>
                  <span className="text-[#6677FF] font-semibold">{activeModalTournament.fitFactors.surfaceFit}%</span>
                </div>
                <div className="w-full bg-[#293B35] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#6677FF] h-full rounded-full" 
                    style={{ width: `${activeModalTournament.fitFactors.surfaceFit}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#AAB9B3]">{t('factor_rating')}</span>
                  <span className="text-[#A78BFA] font-semibold">{activeModalTournament.fitFactors.ratingFit}%</span>
                </div>
                <div className="w-full bg-[#293B35] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#A78BFA] h-full rounded-full" 
                    style={{ width: `${activeModalTournament.fitFactors.ratingFit}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#AAB9B3]">{t('factor_category')}</span>
                  <span className="text-[#F3F5F0] font-semibold">{activeModalTournament.fitFactors.categoryFit}%</span>
                </div>
                <div className="w-full bg-[#293B35] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#F3F5F0] h-full rounded-full" 
                    style={{ width: `${activeModalTournament.fitFactors.categoryFit}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#293B35] border border-[#354740] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#D5FA63]" /> {t('venue')}
              </span>
              <p className="font-semibold text-[#F3F5F0]">{activeModalTournament.venueName}</p>
              <p className="text-[#AAB9B3] text-[11px]">{activeModalTournament.address}</p>
              <p className="text-[#6677FF] font-medium text-[11px]">
                {t('distance_from_base', { distance: activeModalTournament.distanceKm })}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#293B35] border border-[#354740] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#D5FA63]" /> {t('dates')} & {t('deadline')}
              </span>
              <p className="text-[#F3F5F0]">
                <strong className="text-[#AAB9B3] font-normal">{t('dates')}: </strong>
                {activeModalTournament.startDate} to {activeModalTournament.endDate}
              </p>
              <p className="text-[#FF5D64] font-semibold">
                <strong className="text-[#AAB9B3] font-normal">{t('deadline')}: </strong>
                {activeModalTournament.entryDeadline}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#293B35] border border-[#354740] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#D5FA63]" /> {t('entry_fee')}
              </span>
              <p className="font-bold text-sm text-[#D5FA63]">{activeModalTournament.entryFee}</p>
              {activeModalTournament.drawSize && (
                <p className="text-[#AAB9B3] text-[11px]">{activeModalTournament.drawSize}</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#293B35] border border-[#354740] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#D5FA63]" /> {t('format')}
              </span>
              <p className="text-[#F3F5F0] text-[11px] leading-relaxed">{activeModalTournament.matchFormat}</p>
            </div>
          </div>

          {/* Category: Age, Level & Divisions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#AAB9B3] uppercase tracking-wider block">
              {t('divisions')} & {t('filter_level')}
            </span>
            <div className="flex flex-wrap gap-2">
              {activeModalTournament.ageCategory && (
                <span className="px-2.5 py-1 rounded-lg bg-[#293B35] text-xs font-bold text-[#D5FA63] border border-[#354740]">
                  {t('badge_age')}: {activeModalTournament.ageCategory}
                </span>
              )}
              {activeModalTournament.levelCategory && (
                <span className="px-2.5 py-1 rounded-lg bg-[#293B35] text-xs font-bold text-[#6677FF] border border-[#354740]">
                  {t('badge_level')}: {activeModalTournament.levelCategory}
                </span>
              )}
              {activeModalTournament.ageDivisions.map((div) => (
                <span
                  key={div}
                  className="px-2.5 py-1 rounded-lg bg-[#151F24] text-xs font-semibold text-[#F3F5F0] border border-[#354740]"
                >
                  {div}
                </span>
              ))}
            </div>
          </div>

          {/* Notes or Sanction remarks */}
          {activeModalTournament.notes && (
            <div className="p-3 rounded-xl bg-[#151F24]/60 border border-[#354740]/60 text-xs text-[#AAB9B3] italic leading-relaxed">
              "{activeModalTournament.notes}"
            </div>
          )}

          {/* Schedule Status Controls */}
          <div className="p-4 rounded-xl bg-[#293B35] border border-[#354740] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#F3F5F0] flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#D5FA63]" />
                <span>{t('modal_save_status')}</span>
              </label>
              {currentStatus && (
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                  currentStatus === 'completed' ? 'text-slate-400' : 'text-[#D5FA63]'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentStatus === 'completed' ? t('event_unactivated') : t('saved_badge')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((opt) => {
                const isSelected = currentStatus === opt.value;
                const isComp = opt.value === 'completed';
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateTournamentStatus(activeModalTournament.id, isSelected ? null : opt.value)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                      isSelected
                        ? isComp
                          ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                          : 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63] shadow-xs'
                        : 'bg-[#151F24] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 bg-[#151F24] border-t border-[#354740] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => createNoteForTournament(activeModalTournament)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#293B35] hover:bg-[#354740] text-xs font-semibold text-[#F3F5F0] border border-[#354740] transition-colors"
          >
            <FilePlus2 className="w-4 h-4 text-[#D5FA63]" />
            <span>{t('modal_add_prep_note')}</span>
          </button>

          <a
            href={activeModalTournament.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6677FF] hover:bg-[#5566ee] text-xs font-bold text-white shadow-md transition-all"
          >
            <span>{t('modal_register_btn')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
