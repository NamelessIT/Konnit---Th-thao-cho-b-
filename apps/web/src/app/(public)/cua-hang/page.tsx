import { TicketCard } from "@/components/shop/TicketCard";
import { shopApi } from "@/lib/shop/api";
import type { TicketType } from "@/lib/shop/types";

export const metadata = { title: "Cửa hàng - Konnit" };

interface EventTicketSection {
  eventId: number;
  name: string;
  location?: string;
  startsAt?: string;
  tickets: TicketType[];
}

function groupTicketsByEvent(tickets: TicketType[]) {
  const sectionMap = new Map<number, EventTicketSection>();

  tickets.forEach((ticket) => {
    const section = sectionMap.get(ticket.event_id);
    if (section) {
      section.tickets.push(ticket);
      return;
    }

    sectionMap.set(ticket.event_id, {
      eventId: ticket.event_id,
      name: ticket.event_name,
      location: ticket.event_location,
      startsAt: ticket.event_starts_at,
      tickets: [ticket],
    });
  });

  return [...sectionMap.values()].sort((a, b) => {
    const aTime = a.startsAt ? new Date(a.startsAt).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.startsAt ? new Date(b.startsAt).getTime() : Number.POSITIVE_INFINITY;
    if (aTime !== bTime) return aTime - bTime;
    return a.name.localeCompare(b.name, "vi");
  });
}

function formatEventMeta(section: EventTicketSection) {
  const date = section.startsAt
    ? new Date(section.startsAt).toLocaleDateString("vi-VN")
    : null;

  return [section.location, date].filter(Boolean).join(", ");
}

export default async function CuaHangPage() {
  const tickets = await shopApi.listTickets();
  const sections = groupTicketsByEvent(tickets);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-black text-[var(--konnit-ink)]">Đăng ký tham gia</h1>
      <p className="mb-10 text-[var(--konnit-muted)]">
        Chọn sự kiện và loại vé phù hợp để đăng ký tham gia.
      </p>

      <div className="space-y-12">
        {sections.length === 0 && (
          <p className="rounded-xl border border-slate-100 bg-white p-6 text-sm text-[var(--konnit-muted)] shadow-sm">
            Chưa có vé published để bán.
          </p>
        )}

        {sections.map((section) => (
          <section key={section.eventId}>
            <div className="mb-5">
              <h2 className="text-2xl font-black text-[var(--konnit-ink)]">
                {section.name}
              </h2>
              {formatEventMeta(section) && (
                <p className="mt-1 text-sm text-[var(--konnit-muted)]">
                  {formatEventMeta(section)}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
