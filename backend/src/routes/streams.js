import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../services/storage.js';
import { startStream, stopStream } from '../services/streamManager.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, sourceVideoId, fpsMode, customFps, loop } = req.body;
    const db = await getDb();
    const video = db.videos.find(v => v.id === sourceVideoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const slug = `stream-${uuidv4().slice(0, 8)}`;
    const stream = {
      id: uuidv4(),
      name,
      sourceVideoId,
      pathSlug: slug,
      fpsMode,
      customFps,
      loop: !!loop,
      status: 'idle',
      rtspUrl: `rtsp://${process.env.MEDIAMTX_HOST || 'localhost'}:${process.env.MEDIAMTX_PORT || '8554'}/${slug}`,
      createdAt: new Date().toISOString()
    };

    db.streams.push(stream);
    await saveDb(db);
    res.json(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const db = await getDb();
  res.json(db.streams);
});

router.post('/:id/start', async (req, res) => {
  try {
    const db = await getDb();
    const stream = db.streams.find(s => s.id === req.params.id);
    if (!stream) return res.status(404).json({ error: 'Stream not found' });

    await startStream(stream);
    stream.status = 'running';
    await saveDb(db);

    res.json(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/stop', async (req, res) => {
  try {
    const db = await getDb();
    const stream = db.streams.find(s => s.id === req.params.id);
    if (!stream) return res.status(404).json({ error: 'Stream not found' });

    await stopStream(stream.id);
    stream.status = 'stopped';
    await saveDb(db);

    res.json(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const stream = db.streams.find(s => s.id === req.params.id);
    if (stream) {
      await stopStream(stream.id);
    }
    db.streams = db.streams.filter(s => s.id !== req.params.id);
    await saveDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
