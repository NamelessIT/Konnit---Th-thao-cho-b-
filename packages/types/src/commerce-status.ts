// ===== Order status (trạng thái tổng hợp hiển thị của đơn) =====
export const ORDER_STATUSES = [
  'pending', 'paid', 'refund_requested', 'refunding', 'refunded', 'expired', 'failed',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUND_REQUESTED: 'refund_requested',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
  FAILED: 'failed',
} as const satisfies Record<string, OrderStatus>;
export const ORDER_STATUS_LABELS_VI: Record<OrderStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  refund_requested: 'Đang chờ xác nhận',
  refunding: 'Đang hoàn tiền',
  refunded: 'Đã hoàn tiền',
  expired: 'Hết hạn giữ chỗ',
  failed: 'Thất bại',
};

// ===== Payment status (bảng payments) =====
export const PAYMENT_STATUSES = ['initiated', 'success', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const PAYMENT_STATUS = {
  INITIATED: 'initiated',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const satisfies Record<string, PaymentStatus>;
export const PAYMENT_STATUS_LABELS_VI: Record<PaymentStatus, string> = {
  initiated: 'Đang xử lý',
  success: 'Thành công',
  failed: 'Thất bại',
};

// ===== Voucher status =====
export const VOUCHER_STATUSES = ['active', 'disabled'] as const;
export type VoucherStatus = (typeof VOUCHER_STATUSES)[number];
export const VOUCHER_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const satisfies Record<string, VoucherStatus>;
export const VOUCHER_STATUS_LABELS_VI: Record<VoucherStatus, string> = {
  active: 'Đang hoạt động',
  disabled: 'Đã tắt',
};

// ===== Ticket usage (suy ra từ tickets.checked_in_at / revoked_at) =====
export const TICKET_USAGE_STATUSES = ['valid', 'used', 'revoked'] as const;
export type TicketUsageStatus = (typeof TICKET_USAGE_STATUSES)[number];
export const TICKET_USAGE_STATUS = {
  VALID: 'valid',
  USED: 'used',
  REVOKED: 'revoked',
} as const satisfies Record<string, TicketUsageStatus>;
export const TICKET_USAGE_STATUS_LABELS_VI: Record<TicketUsageStatus, string> = {
  valid: 'Còn hiệu lực',
  used: 'Đã sử dụng',
  revoked: 'Đã thu hồi',
};

// ===== Refund status (lịch sử từng yêu cầu trong order_refunds) =====
export const REFUND_STATUSES = ['requested', 'rejected', 'refunding', 'refunded'] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];
export const REFUND_STATUS = {
  REQUESTED: 'requested',
  REJECTED: 'rejected',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded',
} as const satisfies Record<string, RefundStatus>;
export const REFUND_STATUS_LABELS_VI: Record<RefundStatus, string> = {
  requested: 'Chờ xác nhận',
  rejected: 'Bị từ chối',
  refunding: 'Đang hoàn tiền',
  refunded: 'Đã hoàn tiền',
};

// ===== Voucher discount type =====
export const DISCOUNT_TYPES = ['percent', 'fixed'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];
export const DISCOUNT_TYPE = {
  PERCENT: 'percent',
  FIXED: 'fixed',
} as const satisfies Record<string, DiscountType>;
export const DISCOUNT_TYPE_LABELS_VI: Record<DiscountType, string> = {
  percent: 'Phần trăm (%)',
  fixed: 'Số tiền cố định',
};

// ===== Checkout payment method =====
export const PAYMENT_METHODS = ['card', 'qr', 'bank'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD = {
  CARD: 'card',
  QR: 'qr',
  BANK: 'bank',
} as const satisfies Record<string, PaymentMethod>;
export const PAYMENT_METHOD_LABELS_VI: Record<PaymentMethod, string> = {
  card: 'Thẻ',
  qr: 'QR',
  bank: 'Chuyển khoản',
};

// ===== Ticket attendee gender restriction =====
export const GENDER_RESTRICTIONS = ['any', 'male', 'female'] as const;
export type GenderRestriction = (typeof GENDER_RESTRICTIONS)[number];
export const GENDER_RESTRICTION = {
  ANY: 'any',
  MALE: 'male',
  FEMALE: 'female',
} as const satisfies Record<string, GenderRestriction>;
export const GENDER_RESTRICTION_LABELS_VI: Record<GenderRestriction, string> = {
  any: 'Tất cả',
  male: 'Nam',
  female: 'Nữ',
};
