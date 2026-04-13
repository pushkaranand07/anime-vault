// Advanced Video Player Component with dual audio and subtitle support
// Uses HLS.js for adaptive streaming

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Episode, SubtitleTrack, ApiResponse } from '@/types';
import axios from 'axios';

interface VideoPlayerProps {
  episode: Episode;
  initialFormat?: 'subbed' | 'dubbed';
  initialLanguage?: string;
  initialQuality?: string;
  onFormatChange?: (format: 'subbed' | 'dubbed', language: string) => void;
  onProgress?: (progress: number, currentTime: number, duration: number) => void;
}

interface AudioTrackInfo {
  format: 'subbed' | 'dubbed';
  language: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episode,
  initialFormat = 'subbed',
  initialLanguage = 'Japanese',
  initialQuality = '720p',
  onFormatChange,
  onProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<'subbed' | 'dubbed'>(initialFormat);
  const [language, setLanguage] = useState(initialLanguage);
  const [quality, setQuality] = useState(initialQuality);
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  const hlsRef = useRef<any>(null);

  // Load video stream
  const loadStream = async (selectedFormat: 'subbed' | 'dubbed', selectedLanguage: string, selectedQuality: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch stream URL
      const response = await axios.get<ApiResponse<any>>(
        `/api/episodes/${episode._id}/stream`,
        {
          params: {
            format: selectedFormat,
            language: selectedLanguage,
            quality: selectedQuality,
          },
        }
      );

      if (!response.data.success || !response.data.data?.manifest) {
        throw new Error('Failed to load stream');
      }

      const manifest = response.data.data.manifest;

      if (videoRef.current) {
        const videoUrl = manifest.url;

        // Handle HLS streams
        if (manifest.type === 'hls' && videoUrl.includes('.m3u8')) {
          // Dynamic import of hls.js
          const HLS = (await import('hls.js')).default;

          if (HLS.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }

            const hls = new HLS({
              lowLatencyMode: true,
              enableWorker: true,
            });

            hlsRef.current = hls;
            hls.loadSource(videoUrl);
            hls.attachMedia(videoRef.current);

            hls.on(HLS.Events.MANIFEST_PARSED, () => {
              console.log('HLS manifest loaded');
              setIsLoading(false);
            });

            hls.on(HLS.Events.ERROR, (event, data) => {
              if (data.fatal) {
                console.error('Fatal HLS error:', data);
                setError('Failed to load video');
              }
            });
          } else {
            // Fallback for browsers without HLS.js support
            videoRef.current.src = videoUrl;
            setIsLoading(false);
          }
        } else {
          // Direct MP4 playback
          videoRef.current.src = videoUrl;
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Error loading stream:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stream');
      setIsLoading(false);
    }
  };

  // Load subtitles
  const loadSubtitles = async () => {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `/api/episodes/${episode._id}/subtitles`
      );

      if (response.data.success && response.data.data?.subtitles) {
        setSubtitles(response.data.data.subtitles);
        // Set default subtitle
        const defaultSub = response.data.data.subtitles.find(
          (s: SubtitleTrack) => s.isDefault
        );
        if (defaultSub) {
          setSelectedSubtitle(defaultSub);
        }
      }
    } catch (err) {
      console.error('Error loading subtitles:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadSubtitles();
    loadStream(format, language, quality);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  // Handle format / language change
  const handleFormatChange = async (newFormat: 'subbed' | 'dubbed', newLanguage: string) => {
    setFormat(newFormat);
    setLanguage(newLanguage);
    await loadStream(newFormat, newLanguage, quality);
    onFormatChange?.(newFormat, newLanguage);
  };

  // Handle quality change
  const handleQualityChange = async (newQuality: string) => {
    setQuality(newQuality);
    const currentTimeBackup = videoRef.current?.currentTime || 0;
    await loadStream(format, language, newQuality);
    
    // Restore playback position
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTimeBackup;
        if (isPlaying) {
          videoRef.current.play();
        }
      }
    }, 500);
  };

  // Handle subtitle change
  const handleSubtitleChange = (subtitle: SubtitleTrack | null) => {
    setSelectedSubtitle(subtitle);
    if (subtitle && videoRef.current) {
      // Add subtitle track to video element
      const existingTrack = videoRef.current.querySelector('track');
      if (existingTrack) {
        existingTrack.remove();
      }

      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = subtitle.url;
      track.srclang = subtitle.language.toLowerCase();
      track.label = subtitle.language;
      track.default = true;
      
      videoRef.current.appendChild(track);
    }
  };

  // Handle playback progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      onProgress?.(progress, videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  // Format available audio tracks
  const getAvailableAudioTracks = (): { format: 'subbed' | 'dubbed'; language: string }[] => {
    const tracks: { format: 'subbed' | 'dubbed'; language: string }[] = [];

    if (episode.formats.subbed?.available) {
      tracks.push({
        format: 'subbed',
        language: 'Japanese',
      });
    }

    episode.formats.dubbed?.forEach((dub) => {
      if (dub.available) {
        tracks.push({
          format: 'dubbed',
          language: dub.language,
        });
      }
    });

    return tracks;
  };

  const audioTracks = getAvailableAudioTracks();

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden aspect-video group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => videoRef.current?.paused && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => {
          setDuration((e.target as HTMLVideoElement).duration);
        }}
        controls={false}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75">
          <div className="text-white text-center">
            <p className="text-lg font-semibold mb-2">Error loading video</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Progress Bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="h-1 bg-gray-600 rounded cursor-pointer hover:h-2 group/progress">
            <div
              className="h-full bg-blue-500 rounded group-hover/progress:bg-blue-400"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Format & Language Selection */}
          <div className="flex gap-2">
            {audioTracks.map((track) => (
              <button
                key={`${track.format}-${track.language}`}
                onClick={() => handleFormatChange(track.format, track.language)}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  format === track.format && language === track.language
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {track.format === 'subbed' ? 'Sub' : `Dub (${track.language})`}
              </button>
            ))}
          </div>

          {/* Subtitle Toggle */}
          <div className="flex gap-2 items-center">
            <select
              value={selectedSubtitle?._id || 'none'}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'none') {
                  handleSubtitleChange(null);
                } else {
                  const selected = subtitles.find((s) => s._id === value);
                  handleSubtitleChange(selected || null);
                }
              }}
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs cursor-pointer"
            >
              <option value="none">No Subtitles</option>
              {subtitles.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.language}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Selection */}
          <select
            value={quality}
            onChange={(e) => handleQualityChange(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-xs cursor-pointer"
          >
            <option value="360p">360p</option>
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>
      </div>

      {/* Play/Pause Overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/20 transition"
        onClick={() => {
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
        }}
      >
        {!isPlaying && !isLoading && (
          <div className="bg-white/30 rounded-full p-4 backdrop-blur-sm">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
