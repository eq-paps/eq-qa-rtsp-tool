import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StreamCard from './StreamCard';

export default function StreamGrid({ streams, videos, apiUrl, onUpdate }) {
  if (streams.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p>No streams created yet.</p>
        <p className="text-sm mt-2">Go to the Videos tab and click Stream to create one.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {streams.map((stream, i) => {
        const video = videos.find(v => v.id === stream.sourceVideoId);
        return (
          <motion.div
            key={stream.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StreamCard
              stream={stream}
              video={video}
              apiUrl={apiUrl}
              onUpdate={onUpdate}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
