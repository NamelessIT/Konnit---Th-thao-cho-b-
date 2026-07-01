-- Konnit CMS Phase 1 Schema
-- Run: pnpm --filter @konnit/api db:init

-- ===== Admin Users =====
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','editor','viewer','staff')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  is_deleted    BOOLEAN DEFAULT false
);

-- ===== Public Users (Google sign-up/sign-in) =====
CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  email             TEXT NOT NULL,
  full_name         TEXT,
  avatar_url        TEXT,
  email_verified    BOOLEAN NOT NULL DEFAULT false,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted        BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_active
  ON users(lower(email)) WHERE is_deleted = false;

CREATE TABLE IF NOT EXISTS auth_identities (
  id                SERIAL PRIMARY KEY,
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL CHECK (provider IN ('google')),
  provider_subject  TEXT NOT NULL,
  provider_email    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_subject),
  UNIQUE(user_id, provider)
);

-- ===== Database-backed RBAC =====
CREATE TABLE IF NOT EXISTS roles (
  id          SERIAL PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  realm       TEXT NOT NULL CHECK (realm IN ('admin','public')),
  description TEXT,
  is_system   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id          SERIAL PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  resource    TEXT NOT NULL,
  action      TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resource, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  admin_user_id INT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  role_id       INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (admin_user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- ===== Sessions (connect-pg-simple) =====
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    VARCHAR NOT NULL COLLATE "default",
  "sess"   JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- ===== CMS Categories =====
CREATE TABLE IF NOT EXISTS cms_categories (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  parent_id     INT REFERENCES cms_categories(id) ON DELETE SET NULL,
  sort_order    INT DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by    INT REFERENCES admin_users(id),
  updated_by    INT REFERENCES admin_users(id),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  is_deleted    BOOLEAN DEFAULT false
);

-- ===== CMS Pages =====
CREATE TABLE IF NOT EXISTS cms_pages (
  id              SERIAL PRIMARY KEY,
  category_id     INT NOT NULL REFERENCES cms_categories(id),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by      INT REFERENCES admin_users(id),
  updated_by      INT REFERENCES admin_users(id),
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT false,
  UNIQUE(category_id, slug)
);

-- ===== CMS Component Templates =====
CREATE TABLE IF NOT EXISTS cms_component_templates (
  id                  SERIAL PRIMARY KEY,
  type_key            TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  allowed_fields_json JSONB,
  status              TEXT NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  is_deleted          BOOLEAN DEFAULT false
);

-- ===== CMS Component Styles =====
CREATE TABLE IF NOT EXISTS cms_component_styles (
  id                  SERIAL PRIMARY KEY,
  template_id         INT NOT NULL REFERENCES cms_component_templates(id),
  style_key           TEXT NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  preview_image_path  TEXT,
  css_class           TEXT,
  status              TEXT NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  is_deleted          BOOLEAN DEFAULT false,
  UNIQUE(template_id, style_key)
);

-- ===== CMS Sections =====
CREATE TABLE IF NOT EXISTS cms_sections (
  id              SERIAL PRIMARY KEY,
  page_id         INT NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  template_id     INT REFERENCES cms_component_templates(id),
  style_id        INT REFERENCES cms_component_styles(id),
  component_type  TEXT NOT NULL,
  style_variant   TEXT NOT NULL,
  title           TEXT,
  description     TEXT,
  content_json    JSONB DEFAULT '{}',
  sort_order      INT DEFAULT 0,
  is_visible      BOOLEAN DEFAULT true,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by      INT REFERENCES admin_users(id),
  updated_by      INT REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT false
);

-- ===== Uploads =====
CREATE TABLE IF NOT EXISTS uploads (
  id             SERIAL PRIMARY KEY,
  original_name  TEXT NOT NULL,
  file_name      TEXT UNIQUE NOT NULL,
  mime_type      TEXT NOT NULL,
  size_bytes     INT NOT NULL,
  path           TEXT NOT NULL,
  uploaded_by    INT REFERENCES admin_users(id),
  created_at     TIMESTAMPTZ DEFAULT now(),
  is_deleted     BOOLEAN DEFAULT false
);

-- ===== Audit Logs =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL PRIMARY KEY,
  actor_id    INT REFERENCES admin_users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   INT,
  before_json JSONB,
  after_json  JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_sections_page_order ON cms_sections(page_id, sort_order) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_pages_category ON cms_pages(category_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON cms_categories(slug) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_pages_slug ON cms_pages(category_id, slug) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);

-- =====================================================================
-- Phase 2 — Event Ticketing & Checkout
-- =====================================================================

-- ===== Events =====
CREATE TABLE IF NOT EXISTS events (
  id                       SERIAL PRIMARY KEY,
  name                     TEXT NOT NULL,
  slug                     TEXT UNIQUE NOT NULL,
  description              TEXT,
  location                 TEXT,
  map_url                  TEXT,
  starts_at                TIMESTAMPTZ,
  registration_opens_at    TIMESTAMPTZ,
  registration_closes_at   TIMESTAMPTZ,
  banner_path              TEXT,
  cms_page_id              INT REFERENCES cms_pages(id) ON DELETE SET NULL,
  status                   TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by               INT REFERENCES admin_users(id),
  updated_by               INT REFERENCES admin_users(id),
  published_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now(),
  is_deleted               BOOLEAN DEFAULT false
);

-- ===== Ticket Types (slot math lives here) =====
CREATE TABLE IF NOT EXISTS ticket_types (
  id                  SERIAL PRIMARY KEY,
  event_id            INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  slug                TEXT,
  description         TEXT,
  age_group           TEXT,
  age_min             INT,
  age_max             INT,
  gender_restriction  TEXT CHECK (gender_restriction IN ('any','male','female')) DEFAULT 'any',
  price               NUMERIC(12,0) NOT NULL DEFAULT 0,
  early_bird_price    NUMERIC(12,0),
  early_bird_until    TIMESTAMPTZ,
  quota_total         INT NOT NULL DEFAULT 0,
  sold_count          INT NOT NULL DEFAULT 0,
  reserved_count      INT NOT NULL DEFAULT 0,
  includes_shirt      BOOLEAN DEFAULT false,
  image_path          TEXT,
  sort_order          INT DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by          INT REFERENCES admin_users(id),
  updated_by          INT REFERENCES admin_users(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  is_deleted          BOOLEAN DEFAULT false,
  CONSTRAINT ticket_types_slots_chk CHECK (sold_count >= 0 AND reserved_count >= 0),
  UNIQUE(event_id, slug)
);

-- ===== Vouchers =====
CREATE TABLE IF NOT EXISTS vouchers (
  id                  SERIAL PRIMARY KEY,
  code                TEXT UNIQUE NOT NULL,
  description         TEXT,
  discount_type       TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value      NUMERIC(12,2) NOT NULL,
  min_order_amount    NUMERIC(12,0) DEFAULT 0,
  max_uses            INT,
  used_count          INT NOT NULL DEFAULT 0,
  starts_at           TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_by          INT REFERENCES admin_users(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  is_deleted          BOOLEAN DEFAULT false
);

-- ===== Orders =====
CREATE TABLE IF NOT EXISTS orders (
  id                  SERIAL PRIMARY KEY,
  user_id             INT REFERENCES users(id) ON DELETE SET NULL,
  order_code          TEXT UNIQUE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','refund_requested','refunding','refunded','expired','failed')),
  contact_name        TEXT NOT NULL,
  contact_phone       TEXT NOT NULL,
  contact_email       TEXT NOT NULL,
  contact_address     TEXT,
  guardian_name       TEXT,
  guardian_phone      TEXT,
  subtotal            NUMERIC(12,0) NOT NULL DEFAULT 0,
  discount_amount     NUMERIC(12,0) NOT NULL DEFAULT 0,
  total               NUMERIC(12,0) NOT NULL DEFAULT 0,
  voucher_id          INT REFERENCES vouchers(id),
  voucher_code        TEXT,
  agreed_terms        BOOLEAN NOT NULL DEFAULT false,
  hold_expires_at     TIMESTAMPTZ,
  note                TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  paid_at             TIMESTAMPTZ,
  is_deleted          BOOLEAN DEFAULT false
);

-- ===== Order Items (one row per child / registration) =====
CREATE TABLE IF NOT EXISTS order_items (
  id                  SERIAL PRIMARY KEY,
  order_id            INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ticket_type_id      INT NOT NULL REFERENCES ticket_types(id),
  ticket_type_name    TEXT NOT NULL,
  unit_price          NUMERIC(12,0) NOT NULL,
  attendee_name       TEXT NOT NULL,
  attendee_dob        DATE,
  attendee_gender     TEXT,
  shirt_size          TEXT,
  bib_number          TEXT,
  medal_name          TEXT,
  health_notes        TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ===== Order Add-ons =====
CREATE TABLE IF NOT EXISTS order_addons (
  id                  SERIAL PRIMARY KEY,
  order_id            INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id       INT REFERENCES order_items(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  unit_price          NUMERIC(12,0) NOT NULL DEFAULT 0,
  quantity            INT NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ===== Payments (transaction log for reconciliation) =====
CREATE TABLE IF NOT EXISTS payments (
  id                    SERIAL PRIMARY KEY,
  order_id              INT NOT NULL REFERENCES orders(id),
  gateway               TEXT NOT NULL DEFAULT 'vnpay',
  amount                NUMERIC(12,0) NOT NULL,
  status                TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated','success','failed')),
  transaction_ref       TEXT,
  bank_code             TEXT,
  response_code         TEXT,
  gateway_response_json JSONB,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ===== Voucher Redemptions (idempotency guard against double-redeem) =====
CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id             SERIAL PRIMARY KEY,
  voucher_id     INT NOT NULL REFERENCES vouchers(id),
  order_id       INT NOT NULL REFERENCES orders(id),
  reversed_at    TIMESTAMPTZ,
  reversed_by    INT REFERENCES admin_users(id),
  reverse_reason TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id),
  UNIQUE(voucher_id, order_id)
);

-- ===== E-Tickets (QR per child) =====
CREATE TABLE IF NOT EXISTS tickets (
  id              SERIAL PRIMARY KEY,
  order_item_id   INT NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
  qr_token        TEXT UNIQUE NOT NULL,
  checked_in_at   TIMESTAMPTZ,
  checked_in_by   INT REFERENCES admin_users(id),
  revoked_at      TIMESTAMPTZ,
  revoked_by      INT REFERENCES admin_users(id),
  revoke_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===== Order Refunds (mỗi quy trình hoàn tiền = 1 row) =====
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

-- ===== App settings (key-value) =====
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_by INT REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO app_settings (key, value)
VALUES ('bank_transfer', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;
INSERT INTO app_settings (key, value)
VALUES ('smtp', '{"enabled":false,"host":"","port":587,"secure":false,"user":"","pass":"","fromName":"Konnit","fromEmail":""}')
ON CONFLICT (key) DO NOTHING;
INSERT INTO app_settings (key, value)
VALUES ('logo', '{"url":null}')
ON CONFLICT (key) DO NOTHING;

-- ===== i18n (đa ngôn ngữ) =====
CREATE TABLE IF NOT EXISTS languages (
  id          SERIAL PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  native_name TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_languages_default
  ON languages(is_default) WHERE is_default = true;

CREATE TABLE IF NOT EXISTS translations (
  id         SERIAL PRIMARY KEY,
  module     TEXT NOT NULL,
  entity_id  INT  NOT NULL,
  field      TEXT NOT NULL,
  locale     TEXT NOT NULL,
  value      TEXT,
  updated_by INT REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (module, entity_id, field, locale)
);
CREATE INDEX IF NOT EXISTS idx_translations_lookup
  ON translations (module, locale, entity_id);

INSERT INTO languages (code, name, native_name, is_active, is_default, sort_order)
VALUES ('vi', 'Tiếng Việt', 'Tiếng Việt', true, true, 0)
ON CONFLICT (code) DO NOTHING;
INSERT INTO languages (code, name, native_name, is_active, is_default, sort_order)
VALUES ('en', 'English', 'English', true, false, 1)
ON CONFLICT (code) DO NOTHING;

-- ===== Phase 2 Indexes =====
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_hold ON orders(status, hold_expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_addons_order ON order_addons(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_token ON tickets(qr_token);
CREATE INDEX IF NOT EXISTS idx_orders_status_updated ON orders(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_refunds_order ON order_refunds(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_refunds_status ON order_refunds(status, updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_order_refund_active
  ON order_refunds(order_id) WHERE status IN ('requested','refunding');
CREATE INDEX IF NOT EXISTS idx_auth_identities_user ON auth_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_role ON admin_user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
