/**
 * Seed orchestrator — chạy các module seed trong MỘT transaction.
 * Usage: pnpm --filter @konnit/api db:seed
 */
import 'dotenv/config';
import { pool } from '../config/db';
import { logger } from '../utils/logger';
import { seedAdmin } from './seeds/admin.seed';
import { seedAccessControl } from './seeds/access.seed';
import { seedCms } from './seeds/cms.seed';
import { seedCommerce } from './seeds/commerce.seed';

export async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const adminId = await seedAdmin(client);
    await seedAccessControl(client);
    logger.info('Roles and permissions seeded.');
    await seedCms(client, adminId);
    await seedCommerce(client);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Chạy độc lập khi gọi trực tiếp (db:seed); init.ts import seed() nên không tự chạy lại.
if (process.argv[1] && process.argv[1].includes('seed')) {
  seed()
    .then(() => logger.info('Seed complete.'))
    .catch((err) => {
      logger.error(err, 'Seed failed');
      process.exit(1);
    });
}