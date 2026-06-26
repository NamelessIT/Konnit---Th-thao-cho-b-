import type { TicketType } from "./types";

// 3 vé giả — khớp với seed DB (Konnit Kids Run 2026)
export const MOCK_TICKETS: TicketType[] = [
  {
    id: 1, event_id: 1, name: "Vé thi đấu – Mầm", slug: "mam",
    description: "Dành cho bé 2–3 tuổi. Bao gồm BIB, áo thi đấu, huy chương hoàn thành.",
    age_group: "2–3 tuổi", age_min: 2, age_max: 3,
    price: 250000, early_bird_price: 200000, current_price: 200000, is_early_bird: true,
    quota_total: 100, available: 87, includes_shirt: true, image_path: null,
    event_name: "Konnit Kids Run 2026", event_slug: "konnit-kids-run-2026",
    event_location: "Công viên Tao Đàn, TP.HCM", event_starts_at: "2026-07-25T07:00:00+07:00",
  },
  {
    id: 2, event_id: 1, name: "Vé thi đấu – Chồi", slug: "choi",
    description: "Dành cho bé 4–6 tuổi. Bao gồm BIB, áo thi đấu, huy chương hoàn thành.",
    age_group: "4–6 tuổi", age_min: 4, age_max: 6,
    price: 300000, early_bird_price: 250000, current_price: 250000, is_early_bird: true,
    quota_total: 100, available: 64, includes_shirt: true, image_path: null,
    event_name: "Konnit Kids Run 2026", event_slug: "konnit-kids-run-2026",
    event_location: "Công viên Tao Đàn, TP.HCM", event_starts_at: "2026-07-25T07:00:00+07:00",
  },
  {
    id: 3, event_id: 1, name: "Vé trải nghiệm (Fun)", slug: "fun",
    description: "Mọi lứa tuổi. Không tính thành tích, có quà tham gia.",
    age_group: "Mọi lứa", age_min: 2, age_max: 12,
    price: 150000, early_bird_price: null, current_price: 150000, is_early_bird: false,
    quota_total: 200, available: 152, includes_shirt: false, image_path: null,
    event_name: "Konnit Kids Run 2026", event_slug: "konnit-kids-run-2026",
    event_location: "Công viên Tao Đàn, TP.HCM", event_starts_at: "2026-07-25T07:00:00+07:00",
  },
];

export const getMockTickets = (): TicketType[] => MOCK_TICKETS;
export const getMockTicket = (id: number): TicketType | null =>
  MOCK_TICKETS.find((t) => t.id === id) ?? null;