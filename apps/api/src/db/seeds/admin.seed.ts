import bcrypt from 'bcrypt';
import type { PoolClient } from 'pg';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

/** Seed tài khoản admin chủ hệ thống; trả id để các seed sau tham chiếu. */
export async function seedAdmin(client: PoolClient): Promise<number | null> {
  const hash = await bcrypt.hash(env.ADMIN_SEED_PASSWORD, 12);
  await client.query(
    `INSERT INTO admin_users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [env.ADMIN_SEED_EMAIL, hash, env.ADMIN_SEED_NAME],
  );
  const res = await client.query(
    `SELECT id FROM admin_users WHERE email = $1 LIMIT 1`,
    [env.ADMIN_SEED_EMAIL],
  );
  logger.info(`Admin user seeded: ${env.ADMIN_SEED_EMAIL}`);
  return res.rows[0]?.id ?? null;
}