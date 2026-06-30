import type { PoolClient } from 'pg';
import { CMS_COMPONENT_TYPES, CMS_STYLE_VARIANTS } from '@konnit/types';
import { logger } from '../../utils/logger';
import { HOME_PAGE, LANDING_PAGES, type SeedPage } from './cms.seed-data';

async function upsertPageSections(
  client: PoolClient,
  categoryId: number,
  adminId: number | null,
  page: SeedPage,
) {
  const pageRes = await client.query(
    `INSERT INTO cms_pages (category_id, title, slug, description, status, published_at, created_by, updated_by)
     VALUES ($1, $2, $3, $4, 'published', now(), $5, $5)
     ON CONFLICT (category_id, slug)
       DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
     RETURNING id`,
    [categoryId, page.title, page.slug, page.description, adminId],
  );
  const pageId = pageRes.rows[0].id;

  // Page seed-managed → xoá & dựng lại sections (không đụng page do user tạo).
  await client.query(`DELETE FROM cms_sections WHERE page_id = $1`, [pageId]);
  for (let i = 0; i < page.sections.length; i++) {
    const s = page.sections[i];
    await client.query(
      `INSERT INTO cms_sections
         (page_id, component_type, style_variant, title, description, content_json, sort_order, status, created_by, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'published',$8,$8)`,
      [pageId, s.component_type, s.style_variant, s.title, s.description ?? null,
       JSON.stringify(s.content_json), i + 1, adminId],
    );
  }
}

/** Seed CMS: component templates/styles + category "Trang chủ" + home & landing pages. */
export async function seedCms(client: PoolClient, adminId: number | null) {
  for (const tmpl of CMS_COMPONENT_TYPES) {
    const result = await client.query(
      `INSERT INTO cms_component_templates (type_key, name, allowed_fields_json)
       VALUES ($1, $2, $3)
       ON CONFLICT (type_key) DO UPDATE SET name = $2, allowed_fields_json = $3
       RETURNING id`,
      [tmpl.typeKey, tmpl.label, JSON.stringify(tmpl.fields)],
    );
    const templateId = result.rows[0].id;
    for (const style of CMS_STYLE_VARIANTS[tmpl.typeKey] ?? []) {
      await client.query(
        `INSERT INTO cms_component_styles (template_id, style_key, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (template_id, style_key) DO UPDATE SET name = $3`,
        [templateId, style.styleKey, style.name],
      );
    }
  }
  logger.info('Component templates and styles seeded.');

  const catRes = await client.query(
    `INSERT INTO cms_categories (name, slug, description, status, published_at, created_by, updated_by)
     VALUES ('Trang chủ', 'landing', 'Nội dung trang chủ Konnit', 'published', now(), $1, $1)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [adminId],
  );
  const categoryId = catRes.rows[0].id;

  await upsertPageSections(client, categoryId, adminId, HOME_PAGE);
  logger.info('Home page CMS sections seeded.');

  for (const lp of LANDING_PAGES) {
    await upsertPageSections(client, categoryId, adminId, lp);
  }
  logger.info('Services / Store / Community landing pages seeded.');
}