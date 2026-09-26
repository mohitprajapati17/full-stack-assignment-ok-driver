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

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  const { connection } = mongoose;
  console.info(`[db] MongoDB connected: ${connection.host}:${connection.port}/${connection.name}`);

  connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
  connection.on('reconnected', () => console.info('[db] MongoDB reconnected'));
  connection.on('error', (err) => console.error('[db] MongoDB error:', err.message));
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
