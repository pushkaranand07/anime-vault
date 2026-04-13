'use client';

import { motion } from 'framer-motion';
import {
  Plus,
  Download,
  Upload,
  Grid3x3,
  List,
  Sparkles,
  Loader2,
  BookOpen,
  Compass,
  BarChart3,
} from 'lucide-react';
import useAnimeStore from '@/store';
import { parseXlsxFile, exportAsXlsx } from '@/lib/utils';
import { useRef } from 'react';
import { UserBadge } from './UserBadge';
import { useToast } from '@/context/ToastContext';

interface HeaderProps {
  onAddClick: () => void;
}

const TABS = [
  { id: 'watchlist', label: 'Watchlist', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'discover', label: 'Discover', icon: <Compass className="w-4 h-4" /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
] as const;

export function Header({ onAddClick }: HeaderProps) {
  const viewMode = useAnimeStore((s) => s.viewMode);
  const setViewMode = useAnimeStore((s) => s.setViewMode);
  const setAnime = useAnimeStore((s) => s.setAnime);
  const anime = useAnimeStore((s) => s.anime);
  const isEnriching = useAnimeStore((s) => s.isEnriching);
  const enrichMissingImages = useAnimeStore((s) => s.enrichMissingImages);
  const activeTab = useAnimeStore((s) => s.activeTab);
  const setActiveTab = useAnimeStore((s) => s.setActiveTab);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseXlsxFile(file);
      setAnime([...anime, ...imported]);
      toast(`Imported ${imported.length} anime entries!`, 'success');
    } catch {
      toast('Failed to import. Check the file format.', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    if (anime.length === 0) return toast('Nothing to export!', 'error');
    exportAsXlsx(anime);
    toast('Watchlist exported successfully!', 'success');
  };

  const handleEnrich = async () => {
    const missing = anime.filter((a) => !a.imageUrl);
    if (missing.length === 0) return toast('All anime already have images!', 'info');
    const r = await enrichMissingImages();
    if (r.failed.length > 0) {
      toast(`Fetched ${r.enriched} images. Failed: ${r.failed.length}`, 'error');
    } else {
      toast(`Fetched ${r.enriched} images successfully!`, 'success');
    }
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-lg">🎌</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black gradient-text leading-none">AniVault</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                Anime Tracker
              </p>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-white/3 border border-white/5 rounded-xl p-1 hidden sm:flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <UserBadge />
            {/* Auto-fetch images */}
            <button
              onClick={handleEnrich}
              disabled={isEnriching}
              title="Auto-fetch missing poster images"
              className="btn-ghost px-3 py-2 hidden lg:flex items-center gap-1.5 text-xs"
            >
              {isEnriching ? (
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-violet-400" />
              )}
              <span>{isEnriching ? 'Fetching…' : 'Auto Images'}</span>
            </button>

            {/* View toggle — only on watchlist tab */}
            {activeTab === 'watchlist' && (
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                title="Toggle view"
                className="btn-ghost p-2"
              >
                {viewMode === 'grid' ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid3x3 className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import XLSX"
              className="btn-ghost p-2 hidden sm:flex"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />

            {/* Export */}
            <button onClick={handleExport} title="Export XLSX" className="btn-ghost p-2 hidden sm:flex">
              <Download className="w-4 h-4" />
            </button>

            {/* Add button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onAddClick}
              className="btn-primary gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Anime</span>
            </motion.button>

            {/* Mobile Tab Nav button if needed, omit for brevity, user can switch on larger screen or we can show icons */}
          </div>
        </div>
      </div>
    </header>
  );
}
