"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Printer, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrTicketCard } from "@/components/account/QrTicketCard";
import { shopApi } from "@/lib/shop/api";
import { formatVND } from "@/lib/shop/format";
import type { Order } from "@/lib/shop/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function Row({ label, value, bold, red }: { label: string; value: string; bold?: boolean; red?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className={["font-medium text-right", bold ? "font-bold" : "", red ? "text-(--konnit-berry)" : "text-slate-800"].join(" ")}>
        {value}
      </span>
    </div>
  );
}

export default function BienNhanPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    shopApi.getOrder(code).then((o) => {
      if (!o || o.status !== "paid") { setNotFound(true); }
      else { setOrder(o); }
      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, [code]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-(--konnit-berry)" />
        <p className="text-sm text-slate-500">Đang tải biên nhận…</p>
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-black text-slate-800">Biên nhận không tồn tại</h1>
        <p className="mb-6 text-sm text-slate-500">Đơn hàng chưa được thanh toán hoặc mã không hợp lệ.</p>
        <Link href="/cua-hang"><Button>Về cửa hàng</Button></Link>
      </main>
    );
  }

  const dateStr = formatDate(order.paid_at ?? order.created_at);

  return (
    <>
    <style>{`@page { margin: 0; } @media print { body { padding: 12mm 15mm; } }`}</style>
    <main className="mx-auto max-w-2xl px-4 py-10 print:max-w-none print:px-0 print:py-0">
      {/* toolbar — ẩn khi in */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/don-hang/${code}`}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />Xem đơn hàng
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />In biên nhận
        </Button>
      </div>

      {/* receipt card */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm print:border-0 print:shadow-none">
        {/* header */}
        <div className="rounded-t-2xl bg-[var(--konnit-berry)] px-8 py-8 text-center text-white">
          <p className="mb-1 text-xs uppercase tracking-[3px] text-white/70">Thể thao cho bé</p>
          <h1 className="text-3xl font-black tracking-tight">KONNIT</h1>
        </div>

        {/* order id + date */}
        <div className="border-b border-slate-100 px-8 py-6 text-center">
          <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">Biên nhận thanh toán</p>
          <p className="text-2xl font-black text-(--konnit-berry)">{order.order_code}</p>
          <p className="mt-1 text-sm text-slate-500">{dateStr}</p>
        </div>

        <div className="space-y-6 px-8 py-6">
          {/* customer */}
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Thông tin người đặt
            </h2>
            <div className="rounded-xl bg-slate-50 px-4 py-1">
              <Row label="Họ và tên" value={order.contact_name} bold />
              <Row label="Số điện thoại" value={order.contact_phone} />
              <Row label="Email" value={order.contact_email} />
              {order.voucher_code && <Row label="Mã voucher" value={order.voucher_code} />}
            </div>
          </section>

          {/* items */}
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Vé đã đặt ({order.items.length} vé)
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="print:break-inside-avoid">
                  <QrTicketCard
                    token={item.qr_token ?? null}
                    attendeeName={item.attendee_name}
                    ticketName={item.ticket_name}
                    eventName=""
                    isUsed={!!item.checked_in_at}
                    checkedInAt={item.checked_in_at ?? null}
                  />
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 px-1 text-sm text-slate-500">
                    {item.shirt_size && <span>Áo: <span className="font-medium">{item.shirt_size}</span></span>}
                    {item.medal_name && <span>Huy chương: <span className="font-medium">{item.medal_name}</span></span>}
                    <span className="font-bold text-(--konnit-berry)">{formatVND(item.unit_price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-2 text-center text-xs text-slate-400">
              Quét mã QR khi làm thủ tục check-in tại sự kiện.
            </p>
          </section>

          {/* totals */}
          <section className="rounded-xl bg-slate-50 px-4 py-1">
            {order.discount_amount > 0 && (
              <>
                <Row label="Tạm tính" value={formatVND(order.subtotal)} />
                <Row label="Giảm giá" value={`− ${formatVND(order.discount_amount)}`} />
              </>
            )}
            <div className="flex justify-between border-t border-slate-200 py-3 text-base">
              <span className="font-black text-slate-800">Tổng cộng</span>
              <span className="text-xl font-black text-(--konnit-berry)">{formatVND(order.total)}</span>
            </div>
          </section>

          {/* footer note */}
          <p className="text-center text-xs text-slate-400">
            Cảm ơn bạn đã tin tưởng và đồng hành cùng <strong className="text-slate-600">Konnit</strong>.
            Lưu lại trang này hoặc mã đơn <strong className="text-(--konnit-berry)">{order.order_code}</strong> để xem lại bất kỳ lúc nào.
          </p>
        </div>
      </div>
    </main>
    </>
  );
}
