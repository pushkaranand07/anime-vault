// Extended type definitions for anime streaming with dual audio/subtitle support

// Core Anime Entry with streaming formats
export interface AnimeEntry {
  _id?: string;
  id: string;
  mal_id?: number;
  name: string;
  title_english?: string;
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
  totalEpisodes?: number;
  availableFormats?: AvailableFormats;
}

// Available formats info
export interface AvailableFormats {
  subbed: boolean;
  dubbed: boolean;
  dubLanguages: string[]; // ["English", "Hindi", "Spanish"]
}

// Episode with streaming information
export interface Episode {
  _id: string;
  animeId: string;
  mal_episode_id?: number;
  episodeNumber: number;
  title: string;
  description?: string;
  airingDate: string;
  duration: number; // in seconds
  formats: EpisodeFormats;
  subtitles: SubtitleTrack[];
  views: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// Episode format information
export interface EpisodeFormats {
  subbed: EpisodeFormat | null;
  dubbed: EpisodeFormat[];
}

// Individual format for episode
export interface EpisodeFormat {
  language: string;
  available: boolean;
  videoUrl: string;
  uploadedAt: string;
  qualityOptions: QualityOptions;
  audioMetadata?: AudioMetadata;
}

// Quality options for a format
export interface QualityOptions {
  [key: string]: string;
  "1080p"?: string;
  "720p"?: string;
  "480p"?: string;
  "360p"?: string;
}

// Audio metadata
export interface AudioMetadata {
  codec: string;
  bitrate: string;
  channels: number;
  sampleRate: number;
}

// Subtitle track
export interface SubtitleTrack {
  _id?: string;
  language: string;
  format: string;
  url: string;
  isDefault: boolean;
  uploadedAt: string;
}

// User preferences
export interface UserPreferences {
  _id: string;
  userId: string;
  defaultFormat: 'subbed' | 'dubbed';
  defaultDubLanguage: string;
  defaultSubtitleLanguage: string;
  subtitleEnabled: boolean;
  subtitleSettings: SubtitleSettings;
  autoPlayNextEpisode: boolean;
  preferredQuality: string;
  watchHistory: WatchHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// Subtitle styling settings
export interface SubtitleSettings {
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
  color: string;
  backgroundColor: string;
  opacity: number;
  fontFamily: string;
  fontSize: number;
  textAlign: 'center' | 'left' | 'right';
}

// Watch history entry
export interface WatchHistoryEntry {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  currentFormat: 'subbed' | 'dubbed';
  currentLanguage: string;
  watchedAt: string;
  progress: number;
  lastWatchedTime: number;
  duration: number;
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

// Update log
export interface UpdateLog {
  _id: string;
  animeId: string;
  episodeNumber: number;
  format: 'subbed' | 'dubbed';
  language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  source: 'manual_upload' | 'jikan_api' | 'web_scrape';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Streaming manifest
export interface StreamingManifest {
  type: 'hls' | 'dash' | 'mp4';
  url: string;
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  duration: number;
}

// Audio track in manifest
export interface AudioTrack {
  id: string;
  language: string;
  label: string;
  kind: 'main' | 'alternative';
  url?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
