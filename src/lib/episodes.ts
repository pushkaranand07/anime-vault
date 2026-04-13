// Database utilities for episodes, formats, and subtitles
import clientPromise, { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import { Episode, SubtitleTrack, EpisodeFormat } from '@/types';

/**
 * Get all episodes for an anime
 */
export async function getEpisodesByAnimeId(
  animeId: string,
  limit: number = 50,
  page: number = 1
): Promise<Episode[]> {
  try {
    const db = await getDatabase();
    const episodes = await db
      .collection('episodes')
      .find({ animeId: new ObjectId(animeId) })
      .sort({ episodeNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return episodes as Episode[];
  } catch (error) {
    console.error('Error getting episodes:', error);
    throw error;
  }
}

/**
 * Get single episode by ID
 */
export async function getEpisodeById(episodeId: string): Promise<Episode | null> {
  try {
    const db = await getDatabase();
    const episode = await db
      .collection<Episode>('episodes')
      .findOne({ _id: new ObjectId(episodeId) });

    return episode || null;
  } catch (error) {
    console.error('Error getting episode:', error);
    throw error;
  }
}

/**
 * Get episode by anime and episode number
 */
export async function getEpisodeByNumber(
  animeId: string,
  episodeNumber: number
): Promise<Episode | null> {
  try {
    const db = await getDatabase();
    const episode = await db
      .collection<Episode>('episodes')
      .findOne({
        animeId: new ObjectId(animeId),
        episodeNumber: episodeNumber,
      });

    return episode || null;
  } catch (error) {
    console.error('Error getting episode by number:', error);
    throw error;
  }
}

/**
 * Create new episode
 */
export async function createEpisode(episodeData: Omit<Episode, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const db = await getDatabase();
    const result = await db.collection('episodes').insertOne({
      ...episodeData,
      animeId: new ObjectId(episodeData.animeId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      rating: 0,
    });

    return result.insertedId.toString();
  } catch (error) {
    console.error('Error creating episode:', error);
    throw error;
  }
}

/**
 * Update episode format (add/update video URL and quality options)
 */
export async function updateEpisodeFormat(
  episodeId: string,
  format: 'subbed' | 'dubbed',
  formatData: EpisodeFormat
) {
  try {
    const db = await getDatabase();
    const update: any = {};

    if (format === 'subbed') {
      update['formats.subbed'] = formatData;
    } else {
      // For dubbed, we push to the array or update if exists
      const episode = await db
        .collection<Episode>('episodes')
        .findOne({ _id: new ObjectId(episodeId) });

      if (!episode) throw new Error('Episode not found');

      const dubIndex = episode.formats.dubbed?.findIndex(
        (d) => d.language === formatData.language
      );

      if (dubIndex !== undefined && dubIndex > -1) {
        update[`formats.dubbed.${dubIndex}`] = formatData;
      } else {
        update.$push = { 'formats.dubbed': formatData };
      }
    }

    update.updatedAt = new Date().toISOString();

    await db
      .collection('episodes')
      .updateOne({ _id: new ObjectId(episodeId) }, { $set: update.$set ? update : update });

    return true;
  } catch (error) {
    console.error('Error updating episode format:', error);
    throw error;
  }
}

/**
 * Add subtitle to episode
 */
export async function addSubtitleToEpisode(
  episodeId: string,
  subtitle: SubtitleTrack
) {
  try {
    const db = await getDatabase();

    // Check if subtitle language already exists and replace it
    const episode = await db
      .collection<Episode>('episodes')
      .findOne({ _id: new ObjectId(episodeId) });

    if (!episode) throw new Error('Episode not found');

    const existingIndex = episode.subtitles?.findIndex(
      (s) => s.language === subtitle.language
    );

    if (existingIndex !== undefined && existingIndex > -1) {
      // Update existing subtitle
      await db
        .collection('episodes')
        .updateOne(
          { _id: new ObjectId(episodeId) },
          { $set: { [`subtitles.${existingIndex}`]: subtitle, updatedAt: new Date().toISOString() } }
        );
    } else {
      // Add new subtitle
      await db
        .collection('episodes')
        .updateOne(
          { _id: new ObjectId(episodeId) },
          {
            $push: { subtitles: subtitle },
            $set: { updatedAt: new Date().toISOString() },
          }
        );
    }

    return true;
  } catch (error) {
    console.error('Error adding subtitle:', error);
    throw error;
  }
}

/**
 * Get available subtitles for episode
 */
export async function getAvailableSubtitles(episodeId: string): Promise<SubtitleTrack[]> {
  try {
    const db = await getDatabase();
    const episode = await db
      .collection<Episode>('episodes')
      .findOne(
        { _id: new ObjectId(episodeId) },
        { projection: { subtitles: 1 } }
      );

    return episode?.subtitles || [];
  } catch (error) {
    console.error('Error getting subtitles:', error);
    throw error;
  }
}

/**
 * Get available formats for episode
 */
export async function getAvailableFormats(episodeId: string) {
  try {
    const db = await getDatabase();
    const episode = await db
      .collection<Episode>('episodes')
      .findOne(
        { _id: new ObjectId(episodeId) },
        { projection: { formats: 1, subtitles: 1 } }
      );

    if (!episode) return null;

    const response = {
      subbed: episode.formats.subbed ? {
        available: episode.formats.subbed.available,
        language: 'Japanese',
      } : null,
      dubbed: episode.formats.dubbed
        ? episode.formats.dubbed.map((d) => ({
          available: d.available,
          language: d.language,
        }))
        : [],
      subtitles: episode.subtitles || [],
    };

    return response;
  } catch (error) {
    console.error('Error getting available formats:', error);
    throw error;
  }
}

/**
 * Increment episode views
 */
export async function incrementEpisodeViews(episodeId: string) {
  try {
    const db = await getDatabase();
    await db.collection('episodes').updateOne(
      { _id: new ObjectId(episodeId) },
      {
        $inc: { views: 1 },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    return true;
  } catch (error) {
    console.error('Error incrementing views:', error);
    throw error;
  }
}

/**
 * Update anime available formats based on episodes
 */
export async function updateAnimeAvailableFormats(animeId: string) {
  try {
    const db = await getDatabase();

    // Get all episodes for anime
    const episodes = await db
      .collection<Episode>('episodes')
      .find({ animeId: new ObjectId(animeId) })
      .toArray();

    // Determine available formats
    const hasSubbed = episodes.some((e) => e.formats.subbed?.available);
    const dubLanguages = new Set<string>();

    episodes.forEach((e) => {
      e.formats.dubbed?.forEach((d) => {
        if (d.available) {
          dubLanguages.add(d.language);
        }
      });
    });

    // Update anime document
    await db.collection('anime').updateOne(
      { _id: new ObjectId(animeId) },
      {
        $set: {
          'availableFormats.subbed': hasSubbed,
          'availableFormats.dubbed': dubLanguages.size > 0,
          'availableFormats.dubLanguages': Array.from(dubLanguages),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return true;
  } catch (error) {
    console.error('Error updating anime available formats:', error);
    throw error;
  }
}

/**
 * Get episode count for anime
 */
export async function getEpisodeCount(animeId: string): Promise<number> {
  try {
    const db = await getDatabase();
    const count = await db
      .collection('episodes')
      .countDocuments({ animeId: new ObjectId(animeId) });

    return count;
  } catch (error) {
    console.error('Error getting episode count:', error);
    throw error;
  }
}
