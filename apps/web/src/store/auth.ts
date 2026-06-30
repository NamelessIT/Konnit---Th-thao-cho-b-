import { create } from "zustand";
import { authApi, type MeResponse, type PublicUser } from "@/lib/auth/api";

interface AuthState {
  user: PublicUser | null;
  roles: string[];
  permissions: string[];
  initialized: boolean;
  loading: boolean;
  init: () => Promise<void>;
  applySession: (m: MeResponse) => void;
  signOut: () => Promise<void>;
  hasPermission: (key: string) => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  roles: [],
  permissions: [],
  initialized: false,
  loading: false,

  init: async () => {
    if (get().initialized || get().loading) return;
    set({ loading: true });
    const me = await authApi.me().catch(() => null);
    set({
      user: me?.user ?? null,
      roles: me?.roles ?? [],
      permissions: me?.permissions ?? [],
      initialized: true,
      loading: false,
    });
  },

  applySession: (m) =>
    set({ user: m.user, roles: m.roles, permissions: m.permissions, initialized: true }),

  signOut: async () => {
    await authApi.logout().catch(() => {});
    set({ user: null, roles: [], permissions: [] });
  },

  hasPermission: (key) => get().permissions.includes(key),
}));