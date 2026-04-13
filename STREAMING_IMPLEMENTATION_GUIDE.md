# Anime Streaming Platform - Integration Guide

## Overview

This guide explains how to integrate the dual-audio and subtitle system into your anime streaming application. The implementation includes:

- Video player with HLS streaming support
- Format selector (Subbed/Dubbed)
- Multi-language subtitle support
- User preferences management
- Watch history tracking
- Auto-update system for new episodes
- Admin controls for episode management

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [API Integration](#api-integration)
5. [Frontend Components](#frontend-components)
6. [User Interface Example](#user-interface-example)
7. [Auto-Update System](#auto-update-system)
8. [Admin Features](#admin-features)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### 1. Install Required Dependencies

```bash
# Video streaming
npm install hls.js dash.js

# HTTP client (already installed)
# axios

# UI animations (already installed)
# framer-motion

# Icons (already installed)
# lucide-react
```

### 2. Add Environment Variables

Create or update `.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anivault

# Authentication (if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Admin Configuration
ADMIN_USER_IDS=user123,user456

# AWS S3 Configuration (for video storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Jikan API Configuration
JIKAN_API_BASE=https://api.jikan.moe/v4

# CDN Configuration (optional)
CDN_URL=https://cdn.example.com
```

---

## Database Setup

### 1. MongoDB Collections

Use MongoDB Atlas or local MongoDB. The system will automatically create collections on first use. For manual setup:

```javascript
// Create indexes for better performance
db.anime.createIndex({ mal_id: 1 }, { unique: true });
db.anime.createIndex({ isOngoing: 1 });
db.episodes.createIndex({ animeId: 1, episodeNumber: 1 }, { unique: true });
db.episodes.createIndex({ mal_episode_id: 1 });
db.userPreferences.createIndex({ userId: 1 }, { unique: true });
db.updateLogs.createIndex({ createdAt: -1 });
db.updateLogs.createIndex({ status: 1 });
```

### 2. Sample Anime Entry

```javascript
{
  _id: ObjectId("..."),
  mal_id: 5081,
  name: "Demon Slayer",
  title_english: "Demon Slayer: Kimetsu no Yaiba",
  imageUrl: "https://cdn.myanimelist.net/...",
  rating: 8.7,
  description: "...",
  status: "Finished Airing",
  isOngoing: false,
  totalEpisodes: 26,
  genres: ["Action", "Demons", "Shounen"],
  availableFormats: {
    subbed: true,
    dubbed: true,
    dubLanguages: ["English", "Spanish", "Hindi"]
  },
  createdAt: ISODate("2024-01-01"),
  updatedAt: ISODate("2024-01-15")
}
```

### 3. Sample Episode Entry

```javascript
{
  _id: ObjectId("..."),
  animeId: ObjectId("..."),
  mal_episode_id: 1,
  episodeNumber: 1,
  title: "Cruelty",
  description: "A demon slayer begins his journey...",
  airingDate: ISODate("2019-04-06"),
  duration: 1440,
  formats: {
    subbed: {
      language: "Japanese",
      available: true,
      videoUrl: "https://stream.example.com/ep1-sub.m3u8",
      uploadedAt: ISODate("2024-01-01"),
      qualityOptions: {
        "1080p": "https://stream.example.com/ep1-sub-1080p.m3u8",
        "720p": "https://stream.example.com/ep1-sub-720p.m3u8",
        "480p": "https://stream.example.com/ep1-sub-480p.m3u8"
      },
      audioMetadata: {
        codec: "aac",
        bitrate: "192k",
        channels: 2,
        sampleRate: 48000
      }
    },
    dubbed: [
      {
        language: "English",
        available: true,
        videoUrl: "https://stream.example.com/ep1-dub-en.m3u8",
        uploadedAt: ISODate("2024-01-05"),
        qualityOptions: {
          "1080p": "https://stream.example.com/ep1-dub-en-1080p.m3u8",
          "720p": "https://stream.example.com/ep1-dub-en-720p.m3u8",
          "480p": "https://stream.example.com/ep1-dub-en-480p.m3u8"
        }
      }
    ]
  },
  subtitles: [
    {
      language: "English",
      format: "vtt",
      url: "https://stream.example.com/ep1-sub-en.vtt",
      isDefault: true,
      uploadedAt: ISODate("2024-01-01")
    },
    {
      language: "Spanish",
      format: "srt",
      url: "https://stream.example.com/ep1-sub-es.srt",
      isDefault: false,
      uploadedAt: ISODate("2024-01-01")
    }
  ],
  views: 15234,
  rating: 8.5,
  createdAt: ISODate("2024-01-01"),
  updatedAt: ISODate("2024-01-15")
}
```

---

## API Integration

### Available Endpoints

#### Get Available Formats
```
GET /api/episodes/{episodeId}/formats

Response:
{
  "success": true,
  "data": {
    "episodeId": "...",
    "episodeNumber": 1,
    "title": "Cruelty",
    "duration": 1440,
    "formats": {
      "subbed": { "available": true, "language": "Japanese" },
      "dubbed": [
        { "available": true, "language": "English" },
        { "available": true, "language": "Spanish" }
      ]
    },
    "subtitles": [...]
  }
}
```

#### Get Stream URL
```
GET /api/episodes/{episodeId}/stream?format=subbed&language=Japanese&quality=720p

Response:
{
  "success": true,
  "data": {
    "manifest": {
      "type": "hls",
      "url": "https://stream.example.com/ep1-sub-720p.m3u8",
      "audioTracks": [...],
      "subtitleTracks": [...]
    }
  }
}
```

#### Get Subtitles
```
GET /api/episodes/{episodeId}/subtitles

Response:
{
  "success": true,
  "data": {
    "subtitles": [
      { "language": "English", "format": "vtt", "url": "..." },
      { "language": "Spanish", "format": "srt", "url": "..." }
    ]
  }
}
```

#### Get User Preferences
```
GET /api/user/preferences

Response:
{
  "success": true,
  "data": {
    "defaultFormat": "subbed",
    "defaultDubLanguage": "English",
    "subtitleSettings": {...},
    "watchHistory": [...]
  }
}
```

#### Update Preferences
```
POST /api/user/preferences

Body:
{
  "defaultFormat": "dubbed",
  "defaultDubLanguage": "English"
}
```

#### Update Watch History
```
POST /api/user/watch-history

Body:
{
  "animeId": "...",
  "episodeId": "...",
  "episodeNumber": 1,
  "currentFormat": "subbed",
  "currentLanguage": "Japanese",
  "progress": 75,
  "lastWatchedTime": 1200
}
```

---

## Frontend Components

### 1. Video Player Component

```typescript
import { VideoPlayer } from '@/components';
import { Episode } from '@/types';

export function WatchPage({ episode }: { episode: Episode }) {
  const handleFormatChange = (format: 'subbed' | 'dubbed', language: string) => {
    console.log(`Changed to ${format} - ${language}`);
  };

  return (
    <VideoPlayer
      episode={episode}
      initialFormat="subbed"
      initialLanguage="Japanese"
      initialQuality="720p"
      onFormatChange={handleFormatChange}
      onProgress={(progress, currentTime, duration) => {
        // Update watch history
      }}
    />
  );
}
```

### 2. Episode Selector Component

```typescript
import { EpisodeSelector } from '@/components';

export function EpisodeList({ episodes, onSelect }: any) {
  return (
    <EpisodeSelector
      episodes={episodes}
      currentEpisode={episodes[0]}
      onEpisodeSelect={onSelect}
      userDefaultFormat="subbed"
    />
  );
}
```

### 3. Subtitle Settings Component

```typescript
import { SubtitleSettingsComponent } from '@/components';
import { SubtitleSettings } from '@/types';

export function SettingsPanel() {
  const handleSettingsSave = (settings: SubtitleSettings) => {
    // Save to API
    fetch('/api/user/preferences', {
      method: 'POST',
      body: JSON.stringify({ subtitleSettings: settings })
    });
  };

  return (
    <SubtitleSettingsComponent
      initialSettings={defaultSettings}
      onSave={handleSettingsSave}
    />
  );
}
```

---

## User Interface Example

### Complete Watch Page Layout

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { VideoPlayer, EpisodeSelector, SubtitleSettingsComponent } from '@/components';
import { Episode, UserPreferences } from '@/types';
import axios from 'axios';

export default function WatchPage({ params }: { params: { id: string } }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load episodes
    axios.get(`/api/anime/${params.id}/episodes`).then((res) => {
      setEpisodes(res.data.data);
      if (res.data.data.length > 0) {
        setCurrentEpisode(res.data.data[0]);
      }
    });

    // Load user preferences
    axios.get('/api/user/preferences').then((res) => {
      setPreferences(res.data.data);
    });

    setLoading(false);
  }, [params.id]);

  const handleEpisodeChange = (episode: Episode) => {
    setCurrentEpisode(episode);
  };

  const handleProgress = (progress: number, currentTime: number, duration: number) => {
    // Update watch history every 10 seconds
    if (currentTime % 10 < 1 && currentEpisode) {
      axios.post('/api/user/watch-history', {
        animeId: params.id,
        episodeId: currentEpisode._id,
        episodeNumber: currentEpisode.episodeNumber,
        progress: progress,
        lastWatchedTime: currentTime,
        duration: duration,
        currentFormat: preferences?.defaultFormat,
        currentLanguage: preferences?.defaultDubLanguage || 'English',
      });
    }
  };

  if (loading || !currentEpisode || !preferences) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Video Player */}
        <div className="mb-8">
          <VideoPlayer
            episode={currentEpisode}
            initialFormat={preferences.defaultFormat}
            initialLanguage={
              preferences.defaultFormat === 'dubbed'
                ? preferences.defaultDubLanguage
                : 'Japanese'
            }
            initialQuality={preferences.preferredQuality}
            onProgress={handleProgress}
          />
        </div>

        {/* Controls Row */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <SubtitleSettingsComponent
            initialSettings={preferences.subtitleSettings}
            onSave={(settings) => {
              axios.post('/api/user/preferences', {
                subtitleSettings: settings,
              });
            }}
          />
        </div>

        {/* Episode List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EpisodeSelector
              episodes={episodes}
              currentEpisode={currentEpisode}
              onEpisodeSelect={handleEpisodeChange}
              userDefaultFormat={preferences.defaultFormat}
            />
          </div>

          {/* Episode Info */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">{currentEpisode.title}</h2>
            <p className="text-gray-400 mb-4">{currentEpisode.description}</p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-400">Duration:</span>{' '}
                {Math.floor(currentEpisode.duration / 60)} minutes
              </p>
              <p>
                <span className="text-gray-400">Views:</span> {currentEpisode.views}
              </p>
              <p>
                <span className="text-gray-400">Rating:</span> {currentEpisode.rating}/10
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Auto-Update System

### 1. Manual Trigger (API)

```typescript
// Trigger update from admin panel
const updateEpisodes = async (type: 'single' | 'all', animeId?: string) => {
  const response = await axios.post('/api/admin/update-episodes', {
    type,
    animeId,
  });
  
  console.log(response.data);
};
```

### 2. Scheduled Cron Job

Create [src/app/api/cron/update-episodes/route.ts](src/app/api/cron/update-episodes/route.ts):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updateAllOngoingAnime } from '@/lib/updateService';

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await updateAllOngoingAnime();
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron update error:', error);
    return NextResponse.json(
      { success: false, error: 'Update failed' },
      { status: 500 }
    );
  }
}
```

### 3. Configure External Cron (Vercel Cron)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-episodes",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Or use third-party services:
- **EasyCron**: https://www.easycron.com/
- **Cron-job**: https://cron-job.org/
- **AWS EventBridge**: https://aws.amazon.com/eventbridge/

---

## Admin Features

### Upload Content

When uploading video/subtitle files:

```typescript
// Example upload handler
async function uploadEpisodeFormat(
  episodeId: string,
  format: 'subbed' | 'dubbed',
  language: string,
  videoFile: File,
  subtitleFiles: File[]
) {
  // 1. Upload video to S3
  const videoUrl = await uploadToS3(videoFile, `episodes/${episodeId}/${format}-${language}`);

  // 2. Upload subtitles to S3
  const subtitleUrls = await Promise.all(
    subtitleFiles.map((file) =>
      uploadToS3(file, `episodes/${episodeId}/subtitles`)
    )
  );

  // 3. Update episode in database
  await updateEpisodeFormat(episodeId, format, {
    language,
    available: true,
    videoUrl: videoUrl,
    uploadedAt: new Date().toISOString(),
    qualityOptions: {
      '720p': videoUrl.replace('.m3u8', '-720p.m3u8'),
      '480p': videoUrl.replace('.m3u8', '-480p.m3u8'),
    },
  });

  // 4. Add subtitles
  for (const url of subtitleUrls) {
    await addSubtitleToEpisode(episodeId, {
      language: detectLanguage(url),
      format: 'vtt',
      url: url,
      isDefault: false,
      uploadedAt: new Date().toISOString(),
    });
  }
}
```

---

## Advanced Features

### 1. Adaptive Bitrate Streaming (ABR)

HLS.js automatically handles ABR. Configure:

```typescript
const hls = new HLS({
  lowLatencyMode: true,
  enableWorker: true,
  maxMaxBufferLength: 600, // 10 minutes
  maxBackBufferLength: 600,
  capLevelOnFPSDrop: true,
  autoLevelCapping: 3, // Cap at 3rd quality level
});
```

### 2. Offline Download Support

```typescript
async function downloadEpisode(episodeId: string, quality: string) {
  const response = await fetch(
    `/api/episodes/${episodeId}/stream?quality=${quality}`
  );
  const manifest = await response.json();
  
  // Use service workers or IndexedDB for offline storage
  const db = await openDB('anime-downloads');
  await db.add('episodes', {
    episodeId,
    manifest: manifest.data,
    downloadedAt: new Date(),
  });
}
```

### 3. Language Auto-Detection

```typescript
function detectUserLanguage(): string {
  const browserLang = navigator.language.split('-')[0].toUpperCase();
  const supportedLanguages = ['EN', 'ES', 'FR', 'JA', 'HI'];
  
  return supportedLanguages.includes(browserLang) ? browserLang : 'EN';
}
```

### 4. Multi-Device Sync

```typescript
// Sync watch progress across devices
async function syncWatchHistory(userId: string) {
  const response = await axios.get('/api/user/watch-history');
  const history = response.data.data.history;
  
  // Store in localStorage for offline support
  localStorage.setItem(
    'watchHistory',
    JSON.stringify(history)
  );
}
```

### 5. Notifications for New Episodes

```typescript
async function notifyNewEpisode(episode: Episode, anime: any) {
  // Send email
  await sendEmail({
    to: userEmail,
    subject: `New episode of ${anime.name}!`,
    html: `Episode ${episode.episodeNumber} is now available in both Sub and Dub!`,
  });

  // Send push notification
  await sendPushNotification({
    title: `New episode: ${anime.name}`,
    body: `Episode ${episode.episodeNumber} - ${episode.title}`,
  });
}
```

---

## Troubleshooting

### Common Issues

#### 1. **HLS fails to load**
```typescript
// Check CORS headers on S3
// Add to bucket CORS configuration:
{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET"],
  "AllowedOrigins": ["https://yourdomain.com"],
  "ExposeHeaders": ["ETag"]
}
```

#### 2. **Subtitles not displaying**
```typescript
// Ensure subtitle format is correct (VTT or SRT)
// Check URL is accessible and CORS is enabled
// Verify encoding is UTF-8
```

#### 3. **Format switching takes too long**
```typescript
// Pre-buffer alternate formats
const preBufferAltFormat = async (episodeId, format) => {
  await fetch(`/api/episodes/${episodeId}/stream?format=${format}`);
};

// Cache manifest data
const manifestCache = new Map();
```

#### 4. **MongoDB connection issues**
```typescript
// Check MONGODB_URI format
// Ensure IP whitelist includes your server
// Verify credentials are correct
// Check connection pool size
```

#### 5. **Update service not running**
```typescript
// Check ADMIN_USER_IDS in .env
// Verify cron schedule is configured
// Check server logs for errors
// Test manually via API
```

---

## Performance Optimization

### 1. Caching Strategy

```typescript
// Cache episode metadata for 24 hours
app.use((req, res, next) => {
  if (req.path.includes('/api/episodes')) {
    res.set('Cache-Control', 'public, max-age=86400');
  }
  next();
});
```

### 2. Database Indexing

```javascript
// Essential indexes for performance
db.episodes.createIndex({ animeId: 1, episodeNumber: 1 });
db.episodes.createIndex({ updatedAt: -1 });
db.userPreferences.createIndex({ userId: 1 });
db.updateLogs.createIndex({ status: 1, createdAt: -1 });
```

### 3. CDN Integration

```typescript
// Serve video through CDN
const getVideoUrl = (originalUrl: string) => {
  if (process.env.CDN_URL) {
    return originalUrl.replace(
      'https://stream.example.com',
      process.env.CDN_URL
    );
  }
  return originalUrl;
};
```

---

## Next Steps

1. ✅ Set up MongoDB collections
2. ✅ Configure environment variables
3. ✅ Test API endpoints
4. ✅ Integrate UI components
5. ✅ Set up auto-update system
6. ✅ Configure admin panel
7. ✅ Deploy to production
8. ✅ Monitor performance

For additional help, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [HLS.js Documentation](https://github.com/video-dev/hls.js/wiki)
- [Jikan API Documentation](https://jikan.moe/)
