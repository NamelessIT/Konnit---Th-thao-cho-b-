import { Pool } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on('error', (err: Error) => {
  logger.error(err, 'Unexpected database pool error');
});

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
