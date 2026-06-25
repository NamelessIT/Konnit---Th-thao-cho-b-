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
