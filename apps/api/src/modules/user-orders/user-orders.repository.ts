import { query } from '../../config/db';

export async function listUserOrders(
  userId: number,
  opts: { limit: number; offset: number; status?: string },
) {
  const params: unknown[] = [userId];
  let statusFilter = '';
  if (opts.status) {
    params.push(opts.status);
    statusFilter = `AND o.status = $${params.length}`;
  }
  params.push(opts.limit);
  const limitIdx = params.length;
  params.push(opts.offset);
  const offsetIdx = params.length;

  const { rows } = await query(
    `SELECT o.order_code, o.status, o.total, o.created_at, o.paid_at,
            (SELECT count(*)::int FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
            ev.event_name, ev.event_slug
     FROM orders o
     LEFT JOIN LATERAL (
       SELECT e.name AS event_name, e.slug AS event_slug
       FROM order_items oi
       JOIN ticket_types tt ON tt.id = oi.ticket_type_id
       JOIN events e ON e.id = tt.event_id
       WHERE oi.order_id = o.id
       ORDER BY oi.id LIMIT 1
     ) ev ON true
     WHERE o.user_id = $1 AND o.is_deleted = false ${statusFilter}
     ORDER BY o.created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params,
  );
  return rows;
}

export async function countUserOrders(userId: number, status?: string) {
  const params: unknown[] = [userId];
  let statusFilter = '';
  if (status) {
    params.push(status);
    statusFilter = `AND status = $${params.length}`;
  }
  const { rows } = await query(
    `SELECT count(*)::int AS total FROM orders
     WHERE user_id = $1 AND is_deleted = false ${statusFilter}`,
    params,
  );
  return rows[0].total as number;
}

export async function getUserOrderDetail(userId: number, code: string) {
  const { rows } = await query(
    `SELECT * FROM orders WHERE order_code = $1 AND user_id = $2 AND is_deleted = false`,
    [code, userId],
  );
  const order = rows[0];
  if (!order) return null;

  const { rows: items } = await query(
    `SELECT oi.id, oi.ticket_type_name, oi.attendee_name, oi.attendee_dob,
            tk.qr_token, tk.checked_in_at,
            e.name AS event_name, e.slug AS event_slug,
            e.starts_at AS event_starts_at, e.location AS event_location
     FROM order_items oi
     LEFT JOIN tickets tk ON tk.order_item_id = oi.id
     JOIN ticket_types tt ON tt.id = oi.ticket_type_id
     JOIN events e ON e.id = tt.event_id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [order.id],
  );
  return { order, items };
}