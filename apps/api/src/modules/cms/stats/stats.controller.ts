import { Request, Response } from 'express';
import { query } from '../../../config/db';

export async function getStats(_req: Request, res: Response) {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM cms_categories WHERE is_deleted = false) AS categories_total,
       (SELECT COUNT(*) FROM cms_categories WHERE is_deleted = false AND status = 'published') AS categories_published,
       (SELECT COUNT(*) FROM cms_pages WHERE is_deleted = false) AS pages_total,
       (SELECT COUNT(*) FROM cms_pages WHERE is_deleted = false AND status = 'published') AS pages_published,
       (SELECT COUNT(*) FROM cms_pages WHERE is_deleted = false AND status <> 'published') AS pages_draft,
       (SELECT COUNT(*) FROM uploads WHERE is_deleted = false) AS media_total`,
  );

  const r = rows[0] as Record<string, string>;

  const { rows: recentPages } = await query(
    `SELECT p.id, p.title, p.slug, p.status, p.updated_at, c.name AS category_name, c.slug AS category_slug
     FROM cms_pages p
     LEFT JOIN cms_categories c ON c.id = p.category_id
     WHERE p.is_deleted = false
     ORDER BY p.updated_at DESC
     LIMIT 5`,
  );

  res.json({
    success: true,
    data: {
      categories: {
        total: Number(r.categories_total),
        published: Number(r.categories_published),
      },
      pages: {
        total: Number(r.pages_total),
        published: Number(r.pages_published),
        draft: Number(r.pages_draft),
      },
      media: {
        total: Number(r.media_total),
      },
      recentPages,
    },
  });
}
