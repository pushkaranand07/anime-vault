'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp, Eye, CheckCircle, Clock, Award, BarChart3 } from 'lucide-react';
import useAnimeStore from '@/store';


function StatCard({
  label,
  value,
  sub,
  icon,
  colorClass,
  delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  colorClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-100 mb-0.5">{value}</p>
      <p className="text-sm font-medium text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export function StatsTab() {
  const anime = useAnimeStore((s) => s.anime);

  const total = anime.length;
  const completed = anime.filter((a) => a.status === 'completed').length;
  const watching = anime.filter((a) => a.status === 'watching').length;
  const planned = anime.filter((a) => a.status === 'planned').length;
  const ongoing = anime.filter((a) => a.isOngoing).length;

  const avgRating =
    total > 0
      ? (anime.reduce((s, a) => s + a.rating, 0) / total).toFixed(1)
      : '—';

  const topRated = [...anime]
    .filter((a) => a.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Genre frequency
  const genreMap: Record<string, number> = {};
  anime.forEach((a) => {
    a.genres?.forEach((g) => {
      genreMap[g] = (genreMap[g] || 0) + 1;
    });
  });
  const topGenres = Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxGenreCount = topGenres[0]?.[1] || 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold gradient-text">Statistics</h2>
        <p className="text-sm text-slate-500 mt-1">Your personal anime consumption overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Anime"
          value={total}
          icon={<BarChart3 className="w-5 h-5 text-violet-400" />}
          colorClass="bg-violet-500/15"
          delay={0}
        />
        <StatCard
          label="Watching"
          value={watching}
          icon={<Eye className="w-5 h-5 text-cyan-400" />}
          colorClass="bg-cyan-500/15"
          delay={0.05}
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={<CheckCircle className="w-5 h-5 text-green-400" />}
          colorClass="bg-green-500/15"
          delay={0.1}
        />
        <StatCard
          label="Planned"
          value={planned}
          icon={<Clock className="w-5 h-5 text-purple-400" />}
          colorClass="bg-purple-500/15"
          delay={0.15}
        />
        <StatCard
          label="Ongoing"
          value={ongoing}
          sub="Currently airing"
          icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
          colorClass="bg-amber-500/15"
          delay={0.2}
        />
        <StatCard
          label="Avg Rating"
          value={avgRating}
          sub="out of 10"
          icon={<Star className="w-5 h-5 text-yellow-400" />}
          colorClass="bg-yellow-500/15"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-200">Top Rated</h3>
          </div>
          <div className="space-y-3">
            {topRated.length === 0 ? (
              <p className="text-sm text-slate-500">No anime yet</p>
            ) : (
              topRated.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0
                        ? 'bg-amber-500/20 text-amber-400'
                        : i === 1
                        ? 'bg-slate-500/20 text-slate-400'
                        : i === 2
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  {a.imageUrl && (
                    <img
                      src={a.imageUrl}
                      alt={a.name}
                      className="w-9 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{a.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, si) => (
                        <Star
                          key={si}
                          className={`w-2.5 h-2.5 ${
                            si < Math.round(a.rating / 2)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-amber-400 font-semibold ml-0.5">
                        {a.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Genre distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-slate-200">Genre Mix</h3>
          </div>
          {topGenres.length === 0 ? (
            <p className="text-sm text-slate-500">No genre data yet</p>
          ) : (
            <div className="space-y-3">
              {topGenres.map(([genre, count]) => (
                <div key={genre}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{genre}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="progress-bar h-2">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxGenreCount) * 100}%` }}
                      transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Status breakdown */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="font-bold text-slate-200 mb-4">Status Breakdown</h3>
          <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
            {completed > 0 && (
              <div
                title={`Completed: ${completed}`}
                className="bg-emerald-500 transition-all"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            )}
            {watching > 0 && (
              <div
                title={`Watching: ${watching}`}
                className="bg-cyan-500 transition-all"
                style={{ width: `${(watching / total) * 100}%` }}
              />
            )}
            {planned > 0 && (
              <div
                title={`Planned: ${planned}`}
                className="bg-violet-600 transition-all"
                style={{ width: `${(planned / total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Completed ({Math.round((completed / total) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              Watching ({Math.round((watching / total) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
              Planned ({Math.round((planned / total) * 100)}%)
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
