export type Language = 'en' | 'ko' | 'zh-CN';

export type ThemeMode = 'dark' | 'light';

export type PlayerCategory = 'junior' | 'adult';

export type SurfaceType = 'Hard' | 'Clay' | 'Grass' | 'Carpet' | 'Indoor Hard';

export type SourceStatus = 'Connected' | 'Link Only' | 'Planned' | 'Demo';

export interface DataSource {
  id: string;
  name: string;
  country: 'Canada' | 'United States' | 'Global';
  coverageArea: string;
  distanceInfo: string;
  purpose: string;
  url: string;
  status: SourceStatus;
  isFutureExpansion: boolean;
  lastVerifiedDate?: string;
  description: string;
}

export type TournamentCategory = 'junior' | 'adult' | 'both';

export type TournamentStatus = 'upcoming' | 'open' | 'closing_soon' | 'closed' | 'completed';

export interface Tournament {
  id: string;
  title: string;
  sanctioningBody: 'Tennis BC' | 'Tennis Canada' | 'USTA' | 'ITF' | 'UTR';
  officialUrl: string;
  sourceId: string;
  venueName: string;
  address: string;
  city: string;
  stateProvince: string;
  country: 'Canada' | 'United States';
  distanceKm: number;
  category: TournamentCategory;
  ageDivisions: string[]; // e.g. ["U12", "U14", "U16", "U18"] or ["NTRP 3.5", "NTRP 4.0", "Open"]
  ageCategory?: string; // e.g. 'U12', 'U14', 'U16', 'U18', 'Open', '35+'
  levelCategory?: string; // e.g. 'Tier 1 Provincial', 'Regional Open', 'USTA L4-L5', 'NTRP 4.0'
  surface: SurfaceType;
  indoor: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  entryDeadline: string; // YYYY-MM-DD
  withdrawalDeadline?: string;
  entryFee: string;
  drawSize?: string;
  sanctionCode?: string;
  matchFormat?: string;
  fitScore: number; // 0 - 100 calculated dynamically
  fitFactors: {
    distanceFit: number; // 0 - 100
    surfaceFit: number;  // 0 - 100
    ratingFit: number;   // 0 - 100
    categoryFit: number; // 0 - 100
  };
  notes?: string;
  isNew?: boolean;
}

export type RegistrationStatus = 'interested' | 'registered' | 'waitlisted' | 'completed' | 'withdrawn';

export interface SavedTournamentRecord {
  tournamentId: string;
  status: RegistrationStatus;
  savedAt: string;
  customNotes?: string;
  targetDivision?: string;
}

export interface MatchNote {
  id: string;
  tournamentId?: string;
  tournamentTitle?: string;
  opponentName?: string;
  date: string;
  surface?: SurfaceType | string;
  matchType?: 'Singles' | 'Doubles' | 'Practice';
  result?: 'win' | 'loss' | 'scheduled';
  score?: string;
  racketTension?: string;
  tags: string[];
  keyTakeaways: string[];
  tacticalNotes: string;
  createdAt: string;
}

export interface PlayerProfile {
  name: string;
  category: PlayerCategory;
  ageGroup: string; // e.g., 'U14' or 'Adult 4.0'
  utrRating: string; // e.g., '6.4'
  nationalRating: string; // e.g., 'Tennis Canada 5.0' or 'USTA NTRP 4.0'
  tennisCanadaPin?: string;
  ustaId?: string;
  homeCity: string;
  homeProvinceState: string;
  homeCountry: 'Canada' | 'United States';
  preferredSurfaces: SurfaceType[];
  maxTravelKm: number;
  playStyle: string; // e.g., 'Aggressive Baseliner', 'All-Court Player'
  racketModel: string;
}
