import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoCard from './VideoCard';
import StreamForm from './StreamForm';

export default function VideoLibrary({ videos, onDelete, apiUrl, onCreateStream }) {
  const [creatingFor, setCreatingFor] = useState(null);

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p>No videos uploaded yet.</p>
        <p className="text-sm mt-2">Upload a video to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <VideoCard
              video={video}
              apiUrl={apiUrl}
              onDelete={onDelete}
              onCreateStream={() => setCreatingFor(video)}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {creatingFor && (
          <StreamForm
            video={creatingFor}
            apiUrl={apiUrl}
            onClose={() => setCreatingFor(null)}
            onCreated={onCreateStream}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
