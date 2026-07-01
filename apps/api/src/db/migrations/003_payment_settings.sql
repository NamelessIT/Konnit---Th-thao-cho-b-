-- 003_payment_settings.sql
-- Bảng key-value tái sử dụng cho cấu hình hệ thống (đầu tiên: cấu hình chuyển khoản).
-- Additive — không drop gì. Yêu cầu schema gốc (admin_users) đã tồn tại.

CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_by INT REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cấu hình thanh toán chuyển khoản: { qrImagePath, accountName, accountNumber, bankName, note }
INSERT INTO app_settings (key, value)
VALUES ('bank_transfer', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;
