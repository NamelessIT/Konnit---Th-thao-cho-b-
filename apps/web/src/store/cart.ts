import { create } from "zustand";
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

export type CartOwnerKey = "guest" | `user:${number}`;

interface CartSnapshot {
  items: CartItem[];
  voucher: VoucherPreview | null;
}

interface SwitchCartOwnerOptions {
  mergeGuest?: boolean;
}

interface CartState extends CartSnapshot {
  ownerKey: CartOwnerKey | null;
  hydrated: boolean;
  switchOwner: (
    ownerKey: CartOwnerKey,
    options?: SwitchCartOwnerOptions,
  ) => void;
  add: (item: Omit<CartItem, "quantity" | "selected">, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  toggleSelect: (id: number) => void;
  selectOnly: (id: number) => void;
  setAllSelected: (v: boolean) => void;
  setVoucher: (voucher: VoucherPreview | null) => void;
  clearVoucher: () => void;
  clearSelected: () => void;
  clear: () => void;
}

const EMPTY_CART: CartSnapshot = { items: [], voucher: null };
const LEGACY_CART_KEY = "konnit-cart";
const CART_STORAGE_PREFIX = "konnit-cart:";

export function cartOwnerKey(userId?: number | null): CartOwnerKey {
  return userId ? `user:${userId}` : "guest";
}

function storageKey(ownerKey: CartOwnerKey) {
  return `${CART_STORAGE_PREFIX}${ownerKey}`;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    Number.isInteger(item.ticketTypeId) &&
    typeof item.name === "string" &&
    typeof item.eventName === "string" &&
    typeof item.eventSlug === "string" &&
    typeof item.unitPrice === "number" &&
    Number.isInteger(item.quantity) &&
    (item.quantity ?? 0) > 0 &&
    typeof item.selected === "boolean"
  );
}

function normalizeSnapshot(value: unknown): CartSnapshot {
  if (!value || typeof value !== "object") return { ...EMPTY_CART };
  const candidate = value as {
    items?: unknown;
    state?: unknown;
    voucher?: unknown;
  };
  const unwrapped =
    candidate.state && typeof candidate.state === "object"
      ? (candidate.state as { items?: unknown; voucher?: unknown })
      : candidate;

  return {
    items: Array.isArray(unwrapped.items)
      ? unwrapped.items.filter(isCartItem)
      : [],
    voucher:
      unwrapped.voucher && typeof unwrapped.voucher === "object"
        ? (unwrapped.voucher as VoucherPreview)
        : null,
  };
}

function readSnapshot(ownerKey: CartOwnerKey): CartSnapshot {
  if (typeof window === "undefined") return { ...EMPTY_CART };
  try {
    const raw = window.localStorage.getItem(storageKey(ownerKey));
    return raw ? normalizeSnapshot(JSON.parse(raw)) : { ...EMPTY_CART };
  } catch {
    return { ...EMPTY_CART };
  }
}

function writeSnapshot(ownerKey: CartOwnerKey, snapshot: CartSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey(ownerKey),
    JSON.stringify({ version: 1, ...snapshot }),
  );
}

function migrateLegacyCart() {
  if (typeof window === "undefined") return;
  const legacy = window.localStorage.getItem(LEGACY_CART_KEY);
  if (!legacy) return;

  if (!window.localStorage.getItem(storageKey("guest"))) {
    try {
      writeSnapshot("guest", normalizeSnapshot(JSON.parse(legacy)));
    } catch {
      // Invalid legacy data is discarded below.
    }
  }
  window.localStorage.removeItem(LEGACY_CART_KEY);
}

function mergeSnapshots(
  accountCart: CartSnapshot,
  guestCart: CartSnapshot,
): CartSnapshot {
  const items = [...accountCart.items];

  for (const guestItem of guestCart.items) {
    const index = items.findIndex(
      (item) => item.ticketTypeId === guestItem.ticketTypeId,
    );
    if (index < 0) {
      items.push(guestItem);
      continue;
    }

    items[index] = {
      ...items[index],
      quantity: Math.max(items[index].quantity, guestItem.quantity),
      selected: items[index].selected || guestItem.selected,
    };
  }

  return {
    items,
    voucher: accountCart.voucher ?? guestCart.voucher,
  };
}

export const useCartStore = create<CartState>((set, get) => {
  function update(
    updater: (state: CartState) => Partial<CartState>,
  ) {
    set(updater);
    const state = get();
    if (state.hydrated && state.ownerKey) {
      writeSnapshot(state.ownerKey, {
        items: state.items,
        voucher: state.voucher,
      });
    }
  }

  return {
    ...EMPTY_CART,
    ownerKey: null,
    hydrated: false,

    switchOwner: (ownerKey, options = {}) => {
      migrateLegacyCart();
      if (
        get().hydrated &&
        get().ownerKey === ownerKey &&
        !options.mergeGuest
      ) {
        return;
      }

      const current = get();
      const pendingSnapshot =
        !current.hydrated && (current.items.length > 0 || current.voucher)
          ? { items: current.items, voucher: current.voucher }
          : null;
      let snapshot = readSnapshot(ownerKey);
      if (options.mergeGuest && ownerKey !== "guest") {
        snapshot = mergeSnapshots(snapshot, readSnapshot("guest"));
        writeSnapshot(ownerKey, snapshot);
        window.localStorage.removeItem(storageKey("guest"));
      }
      if (pendingSnapshot) {
        snapshot = mergeSnapshots(snapshot, pendingSnapshot);
        writeSnapshot(ownerKey, snapshot);
      }

      set({ ...snapshot, ownerKey, hydrated: true });
    },

    add: (item, qty = 1) =>
      update((state) => {
        const existing = state.items.find(
          (current) => current.ticketTypeId === item.ticketTypeId,
        );
        if (existing) {
          return {
            items: state.items.map((current) =>
              current.ticketTypeId === item.ticketTypeId
                ? { ...current, quantity: current.quantity + qty }
                : current,
            ),
          };
        }
        return {
          items: [
            ...state.items,
            { ...item, quantity: qty, selected: true },
          ],
        };
      }),
    remove: (id) =>
      update((state) => ({
        items: state.items.filter((item) => item.ticketTypeId !== id),
      })),
    setQty: (id, qty) =>
      update((state) => ({
        items: state.items.map((item) =>
          item.ticketTypeId === id
            ? { ...item, quantity: Math.max(1, qty) }
            : item,
        ),
      })),
    toggleSelect: (id) =>
      update((state) => ({
        items: state.items.map((item) =>
          item.ticketTypeId === id
            ? { ...item, selected: !item.selected }
            : item,
        ),
      })),
    selectOnly: (id) =>
      update((state) => ({
        items: state.items.map((item) => ({
          ...item,
          selected: item.ticketTypeId === id,
        })),
      })),
    setAllSelected: (selected) =>
      update((state) => ({
        items: state.items.map((item) => ({ ...item, selected })),
      })),
    setVoucher: (voucher) => update(() => ({ voucher })),
    clearVoucher: () => update(() => ({ voucher: null })),
    clearSelected: () =>
      update((state) => ({
        items: state.items.filter((item) => !item.selected),
        voucher: null,
      })),
    clear: () => update(() => ({ ...EMPTY_CART })),
  };
});
