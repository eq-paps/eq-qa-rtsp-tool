import { Router } from 'express';
import os from 'os';

const router = Router();

function getLocalIPv4() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

router.get('/ip', (req, res) => {
  res.json({ ipv4: getLocalIPv4() });
});

export default router;
