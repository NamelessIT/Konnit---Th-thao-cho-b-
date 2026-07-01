import { create } from "zustand";

interface AuthGateOptions {
  message?: string;
  returnUrl?: string;
}

interface AuthGateState {
  open: boolean;
  message: string;
  returnUrl: string;
  show: (options?: AuthGateOptions) => void;
  hide: () => void;
}

const DEFAULT_MESSAGE = "Vui lòng đăng nhập để tiếp tục.";

export const useAuthGate = create<AuthGateState>((set) => ({
  open: false,
  message: DEFAULT_MESSAGE,
  returnUrl: "/",
  show: (options) =>
    set({
      open: true,
      message: options?.message ?? DEFAULT_MESSAGE,
      returnUrl: options?.returnUrl ?? "/",
    }),
  hide: () => set({ open: false }),
}));
