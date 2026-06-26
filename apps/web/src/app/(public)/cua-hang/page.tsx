import { getMockTickets } from "@/lib/shop/mock-data";
import { TicketCard } from "@/components/shop/TicketCard";

export const metadata = { title: "Cửa hàng — Konnit" };

export default function CuaHangPage() {
  const tickets = getMockTickets();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-black text-[var(--konnit-ink)]">Đăng ký tham gia</h1>
      <p className="mb-8 text-[var(--konnit-muted)]">Konnit Kids Run 2026 — Công viên Tao Đàn, 25/07/2026</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </main>
  );
}