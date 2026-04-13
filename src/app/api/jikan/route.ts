import { NextResponse } from 'next/server';
import { DiscoverAnime } from '@/types';

function mapJikanItem(item: any): DiscoverAnime {
  const genreNames: string[] = item.genres?.map((g: any) => g.name) || [];
  const isOngoing = item.status === 'Currently Airing';
  const season = item.season ? item.season.charAt(0).toUpperCase() + item.season.slice(1) : '';
  const latestSeason = [season, item.year].filter(Boolean).join(' ');

  return {
    mal_id: item.mal_id,
    title: item.title_english || item.title,
    title_english: item.title_english,
    imageUrl:
      item.images?.webp?.large_image_url ||
      item.images?.jpg?.large_image_url ||
      '',
    score: item.score || 0,
    synopsis: item.synopsis || '',
    genres: genreNames,
    episodes: item.episodes || undefined,
    status: item.status || 'Unknown',
    isOngoing,
    latestSeason: latestSeason || undefined,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'top';
  const page = searchParams.get('page') || '1';
  const q = searchParams.get('q') || '';

  let jikanUrl = '';
  if (type === 'top') {
    jikanUrl = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=24&filter=airing`;
  } else if (type === 'search' && q) {
    jikanUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=12&sfw=true`;
  } else {
    jikanUrl = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=24`;
  }

  try {
    const res = await fetch(jikanUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Jikan API error' }, { status: 502 });
    }

    const json = await res.json();
    const items: DiscoverAnime[] = (json.data || []).map(mapJikanItem);

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch from Jikan' },
      { status: 500 }
    );
  }
}
