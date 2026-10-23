import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PlayerCategory,
  PlayerProfile,
  SavedTournamentRecord,
  RegistrationStatus,
  MatchNote,
  Tournament
} from '../types';
import { SAMPLE_TOURNAMENTS } from '../data/sampleTournaments';

interface AppContextType {
  activeTab: 'dashboard' | 'events' | 'profile' | 'notes';
  setActiveTab: (tab: 'dashboard' | 'events' | 'profile' | 'notes') => void;
  category: PlayerCategory;
  setCategory: (category: PlayerCategory) => void;
  playerProfile: PlayerProfile;
  updatePlayerProfile: (updates: Partial<PlayerProfile>) => void;
  savedTournaments: SavedTournamentRecord[];
  toggleSaveTournament: (tournamentId: string) => void;
  updateTournamentStatus: (tournamentId: string, status: RegistrationStatus) => void;
  isTournamentSaved: (tournamentId: string) => boolean;
  getTournamentStatus: (tournamentId: string) => RegistrationStatus | null;
  notes: MatchNote[];
  addNote: (note: Omit<MatchNote, 'id' | 'createdAt'>) => void;
  updateNote: (note: MatchNote) => void;
  deleteNote: (id: string) => void;
  tournaments: Tournament[];
  activeModalTournament: Tournament | null;
  openTournamentModal: (tournament: Tournament) => void;
  closeTournamentModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountry: 'All' | 'Canada' | 'United States';
  setSelectedCountry: (country: 'All' | 'Canada' | 'United States') => void;
  selectedSurface: string;
  setSelectedSurface: (surface: string) => void;
  selectedAge: string;
  setSelectedAge: (age: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  sortBy: 'fit' | 'date' | 'deadline' | 'distance';
  setSortBy: (sort: 'fit' | 'date' | 'deadline' | 'distance') => void;
  createNoteForTournament: (tournament: Tournament) => void;
}

const defaultJuniorProfile: PlayerProfile = {
  name: 'Leo Zhang',
  category: 'junior',
  ageGroup: 'U14',
  utrRating: '6.8',
  nationalRating: 'TC 5.2 (BC Ranked #12)',
  tennisCanadaPin: 'BC-2012-9844',
  ustaId: '202688401',
  homeCity: 'Vancouver',
  homeProvinceState: 'BC',
  homeCountry: 'Canada',
  preferredSurfaces: ['Indoor Hard', 'Hard'],
  maxTravelKm: 150,
  playStyle: 'Aggressive Baseliner',
  racketModel: 'Babolat Pure Aero (300g)'
};

const defaultAdultProfile: PlayerProfile = {
  name: 'Leo Zhang',
  category: 'adult',
  ageGroup: 'NTRP 4.0 / Open',
  utrRating: '7.4',
  nationalRating: 'Tennis Canada 4.5 / NTRP 4.0',
  tennisCanadaPin: 'BC-1996-4122',
  ustaId: '202511993',
  homeCity: 'Vancouver',
  homeProvinceState: 'BC',
  homeCountry: 'Canada',
  preferredSurfaces: ['Indoor Hard', 'Hard'],
  maxTravelKm: 200,
  playStyle: 'All-Court Counterpuncher',
  racketModel: 'Head Speed MP (310g)'
};

const initialSavedRecords: SavedTournamentRecord[] = [
  {
    tournamentId: 't-bc-jr-selection-1',
    status: 'registered',
    savedAt: '2026-10-12T10:00:00Z',
    targetDivision: 'U14'
  },
  {
    tournamentId: 't-vancouver-lawn-adult-open',
    status: 'interested',
    savedAt: '2026-10-14T14:30:00Z',
    targetDivision: 'NTRP 4.0'
  }
];

const initialNotes: MatchNote[] = [
  {
    id: 'note-1',
    tournamentId: 't-bc-jr-selection-1',
    tournamentTitle: 'Tennis BC Provincial Junior Selection Series #1',
    opponentName: 'Marcus Chen',
    date: '2026-10-24',
    surface: 'Indoor Hard',
    matchType: 'Singles',
    result: 'scheduled',
    racketTension: '52 lbs (Poly)',
    tags: ['Quarterfinal Prep', 'Heavy Spin', 'Indoor Bounce'],
    keyTakeaways: [
      'Opponent possesses heavy topspin forehand; keep balls deep into his backhand',
      'Attack second serve early by stepping inside baseline',
      'Maintain 70%+ first serve percentage in key game points'
    ],
    tacticalNotes: 'Marcus likes high ball tempo on forehand wing. Use sliced low backhands to disrupt rhythm and take time away at net.',
    createdAt: '2026-10-14T18:00:00Z'
  },
  {
    id: 'note-2',
    tournamentId: 't-vancouver-lawn-adult-open',
    tournamentTitle: 'Vancouver Lawn Tennis & Badminton Club Masters & Open',
    opponentName: 'David Miller',
    date: '2026-10-29',
    surface: 'Indoor Hard',
    matchType: 'Singles',
    result: 'scheduled',
    racketTension: '50 lbs (Hybrid Gut/Poly)',
    tags: ['Serve & Volley Prep', 'Fast Indoor Courts'],
    keyTakeaways: [
      'David charges net often behind flat serve; prepare low dipping passing shots',
      'Lob over backhand side when he crowds the net'
    ],
    tacticalNotes: 'Keep return of serve low at his shoelaces. Do not feed pace to his forehand volley.',
    createdAt: '2026-10-15T09:00:00Z'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'profile' | 'notes'>('dashboard');

  const [category, setCategoryState] = useState<PlayerCategory>(() => {
    try {
      const saved = localStorage.getItem('aura_tennis_category');
      if (saved === 'junior' || saved === 'adult') return saved;
    } catch {
      // fallback
    }
    return 'junior';
  });

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem('aura_tennis_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return category === 'junior' ? defaultJuniorProfile : defaultAdultProfile;
  });

  const [savedTournaments, setSavedTournaments] = useState<SavedTournamentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aura_tennis_saved_tournaments');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialSavedRecords;
  });

  const [notes, setNotes] = useState<MatchNote[]>(() => {
    try {
      const saved = localStorage.getItem('aura_tennis_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialNotes;
  });

  const [activeModalTournament, setActiveModalTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadTournaments() {
      try {
        const response = await fetch('/data/tournaments.json');
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data.events)) throw new Error('Tournament JSON does not contain an events array');

        const mapped: Tournament[] = data.events
          .filter((event: any) => event && typeof event.title === 'string' && event.title.trim() && event.officialUrl)
          .map((event: any, index: number) => {
            const ages: string[] = Array.isArray(event.ageDivisions) ? event.ageDivisions : [];
            const inferredCategory = event.category === 'junior' || event.category === 'adult'
              ? event.category
              : (ages.some((age) => /^U\d+|RISING STARS/i.test(age)) ? 'junior' : 'adult');
            const country = event.country === 'United States' ? 'United States' : 'Canada';
            const sanctioningBody: Tournament['sanctioningBody'] =
              event.sourceId === 'usta' ? 'USTA' :
              event.sourceId === 'tennis-bc' ? 'Tennis BC' : 'Tennis Canada';
            const rawLevel = (typeof event.tags === 'string' && event.tags.match(/\b(?:\d+(?:\.\d+)?\s*Star|\d+\s*Star|NTRP\s*[\d.]+|Level\s*\d+)\b/i)?.[0]) || '';
            return {
              id: `real-${event.sourceId || 'tournament'}-${event.startDate || 'undated'}-${index}`,
              title: event.title,
              sanctioningBody,
              officialUrl: event.officialUrl,
              sourceId: event.sourceId || '',
              venueName: event.venueName || '',
              address: '',
              city: event.city || '',
              stateProvince: event.province || event.state || '',
              country,
              distanceKm: 0,
              category: inferredCategory,
              ageDivisions: ages,
              ageCategory: ages.join(', '),
              levelCategory: rawLevel,
              surface: '' as Tournament['surface'],
              indoor: false,
              startDate: event.startDate || '',
              endDate: event.endDate || '',
              entryDeadline: event.entryDeadline || '',
              entryFee: event.entryFee || '',
              fitScore: 0,
              fitFactors: { distanceFit: 0, surfaceFit: 0, ratingFit: 0, categoryFit: 0 },
            };
          });

        if (!cancelled && mapped.length > 0) {
          setTournaments(mapped);
          console.log('AURA real tournament data loaded:', mapped.length);
        } else if (!cancelled) {
          console.warn('Tournament JSON returned no events; keeping current list.');
        }
      } catch (error) {
        console.error('Could not load tournament JSON; keeping current list:', error);
      }
    }

    loadTournaments();
    return () => { cancelled = true; };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<'All' | 'Canada' | 'United States'>('All');
  const [selectedSurface, setSelectedSurface] = useState<string>('All');
  const [selectedAge, setSelectedAge] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'fit' | 'date' | 'deadline' | 'distance'>('fit');

  // Sync category change
  const setCategory = (newCat: PlayerCategory) => {
    setCategoryState(newCat);
    try {
      localStorage.setItem('aura_tennis_category', newCat);
    } catch {
      // ignore
    }
  };

  // Sync profile changes
  const updatePlayerProfile = (updates: Partial<PlayerProfile>) => {
    setPlayerProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('aura_tennis_profile', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_tennis_saved_tournaments', JSON.stringify(savedTournaments));
    } catch {
      // ignore
    }
  }, [savedTournaments]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_tennis_notes', JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const toggleSaveTournament = (tournamentId: string) => {
    setSavedTournaments((prev) => {
      const exists = prev.find((item) => item.tournamentId === tournamentId);
      if (exists) {
        return prev.filter((item) => item.tournamentId !== tournamentId);
      } else {
        return [
          ...prev,
          {
            tournamentId,
            status: 'interested',
            savedAt: new Date().toISOString()
          }
        ];
      }
    });
  };

  const updateTournamentStatus = (tournamentId: string, status: RegistrationStatus) => {
    setSavedTournaments((prev) => {
      const index = prev.findIndex((item) => item.tournamentId === tournamentId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], status };
        return updated;
      } else {
        return [
          ...prev,
          {
            tournamentId,
            status,
            savedAt: new Date().toISOString()
          }
        ];
      }
    });
  };

  const isTournamentSaved = (tournamentId: string): boolean => {
    return savedTournaments.some((item) => item.tournamentId === tournamentId);
  };

  const getTournamentStatus = (tournamentId: string): RegistrationStatus | null => {
    const item = savedTournaments.find((t) => t.tournamentId === tournamentId);
    return item ? item.status : null;
  };

  const addNote = (newNoteData: Omit<MatchNote, 'id' | 'createdAt'>) => {
    const newNote: MatchNote = {
      ...newNoteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (updatedNote: MatchNote) => {
    setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const openTournamentModal = (tournament: Tournament) => {
    setActiveModalTournament(tournament);
  };

  const closeTournamentModal = () => {
    setActiveModalTournament(null);
  };

  const createNoteForTournament = (tournament: Tournament) => {
    setActiveModalTournament(null);
    setActiveTab('notes');
    // We can signal adding a note for this tournament
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        category,
        setCategory,
        playerProfile,
        updatePlayerProfile,
        savedTournaments,
        toggleSaveTournament,
        updateTournamentStatus,
        isTournamentSaved,
        getTournamentStatus,
        notes,
        addNote,
        updateNote,
        deleteNote,
        tournaments,
        activeModalTournament,
        openTournamentModal,
        closeTournamentModal,
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
        createNoteForTournament
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
