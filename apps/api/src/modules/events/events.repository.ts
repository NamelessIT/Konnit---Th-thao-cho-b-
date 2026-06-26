import { query } from '../../config/db';

export async function findAllAdmin() {
  const { rows } = await query(
    `SELECT e.*,
            (SELECT count(*) FROM ticket_types t WHERE t.event_id = e.id AND t.is_deleted = false) AS ticket_type_count
     FROM events e
     WHERE e.is_deleted = false
     ORDER BY e.created_at DESC`,
  );
  return rows;
}

export async function findById(id: number) {
  const { rows } = await query(
    `SELECT * FROM events WHERE id = $1 AND is_deleted = false`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findBySlug(slug: string) {
  const { rows } = await query(
    `SELECT * FROM events WHERE slug = $1 AND is_deleted = false`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function findPublishedBySlug(slug: string) {
  const { rows } = await query(
    `SELECT * FROM events WHERE slug = $1 AND status = 'published' AND is_deleted = false`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function findPublishedTicketTypes(eventId: number) {
  const { rows } = await query(
    `SELECT * FROM ticket_types
     WHERE event_id = $1 AND status = 'published' AND is_deleted = false
     ORDER BY sort_order, id`,
    [eventId],
  );
  return rows;
}

export async function create(data: Record<string, unknown>, createdBy: number) {
  const { rows } = await query(
    `INSERT INTO events (name, slug, description, location, map_url, starts_at,
                         registration_opens_at, registration_closes_at, banner_path, cms_page_id,
                         created_by, updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING *`,
    [
      data.name, data.slug, data.description ?? null, data.location ?? null, data.mapUrl ?? null,
      data.startsAt ?? null, data.registrationOpensAt ?? null, data.registrationClosesAt ?? null,
      data.bannerPath ?? null, data.cmsPageId ?? null, createdBy,
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
    `UPDATE events SET ${fields.join(', ')} WHERE id = $${idx} AND is_deleted = false RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function softDelete(id: number) {
  const { rows } = await query(
    `UPDATE events SET is_deleted = true, updated_at = now() WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
}

export async function publish(id: number, updatedBy: number) {
  const { rows } = await query(
    `UPDATE events SET status = 'published', published_at = now(), updated_by = $2, updated_at = now()
     WHERE id = $1 AND is_deleted = false RETURNING *`,
    [id, updatedBy],
  );
  return rows[0] ?? null;
}
