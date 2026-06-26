import type { TicketType, VoucherPreview, Order, CreateOrderPayload } from "./types";
import { getMockTickets, getMockTicket } from "./mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms));
}

// Mock order store (in-memory cho dev)
const mockOrders = new Map<string, Order>();

function generateCode() {
  return "KNT" + Date.now().toString(36).toUpperCase().slice(-6);
}

export const shopApi = {
  async listTickets(): Promise<TicketType[]> {
    if (USE_MOCK) {
      await delay();
      return getMockTickets();
    }
    const res = await fetch("/api/public/ticket-types");
    const json = await res.json();
    return json.data;
  },

  async getTicket(id: number): Promise<TicketType | null> {
    if (USE_MOCK) {
      await delay();
      return getMockTicket(id);
    }
    const res = await fetch(`/api/public/ticket-types/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  },

  async validateVoucher(
    code: string,
    subtotal: number,
  ): Promise<VoucherPreview | null> {
    if (USE_MOCK) {
      await delay(300);
      if (code.toUpperCase() === "KONNIT10") {
        const discount_amount = Math.round(subtotal * 0.1);
        return { code, discount_type: "percent", discount_value: 10, discount_amount };
      }
      return null; // invalid
    }
    const res = await fetch("/api/public/vouchers/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    if (USE_MOCK) {
      await delay(500);
      const code = generateCode();
      const subtotal = payload.children.reduce((s, c) => {
        const ticket = getMockTicket(c.ticketTypeId);
        return s + (ticket?.current_price ?? 0);
      }, 0);
      const discount_amount = 0; // voucher mock đơn giản
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
          ticket_name: getMockTicket(c.ticketTypeId)?.name ?? "",
          unit_price: getMockTicket(c.ticketTypeId)?.current_price ?? 0,
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
    const res = await fetch("/api/public/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Tạo đơn thất bại");
    return json.data;
  },

  async getOrder(code: string, email?: string): Promise<Order | null> {
    if (USE_MOCK) {
      await delay(200);
      return mockOrders.get(code) ?? null;
    }
    const url = `/api/public/orders/${code}${email ? `?email=${encodeURIComponent(email)}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  },

  async payOrder(code: string, method: "card" | "qr" | "bank"): Promise<{ status: string; redirectUrl?: string }> {
    if (USE_MOCK) {
      await delay(800);
      const order = mockOrders.get(code);
      if (order) {
        order.status = "paid";
        mockOrders.set(code, order);
      }
      return { status: "paid" };
    }
    const res = await fetch(`/api/public/orders/${code}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    });
    const json = await res.json();
    return json.data;
  },
};