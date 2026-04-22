import React from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaTrash, FaVideo, FaClock, FaExpand } from 'react-icons/fa';

export default function VideoCard({ video, apiUrl, onDelete, onCreateStream }) {
  const handleDelete = async () => {
    if (!confirm('Delete this video?')) return;
    await fetch(`${apiUrl}/videos/${video.id}`, { method: 'DELETE' });
    onDelete();
  };

  const formatDuration = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="liquid-glass p-5 hover:bg-white/10 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <FaVideo className="text-purple-400" />
        </div>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        >
          <FaTrash className="text-sm" />
        </button>
      </div>

      <h3 className="font-medium truncate mb-1" title={video.originalName}>
        {video.originalName}
      </h3>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
        <span className="flex items-center gap-1.5">
          <FaClock className="text-xs" />
          {formatDuration(video.durationSeconds)}
        </span>
        <span className="flex items-center gap-1.5">
          <FaExpand className="text-xs" />
          {video.width}x{video.height}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">
          {video.nativeFps} FPS
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateStream}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-blue-300 text-sm transition-colors"
        >
          <FaPlay className="text-xs" />
          Stream
        </motion.button>
      </div>
    </div>
  );
}
