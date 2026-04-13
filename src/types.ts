// Type definitions for anime entries
export interface AnimeEntry {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  description: string;
  status: 'watching' | 'completed' | 'planned';
  isOngoing: boolean;
  latestSeason?: string;
  dateAdded: string;
  dateCompleted?: string;
  notes?: string;
  genres?: string[];
  episodes?: number;
  episodesWatched?: number;
}

export interface FilterOptions {
  status?: AnimeEntry['status'];
  rating?: number;
  isOngoing?: boolean;
  genres?: string[];
  searchQuery?: string;
}

export interface SortOption {
  field: keyof AnimeEntry;
  direction: 'asc' | 'desc';
}

export interface DiscoverAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  imageUrl: string;
  score: number;
  synopsis: string;
  genres: string[];
  episodes?: number;
  status: string;
  isOngoing: boolean;
  latestSeason?: string;
}
