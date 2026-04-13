// Subtitle settings component

'use client';

import React, { useState } from 'react';
import { SubtitleSettings } from '@/types';
import { motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';

interface SubtitleSettingsComponentProps {
  initialSettings: SubtitleSettings;
  onSave: (settings: SubtitleSettings) => void;
}

export const SubtitleSettingsComponent: React.FC<SubtitleSettingsComponentProps> = ({
  initialSettings,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SubtitleSettings>(initialSettings);

  const handleSave = () => {
    onSave(settings);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSettings(initialSettings);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition"
      >
        <Settings size={18} />
        <span className="text-sm font-medium">Subtitle Settings</span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gray-900 rounded-lg max-w-sm w-full border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Subtitle Settings</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {/* Enable/Disable Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) =>
                  setSettings({ ...settings, enabled: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-white font-medium">Enable Subtitles</span>
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* Font Size */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Font Size: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={settings.fontSize}
                  onChange={(e) =>
                    setSettings({ ...settings, fontSize: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Size Presets */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Size Preset
                </label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        const sizeMap = { small: 14, medium: 18, large: 24 };
                        setSettings({
                          ...settings,
                          size: preset,
                          fontSize: sizeMap[preset],
                        });
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        settings.size === preset
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.color}
                    onChange={(e) =>
                      setSettings({ ...settings, color: e.target.value })
                    }
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-gray-400 text-sm">{settings.color}</span>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) =>
                      setSettings({ ...settings, backgroundColor: e.target.value })
                    }
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-gray-400 text-sm">
                    {settings.backgroundColor}
                  </span>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Background Opacity: {Math.round(settings.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.opacity}
                  onChange={(e) =>
                    setSettings({ ...settings, opacity: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) =>
                    setSettings({ ...settings, fontFamily: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  <option>Arial</option>
                  <option>Helvetica</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                  <option>Verdana</option>
                  <option>Georgia</option>
                </select>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        setSettings({ ...settings, textAlign: align })
                      }
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        settings.textAlign === align
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-xs mb-2">Preview</p>
                <div
                  style={{
                    color: settings.color,
                    backgroundColor: settings.backgroundColor,
                    opacity: settings.opacity,
                    fontFamily: settings.fontFamily,
                    fontSize: `${settings.fontSize * 0.5}px`,
                    textAlign: settings.textAlign,
                    padding: '8px',
                    borderRadius: '4px',
                  }}
                >
                  Sample Subtitle Text
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-gray-700">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SubtitleSettingsComponent;
