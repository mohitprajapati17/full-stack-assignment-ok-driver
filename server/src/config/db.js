import mongoose from 'mongoose';
import { env } from './env.js';

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export function getDbStatus() {
  return READY_STATES[mongoose.connection.readyState] ?? 'unknown';
}

export async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.info('[db] MongoDB reconnected'));
  mongoose.connection.on('error', (err) => console.error('[db] MongoDB error:', err.message));

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  const { host, port, name } = mongoose.connection;
  console.info(`[db] MongoDB connected: ${host}:${port}/${name}`);
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
