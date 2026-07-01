import { Request, Response } from 'express';
import { query } from '../../../config/db';
import { AppError } from '../../../middleware/errorHandler';
import { resolveLocale, applyTranslations, applyTranslationsOne } from '../../../services/i18n';

export async function listCategories(_req: Request, res: Response) {
  const { rows } = await query(
    `SELECT id, name, slug, description, parent_id, sort_order
     FROM cms_categories
     WHERE status = 'published' AND is_deleted = false
     ORDER BY sort_order, id`,
  );
  res.json({ success: true, data: rows });
}

export async function getCategoryWithPages(req: Request, res: Response) {
  const { rows: cats } = await query(
    `SELECT id, name, slug, description
     FROM cms_categories
     WHERE slug = $1 AND status = 'published' AND is_deleted = false`,
    [req.params.slug],
  );
  if (!cats.length) throw new AppError(404, 'NOT_FOUND', 'Danh mục không tồn tại');

  const category = cats[0];
  const { rows: pages } = await query(
    `SELECT id, title, slug, description, published_at
     FROM cms_pages
     WHERE category_id = $1 AND status = 'published' AND is_deleted = false
     ORDER BY published_at DESC`,
    [category.id],
  );

  const locale = await resolveLocale(req.query.locale);
  const translatedPages = await applyTranslations('cms_pages', locale, pages, ['title', 'description']);

  res.json({ success: true, data: { ...category, pages: translatedPages } });
}

export async function getPageWithSections(req: Request, res: Response) {
  const { categorySlug, pageSlug } = req.params;

  const { rows: cats } = await query(
    `SELECT id, name FROM cms_categories
     WHERE slug = $1 AND status = 'published' AND is_deleted = false`,
    [categorySlug],
  );
  if (!cats.length) throw new AppError(404, 'NOT_FOUND', 'Danh mục không tồn tại');

  const category = cats[0];
  const { rows: pages } = await query(
    `SELECT * FROM cms_pages
     WHERE category_id = $1 AND slug = $2 AND status = 'published' AND is_deleted = false`,
    [category.id, pageSlug],
  );
  if (!pages.length) throw new AppError(404, 'NOT_FOUND', 'Trang không tồn tại');

  const page = pages[0];
  const { rows: sections } = await query(
    `SELECT id, component_type, style_variant, title, description, content_json, sort_order
     FROM cms_sections
     WHERE page_id = $1 AND is_visible = true AND is_deleted = false
     ORDER BY sort_order`,
    [page.id],
  );

  const locale = await resolveLocale(req.query.locale);
  const translatedPage = await applyTranslationsOne('cms_pages', locale, page, [
    'title', 'description', 'seo_title', 'seo_description',
  ]);
  const translatedSections = await applyTranslations('cms_sections', locale, sections, [
    'title', 'description', 'content_json',
  ]);

  res.json({
    success: true,
    data: { ...translatedPage, category_name: category.name, sections: translatedSections },
  });
}
