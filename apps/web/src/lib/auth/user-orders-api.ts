const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export interface UserOrderSummary {
  order_code: string;
  status: string;
  total: number;
  created_at: string;
  paid_at: string | null;
  item_count: number;
  event_name: string | null;
  event_slug: string | null;
}

export interface UserOrderItem {
  id: number;
  ticket_name: string;
  attendee_name: string;
  attendee_dob: string | null;
  qr_token: string | null;
  is_used: boolean;
  checked_in_at: string | null;
}

export interface UserOrderDetail {
  order_code: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  created_at: string;
  paid_at: string | null;
  contact_name: string;
  contact_email: string;
  event: { name: string; slug: string; starts_at: string | null; location: string | null } | null;
  items: UserOrderItem[];
}

export interface UserOrderList {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  orders: UserOrderSummary[];
}

export const userOrdersApi = {
  async list(params: { page?: number; status?: string }): Promise<UserOrderList> {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.status) qs.set("status", params.status);
    const res = await fetch(`${API}/api/user/orders?${qs.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Không tải được đơn hàng");
    return json.data as UserOrderList;
  },

  async detail(code: string): Promise<UserOrderDetail | null> {
    const res = await fetch(`${API}/api/user/orders/${code}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Không tải được đơn hàng");
    return json.data as UserOrderDetail;
  },
};