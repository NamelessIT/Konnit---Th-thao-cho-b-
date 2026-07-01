"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/store/auth";
import { useAuthGate } from "@/store/auth-gate";
import { useT } from "@/lib/i18n/LocaleProvider";

interface RequireUserOptions {
  message?: string;
  returnUrl?: string;
}

export function useRequireUser() {
  const t = useT();
  const pathname = usePathname();
  const showGate = useAuthGate((state) => state.show);

  return useCallback(
    (options?: RequireUserOptions) => {
      const prompt = () => {
        const message = options?.message ?? t("auth.requireLoginMessage");
        toast.info(message);
        showGate({
          message,
          returnUrl: options?.returnUrl ?? pathname,
        });
      };

      const auth = useAuth.getState();
      if (auth.user) return true;

      if (!auth.initialized) {
        void auth.init().then(() => {
          if (!useAuth.getState().user) prompt();
        });
        return false;
      }

      prompt();
      return false;
    },
    [t, pathname, showGate],
  );
}
