'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { AnimeCard } from '@/components/AnimeCard';
import { AnimeListRow } from '@/components/AnimeListRow';
import { Filters } from '@/components/Filters';
import { SkeletonCard } from '@/components/SkeletonCard';
import { LoginScreen } from '@/components/LoginScreen';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import useAnimeStore from '@/store';
import { AnimeEntry } from '@/types';
import { Grid3x3, List, Plus, Tv2 } from 'lucide-react';

const AnimeModal = dynamic(() => import('@/components/AnimeModal').then(m => m.AnimeModal), { ssr: false });
const AnimeDetailDrawer = dynamic(() => import('@/components/AnimeDetailDrawer').then(m => m.AnimeDetailDrawer), { ssr: false });
const DiscoverTab = dynamic(() => import('@/components/DiscoverTab').then(m => m.DiscoverTab), { 
  ssr: false,
  loading: () => <div className="p-20 text-center text-slate-500 animate-pulse">Loading Discover...</div>
});
const StatsTab = dynamic(() => import('@/components/StatsTab').then(m => m.StatsTab), { 
  ssr: false,
  loading: () => <div className="p-20 text-center text-slate-500 animate-pulse">Loading Stats...</div>
});

export default function Home() {
  const { userId, isLoaded } = useUser();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [editingAnime, setEditingAnime] = useState<AnimeEntry | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const filteredAnime = useMemo(() => getFilteredAndSortedAnime(), [allAnime, filters, sortOption, getFilteredAndSortedAnime]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAnime();
    }
  }, [userId, fetchAnime]);

  if (!isMounted || !isLoaded) return null;

  if (!userId) {
    return <LoginScreen />;
  }

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

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteConfirmId(null);
    await deleteAnime(deleteConfirmId);
    toast('Anime removed from watchlist', 'success');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnime(undefined);
    setEditingId(null);
  };

  const handleAddFromDiscover = async (anime: AnimeEntry) => {
    await addAnime(anime);
    toast(`Added ${anime.name} to your watchlist!`, 'success');
  };

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
              <div className="mb-6">
                <Filters />
              </div>

              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

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

              {!isLoading && filteredAnime.length > 0 && (
                <>
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
                              onDelete={setDeleteConfirmId}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {filteredAnime.map((anime) => (
                          <AnimeListRow 
                            key={anime.id} 
                            anime={anime} 
                            onEdit={handleEdit} 
                            onDelete={setDeleteConfirmId} 
                          />
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

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Anime"
        message="Are you sure you want to remove this anime from your watchlist? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />

      <AnimeModal isOpen={showModal} onClose={handleCloseModal} initialData={editingAnime} />
      <AnimeDetailDrawer onEdit={handleEdit} onDelete={setDeleteConfirmId} />
    </div>
  );
}
