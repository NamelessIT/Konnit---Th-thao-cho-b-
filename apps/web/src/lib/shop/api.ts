import type {
  TicketType,
  VoucherPreview,
  Order,
  CreateOrderPayload,
  PaymentSettings,
  PayResult,
} from "./types";
import { getMockTickets, getMockTicket } from "./mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export class VoucherValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VoucherValidationError";
  }
}

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms));
}

// Mock order store (in-memory cho dev)
const mockOrders = new Map<string, Order>();

function generateCode() {
  return "KNT" + Date.now().toString(36).toUpperCase().slice(-6);
}

async function fetchPublicData<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T | null; unavailable: boolean; errorMessage?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : undefined),
        ...init?.headers,
      },
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        data: null,
        unavailable: false,
        errorMessage: json.error?.message,
      };
    }
    return { data: json.data as T, unavailable: false };
  } catch {
    return { data: null, unavailable: true };
  }
}

async function listShopTickets(): Promise<TicketType[]> {
  const live = await fetchPublicData<TicketType[]>("/public/ticket-types");
  if (live.data) return live.data;
  if (!USE_MOCK || !live.unavailable) return [];
  await delay();
  return getMockTickets();
}

async function getShopTicket(id: number): Promise<TicketType | null> {
  const live = await fetchPublicData<TicketType>(`/public/ticket-types/${id}`);
  if (live.data) return live.data;
  if (!USE_MOCK || !live.unavailable) return null;
  await delay();
  return getMockTicket(id);
}

export const shopApi = {
  async listTickets(): Promise<TicketType[]> {
    return listShopTickets();
  },

  async getTicket(id: number): Promise<TicketType | null> {
    return getShopTicket(id);
  },

  async validateVoucher(
    code: string,
    subtotal: number,
  ): Promise<VoucherPreview | null> {
    const live = await fetchPublicData<VoucherPreview>("/public/vouchers/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    });
    if (live.data) return live.data;
    if (live.errorMessage) {
      throw new VoucherValidationError(live.errorMessage);
    }

    if (USE_MOCK && live.unavailable) {
      await delay(300);
      if (code.toUpperCase() === "KONNIT10") {
        const discount_amount = Math.round(subtotal * 0.1);
        return { code, discount_type: "percent", discount_value: 10, discount_amount };
      }
      return null; // invalid
    }

    return null;
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const live = await fetchPublicData<Order>("/public/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (live.data) return live.data;
    if (live.errorMessage) throw new Error(live.errorMessage);

    if (USE_MOCK && live.unavailable) {
      await delay(500);
      const tickets = await listShopTickets();
      const code = generateCode();
      const subtotal = payload.children.reduce((s, c) => {
        const ticket = tickets.find((t) => t.id === c.ticketTypeId);
        return s + (ticket?.current_price ?? 0);
      }, 0);
      const voucher = payload.voucherCode
        ? await shopApi.validateVoucher(payload.voucherCode, subtotal).catch(() => null)
        : null;
      const discount_amount = voucher?.discount_amount ?? 0;
      const order: Order = {
        order_code: code,
        status: "pending",
        subtotal,
        discount_amount,
        total: subtotal - discount_amount,
        contact_name: payload.contact.name,
        contact_phone: payload.contact.phone,
        contact_email: payload.contact.email,
        voucher_code: payload.voucherCode,
        payment_method: payload.paymentMethod,
        items: payload.children.map((c, i) => ({
          id: i + 1,
          ticket_type_id: c.ticketTypeId,
          ticket_name: tickets.find((t) => t.id === c.ticketTypeId)?.name ?? "",
          unit_price: tickets.find((t) => t.id === c.ticketTypeId)?.current_price ?? 0,
          attendee_name: c.attendeeName,
          attendee_dob: c.attendeeDob,
          attendee_gender: c.attendeeGender,
          shirt_size: c.shirtSize,
          medal_name: c.medalName,
          health_notes: c.healthNotes,
        })),
        created_at: new Date().toISOString(),
      };
      mockOrders.set(code, order);
      return order;
    }
    const res = await fetch(`${API_BASE_URL}/api/public/orders`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Tạo đơn thất bại");
    return json.data;
  },

  async getOrder(code: string, email?: string): Promise<Order | null> {
    const live = await fetchPublicData<Order>(
      `/public/orders/${code}${email ? `?email=${encodeURIComponent(email)}` : ""}`,
    );
    if (live.data) return live.data;

    if (USE_MOCK && live.unavailable) {
      await delay(200);
      return mockOrders.get(code) ?? null;
    }
    const url = `${API_BASE_URL}/api/public/orders/${code}${email ? `?email=${encodeURIComponent(email)}` : ""}`;
    const res = await fetch(url,{credentials: "include"});
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  },

  async payOrder(code: string, method: "card" | "qr" | "bank"): Promise<PayResult> {
    const live = await fetchPublicData<PayResult>(
      `/public/orders/${code}/pay`,
      {
        method: "POST",
        body: JSON.stringify({ method }),
      },
    );
    if (live.data) return live.data;
    if (live.errorMessage) throw new Error(live.errorMessage);

    if (USE_MOCK && live.unavailable) {
      await delay(800);
      const order = mockOrders.get(code);
      // Chuyển khoản: giữ pending, chờ admin xác nhận. Thẻ/ví: paid ngay.
      if (method === "bank") {
        return { status: "pending", awaitingTransfer: true };
      }
      if (order) {
        order.status = "paid";
        mockOrders.set(code, order);
      }
      return { status: "paid" };
    }
    const res = await fetch(`${API_BASE_URL}/api/public/orders/${code}/pay`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    });
    const json = await res.json();
    return json.data;
  },

  async getPaymentSettings(): Promise<PaymentSettings | null> {
    const live = await fetchPublicData<PaymentSettings>("/public/settings/payment");
    return live.data;
  },
};
