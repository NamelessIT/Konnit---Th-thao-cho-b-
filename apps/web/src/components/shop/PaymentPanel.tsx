"use client";

import { useEffect, useState } from "react";
import type { PaymentMethod } from "@konnit/types";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useLocalizedHref } from "@/lib/i18n/LocaleProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { shopApi } from "@/lib/shop/api";
import { formatVND } from "@/lib/shop/format";
import { useCartStore } from "@/store/cart";
import type { Order, PaymentSettings } from "@/lib/shop/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

function mediaUrl(path: string) {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

export function PaymentPanel({ code }: { code: string }) {
  const router = useRouter();
  const localize = useLocalizedHref();
  const clearSelected = useCartStore((s) => s.clearSelected);

  const [order, setOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("qr");
  const [bankSettings, setBankSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadOrder() {
      const [result, settings] = await Promise.all([
        shopApi.getOrder(code),
        shopApi.getPaymentSettings().catch(() => null),
      ]);
      if (!alive) return;

      setOrder(result);
      setMethod("bank"); // chỉ hỗ trợ chuyển khoản
      setBankSettings(settings);
      setIsLoading(false);

      if (result && result.status !== "pending") {
        router.replace(localize(`/don-hang/${code}`));
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
        router.push(localize(`/don-hang/${code}`));
        return;
      }

      // Chuyển khoản: đơn vẫn pending, chờ BTC xác nhận đã nhận tiền.
      if (result.status === "pending" || result.awaitingTransfer) {
        clearSelected();
        toast.success("Đã ghi nhận. Đơn đang chờ BTC xác nhận chuyển khoản.");
        router.push(localize(`/don-hang/${code}`));
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
        <LocaleLink href="/cua-hang">
            <Button>Quay lại cửa hàng</Button>
        </LocaleLink>
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
            Thanh toán chuyển khoản
          </h2>

          <div className="flex items-center gap-3 rounded-xl border border-[var(--konnit-berry)] bg-[var(--konnit-pink-02)] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[var(--konnit-berry)]">
              <Building2 className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-[var(--konnit-ink)]">
                Chuyển khoản ngân hàng
              </span>
              <span className="block text-xs text-[var(--konnit-muted)]">
                Quét QR ngân hàng, BTC xác nhận thủ công.
              </span>
            </span>
          </div>

          <BankTransferBlock code={code} amount={order.total} settings={bankSettings} />

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
              "Tôi đã chuyển khoản"
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

function BankTransferBlock({
  code,
  amount,
  settings,
}: {
  code: string;
  amount: number;
  settings: PaymentSettings | null;
}) {
  const hasConfig =
    settings && (settings.qrImagePath || settings.accountNumber || settings.accountName);

  return (
    <div className="mt-6 rounded-xl bg-slate-50 p-5">
      {!hasConfig ? (
        <p className="text-center text-sm text-[var(--konnit-muted)]">
          BTC chưa cấu hình thông tin chuyển khoản. Vui lòng liên hệ ban tổ chức để được hướng dẫn,
          hoặc bấm “Tôi đã chuyển khoản” sau khi đã thanh toán.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {settings?.qrImagePath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(settings.qrImagePath)}
              alt="Mã QR chuyển khoản"
              className="h-44 w-44 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-2"
            />
          )}
          <div className="w-full space-y-2 text-sm">
            {settings?.bankName && (
              <Row label="Ngân hàng" value={settings.bankName} />
            )}
            {settings?.accountName && (
              <Row label="Chủ tài khoản" value={settings.accountName} />
            )}
            {settings?.accountNumber && (
              <Row label="Số tài khoản" value={settings.accountNumber} mono />
            )}
            <Row label="Nội dung CK" value={code} mono highlight />
            <Row label="Số tiền" value={formatVND(amount)} highlight />
            {settings?.note && (
              <p className="pt-1 text-xs text-[var(--konnit-muted)]">{settings.note}</p>
            )}
          </div>
        </div>
      )}
      <p className="mt-4 text-center text-xs text-[var(--konnit-muted)]">
        Sau khi chuyển khoản đúng nội dung, bấm nút bên dưới. Đơn sẽ ở trạng thái “chờ xác nhận” cho
        tới khi BTC đối soát.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-1.5">
      <span className="text-slate-500">{label}</span>
      <span
        className={[
          "text-right font-bold",
          mono ? "font-mono" : "",
          highlight ? "text-[var(--konnit-berry)]" : "text-[var(--konnit-ink)]",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
