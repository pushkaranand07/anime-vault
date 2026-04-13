// Auto-update service for fetching new episodes and their formats
// Integrates with Jikan API and handles scheduled updates

import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import axios from 'axios';

interface JikanEpisode {
  mal_id: number;
  episode: string | number;
  title: string;
  aired: string;
  synopsis: string;
  forum_url: string;
  score: number;
  url: string;
}

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  episodes: number;
  status: string;
}

/**
 * Update anime metadata from Jikan API
 */
export async function syncAnimeFromJikan(mal_id: number): Promise<boolean> {
  try {
    const db = await getDatabase();

    // Fetch anime from Jikan
    const response = await axios.get<JikanAnime>(
      `https://api.jikan.moe/v4/anime/${mal_id}`,
      {
        timeout: 10000,
      }
    );

    if (!response.data) {
      throw new Error('No data from Jikan API');
    }

    const animeData = response.data;

    // Update anime in database
    await db.collection('anime').updateOne(
      { mal_id: mal_id },
      {
        $set: {
          title: animeData.title,
          title_english: animeData.title_english,
          totalEpisodes: animeData.episodes,
          status: animeData.status,
          isOngoing: ['Currently Airing', 'Not yet aired'].includes(animeData.status),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    console.log(`✓ Synced anime ${mal_id}: ${animeData.title}`);
    return true;
  } catch (error) {
    console.error(`Error syncing anime ${mal_id}:`, error);
    return false;
  }
}

/**
 * Fetch episodes from Jikan API (with pagination)
 */
export async function fetchEpisodesFromJikan(
  mal_id: number,
  page: number = 1
): Promise<JikanEpisode[]> {
  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/anime/${mal_id}/episodes`,
      {
        params: { page },
        timeout: 10000,
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching episodes from Jikan for ${mal_id}:`, error);
    return [];
  }
}

/**
 * Check and create missing episodes from Jikan data
 */
export async function updateEpisodesFromJikan(
  animeId: string,
  mal_id: number,
  maxEpisodes?: number
): Promise<number> {
  try {
    const db = await getDatabase();
    let createdCount = 0;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      // Add delay between API calls to respect rate limits
      await new Promise((r) => setTimeout(r, 1000));

      const episodes = await fetchEpisodesFromJikan(mal_id, page);

      if (!episodes || episodes.length === 0) {
        hasMore = false;
        break;
      }

      // Process each episode
      for (const jikanEpisode of episodes) {
        if (maxEpisodes && parseInt(jikanEpisode.episode as string) > maxEpisodes) {
          hasMore = false;
          break;
        }

        const episodeNumber = parseInt(jikanEpisode.episode as string);
        if (isNaN(episodeNumber)) continue;

        // Check if episode already exists
        const existingEpisode = await db.collection('episodes').findOne({
          animeId: new ObjectId(animeId),
          episodeNumber,
        });

        if (!existingEpisode) {
          // Create new episode entry
          await db.collection('episodes').insertOne({
            animeId: new ObjectId(animeId),
            mal_episode_id: jikanEpisode.mal_id,
            episodeNumber,
            title: jikanEpisode.title,
            description: jikanEpisode.synopsis,
            airingDate: jikanEpisode.aired || new Date().toISOString(),
            duration: 1440, // Default 24 minutes in seconds
            formats: {
              subbed: null,
              dubbed: [],
            },
            subtitles: [],
            views: 0,
            rating: jikanEpisode.score || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          createdCount++;

          // Log update
          await db.collection('updateLogs').insertOne({
            animeId: new ObjectId(animeId),
            episodeNumber,
            format: 'unknown',
            language: 'unknown',
            status: 'pending',
            source: 'jikan_api',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          console.log(`✓ Created episode ${episodeNumber}: ${jikanEpisode.title}`);
        }
      }

      page++;

      if (episodes.length < 25) {
        hasMore = false;
      }
    }

    // Update anime available formats
    if (createdCount > 0) {
      await db.collection('anime').updateOne(
        { _id: new ObjectId(animeId) },
        { $set: { updatedAt: new Date().toISOString() } }
      );
    }

    return createdCount;
  } catch (error) {
    console.error(`Error updating episodes for anime ${mal_id}:`, error);
    return 0;
  }
}

/**
 * Update specific anime with new episodes
 */
export async function updateAnime(animeId: string): Promise<{
  success: boolean;
  newEpisodes: number;
  error?: string;
}> {
  try {
    const db = await getDatabase();

    // Get anime details
    const anime = await db
      .collection('anime')
      .findOne({ _id: new ObjectId(animeId) });

    if (!anime) {
      return { success: false, newEpisodes: 0, error: 'Anime not found' };
    }

    // Sync anime metadata
    const syncSuccess = await syncAnimeFromJikan(anime.mal_id);

    if (!syncSuccess) {
      return { success: false, newEpisodes: 0, error: 'Failed to sync anime' };
    }

    // Fetch and create episodes
    const newEpisodes = await updateEpisodesFromJikan(animeId, anime.mal_id);

    return { success: true, newEpisodes };
  } catch (error) {
    return {
      success: false,
      newEpisodes: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Bulk update all ongoing anime
 */
export async function updateAllOngoingAnime(): Promise<{
  updated: number;
  failed: number;
  newEpisodes: number;
}> {
  try {
    const db = await getDatabase();

    const ongoingAnime = await db
      .collection('anime')
      .find({ isOngoing: true })
      .toArray();

    let updated = 0;
    let failed = 0;
    let newEpisodes = 0;

    for (const anime of ongoingAnime) {
      console.log(`Updating anime: ${anime.title}`);

      const result = await updateAnime(anime._id.toString());

      if (result.success) {
        updated++;
        newEpisodes += result.newEpisodes;
      } else {
        failed++;
      }

      // Delay between updates
      await new Promise((r) => setTimeout(r, 2000));
    }

    return { updated, failed, newEpisodes };
  } catch (error) {
    console.error('Error in updateAllOngoingAnime:', error);
    return { updated: 0, failed: 0, newEpisodes: 0 };
  }
}

/**
 * Get update status
 */
export async function getUpdateStatus(limit: number = 20) {
  try {
    const db = await getDatabase();

    const logs = await db
      .collection('updateLogs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const stats = {
      total: await db.collection('updateLogs').countDocuments({}),
      completed: await db.collection('updateLogs').countDocuments({ status: 'completed' }),
      pending: await db.collection('updateLogs').countDocuments({ status: 'pending' }),
      failed: await db.collection('updateLogs').countDocuments({ status: 'failed' }),
      recentLogs: logs,
    };

    return stats;
  } catch (error) {
    console.error('Error getting update status:', error);
    throw error;
  }
}

/**
 * Manual trigger for update
 * Can be called from API endpoint or cron job
 */
export async function triggerUpdate(
  type: 'single' | 'all' = 'all',
  animeId?: string
): Promise<string> {
  try {
    if (type === 'single' && animeId) {
      const result = await updateAnime(animeId);
      return `Updated anime: ${result.newEpisodes} new episodes${result.error ? ` (Error: ${result.error})` : ''}`;
    }

    const result = await updateAllOngoingAnime();
    return `Updated ${result.updated} anime, ${result.newEpisodes} new episodes (${result.failed} failed)`;
  } catch (error) {
    console.error('Error triggering update:', error);
    throw error;
  }
}
