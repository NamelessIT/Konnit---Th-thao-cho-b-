"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shopApi } from "@/lib/shop/api";
import { formatVND } from "@/lib/shop/format";
import type { Order } from "@/lib/shop/types";

export function OrderStatusPanel({ code }: { code: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadOrder() {
      const result = await shopApi.getOrder(code);
      if (!alive) return;
      setOrder(result);
      setIsLoading(false);
    }

    loadOrder();

    return () => {
      alive = false;
    };
  }, [code]);

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[var(--konnit-berry)]" />
        <p className="text-sm text-[var(--konnit-muted)]">Đang tải trạng thái đơn...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto mb-4 h-14 w-14 text-slate-300" />
        <h1 className="mb-2 text-2xl font-black text-[var(--konnit-ink)]">
          Không tìm thấy đơn hàng
        </h1>
        <p className="mb-6 text-sm text-[var(--konnit-muted)]">
          Mã đơn không tồn tại hoặc dữ liệu mock đã bị làm mới.
        </p>
        {/* <Button asChild>
          <Link href="/cua-hang">Quay lại cửa hàng</Link>
        </Button> */}
        <Link href="/cua-hang">
            <Button>Quay lại cửa hàng</Button>
        </Link>
      </main>
    );
  }

  const view = getStatusView(order.status);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
        <view.Icon className={`mx-auto mb-4 h-16 w-16 ${view.iconClass}`} />

        <h1 className="mb-2 text-2xl font-black text-[var(--konnit-ink)]">
          {view.title}
        </h1>

        <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-[var(--konnit-muted)]">
          {view.description}
        </p>

        <div className="mx-auto mb-6 w-fit rounded-xl bg-[var(--konnit-pink-02)] px-6 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--konnit-muted)]">
            Mã đơn
          </p>
          <p className="text-2xl font-black tracking-widest text-[var(--konnit-berry)]">
            {order.order_code}
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-md rounded-xl bg-slate-50 p-4 text-left">
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-500">Người mua</span>
            <span className="font-bold text-[var(--konnit-ink)]">{order.contact_name}</span>
          </div>
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-500">Email</span>
            <span className="font-bold text-[var(--konnit-ink)]">{order.contact_email}</span>
          </div>
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-500">Số vé</span>
            <span className="font-bold text-[var(--konnit-ink)]">{order.items.length}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3">
            <span className="font-bold text-slate-700">Tổng thanh toán</span>
            <span className="text-lg font-black text-[var(--konnit-berry)]">
              {formatVND(order.total)}
            </span>
          </div>
        </div>

        {order.status === "paid" && order.items.some((item) => item.qr_token) && (
          <div className="mx-auto mb-6 max-w-md rounded-xl border border-green-100 bg-green-50 p-4 text-left">
            <p className="mb-3 text-sm font-bold text-green-700">Vé điện tử</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-lg bg-white px-3 py-2 text-sm">
                  <p className="font-bold text-[var(--konnit-ink)]">{item.attendee_name}</p>
                  <p className="text-xs text-[var(--konnit-muted)]">{item.ticket_name}</p>
                  {item.qr_token && (
                    <p className="mt-1 break-all font-mono text-xs text-green-700">
                      {item.qr_token}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {order.status === "pending" && (
            <Link
              href={`/don-hang/${order.order_code}/thanh-toan`}
              className="rounded-xl bg-[var(--konnit-berry)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              Tiếp tục thanh toán
            </Link>
          )}

          <Link
            href="/cua-hang"
            className="rounded-xl border border-[var(--konnit-berry)] px-5 py-2.5 text-sm font-bold text-[var(--konnit-berry)] hover:bg-[var(--konnit-pink-02)]"
          >
            Mua thêm vé
          </Link>

          <Link
            href="/"
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}

function getStatusView(status: Order["status"]) {
  switch (status) {
    case "paid":
      return {
        Icon: CheckCircle2,
        iconClass: "text-green-500",
        title: "Đặt vé thành công!",
        description:
          "Đơn hàng đã được thanh toán. Email xác nhận và vé QR của từng bé sẽ được gửi tới email người mua.",
      };
    case "pending":
      return {
        Icon: Clock,
        iconClass: "text-orange-500",
        title: "Đơn đang chờ thanh toán",
        description:
          "Đơn đã được tạo nhưng chưa hoàn tất thanh toán. Vui lòng tiếp tục thanh toán để giữ vé.",
      };
    case "failed":
      return {
        Icon: XCircle,
        iconClass: "text-red-500",
        title: "Thanh toán thất bại",
        description:
          "Thanh toán chưa thành công. Bạn có thể thử lại hoặc đặt vé mới nếu đơn đã hết hạn.",
      };
    case "expired":
      return {
        Icon: AlertCircle,
        iconClass: "text-slate-400",
        title: "Đơn đã hết hạn",
        description:
          "Thời gian giữ vé đã hết. Vui lòng quay lại cửa hàng để tạo đơn mới.",
      };
  }
}
