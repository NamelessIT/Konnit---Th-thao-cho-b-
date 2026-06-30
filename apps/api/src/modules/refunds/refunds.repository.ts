import type { PoolClient } from 'pg';

export interface OrderRow {
  id: number;
  order_code: string;
  status: string;
  user_id: number | null;
  voucher_id: number | null;
}

export interface RefundRow {
  id: number;
  order_id: number;
  status: string;
  requested_by_type: 'user' | 'admin';
  requested_by_user_id: number | null;
  requested_by_admin_id: number | null;
  reason: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  inventory_released_at: string | null;
  refunded_by: number | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Khoá order theo code (lock order TRƯỚC ticket để đồng nhất thứ tự lock, tránh deadlock). */
export async function lockOrderByCode(client: PoolClient, code: string): Promise<OrderRow | null> {
  const { rows } = await client.query(
    `SELECT id, order_code, status, user_id, voucher_id
     FROM orders WHERE order_code = $1 AND is_deleted = false FOR UPDATE`,
    [code],
  );
  return (rows[0] as OrderRow) ?? null;
}

/** Refund đang hoạt động (requested|refunding) của order, đã khoá row. */
export async function lockActiveRefund(client: PoolClient, orderId: number): Promise<RefundRow | null> {
  const { rows } = await client.query(
    `SELECT * FROM order_refunds
     WHERE order_id = $1 AND status IN ('requested','refunding')
     ORDER BY id DESC LIMIT 1 FOR UPDATE`,
    [orderId],
  );
  return (rows[0] as RefundRow) ?? null;
}

/** Refund mới nhất (mọi trạng thái) — để hiển thị. */
export async function latestRefund(client: PoolClient, orderId: number): Promise<RefundRow | null> {
  const { rows } = await client.query(
    `SELECT * FROM order_refunds WHERE order_id = $1 ORDER BY id DESC LIMIT 1`,
    [orderId],
  );
  return (rows[0] as RefundRow) ?? null;
}

/** Khoá tickets của order (sau khi đã khoá order) + trạng thái check-in/revoke. */
export async function lockOrderTickets(client: PoolClient, orderId: number) {
  const { rows } = await client.query(
    `SELECT tk.id, tk.checked_in_at, tk.revoked_at
     FROM tickets tk
     JOIN order_items oi ON oi.id = tk.order_item_id
     WHERE oi.order_id = $1
     ORDER BY tk.id
     FOR UPDATE OF tk`,
    [orderId],
  );
  return rows as { id: number; checked_in_at: string | null; revoked_at: string | null }[];
}

export async function ticketTypeCounts(client: PoolClient, orderId: number) {
  const { rows } = await client.query(
    `SELECT ticket_type_id, count(*)::int AS qty
     FROM order_items WHERE order_id = $1
     GROUP BY ticket_type_id ORDER BY ticket_type_id`,
    [orderId],
  );
  return rows as { ticket_type_id: number; qty: number }[];
}

export async function insertRefund(
  client: PoolClient,
  data: {
    orderId: number;
    status: 'requested';
    requestedByType: 'user' | 'admin';
    requestedByUserId?: number | null;
    requestedByAdminId?: number | null;
    reason?: string | null;
    reviewedBy?: number | null;
  },
): Promise<RefundRow> {
  const { rows } = await client.query(
    `INSERT INTO order_refunds
       (order_id, status, requested_by_type, requested_by_user_id, requested_by_admin_id,
        reason, reviewed_by, reviewed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, ${data.reviewedBy ? 'now()' : 'NULL'})
     RETURNING *`,
    [
      data.orderId,
      data.status,
      data.requestedByType,
      data.requestedByUserId ?? null,
      data.requestedByAdminId ?? null,
      data.reason ?? null,
      data.reviewedBy ?? null,
    ],
  );
  return rows[0] as RefundRow;
}

export async function setOrderStatus(client: PoolClient, orderId: number, status: string) {
  await client.query(`UPDATE orders SET status = $2, updated_at = now() WHERE id = $1`, [orderId, status]);
}

export async function writeAudit(
  client: PoolClient,
  data: {
    actorAdminId: number | null;
    action: string;
    orderId: number;
    before: unknown;
    after: unknown;
  },
) {
  await client.query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, before_json, after_json)
     VALUES ($1, $2, 'order', $3, $4::jsonb, $5::jsonb)`,
    [data.actorAdminId, data.action, data.orderId, JSON.stringify(data.before), JSON.stringify(data.after)],
  );
}
