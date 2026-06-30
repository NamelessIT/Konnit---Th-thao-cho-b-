/**
 * Applies pending SQL migrations in filename order.
 * Usage: pnpm --filter @konnit/api db:migrate
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../config/db';
import { logger } from '../utils/logger';

async function migrate() {
  const client = await pool.connect();
  const migrationsDir = path.join(__dirname, 'migrations');

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await client.query(`SELECT pg_advisory_lock(hashtext('konnit:db:migrate'))`);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const appliedResult = await client.query<{ version: string }>(
      'SELECT version FROM schema_migrations',
    );
    const applied = new Set(appliedResult.rows.map((row) => row.version));

    for (const file of files) {
      if (applied.has(file)) continue;

      logger.info({ migration: file }, 'Applying database migration');
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    logger.info('Database migrations complete.');
  } finally {
    await client.query(`SELECT pg_advisory_unlock(hashtext('konnit:db:migrate'))`).catch(() => {});
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  logger.error(error, 'Database migration failed');
  process.exit(1);
});
