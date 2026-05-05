import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaPlay, FaBomb, FaExclamationTriangle, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import StatusPill from './StatusPill';

export default function BulkTestStreams({ streams, videos, apiUrl, onUpdate }) {
  const [files, setFiles] = useState([]);
  const [framerate, setFramerate] = useState(30);
  const [loop, setLoop] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ created: 0, errors: 0 });
  const [lastResult, setLastResult] = useState(null);
  const [showNukeConfirm, setShowNukeConfirm] = useState(false);
  const [isNuking, setIsNuking] = useState(false);
  const fileInputRef = useRef(null);

  const getNextStreamIndex = useCallback(() => {
    const maxIndex = streams.reduce((max, stream) => {
      const match = stream.pathSlug.match(/^test-stream-(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        return Math.max(max, num);
      }
      return max;
    }, 0);
    return maxIndex + 1;
  }, [streams]);

  const nextIndex = getNextStreamIndex();
  const willCreateNames = files.map((_, i) => `test-stream-${nextIndex + i}`);

  const handleFiles = useCallback((selectedFiles) => {
    const videoFiles = Array.from(selectedFiles).filter(file => 
      file.type.startsWith('video/')
    );
    setFiles(videoFiles);
    setLastResult(null);
  }, []);

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
  };

  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartAll = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ created: 0, errors: 0 });
    setLastResult(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files[]', file);
    });
    formData.append('framerate', framerate.toString());
    formData.append('loop', loop.toString());

    try {
      const res = await fetch(`${apiUrl}/streams/bulk-add`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setLastResult({
          type: 'success',
          created: data.created.length,
          errors: data.errors.length,
          errorDetails: data.errors
        });
        setUploadProgress({ 
          created: data.created.length, 
          errors: data.errors.length 
        });
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUpdate();
      } else {
        setLastResult({
          type: 'error',
          message: data.error || 'Failed to create streams'
        });
      }
    } catch (err) {
      setLastResult({
        type: 'error',
        message: err.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleNukeAll = async () => {
    setIsNuking(true);
    try {
      const res = await fetch(`${apiUrl}/streams/nuke-all`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setLastResult({
          type: 'nuked',
          removed: data.removed || { streams: 0, videos: 0 }
        });
        setShowNukeConfirm(false);
        onUpdate();
      } else {
        setLastResult({
          type: 'error',
          message: data.error || data.message || 'Failed to nuke all'
        });
      }
    } catch (err) {
      setLastResult({
        type: 'error',
        message: err.message
      });
    } finally {
      setIsNuking(false);
    }
  };

  return (
    <div className="liquid-glass p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <FaUpload className="text-blue-400" />
        </span>
        Bulk Test Streams
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
            Add Streams
          </h3>

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`glass-panel p-6 text-center transition-all border-2 border-dashed ${
              isDragging 
                ? 'border-blue-400/50 bg-blue-500/10' 
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              webkitdirectory=""
              onChange={onInputChange}
              className="hidden"
              id="bulk-video-upload"
            />
            <label htmlFor="bulk-video-upload" className="cursor-pointer block">
              <motion.div
                animate={{ scale: isDragging ? 1.02 : 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <FaUpload className="text-xl text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    Drop folder or select videos
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Multiple files supported
                  </p>
                </div>
              </motion.div>
            </label>
          </div>

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-panel p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-300">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearFiles}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <FaTimes />
                  Clear
                </button>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 mb-4">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-blue-400">{willCreateNames[i]}</span>
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-500">
                Will create: {willCreateNames.slice(0, 3).join(', ')}
                {willCreateNames.length > 3 && ` and ${willCreateNames.length - 3} more`}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Framerate (fps)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={framerate}
                onChange={(e) => setFramerate(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-blue-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Loop
              </label>
              <button
                onClick={() => setLoop(!loop)}
                className={`w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  loop 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}
              >
                {loop ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStartAll}
            disabled={files.length === 0 || isUploading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              files.length === 0 || isUploading
                ? 'bg-slate-500/20 text-slate-500 cursor-not-allowed'
                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
            }`}
          >
            {isUploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"
                />
                Creating {files.length} stream{files.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <FaPlay className="text-sm" />
                Start All Streams
              </>
            )}
          </motion.button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-red-300 uppercase tracking-wider flex items-center gap-2">
            <FaExclamationTriangle className="text-xs" />
            Danger Zone
          </h3>

          <div className="glass-panel p-6 border-red-500/20">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <FaBomb className="text-xl text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-200">Nuke All</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Stop and remove all {streams.length} stream{streams.length !== 1 ? 's' : ''} and {videos.length} video{videos.length !== 1 ? 's' : ''}. 
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {!showNukeConfirm ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNukeConfirm(true)}
                disabled={isNuking || (streams.length === 0 && videos.length === 0)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  isNuking || (streams.length === 0 && videos.length === 0)
                    ? 'bg-slate-500/20 text-slate-500 cursor-not-allowed'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                }`}
              >
                <FaBomb className="text-sm" />
                Nuke All
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-red-300 text-center">
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNukeConfirm(false)}
                    disabled={isNuking}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNukeAll}
                    disabled={isNuking}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                  >
                    {isNuking ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <FaTrash className="text-xs" />
                    )}
                    {isNuking ? 'Nuking...' : 'Confirm Nuke'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            {lastResult.type === 'success' && (
              <div className="glass-panel p-4 border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <FaCheck className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-green-400">
                      Created {lastResult.created} stream{lastResult.created !== 1 ? 's' : ''}
                    </p>
                    {lastResult.errors > 0 && (
                      <p className="text-sm text-red-400 mt-1">
                        {lastResult.errors} file{lastResult.errors !== 1 ? 's' : ''} failed
                      </p>
                    )}
                  </div>
                </div>
                {lastResult.errorDetails && lastResult.errorDetails.length > 0 && (
                  <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                    {lastResult.errorDetails.map((err, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <FaTimes className="text-red-400" />
                        <span className="text-slate-300">{err.file}:</span>
                        <span className="text-red-400">{err.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {lastResult.type === 'nuked' && lastResult.removed && (
              <div className="glass-panel p-4 border-red-500/30 bg-red-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <FaTrash className="text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-red-400">
                      Nuked {(lastResult.removed.streams || 0)} stream{(lastResult.removed.streams || 0) !== 1 ? 's' : ''} and {(lastResult.removed.videos || 0)} video{(lastResult.removed.videos || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {lastResult.type === 'error' && (
              <div className="glass-panel p-4 border-red-500/30 bg-red-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <FaTimes className="text-red-400" />
                  </div>
                  <p className="text-red-400">{lastResult.message}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}