import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

async function getDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { anime: [] };
  }
}

async function saveDb(data: any) {
  try {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
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

export async function POST() {
  const db = await getDb();
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

  await saveDb(db);

  return NextResponse.json({ enriched, failed, total: missing.length });
}
