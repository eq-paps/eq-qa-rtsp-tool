import React from 'react';

export default function StatusPill({ status }) {
  const styles = {
    idle: 'bg-slate-500/20 text-slate-400',
    running: 'bg-green-500/20 text-green-400 animate-pulse',
    stopped: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.idle}`}>
      {status}
    </span>
  );
}
