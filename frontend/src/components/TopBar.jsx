import React from 'react';
import { motion } from 'framer-motion';
import { FaWifi, FaCopy } from 'react-icons/fa';

export default function TopBar({ ipv4 }) {
  const copyIp = () => {
    if (ipv4) {
      navigator.clipboard.writeText(ipv4);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass-panel mx-4 mt-4 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <FaWifi className="text-blue-400" />
        </div>
        <h1 className="text-xl font-semibold">RTSP Stream Tool</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="glass-panel px-4 py-2 flex items-center gap-3">
          <span className="text-slate-400 text-sm">IPv4</span>
          <span className="font-mono text-sm text-blue-300">{ipv4 || 'Loading...'}</span>
          <button
            onClick={copyIp}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Copy IP"
          >
            <FaCopy className="text-xs text-slate-400" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
