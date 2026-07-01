"use client";

import { use, useCallback, useEffect, useState } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { toast } from "sonner";
import { RequireUser } from "@/components/account/RequireUser";
import { QrTicketCard } from "@/components/account/QrTicketCard";
import { userOrdersApi, type UserOrderDetail } from "@/lib/auth/user-orders-api";
import { formatVND } from "@/lib/shop/format";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ORDER_STATUS_LABELS_VI, type OrderStatus } from "@konnit/types";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <RequireUser>
      <OrderDetail code={code} />
    </RequireUser>
  );
}

function OrderDetail({ code }: { code: string }) {
  const t = useT();
  const [order, setOrder] = useState<UserOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await userOrdersApi.detail(code);
      setOrder(d);
      setError(d ? "" : t("account.orderNotFound"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("account.loadError"));
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

  async function submitRefundRequest() {
    setSubmitting(true);
    try {
      await userOrdersApi.requestRefund(code, refundReason.trim() || undefined);
      toast.success(t("account.refundSuccess"));
      setShowRefund(false);
      setRefundReason("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("account.refundFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="py-24 text-center text-[var(--konnit-muted)]">{t("common.loading")}</main>;
  if (error || !order)
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="mb-4 text-red-500">{error || t("account.orderNotFound")}</p>
        <LocaleLink href="/tai-khoan/don-hang" className="text-[var(--konnit-berry)] underline">
          ← {t("common.backToOrders")}
        </LocaleLink>
      </main>
    );

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <LocaleLink href="/tai-khoan/don-hang" className="text-sm text-[var(--konnit-muted)] hover:underline">
        ← {t("common.backToOrders")}
      </LocaleLink>
      <h1 className="mt-2 text-2xl font-black text-[var(--konnit-ink)]">
        {order.event?.name ?? t("account.orderFallback")}
      </h1>
      <p className="mb-6 text-sm text-[var(--konnit-muted)]">
        {t("order.code")} <b>{order.order_code}</b> · {t("checkout.total")} {formatVND(order.total)} ·{" "}
        {ORDER_STATUS_LABELS_VI[order.status as OrderStatus] ?? order.status}
      </p>

      {order.status === "paid" && (
        <>
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
          {order.items.every((i) => !i.is_used) && (
            <div className="mt-6 rounded-2xl border border-[var(--konnit-pink-03)] bg-white p-5">
              <p className="text-sm text-[var(--konnit-muted)]">
                {t("account.cancelPrompt")}
              </p>
              <Button variant="outline" className="mt-3" onClick={() => setShowRefund(true)}>
                {t("account.refundRequest")}
              </Button>
            </div>
          )}
        </>
      )}

      {order.status === "refund_requested" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          {t("account.refundPending")}
        </div>
      )}
      {order.status === "refunding" && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-800">
          {t("account.refundApproved")}
        </div>
      )}
      {order.status === "refunded" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          {t("account.refundDone")}
        </div>
      )}
      {(order.status === "pending" ||
        order.status === "expired" ||
        order.status === "failed") && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-800">
          {t("account.noQr")}
          {order.status === "pending" && (
            <LocaleLink
              href={`/don-hang/${order.order_code}/thanh-toan`}
              className="ml-1 font-bold underline"
            >
              {t("account.payNow")}
            </LocaleLink>
          )}
        </div>
      )}

      <Dialog
        open={showRefund}
        onOpenChange={(o) => {
          if (!o && !submitting) {
            setShowRefund(false);
            setRefundReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("account.refundDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("account.refundDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("account.refundReason")}</label>
            <Textarea
              value={refundReason}
              maxLength={500}
              rows={3}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder={t("account.refundReasonPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setShowRefund(false);
                setRefundReason("");
              }}
            >
              {t("common.close")}
            </Button>
            <Button disabled={submitting} onClick={submitRefundRequest}>
              {submitting ? t("common.sending") : t("common.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}