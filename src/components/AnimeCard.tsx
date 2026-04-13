'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { AnimeEntry } from '@/types';
import { Star, Trash2, Edit2, Play, CheckCircle, Clock } from 'lucide-react';
import useAnimeStore from '@/store';

interface AnimeCardProps {
  anime: AnimeEntry;
  onEdit: (anime: AnimeEntry) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  watching: {
    label: 'Watching',
    icon: <Play className="w-3 h-3" />,
    badgeClass: 'badge-watching',
    gradientFrom: '#06b6d4',
    gradientTo: '#0891b2',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="w-3 h-3" />,
    badgeClass: 'badge-completed',
    gradientFrom: '#10b981',
    gradientTo: '#059669',
  },
  planned: {
    label: 'Planned',
    icon: <Clock className="w-3 h-3" />,
    badgeClass: 'badge-planned',
    gradientFrom: '#7c3aed',
    gradientTo: '#5b21b6',
  },
};

const AnimeCardComponent = ({ anime, onEdit, onDelete }: AnimeCardProps) => {
  const setSelectedAnime = useAnimeStore((s) => s.setSelectedAnime);
  const setShowDetailDrawer = useAnimeStore((s) => s.setShowDetailDrawer);
  const cfg = statusConfig[anime.status] || statusConfig.planned;
  const progress =
    anime.episodes && anime.episodesWatched
      ? (anime.episodesWatched / anime.episodes) * 100
      : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open drawer when clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;
    setSelectedAnime(anime);
    setShowDetailDrawer(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card-3d group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex-shrink-0 flex items-center justify-center">
          {anime.imageUrl ? (
            <img
              src={anime.imageUrl}
              alt={anime.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          {!anime.imageUrl ? (
            <div
              className="w-full h-full flex items-center justify-center text-6xl"
              style={{
                background: `linear-gradient(135deg, ${cfg.gradientFrom}22, ${cfg.gradientTo}44)`,
              }}
            >
              🎬
            </div>
          ) : null}

          {/* Dark overlay on hover for action buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Status Badge - positioned to avoid overlaps */}
          <div
            className={`absolute top-3 right-3 ${cfg.badgeClass} px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm z-10`}
          >
            {cfg.icon}
            <span className="hidden sm:inline">{cfg.label}</span>
          </div>

          {/* Ongoing Badge */}
          {anime.isOngoing && (
            <div className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm z-10">
              LIVE
            </div>
          )}

          {/* Action buttons that appear on hover */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(anime);
              }}
              title="Edit"
              className="w-8 h-8 bg-white/10 hover:bg-blue-500/70 border border-white/20 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <Edit2 className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(anime.id);
              }}
              title="Delete"
              className="w-8 h-8 bg-white/10 hover:bg-red-500/70 border border-white/20 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-2 min-h-[200px]">
          {/* Title - with proper truncation */}
          <h3 className="font-bold text-sm leading-snug text-slate-100 line-clamp-2 group-hover:text-violet-300 transition-colors duration-200 min-h-10">
            {anime.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(anime.rating / 2)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-amber-400">
              {anime.rating.toFixed(1)}
            </span>
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {anime.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {genre}
                </span>
              ))}
              {anime.genres.length > 2 && (
                <span className="text-xs text-slate-500">
                  +{anime.genres.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Episode progress */}
          {anime.episodes && anime.episodes > 0 && (
            <div className="mt-auto pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="truncate">{anime.episodesWatched || 0} / {anime.episodes} eps</span>
                <span className="flex-shrink-0 ml-2">{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const AnimeCard = memo(AnimeCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.anime.id === nextProps.anime.id &&
    prevProps.anime.imageUrl === nextProps.anime.imageUrl &&
    prevProps.anime.name === nextProps.anime.name &&
    prevProps.anime.rating === nextProps.anime.rating &&
    prevProps.anime.status === nextProps.anime.status &&
    prevProps.anime.isOngoing === nextProps.anime.isOngoing &&
    prevProps.anime.episodesWatched === nextProps.anime.episodesWatched &&
    prevProps.anime.episodes === nextProps.anime.episodes
  );
});
