import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BuyerInfo } from "@/lib/shop/types";

const TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 ngày

interface BuyerState {
  buyer: BuyerInfo;
  savedAt: number | null;
  setBuyer: (b: Partial<BuyerInfo>) => void;
  clearBuyer: () => void;
}

const EMPTY_BUYER: BuyerInfo = { contactName: "", contactPhone: "", contactEmail: "" };

export const useBuyerStore = create<BuyerState>()(
  persist(
    (set) => ({
      buyer: EMPTY_BUYER,
      savedAt: null,
      setBuyer: (b) =>
        set((s) => ({ buyer: { ...s.buyer, ...b }, savedAt: Date.now() })),
      clearBuyer: () => set({ buyer: EMPTY_BUYER, savedAt: null }),
    }),
    {
      name: "konnit-buyer",
      onRehydrateStorage: () => (state) => {
        if (state?.savedAt && Date.now() - state.savedAt > TTL_MS) {
          state.buyer = EMPTY_BUYER;
          state.savedAt = null;
        }
      },
    },
  ),
);