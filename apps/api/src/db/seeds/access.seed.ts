import type { PoolClient } from 'pg';
import {
  ACCESS_PERMISSIONS,
  SYSTEM_ROLES as ACCESS_ROLES,
  ROLE_PERMISSIONS,
} from '@konnit/types';

/** Seed permissions, roles, role_permissions + backfill role mặc định. */
export async function seedAccessControl(client: PoolClient) {
  for (const [key, resource, action, description] of ACCESS_PERMISSIONS) {
    await client.query(
      `INSERT INTO permissions (key, resource, action, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE
       SET resource = EXCLUDED.resource,
           action = EXCLUDED.action,
           description = EXCLUDED.description`,
      [key, resource, action, description],
    );
  }

  for (const [key, name, realm, description] of ACCESS_ROLES) {
    await client.query(
      `INSERT INTO roles (key, name, realm, description, is_system)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (key) DO UPDATE
       SET name = EXCLUDED.name,
           realm = EXCLUDED.realm,
           description = EXCLUDED.description,
           is_system = true`,
      [key, name, realm, description],
    );
  }

  for (const [roleKey, permissionKeys] of Object.entries(ROLE_PERMISSIONS)) {
    await client.query(
      `DELETE FROM role_permissions
       WHERE role_id = (SELECT id FROM roles WHERE key = $1)`,
      [roleKey],
    );
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r
       CROSS JOIN permissions p
       WHERE r.key = $1 AND p.key = ANY($2::text[])
       ON CONFLICT DO NOTHING`,
      [roleKey, permissionKeys],
    );
  }

  // Backfill role mặc định CHỈ cho tài khoản chưa có role nào (tránh re-seed ghi đè
  // các admin tạo qua UI — vốn cũng có cột legacy role='admin').
  await client.query(`
    INSERT INTO admin_user_roles (admin_user_id, role_id)
    SELECT au.id, r.id
    FROM admin_users au
    JOIN roles r ON r.key = CASE au.role
      WHEN 'admin' THEN 'super_admin'
      WHEN 'editor' THEN 'editor'
      WHEN 'viewer' THEN 'viewer'
      WHEN 'staff' THEN 'checkin_staff'
    END
    WHERE au.is_deleted = false
      AND NOT EXISTS (
        SELECT 1 FROM admin_user_roles x WHERE x.admin_user_id = au.id
      )
    ON CONFLICT DO NOTHING
  `);

  await client.query(`
    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id
    FROM users u
    CROSS JOIN roles r
    WHERE r.key = 'customer' AND u.is_deleted = false
    ON CONFLICT DO NOTHING
  `);
}