const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export interface PublicUser {
  id: number;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface MeResponse {
  user: PublicUser;
  roles: string[];
  permissions: string[];
}

export const authApi = {
  async googleLogin(credential: string): Promise<MeResponse> {
    const res = await fetch(`${API}/api/public/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message ?? "Đăng nhập thất bại");
    }
    return json.data as MeResponse;
  },

  async me(): Promise<MeResponse | null> {
    const res = await fetch(`${API}/api/public/auth/me`, {
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 401) return null;
    const json = await res.json().catch(() => null);
    if (!json?.success) return null;
    return json.data as MeResponse;
  },

  async logout(): Promise<void> {
    await fetch(`${API}/api/public/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },
};