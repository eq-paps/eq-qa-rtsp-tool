import { spawn } from 'child_process';
import { extractMetadata } from './storage.js';

const activeStreams = new Map();

export async function startStream(stream) {
  const { getDb } = await import('./storage.js');
  const db = await getDb();
  const video = db.videos.find(v => v.id === stream.sourceVideoId);
  if (!video) throw new Error('Source video not found');

  await stopStream(stream.id);

  const fps = stream.fpsMode === 'custom' && stream.customFps
    ? stream.customFps
    : video.nativeFps;

  const args = [
    '-re',
    stream.loop ? '-stream_loop' : null,
    stream.loop ? '-1' : null,
    '-i', video.filePath,
    '-vf', `fps=${fps}`,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-rtsp_transport', 'tcp',
    '-f', 'rtsp',
    stream.rtspUrl
  ].filter(Boolean);

  console.log(`[FFmpeg ${stream.id}] command: ffmpeg ${args.join(' ')}`);

  const ffmpeg = spawn('ffmpeg', args);
  
  ffmpeg.stderr.on('data', (data) => {
    console.log(`[FFmpeg ${stream.id}]`, data.toString().trim());
  });
  ffmpeg.on('error', (err) => {
    console.error(`[FFmpeg ${stream.id}] error:`, err.message);
  });
  ffmpeg.on('close', (code) => {
    console.log(`[FFmpeg ${stream.id}] exited with code ${code}`);
    activeStreams.delete(stream.id);
  });

  activeStreams.set(stream.id, ffmpeg);
  return ffmpeg;
}

export async function stopStream(streamId) {
  const proc = activeStreams.get(streamId);
  if (proc) {
    proc.kill('SIGTERM');
    activeStreams.delete(streamId);
  }
}
