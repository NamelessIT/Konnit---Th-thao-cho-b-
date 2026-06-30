import * as repo from './user-orders.repository';

export async function list(
  userId: number,
  opts: { page?: number; limit?: number; status?: string },
) {
  const limit = Math.min(Math.max(opts.limit ?? 10, 1), 50);
  const page = Math.max(opts.page ?? 1, 1);
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    repo.listUserOrders(userId, { limit, offset, status: opts.status }),
    repo.countUserOrders(userId, opts.status),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    orders: rows.map((o) => ({
      order_code: o.order_code,
      status: o.status,
      total: Number(o.total),
      created_at: o.created_at,
      paid_at: o.paid_at,
      item_count: o.item_count,
      event_name: o.event_name ?? null,
      event_slug: o.event_slug ?? null,
    })),
  };
}

export async function detail(userId: number, code: string) {
  const data = await repo.getUserOrderDetail(userId, code);
  if (!data) return null;
  const { order, items } = data;
  const first = items[0];

  return {
    order_code: order.order_code,
    status: order.status,
    subtotal: Number(order.subtotal),
    discount_amount: Number(order.discount_amount),
    total: Number(order.total),
    created_at: order.created_at,
    paid_at: order.paid_at,
    contact_name: order.contact_name,
    contact_email: order.contact_email,
    event: first
      ? {
          name: first.event_name,
          slug: first.event_slug,
          starts_at: first.event_starts_at,
          location: first.event_location,
        }
      : null,
    items: items.map((it) => ({
      id: it.id,
      ticket_name: it.ticket_type_name,
      attendee_name: it.attendee_name,
      attendee_dob: it.attendee_dob
        ? new Date(it.attendee_dob).toISOString().slice(0, 10)
        : null,
      qr_token: it.qr_token ?? null,
      is_used: !!it.checked_in_at,
      checked_in_at: it.checked_in_at ?? null,
    })),
  };
}