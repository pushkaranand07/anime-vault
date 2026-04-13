# Anime Streaming Platform - Dual Audio & Subtitle Implementation Guide

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [API Design](#api-design)
4. [Frontend Implementation](#frontend-implementation)
5. [Auto-Update System](#auto-update-system)
6. [User Preferences](#user-preferences)
7. [Video Player Integration](#video-player-integration)
8. [Best Practices](#best-practices)

---

## System Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/Next.js)               │
│  - Video Player UI with Audio/Subtitle Controls             │
│  - Format Selector (Sub/Dub)                                │
│  - User Preferences Management                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                      │
│  - GET /api/anime/[id]/episodes                             │
│  - GET /api/episodes/[id]/formats                           │
│  - GET /api/episodes/[id]/streams                           │
│  - POST /api/user/preferences                               │
│  - GET /api/subtitles/[episodeId]                           │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐  ┌──────────────┐  ┌──────────┐
    │ MongoDB │  │ File Storage │  │ External │
    │ (Anime  │  │ (Video/Sub   │  │   APIs   │
    │  Data)  │  │   Files)     │  │ (Jikan)  │
    └─────────┘  └──────────────┘  └──────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- HLS.js or Dash.js (video player library)
- Zustand (state management)
- framer-motion (animations)

**Backend:**
- Next.js API Routes
- MongoDB
- Node.js

**Video Streaming:**
- HLS (HTTP Live Streaming) or DASH (Dynamic Adaptive Streaming)
- Recommended: HLS for broader compatibility
- Support for MP4 fallback for direct streaming

**Storage:**
- Cloud Storage: AWS S3 or similar for video/subtitle files
- MongoDB for metadata
- Local file system for development

---

## Database Schema

### Enhanced MongoDB Collections

#### 1. **animes** Collection
```javascript
{
  _id: ObjectId,
  mal_id: Number,
  title: String,
  title_english: String,
  imageUrl: String,
  score: Number,
  synopsis: String,
  genres: [String],
  status: String, // "Finished Airing", "Currently Airing"
  isOngoing: Boolean,
  totalEpisodes: Number,
  latestSeason: String,
  availableFormats: {
    subbed: Boolean,
    dubbed: Boolean,
    dubLanguages: [String] // ["English", "Hindi", "Spanish"]
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### 2. **episodes** Collection
```javascript
{
  _id: ObjectId,
  animeId: ObjectId, // Reference to animes collection
  mal_id: Number, // From Jikan API
  episodeNumber: Number,
  title: String,
  description: String,
  airingDate: ISODate,
  duration: Number, // in seconds
  formats: {
    subbed: {
      available: Boolean,
      videoUrl: String, // S3 link or streaming URL
      uploadedAt: ISODate,
      qualityOptions: {
        "1080p": String,
        "720p": String,
        "480p": String
      }
    },
    dubbed: [
      {
        language: String, // "English", "Hindi", etc.
        available: Boolean,
        videoUrl: String,
        uploadedAt: ISODate,
        qualityOptions: {
          "1080p": String,
          "720p": String,
          "480p": String
        }
      }
    ]
  },
  subtitles: [
    {
      language: String, // "English", "Spanish", etc.
      format: String, // "srt", "vtt", "ass"
      url: String, // S3 link
      uploadedAt: ISODate
    }
  ],
  views: Number,
  rating: Number,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### 3. **audioTracks** Collection (Alternative approach)
```javascript
{
  _id: ObjectId,
  episodeId: ObjectId,
  language: String, // "Japanese", "English", "Hindi"
  format: String, // "subbed" or "dubbed"
  audioUrl: String,
  audioCodec: String, // "aac", "mp3"
  bitrate: String, // "128k", "192k", "256k"
  default: Boolean,
  uploadedAt: ISODate,
  metadata: {
    duration: Number,
    channels: Number, // 2 for stereo, 6 for 5.1
    sampleRate: Number
  }
}
```

#### 4. **subtitleTracks** Collection
```javascript
{
  _id: ObjectId,
  episodeId: ObjectId,
  language: String,
  format: String, // "srt", "vtt", "ass"
  url: String,
  isDefault: Boolean,
  uploadedAt: ISODate,
  metadata: {
    totalCues: Number,
    encoding: String
  }
}
```

#### 5. **userPreferences** Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  defaultFormat: String, // "subbed" or "dubbed"
  defaultDubLanguage: String, // "English"
  defaultSubtitleLanguage: String, // "English"
  subtitleEnabled: Boolean,
  subtitleSize: String, // "small", "medium", "large"
  subtitleColor: String,
  autoPlayNextEpisode: Boolean,
  preferredQuality: String, // "1080p", "720p", "480p"
  watchHistory: [
    {
      animeId: ObjectId,
      episodeId: ObjectId,
      currentFormat: String,
      currentLanguage: String,
      watchedAt: ISODate,
      progress: Number // 0-100
    }
  ],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### 6. **updateLogs** Collection
```javascript
{
  _id: ObjectId,
  animeId: ObjectId,
  episodeNumber: Number,
  format: String, // "subbed", "dubbed"
  language: String,
  status: String, // "pending", "processing", "completed", "failed"
  source: String, // "manual_upload", "jikan_api", "web_scrape"
  errorMessage: String,
  createdAt: ISODate,
  updatedAt: ISODate,
  completedAt: ISODate
}
```

---

## API Design

### RESTful API Endpoints

#### Anime Endpoints
```
GET  /api/anime                    - List all anime
GET  /api/anime/[id]               - Get anime details with available formats
POST /api/anime                    - Create new anime (admin)
PUT  /api/anime/[id]               - Update anime (admin)
```

#### Episode Endpoints
```
GET  /api/anime/[id]/episodes      - List episodes for anime
GET  /api/episodes/[id]            - Get episode details
POST /api/episodes                 - Create episode (admin)
PUT  /api/episodes/[id]            - Update episode (admin)
```

#### Streaming Endpoints
```
GET  /api/episodes/[id]/stream     - Get video stream URL
GET  /api/episodes/[id]/formats    - Get available formats
GET  /api/episodes/[id]/subtitles  - Get available subtitles
GET  /api/stream/manifest          - Get HLS manifest
```

#### User Preferences
```
GET  /api/user/preferences         - Get user preferences
POST /api/user/preferences         - Update preferences
GET  /api/user/watch-history       - Get watch history
POST /api/user/watch-history       - Update watch progress
```

#### Admin/Update Endpoints
```
POST /api/admin/update-episode     - Trigger episode update
GET  /api/admin/update-logs        - Get update logs
POST /api/admin/sync-jikan         - Sync with Jikan API
```

---

## Frontend Implementation

### Key Components

1. **VideoPlayer Component**
   - HLS.js integration
   - Audio track switching
   - Subtitle management
   - Quality selector

2. **FormatSelector Component**
   - Sub/Dub toggle
   - Language selector for dub
   - Visual indicator of available formats

3. **SubtitleControls Component**
   - Enable/disable toggle
   - Language selector
   - Size and styling options

4. **EpisodeList Component**
   - Display episodes with format badges
   - Format availability indicators

---

## Auto-Update System

### Update Strategies

1. **Scheduled Updates**
   - Cron jobs running every 6-12 hours
   - Check Jikan API for new episodes
   - Process updates asynchronously

2. **Event-Based Updates**
   - Webhook from content provider
   - Manual admin trigger
   - User-initiated sync

3. **Real-Time Updates**
   - WebSocket for live episode availability
   - Server-Sent Events (SSE) for notifications

### Update Flow
```
Check External API
    ↓
Compare with DB
    ↓
Identify New Episodes
    ↓
Create Episode Records
    ↓
Wait for File Upload
    ↓
Mark as Available
    ↓
Notify Users
```

---

## Video Player Integration

### Supported Formats
- **HLS (.m3u8)**: Recommended for adaptive streaming
- **DASH (.mpd)**: Alternative for compatibility
- **MP4**: Direct streaming fallback
- **WebM**: For open-source solutions

### Audio & Subtitle Support
- Multiple audio tracks (HLS variant streams)
- Multiple subtitle languages
- Subtitle format support: SRT, VTT, ASS
- Automatic language detection

---

## Best Practices

### Performance
1. ✅ Use CDN for video/subtitle distribution
2. ✅ Implement HLS for adaptive bitrate
3. ✅ Cache episode metadata
4. ✅ Lazy load subtitle files
5. ✅ Implement progressive loading

### Security
1. ✅ Validate user authentication for streams
2. ✅ Use signed URLs for S3 access
3. ✅ Implement rate limiting on API endpoints
4. ✅ Validate file uploads
5. ✅ Use CORS policies

### Scalability
1. ✅ Use MongoDB indexes for queries
2. ✅ Implement pagination for episode lists
3. ✅ Use background job queues (Bull, RQ)
4. ✅ Cache frequently accessed data
5. ✅ Use microservices for video processing

### UX
1. ✅ Remember user format preferences
2. ✅ Show available formats clearly
3. ✅ Smooth format switching
4. ✅ Auto-select preferred format on page load
5. ✅ Load indicators during playback
