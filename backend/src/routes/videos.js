import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { promises as fs } from 'fs';
import { getDb, saveDb, extractMetadata } from '../services/storage.js';

const router = Router();
const DATA_DIR = process.env.DATA_DIR || './data';
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

router.post('/', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file provided' });

    const metadata = await extractMetadata(req.file.path);
    const video = {
      id: uuidv4(),
      originalName: req.file.originalname,
      storedName: req.file.filename,
      filePath: req.file.path,
      durationSeconds: metadata.durationSeconds,
      width: metadata.width,
      height: metadata.height,
      nativeFps: metadata.fps,
      createdAt: new Date().toISOString()
    };

    const db = await getDb();
    db.videos.push(video);
    await saveDb(db);

    res.json(video);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const db = await getDb();
  res.json(db.videos);
});

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const video = db.videos.find(v => v.id === req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    await fs.unlink(video.filePath).catch(() => {});
    db.videos = db.videos.filter(v => v.id !== req.params.id);
    await saveDb(db);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
