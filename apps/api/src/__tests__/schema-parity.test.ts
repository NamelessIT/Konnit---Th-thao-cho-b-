import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ORDER_STATUSES, REFUND_STATUSES } from '@konnit/types';

/**
 * SQL không import TypeScript được → test này bắt lệch giữa CHECK constraint và shared constants.
 */
const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
const migration = fs.readFileSync(
  path.join(__dirname, '../db/migrations/002_order_refund_workflow.sql'),
  'utf8',
);

function parseInList(sql: string, regex: RegExp): Set<string> {
  const m = sql.match(regex);
  if (!m) throw new Error('Không tìm thấy CHECK constraint mong đợi');
  return new Set(m[1].split(',').map((s) => s.trim().replace(/'/g, '')));
}

describe('SQL constraint parity', () => {
  it('orders.status CHECK trong schema.sql khớp ORDER_STATUSES', () => {
    // CHECK chứa 'pending' chính là của orders
    const all = [...schema.matchAll(/CHECK \(status IN \(([^)]*)\)\)/g)];
    const orders = all.find((m) => m[1].includes("'pending'"));
    expect(orders, 'không tìm thấy orders.status CHECK').toBeTruthy();
    const values = new Set(orders![1].split(',').map((s) => s.trim().replace(/'/g, '')));
    expect(values).toEqual(new Set(ORDER_STATUSES));
  });

  it('migration 002 ADD CONSTRAINT khớp ORDER_STATUSES', () => {
    const values = parseInList(
      migration,
      /ADD CONSTRAINT orders_status_check\s*\n?\s*CHECK \(status IN \(([^)]*)\)\)/,
    );
    expect(values).toEqual(new Set(ORDER_STATUSES));
  });

  it('order_refunds.status CHECK khớp REFUND_STATUSES', () => {
    const values = parseInList(schema, /order_refunds[\s\S]*?status\s+TEXT NOT NULL CHECK \(status IN \(([^)]*)\)\)/);
    expect(values).toEqual(new Set(REFUND_STATUSES));
  });
});
