'use client';

import { useState, useEffect, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, Image as ImageIcon, Star } from 'lucide-react';
import { AnimeEntry } from '@/types';
import { generateId, validateAnimeEntry } from '@/lib/utils';
import useAnimeStore from '@/store';
import { useToast } from '@/context/ToastContext';

interface AnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AnimeEntry;
}

const defaultForm: Partial<AnimeEntry> = {
  name: '',
  imageUrl: '',
  rating: 7,
  description: '',
  status: 'planned',
  isOngoing: false,
  latestSeason: '',
  notes: '',
  genres: [],
  episodes: undefined,
  episodesWatched: undefined,
};

type FormAction =
  | { type: 'RESET'; payload?: Partial<AnimeEntry> }
  | { type: 'UPDATE_FIELD'; field: string; value: any }
  | { type: 'ADD_GENRE'; genre: string }
  | { type: 'REMOVE_GENRE'; index: number }
  | { type: 'APPLY_JIKAN'; payload: any };

function formReducer(state: Partial<AnimeEntry>, action: FormAction): Partial<AnimeEntry> {
  switch (action.type) {
    case 'RESET':
      return { ...defaultForm, ...(action.payload || {}) };
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_GENRE':
      return {
        ...state,
        genres: [...(state.genres || []), action.genre],
      };
    case 'REMOVE_GENRE':
      return {
        ...state,
        genres: state.genres?.filter((_, i) => i !== action.index),
      };
    case 'APPLY_JIKAN': {
      const item = action.payload;
      return {
        ...state,
        name: item.title || state.name,
        imageUrl: item.imageUrl || state.imageUrl,
        description: item.synopsis || state.description,
        rating: item.score || state.rating,
        episodes: item.episodes || state.episodes,
        isOngoing: item.isOngoing ?? state.isOngoing,
        latestSeason: item.latestSeason || state.latestSeason,
        status: item.isOngoing ? 'watching' : state.status,
        genres: item.genres?.length ? item.genres : state.genres,
      };
    }
    default:
      return state;
  }
}

export function AnimeModal({ isOpen, onClose, initialData }: AnimeModalProps) {
  const [formData, dispatch] = useReducer(formReducer, defaultForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [jikanQuery, setJikanQuery] = useState('');
  const [jikanResults, setJikanResults] = useState<any[]>([]);
  const [jikanLoading, setJikanLoading] = useState(false);

  const addAnime = useAnimeStore((s) => s.addAnime);
  const updateAnime = useAnimeStore((s) => s.updateAnime);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET', payload: initialData });
    setErrors([]);
    setGenreInput('');
    setJikanQuery('');
    setJikanResults([]);
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const searchJikan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!jikanQuery.trim()) return;
    setJikanLoading(true);
    try {
      const res = await fetch(
        `/api/jikan?type=search&q=${encodeURIComponent(jikanQuery)}`
      );
      const data = await res.json();
      setJikanResults(Array.isArray(data) ? data : []);
    } catch {
      setJikanResults([]);
      toast('Failed to search MyAnimeList', 'error');
    } finally {
      setJikanLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const val = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value;
    dispatch({ type: 'UPDATE_FIELD', field: name, value: val });
  };

  const handleAddGenre = () => {
    const trimmed = genreInput.trim();
    if (trimmed && !formData.genres?.includes(trimmed)) {
      dispatch({ type: 'ADD_GENRE', genre: trimmed });
      setGenreInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAnimeEntry(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Scroll to top to show errors
      document.querySelector('.drawer-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (initialData) {
      await updateAnime(initialData.id, formData);
      toast('Anime updated successfully!', 'success');
    } else {
      const newAnime: AnimeEntry = {
        id: generateId(),
        name: formData.name || 'Unknown',
        imageUrl: formData.imageUrl || '',
        rating: formData.rating ?? 7,
        description: formData.description || '',
        status: (formData.status || 'planned') as AnimeEntry['status'],
        isOngoing: formData.isOngoing || false,
        latestSeason: formData.latestSeason,
        dateAdded: new Date().toISOString(),
        notes: formData.notes,
        genres: formData.genres,
        episodes: formData.episodes,
        episodesWatched: formData.episodesWatched,
      };
      await addAnime(newAnime);
      toast('Added to watchlist!', 'success');
    }
    onClose();
  };

  const renderStars = () => {
    const rating = formData.rating || 0;
    return (
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'rating', value: star })}
            className={`transition-all ${star <= rating ? 'text-amber-400 scale-110' : 'text-slate-600 hover:text-amber-400/50'}`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 font-bold text-amber-400 w-8 text-center">{rating}</span>
      </div>
    );
  };

  const labelClass = 'block text-[11px] font-bold text-violet-300 uppercase tracking-widest mb-2 opacity-80';
  const inputClass = 'w-full focus:ring-2 focus:ring-violet-500/20';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="drawer-overlay"
          />

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="drawer-panel flex flex-col md:w-[600px] w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#060d1f]/90 backdrop-blur-xl z-20">
              <div>
                <h2 className="text-xl font-bold gradient-text">
                  {initialData ? 'Edit Anime' : 'Add to Watchlist'}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {initialData ? 'Update your watchlist entry' : 'Search Jikan or fill manually'}
                </p>
              </div>
              <button onClick={onClose} className="btn-ghost p-2 rounded-xl bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full">
              <form onSubmit={handleSubmit} className="px-6 py-6 pb-28 space-y-8">
                {/* Errors */}
                {errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 shadow-lg shadow-red-500/5">
                    {errors.map((err, i) => (
                      <p key={i} className="text-red-400 text-sm font-medium">• {err}</p>
                    ))}
                  </div>
                )}

                {/* Jikan Search Section */}
                {!initialData && (
                  <section className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-3xl rounded-full" />
                    <label className={labelClass}>🔍 Auto-fill from MyAnimeList</label>
                    <div className="flex gap-2 relative z-10">
                      <input
                        type="text"
                        value={jikanQuery}
                        onChange={(e) => setJikanQuery(e.target.value)}
                        placeholder="Search anime name..."
                        className={`flex-1 ${inputClass}`}
                      />
                      <button
                        type="button"
                        onClick={searchJikan}
                        disabled={jikanLoading}
                        className="btn-primary px-4 py-2"
                      >
                        {jikanLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      </button>
                    </div>

                    {jikanResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mt-3 relative z-10 custom-scrollbar">
                        {jikanResults.map((item) => (
                          <button
                            key={item.mal_id}
                            type="button"
                            onClick={() => {
                              dispatch({ type: 'APPLY_JIKAN', payload: item });
                              setJikanResults([]);
                              setJikanQuery('');
                              toast(`Extracted data for ${item.title}`);
                            }}
                            className="w-full flex gap-3 bg-black/20 hover:bg-violet-600/20 border border-white/5 hover:border-violet-500/40 p-3 rounded-xl cursor-pointer transition-all text-left group"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-12 h-16 object-cover rounded-md flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-slate-100 truncate group-hover:text-violet-200 transition-colors">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-amber-400">⭐ {item.score || 'N/A'}</span>
                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white">{item.type || 'TV'}</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                {item.synopsis?.replace('[Written by MAL Rewrite]', '')}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-white/10 pb-2">Basic Info</h3>
                  
                  {/* Name and Image Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-5 items-start">
                    <div className="w-[100px] h-[140px] rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg flex-shrink-0">
                      {formData.imageUrl ? (
                         <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                           <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
                           <span className="text-[10px] uppercase font-bold tracking-wider">No Image</span>
                         </div>
                      )}
                    </div>
                    
                    <div className="space-y-4 w-full">
                      <div>
                        <label className={labelClass}>Anime Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          placeholder="What anime are you adding?"
                          className={`text-base font-medium py-3 ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Image URL</label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl || ''}
                          onChange={handleChange}
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>My Rating</label>
                      {renderStars()}
                      <input
                        type="range"
                        name="rating"
                        min="0"
                        max="10"
                        step="0.5"
                        value={formData.rating ?? 7}
                        onChange={handleChange}
                        className="w-full accent-amber-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className={labelClass}>Watch Status</label>
                      <select
                        name="status"
                        value={formData.status || 'planned'}
                        onChange={handleChange}
                        className={`text-sm py-2.5 ${inputClass}`}
                      >
                        <option value="watching">Watching</option>
                        <option value="completed">Completed</option>
                        <option value="planned">Planned</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-white/10 pb-2">Progress</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className={labelClass}>Latest Season</label>
                      <input
                        type="text"
                        name="latestSeason"
                        value={formData.latestSeason || ''}
                        onChange={handleChange}
                        placeholder="e.g. Winter 2024"
                        className={inputClass}
                      />
                    </div>
                    
                    <div>
                      <label className={labelClass}>Total Eps</label>
                      <input
                        type="number"
                        name="episodes"
                        min="0"
                        value={formData.episodes || ''}
                        onChange={handleChange}
                        placeholder="24"
                        className={inputClass}
                      />
                    </div>
                    
                    <div>
                      <label className={labelClass}>Watched</label>
                      <input
                        type="number"
                        name="episodesWatched"
                        min="0"
                        value={formData.episodesWatched || ''}
                        onChange={handleChange}
                        placeholder="0"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group bg-white/5 border border-white/10 p-4 rounded-xl w-fit">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isOngoing"
                        checked={formData.isOngoing || false}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-all duration-300 ${formData.isOngoing ? 'bg-amber-500' : 'bg-slate-700'}`} />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isOngoing ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Is this anime currently airing?</span>
                  </label>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-b border-white/10 pb-2">Details</h3>

                  <div>
                    <label className={labelClass}>Genres</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={genreInput}
                        onChange={(e) => setGenreInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGenre();
                          }
                        }}
                        placeholder="Add a genre and press enter..."
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={handleAddGenre}
                        className="btn-ghost px-4 bg-white/5 border-white/10"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {formData.genres?.map((genre, i) => (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            key={i}
                            className="flex items-center gap-1.5 text-xs bg-violet-500/20 shadow-inner border border-violet-500/30 text-violet-200 px-3 py-1.5 rounded-full font-medium"
                          >
                            {genre}
                            <button
                              type="button"
                              onClick={() => dispatch({ type: 'REMOVE_GENRE', index: i })}
                              className="text-violet-400 hover:text-white transition-colors ml-1 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Synopsis</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Brief summary..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Personal Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Your personal review, thoughts, or things to remember..."
                      className={`bg-amber-500/5 focus:bg-amber-500/10 focus:border-amber-500/50 ${inputClass}`}
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 w-full px-6 py-5 bg-[#060d1f]/95 backdrop-blur-xl border-t border-white/5 flex gap-3 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-20">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost flex-1 justify-center py-3 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit as any}
                className="btn-primary flex-1 justify-center py-3 text-sm font-bold shadow-lg shadow-violet-600/20"
              >
                {initialData ? 'Save Changes' : 'Add Anime'}
              </button>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
