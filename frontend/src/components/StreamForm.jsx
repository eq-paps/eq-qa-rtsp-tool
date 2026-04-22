import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlay } from 'react-icons/fa';

export default function StreamForm({ video, apiUrl, onClose, onCreated }) {
  const [name, setName] = useState(`${video.originalName} Stream`);
  const [fpsMode, setFpsMode] = useState('native');
  const [customFps, setCustomFps] = useState(10);
  const [loop, setLoop] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch(`${apiUrl}/streams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sourceVideoId: video.id,
          fpsMode,
          customFps: fpsMode === 'custom' ? customFps : undefined,
          loop,
        }),
      });
      onCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create stream:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="liquid-glass w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Create Stream</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Stream Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-400/50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Frame Rate</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFpsMode('native')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  fpsMode === 'native'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                Native ({video.nativeFps} FPS)
              </button>
              <button
                type="button"
                onClick={() => setFpsMode('custom')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  fpsMode === 'custom'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          <AnimatePresence>
            {fpsMode === 'custom' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <label className="block text-sm text-slate-400 mb-1.5">Custom FPS (1-60)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customFps}
                  onChange={(e) => setCustomFps(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-400/50 transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLoop(!loop)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                loop ? 'bg-blue-500/40' : 'bg-white/10'
              }`}
            >
              <motion.div
                animate={{ x: loop ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
              />
            </button>
            <span className="text-sm">Loop stream</span>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 rounded-xl text-blue-300 font-medium transition-colors"
          >
            <FaPlay className="text-xs" />
            {submitting ? 'Creating...' : 'Create Stream'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
