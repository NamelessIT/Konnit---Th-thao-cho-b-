import { withTransaction } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';

interface CheckinInput {
  eventId: number;
  qrToken: string;
  adminId: number;
  ip?: string;
  userAgent?: string;
}

export async function checkInTicket(input: CheckinInput) {
  return withTransaction(async (client) => {
    // Khoá đúng row vé → 2 request cùng token bị tuần tự hoá.
    const { rows } = await client.query(
      `SELECT tk.id, tk.checked_in_at, tk.checked_in_by,
              au.full_name AS checked_in_by_name,
              oi.attendee_name, oi.ticket_type_name,
              o.status AS order_status, o.order_code,
              e.id AS event_id, e.name AS event_name
       FROM tickets tk
       JOIN order_items oi ON oi.id = tk.order_item_id
       JOIN orders o ON o.id = oi.order_id
       JOIN ticket_types tt ON tt.id = oi.ticket_type_id
       JOIN events e ON e.id = tt.event_id
       LEFT JOIN admin_users au ON au.id = tk.checked_in_by
       WHERE tk.qr_token = $1
       FOR UPDATE OF tk`,
      [input.qrToken],
    );
    const t = rows[0];
    if (!t) throw new AppError(404, 'TICKET_NOT_FOUND', 'Vé không tồn tại');
    if (t.order_status !== 'paid') {
      throw new AppError(409, 'ORDER_NOT_PAID', 'Đơn của vé này chưa thanh toán');
    }
    if (Number(t.event_id) !== Number(input.eventId)) {
      throw new AppError(409, 'WRONG_EVENT', `Vé thuộc sự kiện khác: ${t.event_name}`);
    }
    if (t.checked_in_at) {
      const when = new Date(t.checked_in_at).toLocaleString('vi-VN');
      throw new AppError(
        409,
        'ALREADY_CHECKED_IN',
        `Vé đã check-in lúc ${when}${t.checked_in_by_name ? ' bởi ' + t.checked_in_by_name : ''}`,
        { checkedInAt: t.checked_in_at, attendeeName: t.attendee_name },
      );
    }

    await client.query(
      `UPDATE tickets SET checked_in_at = now(), checked_in_by = $2 WHERE id = $1`,
      [t.id, input.adminId],
    );
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, after_json, ip_address, user_agent)
       VALUES ($1, 'ticket.checkin', 'tickets', $2, $3, $4, $5)`,
      [
        input.adminId,
        t.id,
        JSON.stringify({ order_code: t.order_code, attendee: t.attendee_name, event: t.event_name }),
        input.ip ?? null,
        input.userAgent ?? null,
      ],
    );

    return {
      ticket_id: t.id,
      attendee_name: t.attendee_name,
      ticket_name: t.ticket_type_name,
      event_name: t.event_name,
      order_code: t.order_code,
      checked_in_at: new Date().toISOString(),
    };
  });
}