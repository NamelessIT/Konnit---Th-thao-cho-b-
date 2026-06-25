import type { SessionUser } from "@konnit/types";
import { api, ApiError } from "./api-client";

export async function getSession(): Promise<SessionUser | null> {
  try {
    return await api.get<SessionUser>("/auth/me");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

export function requireRole(
  user: SessionUser | null,
  roles: SessionUser["role"][],
): boolean {
  return user !== null && roles.includes(user.role);
}
