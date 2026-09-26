import mongoose from 'mongoose';
import { env } from './env.js';
import '../models/index.js';

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
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    // In production, indexes are managed explicitly via `npm run db:sync-indexes`
    // to avoid index builds blocking startup on large collections.
    autoIndex: !env.isProduction,
  });

  const { connection } = mongoose;
  console.info(`[db] MongoDB connected: ${connection.host}:${connection.port}/${connection.name}`);

  connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
  connection.on('reconnected', () => console.info('[db] MongoDB reconnected'));
  connection.on('error', (err) => console.error('[db] MongoDB error:', err.message));
}

/**
 * Makes each collection's indexes match the schema definitions exactly,
 * creating missing indexes and dropping ones that are no longer declared.
 */
export async function syncIndexes() {
  const results = {};
  for (const model of Object.values(mongoose.models)) {
    results[model.modelName] = await model.syncIndexes();
  }
  return results;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
