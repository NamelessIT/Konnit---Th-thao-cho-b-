import { query } from '../../../config/db';

export async function findAll(categoryId?: number) {
  if (categoryId) {
    const { rows } = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM cms_pages p
       JOIN cms_categories c ON c.id = p.category_id
       WHERE p.is_deleted = false AND p.category_id = $1
       ORDER BY p.created_at DESC`,
      [categoryId],
    );
    return rows;
  }
  const { rows } = await query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM cms_pages p
     JOIN cms_categories c ON c.id = p.category_id
     WHERE p.is_deleted = false
     ORDER BY p.created_at DESC`,
  );
  return rows;
}

export async function findById(id: number) {
  const { rows } = await query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM cms_pages p
     JOIN cms_categories c ON c.id = p.category_id
     WHERE p.id = $1 AND p.is_deleted = false`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findBySlugInCategory(categoryId: number, slug: string) {
  const { rows } = await query(
    `SELECT * FROM cms_pages
     WHERE category_id = $1 AND slug = $2 AND is_deleted = false`,
    [categoryId, slug],
  );
  return rows[0] ?? null;
}

export async function create(data: {
  categoryId: number;
  title: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdBy: number;
}) {
  const { rows } = await query(
    `INSERT INTO cms_pages (category_id, title, slug, description, seo_title, seo_description, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING *`,
    [
      data.categoryId, data.title, data.slug,
      data.description ?? null, data.seoTitle ?? null,
      data.seoDescription ?? null, data.createdBy,
    ],
  );
  return rows[0];
}

export async function update(
  id: number,
  data: Record<string, unknown>,
  updatedBy: number,
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(data)) {
    const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    fields.push(`${col} = $${idx}`);
    values.push(val);
    idx++;
  }

  fields.push(`updated_by = $${idx}`);
  values.push(updatedBy);
  idx++;

  fields.push(`updated_at = now()`);
  values.push(id);

  const { rows } = await query(
    `UPDATE cms_pages SET ${fields.join(', ')} WHERE id = $${idx} AND is_deleted = false RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function softDelete(id: number) {
  const { rows } = await query(
    `UPDATE cms_pages SET is_deleted = true, updated_at = now() WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
}

export async function publish(id: number, updatedBy: number) {
  const { rows } = await query(
    `UPDATE cms_pages SET status = 'published', published_at = now(), updated_by = $2, updated_at = now()
     WHERE id = $1 AND is_deleted = false RETURNING *`,
    [id, updatedBy],
  );
  return rows[0] ?? null;
}

export async function findWithSections(id: number) {
  const page = await findById(id);
  if (!page) return null;

  const { rows: sections } = await query(
    `SELECT * FROM cms_sections
     WHERE page_id = $1 AND is_deleted = false
     ORDER BY sort_order`,
    [id],
  );
  return { ...page, sections };
}
