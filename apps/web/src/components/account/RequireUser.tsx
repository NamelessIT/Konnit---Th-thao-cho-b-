"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";

export function RequireUser({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const init = useAuth((s) => s.init);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initialized && !user) {
      router.replace(`/dang-nhap?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [initialized, user, router, pathname]);

  if (!initialized) {
    return <div className="py-24 text-center text-[var(--konnit-muted)]">Đang tải…</div>;
  }
  if (!user) return null;
  return <>{children}</>;
}