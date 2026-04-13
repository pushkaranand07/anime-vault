// Episode selector component with format indicators

'use client';

import React, { useState } from 'react';
import { Episode } from '@/types';
import { motion } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';

interface EpisodeSelectorProps {
  episodes: Episode[];
  currentEpisode: Episode;
  onEpisodeSelect: (episode: Episode) => void;
  userDefaultFormat?: 'subbed' | 'dubbed';
}

export const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({
  episodes,
  currentEpisode,
  onEpisodeSelect,
  userDefaultFormat = 'subbed',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFormatBadges = (episode: Episode) => {
    const badges = [];

    if (episode.formats.subbed?.available) {
      badges.push({
        label: 'Sub',
        type: 'sub' as const,
        color: 'bg-blue-600',
      });
    }

    if (episode.formats.dubbed && episode.formats.dubbed.length > 0) {
      const languages = episode.formats.dubbed
        .filter((d) => d.available)
        .map((d) => d.language.substring(0, 2).toUpperCase())
        .join('/');

      badges.push({
        label: `Dub (${languages})`,
        type: 'dub' as const,
        color: 'bg-purple-600',
      });
    }

    return badges;
  };

  const getRecommendedFormat = (episode: Episode) => {
    if (userDefaultFormat === 'subbed' && episode.formats.subbed?.available) {
      return 'sub';
    }
    if (
      userDefaultFormat === 'dubbed' &&
      episode.formats.dubbed &&
      episode.formats.dubbed.length > 0
    ) {
      return 'dub';
    }
    // Fallback to subbed if available
    if (episode.formats.subbed?.available) {
      return 'sub';
    }
    // Then to dubbed
    if (episode.formats.dubbed && episode.formats.dubbed.length > 0) {
      return 'dub';
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Current Episode Display */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">Now Playing</p>
            <h3 className="text-white text-lg font-bold">
              Episode {currentEpisode.episodeNumber}: {currentEpisode.title}
            </h3>
            <p className="text-gray-400 text-sm mt-2 line-clamp-2">
              {currentEpisode.description}
            </p>
          </div>
          <div className="ml-4 flex gap-2 flex-shrink-0">
            {getFormatBadges(currentEpisode).map((badge) => (
              <span
                key={badge.type}
                className={`${badge.color} text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Episode List Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition mb-2"
      >
        <span className="font-semibold">
          {episodes.length} Episodes
        </span>
        <ChevronDown
          size={20}
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Episode List */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2 mb-4 max-h-96 overflow-y-auto bg-gray-900 rounded-lg p-3 border border-gray-700"
        >
          {episodes.map((episode) => {
            const isSelected = episode._id === currentEpisode._id;
            const badges = getFormatBadges(episode);
            const recommended = getRecommendedFormat(episode);

            return (
              <motion.button
                key={episode._id}
                onClick={() => {
                  onEpisodeSelect(episode);
                  setIsExpanded(false);
                }}
                whileHover={{ x: 4 }}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">
                      Ep {episode.episodeNumber}: {episode.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {episode.description}
                    </p>
                  </div>

                  {/* Format Indicators */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {recommended && (
                      <Zap
                        size={14}
                        className="text-yellow-400"
                        title="Recommended format available"
                      />
                    )}
                    {badges.slice(0, 2).map((badge) => (
                      <span
                        key={badge.type}
                        className={`${badge.color} text-white text-xs font-semibold px-1.5 py-0.5 rounded`}
                        title={badge.label}
                      >
                        {badge.type === 'sub' ? '字' : '🎤'}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default EpisodeSelector;
