import { DataSource } from '../types';

export const OFFICIAL_DATA_SOURCES: DataSource[] = [
  // Canada Primary Sources
  {
    id: 'tennis-bc',
    name: 'Tennis BC',
    country: 'Canada',
    coverageArea: 'British Columbia (Vancouver, Fraser Valley, Okanagan, Island)',
    distanceInfo: 'Local Base Area (0 – 150 km)',
    purpose: 'Provincial Sanctioned Tournament Calendar, Junior Selection Series, Masters Circuit & Adult Tournaments',
    url: 'https://new.tennisbc.org/tournaments/tournament-calendar/',
    status: 'Link Only',
    isFutureExpansion: false,
    description: 'Official governing body for tennis in British Columbia providing sanctioned tournament schedules, rankings, and regulations.'
  },
  {
    id: 'tennis-canada',
    name: 'Tennis Canada',
    country: 'Canada',
    coverageArea: 'National Canada',
    distanceInfo: 'All Provinces & Territories (0 – 4,500 km)',
    purpose: 'National Championships, Transition Tours, National Junior Circuit & National Tournament Calendar',
    url: 'https://www.tenniscanada.com/tournaments',
    status: 'Link Only',
    isFutureExpansion: false,
    description: 'National governing federation governing Canadian competitive tennis pathways, national events, and sanctioning frameworks.'
  },
  {
    id: 'tc-tournament-software',
    name: 'Tennis Canada Tournament Software',
    country: 'Canada',
    coverageArea: 'Canada-wide (All Sanctioned Events)',
    distanceInfo: 'Provincial & National Hubs (0 – 4,500 km)',
    purpose: 'Online Registration, Official Live Draws, Match Schedules & Head-to-Head Player Records',
    url: 'https://tc.tournamentsoftware.com/tournaments',
    status: 'Demo',
    isFutureExpansion: false,
    lastVerifiedDate: '2026-10-15',
    description: 'Official tournament execution platform used by Tennis Canada and provincial associations for draw publishing and score entry.'
  },
  {
    id: 'tc-find',
    name: 'Tournament Discovery (TC Find)',
    country: 'Canada',
    coverageArea: 'Canada-wide Regional Discovery',
    distanceInfo: 'Postal Code & Radius Filtered',
    purpose: 'Geographic Tournament Discovery, Category Filtering & Club Locator',
    url: 'https://tc.tournamentsoftware.com/find',
    status: 'Link Only',
    isFutureExpansion: false,
    description: 'Specialized interactive locator enabling players to discover Canadian tournaments by discipline, age group, and radius.'
  },

  // United States Primary Sources
  {
    id: 'usta-search',
    name: 'USTA Tournament Search',
    country: 'United States',
    coverageArea: 'Pacific Northwest & United States National',
    distanceInfo: 'Cross-Border & National (~60 – 3,500 km)',
    purpose: 'USTA Player App Directory, Junior L1–L7 Tournaments, Adult NTRP & Open Sanctioned Events',
    url: 'https://playerapp.usta.com/en/search/tournaments.html',
    status: 'Demo',
    isFutureExpansion: false,
    lastVerifiedDate: '2026-10-15',
    description: 'Primary search portal on the USTA Player platform for competitive junior and adult tournaments across all US sections.'
  },
  {
    id: 'usta-advanced',
    name: 'USTA Advanced Tournament Search',
    country: 'United States',
    coverageArea: 'United States National Database',
    distanceInfo: 'All 17 USTA Sections',
    purpose: 'Deep Sanction ID Lookup, Historical Archive, Downloadable Schedules & Sectional Calendars',
    url: 'https://tdndownload.usta.com/tournaments/Schedule/Search.aspx',
    status: 'Link Only',
    isFutureExpansion: false,
    description: 'Deep archival and schedule query engine providing complete sanction IDs, director contacts, and section schedules.'
  },
  {
    id: 'usta-playtennis',
    name: 'USTA Tournament Discovery',
    country: 'United States',
    coverageArea: 'United States National & Community',
    distanceInfo: 'Local & Regional Circuits',
    purpose: 'PlayTennis Public Directory, Entry Portals, Community Circuits & Club Events',
    url: 'https://playtennis.usta.com/Tournaments',
    status: 'Link Only',
    isFutureExpansion: false,
    description: 'Modern public directory for discovering community, junior, and adult tournaments hosted at USTA facility networks.'
  },

  // Future Expansion Sources
  {
    id: 'itf-tennis',
    name: 'ITF (International Tennis Federation)',
    country: 'Global',
    coverageArea: 'International & Worldwide Circuit',
    distanceInfo: 'Worldwide Tour Stops',
    purpose: 'ITF World Tennis Juniors (J30 to J500), World Tennis Tour (M15/M25/W15/W35+), Masters Tour',
    url: 'https://www.itftennis.com/',
    status: 'Planned',
    isFutureExpansion: true,
    description: 'Global world governing body managing junior grand slams, global junior circuit grades, and professional transition events.'
  },
  {
    id: 'utr-sports',
    name: 'UTR Sports',
    country: 'Global',
    coverageArea: 'Global & North America',
    distanceInfo: 'Local Clubs & International Showcases',
    purpose: 'Universal Tennis Rating Tournaments, Verified Prize Money Circuits, College Showcases & Flex Leagues',
    url: 'https://www.utrsports.net/',
    status: 'Planned',
    isFutureExpansion: true,
    description: 'Level-based universal rating system and global tournament network hosting verified events for all ages and skill levels.'
  }
];
