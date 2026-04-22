import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt } from 'react-icons/fa';

export default function UploadDropzone({ onUpload, apiUrl }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const handleFiles = useCallback(async (files) => {
    const file = files[0];
    if (!file || !file.type.startsWith('video/')) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);

    try {
      await fetch(`${apiUrl}/videos`, {
        method: 'POST',
        body: formData,
      });
      onUpload();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }, [apiUrl, onUpload]);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`liquid-glass p-12 text-center transition-all cursor-pointer ${
        isDragging ? 'bg-white/10 border-blue-400/50' : ''
      }`}
    >
      <input
        type="file"
        accept="video/*"
        onChange={onInputChange}
        className="hidden"
        id="video-upload"
      />
      <label htmlFor="video-upload" className="cursor-pointer block">
        <motion.div
          animate={{ scale: isDragging ? 1.05 : 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <FaCloudUploadAlt className="text-2xl text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {uploading ? 'Uploading...' : 'Drop a video here or click to browse'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Supports MP4, MOV, AVI up to 500MB
            </p>
          </div>
        </motion.div>
      </label>
    </div>
  );
}
