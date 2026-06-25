/**
 * Seed data for development.
 * Creates admin user + CMS component templates/styles.
 * Usage: pnpm --filter @konnit/api db:seed
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../config/db';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { CMS_COMPONENT_TYPES, CMS_STYLE_VARIANTS } from '@konnit/types';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed admin user
    const hash = await bcrypt.hash(env.ADMIN_SEED_PASSWORD, 12);
    await client.query(
      `INSERT INTO admin_users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [env.ADMIN_SEED_EMAIL, hash, env.ADMIN_SEED_NAME],
    );
    logger.info(`Admin user seeded: ${env.ADMIN_SEED_EMAIL}`);

    // 2. Seed component templates + styles
    for (const tmpl of CMS_COMPONENT_TYPES) {
      const result = await client.query(
        `INSERT INTO cms_component_templates (type_key, name, allowed_fields_json)
         VALUES ($1, $2, $3)
         ON CONFLICT (type_key) DO UPDATE SET name = $2, allowed_fields_json = $3
         RETURNING id`,
        [tmpl.typeKey, tmpl.label, JSON.stringify(tmpl.fields)],
      );
      const templateId = result.rows[0].id;

      const styles = CMS_STYLE_VARIANTS[tmpl.typeKey] || [];
      for (const style of styles) {
        await client.query(
          `INSERT INTO cms_component_styles (template_id, style_key, name)
           VALUES ($1, $2, $3)
           ON CONFLICT (template_id, style_key) DO UPDATE SET name = $3`,
          [templateId, style.styleKey, style.name],
        );
      }
    }
    logger.info('Component templates and styles seeded.');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => logger.info('Seed complete.'))
  .catch((err) => {
    logger.error(err, 'Seed failed');
    process.exit(1);
  });
