'use client';
import { LogOut, User } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import useAnimeStore from '@/store';

export function UserBadge() {
  const { userId, logout } = useUser();
  const { toast } = useToast();

  const handleLogout = () => {
    useAnimeStore.getState().setAnime([]);
    logout();
    toast('Logged out successfully', 'info');
  };

  if (!userId) return null;

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
        <User className="w-3.5 h-3.5 text-violet-400" />
        <span className="max-w-[100px] truncate">{userId}</span>
      </div>
      <div className="w-px h-4 bg-white/20" />
      <button
        onClick={handleLogout}
        className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
        title="Switch Vault"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
