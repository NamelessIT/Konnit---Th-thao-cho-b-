import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "@/lib/auth/api";
import { useAuth } from "@/store/auth";
import { useBuyerStore } from "@/store/buyer";
import { useCartStore, type CartItem } from "@/store/cart";

function ticket(ticketTypeId: number): Omit<CartItem, "quantity" | "selected"> {
  return {
    ticketTypeId,
    name: `Vé ${ticketTypeId}`,
    eventName: "Konnit Event",
    eventSlug: "konnit-event",
    unitPrice: 100_000,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  useCartStore.setState({
    items: [],
    voucher: null,
    ownerKey: null,
    hydrated: false,
  });
  useBuyerStore.setState({
    buyer: { contactName: "", contactPhone: "", contactEmail: "" },
    savedAt: null,
    ownerKey: null,
    hydrated: false,
  });
  useAuth.setState({
    user: null,
    roles: [],
    permissions: [],
    initialized: false,
    loading: false,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("owner-scoped cart storage", () => {
  it("isolates carts for two users on the same browser", () => {
    const cart = useCartStore.getState();

    cart.switchOwner("guest");
    useCartStore.getState().add(ticket(1), 2);

    useCartStore
      .getState()
      .switchOwner("user:101", { mergeGuest: true });
    expect(useCartStore.getState().items.map((item) => item.ticketTypeId)).toEqual([
      1,
    ]);
    useCartStore.getState().add(ticket(2));

    useCartStore.getState().switchOwner("guest");
    expect(useCartStore.getState().items).toEqual([]);
    useCartStore.getState().add(ticket(3));

    useCartStore
      .getState()
      .switchOwner("user:202", { mergeGuest: true });
    expect(useCartStore.getState().items.map((item) => item.ticketTypeId)).toEqual([
      3,
    ]);

    useCartStore.getState().switchOwner("user:101");
    expect(
      useCartStore.getState().items.map((item) => item.ticketTypeId).sort(),
    ).toEqual([1, 2]);
  });

  it("migrates the old Zustand cart into the guest namespace once", () => {
    window.localStorage.setItem(
      "konnit-cart",
      JSON.stringify({
        state: {
          items: [{ ...ticket(7), quantity: 1, selected: true }],
          voucher: null,
        },
        version: 0,
      }),
    );

    useCartStore.getState().switchOwner("guest");

    expect(useCartStore.getState().items[0]?.ticketTypeId).toBe(7);
    expect(window.localStorage.getItem("konnit-cart")).toBeNull();
    expect(window.localStorage.getItem("konnit-cart:guest")).not.toBeNull();
  });

  it("switches to the Google user cart when applying a session", () => {
    useCartStore.getState().switchOwner("guest");
    useCartStore.getState().add(ticket(9));

    useAuth.getState().applySession({
      user: {
        id: 303,
        email: "user303@example.com",
        fullName: "User 303",
        avatarUrl: null,
        emailVerified: true,
      },
      roles: ["customer"],
      permissions: [],
    });

    expect(useCartStore.getState().ownerKey).toBe("user:303");
    expect(useCartStore.getState().items[0]?.ticketTypeId).toBe(9);
    expect(window.localStorage.getItem("konnit-cart:guest")).toBeNull();
  });

  it("keeps cart actions made while auth session is still loading", () => {
    useCartStore.getState().add(ticket(11));
    expect(useCartStore.getState().hydrated).toBe(false);

    useCartStore.getState().switchOwner("user:505");

    expect(useCartStore.getState().items[0]?.ticketTypeId).toBe(11);
    expect(window.localStorage.getItem("konnit-cart:user:505")).not.toBeNull();
  });

  it("shows an empty guest cart after logout without deleting the user cart", async () => {
    vi.spyOn(authApi, "logout").mockResolvedValueOnce();
    useCartStore.getState().switchOwner("user:606");
    useCartStore.getState().add(ticket(12));

    await useAuth.getState().signOut();

    expect(useCartStore.getState().ownerKey).toBe("guest");
    expect(useCartStore.getState().items).toEqual([]);

    useCartStore.getState().switchOwner("user:606");
    expect(useCartStore.getState().items[0]?.ticketTypeId).toBe(12);
  });
});

describe("owner-scoped buyer cache", () => {
  it("does not expose one user's contact details to another user or guest", () => {
    useBuyerStore.getState().switchOwner("user:101");
    useBuyerStore.getState().setBuyer({
      contactName: "User A",
      contactPhone: "0901000000",
      contactEmail: "a@example.com",
    });

    useBuyerStore.getState().switchOwner("user:202");
    expect(useBuyerStore.getState().buyer.contactEmail).toBe("");

    useBuyerStore.getState().switchOwner("guest");
    expect(useBuyerStore.getState().buyer.contactEmail).toBe("");

    useBuyerStore.getState().switchOwner("user:101");
    expect(useBuyerStore.getState().buyer.contactEmail).toBe("a@example.com");
  });

  it("clears guest contact details when a user signs in", () => {
    useBuyerStore.getState().switchOwner("guest");
    useBuyerStore.getState().setBuyer({
      contactName: "Guest",
      contactPhone: "0909000000",
      contactEmail: "guest@example.com",
    });

    useBuyerStore
      .getState()
      .switchOwner("user:404", { clearGuest: true });
    useBuyerStore.getState().switchOwner("guest");

    expect(useBuyerStore.getState().buyer.contactEmail).toBe("");
  });
});
