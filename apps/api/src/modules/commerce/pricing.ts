/**
 * Shared pricing & availability helpers for the ticketing flow.
 * pg returns NUMERIC columns as strings, so everything is coerced with Number().
 */

export interface TicketTypeRow {
  id: number;
  price: string | number;
  early_bird_price: string | number | null;
  early_bird_until: string | Date | null;
  quota_total: number;
  sold_count: number;
  reserved_count: number;
  [key: string]: unknown;
}

/** Current effective unit price for a ticket type (early-bird vs regular by now()). */
export function currentPrice(t: TicketTypeRow, at: Date = new Date()): number {
  const earlyActive =
    t.early_bird_price != null &&
    t.early_bird_until != null &&
    new Date(t.early_bird_until).getTime() > at.getTime();
  return Number(earlyActive ? t.early_bird_price : t.price);
}

/** Remaining buyable slots = quota - sold - reserved. */
export function availableSlots(t: TicketTypeRow): number {
  return Number(t.quota_total) - Number(t.sold_count) - Number(t.reserved_count);
}

/** Attach computed `current_price`, `is_early_bird`, `available` to a ticket row. */
export function enrichTicket(t: TicketTypeRow, at: Date = new Date()) {
  const price = currentPrice(t, at);
  return {
    ...t,
    price: Number(t.price),
    early_bird_price: t.early_bird_price == null ? null : Number(t.early_bird_price),
    current_price: price,
    is_early_bird: price !== Number(t.price),
    available: availableSlots(t),
  };
}

export interface VoucherRow {
  id: number;
  code: string;
  discount_type: DiscountType;
  discount_value: string | number;
  min_order_amount: string | number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | Date | null;
  expires_at: string | Date | null;
  status: string;
}

export interface VoucherCheck {
  ok: boolean;
  reason?: string;
  discountAmount: number;
}

/**
 * Validate a voucher against a subtotal and compute the discount (preview only — no redeem).
 * Rounds to whole VND.
 */
export function evaluateVoucher(
  v: VoucherRow | null,
  subtotal: number,
  at: Date = new Date(),
): VoucherCheck {
  if (!v) return { ok: false, reason: 'NOT_FOUND', discountAmount: 0 };
  if (v.status !== 'active') return { ok: false, reason: 'INACTIVE', discountAmount: 0 };
  if (v.starts_at && new Date(v.starts_at).getTime() > at.getTime())
    return { ok: false, reason: 'NOT_STARTED', discountAmount: 0 };
  if (v.expires_at && new Date(v.expires_at).getTime() < at.getTime())
    return { ok: false, reason: 'EXPIRED', discountAmount: 0 };
  if (v.max_uses != null && Number(v.used_count) >= Number(v.max_uses))
    return { ok: false, reason: 'EXHAUSTED', discountAmount: 0 };
  if (v.min_order_amount != null && subtotal < Number(v.min_order_amount))
    return { ok: false, reason: 'MIN_ORDER', discountAmount: 0 };

  let discount =
    v.discount_type === 'percent'
      ? Math.round((subtotal * Number(v.discount_value)) / 100)
      : Number(v.discount_value);
  discount = Math.max(0, Math.min(discount, subtotal));
  return { ok: true, discountAmount: discount };
}
import type { DiscountType } from '@konnit/types';
