// GET /api/user/preferences
// POST /api/user/preferences
// User preference management endpoints

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPreferences,
  updateDefaultFormat,
  updateSubtitleSettings,
} from '@/lib/userPreferences';
import { ApiResponse, UserPreferences } from '@/types';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const preferences = await getUserPreferences(userId);

    const response = {
      success: true,
      data: preferences,
    } as ApiResponse<UserPreferences>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/user/preferences:', error);
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
    const { defaultFormat, defaultDubLanguage, subtitleSettings } = body;

    // Update default format if provided
    if (defaultFormat) {
      await updateDefaultFormat(userId, defaultFormat, defaultDubLanguage);
    }

    // Update subtitle settings if provided
    if (subtitleSettings) {
      await updateSubtitleSettings(userId, subtitleSettings);
    }

    // Get updated preferences
    const preferences = await getUserPreferences(userId);

    const response = {
      success: true,
      data: preferences,
      message: 'Preferences updated successfully',
    } as ApiResponse<UserPreferences>;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/user/preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
