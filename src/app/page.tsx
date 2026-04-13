'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { AnimeCard } from '@/components/AnimeCard';
import { AnimeModal } from '@/components/AnimeModal';
import { AnimeDetailDrawer } from '@/components/AnimeDetailDrawer';
import { Filters } from '@/components/Filters';
import { SkeletonCard } from '@/components/SkeletonCard';
import { DiscoverTab } from '@/components/DiscoverTab';
import { StatsTab } from '@/components/StatsTab';
import useAnimeStore from '@/store';
import { AnimeEntry } from '@/types';
import { Grid3x3, List, Plus, Tv2 } from 'lucide-react';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [editingAnime, setEditingAnime] = useState<AnimeEntry | undefined>();

  const showModal = useAnimeStore((s) => s.showModal);
  const setShowModal = useAnimeStore((s) => s.setShowModal);
  const setEditingId = useAnimeStore((s) => s.setEditingId);
  const viewMode = useAnimeStore((s) => s.viewMode);
  const activeTab = useAnimeStore((s) => s.activeTab);
  const getFilteredAndSortedAnime = useAnimeStore((s) => s.getFilteredAndSortedAnime);
  const deleteAnime = useAnimeStore((s) => s.deleteAnime);
  const addAnime = useAnimeStore((s) => s.addAnime);
  const fetchAnime = useAnimeStore((s) => s.fetchAnime);
  const isLoading = useAnimeStore((s) => s.isLoading);
  const allAnime = useAnimeStore((s) => s.anime);
  const filters = useAnimeStore((s) => s.filters);
  const sortOption = useAnimeStore((s) => s.sortOption);

  // Memoize filtered anime to prevent unnecessary re-computation
  const filteredAnime = useMemo(() => getFilteredAndSortedAnime(), [allAnime, filters, sortOption, getFilteredAndSortedAnime]);

  useEffect(() => {
    setIsMounted(true);
    fetchAnime();
  }, []);

  const handleAddClick = () => {
    setEditingAnime(undefined);
    setEditingId(null);
    setShowModal(true);
  };


  const handleEdit = (anime: AnimeEntry) => {
    setEditingAnime(anime);
    setEditingId(anime.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this anime from your list?')) {
      deleteAnime(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnime(undefined);
    setEditingId(null);
  };

  const handleAddFromDiscover = async (anime: AnimeEntry) => {
    await addAnime(anime);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen">
      <Header onAddClick={handleAddClick} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* ──────────────── WATCHLIST TAB ──────────────── */}
          {activeTab === 'watchlist' && (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Filters */}
              <div className="mb-6">
                <Filters />
              </div>

              {/* Loading skeletons */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && filteredAnime.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-24 h-24 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-5xl mb-6 float-animation">
                    🎬
                  </div>
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    {allAnime.length > 0 ? 'No Results' : 'Your Watchlist is Empty'}
                  </h2>
                  <p className="text-slate-500 mb-8 max-w-sm">
                    {allAnime.length > 0
                      ? 'Try clearing your filters or search query.'
                      : 'Start building your anime collection. Search via Jikan or add manually.'}
                  </p>
                  <button onClick={handleAddClick} className="btn-primary gap-2 px-6 py-3 text-base">
                    <Plus className="w-5 h-5" /> Add Your First Anime
                  </button>
                </motion.div>
              )}

              {/* Results */}
              {!isLoading && filteredAnime.length > 0 && (
                <>
                  {/* Results info */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Tv2 className="w-4 h-4 text-violet-400" />
                      <span>
                        <span className="text-slate-200 font-semibold">{filteredAnime.length}</span>
                        {allAnime.length !== filteredAnime.length && ` of ${allAnime.length}`} anime
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>{viewMode === 'grid' ? <Grid3x3 className="w-3.5 h-3.5 inline" /> : <List className="w-3.5 h-3.5 inline" />}</span>
                      <span className="capitalize">{viewMode} view</span>
                    </div>
                  </div>

                  {/* Grid View */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <AnimatePresence>
                        {filteredAnime.map((anime) => (
                          <motion.div
                            key={anime.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AnimeCard
                              anime={anime}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* List View */
                    <div className="space-y-3">
                      <AnimatePresence>
                        {filteredAnime.map((anime) => (
                          <motion.div
                            key={anime.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
                            onClick={() => {
                              useAnimeStore.getState().setSelectedAnime(anime);
                              useAnimeStore.getState().setShowDetailDrawer(true);
                            }}
                          >
                            {/* Poster */}
                            <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                              {anime.imageUrl ? (
                                <img 
                                  src={anime.imageUrl} 
                                  alt={anime.name} 
                                  className="w-full h-full object-cover" 
                                  loading="lazy" 
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://placehold.co/100x150/1e2238/w?text=No+Img';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-violet-900/40 to-slate-900">🎬</div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-100 truncate">{anime.name}</h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                                <span className="text-amber-400 font-semibold">⭐ {anime.rating.toFixed(1)}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${anime.status === 'watching' ? 'badge-watching' : anime.status === 'completed' ? 'badge-completed' : 'badge-planned'}`}>
                                  {anime.status}
                                </span>
                                {anime.isOngoing && <span className="text-amber-500 font-medium">LIVE</span>}
                                {anime.episodes && (
                                  <span>{anime.episodesWatched || 0}/{anime.episodes} eps</span>
                                )}
                              </div>
                              {anime.genres && anime.genres.length > 0 && (
                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                  {anime.genres.slice(0, 3).map(g => (
                                    <span key={g} className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">{g}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(anime); }}
                                className="btn-ghost p-2 rounded-xl"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(anime.id); }}
                                className="btn-danger p-2 rounded-xl"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ──────────────── DISCOVER TAB ──────────────── */}
          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <DiscoverTab onAddToWatchlist={handleAddFromDiscover} />
            </motion.div>
          )}

          {/* ──────────────── STATS TAB ──────────────── */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <StatsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal */}
      <AnimeModal isOpen={showModal} onClose={handleCloseModal} initialData={editingAnime} />

      {/* Detail Drawer */}
      <AnimeDetailDrawer onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
