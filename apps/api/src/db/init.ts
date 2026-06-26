/**
 * Database initializer — runs schema.sql then seed.
 * Usage: pnpm --filter @konnit/api db:init
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';
import { logger } from '../utils/logger';

async function init() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  logger.info('Running schema.sql...');
  await pool.query(schema);
  logger.info('Schema created successfully.');

  // Run seed
  logger.info('Running seed...');
  const { seed } = await import('./seed');
  await seed();

  await pool.end();
  logger.info('Database initialization complete.');
}

init().catch((err) => {
  logger.error(err, 'Database initialization failed');
  process.exit(1);
});
