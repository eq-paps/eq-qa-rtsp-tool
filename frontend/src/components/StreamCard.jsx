import React from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaStop, FaTrash, FaCopy, FaBroadcastTower } from 'react-icons/fa';
import StatusPill from './StatusPill';
import CopyButton from './CopyButton';

export default function StreamCard({ stream, video, apiUrl, onUpdate }) {
  const handleStart = async () => {
    await fetch(`${apiUrl}/streams/${stream.id}/start`, { method: 'POST' });
    onUpdate();
  };

  const handleStop = async () => {
    await fetch(`${apiUrl}/streams/${stream.id}/stop`, { method: 'POST' });
    onUpdate();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this stream?')) return;
    await fetch(`${apiUrl}/streams/${stream.id}`, { method: 'DELETE' });
    onUpdate();
  };

  return (
    <div className="liquid-glass p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            stream.status === 'running'
              ? 'bg-green-500/20'
              : 'bg-slate-500/20'
          }`}>
            <FaBroadcastTower className={
              stream.status === 'running' ? 'text-green-400' : 'text-slate-400'
            } />
          </div>
          <div>
            <h3 className="font-medium">{stream.name}</h3>
            <p className="text-xs text-slate-400">
              {video?.originalName || 'Unknown video'}
            </p>
          </div>
        </div>
        <StatusPill status={stream.status} />
      </div>

      <div className="glass-panel p-3 mb-4 flex items-center justify-between gap-3">
        <code className="text-xs text-blue-300 font-mono truncate">
          {stream.rtspUrl}
        </code>
        <CopyButton text={stream.rtspUrl} />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <span className="px-2 py-1 rounded-lg bg-white/5">
          FPS: {stream.fpsMode === 'custom' ? stream.customFps : 'Native'}
        </span>
        <span className="px-2 py-1 rounded-lg bg-white/5">
          {stream.loop ? 'Loop' : 'One-shot'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {stream.status === 'running' ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 text-sm transition-colors"
          >
            <FaStop className="text-xs" />
            Stop
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-green-300 text-sm transition-colors"
          >
            <FaPlay className="text-xs" />
            Start
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="p-2.5 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
        >
          <FaTrash className="text-sm" />
        </motion.button>
      </div>
    </div>
  );
}
