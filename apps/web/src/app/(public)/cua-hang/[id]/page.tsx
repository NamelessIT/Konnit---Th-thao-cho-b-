import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Clock, Shirt } from "lucide-react";
import { getMockTicket } from "@/lib/shop/mock-data";
import { formatVND } from "@/lib/shop/format";
import { Badge } from "@/components/ui/badge";
import { TicketDetailActions } from "@/components/shop/TicketDetailActions";
interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const ticket = getMockTicket(Number(id));
  return { title: ticket ? `${ticket.name} — Konnit` : "Không tìm thấy" };
}

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
  const ticket = getMockTicket(Number(id));
  if (!ticket) notFound();

  const soldOut = ticket.available === 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/cua-hang"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--konnit-muted)] hover:text-[var(--konnit-berry)]"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại cửa hàng
      </Link>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start gap-2">
          {ticket.is_early_bird && (
            <Badge className="bg-orange-500 text-white">Early Bird</Badge>
          )}
          {soldOut && <Badge variant="destructive">Hết suất</Badge>}
        </div>

        <h1 className="mb-1 text-2xl font-black text-[var(--konnit-ink)]">{ticket.name}</h1>
        {ticket.age_group && (
          <p className="mb-4 text-sm text-[var(--konnit-muted)]">Độ tuổi: {ticket.age_group}</p>
        )}

        <p className="mb-6 text-slate-600">{ticket.description}</p>

        {/* Event info */}
        <div className="mb-6 space-y-2 rounded-xl bg-[var(--konnit-pink-02)] p-4 text-sm">
          <p className="font-bold text-[var(--konnit-ink)]">{ticket.event_name}</p>
          {ticket.event_location && (
            <div className="flex items-center gap-2 text-[var(--konnit-muted)]">
              <MapPin className="h-4 w-4 shrink-0" />
              {ticket.event_location}
            </div>
          )}
          {ticket.event_starts_at && (
            <div className="flex items-center gap-2 text-[var(--konnit-muted)]">
              <Calendar className="h-4 w-4 shrink-0" />
              {new Date(ticket.event_starts_at).toLocaleString("vi-VN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </div>
          )}
        </div>

        {/* Includes */}
        <ul className="mb-6 space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> BIB số thi đấu
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Huy chương hoàn thành
          </li>
          {ticket.includes_shirt && (
            <li className="flex items-center gap-2">
              <Shirt className="h-4 w-4 text-[var(--konnit-berry)]" /> Áo thi đấu Konnit
            </li>
          )}
        </ul>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-[var(--konnit-berry)]">
              {formatVND(ticket.current_price)}
            </p>
            {ticket.is_early_bird && ticket.early_bird_price && (
              <p className="text-sm text-slate-400 line-through">{formatVND(ticket.price)}</p>
            )}
            <p className="mt-0.5 text-xs text-slate-400">Còn {ticket.available} suất</p>
          </div>

          <TicketDetailActions ticket={ticket} disabled={soldOut} />        
          </div>
      </div>
    </main>
  );
}