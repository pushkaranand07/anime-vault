'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, History, RefreshCw } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { getRecentUsers } from '@/lib/userSession';
import useAnimeStore from '@/store';

export function LoginScreen() {
  const [input, setInput] = useState('');
  const { login } = useUser();
  const recents = getRecentUsers();
  
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    
    // clear store state before logging in
    useAnimeStore.getState().setAnime([]);
    login(input.trim());
  };

  const handleGenerate = () => {
    const id = crypto.randomUUID().split('-')[0];
    setInput(`user-${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 to-cyan-500" />
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4 float-animation">
            <span className="text-3xl">🎌</span>
          </div>
          <h1 className="text-3xl font-black gradient-text">AniVault</h1>
          <p className="text-slate-400 mt-2 text-sm">Enter your unique Vault ID to access your personal collection. No password required.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vault ID</label>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. shadow-monarch-99"
              className="w-full text-lg py-3 px-4 bg-black/20 border border-white/10 rounded-xl focus:border-violet-500 transition-colors"
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="w-full btn-primary py-3 justify-center text-lg shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Enter Vault
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center">
          <button 
            onClick={handleGenerate}
            type="button"
            className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Generate random ID
          </button>
        </div>

        {recents.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1.5">
              <History className="w-3 h-3" /> Recent Vaults
            </p>
            <div className="flex flex-wrap gap-2">
              {recents.map(id => (
                <button
                  key={id}
                  onClick={() => { setInput(id); handleLogin(); }}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm border border-white/5 hover:border-violet-500/30 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-3.5 h-3.5 text-violet-400" />
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
