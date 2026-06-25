import { query, pool } from '../../../config/db';

export async function findByPageId(pageId: number) {
  const { rows } = await query(
    `SELECT * FROM cms_sections
     WHERE page_id = $1 AND is_deleted = false
     ORDER BY sort_order`,
    [pageId],
  );
  return rows;
}

export async function findById(id: number) {
  const { rows } = await query(
    `SELECT * FROM cms_sections WHERE id = $1 AND is_deleted = false`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getMaxSortOrder(pageId: number): Promise<number> {
  const { rows } = await query(
    `SELECT COALESCE(MAX(sort_order), -1) as max_order
     FROM cms_sections
     WHERE page_id = $1 AND is_deleted = false`,
    [pageId],
  );
  return rows[0].max_order;
}

export async function create(data: {
  pageId: number;
  templateId: number;
  styleId: number;
  componentType: string;
  styleVariant: string;
  title?: string;
  description?: string;
  contentJson: Record<string, unknown>;
  sortOrder: number;
  createdBy: number;
}) {
  const { rows } = await query(
    `INSERT INTO cms_sections
     (page_id, template_id, style_id, component_type, style_variant, title, description, content_json, sort_order, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
     RETURNING *`,
    [
      data.pageId, data.templateId, data.styleId,
      data.componentType, data.styleVariant,
      data.title ?? null, data.description ?? null,
      JSON.stringify(data.contentJson), data.sortOrder, data.createdBy,
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
    if (col === 'content_json') {
      fields.push(`${col} = $${idx}`);
      values.push(JSON.stringify(val));
    } else {
      fields.push(`${col} = $${idx}`);
      values.push(val);
    }
    idx++;
  }

  fields.push(`updated_by = $${idx}`);
  values.push(updatedBy);
  idx++;

  fields.push(`updated_at = now()`);
  values.push(id);

  const { rows } = await query(
    `UPDATE cms_sections SET ${fields.join(', ')} WHERE id = $${idx} AND is_deleted = false RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function softDelete(id: number) {
  const { rows } = await query(
    `UPDATE cms_sections SET is_deleted = true, updated_at = now() WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
}

export async function reorder(items: { id: number; sortOrder: number }[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        `UPDATE cms_sections SET sort_order = $1, updated_at = now() WHERE id = $2`,
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
