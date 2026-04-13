'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Plus, Star, Tv2 } from 'lucide-react';
import { DiscoverAnime, AnimeEntry } from '@/types';
import useAnimeStore from '@/store';
import { generateId } from '@/lib/utils';

interface Props {
  onAddToWatchlist: (anime: AnimeEntry) => void;
}

export function DiscoverTab({ onAddToWatchlist }: Props) {
  const discoverAnime = useAnimeStore((s) => s.discoverAnime);
  const isLoadingDiscover = useAnimeStore((s) => s.isLoadingDiscover);
  const discoverPage = useAnimeStore((s) => s.discoverPage);
  const fetchDiscoverAnime = useAnimeStore((s) => s.fetchDiscoverAnime);
  const watchlistAnime = useAnimeStore((s) => s.anime);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiscoverAnime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  // Pre-populate addedIds from watchlist names (approximate)
  const watchlistNames = new Set(watchlistAnime.map((a) => a.name.toLowerCase()));

  useEffect(() => {
    if (discoverAnime.length === 0) {
      fetchDiscoverAnime(1);
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/jikan?type=search&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToWatchlist = (item: DiscoverAnime) => {
    const newAnime: AnimeEntry = {
      id: generateId(),
      name: item.title,
      imageUrl: item.imageUrl,
      rating: item.score || 0,
      description: item.synopsis,
      status: item.isOngoing ? 'watching' : 'planned',
      isOngoing: item.isOngoing,
      latestSeason: item.latestSeason,
      dateAdded: new Date().toISOString(),
      genres: item.genres,
      episodes: item.episodes,
      episodesWatched: 0,
    };
    onAddToWatchlist(newAnime);
    setAddedIds((prev) => new Set(prev).add(item.mal_id));
  };

  const displayList = searchResults.length > 0 ? searchResults : discoverAnime;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold gradient-text">Discover Anime</h2>
        <p className="text-sm text-slate-500 mt-1">Top & trending anime from MyAnimeList. Click to add to your watchlist.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any anime..."
            className="pl-9 text-sm"
          />
        </div>
        <button type="submit" disabled={isSearching} className="btn-primary px-5">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Search'
          )}
        </button>
        {searchResults.length > 0 && (
          <button
            type="button"
            onClick={() => { setSearchResults([]); setSearchQuery(''); }}
            className="btn-ghost px-4"
          >
            Clear
          </button>
        )}
      </form>

      {/* Grid */}
      {isLoadingDiscover && discoverAnime.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton h-52 rounded-2xl" />
              <div className="mt-2 space-y-1.5">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {displayList.map((item, i) => {
            const alreadyAdded =
              addedIds.has(item.mal_id) ||
              watchlistNames.has(item.title.toLowerCase());
            return (
              <motion.div
                key={`${item.mal_id}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group relative"
              >
                <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
                  {/* Poster */}
                  <div className="relative h-52 overflow-hidden bg-slate-800">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-violet-900/40 to-slate-900">
                        🎬
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                    {/* Score */}
                    {item.score > 0 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {item.score.toFixed(1)}
                      </div>
                    )}

                    {/* Add button overlay */}
                    <div className="absolute bottom-2 inset-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleAddToWatchlist(item)}
                        disabled={alreadyAdded}
                        className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                          alreadyAdded
                            ? 'bg-green-500/30 border border-green-500/40 text-green-300 cursor-default'
                            : 'bg-violet-600/80 hover:bg-violet-600 border border-violet-400/40 text-white backdrop-blur-sm'
                        }`}
                      >
                        {alreadyAdded ? (
                          '✓ In Watchlist'
                        ) : (
                          <>
                            <Plus className="w-3 h-3" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5 space-y-1">
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-tight">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      {item.episodes && (
                        <span className="flex items-center gap-0.5">
                          <Tv2 className="w-2.5 h-2.5" /> {item.episodes}ep
                        </span>
                      )}
                      {item.isOngoing && (
                        <span className="text-amber-500 font-medium">● LIVE</span>
                      )}
                    </div>
                    {item.genres.length > 0 && (
                      <p className="text-xs text-violet-400 truncate">
                        {item.genres.slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {discoverAnime.length > 0 && searchResults.length === 0 && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchDiscoverAnime(discoverPage + 1)}
            disabled={isLoadingDiscover}
            className="btn-ghost px-8 py-3 gap-2"
          >
            {isLoadingDiscover ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
