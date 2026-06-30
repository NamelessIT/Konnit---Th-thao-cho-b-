import type { PoolClient } from 'pg';
import { withTransaction } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { invalidatePublicTicketCache } from '../tickets/tickets.service';
import * as repo from './refunds.repository';
import type { OrderRow, RefundRow } from './refunds.repository';

function view(order: OrderRow, refund: RefundRow | null) {
  return { order_code: order.order_code, status: order.status, refund };
}

/**
 * Đảo tài nguyên đơn paid (sold_count, tickets, voucher) trong CÙNG transaction.
 * Caller phải đã khoá order. Hàm tự khoá ticket_types (id tăng dần) + tickets.
 */
async function releasePaidOrderResources(
  client: PoolClient,
  order: OrderRow,
  refund: RefundRow,
  adminId: number,
) {
  const counts = await repo.ticketTypeCounts(client, order.id);

  // Khoá ticket_types theo id tăng dần (chống deadlock với checkout/checkin).
  const ids = counts.map((c) => c.ticket_type_id).sort((a, b) => a - b);
  if (ids.length) {
    await client.query(`SELECT id FROM ticket_types WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE`, [ids]);
  }

  // Khoá tickets + chặn nếu có vé đã check-in.
  const tickets = await repo.lockOrderTickets(client, order.id);
  if (tickets.some((t) => t.checked_in_at)) {
    throw new AppError(409, 'TICKET_ALREADY_USED', 'Có vé đã check-in, không thể hoàn');
  }

  // Giảm sold_count chặt chẽ — rowCount sai thì rollback (không che bằng greatest()).
  for (const c of counts) {
    const r = await client.query(
      `UPDATE ticket_types SET sold_count = sold_count - $2, updated_at = now()
       WHERE id = $1 AND sold_count >= $2`,
      [c.ticket_type_id, c.qty],
    );
    if (r.rowCount !== 1) {
      throw new AppError(409, 'INVENTORY_CONFLICT', 'Tồn kho không nhất quán khi hoàn vé');
    }
  }

  // Revoke vé (không xoá).
  await client.query(
    `UPDATE tickets SET revoked_at = now(), revoked_by = $2, revoke_reason = 'order refund'
     WHERE order_item_id IN (SELECT id FROM order_items WHERE order_id = $1)
       AND revoked_at IS NULL`,
    [order.id, adminId],
  );

  // Đảo voucher redemption nếu có và chưa reversed.
  if (order.voucher_id) {
    const { rows: red } = await client.query(
      `SELECT id FROM voucher_redemptions WHERE order_id = $1 AND reversed_at IS NULL FOR UPDATE`,
      [order.id],
    );
    if (red[0]) {
      await client.query(
        `UPDATE vouchers SET used_count = used_count - 1, updated_at = now() WHERE id = $1 AND used_count > 0`,
        [order.voucher_id],
      );
      await client.query(
        `UPDATE voucher_redemptions SET reversed_at = now(), reversed_by = $2, reverse_reason = 'order refund'
         WHERE id = $1`,
        [red[0].id, adminId],
      );
    }
  }

  await client.query(
    `UPDATE order_refunds SET status = 'refunding', inventory_released_at = now(), updated_at = now()
     WHERE id = $1`,
    [refund.id],
  );
  await repo.setOrderStatus(client, order.id, 'refunding');
  await repo.writeAudit(client, {
    actorAdminId: adminId,
    action: 'order.refund_started',
    orderId: order.id,
    before: { status: order.status },
    after: { status: 'refunding', refund_id: refund.id, counters_reversed: counts },
  });
}

// ===== User gửi yêu cầu =====
export async function requestRefund(code: string, userId: number, reason?: string) {
  const result = await withTransaction(async (client) => {
    const order = await repo.lockOrderByCode(client, code);
    if (!order || order.user_id !== userId) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại');
    }
    const active = await repo.lockActiveRefund(client, order.id);
    // Idempotent: đã có yêu cầu đang chờ.
    if (order.status === 'refund_requested' && active) return view(order, active);
    if (order.status !== 'paid') {
      throw new AppError(409, 'ORDER_NOT_REFUNDABLE', 'Chỉ đơn đã thanh toán mới yêu cầu hoàn được');
    }

    const tickets = await repo.lockOrderTickets(client, order.id);
    if (tickets.some((t) => t.checked_in_at)) {
      throw new AppError(409, 'TICKET_ALREADY_USED', 'Vé đã được check-in, không thể yêu cầu hoàn');
    }
    if (active) return view(order, active);

    const refund = await repo.insertRefund(client, {
      orderId: order.id,
      status: 'requested',
      requestedByType: 'user',
      requestedByUserId: userId,
      reason: reason ?? null,
    });
    await repo.setOrderStatus(client, order.id, 'refund_requested');
    await repo.writeAudit(client, {
      actorAdminId: null,
      action: 'order.refund_requested',
      orderId: order.id,
      before: { status: 'paid' },
      after: { status: 'refund_requested', refund_id: refund.id, by_user: userId },
    });
    return view({ ...order, status: 'refund_requested' }, refund);
  });
  return result;
}

// ===== Admin từ chối =====
export async function rejectRefund(code: string, adminId: number, reason: string) {
  return withTransaction(async (client) => {
    const order = await repo.lockOrderByCode(client, code);
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại');
    const active = await repo.lockActiveRefund(client, order.id);
    if (order.status !== 'refund_requested' || !active || active.status !== 'requested') {
      throw new AppError(409, 'NO_PENDING_REQUEST', 'Không có yêu cầu hoàn đang chờ duyệt');
    }
    await client.query(
      `UPDATE order_refunds SET status = 'rejected', reviewed_by = $2, reviewed_at = now(),
         rejection_reason = $3, updated_at = now() WHERE id = $1`,
      [active.id, adminId, reason],
    );
    await repo.setOrderStatus(client, order.id, 'paid');
    await repo.writeAudit(client, {
      actorAdminId: adminId,
      action: 'order.refund_rejected',
      orderId: order.id,
      before: { status: 'refund_requested' },
      after: { status: 'paid', refund_id: active.id, reason },
    });
    return view({ ...order, status: 'paid' }, { ...active, status: 'rejected' });
  });
}

// ===== Admin duyệt yêu cầu (refund_requested → refunding) =====
export async function approveRefund(code: string, adminId: number) {
  const result = await withTransaction(async (client) => {
    const order = await repo.lockOrderByCode(client, code);
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại');

    if (order.status === 'refunding') {
      // Idempotent với double-click.
      return view(order, await repo.lockActiveRefund(client, order.id));
    }
    const active = await repo.lockActiveRefund(client, order.id);
    if (order.status !== 'refund_requested' || !active || active.status !== 'requested') {
      throw new AppError(409, 'NO_PENDING_REQUEST', 'Không có yêu cầu hoàn đang chờ duyệt');
    }
    await client.query(
      `UPDATE order_refunds SET reviewed_by = $2, reviewed_at = now(), updated_at = now() WHERE id = $1`,
      [active.id, adminId],
    );
    await releasePaidOrderResources(client, order, active, adminId);
    return view({ ...order, status: 'refunding' }, await repo.lockActiveRefund(client, order.id));
  });
  await invalidatePublicTicketCache().catch(() => {});
  return result;
}

// ===== Admin chủ động hoàn đơn paid (paid → refunding) =====
export async function startRefund(code: string, adminId: number, reason?: string) {
  const result = await withTransaction(async (client) => {
    const order = await repo.lockOrderByCode(client, code);
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại');

    if (order.status === 'refunding') {
      return view(order, await repo.lockActiveRefund(client, order.id));
    }
    if (order.status !== 'paid') {
      throw new AppError(409, 'ORDER_NOT_REFUNDABLE', 'Chỉ đơn đã thanh toán mới hoàn được');
    }
    const existing = await repo.lockActiveRefund(client, order.id);
    if (existing) {
      throw new AppError(409, 'REFUND_IN_PROGRESS', 'Đơn đã có quy trình hoàn đang xử lý');
    }
    const refund = await repo.insertRefund(client, {
      orderId: order.id,
      status: 'requested',
      requestedByType: 'admin',
      requestedByAdminId: adminId,
      reason: reason ?? null,
      reviewedBy: adminId,
    });
    await releasePaidOrderResources(client, order, refund, adminId);
    return view({ ...order, status: 'refunding' }, await repo.lockActiveRefund(client, order.id));
  });
  await invalidatePublicTicketCache().catch(() => {});
  return result;
}

// ===== Admin xác nhận đã hoàn tiền (refunding → refunded) =====
export async function completeRefund(code: string, adminId: number) {
  return withTransaction(async (client) => {
    const order = await repo.lockOrderByCode(client, code);
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại');

    if (order.status === 'refunded') {
      return view(order, await repo.latestRefund(client, order.id));
    }
    const active = await repo.lockActiveRefund(client, order.id);
    if (order.status !== 'refunding' || !active || active.status !== 'refunding') {
      throw new AppError(409, 'NOT_REFUNDING', 'Đơn không ở trạng thái đang hoàn tiền');
    }
    await client.query(
      `UPDATE order_refunds SET status = 'refunded', refunded_by = $2, refunded_at = now(), updated_at = now()
       WHERE id = $1`,
      [active.id, adminId],
    );
    await repo.setOrderStatus(client, order.id, 'refunded');
    await repo.writeAudit(client, {
      actorAdminId: adminId,
      action: 'order.refund_completed',
      orderId: order.id,
      before: { status: 'refunding' },
      after: { status: 'refunded', refund_id: active.id },
    });
    return view({ ...order, status: 'refunded' }, { ...active, status: 'refunded' });
  });
}
