'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { AnimeEntry } from '@/types';
import useAnimeStore from '@/store';

interface AnimeListRowProps {
  anime: AnimeEntry;
  onEdit: (anime: AnimeEntry) => void;
  onDelete: (id: string) => void;
}

const AnimeListRowComponent = ({ anime, onEdit, onDelete }: AnimeListRowProps) => {
  const setSelectedAnime = useAnimeStore((s) => s.setSelectedAnime);
  const setShowDetailDrawer = useAnimeStore((s) => s.setShowDetailDrawer);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
      onClick={() => {
        setSelectedAnime(anime);
        setShowDetailDrawer(true);
      }}
    >
      {/* Poster */}
      <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 relative">
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
          onClick={(e) => { e.stopPropagation(); onEdit(anime); }}
          className="btn-ghost p-2 rounded-xl"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(anime.id); }}
          className="btn-danger p-2 rounded-xl"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </motion.div>
  );
};

export const AnimeListRow = memo(AnimeListRowComponent, (prevProps, nextProps) => {
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
