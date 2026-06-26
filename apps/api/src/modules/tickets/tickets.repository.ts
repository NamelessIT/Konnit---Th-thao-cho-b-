import { query } from '../../config/db';

const PUBLIC_JOIN = `
  FROM ticket_types t
  JOIN events e ON e.id = t.event_id
  WHERE t.is_deleted = false AND t.status = 'published'
    AND e.is_deleted = false AND e.status = 'published'
`;

const EVENT_COLS = `
  e.name AS event_name, e.slug AS event_slug, e.location AS event_location,
  e.starts_at AS event_starts_at, e.description AS event_description
`;

/** Store grid: all published ticket types across published events. */
export async function findPublicList() {
  const { rows } = await query(
    `SELECT t.*, ${EVENT_COLS} ${PUBLIC_JOIN} ORDER BY e.starts_at NULLS LAST, t.sort_order, t.id`,
  );
  return rows;
}

/** Product detail by id. */
export async function findPublicById(id: number) {
  const { rows } = await query(
    `SELECT t.*, ${EVENT_COLS} ${PUBLIC_JOIN} AND t.id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

// ===== Admin =====
export async function findAllAdmin(eventId?: number) {
  const { rows } = await query(
    `SELECT t.*, e.name AS event_name, e.slug AS event_slug
     FROM ticket_types t JOIN events e ON e.id = t.event_id
     WHERE t.is_deleted = false ${eventId ? 'AND t.event_id = $1' : ''}
     ORDER BY t.event_id, t.sort_order, t.id`,
    eventId ? [eventId] : [],
  );
  return rows;
}

export async function findById(id: number) {
  const { rows } = await query(
    `SELECT * FROM ticket_types WHERE id = $1 AND is_deleted = false`,
    [id],
  );
  return rows[0] ?? null;
}

export async function create(data: Record<string, unknown>, createdBy: number) {
  const { rows } = await query(
    `INSERT INTO ticket_types
       (event_id, name, slug, description, age_group, age_min, age_max, gender_restriction,
        price, early_bird_price, early_bird_until, quota_total, includes_shirt, image_path,
        sort_order, status, created_by, updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$17)
     RETURNING *`,
    [
      data.eventId, data.name, data.slug ?? null, data.description ?? null, data.ageGroup ?? null,
      data.ageMin ?? null, data.ageMax ?? null, data.genderRestriction ?? 'any',
      data.price ?? 0, data.earlyBirdPrice ?? null, data.earlyBirdUntil ?? null,
      data.quotaTotal ?? 0, data.includesShirt ?? false, data.imagePath ?? null,
      data.sortOrder ?? 0, data.status ?? 'draft', createdBy,
    ],
  );
  return rows[0];
}

export async function update(id: number, data: Record<string, unknown>, updatedBy: number) {
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
    `UPDATE ticket_types SET ${fields.join(', ')} WHERE id = $${idx} AND is_deleted = false RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function softDelete(id: number) {
  const { rows } = await query(
    `UPDATE ticket_types SET is_deleted = true, updated_at = now() WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
}
