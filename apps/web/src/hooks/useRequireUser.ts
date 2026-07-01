"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/store/auth";
import { useAuthGate } from "@/store/auth-gate";

interface RequireUserOptions {
  message?: string;
  returnUrl?: string;
}

const DEFAULT_MESSAGE = "Vui lòng đăng nhập để mua vé và sử dụng giỏ hàng.";

export function useRequireUser() {
  const pathname = usePathname();
  const showGate = useAuthGate((state) => state.show);

  return useCallback(
    (options?: RequireUserOptions) => {
      const prompt = () => {
        const message = options?.message ?? DEFAULT_MESSAGE;
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
    [pathname, showGate],
  );
}
