import type { PoolClient } from 'pg';
import { query } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import type { AccountStatus } from '@konnit/types';

// ===== Users =====
export async function listUsers() {
  const { rows } = await query(
    `SELECT au.id, au.email, au.full_name, au.status, au.created_at,
            COALESCE(json_agg(json_build_object('key', r.key, 'name', r.name))
                     FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
     FROM admin_users au
     LEFT JOIN admin_user_roles aur ON aur.admin_user_id = au.id
     LEFT JOIN roles r ON r.id = aur.role_id
     WHERE au.is_deleted = false
     GROUP BY au.id
     ORDER BY au.created_at`,
  );
  return rows;
}

export async function findUserByEmail(email: string) {
  const { rows } = await query(
    `SELECT id FROM admin_users WHERE lower(email) = lower($1) AND is_deleted = false`,
    [email],
  );
  return rows[0] ?? null;
}

export async function getUserOrThrow(id: number) {
  const { rows } = await query(
    `SELECT id, status FROM admin_users WHERE id = $1 AND is_deleted = false`,
    [id],
  );
  if (!rows[0]) throw new AppError(404, 'USER_NOT_FOUND', 'Tài khoản không tồn tại');
  return rows[0];
}

/** Các role key đang gán cho một admin user (để tính rank). */
export async function getUserRoleKeys(id: number): Promise<string[]> {
  const { rows } = await query(
    `SELECT r.key
     FROM admin_user_roles aur
     JOIN roles r ON r.id = aur.role_id
     WHERE aur.admin_user_id = $1`,
    [id],
  );
  return rows.map((r) => r.key as string);
}

export async function createUser(
  client: PoolClient,
  data: { email: string; passwordHash: string; fullName?: string; role: string },
) {
  const { rows } = await client.query(
    `INSERT INTO admin_users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [data.email, data.passwordHash, data.fullName ?? null, data.role],
  );
  return rows[0].id as number;
}

export async function updateUser(
  client: PoolClient,
  id: number,
  data: { fullName?: string; role?: string },
) {
  await client.query(
    `UPDATE admin_users
     SET full_name = COALESCE($2, full_name),
         role = COALESCE($3, role),
         updated_at = now()
     WHERE id = $1`,
    [id, data.fullName ?? null, data.role ?? null],
  );
}

export async function setUserRoles(client: PoolClient, userId: number, roleKeys: string[]) {
  await client.query(`DELETE FROM admin_user_roles WHERE admin_user_id = $1`, [userId]);
  if (roleKeys.length) {
    await client.query(
      `INSERT INTO admin_user_roles (admin_user_id, role_id)
       SELECT $1, id FROM roles WHERE key = ANY($2::text[])`,
      [userId, roleKeys],
    );
  }
}

export async function setUserStatus(id: number, status: AccountStatus) {
  await query(`UPDATE admin_users SET status = $2, updated_at = now() WHERE id = $1`, [id, status]);
}

export async function softDeleteUser(id: number) {
  await query(`UPDATE admin_users SET is_deleted = true, updated_at = now() WHERE id = $1`, [id]);
}

/** Số super_admin đang active, KHÔNG tính user `excludeId`. */
export async function countOtherActiveSuperAdmins(excludeId: number) {
  const { rows } = await query(
    `SELECT count(*)::int AS n
     FROM admin_users au
     JOIN admin_user_roles aur ON aur.admin_user_id = au.id
     JOIN roles r ON r.id = aur.role_id
     WHERE r.key = 'super_admin' AND au.status = 'active' AND au.is_deleted = false
       AND au.id <> $1`,
    [excludeId],
  );
  return rows[0].n as number;
}

// ===== Roles =====
export async function listRoles() {
  const { rows } = await query(
    `SELECT r.id, r.key, r.name, r.realm, r.description, r.is_system,
            COALESCE(json_agg(p.key) FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     GROUP BY r.id
     ORDER BY r.realm, r.key`,
  );
  return rows;
}

export async function findRoleByKey(key: string) {
  const { rows } = await query(`SELECT id FROM roles WHERE key = $1`, [key]);
  return rows[0] ?? null;
}

export async function getRoleOrThrow(id: number) {
  const { rows } = await query(`SELECT id, is_system FROM roles WHERE id = $1`, [id]);
  if (!rows[0]) throw new AppError(404, 'ROLE_NOT_FOUND', 'Vai trò không tồn tại');
  return rows[0];
}

export async function createRole(
  client: PoolClient,
  data: { key: string; name: string; description?: string },
) {
  const { rows } = await client.query(
    `INSERT INTO roles (key, name, realm, description, is_system)
     VALUES ($1, $2, 'admin', $3, false) RETURNING id`,
    [data.key, data.name, data.description ?? null],
  );
  return rows[0].id as number;
}

export async function updateRole(id: number, data: { name?: string; description?: string }) {
  await query(
    `UPDATE roles SET name = COALESCE($2, name), description = COALESCE($3, description), updated_at = now()
     WHERE id = $1`,
    [id, data.name ?? null, data.description ?? null],
  );
}

export async function setRolePermissions(client: PoolClient, roleId: number, permissionKeys: string[]) {
  await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
  if (permissionKeys.length) {
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions WHERE key = ANY($2::text[])`,
      [roleId, permissionKeys],
    );
  }
}

export async function roleInUse(id: number) {
  const { rows } = await query(
    `SELECT 1 FROM admin_user_roles WHERE role_id = $1
     UNION SELECT 1 FROM user_roles WHERE role_id = $1 LIMIT 1`,
    [id],
  );
  return rows.length > 0;
}

export async function deleteRole(id: number) {
  await query(`DELETE FROM roles WHERE id = $1 AND is_system = false`, [id]);
}

// ===== Permissions =====
export async function listPermissions() {
  const { rows } = await query(
    `SELECT id, key, resource, action, description FROM permissions ORDER BY resource, action`,
  );
  return rows;
}