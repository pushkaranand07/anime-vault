'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, ChevronDown, Filter as FilterIcon } from 'lucide-react';
import useAnimeStore from '@/store';
import { FilterOptions } from '@/types';

const STATUS_OPTIONS = [
  { value: undefined, label: 'All' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'planned', label: 'Planned' },
] as const;

const SORT_OPTIONS = [
  { field: 'dateAdded', label: 'Date Added' },
  { field: 'rating', label: 'Rating' },
  { field: 'name', label: 'Name' },
] as const;

export function Filters() {
  const anime = useAnimeStore((s) => s.anime);
  const filters = useAnimeStore((s) => s.filters);
  const setFilters = useAnimeStore((s) => s.setFilters);
  const sortOption = useAnimeStore((s) => s.sortOption);
  const setSortOption = useAnimeStore((s) => s.setSortOption);

  const [localSearch, setLocalSearch] = useState(filters.searchQuery || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const counts = useMemo(() => ({
    all: anime.length,
    watching: anime.filter((a) => a.status === 'watching').length,
    completed: anime.filter((a) => a.status === 'completed').length,
    planned: anime.filter((a) => a.status === 'planned').length,
  }), [anime]);

  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    anime.forEach(a => a.genres?.forEach(g => genres.add(g)));
    return Array.from(genres).sort();
  }, [anime]);

  const handleSearch = useCallback((val: string) => {
    setLocalSearch(val);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.searchQuery !== localSearch) {
        setFilters({ ...filters, searchQuery: localSearch });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, filters, setFilters]);

  const handleStatus = useCallback((status: FilterOptions['status']) => {
    if (status === undefined) {
      setFilters({ ...filters, status: undefined });
    } else {
      setFilters({ ...filters, status });
    }
  }, [filters, setFilters]);

  const toggleGenre = (genre: string) => {
    const current = filters.genres || [];
    if (current.includes(genre)) {
      setFilters({ ...filters, genres: current.filter(g => g !== genre) });
    } else {
      setFilters({ ...filters, genres: [...current, genre] });
    }
  };

  const clearAll = useCallback(() => {
    setLocalSearch('');
    setFilters({});
  }, [setFilters]);

  const hasActive = !!(filters.status || filters.searchQuery || filters.rating || (filters.genres && filters.genres.length > 0));

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="glass rounded-2xl p-1.5 flex flex-wrap sm:flex-nowrap items-center gap-1">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = opt.value === undefined ? !filters.status : filters.status === opt.value;
          const count = opt.value === undefined ? counts.all : counts[opt.value as keyof typeof counts];

          return (
            <button
              key={String(opt.value)}
              onClick={() => handleStatus(opt.value)}
              className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {opt.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Sort row */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search anime, genres..."
            className="w-full pl-9 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-violet-500 transition-colors placeholder:text-slate-500 outline-none"
          />
          {localSearch && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={`${sortOption.field}:${sortOption.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split(':') as [any, any];
              setSortOption({ field, direction });
            }}
            className="text-sm pr-8 pl-3 py-2.5 bg-white/5 border border-white/10 rounded-xl appearance-none cursor-pointer outline-none focus:border-violet-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <optgroup label={opt.label} key={opt.field}>
                <option value={`${opt.field}:desc`}>{opt.label} (Desc)</option>
                <option value={`${opt.field}:asc`}>{opt.label} (Asc)</option>
              </optgroup>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        <button 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          className={`shrink-0 btn-ghost px-3 py-2 text-sm gap-1.5 ${showAdvanced || filters.rating || (filters.genres?.length || 0) > 0 ? 'bg-violet-600/20 text-violet-300 border-violet-500/30' : ''}`}
        >
          <FilterIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Advanced</span>
        </button>

        {/* Clear */}
        {hasActive && (
          <button onClick={clearAll} className="shrink-0 btn-ghost px-3 py-2 text-sm gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20">
            <X className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="glass-card p-4 rounded-xl space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Minimum Rating</label>
              <span className="text-amber-400 font-bold text-sm">{filters.rating || 'Any'} / 10</span>
            </div>
            <input 
              type="range" 
              min="0" max="10" step="0.5" 
              value={filters.rating || 0} 
              onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) || undefined })}
              className="w-full accent-amber-500 bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
            />
          </div>

          {uniqueGenres.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Filter by Genre</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {uniqueGenres.map(g => {
                  const selected = filters.genres?.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        selected 
                        ? 'bg-violet-600 border-violet-500 text-white shadow-sm' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
