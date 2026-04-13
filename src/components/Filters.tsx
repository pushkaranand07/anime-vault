'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
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

  const counts = useMemo(() => ({
    all: anime.length,
    watching: anime.filter((a) => a.status === 'watching').length,
    completed: anime.filter((a) => a.status === 'completed').length,
    planned: anime.filter((a) => a.status === 'planned').length,
  }), [anime]);

  // handleSearch replacement
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
    // When clicking "All", clear the status filter entirely
    if (status === undefined) {
      setFilters({ ...filters, status: undefined });
    } else {
      setFilters({ ...filters, status });
    }
  }, [filters, setFilters]);

  const clearAll = useCallback(() => {
    setLocalSearch('');
    setFilters({});
  }, [setFilters]);

  const hasActive = !!(filters.status || filters.searchQuery || filters.rating);

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="glass rounded-2xl p-1.5 flex items-center gap-1">
        {STATUS_OPTIONS.map((opt) => {
          const isActive =
            opt.value === undefined ? !filters.status : filters.status === opt.value;
          const count =
            opt.value === undefined
              ? counts.all
              : counts[opt.value as keyof typeof counts];

          return (
            <button
              key={String(opt.value)}
              onClick={() => handleStatus(opt.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {opt.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Sort row */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search anime, genres..."
            className="pl-9 pr-9 text-sm"
          />
          {localSearch && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={`${sortOption.field}:${sortOption.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split(':') as [any, any];
              setSortOption({ field, direction });
            }}
            className="text-sm pr-8 pl-3 py-2 appearance-none cursor-pointer min-w-[130px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <>
                <option key={`${opt.field}:desc`} value={`${opt.field}:desc`}>
                  {opt.label} ↓
                </option>
                <option key={`${opt.field}:asc`} value={`${opt.field}:asc`}>
                  {opt.label} ↑
                </option>
              </>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Clear */}
        {hasActive && (
          <button onClick={clearAll} className="btn-ghost px-3 py-2 text-sm gap-1.5">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
