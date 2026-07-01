"use client";

import { useEffect, useState } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { AlertCircle, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrTicketCard } from "@/components/account/QrTicketCard";
import { shopApi } from "@/lib/shop/api";
import { formatVND } from "@/lib/shop/format";
import type { Order } from "@/lib/shop/types";
import { useT } from "@/lib/i18n/LocaleProvider";

export function OrderStatusPanel({ code }: { code: string }) {
  const t = useT();
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
        <p className="text-sm text-[var(--konnit-muted)]">{t("order.loading")}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto mb-4 h-14 w-14 text-slate-300" />
        <h1 className="mb-2 text-2xl font-black text-[var(--konnit-ink)]">
          {t("order.notFound")}
        </h1>
        <p className="mb-6 text-sm text-[var(--konnit-muted)]">
          {t("order.notFoundDesc")}
        </p>
        <LocaleLink href="/cua-hang">
            <Button>{t("common.backToStore")}</Button>
        </LocaleLink>
      </main>
    );
  }

  const view = getStatusView(order.status, order.payment_method, t);

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
            {t("order.code")}
          </p>
          <p className="text-2xl font-black tracking-widest text-[var(--konnit-berry)]">
            {order.order_code}
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-md rounded-xl bg-slate-50 p-4 text-left">
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-500">{t("order.buyer")}</span>
            <span className="font-bold text-[var(--konnit-ink)]">{order.contact_name}</span>
          </div>
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-500">{t("order.email")}</span>
            <span className="font-bold text-[var(--konnit-ink)]">{order.contact_email}</span>
          </div>
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-500">{t("order.ticketCount")}</span>
            <span className="font-bold text-[var(--konnit-ink)]">{order.items.length}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3">
            <span className="font-bold text-slate-700">{t("order.totalPaid")}</span>
            <span className="text-lg font-black text-[var(--konnit-berry)]">
              {formatVND(order.total)}
            </span>
          </div>
        </div>

        {order.status === "paid" && order.items.some((item) => item.qr_token) && (
          <div className="mx-auto mb-6 max-w-md text-left">
            <p className="mb-3 text-sm font-bold text-(--konnit-muted)">{t("order.eTickets")}</p>
            <div className="space-y-3">
              {order.items.map((item) => (
                <QrTicketCard
                  key={item.id}
                  token={item.qr_token ?? null}
                  attendeeName={item.attendee_name}
                  ticketName={item.ticket_name}
                  eventName=""
                  isUsed={!!item.checked_in_at}
                  checkedInAt={item.checked_in_at ?? null}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {order.status === "pending" && (
            <LocaleLink
              href={`/don-hang/${order.order_code}/thanh-toan`}
              className="rounded-xl bg-[var(--konnit-berry)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              {t("order.continuePayment")}
            </LocaleLink>
          )}

          <LocaleLink
            href="/cua-hang"
            className="rounded-xl border border-[var(--konnit-berry)] px-5 py-2.5 text-sm font-bold text-[var(--konnit-berry)] hover:bg-[var(--konnit-pink-02)]"
          >
            {t("order.buyMore")}
          </LocaleLink>

          <LocaleLink
            href="/"
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            {t("common.home")}
          </LocaleLink>
        </div>
      </section>
    </main>
  );
}

function getStatusView(status: Order["status"], paymentMethod: Order["payment_method"] | undefined, t: (key: string) => string) {
  switch (status) {
    case "paid":
      return {
        Icon: CheckCircle2,
        iconClass: "text-green-500",
        title: t("order.paid.title"),
        description: t("order.paid.desc"),
      };
    case "pending":
      if (paymentMethod === "bank") {
        return {
          Icon: Clock,
          iconClass: "text-orange-500",
          title: t("order.pendingTransfer.title"),
          description: t("order.pendingTransfer.desc"),
        };
      }
      return {
        Icon: Clock,
        iconClass: "text-orange-500",
        title: t("order.pending.title"),
        description: t("order.pending.desc"),
      };
    case "failed":
      return {
        Icon: XCircle,
        iconClass: "text-red-500",
        title: t("order.failed.title"),
        description: t("order.failed.desc"),
      };
    case "expired":
      return {
        Icon: AlertCircle,
        iconClass: "text-slate-400",
        title: t("order.expired.title"),
        description: t("order.expired.desc"),
      };
    default:
      return {
        Icon: Clock,
        iconClass: "text-slate-400",
        title: t("order.processing.title"),
        description: t("order.processing.desc"),
      };
  }
}
