import http from 'node:http';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error(`[db] Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  const server = http.createServer(createApp());

  server.listen(env.PORT, () => {
    console.info(`[server] Listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal) => {
    console.info(`[server] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
