'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { AnimeEntry } from '@/types';
import { generateId, validateAnimeEntry } from '@/lib/utils';
import useAnimeStore from '@/store';

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

export function AnimeModal({ isOpen, onClose, initialData }: AnimeModalProps) {
  const [formData, setFormData] = useState<Partial<AnimeEntry>>(defaultForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [jikanQuery, setJikanQuery] = useState('');
  const [jikanResults, setJikanResults] = useState<any[]>([]);
  const [jikanLoading, setJikanLoading] = useState(false);

  const addAnime = useAnimeStore((s) => s.addAnime);
  const updateAnime = useAnimeStore((s) => s.updateAnime);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ?? defaultForm);
      setErrors([]);
      setGenreInput('');
      setJikanQuery('');
      setJikanResults([]);
    }
  }, [isOpen, initialData]);

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
    } finally {
      setJikanLoading(false);
    }
  };

  const handleJikanSelect = (item: any) => {
    setFormData((prev) => ({
      ...prev,
      name: item.title || prev.name,
      imageUrl: item.imageUrl || prev.imageUrl,
      description: item.synopsis || prev.description,
      rating: item.score || prev.rating,
      episodes: item.episodes || prev.episodes,
      isOngoing: item.isOngoing,
      latestSeason: item.latestSeason || prev.latestSeason,
      status: item.isOngoing ? 'watching' : prev.status,
      genres: item.genres?.length ? item.genres : prev.genres,
    }));
    setJikanResults([]);
    setJikanQuery('');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleAddGenre = () => {
    const trimmed = genreInput.trim();
    if (trimmed && !formData.genres?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        genres: [...(prev.genres || []), trimmed],
      }));
      setGenreInput('');
    }
  };

  const handleRemoveGenre = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAnimeEntry(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (initialData) {
      await updateAnime(initialData.id, formData);
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
    }
    onClose();
  };

  const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5';
  const inputClass = 'w-full';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="drawer-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#060d1f]/90 backdrop-blur-lg z-10">
              <div>
                <h2 className="text-xl font-bold gradient-text">
                  {initialData ? 'Edit Anime' : 'Add to Watchlist'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {initialData ? 'Update details' : 'Search or fill in manually'}
                </p>
              </div>
              <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 pb-24">
              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  {errors.map((err, i) => (
                    <p key={i} className="text-red-400 text-sm">• {err}</p>
                  ))}
                </div>
              )}

              {/* Jikan Auto-Fill */}
              {!initialData && (
                <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                    🔍 Auto-fill from MyAnimeList
                  </p>
                  <form onSubmit={searchJikan} className="flex gap-2">
                    <input
                      type="text"
                      value={jikanQuery}
                      onChange={(e) => setJikanQuery(e.target.value)}
                      placeholder="Search anime name..."
                      className="flex-1 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={jikanLoading}
                      className="btn-primary px-3 py-2"
                    >
                      {jikanLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </button>
                  </form>

                  {/* Results */}
                  {jikanResults.length > 0 && (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {jikanResults.map((item) => (
                        <button
                          key={item.mal_id}
                          type="button"
                          onClick={() => handleJikanSelect(item)}
                          className="w-full flex gap-3 bg-white/3 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/30 p-2.5 rounded-xl cursor-pointer transition-all text-left"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-100 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-amber-400">
                              ⭐ {item.score || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {item.synopsis?.slice(0, 80)}…
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="flex gap-4 items-start bg-white/3 rounded-xl p-3 border border-white/5">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-medium mb-1">Image Preview</p>
                    <label className={labelClass}>Image URL</label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl || ''}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              {!formData.imageUrl && (
                <div>
                  <label className={labelClass}>
                    <ImageIcon className="w-3 h-3 inline mr-1" />
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
              )}

              {/* Name */}
              <div>
                <label className={labelClass}>Anime Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="e.g., Attack on Titan"
                  className={inputClass}
                />
              </div>

              {/* Rating + Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Rating (0–10)</label>
                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="10"
                    step="0.5"
                    value={formData.rating ?? 7}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    name="status"
                    value={formData.status || 'planned'}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>

              {/* Episodes row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Total Episodes</label>
                  <input
                    type="number"
                    name="episodes"
                    min="0"
                    value={formData.episodes || ''}
                    onChange={handleChange}
                    placeholder="e.g., 24"
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

              {/* Latest Season + Ongoing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Latest Season</label>
                  <input
                    type="text"
                    name="latestSeason"
                    value={formData.latestSeason || ''}
                    onChange={handleChange}
                    placeholder="e.g., Winter 2024"
                    className={inputClass}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isOngoing"
                        checked={formData.isOngoing || false}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-5 rounded-full transition-all ${
                          formData.isOngoing
                            ? 'bg-violet-600'
                            : 'bg-slate-700'
                        }`}
                      />
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          formData.isOngoing ? 'left-5' : 'left-0.5'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-slate-300">Ongoing</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the anime..."
                  className={inputClass}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>Personal Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Your thoughts..."
                  className={inputClass}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Genres */}
              <div>
                <label className={labelClass}>Genres</label>
                <div className="flex gap-2 mb-2.5">
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
                    placeholder="Add genre and press Enter..."
                    className="flex-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddGenre}
                    className="btn-primary px-3"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.genres?.map((genre, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 text-xs bg-violet-500/15 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-full"
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => handleRemoveGenre(i)}
                        className="text-violet-400 hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer – sticky */}
            <div className="fixed bottom-0 right-0 w-[min(480px,95vw)] px-6 py-4 bg-[#060d1f]/95 backdrop-blur-lg border-t border-white/5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit as any}
                className="btn-primary flex-1 justify-center"
              >
                {initialData ? '✓ Update' : '+ Add'} Anime
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
