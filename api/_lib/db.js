import { Pool } from 'pg';

const globalForDb = globalThis;

export function getPool() {
  if (!globalForDb.__easeEventsPool) {
    globalForDb.__easeEventsPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return globalForDb.__easeEventsPool;
}
