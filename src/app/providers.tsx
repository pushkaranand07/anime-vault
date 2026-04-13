'use client';

import { useEffect, ReactNode } from 'react';
import useAnimeStore from '@/store';

export function Providers({ children }: { children: ReactNode }) {
  const fetchAnime = useAnimeStore((state) => state.fetchAnime);
  const isDarkMode = useAnimeStore((state) => state.isDarkMode);
  const setDarkMode = useAnimeStore((state) => state.setDarkMode);

  useEffect(() => {
    // Check initial dark mode from localStorage
    const dm = localStorage.getItem('animeTrackerDarkMode');
    if (dm === 'true') {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  useEffect(() => {
    // Fetch data from API on mount
    fetchAnime();
  }, [fetchAnime]);

  useEffect(() => {
    // Update dark mode on document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
