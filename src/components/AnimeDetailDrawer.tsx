'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Play,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  Tv2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import useAnimeStore from '@/store';
import { AnimeEntry } from '@/types';

interface Props {
  onEdit: (anime: AnimeEntry) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  watching: { label: 'Watching', icon: <Play className="w-3.5 h-3.5" />, cls: 'badge-watching' },
  completed: { label: 'Completed', icon: <CheckCircle className="w-3.5 h-3.5" />, cls: 'badge-completed' },
  planned: { label: 'Planned', icon: <Clock className="w-3.5 h-3.5" />, cls: 'badge-planned' },
};

export function AnimeDetailDrawer({ onEdit, onDelete }: Props) {
  const anime = useAnimeStore((s) => s.selectedAnime);
  const show = useAnimeStore((s) => s.showDetailDrawer);
  const setShowDetailDrawer = useAnimeStore((s) => s.setShowDetailDrawer);
  const setSelectedAnime = useAnimeStore((s) => s.setSelectedAnime);

  const close = () => {
    setShowDetailDrawer(false);
    setTimeout(() => setSelectedAnime(null), 300);
  };

  const cfg = anime ? (statusConfig[anime.status] ?? statusConfig.planned) : null;
  const progress =
    anime?.episodes && anime?.episodesWatched
      ? (anime.episodesWatched / anime.episodes) * 100
      : 0;

  return (
    <AnimatePresence>
      {show && anime && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="drawer-overlay"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="drawer-panel"
          >
            {/* Hero Image */}
            <div className="relative h-72 overflow-hidden flex-shrink-0">
              {anime.imageUrl ? (
                <img
                  src={anime.imageUrl}
                  alt={anime.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://placehold.co/600x400/1e2238/w?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-slate-900 text-6xl">
                  🎬
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060d1f] via-[#060d1f]/40 to-transparent" />

              {/* Close */}
              <button
                onClick={close}
                className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Status + Ongoing */}
              <div className="absolute top-4 left-4 flex gap-2">
                {cfg && (
                  <span className={`${cfg.cls} flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm`}>
                    {cfg.icon} {cfg.label}
                  </span>
                )}
                {anime.isOngoing && (
                  <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                    LIVE
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5 pb-28">
              {/* Title + Rating */}
              <div>
                <h2 className="text-2xl font-bold text-slate-100 leading-tight">
                  {anime.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(anime.rating / 2)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-amber-400 font-bold">{anime.rating.toFixed(1)}/10</span>
                </div>
              </div>

              {/* Meta info pills */}
              <div className="flex flex-wrap gap-2">
                {anime.latestSeason && (
                  <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-full">
                    <Calendar className="w-3 h-3 text-violet-400" />
                    {anime.latestSeason}
                  </span>
                )}
                {anime.episodes && (
                  <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-full">
                    <Tv2 className="w-3 h-3 text-cyan-400" />
                    {anime.episodes} episodes
                  </span>
                )}
              </div>

              {/* Episode progress */}
              {anime.episodes && anime.episodes > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Progress
                    </span>
                    <span className="font-medium text-slate-200">
                      {anime.episodesWatched || 0} / {anime.episodes}
                      <span className="text-slate-500 ml-1">({Math.round(progress)}%)</span>
                    </span>
                  </div>
                  <div className="progress-bar h-2">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((g) => (
                      <span
                        key={g}
                        className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1 rounded-full"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {anime.description && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Synopsis</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{anime.description}</p>
                </div>
              )}

              {/* Notes */}
              {anime.notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">My Notes</p>
                  <p className="text-sm text-slate-400 leading-relaxed italic bg-white/3 border border-white/5 rounded-xl p-3">
                    "{anime.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Sticky footer actions */}
            <div className="fixed bottom-0 right-0 w-[min(480px,95vw)] px-6 py-4 bg-[#060d1f]/95 backdrop-blur-lg border-t border-white/5 flex gap-3">
              <button
                onClick={() => {
                  close();
                  onEdit(anime);
                }}
                className="btn-ghost flex-1 justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => {
                  close();
                  onDelete(anime.id);
                }}
                className="btn-danger flex-1 justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
