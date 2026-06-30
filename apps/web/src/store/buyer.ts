import { create } from "zustand";
import type { BuyerInfo } from "@/lib/shop/types";
import type { CartOwnerKey } from "./cart";

const TTL_MS = 14 * 24 * 60 * 60 * 1000;
const LEGACY_BUYER_KEY = "konnit-buyer";
const BUYER_STORAGE_PREFIX = "konnit-buyer:";

interface BuyerSnapshot {
  buyer: BuyerInfo;
  savedAt: number | null;
}

interface BuyerState extends BuyerSnapshot {
  ownerKey: CartOwnerKey | null;
  hydrated: boolean;
  switchOwner: (
    ownerKey: CartOwnerKey,
    options?: { clearGuest?: boolean },
  ) => void;
  setBuyer: (b: Partial<BuyerInfo>) => void;
  clearBuyer: () => void;
}

const EMPTY_BUYER: BuyerInfo = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

function storageKey(ownerKey: CartOwnerKey) {
  return `${BUYER_STORAGE_PREFIX}${ownerKey}`;
}

function emptySnapshot(): BuyerSnapshot {
  return { buyer: { ...EMPTY_BUYER }, savedAt: null };
}

function normalizeSnapshot(value: unknown): BuyerSnapshot {
  if (!value || typeof value !== "object") return emptySnapshot();
  const candidate = value as {
    buyer?: unknown;
    savedAt?: unknown;
    state?: unknown;
  };
  const unwrapped =
    candidate.state && typeof candidate.state === "object"
      ? (candidate.state as { buyer?: unknown; savedAt?: unknown })
      : candidate;
  const savedAt =
    typeof unwrapped.savedAt === "number" ? unwrapped.savedAt : null;

  if (!savedAt || Date.now() - savedAt > TTL_MS) return emptySnapshot();
  if (!unwrapped.buyer || typeof unwrapped.buyer !== "object") {
    return emptySnapshot();
  }

  const buyer = unwrapped.buyer as Partial<BuyerInfo>;
  return {
    buyer: {
      contactName:
        typeof buyer.contactName === "string" ? buyer.contactName : "",
      contactPhone:
        typeof buyer.contactPhone === "string" ? buyer.contactPhone : "",
      contactEmail:
        typeof buyer.contactEmail === "string" ? buyer.contactEmail : "",
      ...(typeof buyer.contactAddress === "string"
        ? { contactAddress: buyer.contactAddress }
        : {}),
      ...(typeof buyer.guardianName === "string"
        ? { guardianName: buyer.guardianName }
        : {}),
      ...(typeof buyer.guardianPhone === "string"
        ? { guardianPhone: buyer.guardianPhone }
        : {}),
    },
    savedAt,
  };
}

function readSnapshot(ownerKey: CartOwnerKey): BuyerSnapshot {
  if (typeof window === "undefined") return emptySnapshot();
  try {
    const raw = window.localStorage.getItem(storageKey(ownerKey));
    return raw ? normalizeSnapshot(JSON.parse(raw)) : emptySnapshot();
  } catch {
    return emptySnapshot();
  }
}

function writeSnapshot(ownerKey: CartOwnerKey, snapshot: BuyerSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey(ownerKey),
    JSON.stringify({ version: 1, ...snapshot }),
  );
}

function migrateLegacyBuyer() {
  if (typeof window === "undefined") return;
  const legacy = window.localStorage.getItem(LEGACY_BUYER_KEY);
  if (!legacy) return;

  if (!window.localStorage.getItem(storageKey("guest"))) {
    try {
      writeSnapshot("guest", normalizeSnapshot(JSON.parse(legacy)));
    } catch {
      // Invalid legacy data is discarded below.
    }
  }
  window.localStorage.removeItem(LEGACY_BUYER_KEY);
}

export const useBuyerStore = create<BuyerState>((set, get) => {
  function save(snapshot: BuyerSnapshot) {
    const ownerKey = get().ownerKey;
    if (get().hydrated && ownerKey) writeSnapshot(ownerKey, snapshot);
  }

  return {
    ...emptySnapshot(),
    ownerKey: null,
    hydrated: false,

    switchOwner: (ownerKey, options = {}) => {
      migrateLegacyBuyer();
      if (options.clearGuest && ownerKey !== "guest") {
        window.localStorage.removeItem(storageKey("guest"));
      }
      if (get().hydrated && get().ownerKey === ownerKey) return;
      const current = get();
      const pendingSnapshot =
        !current.hydrated && current.savedAt
          ? { buyer: current.buyer, savedAt: current.savedAt }
          : null;
      const storedSnapshot = readSnapshot(ownerKey);
      const snapshot =
        pendingSnapshot &&
        (!storedSnapshot.savedAt ||
          pendingSnapshot.savedAt > storedSnapshot.savedAt)
          ? pendingSnapshot
          : storedSnapshot;
      if (pendingSnapshot) writeSnapshot(ownerKey, snapshot);
      set({ ...snapshot, ownerKey, hydrated: true });
    },
    setBuyer: (buyer) => {
      const snapshot = {
        buyer: { ...get().buyer, ...buyer },
        savedAt: Date.now(),
      };
      set(snapshot);
      save(snapshot);
    },
    clearBuyer: () => {
      const snapshot = emptySnapshot();
      set(snapshot);
      save(snapshot);
    },
  };
});
