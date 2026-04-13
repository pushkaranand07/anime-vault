// GET /api/episodes/[id]/formats
// Returns available formats (subbed/dubbed) and subtitles for an episode

import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeById, getAvailableFormats } from '@/lib/episodes';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Episode ID is required' } as ApiResponse<null>,
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

    // Get available formats
    const formats = await getAvailableFormats(id);

    const response = {
      success: true,
      data: {
        episodeId: episode._id,
        episodeNumber: episode.episodeNumber,
        title: episode.title,
        duration: episode.duration,
        formats: {
          subbed: formats?.subbed || null,
          dubbed: formats?.dubbed || [],
        },
        subtitles: formats?.subtitles || [],
      },
    } as ApiResponse<any>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/episodes/[id]/formats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
