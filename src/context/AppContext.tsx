import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PlayerCategory,
  PlayerProfile,
  SavedTournamentRecord,
  RegistrationStatus,
  MatchNote,
  Tournament
} from '../types';

interface AppContextType {
  activeTab: 'dashboard' | 'events' | 'profile' | 'notes';
  setActiveTab: (tab: 'dashboard' | 'events' | 'profile' | 'notes') => void;
  category: PlayerCategory;
  setCategory: (category: PlayerCategory) => void;
  playerProfile: PlayerProfile;
  updatePlayerProfile: (updates: Partial<PlayerProfile>) => void;
  savedTournaments: SavedTournamentRecord[];
  toggleSaveTournament: (tournamentId: string) => void;
  updateTournamentStatus: (tournamentId: string, status: RegistrationStatus | null) => void;
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
    return {
      name: '',
      category,
      ageGroup: '',
      utrRating: '',
      nationalRating: '',
      tennisCanadaPin: '',
      ustaId: '',
      homeCity: '',
      homeProvinceState: '',
      homeCountry: 'Canada',
      preferredSurfaces: [],
      maxTravelKm: 100,
      playStyle: '',
      racketModel: ''
    };
  });

  const [savedTournaments, setSavedTournaments] = useState<SavedTournamentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aura_tennis_saved_tournaments');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [notes, setNotes] = useState<MatchNote[]>(() => {
    try {
      const saved = localStorage.getItem('aura_tennis_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
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
          .map((event: any, index: number): Tournament | null => {
            const ages: string[] = Array.isArray(event.ageDivisions) ? event.ageDivisions : [];
            const eventText = String(event.title || '') + ' ' + String(event.tags || '') + ' ' + ages.join(' ');
            const juniorClue = /\b(junior|juniors|boys|girls|under\s*\d{1,2}|U(?:8|9|10|12|14|16|18)|\d{1,2}\s*&\s*under|orange bowl international tennis championship)\b/i.test(eventText);
            const adultClue = /\b(adult|men'?s|women'?s|masters|NTRP|18\+|30\+|35\+|40\+|45\+|50\+|55-95)\b/i.test(eventText);
            const hasJuniorDivision = ages.some((age) => /\bU\d{1,2}\b|RISING STARS|BOYS|GIRLS/i.test(age));
            const category = event.category === 'both'
              ? 'both'
              : (hasJuniorDivision || juniorClue ? 'junior' : (event.category === 'adult' || adultClue ? 'adult' : 'adult'));

            const countryText = String(event.country || '') + ' ' + String(event.tags || '') + ' ' + String(event.title || '');
            const usState = String(event.state || event.province || '').toUpperCase();
            const isUnitedStates =
              /\b(United States|USA|U\.S\.A\.|Host Nation:\s*US\b|Host Nation:\s*USA\b)\b/i.test(countryText) ||
              /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/.test(usState);
            const isCanada = /\b(Canada|CAN|Host Nation:\s*Canada)\b/i.test(countryText);
            // Never silently convert unknown or International events into Canadian events.
            if (!isUnitedStates && !isCanada) return null;
            const country = isUnitedStates ? 'United States' : 'Canada';

            const sanctioningBody: Tournament['sanctioningBody'] =
              event.sourceId === 'usta' ? 'USTA' :
              event.sourceId === 'itf' ? 'ITF' :
              event.sourceId === 'utr' ? 'UTR' :
              event.sourceId === 'tennis-bc' ? 'Tennis BC' : 'Tennis Canada';
            const rawLevel = (typeof event.tags === 'string' && event.tags.match(/\b(?:UTR\s*[\d.]+(?:\s*[-–]\s*[\d.]+)?|NTRP\s*[\d.]+(?:\s*[-–]\s*[\d.]+)?|\d+(?:\.\d+)?\s*Star|Level\s*\d+)\b/i)?.[0]) || '';
            return {
              id: 'real-' + (event.sourceId || 'tournament') + '-' + (event.startDate || 'undated') + '-' + index,
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
              category,
              ageDivisions: ages,
              ageCategory: ages.join(', '),
              levelCategory: rawLevel,
              surface: '' as Tournament['surface'],
              indoor: false,
              startDate: event.startDate || '',
              endDate: event.endDate || '',
              entryDeadline: event.entryDeadline || '',
              entryFee: event.entryFee || '',
              matchFormat: event.matchFormat || '',
              fitScore: 0,
              fitFactors: { distanceFit: 0, surfaceFit: 0, ratingFit: 0, categoryFit: 0 },
            };
          })
          .filter((event: Tournament | null): event is Tournament => event !== null);
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

  // Remove only the known demo records from earlier builds, preserving user-created records.
  useEffect(() => {
    try {
      const savedTournaments = localStorage.getItem('aura_tennis_saved_tournaments');
      if (savedTournaments) {
        const records = JSON.parse(savedTournaments);
        if (Array.isArray(records)) {
          const cleaned = records.filter((record) =>
            !['t-bc-jr-selection-1', 't-vancouver-lawn-adult-open'].includes(record?.tournamentId)
          );
          localStorage.setItem('aura_tennis_saved_tournaments', JSON.stringify(cleaned));
          setSavedTournaments(cleaned);
        }
      }

      const savedNotes = localStorage.getItem('aura_tennis_notes');
      if (savedNotes) {
        const records = JSON.parse(savedNotes);
        if (Array.isArray(records)) {
          const cleaned = records.filter((record) => !['note-1', 'note-2'].includes(record?.id));
          localStorage.setItem('aura_tennis_notes', JSON.stringify(cleaned));
          setNotes(cleaned);
        }
      }

      const savedProfile = localStorage.getItem('aura_tennis_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile?.name === 'Leo Zhang' &&
            ['BC-2012-9844', 'BC-1996-4122'].includes(profile?.tennisCanadaPin)) {
          localStorage.removeItem('aura_tennis_profile');
          localStorage.removeItem('aura_tennis_setup_complete');
          setPlayerProfile({
            name: '',
            category,
            ageGroup: '',
            utrRating: '',
            nationalRating: '',
            tennisCanadaPin: '',
            ustaId: '',
            homeCity: '',
            homeProvinceState: '',
            homeCountry: 'Canada',
            preferredSurfaces: [],
            maxTravelKm: 100,
            playStyle: '',
            racketModel: ''
          });
        }
      }
    } catch {
      // Leave unrecognized local data untouched if it cannot be parsed safely.
    }
  }, []);

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

  const updateTournamentStatus = (tournamentId: string, status: RegistrationStatus | null) => {
    setSavedTournaments((prev) => {
      const existing = prev.find((item) => item.tournamentId === tournamentId);

      // Explicitly clear the tournament when the selected status is tapped again.
      if (status === null || existing?.status === status) {
        return prev.filter((item) => item.tournamentId !== tournamentId);
      }

      if (existing) {
        return prev.map((item) =>
          item.tournamentId === tournamentId ? { ...item, status } : item
        );
      }

      return [
        ...prev,
        {
          tournamentId,
          status,
          savedAt: new Date().toISOString()
        }
      ];
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
