import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function getDbPath(userId: string | null) {
  if (userId) {
    return path.join(process.cwd(), 'data', 'users', userId, 'db.json');
  }
  return path.join(process.cwd(), 'data', 'db.json');
}

async function getDb(userId: string | null) {
  const p = getDbPath(userId);
  try {
    const data = await fs.readFile(p, 'utf8');
    return JSON.parse(data);
  } catch {
    return { anime: [] };
  }
}

async function saveDb(userId: string | null, data: any) {
  const p = getDbPath(userId);
  try {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to save DB', error);
    return false;
  }
}

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
  const db = await getDb(userId);
  const missing = db.anime.filter(
    (a: any) => !a.imageUrl || a.imageUrl.trim() === ''
  );

  let enriched = 0;
  const failed: string[] = [];

  for (let i = 0; i < missing.length; i++) {
    const anime = missing[i];
    const imageUrl = await searchJikanByTitle(anime.name);

    if (imageUrl) {
      const idx = db.anime.findIndex((a: any) => a.id === anime.id);
      if (idx !== -1) {
        db.anime[idx].imageUrl = imageUrl;
        enriched++;
      }
    } else {
      failed.push(anime.name);
    }

    // Respect Jikan rate limit: ~3 req/s → 400ms between requests
    if (i < missing.length - 1) {
      await delay(400);
    }
  }

  await saveDb(userId, db);

  return NextResponse.json({ enriched, failed, total: missing.length });
}
