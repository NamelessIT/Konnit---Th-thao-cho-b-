"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, QrCode } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { shopApi } from "@/lib/shop/api";
import { formatVND } from "@/lib/shop/format";
import { useCartStore } from "@/store/cart";
import type { Order } from "@/lib/shop/types";

type PaymentMethod = "card" | "qr" | "bank";

export function PaymentPanel({ code }: { code: string }) {
  const router = useRouter();
  const clearSelected = useCartStore((s) => s.clearSelected);

  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("qr");
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadOrder() {
      const result = await shopApi.getOrder(code);
      if (!alive) return;

      setOrder(result);
      setMethod(result?.payment_method ?? "qr");
      setIsLoading(false);

      if (result && result.status !== "pending") {
        router.replace(`/don-hang/${code}`);
      }
    }

    loadOrder();

    return () => {
      alive = false;
    };
  }, [code, router]);

  async function handlePay() {
    if (!order || isPaying) return;

    setIsPaying(true);
    try {
      const result = await shopApi.payOrder(code, method);

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      if (result.status === "paid") {
        clearSelected();
        toast.success("Thanh toán thành công.");
        router.push(`/don-hang/${code}`);
        return;
      }

      toast.error("Thanh toán chưa hoàn tất. Vui lòng thử lại.");
    } catch {
      toast.error("Không thể xử lý thanh toán. Vui lòng thử lại.");
    } finally {
      setIsPaying(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[var(--konnit-berry)]" />
        <p className="text-sm text-[var(--konnit-muted)]">Đang tải đơn hàng...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-black text-[var(--konnit-ink)]">
          Không tìm thấy đơn hàng
        </h1>
        <p className="mb-6 text-sm text-[var(--konnit-muted)]">
          Mã đơn không tồn tại hoặc phiên mock đã bị làm mới.
        </p>
        <Link href="/cua-hang">
            <Button>Quay lại cửa hàng</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-black text-[var(--konnit-ink)]">
        Thanh toán đơn hàng
      </h1>
      <p className="mb-8 text-[var(--konnit-muted)]">
        Mã đơn: <span className="font-bold text-[var(--konnit-berry)]">{code}</span>
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-black text-[var(--konnit-ink)]">
            Chọn phương thức thanh toán
          </h2>

          <div className="grid gap-3">
            <PaymentOption
              active={method === "card"}
              icon={<CreditCard className="h-5 w-5" />}
              title="Thẻ ngân hàng"
              desc="Form demo, không lưu thông tin thẻ."
              onClick={() => setMethod("card")}
            />
            <PaymentOption
              active={method === "qr"}
              icon={<QrCode className="h-5 w-5" />}
              title="Ví / QR"
              desc="Quét mã để thanh toán thử."
              onClick={() => setMethod("qr")}
            />
            <PaymentOption
              active={method === "bank"}
              icon={<QrCode className="h-5 w-5" />}
              title="Chuyển khoản QR"
              desc="QR ngân hàng demo."
              onClick={() => setMethod("bank")}
            />
          </div>

          {method === "card" ? (
            <div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4">
              <input className={inputCls} placeholder="Số thẻ demo" />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="MM/YY" />
                <input className={inputCls} placeholder="CVV" />
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-xl bg-slate-50 p-6 text-center">
              <div className="grid h-44 w-44 place-items-center rounded-xl border border-slate-200 bg-white">
                <QrCode className="h-24 w-24 text-[var(--konnit-berry)]" />
              </div>
              <p className="mt-3 text-sm font-bold text-[var(--konnit-ink)]">
                Konnit mock QR
              </p>
              <p className="text-xs text-[var(--konnit-muted)]">
                Nội dung: {code} - {formatVND(order.total)}
              </p>
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={isPaying}
            className="mt-6 w-full bg-[var(--konnit-berry)] hover:bg-[var(--konnit-berry)]/90"
          >
            {isPaying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận thanh toán"
            )}
          </Button>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold text-[var(--konnit-ink)]">Tóm tắt đơn</h2>

          <div className="mb-4 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-600">{item.ticket_name}</span>
                <span className="shrink-0 font-bold">{formatVND(item.unit_price)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Tạm tính</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>- {formatVND(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-lg font-black">
              <span>Tổng</span>
              <span className="text-[var(--konnit-berry)]">{formatVND(order.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PaymentOption({
  active,
  icon,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-xl border p-4 text-left transition",
        active
          ? "border-[var(--konnit-berry)] bg-[var(--konnit-pink-02)]"
          : "border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[var(--konnit-berry)]">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-bold text-[var(--konnit-ink)]">{title}</span>
        <span className="block text-xs text-[var(--konnit-muted)]">{desc}</span>
      </span>
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--konnit-berry)]";