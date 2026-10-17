import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { TournamentCard } from './TournamentCard';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Zap,
  RefreshCw,
  Filter,
  Layers,
  Users,
  ChevronDown,
  X
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    tournaments,
    category,
    playerProfile,
    searchQuery,
    setSearchQuery,
    selectedCountry,
    setSelectedCountry,
    selectedSurface,
    setSelectedSurface,
    selectedAge,
    setSelectedAge,
    selectedLevel,
    setSelectedLevel,
    sortBy,
    setSortBy
  } = useApp();
  const { t } = useLanguage();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Dynamic age options based on active category
  const ageOptions = useMemo(() => {
    if (category === 'junior') {
      return ['All', 'U12', 'U14', 'U16', 'U18'];
    }
    return ['All', 'Adult 18+', 'Adult 35+', 'Adult Open', 'Open'];
  }, [category]);

  // Dynamic level options based on active category
  const levelOptions = useMemo(() => {
    if (category === 'junior') {
      return [
        'All',
        'Tier 1 Selection',
        'Tier 2 Open',
        'USTA Level 4 (Championship)',
        'USTA Level 5',
        'Development Tier'
      ];
    }
    return [
      'All',
      'NTRP 3.5 - 4.0',
      'NTRP 4.0',
      'NTRP 4.5',
      'NTRP 4.0 - Open'
    ];
  }, [category]);

  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter((t) => {
        // Filter by Junior / Adult category
        if (category === 'junior' && t.category === 'adult') return false;
        if (category === 'adult' && t.category === 'junior') return false;

        // Filter by country
        if (selectedCountry === 'Canada' && t.country !== 'Canada') return false;
        if (selectedCountry === 'United States' && t.country !== 'United States') return false;

        // Filter by surface
        if (selectedSurface !== 'All' && !t.surface.toLowerCase().includes(selectedSurface.toLowerCase())) {
          return false;
        }

        // Filter by Age category
        if (selectedAge !== 'All') {
          const matchAgeCat = t.ageCategory?.toLowerCase() === selectedAge.toLowerCase();
          const matchDiv = t.ageDivisions.some((d) => d.toLowerCase().includes(selectedAge.toLowerCase()));
          if (!matchAgeCat && !matchDiv) return false;
        }

        // Filter by Level category
        if (selectedLevel !== 'All') {
          const matchLevel = t.levelCategory?.toLowerCase().includes(selectedLevel.toLowerCase());
          const matchTitle = t.title.toLowerCase().includes(selectedLevel.toLowerCase());
          if (!matchLevel && !matchTitle) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchVenue = t.venueName.toLowerCase().includes(q);
          const matchCity = t.city.toLowerCase().includes(q);
          const matchDiv = t.ageDivisions.some((d) => d.toLowerCase().includes(q));
          const matchSanction = t.sanctioningBody.toLowerCase().includes(q);
          const matchAge = t.ageCategory?.toLowerCase().includes(q);
          const matchLvl = t.levelCategory?.toLowerCase().includes(q);
          if (!matchTitle && !matchVenue && !matchCity && !matchDiv && !matchSanction && !matchAge && !matchLvl) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'fit') return b.fitScore - a.fitScore;
        if (sortBy === 'date') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (sortBy === 'deadline') return new Date(a.entryDeadline).getTime() - new Date(b.entryDeadline).getTime();
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        return 0;
      });
  }, [tournaments, category, selectedCountry, selectedSurface, selectedAge, selectedLevel, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All');
    setSelectedSurface('All');
    setSelectedAge('All');
    setSelectedLevel('All');
  };

  const activeFilterCount =
    (selectedCountry !== 'All' ? 1 : 0) +
    (selectedSurface !== 'All' ? 1 : 0) +
    (selectedAge !== 'All' ? 1 : 0) +
    (selectedLevel !== 'All' ? 1 : 0);

  return (
    <div className="space-y-3.5 pb-20">
      {/* Compact Mobile-Friendly Top Strip */}
      <div className="bg-[#20352F] border border-[#354740] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-xs flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#D5FA63] text-[#151F24] shrink-0 uppercase tracking-wider">
            {category === 'junior' ? t('category_junior') : t('category_adult')}
          </span>
          <div className="min-w-0 flex items-center gap-1.5 text-xs text-[#AAB9B3] truncate">
            <MapPin className="w-3 h-3 text-[#D5FA63] shrink-0" />
            <span className="truncate">{playerProfile.homeCity}, {playerProfile.homeProvinceState}</span>
            <span className="text-[#354740] shrink-0">•</span>
            <span className="text-[#F3F5F0] font-semibold shrink-0">
              {t('events_count', { count: filteredTournaments.length })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-[11px] font-bold text-[#D5FA63]">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span className="hidden xs:inline">{t('fit_score')}</span>
        </div>
      </div>

      {/* Unified Search Bar & Quick Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB9B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-[#20352F] border border-[#354740] focus:border-[#D5FA63] focus:ring-1 focus:ring-[#D5FA63] rounded-xl pl-9 pr-8 py-2 text-xs md:text-sm text-[#F3F5F0] placeholder-[#AAB9B3]/60 outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#AAB9B3] hover:text-[#F3F5F0]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button with Badge Count */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
            showAdvancedFilters || activeFilterCount > 0
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63] shadow-xs'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{t('filters_label')}</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#151F24] text-[#D5FA63] text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Horizontal Fast-Access Region Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCountry('All')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedCountry === 'All'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          {t('filter_all_regions')}
        </button>
        <button
          type="button"
          onClick={() => setSelectedCountry('Canada')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
            selectedCountry === 'Canada'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          <span>🇨🇦</span>
          <span>{t('filter_canada_only')}</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCountry('United States')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
            selectedCountry === 'United States'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] hover:text-[#F3F5F0] border-[#354740]'
          }`}
        >
          <span>🇺🇸</span>
          <span>{t('filter_usa_only')}</span>
        </button>

        {/* Quick Age Chip dropdown */}
        <select
          value={selectedAge}
          onChange={(e) => setSelectedAge(e.target.value)}
          className={`text-xs font-semibold px-2 py-1 rounded-lg border outline-hidden cursor-pointer whitespace-nowrap ${
            selectedAge !== 'All'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] border-[#354740]'
          }`}
          aria-label={t('filter_age')}
        >
          <option value="All">{t('filter_age')}: {t('filter_all_ages')}</option>
          {ageOptions.filter((a) => a !== 'All').map((age) => (
            <option key={age} value={age}>
              {t('badge_age')}: {age}
            </option>
          ))}
        </select>

        {/* Quick Level Chip dropdown */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className={`text-xs font-semibold px-2 py-1 rounded-lg border outline-hidden cursor-pointer whitespace-nowrap ${
            selectedLevel !== 'All'
              ? 'bg-[#D5FA63] text-[#151F24] border-[#D5FA63]'
              : 'bg-[#20352F] text-[#AAB9B3] border-[#354740]'
          }`}
          aria-label={t('filter_level')}
        >
          <option value="All">{t('filter_level')}: {t('filter_all_levels')}</option>
          {levelOptions.filter((l) => l !== 'All').map((lvl) => (
            <option key={lvl} value={lvl}>
              {t('badge_level')}: {lvl}
            </option>
          ))}
        </select>
      </div>

      {/* Expandable Advanced Filter Panel on Mobile */}
      {showAdvancedFilters && (
        <div className="bg-[#20352F] p-3.5 rounded-2xl border border-[#354740] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F3F5F0] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D5FA63]" />
              <span>{t('refine_filters')}</span>
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#D5FA63] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t('reset_filters')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Age Filter */}
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider block truncate">
                {t('filter_age')}
              </label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full max-w-full bg-[#151F24] border border-[#354740] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F5F0] font-semibold outline-hidden truncate"
              >
                <option value="All">{t('filter_all_ages')}</option>
                {ageOptions.filter((a) => a !== 'All').map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider block truncate">
                {t('filter_level')}
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full max-w-full bg-[#151F24] border border-[#354740] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F5F0] font-semibold outline-hidden truncate"
              >
                <option value="All">{t('filter_all_levels')}</option>
                {levelOptions.filter((l) => l !== 'All').map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Surface Filter */}
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider block truncate">
                {t('filter_surface')}
              </label>
              <select
                value={selectedSurface}
                onChange={(e) => setSelectedSurface(e.target.value)}
                className="w-full max-w-full bg-[#151F24] border border-[#354740] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F5F0] font-semibold outline-hidden truncate"
              >
                <option value="All">{t('filter_all_surfaces')}</option>
                <option value="Indoor Hard">Indoor Hard</option>
                <option value="Hard">Hard</option>
                <option value="Clay">Clay</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] uppercase font-bold text-[#AAB9B3] tracking-wider block truncate">
                {t('sort_by')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full max-w-full bg-[#151F24] border border-[#354740] rounded-lg px-2.5 py-1.5 text-xs text-[#F3F5F0] font-semibold outline-hidden truncate"
              >
                <option value="fit">{t('sort_fit')}</option>
                <option value="date">{t('sort_date')}</option>
                <option value="deadline">{t('sort_deadline')}</option>
                <option value="distance">{t('sort_distance')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#AAB9B3] px-1 pt-0.5">
        <span className="font-semibold text-[#F3F5F0]">
          {t('showing_tournaments', { count: filteredTournaments.length })}
        </span>
        {(searchQuery || activeFilterCount > 0) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[#D5FA63] hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{t('reset_filters')}</span>
          </button>
        )}
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <div className="bg-[#20352F] border border-[#354740] rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-[#F3F5F0]">
            {t('no_tournaments_found')}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-[#D5FA63] text-[#151F24] text-xs font-bold transition-all shadow-sm"
          >
            {t('reset_filters')}
          </button>
        </div>
      )}
    </div>
  );
};
