// POST /api/admin/update-episodes
// Trigger episode updates from Jikan API

import { NextRequest, NextResponse } from 'next/server';
import { updateAnime, updateAllOngoingAnime, getUpdateStatus } from '@/lib/updateService';
import { ApiResponse } from '@/types';
import { getAuth } from '@clerk/nextjs/server';

// Simple admin check (replace with proper role-based auth in production)
function isAdmin(userId: string): boolean {
  // You should replace this with proper admin role checking
  // For now, using environment variable
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    // Check authentication
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type = 'all', animeId } = body;

    if (type === 'single' && !animeId) {
      return NextResponse.json(
        { success: false, error: 'Anime ID required for single update' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    let result;

    if (type === 'single') {
      result = await updateAnime(animeId);
    } else {
      result = await updateAllOngoingAnime();
    }

    const response = {
      success: true,
      data: result,
      message: `Update ${type === 'single' ? 'completed' : 'initiated'}`,
    } as ApiResponse<any>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/admin/update-episodes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    // Check authentication
    if (!userId || !isAdmin(userId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 403 }
      );
    }

    const status = await getUpdateStatus();

    const response = {
      success: true,
      data: status,
    } as ApiResponse<any>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/admin/update-episodes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
