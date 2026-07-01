import type {
  DiscountType,
  OrderStatus,
  PaymentMethod,
} from "@konnit/types";

// Khớp shape API trả về sau này (enrichTicket) để swap mock→thật dễ dàng.
export interface TicketType {
  id: number;
  event_id: number;
  name: string;
  slug: string;
  description?: string;
  age_group?: string;
  age_min?: number;
  age_max?: number;
  price: number;
  early_bird_price: number | null;
  current_price: number;
  is_early_bird: boolean;
  quota_total: number;
  available: number;
  includes_shirt: boolean;
  image_path?: string | null;
  event_name: string;
  event_slug: string;
  event_location?: string;
  event_starts_at?: string;
}

export interface BuyerInfo {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress?: string;
  guardianName?: string;
  guardianPhone?: string;
}

// Thông tin từng bé khi checkout (FR-03)
export interface ChildInfo {
  ticketTypeId: number;
  attendeeName: string;
  attendeeDob: string;       // yyyy-mm-dd
  attendeeGender?: string;
  shirtSize?: string;
  medalName?: string;
  healthNotes?: string;
}

export interface VoucherPreview {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
}

export interface OrderItem {
  id: number;
  ticket_type_id: number;
  ticket_name: string;
  unit_price: number;
  attendee_name: string;
  attendee_dob: string;
  attendee_gender?: string;
  shirt_size?: string;
  medal_name?: string;
  health_notes?: string;
  qr_token?: string;
  checked_in_at?: string | null;
}

export interface Order {
  order_code: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  total: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  voucher_code?: string;
  payment_method?: PaymentMethod;
  paid_at?: string | null;
  items: OrderItem[];
  created_at: string;
}

// Cấu hình chuyển khoản công khai (admin cấu hình từ panel)
export interface PaymentSettings {
  qrImagePath: string | null;
  accountName: string;
  accountNumber: string;
  bankName: string;
  note: string;
}

// Cấu hình SMTP (admin, có mask password)
export interface SmtpSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export interface PayResult {
  status: OrderStatus;
  awaitingTransfer?: boolean;
  redirectUrl?: string;
}

export interface CreateOrderPayload {
  contact: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    guardianName?: string;
    guardianPhone?: string;
  };
  children: ChildInfo[];
  voucherCode?: string;
  agreedTerms: boolean;
  paymentMethod: PaymentMethod;
}
