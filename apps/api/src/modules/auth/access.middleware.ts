import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { query } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';
import { getCachedJson, setCachedJson, deleteCachedKeys } from '../../config/redisCache';

type Realm = 'admin' | 'public';

interface PrincipalAccess {
  active: boolean;
  roles: string[];
  permissions: string[];
}

/**
 * Thứ bậc tài khoản (rank). Cao hơn = quyền lực hơn.
 * Quy tắc: chỉ tác động được tài khoản rank THẤP HƠN; chỉ gán được role rank THẤP HƠN mình.
 * super_admin (chủ hệ thống, duy nhất 1) là cao nhất trong hệ thống. Role tuỳ biến → rank thấp (10).
 */
export const ROLE_RANK: Record<string, number> = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  checkin_staff: 40,
  viewer: 20,
};

/** Rank hiệu lực = rank cao nhất trong các role. Role lạ (tuỳ biến) = 10. */
export function rankOf(roleKeys: string[]): number {
  return roleKeys.reduce((max, key) => Math.max(max, ROLE_RANK[key] ?? 10), 0);
}

const ACCESS_CACHE_TTL_SECONDS = 60; // ≤ 60s theo plan §9.5

function cacheKey(realm: Realm, id: number) {
  return `access:${realm}:${id}`;
}

/** Gọi khi đổi role / disable account để session phản ánh ngay. */
export async function invalidateAccessCache(realm: Realm, id: number) {
  await deleteCachedKeys([cacheKey(realm, id)]);
}

/** Load tươi roles + permissions + trạng thái account (có cache Redis TTL ngắn). */
export async function loadPrincipalAccess(realm: Realm, id: number): Promise<PrincipalAccess> {
  const cached = await getCachedJson<PrincipalAccess>(cacheKey(realm, id));
  if (cached) return cached;

  const statusSql =
    realm === 'admin'
      ? `SELECT status, is_deleted FROM admin_users WHERE id = $1`
      : `SELECT status, is_deleted FROM users WHERE id = $1`;
  const { rows: statusRows } = await query(statusSql, [id]);
  const acct = statusRows[0];
  const active = !!acct && acct.is_deleted === false && acct.status === 'active';

  const joinTable = realm === 'admin' ? 'admin_user_roles' : 'user_roles';
  const idCol = realm === 'admin' ? 'admin_user_id' : 'user_id';
  const { rows } = await query(
    `SELECT r.key AS role_key, p.key AS perm_key
     FROM ${joinTable} ur
     JOIN roles r ON r.id = ur.role_id
     LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE ur.${idCol} = $1`,
    [id],
  );
  const roles = [...new Set(rows.map((r) => r.role_key as string))];
  const permissions = [...new Set(rows.map((r) => r.perm_key as string).filter(Boolean))];

  const access: PrincipalAccess = { active, roles, permissions };
  await setCachedJson(cacheKey(realm, id), access, ACCESS_CACHE_TTL_SECONDS);
  return access;
}

/** Yêu cầu admin principal (session.user). */
export function requireAdminAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session?.user) throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');
  next();
}

/** Yêu cầu public principal (session.publicUser). */
export function requireUserAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session?.publicUser) throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');
  next();
}

/** Yêu cầu principal là super_admin (chủ hệ thống). Dùng cho hành động tối cao như huỷ đơn. */
export const requireSuperAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const id = req.session?.user?.id;
    if (!id) throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');
    const access = await loadPrincipalAccess('admin', id);
    if (!access.active) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Tài khoản đã bị vô hiệu hóa');
    }
    if (!access.roles.includes('super_admin')) {
      throw new AppError(403, 'FORBIDDEN', 'Chỉ super admin (chủ hệ thống) mới được phép');
    }
    next();
  },
);

/** Yêu cầu một permission cụ thể, theo realm (mặc định admin). */
export function requirePermission(permissionKey: string, realm: Realm = 'admin') {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const principalId =
      realm === 'admin' ? req.session?.user?.id : req.session?.publicUser?.id;
    if (!principalId) throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');

    const access = await loadPrincipalAccess(realm, principalId);
    if (!access.active) {
      throw new AppError(403, 'ACCOUNT_DISABLED', 'Tài khoản đã bị vô hiệu hóa');
    }
    if (!access.permissions.includes(permissionKey)) {
      throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện hành động này');
    }
    next();
  });
}

/**
 * Chặn truy cập order không chính chủ.
 * user_id lấy từ session, KHÔNG nhận từ body/query (chống IDOR).
 */
export const requireOwnedOrder = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.session?.publicUser?.id;
    if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');

    const code = String(req.params.code);
    const { rows } = await query(
      `SELECT id FROM orders
       WHERE order_code = $1 AND user_id = $2 AND is_deleted = false`,
      [code, userId],
    );
    if (!rows[0]) throw new AppError(404, 'ORDER_NOT_FOUND', 'Đơn hàng không tồn tại');
    next();
  },
);