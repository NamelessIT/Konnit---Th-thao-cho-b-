import bcrypt from 'bcrypt';
import { withTransaction } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { invalidateAccessCache, rankOf } from '../auth/access.middleware';
import * as repo from './access.repository';

// Map RBAC roles → cột legacy admin_users.role (giữ FE gating cũ chạy được)
function legacyRole(keys: string[]): 'admin' | 'editor' | 'viewer' | 'staff' {
  if (keys.includes('super_admin') || keys.includes('admin')) return 'admin';
  if (keys.includes('checkin_staff')) return 'staff';
  if (keys.includes('editor')) return 'editor';
  return 'viewer';
}

/** Rank hiện tại của một admin user (đọc role tươi từ DB). */
async function userRank(id: number): Promise<number> {
  return rankOf(await repo.getUserRoleKeys(id));
}

/** Chặn nếu actor không cao hơn target (không được tác động ngang/cao hơn mình). */
async function assertCanManage(actorId: number, targetId: number) {
  const [actor, target] = await Promise.all([userRank(actorId), userRank(targetId)]);
  if (actor <= target) {
    throw new AppError(
      403,
      'RANK_FORBIDDEN',
      'Không thể thao tác trên tài khoản ngang hoặc cao hơn cấp của bạn',
    );
  }
}

/** Chặn nếu gán role có rank ≥ rank của actor (chỉ tạo/gán cấp thấp hơn mình). */
function assertCanGrant(actorRank: number, roleKeys: string[]) {
  for (const key of roleKeys) {
    if (rankOf([key]) >= actorRank) {
      throw new AppError(
        403,
        'ROLE_RANK_FORBIDDEN',
        'Không thể gán vai trò ngang hoặc cao hơn cấp của bạn',
      );
    }
  }
}

export const listUsers = () => repo.listUsers();
export const listRoles = () => repo.listRoles();
export const listPermissions = () => repo.listPermissions();

export async function createUser(
  actorId: number,
  input: {
    email: string;
    password: string;
    fullName?: string;
    roleKeys: string[];
  },
) {
  assertCanGrant(await userRank(actorId), input.roleKeys);
  if (await repo.findUserByEmail(input.email)) {
    throw new AppError(409, 'EMAIL_EXISTS', 'Email đã tồn tại');
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  const id = await withTransaction(async (client) => {
    const uid = await repo.createUser(client, {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: legacyRole(input.roleKeys),
    });
    await repo.setUserRoles(client, uid, input.roleKeys);
    return uid;
  });
  return { id };
}

export async function updateUser(
  id: number,
  actorId: number,
  input: { fullName?: string; roleKeys?: string[] },
) {
  await repo.getUserOrThrow(id);
  await assertCanManage(actorId, id);
  if (input.roleKeys) assertCanGrant(await userRank(actorId), input.roleKeys);
  await withTransaction(async (client) => {
    if (input.roleKeys) {
      if (!input.roleKeys.includes('super_admin') && (await repo.countOtherActiveSuperAdmins(id)) === 0) {
        throw new AppError(400, 'LAST_SUPER_ADMIN', 'Không thể bỏ super_admin cuối cùng');
      }
      await repo.updateUser(client, id, { fullName: input.fullName, role: legacyRole(input.roleKeys) });
      await repo.setUserRoles(client, id, input.roleKeys);
    } else {
      await repo.updateUser(client, id, { fullName: input.fullName });
    }
  });
  await invalidateAccessCache('admin', id);
  return { id };
}

export async function setStatus(id: number, actorId: number, status: 'active' | 'disabled') {
  if (id === actorId) throw new AppError(400, 'CANNOT_SELF', 'Không thể tự thao tác trên tài khoản của mình');
  await repo.getUserOrThrow(id);
  await assertCanManage(actorId, id);
  if (status === 'disabled' && (await repo.countOtherActiveSuperAdmins(id)) === 0) {
    throw new AppError(400, 'LAST_SUPER_ADMIN', 'Không thể khoá super_admin cuối cùng');
  }
  await repo.setUserStatus(id, status);
  await invalidateAccessCache('admin', id);
}

export async function deleteUser(id: number, actorId: number) {
  if (id === actorId) throw new AppError(400, 'CANNOT_SELF', 'Không thể xoá tài khoản của mình');
  await repo.getUserOrThrow(id);
  await assertCanManage(actorId, id);
  if ((await repo.countOtherActiveSuperAdmins(id)) === 0) {
    throw new AppError(400, 'LAST_SUPER_ADMIN', 'Không thể xoá super_admin cuối cùng');
  }
  await repo.softDeleteUser(id);
  await invalidateAccessCache('admin', id);
}

export async function createRole(input: {
  key: string;
  name: string;
  description?: string;
  permissionKeys?: string[];
}) {
  if (await repo.findRoleByKey(input.key)) {
    throw new AppError(409, 'ROLE_EXISTS', 'Mã vai trò đã tồn tại');
  }
  const id = await withTransaction(async (client) => {
    const rid = await repo.createRole(client, {
      key: input.key,
      name: input.name,
      description: input.description,
    });
    if (input.permissionKeys?.length) await repo.setRolePermissions(client, rid, input.permissionKeys);
    return rid;
  });
  return { id };
}

export async function updateRole(id: number, input: { name?: string; description?: string }) {
  const role = await repo.getRoleOrThrow(id);
  if (role.is_system) throw new AppError(403, 'SYSTEM_ROLE', 'Không thể sửa vai trò hệ thống');
  await repo.updateRole(id, input);
  return { id };
}

export async function setRolePermissions(id: number, permissionKeys: string[]) {
  const role = await repo.getRoleOrThrow(id);
  if (role.is_system) throw new AppError(403, 'SYSTEM_ROLE', 'Không thể sửa quyền vai trò hệ thống');
  await withTransaction((client) => repo.setRolePermissions(client, id, permissionKeys));
  // Quyền role đổi → cache permission của user mang role này tự refresh sau ≤60s (TTL).
}

export async function deleteRole(id: number) {
  const role = await repo.getRoleOrThrow(id);
  if (role.is_system) throw new AppError(403, 'SYSTEM_ROLE', 'Không thể xoá vai trò hệ thống');
  if (await repo.roleInUse(id)) throw new AppError(400, 'ROLE_IN_USE', 'Vai trò đang được gán cho tài khoản');
  await repo.deleteRole(id);
}