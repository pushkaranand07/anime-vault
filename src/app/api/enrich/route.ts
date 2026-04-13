import { NextResponse } from 'next/server';
import { getAnimeCollection } from '@/lib/mongodb';

async function searchJikanByTitle(title: string): Promise<string | null> {
  try {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=3&sfw=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = await res.json();
    const items: any[] = json.data || [];
    if (items.length === 0) return null;

    // Prefer exact English or Japanese title match
    const titleLower = title.toLowerCase();
    const exact = items.find(
      (i) =>
        i.title?.toLowerCase() === titleLower ||
        i.title_english?.toLowerCase() === titleLower
    );
    const best = exact || items[0];
    return (
      best.images?.webp?.large_image_url ||
      best.images?.jpg?.large_image_url ||
      null
    );
  } catch {
    return null;
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const collection = await getAnimeCollection(userId);

    // Find anime entries belonging to this user that have no image
    const missing = await collection.find({
      userId,
      $or: [
        { imageUrl: { $exists: false } },
        { imageUrl: '' },
        { imageUrl: null },
      ],
    }).toArray();

    let enriched = 0;
    const failed: string[] = [];

    for (let i = 0; i < missing.length; i++) {
      const anime = missing[i];
      const imageUrl = await searchJikanByTitle(anime.name);

      if (imageUrl) {
        await collection.updateOne(
          { _id: anime._id, userId },
          { $set: { imageUrl } }
        );
        enriched++;
      } else {
        failed.push(anime.name);
      }

      // Respect Jikan rate limit: ~3 req/s → 400ms between requests
      if (i < missing.length - 1) {
        await delay(400);
      }
    }

    return NextResponse.json({ enriched, failed, total: missing.length });
  } catch (err) {
    console.error('POST /api/enrich error:', err);
    return NextResponse.json({ error: 'Enrichment failed' }, { status: 500 });
  }
}
