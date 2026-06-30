-- Phase 4 — Refund workflow
-- Đổi order status (bỏ 'cancelled', thêm refund_requested/refunding/refunded),
-- thêm bảng order_refunds, cột revoke cho tickets và reverse cho voucher_redemptions.
-- migrate.ts đã bọc mỗi file trong BEGIN/COMMIT.

-- ===== Order status constraint =====
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
UPDATE orders SET status = 'refunded' WHERE status = 'cancelled';
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','paid','refund_requested','refunding','refunded','expired','failed'));

CREATE INDEX IF NOT EXISTS idx_orders_status_updated ON orders(status, updated_at DESC);

-- ===== Bảng order_refunds (mỗi quy trình hoàn tiền = 1 row, không ghi đè lịch sử) =====
CREATE TABLE IF NOT EXISTS order_refunds (
  id                    SERIAL PRIMARY KEY,
  order_id              INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status                TEXT NOT NULL CHECK (status IN ('requested','rejected','refunding','refunded')),
  requested_by_type     TEXT NOT NULL CHECK (requested_by_type IN ('user','admin')),
  requested_by_user_id  INT REFERENCES users(id) ON DELETE SET NULL,
  requested_by_admin_id INT REFERENCES admin_users(id) ON DELETE SET NULL,
  reason                TEXT,
  reviewed_by           INT REFERENCES admin_users(id),
  reviewed_at           TIMESTAMPTZ,
  rejection_reason      TEXT,
  inventory_released_at TIMESTAMPTZ,
  refunded_by           INT REFERENCES admin_users(id),
  refunded_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_refunds_order ON order_refunds(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_refunds_status ON order_refunds(status, updated_at DESC);
-- Mỗi order chỉ một refund đang hoạt động (requested|refunding); rejected/refunded được giữ lại.
CREATE UNIQUE INDEX IF NOT EXISTS uq_order_refund_active
  ON order_refunds(order_id) WHERE status IN ('requested','refunding');

-- ===== Không xoá e-ticket: đánh dấu revoke =====
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS revoked_at    TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS revoked_by    INT REFERENCES admin_users(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS revoke_reason TEXT;

-- ===== Không xoá voucher redemption: đánh dấu reversed =====
ALTER TABLE voucher_redemptions ADD COLUMN IF NOT EXISTS reversed_at    TIMESTAMPTZ;
ALTER TABLE voucher_redemptions ADD COLUMN IF NOT EXISTS reversed_by    INT REFERENCES admin_users(id);
ALTER TABLE voucher_redemptions ADD COLUMN IF NOT EXISTS reverse_reason TEXT;
