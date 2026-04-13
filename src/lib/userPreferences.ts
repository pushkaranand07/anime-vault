// User preferences and watch history management
import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import { UserPreferences, WatchHistoryEntry, SubtitleSettings } from '@/types';

// Default subtitle settings
const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  enabled: true,
  size: 'medium',
  color: '#ffffff',
  backgroundColor: '#000000',
  opacity: 0.8,
  fontFamily: 'Arial',
  fontSize: 18,
  textAlign: 'center',
};

// Default user preferences
const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, '_id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  defaultFormat: 'subbed',
  defaultDubLanguage: 'English',
  defaultSubtitleLanguage: 'English',
  subtitleEnabled: true,
  subtitleSettings: DEFAULT_SUBTITLE_SETTINGS,
  autoPlayNextEpisode: true,
  preferredQuality: '720p',
  watchHistory: [],
};

/**
 * Get user preferences (create if not exists)
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const db = await getDatabase();

    let preferences = await db
      .collection<UserPreferences>('userPreferences')
      .findOne({ userId });

    if (!preferences) {
      // Create default preferences
      const result = await db.collection('userPreferences').insertOne({
        userId,
        ...DEFAULT_USER_PREFERENCES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      preferences = {
        _id: result.insertedId.toString(),
        userId,
        ...DEFAULT_USER_PREFERENCES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return preferences;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw error;
  }
}

/**
 * Update user default format preference
 */
export async function updateDefaultFormat(
  userId: string,
  format: 'subbed' | 'dubbed',
  language?: string
) {
  try {
    const db = await getDatabase();
    const updateData: any = { defaultFormat: format };

    if (format === 'dubbed' && language) {
      updateData.defaultDubLanguage = language;
    }

    updateData.updatedAt = new Date().toISOString();

    await db
      .collection('userPreferences')
      .updateOne({ userId }, { $set: updateData }, { upsert: true });

    return true;
  } catch (error) {
    console.error('Error updating default format:', error);
    throw error;
  }
}

/**
 * Update subtitle settings
 */
export async function updateSubtitleSettings(
  userId: string,
  settings: Partial<SubtitleSettings>
) {
  try {
    const db = await getDatabase();
    const updateData: any = {};

    Object.entries(settings).forEach(([key, value]) => {
      updateData[`subtitleSettings.${key}`] = value;
    });

    updateData.updatedAt = new Date().toISOString();

    await db
      .collection('userPreferences')
      .updateOne({ userId }, { $set: updateData }, { upsert: true });

    return true;
  } catch (error) {
    console.error('Error updating subtitle settings:', error);
    throw error;
  }
}

/**
 * Add or update watch history entry
 */
export async function updateWatchHistory(
  userId: string,
  historyEntry: WatchHistoryEntry
) {
  try {
    const db = await getDatabase();

    // Get existing preferences
    const preferences = await getUserPreferences(userId);

    // Check if entry exists
    const existingIndex = preferences.watchHistory?.findIndex(
      (h) => h.episodeId === historyEntry.episodeId
    );

    let updateData: any;

    if (existingIndex !== undefined && existingIndex > -1) {
      // Update existing
      updateData = {
        [`watchHistory.${existingIndex}`]: historyEntry,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new
      updateData = {
        $push: { watchHistory: historyEntry },
        $set: { updatedAt: new Date().toISOString() },
      };
    }

    // Limit watch history to last 100 entries
    if (preferences.watchHistory?.length >= 100 && !existingIndex) {
      // Remove oldest entry
      await db
        .collection('userPreferences')
        .updateOne({ userId }, { $pop: { watchHistory: -1 } });
    }

    await db
      .collection('userPreferences')
      .updateOne(
        { userId },
        updateData.$push ? updateData : { $set: updateData },
        { upsert: true }
      );

    return true;
  } catch (error) {
    console.error('Error updating watch history:', error);
    throw error;
  }
}

/**
 * Get watch history for user
 */
export async function getWatchHistory(userId: string): Promise<WatchHistoryEntry[]> {
  try {
    const db = await getDatabase();
    const preferences = await db
      .collection<UserPreferences>('userPreferences')
      .findOne({ userId }, { projection: { watchHistory: 1 } });

    return preferences?.watchHistory || [];
  } catch (error) {
    console.error('Error getting watch history:', error);
    throw error;
  }
}

/**
 * Get watch progress for specific episode
 */
export async function getEpisodeProgress(
  userId: string,
  episodeId: string
): Promise<WatchHistoryEntry | null> {
  try {
    const db = await getDatabase();
    const preferences = await db
      .collection<UserPreferences>('userPreferences')
      .findOne({ userId }, { projection: { watchHistory: 1 } });

    const history = preferences?.watchHistory?.find(
      (h) => h.episodeId === episodeId
    );

    return history || null;
  } catch (error) {
    console.error('Error getting episode progress:', error);
    throw error;
  }
}

/**
 * Bulk update watch history (for sync with other devices)
 */
export async function bulkUpdateWatchHistory(
  userId: string,
  historyEntries: WatchHistoryEntry[]
) {
  try {
    const db = await getDatabase();

    await db
      .collection('userPreferences')
      .updateOne(
        { userId },
        {
          $set: {
            watchHistory: historyEntries,
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );

    return true;
  } catch (error) {
    console.error('Error bulk updating watch history:', error);
    throw error;
  }
}

/**
 * Clear watch history
 */
export async function clearWatchHistory(userId: string) {
  try {
    const db = await getDatabase();

    await db
      .collection('userPreferences')
      .updateOne(
        { userId },
        {
          $set: {
            watchHistory: [],
            updatedAt: new Date().toISOString(),
          },
        }
      );

    return true;
  } catch (error) {
    console.error('Error clearing watch history:', error);
    throw error;
  }
}

/**
 * Get recently watched anime
 */
export async function getRecentlyWatched(userId: string, limit: number = 10) {
  try {
    const db = await getDatabase();
    const preferences = await db
      .collection<UserPreferences>('userPreferences')
      .findOne({ userId }, { projection: { watchHistory: 1 } });

    if (!preferences?.watchHistory) return [];

    // Group by animeId and get most recent
    const recentMap = new Map<string, WatchHistoryEntry>();

    preferences.watchHistory
      .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
      .forEach((entry) => {
        if (!recentMap.has(entry.animeId)) {
          recentMap.set(entry.animeId, entry);
        }
      });

    return Array.from(recentMap.values()).slice(0, limit);
  } catch (error) {
    console.error('Error getting recently watched:', error);
    throw error;
  }
}
