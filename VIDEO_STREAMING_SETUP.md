# Video Streaming Setup - Complete Guide

## Understanding the Streaming Flow

Here's exactly how videos flow through your system:

```
Your Video Files (MP4, etc.)
    ↓
Convert to HLS Format (optional but recommended)
    ↓
Upload to Cloud Storage (AWS S3, Cloudflare R2, etc.)
    ↓
Get Streaming URL (manifest.m3u8)
    ↓
Save URL to MongoDB
    ↓
Frontend Requests Stream
    ↓
HLS.js Plays Video in Browser
```

---

## Step 1: Prepare Your Videos

### Option A: Use MP4 Directly (Simplest)
```bash
# Just upload your MP4 file as-is
# No conversion needed
# URL: https://your-bucket.s3.amazonaws.com/episode1.mp4
```

### Option B: Convert to HLS (Recommended for Production)

```bash
# Install ffmpeg
# On Windows: choco install ffmpeg
# On Mac: brew install ffmpeg
# On Ubuntu: sudo apt-get install ffmpeg

# Convert MP4 to HLS
ffmpeg -i episode1.mp4 \
  -codec: copy \
  -start_number 0 \
  -hls_time 10 \
  -hls_list_size 0 \
  -f hls episode1.m3u8

# This creates:
# - episode1.m3u8 (playlist file)
# - episode1-0.ts (video segments)
# - episode1-1.ts
# - etc.
```

---

## Step 2: Upload to Cloud Storage

### Using AWS S3 (Most Popular)

```bash
# Install AWS CLI
# On Windows: choco install awscli
# On Mac: brew install awscli
# On Ubuntu: apt-get install awscli

# Configure AWS credentials
aws configure
# Enter: AWS Access Key ID
# Enter: AWS Secret Access Key
# Enter: Default region (us-east-1)
# Enter: Default format (json)

# Create S3 bucket
aws s3 mb s3://my-anime-videos --region us-east-1

# Upload MP4 file
aws s3 cp episode1.mp4 s3://my-anime-videos/episodes/demon-slayer/ep1.mp4

# Upload HLS files (folder)
aws s3 sync ./hls-output s3://my-anime-videos/episodes/demon-slayer/ep1/

# Make files publicly accessible (or use signed URLs)
aws s3api put-bucket-acl --bucket my-anime-videos --acl public-read
```

### Configure S3 for Video Streaming

```bash
# Set CORS policy for video streaming
cat > cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Apply CORS policy
aws s3api put-bucket-cors --bucket my-anime-videos --cors-configuration file://cors.json
```

### Alternative: Cloudflare R2 (Cheaper)

```bash
# Sign up at https://www.cloudflare.com/products/r2/
# Create bucket: anime-videos
# Get API token from dashboard

# Use AWS CLI with R2 endpoint
aws s3 --endpoint-url https://123456789.r2.cloudflarestorage.com \
  cp episode1.mp4 s3://anime-videos/episodes/demon-slayer/ep1.mp4
```

---

## Step 3: Store URLs in MongoDB

### Method 1: Manual Upload via MongoDB Atlas

```javascript
// In MongoDB Atlas Console
db.episodes.updateOne(
  { episodeNumber: 1, animeId: ObjectId("...") },
  {
    $set: {
      'formats.subbed': {
        language: 'Japanese',
        available: true,
        videoUrl: 'https://my-anime-videos.s3.amazonaws.com/episodes/demon-slayer/ep1/episode1.m3u8',
        uploadedAt: new Date(),
        qualityOptions: {
          '1080p': 'https://my-anime-videos.s3.amazonaws.com/episodes/demon-slayer/ep1-1080p/episode1.m3u8',
          '720p': 'https://my-anime-videos.s3.amazonaws.com/episodes/demon-slayer/ep1-720p/episode1.m3u8',
          '480p': 'https://my-anime-videos.s3.amazonaws.com/episodes/demon-slayer/ep1-480p/episode1.m3u8'
        }
      }
    }
  }
);
```

### Method 2: From Your Backend

```typescript
// src/app/api/admin/upload-episode/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateEpisodeFormat } from '@/lib/episodes';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const episodeId = formData.get('episodeId') as string;
    const format = formData.get('format') as 'subbed' | 'dubbed';
    const language = formData.get('language') as string;
    const VideoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Upload to S3
    const s3Key = `episodes/${episodeId}/${format}-${language}.mp4`;
    const buffer = await videoFile.arrayBuffer();

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: buffer,
        ContentType: 'video/mp4',
        ACL: 'public-read',
      })
    );

    // Get the S3 URL
    const videoUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`;

    // Update database
    await updateEpisodeFormat(episodeId, format, {
      language,
      available: true,
      videoUrl: videoUrl,
      uploadedAt: new Date().toISOString(),
      qualityOptions: {
        // For MP4, just use the same URL for all qualities
        // In production, you'd create multiple quality versions
        '720p': videoUrl,
        '480p': videoUrl,
        '360p': videoUrl,
      },
    });

    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

---

## Step 4: Test Video Streaming

### Test 1: Check if Video URL Works

```bash
# Open in browser
https://my-anime-videos.s3.amazonaws.com/episodes/demon-slayer/ep1.mp4

# Should start playing or download
```

### Test 2: Check MongoDB Entry

```javascript
// In MongoDB Atlas Console
db.episodes.findOne({ episodeNumber: 1 })

// Should show:
{
  "formats": {
    "subbed": {
      "videoUrl": "https://...",
      "available": true
    }
  }
}
```

### Test 3: Check API Endpoint

```bash
# Test in Postman or curl
curl http://localhost:3000/api/episodes/[episodeId]/stream?format=subbed&language=Japanese&quality=720p

# Should return:
{
  "success": true,
  "data": {
    "manifest": {
      "type": "mp4",
      "url": "https://my-anime-videos.s3.amazonaws.com/..."
    }
  }
}
```

### Test 4: Test in Frontend

```tsx
import { VideoPlayer } from '@/components';
import { Episode } from '@/types';

export default function TestPage() {
  const testEpisode: Episode = {
    _id: '123',
    animeId: '456',
    episodeNumber: 1,
    title: 'Test Episode',
    airingDate: new Date().toISOString(),
    duration: 1440,
    formats: {
      subbed: {
        language: 'Japanese',
        available: true,
        videoUrl: 'https://my-video-url.mp4', // Your S3 URL
        uploadedAt: new Date().toISOString(),
        qualityOptions: {
          '720p': 'https://my-video-url.mp4',
        },
      },
      dubbed: [],
    },
    subtitles: [],
    views: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <VideoPlayer episode={testEpisode} />;
}
```

---

## Step 5: Create Admin Upload Interface

### Simple File Upload Form

```tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';

export default function AdminUploadPage() {
  const [episodeId, setEpisodeId] = useState('');
  const [format, setFormat] = useState<'subbed' | 'dubbed'>('subbed');
  const [language, setLanguage] = useState('Japanese');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile || !episodeId) {
      alert('Please select a file and episode');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('episodeId', episodeId);
    formData.append('format', format);
    formData.append('language', language);
    formData.append('video', videoFile);

    try {
      const response = await axios.post('/api/admin/upload-episode', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        },
      });

      alert('Upload successful! ' + response.data.videoUrl);
      setVideoFile(null);
      setEpisodeId('');
    } catch (error) {
      alert('Upload failed: ' + (error as any).message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h1 className="text-2xl font-bold mb-6">Upload Episode Video</h1>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Episode ID Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Episode ID</label>
            <input
              type="text"
              value={episodeId}
              onChange={(e) => setEpisodeId(e.target.value)}
              placeholder="Paste episode ID from MongoDB"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              disabled={uploading}
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'subbed' | 'dubbed')}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              disabled={uploading}
            >
              <option value="subbed">Subbed (Japanese)</option>
              <option value="dubbed">Dubbed</option>
            </select>
          </div>

          {/* Language Selection (for dubbed) */}
          {format === 'dubbed' && (
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                disabled={uploading}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          )}

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video File (MP4/MKV)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
              disabled={uploading}
            />
            {videoFile && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !videoFile || !episodeId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-2 rounded transition"
          >
            {uploading ? `Uploading... ${progress}%` : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## Step 6: Environment Variables Setup

Add to `.env.local`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=my-anime-videos
AWS_REGION=us-east-1

# Or Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
CLOUDFLARE_BUCKET_NAME=anime-videos
```

---

## Quick Start: Stream Your First Video

### 1. Get S3 Bucket Ready (5 minutes)
```bash
# Create AWS account (free tier available)
# Create S3 bucket
# Get Access Keys
```

### 2. Upload Test Video (10 minutes)
```bash
# Upload a test MP4 file
aws s3 cp my-video.mp4 s3://my-anime-videos/test.mp4
```

### 3. Add to Database (5 minutes)
```javascript
// In MongoDB Atlas Console
db.episodes.insertOne({
  animeId: ObjectId("..."),
  episodeNumber: 1,
  title: "Test Episode",
  formats: {
    subbed: {
      language: "Japanese",
      available: true,
      videoUrl: "https://my-anime-videos.s3.amazonaws.com/test.mp4",
      uploadedAt: new Date(),
      qualityOptions: {
        "720p": "https://my-anime-videos.s3.amazonaws.com/test.mp4"
      }
    },
    dubbed: []
  },
  subtitles: [],
  views: 0,
  rating: 0,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 4. Test in Browser (5 minutes)
```tsx
// Navigate to your watch page
// Should see video player with your video playing
```

---

## Cost Estimation

### AWS S3
- **Storage**: $0.023/GB/month
- **Bandwidth (out)**: $0.09/GB
- **Transactions**: Minimal

### Cloudflare R2
- **Storage**: $0.015/GB/month
- **Bandwidth**: FREE egress (huge savings!)

### Example: 100 Episodes (50GB)
- **AWS**: ~$50/month + bandwidth
- **Cloudflare R2**: ~$10/month (no bandwidth fees!)

---

## Troubleshooting

### Video Won't Play
```bash
# Check 1: Is URL accessible?
curl -I https://my-bucket.s3.amazonaws.com/video.mp4
# Should return 200 OK

# Check 2: Is CORS configured?
aws s3api get-bucket-cors --bucket my-anime-videos

# Check 3: Check browser console
# Look for CORS errors in DevTools → Console
```

### HLS Issues
```bash
# Check manifest file
curl https://my-bucket.s3.amazonaws.com/video.m3u8
# Should show list of .ts files

# Verify all segments exist
aws s3 ls s3://my-anime-videos/episodes/ --recursive
```

### Slow Download
```bash
# Enable CloudFront CDN
# Or use Cloudflare R2 (built-in CDN)
# Or add CloudFlare as CNAME
```

---

## Complete Working Example

### Create Test Episode with Video

```typescript
// npm run dev, then in a terminal:

const { MongoClient } = require('mongodb');
const fs = require('fs');

async function setupTestEpisode() {
  const client = new MongoClient(process.env.MONGODB_URI);
  const db = client.db('anivault');

  // Create anime
  const animeResult = await db.collection('anime').insertOne({
    mal_id: 9999,
    name: 'Test Anime',
    description: 'Test',
    imageUrl: 'https://via.placeholder.com/300x400',
    rating: 8.0,
    genres: ['Test'],
    status: 'Finished Airing',
    isOngoing: false,
    totalEpisodes: 1,
    availableFormats: {
      subbed: true,
      dubbed: false,
      dubLanguages: []
    }
  });

  // Create episode
  const episodeResult = await db.collection('episodes').insertOne({
    animeId: animeResult.insertedId,
    episodeNumber: 1,
    title: 'Test Episode',
    description: 'Test episode for streaming',
    airingDate: new Date(),
    duration: 60,
    formats: {
      subbed: {
        language: 'Japanese',
        available: true,
        videoUrl: 'https://my-bucket.s3.amazonaws.com/test-video.mp4',
        uploadedAt: new Date(),
        qualityOptions: {
          '720p': 'https://my-bucket.s3.amazonaws.com/test-video.mp4',
          '480p': 'https://my-bucket.s3.amazonaws.com/test-video.mp4'
        }
      },
      dubbed: []
    },
    subtitles: [
      {
        language: 'English',
        format: 'vtt',
        url: 'https://my-bucket.s3.amazonaws.com/test-subtitle.vtt',
        isDefault: true,
        uploadedAt: new Date()
      }
    ],
    views: 0,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('✅ Test episode created!');
  console.log(`Anime ID: ${animeResult.insertedId}`);
  console.log(`Episode ID: ${episodeResult.insertedId}`);

  client.close();
}

setupTestEpisode().catch(console.error);
```

---

## Next Steps

1. **Set up AWS S3** or **Cloudflare R2** bucket
2. **Upload a test video** to your bucket
3. **Add video URL** to MongoDB
4. **Test in VideoPlayer component**
5. **Create upload admin panel** for future videos
6. **Set up CDN** for faster delivery

---

**Now you know exactly how to stream videos! 🎬**

The key: Videos live on S3, URLs stored in MongoDB, HLS.js plays them in browser.
