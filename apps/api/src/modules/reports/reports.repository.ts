import { query } from '../../config/db';

// Tổng vé đã phát (đơn paid) + đã check-in + doanh số (gross theo unit_price)
export async function ticketStats(eventId: number | null) {
  const { rows } = await query(
    `SELECT
        count(*)::int                       AS tickets_total,
        count(t.checked_in_at)::int         AS tickets_checked_in,
        COALESCE(sum(oi.unit_price), 0)::bigint AS gross_revenue
     FROM tickets t
     JOIN order_items oi ON oi.id = t.order_item_id
     JOIN ticket_types tt ON tt.id = oi.ticket_type_id
     WHERE ($1::int IS NULL OR tt.event_id = $1)`,
    [eventId],
  );
  return rows[0] as { tickets_total: number; tickets_checked_in: number; gross_revenue: string };
}

// Số đơn theo trạng thái (lọc theo event qua order_items)
export async function orderStatusCounts(eventId: number | null) {
  const { rows } = await query(
    `SELECT o.status, count(DISTINCT o.id)::int AS n
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN ticket_types tt ON tt.id = oi.ticket_type_id
     WHERE o.is_deleted = false
       AND ($1::int IS NULL OR tt.event_id = $1)
     GROUP BY o.status`,
    [eventId],
  );
  return rows as { status: string; n: number }[];
}

// Bóc tách theo từng loại vé
export async function ticketTypeBreakdown(eventId: number | null) {
  const { rows } = await query(
    `SELECT tt.id, tt.name, tt.quota_total, tt.sold_count,
            count(t.id)::int            AS tickets_generated,
            count(t.checked_in_at)::int AS checked_in
     FROM ticket_types tt
     LEFT JOIN order_items oi ON oi.ticket_type_id = tt.id
     LEFT JOIN tickets t ON t.order_item_id = oi.id
     WHERE tt.is_deleted = false
       AND ($1::int IS NULL OR tt.event_id = $1)
     GROUP BY tt.id
     ORDER BY tt.sort_order, tt.id`,
    [eventId],
  );
  return rows;
}

// Danh sách vé từng bé + trạng thái check-in
export async function checkinList(eventId: number | null) {
  const { rows } = await query(
    `SELECT t.id, t.qr_token, t.checked_in_at,
            au.full_name        AS checked_in_by_name,
            oi.attendee_name,
            oi.ticket_type_name,
            o.order_code,
            o.contact_name,
            tt.event_id
     FROM tickets t
     JOIN order_items oi ON oi.id = t.order_item_id
     JOIN orders o ON o.id = oi.order_id
     JOIN ticket_types tt ON tt.id = oi.ticket_type_id
     LEFT JOIN admin_users au ON au.id = t.checked_in_by
     WHERE ($1::int IS NULL OR tt.event_id = $1)
     ORDER BY t.checked_in_at DESC NULLS LAST, oi.attendee_name`,
    [eventId],
  );
  return rows;
}