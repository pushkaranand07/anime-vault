'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { AnimeEntry } from '@/types';

interface JikanSearchProps {
  onSelectResult: (animeData: Partial<AnimeEntry>) => void;
}

export function JikanSearch({ onSelectResult }: JikanSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
      if (!res.ok) throw new Error('Failed to fetch from Jikan');
      const data = await res.json();
      setResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mapToAnimeEntry = (item: any) => {
    // Map Jikan response to AnimeEntry format
    const genreNames = item.genres?.map((g: any) => g.name) || [];
    
    // determine if ongoing based on item.status
    let isOngoing = false;
    let localStatus: AnimeEntry['status'] = 'planned';
    if (item.status === 'Currently Airing') {
        isOngoing = true;
        localStatus = 'watching';
    } else if (item.status === 'Finished Airing') {
        localStatus = 'completed';
    }

    onSelectResult({
      name: item.title_english || item.title || '',
      imageUrl: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || '',
      description: item.synopsis || '',
      episodes: item.episodes || undefined,
      rating: item.score || 0,
      status: localStatus,
      isOngoing,
      genres: genreNames,
      latestSeason: `${item.season ? item.season : ''} ${item.year ? item.year : ''}`.trim(),
    });
    
    // Clear search after selection
    setResults([]);
    setQuery('');
  };

  return (
    <div className="mb-6 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-blue-200 dark:border-slate-700">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Auto-fill from Jikan (MyAnimeList)</h3>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for anime..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </form>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      {results.length > 0 && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2">
          {results.map((item) => (
            <div
              key={item.mal_id}
              onClick={() => mapToAnimeEntry(item)}
              className="flex gap-3 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-blue-300"
            >
              <img
                src={item.images?.jpg?.image_url}
                alt={item.title}
                className="w-10 h-14 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {item.title_english || item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {item.synopsis || 'No description available'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
