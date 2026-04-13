import { create } from 'zustand';
import { AnimeEntry, DiscoverAnime, FilterOptions, SortOption } from './types';

type Tab = 'watchlist' | 'discover' | 'stats';

interface AnimeStore {
  // Data
  anime: AnimeEntry[];
  isLoading: boolean;
  isEnriching: boolean;
  error: string | null;

  // Filters and sorting
  filters: FilterOptions;
  sortOption: SortOption;

  // UI State
  isDarkMode: boolean;
  viewMode: 'grid' | 'list';
  showModal: boolean;
  editingId: string | null;
  activeTab: Tab;

  // Discover
  discoverAnime: DiscoverAnime[];
  isLoadingDiscover: boolean;
  discoverPage: number;

  // Detail drawer
  selectedAnime: AnimeEntry | null;
  showDetailDrawer: boolean;

  // Actions
  fetchAnime: () => Promise<void>;
  setAnime: (anime: AnimeEntry[]) => void;
  addAnime: (anime: AnimeEntry) => Promise<void>;
  updateAnime: (id: string, anime: Partial<AnimeEntry>) => Promise<void>;
  deleteAnime: (id: string) => Promise<void>;
  enrichMissingImages: () => Promise<{ enriched: number; failed: string[] }>;

  setFilters: (filters: FilterOptions) => void;
  setSortOption: (sort: SortOption) => void;

  setDarkMode: (isDark: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setShowModal: (show: boolean) => void;
  setEditingId: (id: string | null) => void;
  setActiveTab: (tab: Tab) => void;

  setSelectedAnime: (anime: AnimeEntry | null) => void;
  setShowDetailDrawer: (show: boolean) => void;

  fetchDiscoverAnime: (page?: number) => Promise<void>;

  // Derived
  getFilteredAndSortedAnime: () => AnimeEntry[];
}

const useAnimeStore = create<AnimeStore>((set, get) => ({
  // Initial state
  anime: [],
  isLoading: false,
  isEnriching: false,
  error: null,
  filters: {},
  sortOption: { field: 'dateAdded', direction: 'desc' },
  isDarkMode: true,
  viewMode: 'grid',
  showModal: false,
  editingId: null,
  activeTab: 'watchlist',
  discoverAnime: [],
  isLoadingDiscover: false,
  discoverPage: 1,
  selectedAnime: null,
  showDetailDrawer: false,

  // Actions
  fetchAnime: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/anime');
      if (!res.ok) throw new Error('Failed to fetch anime');
      const data = await res.json();
      set({ anime: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setAnime: (anime) => set({ anime }),

  addAnime: async (anime) => {
    try {
      const res = await fetch('/api/anime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anime),
      });
      if (!res.ok) throw new Error('Failed to add anime');
      const added = await res.json();
      set((state) => ({ anime: [added, ...state.anime] }));
    } catch (err: any) {
      console.error(err);
    }
  },

  updateAnime: async (id, updates) => {
    try {
      const payload = { id, ...updates };
      const res = await fetch('/api/anime', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update anime');
      const updated = await res.json();
      set((state) => ({
        anime: state.anime.map((item) => (item.id === id ? updated : item)),
        selectedAnime: state.selectedAnime?.id === id ? updated : state.selectedAnime,
      }));
    } catch (err: any) {
      console.error(err);
    }
  },

  deleteAnime: async (id) => {
    try {
      const res = await fetch(`/api/anime?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete anime');
      set((state) => ({
        anime: state.anime.filter((item) => item.id !== id),
        selectedAnime: state.selectedAnime?.id === id ? null : state.selectedAnime,
        showDetailDrawer: state.selectedAnime?.id === id ? false : state.showDetailDrawer,
      }));
    } catch (err: any) {
      console.error(err);
    }
  },

  enrichMissingImages: async () => {
    set({ isEnriching: true });
    try {
      const res = await fetch('/api/enrich', { method: 'POST' });
      if (!res.ok) throw new Error('Enrichment failed');
      const result = await res.json();
      // Re-fetch updated anime list
      const animeRes = await fetch('/api/anime');
      if (animeRes.ok) {
        const data = await animeRes.json();
        set({ anime: data });
      }
      set({ isEnriching: false });
      return result;
    } catch (err: any) {
      set({ isEnriching: false });
      return { enriched: 0, failed: [] };
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
  },
  setSortOption: (sortOption) => set({ sortOption }),

  setDarkMode: (isDarkMode) => {
    set({ isDarkMode });
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('animeTrackerDarkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('animeTrackerDarkMode', 'false');
      }
    }
  },

  setViewMode: (viewMode) => set({ viewMode }),
  setShowModal: (showModal) => set({ showModal }),
  setEditingId: (editingId) => set({ editingId }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedAnime: (selectedAnime) => set({ selectedAnime }),
  setShowDetailDrawer: (showDetailDrawer) => set({ showDetailDrawer }),

  fetchDiscoverAnime: async (page = 1) => {
    set({ isLoadingDiscover: true });
    try {
      const res = await fetch(`/api/jikan?type=top&page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch discover anime');
      const data: DiscoverAnime[] = await res.json();
      set((state) => ({
        discoverAnime: page === 1 ? data : [...state.discoverAnime, ...data],
        isLoadingDiscover: false,
        discoverPage: page,
      }));
    } catch (err: any) {
      set({ isLoadingDiscover: false });
    }
  },

  getFilteredAndSortedAnime: () => {
    const state = get();
    const { anime, filters, sortOption } = state;

    let filtered = anime.filter((item) => {
      // Exclude hentai anime
      if (item.genres?.some((g) => g.toLowerCase() === 'hentai')) {
        return false;
      }
      
      // Status filter - only apply if explicitly set (not undefined/null)
      if (filters.status !== undefined && filters.status !== null) {
        if (item.status !== filters.status) return false;
      }
      
      // Rating filter
      if (filters.rating !== undefined && filters.rating !== null) {
        if (item.rating < filters.rating) return false;
      }
      
      // Ongoing filter
      if (filters.isOngoing !== undefined && filters.isOngoing !== null) {
        if (item.isOngoing !== filters.isOngoing) return false;
      }
      
      // Search query filter
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesDescription = item.description?.toLowerCase().includes(q);
        const matchesGenres = item.genres?.some((g) => g.toLowerCase().includes(q));
        
        if (!matchesName && !matchesDescription && !matchesGenres) {
          return false;
        }
      }
      
      return true;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortOption.field];
      const bVal = b[sortOption.field];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return sortOption.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOption.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  },
}));

export default useAnimeStore;
