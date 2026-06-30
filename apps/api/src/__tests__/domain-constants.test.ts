import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS_VI,
  PAYMENT_STATUS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS_VI,
  VOUCHER_STATUSES,
  VOUCHER_STATUS_LABELS_VI,
  TICKET_USAGE_STATUSES,
  TICKET_USAGE_STATUS_LABELS_VI,
  REFUND_STATUSES,
  REFUND_STATUS_LABELS_VI,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS_VI,
  ACCOUNT_STATUSES,
  ACCOUNT_STATUS_LABELS_VI,
  DISCOUNT_TYPES,
  DISCOUNT_TYPE_LABELS_VI,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS_VI,
  GENDER_RESTRICTIONS,
  GENDER_RESTRICTION_LABELS_VI,
  ACCESS_PERMISSIONS,
  SYSTEM_ROLES,
  ROLE_PERMISSIONS,
  ROLE_RANK,
} from '@konnit/types';

/**
 * Bảo đảm các domain constant dùng chung luôn nhất quán nội bộ.
 * (SQL CHECK parity với ORDER_STATUSES được thêm ở Bước 2 — migration refund.)
 */
describe('domain constants self-consistency', () => {
  const labelParity = (statuses: readonly string[], labels: Record<string, string>) => {
    // mỗi status có label, và không có label thừa
    for (const s of statuses) expect(labels[s], `thiếu label cho "${s}"`).toBeTruthy();
    expect(Object.keys(labels).sort()).toEqual([...statuses].sort());
  };

  it('order: object values khớp tuple + đủ label', () => {
    expect(Object.values(ORDER_STATUS).sort()).toEqual([...ORDER_STATUSES].sort());
    labelParity(ORDER_STATUSES, ORDER_STATUS_LABELS_VI);
  });

  it('payment: object values khớp tuple + đủ label', () => {
    expect(Object.values(PAYMENT_STATUS).sort()).toEqual([...PAYMENT_STATUSES].sort());
    labelParity(PAYMENT_STATUSES, PAYMENT_STATUS_LABELS_VI);
  });

  it('voucher / ticket usage / refund / content / account: đủ label', () => {
    labelParity(VOUCHER_STATUSES, VOUCHER_STATUS_LABELS_VI);
    labelParity(TICKET_USAGE_STATUSES, TICKET_USAGE_STATUS_LABELS_VI);
    labelParity(REFUND_STATUSES, REFUND_STATUS_LABELS_VI);
    labelParity(CONTENT_STATUSES, CONTENT_STATUS_LABELS_VI);
    labelParity(ACCOUNT_STATUSES, ACCOUNT_STATUS_LABELS_VI);
  });

  it('discount / payment method / gender restriction: đủ label', () => {
    labelParity(DISCOUNT_TYPES, DISCOUNT_TYPE_LABELS_VI);
    labelParity(PAYMENT_METHODS, PAYMENT_METHOD_LABELS_VI);
    labelParity(GENDER_RESTRICTIONS, GENDER_RESTRICTION_LABELS_VI);
  });

  it('refund permissions tồn tại trong catalog', () => {
    const keys = ACCESS_PERMISSIONS.map(([k]) => k);
    expect(keys).toContain('orders.request_refund');
    expect(keys).toContain('orders.manage_refunds');
  });

  it('ROLE_PERMISSIONS chỉ tham chiếu permission key hợp lệ', () => {
    const valid = new Set<string>(ACCESS_PERMISSIONS.map(([k]) => k));
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      for (const p of perms) {
        expect(valid.has(p), `role "${role}" tham chiếu permission lạ "${p}"`).toBe(true);
      }
    }
  });

  it('mỗi SYSTEM_ROLE có ROLE_PERMISSIONS; super_admin & admin có manage_refunds; customer có request_refund', () => {
    for (const [key] of SYSTEM_ROLES) {
      expect(ROLE_PERMISSIONS[key], `thiếu ROLE_PERMISSIONS cho "${key}"`).toBeDefined();
    }
    expect(ROLE_PERMISSIONS.super_admin).toContain('orders.manage_refunds');
    expect(ROLE_PERMISSIONS.admin).toContain('orders.manage_refunds');
    expect(ROLE_PERMISSIONS.customer).toContain('orders.request_refund');
  });

  it('ROLE_RANK có rank cho mọi system role realm admin', () => {
    for (const [key, , realm] of SYSTEM_ROLES) {
      if (realm === 'admin') {
        expect(ROLE_RANK[key], `thiếu rank cho "${key}"`).toBeGreaterThan(0);
      }
    }
    // super_admin phải cao nhất
    expect(ROLE_RANK.super_admin).toBeGreaterThan(ROLE_RANK.admin);
  });
});
