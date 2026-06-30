import { randomBytes, randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { PaymentMethod } from '@konnit/types';
import { AppError } from '../../middleware/errorHandler';
import { withTransaction } from '../../config/db';
import { env } from '../../config/env';
import { availableSlots, currentPrice, evaluateVoucher, type TicketTypeRow } from '../commerce/pricing';
import { invalidatePublicTicketCache } from '../tickets/tickets.service';

interface CreateOrderInput {
  contact: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    guardianName?: string;
    guardianPhone?: string;
  };
  children: Array<{
    ticketTypeId: number;
    attendeeName: string;
    attendeeDob?: string;
    attendeeGender?: string;
    shirtSize?: string;
    medalName?: string;
    healthNotes?: string;
  }>;
  userId?: number | null;
  voucherCode?: string;
  agreedTerms: boolean;
  paymentMethod?: PaymentMethod;
}

const VOUCHER_MESSAGES: Record<string, string> = {
  NOT_FOUND: 'Mã giảm giá không tồn tại',
  INACTIVE: 'Mã giảm giá đã bị vô hiệu hóa',
  NOT_STARTED: 'Mã giảm giá chưa có hiệu lực',
  EXPIRED: 'Mã giảm giá đã hết hạn',
  EXHAUSTED: 'Mã giảm giá đã hết lượt sử dụng',
  MIN_ORDER: 'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã',
};

function generateOrderCode() {
  return `KNT${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;
}

function generateTicketToken() {
  return randomBytes(15).toString('base64url'); // 20 ký tự, ~120-bit, unguessable
}

function groupQuantities(children: CreateOrderInput['children']) {
  const counts = new Map<number, number>();
  children.forEach((child) => {
    counts.set(child.ticketTypeId, (counts.get(child.ticketTypeId) ?? 0) + 1);
  });
  return counts;
}

async function expireHeldOrders(client: PoolClient) {
  const result = await client.query(`
    WITH expired AS (
      UPDATE orders
      SET status = 'expired', updated_at = now()
      WHERE status = 'pending'
        AND hold_expires_at IS NOT NULL
        AND hold_expires_at < now()
      RETURNING id
    ),
    counts AS (
      SELECT oi.ticket_type_id, count(*)::int AS qty
      FROM order_items oi
      JOIN expired e ON e.id = oi.order_id
      GROUP BY oi.ticket_type_id
    )
    UPDATE ticket_types tt
    SET reserved_count = greatest(tt.reserved_count - counts.qty, 0),
        updated_at = now()
    FROM counts
    WHERE tt.id = counts.ticket_type_id
  `);
  return (result.rowCount ?? 0) > 0;
}

async function lockPublicTicketTypes(client: PoolClient, ids: number[]) {
  const { rows } = await client.query(
    `SELECT t.*, e.name AS event_name
     FROM ticket_types t
     JOIN events e ON e.id = t.event_id
     WHERE t.id = ANY($1::int[])
       AND t.is_deleted = false
       AND t.status = 'published'
       AND e.is_deleted = false
       AND e.status = 'published'
     ORDER BY t.id
     FOR UPDATE OF t`,
    [ids],
  );
  return rows as Array<TicketTypeRow & { id: number; name: string }>;
}

async function validateVoucherForOrder(
  client: PoolClient,
  code: string | undefined,
  subtotal: number,
) {
  if (!code) return { voucher: null, discountAmount: 0 };

  const { rows } = await client.query(
    `SELECT * FROM vouchers
     WHERE upper(code) = upper($1) AND is_deleted = false
     FOR UPDATE`,
    [code],
  );
  const voucher = rows[0] ?? null;
  const result = evaluateVoucher(voucher, subtotal);
  if (!result.ok) {
    throw new AppError(
      400,
      'VOUCHER_INVALID',
      VOUCHER_MESSAGES[result.reason ?? 'NOT_FOUND'] ?? 'Mã không hợp lệ',
    );
  }
  return { voucher, discountAmount: result.discountAmount };
}

async function findOrderById(client: PoolClient, orderId: number) {
  const { rows } = await client.query(
    `SELECT o.*,
            p.gateway AS payment_method
     FROM orders o
     LEFT JOIN LATERAL (
       SELECT gateway
       FROM payments
       WHERE order_id = o.id
       ORDER BY created_at DESC, id DESC
       LIMIT 1
     ) p ON true
     WHERE o.id = $1 AND o.is_deleted = false`,
    [orderId],
  );
  const order = rows[0];
  if (!order) return null;

  const { rows: items } = await client.query(
    `SELECT oi.id,
            oi.ticket_type_id,
            oi.ticket_type_name AS ticket_name,
            oi.unit_price,
            oi.attendee_name,
            oi.attendee_dob,
            oi.attendee_gender,
            oi.shirt_size,
            oi.medal_name,
            oi.health_notes,
            tk.qr_token,
            tk.checked_in_at,
            tk.revoked_at
     FROM order_items oi
     LEFT JOIN tickets tk ON tk.order_item_id = oi.id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [orderId],
  );

  return {
    order_code: order.order_code,
    status: order.status,
    subtotal: Number(order.subtotal),
    discount_amount: Number(order.discount_amount),
    total: Number(order.total),
    contact_name: order.contact_name,
    contact_phone: order.contact_phone,
    contact_email: order.contact_email,
    voucher_code: order.voucher_code ?? undefined,
    payment_method: order.payment_method ?? undefined,
    items: items.map((item) => ({
      ...item,
      unit_price: Number(item.unit_price),
      attendee_dob: item.attendee_dob
        ? new Date(item.attendee_dob).toISOString().slice(0, 10)
        : '',
      qr_token: item.qr_token ?? undefined,
    })),
    created_at: order.created_at,
  };
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.agreedTerms) {
    throw new AppError(400, 'TERMS_REQUIRED', 'Vui lòng đồng ý điều khoản');
  }
  if (!input.contact?.name || !input.contact.phone || !input.contact.email) {
    throw new AppError(400, 'CONTACT_REQUIRED', 'Vui lòng nhập đủ thông tin liên hệ');
  }
  if (!input.children?.length) {
    throw new AppError(400, 'EMPTY_ORDER', 'Đơn hàng chưa có vé');
  }
  if (input.children.some((child) => !child.ticketTypeId || !child.attendeeName)) {
    throw new AppError(400, 'ATTENDEE_REQUIRED', 'Vui lòng nhập đủ thông tin người tham gia');
  }

  return withTransaction(async (client) => {
    if (await expireHeldOrders(client)) {
      await invalidatePublicTicketCache();
    }

    const quantities = groupQuantities(input.children);
    const ids = [...quantities.keys()].sort((a, b) => a - b);
    const ticketRows = await lockPublicTicketTypes(client, ids);
    const ticketMap = new Map(ticketRows.map((ticket) => [ticket.id, ticket]));

    if (ticketRows.length !== ids.length) {
      throw new AppError(400, 'TICKET_INVALID', 'Một hoặc nhiều loại vé không hợp lệ');
    }

    for (const id of ids) {
      const ticket = ticketMap.get(id)!;
      const qty = quantities.get(id)!;
      if (availableSlots(ticket) < qty) {
        throw new AppError(409, 'TICKET_SOLD_OUT', `Vé "${ticket.name}" không đủ số lượng`);
      }
    }

    const subtotal = input.children.reduce((sum, child) => {
      const ticket = ticketMap.get(child.ticketTypeId)!;
      return sum + currentPrice(ticket);
    }, 0);
    const { voucher, discountAmount } = await validateVoucherForOrder(
      client,
      input.voucherCode,
      subtotal,
    );
    const total = Math.max(0, subtotal - discountAmount);
    const orderCode = generateOrderCode();
    const holdMinutes = env.ORDER_HOLD_MINUTES;

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (
        order_code, status, contact_name, contact_phone, contact_email, contact_address,
        guardian_name, guardian_phone, subtotal, discount_amount, total,
        voucher_id, voucher_code, agreed_terms, hold_expires_at, user_id
      )
      VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true,
              now() + ($13::text || ' minutes')::interval, $14)
      RETURNING *`,
      [
        orderCode,
        input.contact.name,
        input.contact.phone,
        input.contact.email,
        input.contact.address ?? null,
        input.contact.guardianName ?? null,
        input.contact.guardianPhone ?? null,
        subtotal,
        discountAmount,
        total,
        voucher?.id ?? null,
        voucher?.code ?? input.voucherCode ?? null,
        holdMinutes,
        input.userId ?? null,   // ← thêm dòng này
      ],
    );
    const order = orderRows[0];

    for (const [ticketTypeId, qty] of quantities) {
      await client.query(
        `UPDATE ticket_types
         SET reserved_count = reserved_count + $2, updated_at = now()
         WHERE id = $1`,
        [ticketTypeId, qty],
      );
    }

    for (const child of input.children) {
      const ticket = ticketMap.get(child.ticketTypeId)!;
      await client.query(
        `INSERT INTO order_items (
          order_id, ticket_type_id, ticket_type_name, unit_price,
          attendee_name, attendee_dob, attendee_gender, shirt_size, medal_name, health_notes
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          order.id,
          child.ticketTypeId,
          ticket.name,
          currentPrice(ticket),
          child.attendeeName,
          child.attendeeDob || null,
          child.attendeeGender || null,
          child.shirtSize || null,
          child.medalName || null,
          child.healthNotes || null,
        ],
      );
    }

    await invalidatePublicTicketCache();
    return findOrderById(client, order.id);
  });
}

export async function getOrderByCode(code: string, email?: string) {
  return withTransaction(async (client) => {
    if (await expireHeldOrders(client)) {
      await invalidatePublicTicketCache();
    }
    const { rows } = await client.query(
      `SELECT id FROM orders
       WHERE order_code = $1
         AND is_deleted = false
         AND ($2::text IS NULL OR lower(contact_email) = lower($2))`,
      [code, email ?? null],
    );
    if (!rows[0]) return null;
    return findOrderById(client, rows[0].id);
  });
}

export async function payOrder(code: string, method: PaymentMethod) {
  return withTransaction(async (client) => {
    if (await expireHeldOrders(client)) {
      await invalidatePublicTicketCache();
    }

    const { rows: orderRows } = await client.query(
      `SELECT * FROM orders WHERE order_code = $1 AND is_deleted = false FOR UPDATE`,
      [code],
    );
    const order = orderRows[0];
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại');

    if (order.status === 'paid') {
      return { status: 'paid', order: await findOrderById(client, order.id) };
    }
    if (order.status !== 'pending') {
      throw new AppError(409, 'ORDER_NOT_PAYABLE', 'Đơn hàng không thể thanh toán');
    }
    if (order.hold_expires_at && new Date(order.hold_expires_at).getTime() < Date.now()) {
      if (await expireHeldOrders(client)) {
        await invalidatePublicTicketCache();
      }
      throw new AppError(409, 'ORDER_EXPIRED', 'Đơn hàng đã hết thời gian giữ vé');
    }

    const { rows: counts } = await client.query(
      `SELECT ticket_type_id, count(*)::int AS qty
       FROM order_items
       WHERE order_id = $1
       GROUP BY ticket_type_id
       ORDER BY ticket_type_id`,
      [order.id],
    );
    const ids = counts.map((row) => row.ticket_type_id);
    const ticketRows = await lockPublicTicketTypes(client, ids);
    const ticketMap = new Map(ticketRows.map((ticket) => [ticket.id, ticket]));
    if (ticketRows.length !== ids.length) {
      throw new AppError(409, 'TICKET_INVALID', 'Vé trong đơn không còn hợp lệ');
    }

    for (const row of counts) {
      const ticket = ticketMap.get(row.ticket_type_id)!;
      if (Number(ticket.reserved_count) < Number(row.qty)) {
        throw new AppError(409, 'TICKET_HOLD_INVALID', `Số lượng giữ chỗ của "${ticket.name}" không hợp lệ`);
      }
    }

    const subtotal = Number(order.subtotal);
    const { voucher, discountAmount } = await validateVoucherForOrder(
      client,
      order.voucher_code ?? undefined,
      subtotal,
    );
    const total = Math.max(0, subtotal - discountAmount);

    for (const row of counts) {
      await client.query(
        `UPDATE ticket_types
         SET reserved_count = reserved_count - $2,
             sold_count = sold_count + $2,
             updated_at = now()
         WHERE id = $1 AND reserved_count >= $2`,
        [row.ticket_type_id, row.qty],
      );
    }

    if (voucher) {
      await client.query(
        `UPDATE vouchers
         SET used_count = used_count + 1, updated_at = now()
         WHERE id = $1`,
        [voucher.id],
      );
      await client.query(
        `INSERT INTO voucher_redemptions (voucher_id, order_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [voucher.id, order.id],
      );
    }

    await client.query(
      `INSERT INTO payments (order_id, gateway, amount, status, transaction_ref, response_code)
       VALUES ($1, $2, $3, 'success', $4, '00')`,
      [order.id, method, total, `DEV-${randomUUID()}`],
    );

    await client.query(
      `UPDATE orders
       SET status = 'paid',
           discount_amount = $2,
           total = $3,
           voucher_id = $4,
           voucher_code = $5,
           paid_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [order.id, discountAmount, total, voucher?.id ?? null, voucher?.code ?? null],
    );

    const { rows: orderItems } = await client.query(
      `SELECT id FROM order_items WHERE order_id = $1 ORDER BY id`,
      [order.id],
    );
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO tickets (order_item_id, qr_token)
         VALUES ($1, $2)
         ON CONFLICT (order_item_id) DO NOTHING`,
        [item.id, generateTicketToken()],
      );
    }

    await invalidatePublicTicketCache();
    return { status: 'paid', order: await findOrderById(client, order.id) };
  });
}

export async function listAdminOrders() {
  return withTransaction(async (client) => {
    if (await expireHeldOrders(client)) {
      await invalidatePublicTicketCache();
    }
    const { rows } = await client.query(
      `SELECT id FROM orders WHERE is_deleted = false ORDER BY created_at DESC LIMIT 200`,
    );
    const orders = [];
    for (const row of rows) {
      const order = await findOrderById(client, row.id);
      if (order) orders.push(order);
    }
    return orders;
  });
}

/** Quét & huỷ đơn pending hết hạn giữ chỗ, nhả vé về kho. Trả true nếu có thay đổi. */
export async function releaseExpiredHolds() {
  return withTransaction(async (client) => {
    const changed = await expireHeldOrders(client);
    if (changed) await invalidatePublicTicketCache();
    return changed;
  });
}
