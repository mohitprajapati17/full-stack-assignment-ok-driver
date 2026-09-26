import { getDbStatus } from '../../config/db.js';

export function getHealth(req, res) {
  const database = getDbStatus();
  const healthy = database === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services: { database },
  });
}
