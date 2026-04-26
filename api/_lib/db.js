import { Pool } from 'pg';

const globalForDb = globalThis;

export function getPool() {
  if (!globalForDb.__easeEventsPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    globalForDb.__easeEventsPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return globalForDb.__easeEventsPool;
}
