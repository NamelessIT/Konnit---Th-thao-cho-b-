import { query, pool } from '../../../config/db';

export async function findAll() {
  const { rows } = await query(
    `SELECT * FROM cms_categories WHERE is_deleted = false ORDER BY sort_order, id`,
  );
  return rows;
}

export async function findById(id: number) {
  const { rows } = await query(
    `SELECT * FROM cms_categories WHERE id = $1 AND is_deleted = false`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findBySlug(slug: string) {
  const { rows } = await query(
    `SELECT * FROM cms_categories WHERE slug = $1 AND is_deleted = false`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function create(data: {
  name: string;
  slug: string;
  description?: string;
  parentId?: number | null;
  createdBy: number;
}) {
  const { rows } = await query(
    `INSERT INTO cms_categories (name, slug, description, parent_id, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $5) RETURNING *`,
    [data.name, data.slug, data.description ?? null, data.parentId ?? null, data.createdBy],
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
    `UPDATE cms_categories SET ${fields.join(', ')} WHERE id = $${idx} AND is_deleted = false RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function softDelete(id: number) {
  const { rows } = await query(
    `UPDATE cms_categories SET is_deleted = true, updated_at = now() WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
}

export async function publish(id: number, updatedBy: number) {
  const { rows } = await query(
    `UPDATE cms_categories SET status = 'published', published_at = now(), updated_by = $2, updated_at = now()
     WHERE id = $1 AND is_deleted = false RETURNING *`,
    [id, updatedBy],
  );
  return rows[0] ?? null;
}

export async function reorder(items: { id: number; sortOrder: number }[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        `UPDATE cms_categories SET sort_order = $1, updated_at = now() WHERE id = $2`,
        [item.sortOrder, item.id],
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
