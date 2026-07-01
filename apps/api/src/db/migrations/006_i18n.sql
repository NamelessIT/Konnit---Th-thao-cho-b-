-- 006_i18n.sql
-- Đa ngôn ngữ (i18n): bảng danh mục ngôn ngữ + bảng dịch nội dung entity.
-- Additive — không drop gì. Ngôn ngữ mặc định (vi) luôn lấy từ cột gốc của
-- bảng entity; bảng translations chỉ chứa các locale khác (và override tùy chọn).

CREATE TABLE IF NOT EXISTS languages (
  id          SERIAL PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,          -- 'vi','en','ja'
  name        TEXT NOT NULL,                 -- tên hiển thị admin
  native_name TEXT,                          -- 'Tiếng Việt','English'
  is_active   BOOLEAN NOT NULL DEFAULT true,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Chỉ 1 ngôn ngữ mặc định tại một thời điểm.
CREATE UNIQUE INDEX IF NOT EXISTS uq_languages_default
  ON languages(is_default) WHERE is_default = true;

CREATE TABLE IF NOT EXISTS translations (
  id         SERIAL PRIMARY KEY,
  module     TEXT NOT NULL,                  -- 'events','ticket_types','cms_pages','cms_sections','vouchers'
  entity_id  INT  NOT NULL,
  field      TEXT NOT NULL,                  -- 'name','title','description','content_json',...
  locale     TEXT NOT NULL,                  -- FK mềm tới languages.code
  value      TEXT,
  updated_by INT REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (module, entity_id, field, locale)
);

CREATE INDEX IF NOT EXISTS idx_translations_lookup
  ON translations (module, locale, entity_id);

-- Seed ngôn ngữ mặc định.
INSERT INTO languages (code, name, native_name, is_active, is_default, sort_order)
VALUES ('vi', 'Tiếng Việt', 'Tiếng Việt', true, true, 0)
ON CONFLICT (code) DO NOTHING;
INSERT INTO languages (code, name, native_name, is_active, is_default, sort_order)
VALUES ('en', 'English', 'English', true, false, 1)
ON CONFLICT (code) DO NOTHING;
