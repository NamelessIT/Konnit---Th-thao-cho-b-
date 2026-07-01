"use client";

import { useEffect, useRef } from "react";

import { useRequireUser } from "@/hooks/useRequireUser";
import { useAuth } from "@/store/auth";
import { useT } from "@/lib/i18n/LocaleProvider";

export function RequireShopUser({ children }: { children: React.ReactNode }) {
  const t = useT();
  const user = useAuth((state) => state.user);
  const initialized = useAuth((state) => state.initialized);
  const init = useAuth((state) => state.init);
  const requireUser = useRequireUser();
  const prompted = useRef(false);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (initialized && !user && !prompted.current) {
      prompted.current = true;
      requireUser();
    }
  }, [initialized, requireUser, user]);

  if (!initialized) {
    return (
      <div className="py-24 text-center text-(--konnit-muted)">
        {t("auth.checkingSession")}
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
