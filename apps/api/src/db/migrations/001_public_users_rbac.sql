-- Public Google users and database-backed RBAC.
-- This migration is additive so existing CMS and commerce data remain valid.

CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  email             TEXT NOT NULL,
  full_name         TEXT,
  avatar_url        TEXT,
  email_verified    BOOLEAN NOT NULL DEFAULT false,
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'disabled')),
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted        BOOLEAN NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_active
  ON users (lower(email))
  WHERE is_deleted = false;

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

CREATE TABLE IF NOT EXISTS roles (
  id          SERIAL PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  realm       TEXT NOT NULL CHECK (realm IN ('admin', 'public')),
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

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_auth_identities_user
  ON auth_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_role
  ON admin_user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role
  ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON orders(user_id, created_at DESC)
  WHERE is_deleted = false;
