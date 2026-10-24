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

const calculateProfileFit = (tournament: any, profile: any, category: string) => {
  const factors: { distanceFit: number; surfaceFit: number; ratingFit: number; categoryFit: number } = {
    distanceFit: 0, surfaceFit: 0, ratingFit: 0, categoryFit: 0
  };
  const weights = { distanceFit: 20, surfaceFit: 15, ratingFit: 25, categoryFit: 40 };
  const available: Array<keyof typeof factors> = [];

  if (tournament.category === 'both' || tournament.category === category) {
    factors.categoryFit = 100;
    available.push('categoryFit');
  } else if (tournament.category) {
    factors.categoryFit = 0;
    available.push('categoryFit');
  }
  const age = String(profile.ageGroup || '').toUpperCase().match(/U\d{1,2}|18\+|30\+|35\+|40\+|45\+|50\+|OPEN/);
  const divisions = Array.isArray(tournament.ageDivisions) ? tournament.ageDivisions.map((v: string) => String(v).toUpperCase()) : [];
  if (divisions.length && age) {
    factors.categoryFit = Math.round((factors.categoryFit + (divisions.some((v: string) => v.includes(age[0])) ? 100 : 0)) / 2);
  }

  const homeCity = String(profile.homeCity || '').trim().toLowerCase();
  const homeRegion = String(profile.homeProvinceState || '').trim().toLowerCase();
  const city = String(tournament.city || '').trim().toLowerCase();
  const region = String(tournament.stateProvince || '').trim().toLowerCase();
  if (city || region) {
    factors.distanceFit = city && homeCity && city === homeCity ? 100
      : region && homeRegion && region === homeRegion ? 80
      : tournament.country === profile.homeCountry ? 55 : 20;
    available.push('distanceFit');
  }

  const preferredSurfaces = Array.isArray(profile.preferredSurfaces) ? profile.preferredSurfaces : [];
  if (tournament.surface) {
    factors.surfaceFit = preferredSurfaces.some((surface: string) =>
      String(surface).toLowerCase() === String(tournament.surface).toLowerCase()
    ) ? 100 : 30;
    available.push('surfaceFit');
  }

  const eventLevel = String(tournament.levelCategory || '');
  const profileLevel = String(profile.utrRating || '') + ' ' + String(profile.nationalRating || '');
  if (eventLevel && profileLevel.trim()) {
    const numbers = (value: string) => value.match(/\d+(?:\.\d+)?/g) || [];
    const eventNumbers = numbers(eventLevel);
    const profileNumbers = numbers(profileLevel);
    factors.ratingFit = eventNumbers.length && profileNumbers.length
      ? (eventNumbers.some((n: string) => profileNumbers.includes(n)) ? 100 : 45)
      : 60;
    available.push('ratingFit');
  }

  const totalWeight = available.reduce((sum, key) => sum + weights[key], 0);
  const fitScore = totalWeight
    ? Math.round(available.reduce((sum, key) => sum + factors[key] * weights[key], 0) / totalWeight)
    : 0;
  return { ...tournament, fitScore, fitFactors: factors, fitScoreAvailable: available.length > 0 };
};

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
    setSortBy,
    openTournamentModal
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

  const scoredTournaments = useMemo(() => tournaments.map((tournament) => calculateProfileFit(tournament, playerProfile, category)), [tournaments, playerProfile, category]);

  const filteredTournaments = useMemo(() => {
    return scoredTournaments
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
          const matchDiv = t.ageDivisions.some((d: string) => d.toLowerCase().includes(selectedAge.toLowerCase()));
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
  }, [scoredTournaments, category, selectedCountry, selectedSurface, selectedAge, selectedLevel, searchQuery, sortBy]);

  const recommendedTournament = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return scoredTournaments
      .filter((t: any) => t.fitScoreAvailable && (!t.startDate || t.startDate >= today))
      .filter((t: any) => category === 'junior' ? t.category !== 'adult' : t.category !== 'junior')
      .sort((a: any, b: any) => b.fitScore - a.fitScore || String(a.startDate || '9999').localeCompare(String(b.startDate || '9999')))[0];
  }, [scoredTournaments, category]);

  const profileName = String(playerProfile.name || '').trim();
  const showWelcome = Boolean(profileName && !( ['leo zhang', 'your name', ''] as string[]).includes(profileName.toLowerCase()));

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
    <div className="space-y-4 pb-20">
      {showWelcome && (
        <section className="space-y-3">
          <div className="px-1 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#AAB9B3]">AuraTennis</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F3F5F0]">{t('welcome_player', { name: profileName })}</h1>
            <p className="mt-1 text-sm text-[#AAB9B3]">{t('welcome_subtitle')}</p>
          </div>
          {recommendedTournament && (
            <button type="button" onClick={() => openTournamentModal(recommendedTournament)} className="w-full text-left rounded-2xl border border-[#52664B] bg-gradient-to-br from-[#20352F] to-[#293B35] p-4 sm:p-5 hover:border-[#D5FA63] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-[#D5FA63]">{t('sort_fit')}</p>
                  <h2 className="mt-1 text-base sm:text-lg font-extrabold text-[#F3F5F0]">{recommendedTournament.title}</h2>
                  <p className="mt-1 text-xs text-[#AAB9B3]">{[recommendedTournament.city, recommendedTournament.stateProvince].filter(Boolean).join(', ')}</p>
                  <p className="mt-2 text-xs text-[#AAB9B3]">{recommendedTournament.startDate || t('dates')}: {recommendedTournament.startDate || '—'}</p>
                </div>
                <div className="shrink-0 rounded-xl bg-[#D5FA63] px-3 py-2 text-center text-[#151F24]">
                  <span className="block text-2xl font-black">{recommendedTournament.fitScore}%</span>
                  <span className="text-[10px] font-bold uppercase">{t('fit_score')}</span>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#D5FA63]">{t('view_details')} →</p>
            </button>
          )}
        </section>
      )}

      {/* Search first, followed by optional filters */}

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
