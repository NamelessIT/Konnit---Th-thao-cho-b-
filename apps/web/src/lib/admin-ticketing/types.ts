export interface AdminEvent {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  map_url?: string | null;
  starts_at?: string | null;
  registration_opens_at?: string | null;
  registration_closes_at?: string | null;
  banner_path?: string | null;
  cms_page_id?: number | null;
  status: "draft" | "published" | "archived";
  created_at?: string;
}

export interface AdminTicketType {
  id: number;
  event_id: number;
  event_name?: string;
  name: string;
  slug: string;
  description?: string | null;
  age_group?: string | null;
  age_min?: number | null;
  age_max?: number | null;
  gender_restriction?: "any" | "male" | "female";
  price: number;
  early_bird_price?: number | null;
  early_bird_until?: string | null;
  quota_total: number;
  sold_count?: number;
  reserved_count?: number;
  includes_shirt: boolean;
  image_path?: string | null;
  sort_order?: number;
  status: "draft" | "published" | "archived";
}

export interface AdminVoucher {
  id: number;
  code: string;
  description?: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses?: number | null;
  used_count: number;
  starts_at?: string | null;
  expires_at?: string | null;
  status: "active" | "disabled";
}

export interface AdminOrder {
  order_code: string;
  status: "pending" | "paid" | "failed" | "expired";
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  total: number;
  payment_method?: "card" | "qr" | "bank";
  created_at: string;
  items: Array<{
    id: number;
    ticket_name: string;
    attendee_name: string;
    unit_price: number;
  }>;
}