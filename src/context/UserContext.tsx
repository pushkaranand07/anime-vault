'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUserId, setUserId as saveUserId, clearUserId } from '@/lib/userSession';

interface UserContextType {
  userId: string | null;
  login: (id: string) => void;
  logout: () => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const id = getUserId();
    if (id) setUserId(id);
    setIsLoaded(true);
  }, []);

  const login = (id: string) => {
    saveUserId(id);
    setUserId(id);
  };

  const logout = () => {
    clearUserId();
    setUserId(null);
  };

  return (
    <UserContext.Provider value={{ userId, login, logout, isLoaded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
