// GET /api/user/watch-history
// POST /api/user/watch-history
// Watch history management endpoints

import { NextRequest, NextResponse } from 'next/server';
import {
  getWatchHistory,
  updateWatchHistory,
  getEpisodeProgress,
} from '@/lib/userPreferences';
import { ApiResponse } from '@/types';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    const { searchParams } = new URL(request.url);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Check if requesting specific episode progress
    const episodeId = searchParams.get('episodeId');

    if (episodeId) {
      const progress = await getEpisodeProgress(userId, episodeId);
      return NextResponse.json({
        success: true,
        data: progress,
      } as ApiResponse<any>);
    }

    const history = await getWatchHistory(userId);

    const response = {
      success: true,
      data: {
        total: history.length,
        history: history,
      },
    } as ApiResponse<any>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/user/watch-history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      animeId,
      episodeId,
      episodeNumber,
      currentFormat,
      currentLanguage,
      progress,
      lastWatchedTime,
      duration,
    } = body;

    if (!episodeId || !animeId) {
      return NextResponse.json(
        { success: false, error: 'Episode ID and Anime ID are required' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create watch history entry
    const historyEntry = {
      animeId,
      episodeId,
      episodeNumber,
      currentFormat: currentFormat || 'subbed',
      currentLanguage: currentLanguage || 'Japanese',
      watchedAt: new Date().toISOString(),
      progress: progress || 0,
      lastWatchedTime: lastWatchedTime || 0,
      duration: duration || 0,
    };

    // Update watch history
    await updateWatchHistory(userId, historyEntry);

    const response = {
      success: true,
      data: historyEntry,
      message: 'Watch history updated',
    } as ApiResponse<any>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/user/watch-history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
