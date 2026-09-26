import { connectDB, disconnectDB, syncIndexes } from '../src/config/db.js';

try {
  await connectDB();
  const results = await syncIndexes();
  for (const [model, dropped] of Object.entries(results)) {
    const note = dropped.length ? `dropped stale: ${dropped.join(', ')}` : 'in sync';
    console.info(`[db] ${model}: ${note}`);
  }
} catch (err) {
  console.error('[db] Index sync failed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
