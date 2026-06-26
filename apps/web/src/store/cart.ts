import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VoucherPreview } from "@/lib/shop/types";

export interface CartItem {
  ticketTypeId: number;
  name: string;
  eventName: string;
  eventSlug: string;
  ageGroup?: string;
  unitPrice: number;
  quantity: number;
  selected: boolean;
}

interface CartState {
  items: CartItem[];
  voucher: VoucherPreview | null;
  add: (item: Omit<CartItem, "quantity" | "selected">, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  toggleSelect: (id: number) => void;

  selectOnly: (id: number) => void; // <-- thêm ở đây

  setAllSelected: (v: boolean) => void;
  setVoucher: (voucher: VoucherPreview | null) => void;
  clearVoucher: () => void;
  clearSelected: () => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      voucher: null,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.ticketTypeId === item.ticketTypeId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.ticketTypeId === item.ticketTypeId
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: qty, selected: true }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.ticketTypeId !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.ticketTypeId === id ? { ...i, quantity: Math.max(1, qty) } : i,
          ),
        })),
      toggleSelect: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.ticketTypeId === id ? { ...i, selected: !i.selected } : i,
          ),
        })),
      selectOnly: (id) =>
        set((s) => ({
          items: s.items.map((i) => ({
            ...i,
            selected: i.ticketTypeId === id,
          })),
        })),
      setAllSelected: (v) =>
        set((s) => ({ items: s.items.map((i) => ({ ...i, selected: v })) })),
      setVoucher: (voucher) => set({ voucher }),
      clearVoucher: () => set({ voucher: null }),
      clearSelected: () => set((s) => ({ items: s.items.filter((i) => !i.selected), voucher: null })),
      clear: () => set({ items: [], voucher: null }),
    }),
    { name: "konnit-cart" },
  ),
);
