"use client";

import { useEffect, useState } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { RequireUser } from "@/components/account/RequireUser";
import { userOrdersApi, type UserOrderList } from "@/lib/auth/user-orders-api";
import { formatVND } from "@/lib/shop/format";
import { ORDER_STATUS_LABELS_VI, type OrderStatus } from "@konnit/types";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function Page() {
  return (
    <RequireUser>
      <OrdersList />
    </RequireUser>
  );
}

function OrdersList() {
  const t = useT();
  const [data, setData] = useState<UserOrderList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    userOrdersApi
      .list({ page })
      .then((d) => active && (setData(d), setLoading(false)))
      .catch((e) => active && (setError(e.message), setLoading(false)));
    return () => {
      active = false;
    };
  }, [page]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 text-2xl font-black text-[var(--konnit-ink)]">{t("account.orderHistory")}</h1>

      {loading && <p className="py-12 text-center text-[var(--konnit-muted)]">{t("common.loading")}</p>}
      {error && <p className="py-12 text-center text-red-500">{error}</p>}

      {!loading && !error && data && data.orders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--konnit-pink-03)] py-16 text-center text-[var(--konnit-muted)]">
          {t("account.noOrders")}
          <LocaleLink href="/cua-hang" className="ml-1 font-bold text-[var(--konnit-berry)] underline">
            {t("account.buyNow")}
          </LocaleLink>
        </div>
      )}

      {!loading && !error && data && data.orders.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.orders.map((o) => (
              <li key={o.order_code}>
                <LocaleLink
                  href={`/tai-khoan/don-hang/${o.order_code}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--konnit-pink-03)] bg-white p-4 transition hover:border-[var(--konnit-berry)]"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--konnit-ink)]">{o.event_name ?? "Đơn hàng"}</p>
                    <p className="truncate text-xs text-[var(--konnit-muted)]">
                      {o.order_code} · {o.item_count} vé · {new Date(o.created_at).toLocaleDateString("vi")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[var(--konnit-berry)]">{formatVND(o.total)}</p>
                    <span className="text-xs font-bold text-[var(--konnit-muted)]">
                      {ORDER_STATUS_LABELS_VI[o.status as OrderStatus] ?? o.status}
                    </span>
                  </div>
                </LocaleLink>
              </li>
            ))}
          </ul>

          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                {t("account.prev")}
              </button>
              <span className="text-sm text-[var(--konnit-muted)]">
                {data.page}/{data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                {t("account.next")}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}