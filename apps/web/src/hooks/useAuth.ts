"use client";

import { useEffect, useState, useCallback } from "react";
import type { SessionUser } from "@konnit/types";
import { api, ApiError } from "@/lib/api-client";

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await api.get<SessionUser>("/admin/auth/me");
      setUser(data);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    await api.post("/admin/auth/logout");
    setUser(null);
    window.location.href = "/admin/login";
  }, []);

  return { user, loading, logout, refetch: fetchUser };
}
