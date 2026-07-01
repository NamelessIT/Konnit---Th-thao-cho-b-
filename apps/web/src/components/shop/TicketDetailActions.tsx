"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { formatVND } from "@/lib/shop/format";
import { useLocalizedHref } from "@/lib/i18n/LocaleProvider";
import type { TicketType } from "@/lib/shop/types";
import { useRequireUser } from "@/hooks/useRequireUser";

export function TicketDetailActions({
  ticket,
  disabled,
}: {
  ticket: TicketType;
  disabled?: boolean;
}) {
  const router = useRouter();
  const localize = useLocalizedHref();
  const { add, selectOnly } = useCartStore();
  const [qty, setQty] = useState(1);
  const [isBusy, setIsBusy] = useState(false);
  const requireUser = useRequireUser();

  const max = ticket.available;
  const soldOut = disabled || max <= 0;

  const cartItem = {
    ticketTypeId: ticket.id,
    name: ticket.name,
    eventName: ticket.event_name,
    eventSlug: ticket.event_slug,
    ageGroup: ticket.age_group,
    unitPrice: ticket.current_price,
  };

  function handleAddToCart() {
    if (soldOut || isBusy) return;
    if (!requireUser()) return;

    setIsBusy(true);
    add(cartItem, qty);
    toast.success(`Đã thêm ${qty} vé "${ticket.name}" vào giỏ`);
    setTimeout(() => setIsBusy(false), 350);
  }

  function handleBuyNow() {
    if (soldOut || isBusy) return;
    if (!requireUser()) return;

    setIsBusy(true);
    add(cartItem, qty);
    selectOnly(ticket.id);
    router.push(localize("/thanh-toan"));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600">Số lượng</span>
          <span className="text-xs text-slate-400">Còn {max} suất</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty((value) => Math.max(1, value - 1))}
              disabled={soldOut || qty <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="w-8 text-center text-2xl font-black text-[var(--konnit-ink)]">
              {qty}
            </span>

            <button
              type="button"
              onClick={() => setQty((value) => Math.min(max, value + 1))}
              disabled={soldOut || qty >= max}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Tạm tính</p>
            <p className="text-lg font-black text-[var(--konnit-berry)]">
              {formatVND(ticket.current_price * qty)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddToCart}
          disabled={soldOut || isBusy}
          className="gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          {soldOut ? "Hết suất" : "Thêm vào giỏ"}
        </Button>

        <Button
          type="button"
          onClick={handleBuyNow}
          disabled={soldOut || isBusy}
          className="gap-2 bg-[var(--konnit-berry)] hover:bg-[var(--konnit-berry)]/90"
        >
          <Zap className="h-4 w-4" />
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
