# Developer Quick Reference Guide

## 🎬 Video Streaming Implementation

### Quick Start Code Snippets

#### Using the VideoPlayer Component

```tsx
'use client';

import { VideoPlayer } from '@/components';
import { Episode } from '@/types';

interface WatchPageProps {
  params: { episodeId: string };
}

export default function WatchPage({ params }: WatchPageProps) {
  const [episode, setEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    // Fetch episode from API
    fetch(`/api/episodes/${params.episodeId}`)
      .then(r => r.json())
      .then(data => setEpisode(data.data));
  }, []);

  const handleProgress = (progress: number, currentTime: number, duration: number) => {
    // Save watch progress to database
    fetch('/api/user/watch-history', {
      method: 'POST',
      body: JSON.stringify({
        episodeId: episode?._id,
        animeId: episode?.animeId,
        episodeNumber: episode?.episodeNumber,
        progress: progress,
        lastWatchedTime: currentTime,
        duration: duration,
      }),
    });
  };

  if (!episode) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <VideoPlayer
        episode={episode}
        initialFormat="subbed"
        initialLanguage="Japanese"
        initialQuality="720p"
        onProgress={handleProgress}
      />
    </div>
  );
}
```

---

## 📡 API Usage Examples

### Get Available Formats

```typescript
// Frontend
const getFormats = async (episodeId: string) => {
  const response = await fetch(`/api/episodes/${episodeId}/formats`);
  const data = await response.json();
  
  console.log(data.data.formats);
  // {
  //   subbed: { available: true, language: 'Japanese' },
  //   dubbed: [
  //     { available: true, language: 'English' },
  //     { available: true, language: 'Spanish' }
  //   ]
  // }
};
```

### Get Stream URL

```typescript
const getStreamUrl = async (
  episodeId: string,
  format: 'subbed' | 'dubbed',
  language: string,
  quality: string = '720p'
) => {
  const response = await fetch(
    `/api/episodes/${episodeId}/stream?format=${format}&language=${language}&quality=${quality}`
  );
  const data = await response.json();
  
  return data.data.manifest.url; // HLS manifest URL
};
```

### Get Subtitles

```typescript
const getSubtitles = async (episodeId: string) => {
  const response = await fetch(`/api/episodes/${episodeId}/subtitles`);
  const data = await response.json();
  
  return data.data.subtitles; // SubtitleTrack[]
};
```

### User Preferences

```typescript
// Get preferences
const getPreferences = async () => {
  const response = await fetch('/api/user/preferences');
  return response.json(); // UserPreferences
};

// Update preferences
const updatePreferences = async (preferences: Partial<UserPreferences>) => {
  const response = await fetch('/api/user/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  return response.json();
};
```

### Watch History

```typescript
// Get watch history
const getHistory = async () => {
  const response = await fetch('/api/user/watch-history');
  return response.json();
};

// Update watch history
const updateHistory = async (entry: WatchHistoryEntry) => {
  const response = await fetch('/api/user/watch-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  return response.json();
};

// Get specific episode progress
const getProgress = async (episodeId: string) => {
  const response = await fetch(
    `/api/user/watch-history?episodeId=${episodeId}`
  );
  return response.json(); // WatchHistoryEntry or null
};
```

---

## 🎨 Component Props

### VideoPlayer

```typescript
interface VideoPlayerProps {
  // Required
  episode: Episode;
  
  // Optional
  initialFormat?: 'subbed' | 'dubbed';
  initialLanguage?: string;
  initialQuality?: string;
  
  // Callbacks
  onFormatChange?: (format: 'subbed' | 'dubbed', language: string) => void;
  onProgress?: (progress: number, currentTime: number, duration: number) => void;
}

// Example
<VideoPlayer
  episode={episode}
  initialFormat="subbed"
  initialQuality="720p"
  onProgress={(progress, time, duration) => {
    console.log(`${time.toFixed(0)}/${duration.toFixed(0)} seconds`);
  }}
/>
```

### EpisodeSelector

```typescript
interface EpisodeSelectorProps {
  episodes: Episode[];
  currentEpisode: Episode;
  onEpisodeSelect: (episode: Episode) => void;
  userDefaultFormat?: 'subbed' | 'dubbed';
}

// Example
<EpisodeSelector
  episodes={episodes}
  currentEpisode={currentEpisode}
  onEpisodeSelect={(episode) => setCurrentEpisode(episode)}
  userDefaultFormat={userPrefs.defaultFormat}
/>
```

### SubtitleSettings

```typescript
interface SubtitleSettingsComponentProps {
  initialSettings: SubtitleSettings;
  onSave: (settings: SubtitleSettings) => void;
}

// Example
<SubtitleSettingsComponent
  initialSettings={userPrefs.subtitleSettings}
  onSave={(settings) => {
    updatePreferences({ subtitleSettings: settings });
  }}
/>
```

---

## 🔐 Admin Operations

### Trigger Episode Updates

```typescript
// Manual update for single anime
const updateAnime = async (animeId: string) => {
  const response = await fetch('/api/admin/update-episodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'single',
      animeId: animeId,
    }),
  });
  return response.json();
};

// Update all ongoing anime
const updateAll = async () => {
  const response = await fetch('/api/admin/update-episodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'all' }),
  });
  return response.json();
};
```

### Get Update Status

```typescript
const getUpdateStatus = async () => {
  const response = await fetch('/api/admin/update-episodes');
  const data = await response.json();
  
  console.log(data.data);
  // {
  //   total: 150,
  //   completed: 145,
  //   pending: 3,
  //   failed: 2,
  //   recentLogs: [...]
  // }
};
```

---

## 🗄️ Database Utility Functions

### Episodes

```typescript
import { 
  getEpisodesByAnimeId,
  getEpisodeById,
  getEpisodeByNumber,
  createEpisode,
  updateEpisodeFormat,
  addSubtitleToEpisode,
  getAvailableSubtitles,
  getAvailableFormats,
  incrementEpisodeViews,
  updateAnimeAvailableFormats,
  getEpisodeCount,
} from '@/lib/episodes';

// Get episodes for anime
const episodes = await getEpisodesByAnimeId(animeId, limit = 50, page = 1);

// Get specific episode
const episode = await getEpisodeById(episodeId);

// Get by episode number
const episode = await getEpisodeByNumber(animeId, 5);

// Create new episode
const id = await createEpisode({
  animeId,
  episodeNumber: 1,
  title: 'Pilot',
  description: '...',
  airingDate: new Date().toISOString(),
  duration: 1440,
  formats: { subbed: null, dubbed: [] },
  subtitles: [],
  views: 0,
  rating: 0,
});

// Update format with video
await updateEpisodeFormat(episodeId, 'subbed', {
  language: 'Japanese',
  available: true,
  videoUrl: 's3://bucket/video.m3u8',
  uploadedAt: new Date().toISOString(),
  qualityOptions: {
    '1080p': 's3://bucket/video-1080p.m3u8',
    '720p': 's3://bucket/video-720p.m3u8',
  },
});

// Add subtitle
await addSubtitleToEpisode(episodeId, {
  language: 'English',
  format: 'vtt',
  url: 's3://bucket/subtitles.vtt',
  isDefault: true,
  uploadedAt: new Date().toISOString(),
});

// Get subtitles
const subtitles = await getAvailableSubtitles(episodeId);

// Get available formats
const formats = await getAvailableFormats(episodeId);
```

### User Preferences

```typescript
import {
  getUserPreferences,
  updateDefaultFormat,
  updateSubtitleSettings,
  updateWatchHistory,
  getWatchHistory,
  getEpisodeProgress,
  bulkUpdateWatchHistory,
  clearWatchHistory,
  getRecentlyWatched,
} from '@/lib/userPreferences';

// Get user preferences (creates if not exists)
const prefs = await getUserPreferences(userId);

// Update default format
await updateDefaultFormat(userId, 'dubbed', 'English');

// Update subtitle settings
await updateSubtitleSettings(userId, {
  enabled: true,
  fontSize: 20,
  color: '#ffffff',
});

// Add watch history entry
await updateWatchHistory(userId, {
  animeId,
  episodeId,
  episodeNumber: 1,
  currentFormat: 'subbed',
  currentLanguage: 'Japanese',
  watchedAt: new Date().toISOString(),
  progress: 75,
  lastWatchedTime: 1200,
  duration: 1440,
});

// Get all watch history
const history = await getWatchHistory(userId);

// Get progress for specific episode
const progress = await getEpisodeProgress(userId, episodeId);

// Get recently watched anime
const recent = await getRecentlyWatched(userId, limit = 10);
```

### Updates

```typescript
import {
  syncAnimeFromJikan,
  fetchEpisodesFromJikan,
  updateEpisodesFromJikan,
  updateAnime,
  updateAllOngoingAnime,
  getUpdateStatus,
  triggerUpdate,
} from '@/lib/updateService';

// Sync single anime from Jikan
const success = await syncAnimeFromJikan(malId);

// Fetch episodes from Jikan API
const episodes = await fetchEpisodesFromJikan(malId, page = 1);

// Update episodes from Jikan
const count = await updateEpisodesFromJikan(animeId, malId, maxEpisodes = 50);

// Complete update for single anime
const result = await updateAnime(animeId);
// { success: true, newEpisodes: 5 }

// Update all ongoing anime
const result = await updateAllOngoingAnime();
// { updated: 12, failed: 1, newEpisodes: 45 }

// Get update logs
const status = await getUpdateStatus(limit = 20);

// Trigger update
const message = await triggerUpdate('all');
```

---

## 🔧 TypeScript Types

### Core Types

```typescript
// From @/types.ts

interface Episode {
  _id: string;
  animeId: string;
  episodeNumber: number;
  title: string;
  description?: string;
  airingDate: string;
  duration: number;
  formats: EpisodeFormats;
  subtitles: SubtitleTrack[];
  views: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface EpisodeFormats {
  subbed: EpisodeFormat | null;
  dubbed: EpisodeFormat[];
}

interface EpisodeFormat {
  language: string;
  available: boolean;
  videoUrl: string;
  uploadedAt: string;
  qualityOptions: QualityOptions;
  audioMetadata?: AudioMetadata;
}

interface SubtitleTrack {
  _id?: string;
  language: string;
  format: string; // "srt", "vtt", "ass"
  url: string;
  isDefault: boolean;
  uploadedAt: string;
}

interface UserPreferences {
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

interface WatchHistoryEntry {
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
```

---

## 🚀 Performance Tips

### 1. Optimize Component Rendering

```tsx
// Use React.memo for episode list items
const EpisodeItem = React.memo(({ episode }: any) => {
  return <div>{episode.title}</div>;
});

// Use useMemo for expensive calculations
const sortedEpisodes = useMemo(() => {
  return episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
}, [episodes]);
```

### 2. Implement Caching

```typescript
// Cache API responses
const cache = new Map();

async function fetchWithCache(url: string) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const data = await fetch(url).then(r => r.json());
  cache.set(url, data);
  setTimeout(() => cache.delete(url), 300000); // 5 min TTL
  return data;
}
```

### 3. Lazy Load Components

```tsx
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <div>Loading video player...</div>,
});

const SubtitleSettings = dynamic(() => import('@/components/SubtitleSettings'));
```

---

## 🐛 Debugging

### Enable Logging

```typescript
// In VideoPlayer.tsx or any component
const DEBUG = true;

const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[VideoPlayer] ${message}`, data);
  }
};
```

### Monitor API Calls

```typescript
// Add request logging middleware
fetch = (function(originalFetch) {
  return function(...args: any[]) {
    console.time(args[0]);
    return originalFetch.apply(this, args)
      .then(res => {
        console.timeEnd(args[0]);
        return res;
      });
  };
})(fetch);
```

### Check Browser DevTools

```javascript
// In browser console
// Check service worker
navigator.serviceWorker.getRegistrations();

// Check IndexedDB
indexedDB.databases();

// Check localStorage
localStorage.getItem('watchHistory');
```

---

## 📋 Common Tasks

### Task: Add New Subtitle Language to Episode

```typescript
import { addSubtitleToEpisode } from '@/lib/episodes';

const addSubtitle = async (episodeId: string, subtitleUrl: string) => {
  await addSubtitleToEpisode(episodeId, {
    language: 'French',
    format: 'vtt',
    url: subtitleUrl,
    isDefault: false,
    uploadedAt: new Date().toISOString(),
  });
};
```

### Task: Change User's Default Format

```typescript
import { updateDefaultFormat } from '@/lib/userPreferences';

const changeFormat = async (userId: string) => {
  await updateDefaultFormat(userId, 'dubbed', 'English');
};
```

### Task: Get Episode Progress for Resume

```typescript
import { getEpisodeProgress } from '@/lib/userPreferences';

const resumeEpisode = async (userId: string, episodeId: string) => {
  const progress = await getEpisodeProgress(userId, episodeId);
  
  if (progress) {
    videoElement.currentTime = progress.lastWatchedTime;
  }
};
```

### Task: Create Admin Dashboard

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('/api/admin/update-episodes')
      .then(r => r.json())
      .then(data => setStatus(data.data));
  }, []);

  return (
    <div>
      <h1>Update Status</h1>
      <p>Completed: {status?.completed}</p>
      <p>Failed: {status?.failed}</p>
      <button onClick={() => {
        fetch('/api/admin/update-episodes', {
          method: 'POST',
          body: JSON.stringify({ type: 'all' }),
        });
      }}>
        Trigger Update
      </button>
    </div>
  );
}
```

---

## 📚 Additional Resources

- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **MongoDB Node Driver**: https://docs.mongodb.com/drivers/node/
- **HLS.js API**: https://github.com/video-dev/hls.js/blob/master/docs/API.md
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React Hooks**: https://react.dev/reference/react/hooks

---

**Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Production Ready ✅
