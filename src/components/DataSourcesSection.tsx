import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { OFFICIAL_DATA_SOURCES } from '../data/sourcesData';
import { DataSource, SourceStatus } from '../types';
import { ExternalLink, Database, Info, ShieldCheck, MapPin, Sparkles, Clock } from 'lucide-react';

export const DataSourcesSection: React.FC = () => {
  const { t } = useLanguage();

  const canadaSources = OFFICIAL_DATA_SOURCES.filter(
    (s) => !s.isFutureExpansion && s.country === 'Canada'
  );
  const usaSources = OFFICIAL_DATA_SOURCES.filter(
    (s) => !s.isFutureExpansion && s.country === 'United States'
  );
  const futureSources = OFFICIAL_DATA_SOURCES.filter((s) => s.isFutureExpansion);

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case 'Connected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#D5FA63]/20 text-[#D5FA63] border border-[#D5FA63]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D5FA63] animate-pulse" />
            {t('source_status_connected')}
          </span>
        );
      case 'Demo':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#6677FF]/20 text-[#6677FF] border border-[#6677FF]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6677FF]" />
            {t('source_status_demo')}
          </span>
        );
      case 'Link Only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
            {t('source_status_link_only')}
          </span>
        );
      case 'Planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#293B35] text-[#AAB9B3] border border-[#354740]">
            <Clock className="w-2.5 h-2.5" />
            {t('source_status_planned')}
          </span>
        );
    }
  };

  const renderSourceCard = (source: DataSource) => (
    <div
      key={source.id}
      className="p-3.5 rounded-xl bg-[#20352F] border border-[#354740] hover:border-[#6677FF]/40 transition-colors flex flex-col justify-between gap-3 shadow-xs"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-[#F3F5F0] leading-snug">
              {source.name}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-[#AAB9B3] mt-0.5">
              <MapPin className="w-3 h-3 text-[#D5FA63] shrink-0" />
              <span className="truncate">{source.coverageArea}</span>
              <span className="text-[#354740]">•</span>
              <span className="font-medium text-[#6677FF] shrink-0">{source.distanceInfo}</span>
            </div>
          </div>
          <div className="shrink-0">{getStatusBadge(source.status)}</div>
        </div>

        {/* Purpose / Source Type */}
        <div className="mt-2 text-xs text-[#AAB9B3] bg-[#151F24]/60 p-2.5 rounded-lg border border-[#354740]/60 space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AAB9B3]/80">
            {t('source_purpose_label')}
          </div>
          <p className="text-xs text-[#F3F5F0] leading-relaxed">
            {source.purpose}
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-[#354740]/60 flex items-center justify-between gap-2">
        <span className="text-[10px] text-[#AAB9B3] truncate font-mono opacity-70">
          {source.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        </span>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#293B35] hover:bg-[#6677FF] hover:text-white text-xs font-semibold text-[#D5FA63] border border-[#354740] transition-colors shrink-0"
        >
          <span>{t('source_visit_official')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );

  return (
    <section className="space-y-6 pt-2">
      {/* Section Header */}
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#20352F] border border-[#354740] flex items-center justify-center text-[#D5FA63] shrink-0 mt-0.5">
          <Database className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-base text-[#F3F5F0] flex items-center gap-2">
            <span>{t('data_sources_title')}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#20352F] text-[#D5FA63] border border-[#354740]">
              {OFFICIAL_DATA_SOURCES.length} Platforms
            </span>
          </h3>
          <p className="text-xs text-[#AAB9B3] mt-0.5">
            {t('data_sources_subtitle')}
          </p>
        </div>
      </div>

      {/* Freshness & Integrity Notice */}
      <div className="source-freshness-notice p-3.5 rounded-xl border space-y-2">
        <div className="source-notice-title flex items-center gap-2 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>{t('source_disclaimer_title')}</span>
        </div>
        <p className="source-notice-body text-xs leading-relaxed">
          {t('source_disclaimer_text')}
        </p>
        <p className="source-notice-note text-[11px] leading-relaxed italic">
          {t('source_integrity_note')}
        </p>
        <div className="source-notice-verified flex items-center gap-1.5 text-[11px] font-medium pt-1 border-t">
          <Clock className="w-3 h-3" />
          <span>{t('source_last_verified')}</span>
        </div>
      </div>

      {/* Canada Primary Sources */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#D5FA63] flex items-center gap-1.5">
            <span>🇨🇦</span>
            <span>{t('primary_sources_canada')}</span>
          </h4>
          <span className="text-[11px] text-[#AAB9B3]">{canadaSources.length} Sources</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {canadaSources.map(renderSourceCard)}
        </div>
      </div>

      {/* United States Primary Sources */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6677FF] flex items-center gap-1.5">
            <span>🇺🇸</span>
            <span>{t('primary_sources_usa')}</span>
          </h4>
          <span className="text-[11px] text-[#AAB9B3]">{usaSources.length} Sources</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {usaSources.map(renderSourceCard)}
        </div>
      </div>

      {/* Future Expansion Sources */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('future_expansion')}</span>
          </h4>
          <span className="text-[11px] text-[#AAB9B3]">{futureSources.length} Platforms (Planned)</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {futureSources.map(renderSourceCard)}
        </div>
      </div>
    </section>
  );
};
