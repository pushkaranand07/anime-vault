// GET /api/episodes/[id]/stream
// Returns the stream URL and manifest for a specific format

import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeById, incrementEpisodeViews } from '@/lib/episodes';
import { ApiResponse, StreamingManifest } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'subbed' or 'dubbed'
    const language = searchParams.get('language'); // 'Japanese', 'English', etc.
    const quality = searchParams.get('quality') || '720p'; // Video quality

    if (!id || !format || !language) {
      return NextResponse.json(
        {
          success: false,
          error: 'Episode ID, format, and language are required',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get episode details
    const episode = await getEpisodeById(id);

    if (!episode) {
      return NextResponse.json(
        { success: false, error: 'Episode not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Find the requested format
    let videoUrl: string | null = null;
    let audioMetadata: any = null;

    if (format === 'subbed' && episode.formats.subbed) {
      if (episode.formats.subbed.language === 'Japanese' || language === 'Japanese') {
        videoUrl = episode.formats.subbed.qualityOptions[quality];
        audioMetadata = episode.formats.subbed.audioMetadata;
      }
    } else if (format === 'dubbed') {
      const dubbed = episode.formats.dubbed?.find((d) => d.language === language);
      if (dubbed) {
        videoUrl = dubbed.qualityOptions[quality];
        audioMetadata = dubbed.audioMetadata;
      }
    }

    if (!videoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: `${format} version in ${language} with ${quality} quality not found`,
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Increment views
    await incrementEpisodeViews(id);

    // Build manifest response
    const manifest: StreamingManifest = {
      type: videoUrl.includes('.m3u8') ? 'hls' : videoUrl.includes('.mpd') ? 'dash' : 'mp4',
      url: videoUrl,
      duration: episode.duration,
      audioTracks: [
        {
          id: `${format}-${language}`,
          language: language,
          label: `${format === 'subbed' ? 'Japanese' : language}${format === 'subbed' ? ' (Subbed)' : ' (Dubbed)'}`,
          kind: 'main',
        },
      ],
      subtitleTracks: episode.subtitles || [],
    };

    const response = {
      success: true,
      data: {
        episodeId: episode._id,
        episodeNumber: episode.episodeNumber,
        title: episode.title,
        manifest: manifest,
        audioMetadata: audioMetadata,
        recommendedQuality: quality,
      },
    } as ApiResponse<any>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/episodes/[id]/stream:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
