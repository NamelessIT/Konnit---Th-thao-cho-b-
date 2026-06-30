"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RequireUser } from "@/components/account/RequireUser";
import { QrTicketCard } from "@/components/account/QrTicketCard";
import { userOrdersApi, type UserOrderDetail } from "@/lib/auth/user-orders-api";
import { formatVND } from "@/lib/shop/format";

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <RequireUser>
      <OrderDetail code={code} />
    </RequireUser>
  );
}

function OrderDetail({ code }: { code: string }) {
  const [order, setOrder] = useState<UserOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await userOrdersApi.detail(code);
      setOrder(d);
      setError(d ? "" : "Không tìm thấy đơn hàng");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải đơn");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  // Polling 5s khi order đã paid và còn vé chưa dùng; dừng khi tab ẩn / hết vé / unmount.
  useEffect(() => {
    if (!order || order.status !== "paid") return;
    const anyUnused = order.items.some((i) => i.qr_token && !i.is_used);
    if (!anyUnused) return;

    const tick = () => {
      if (!document.hidden) load();
    };
    const timer = setInterval(tick, 5000);
    return () => clearInterval(timer);
  }, [order, load]);

  if (loading) return <main className="py-24 text-center text-[var(--konnit-muted)]">Đang tải…</main>;
  if (error || !order)
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="mb-4 text-red-500">{error || "Không tìm thấy đơn hàng"}</p>
        <Link href="/tai-khoan/don-hang" className="text-[var(--konnit-berry)] underline">
          ← Lịch sử đơn
        </Link>
      </main>
    );

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/tai-khoan/don-hang" className="text-sm text-[var(--konnit-muted)] hover:underline">
        ← Lịch sử đơn
      </Link>
      <h1 className="mt-2 text-2xl font-black text-[var(--konnit-ink)]">
        {order.event?.name ?? "Đơn hàng"}
      </h1>
      <p className="mb-6 text-sm text-[var(--konnit-muted)]">
        Mã đơn <b>{order.order_code}</b> · Tổng {formatVND(order.total)} ·{" "}
        {order.status === "paid" ? "Đã thanh toán" : order.status}
      </p>

      {order.status !== "paid" ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-800">
          Đơn chưa thanh toán xong nên chưa có vé QR.
          {order.status === "pending" && (
            <Link
              href={`/don-hang/${order.order_code}/thanh-toan`}
              className="ml-1 font-bold underline"
            >
              Thanh toán ngay
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {order.items.map((it) => (
            <QrTicketCard
              key={it.id}
              token={it.qr_token}
              attendeeName={it.attendee_name}
              ticketName={it.ticket_name}
              eventName={order.event?.name ?? ""}
              isUsed={it.is_used}
              checkedInAt={it.checked_in_at}
            />
          ))}
        </div>
      )}
    </main>
  );
}