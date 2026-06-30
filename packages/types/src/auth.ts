import type { AccountStatus } from './content-status';

export const ADMIN_LEGACY_ROLES = [
  'admin',
  'editor',
  'viewer',
  'staff',
] as const;
export type AdminLegacyRole = (typeof ADMIN_LEGACY_ROLES)[number];

export interface AdminUser {
  id: number;
  email: string;
  fullName: string | null;
  role: AdminLegacyRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: number;
  email: string;
  role: AdminUser['role'];
  fullName: string | null;
  /** RBAC role keys (vd 'super_admin','admin'). Có khi gọi /admin/auth/me. */
  roles?: string[];
  /** RBAC permission keys. Có khi gọi /admin/auth/me. */
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: SessionUser;
}
