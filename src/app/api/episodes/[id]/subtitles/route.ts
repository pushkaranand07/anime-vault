// GET /api/episodes/[id]/subtitles
// Returns available subtitle tracks for an episode

import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeById, getAvailableSubtitles } from '@/lib/episodes';
import { ApiResponse, SubtitleTrack } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language'); // Optional: filter by language

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Episode ID is required' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Verify episode exists
    const episode = await getEpisodeById(id);

    if (!episode) {
      return NextResponse.json(
        { success: false, error: 'Episode not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get available subtitles
    let subtitles = await getAvailableSubtitles(id);

    // Filter by language if provided
    if (language) {
      subtitles = subtitles.filter((s) => s.language === language);
    }

    const response = {
      success: true,
      data: {
        episodeId: episode._id,
        episodeNumber: episode.episodeNumber,
        title: episode.title,
        subtitles: subtitles,
        totalAvailable: subtitles.length,
      },
    } as ApiResponse<any>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/episodes/[id]/subtitles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
