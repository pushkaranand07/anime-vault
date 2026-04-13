'use client';

import { useEffect, ReactNode } from 'react';
import useAnimeStore from '@/store';
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';

export function Providers({ children }: { children: ReactNode }) {
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
    // Update dark mode on document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ToastProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </ToastProvider>
  );
}
