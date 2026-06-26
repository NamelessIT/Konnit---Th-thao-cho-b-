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

export async function seed() {
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

    // 3. Seed a demo event + ticket types + a voucher (Phase 2)
    const eventRes = await client.query(
      `INSERT INTO events (name, slug, description, location, starts_at,
                           registration_opens_at, registration_closes_at, status, published_at)
       VALUES ($1,$2,$3,$4, now() + interval '30 days',
               now() - interval '1 day', now() + interval '25 days', 'published', now())
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [
        'Konnit Kids Run 2026',
        'konnit-kids-run-2026',
        'Giải chạy gia đình cho các bé Konnit — vận động vui khỏe cùng ba mẹ.',
        'Công viên Tao Đàn, TP.HCM',
      ],
    );
    const eventId = eventRes.rows[0].id;

    const ticketTypes = [
      { name: 'Vé thi đấu – Mầm', slug: 'mam', ageGroup: '2–3 tuổi', ageMin: 2, ageMax: 3, price: 250000, earlyBird: 200000, quota: 100, shirt: true },
      { name: 'Vé thi đấu – Chồi', slug: 'choi', ageGroup: '4–6 tuổi', ageMin: 4, ageMax: 6, price: 300000, earlyBird: 250000, quota: 100, shirt: true },
      { name: 'Vé trải nghiệm (Fun)', slug: 'fun', ageGroup: 'Mọi lứa', ageMin: 2, ageMax: 12, price: 150000, earlyBird: null, quota: 200, shirt: false },
    ];
    for (let i = 0; i < ticketTypes.length; i++) {
      const t = ticketTypes[i];
      await client.query(
        `INSERT INTO ticket_types (event_id, name, slug, age_group, age_min, age_max,
                                   price, early_bird_price, early_bird_until,
                                   quota_total, includes_shirt, sort_order, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now() + interval '10 days', $9,$10,$11,'published')
         ON CONFLICT (event_id, slug) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price`,
        [eventId, t.name, t.slug, t.ageGroup, t.ageMin, t.ageMax,
         t.price, t.earlyBird, t.quota, t.shirt, i],
      );
    }
    logger.info('Demo event + ticket types seeded.');

    await client.query(
      `INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_amount, max_uses, status)
       VALUES ('KONNIT10', 'Giảm 10% cho đơn đầu tiên', 'percent', 10, 0, 1000, 'active')
       ON CONFLICT (code) DO NOTHING`,
    );
    logger.info('Demo voucher seeded.');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Run standalone only when invoked directly (db:seed), not when imported by init.
if (process.argv[1] && process.argv[1].includes('seed')) {
  seed()
    .then(() => logger.info('Seed complete.'))
    .catch((err) => {
      logger.error(err, 'Seed failed');
      process.exit(1);
    });
}
