import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const DATA_DIR = process.env.DATA_DIR || './data';
const DB_FILE = path.join(DATA_DIR, 'app-db.json');

let dbCache = null;

export async function getDb() {
  if (dbCache) return dbCache;
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    dbCache = JSON.parse(data);
  } catch {
    dbCache = { videos: [], streams: [] };
  }
  return dbCache;
}

export async function saveDb(db) {
  dbCache = db;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

export async function extractMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate,duration',
      '-show_entries', 'format=duration',
      '-of', 'json',
      filePath
    ]);

    let output = '';
    ffprobe.stdout.on('data', data => output += data);
    ffprobe.on('close', code => {
      if (code !== 0) return reject(new Error('ffprobe failed'));
      try {
        const info = JSON.parse(output);
        const stream = info.streams?.[0] || {};
        const format = info.format || {};
        
        let fps = 0;
        if (stream.r_frame_rate) {
          const [num, den] = stream.r_frame_rate.split('/').map(Number);
          fps = den ? num / den : num;
        }
        
        const duration = parseFloat(stream.duration || format.duration || 0);
        
        resolve({
          width: stream.width || 0,
          height: stream.height || 0,
          fps: Math.round(fps) || 30,
          durationSeconds: Math.round(duration) || 0
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}
