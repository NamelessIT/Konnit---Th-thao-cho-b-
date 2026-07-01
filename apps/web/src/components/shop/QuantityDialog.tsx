"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/shop/format";
import type { TicketType } from "@/lib/shop/types";
import { useHoldableStepper } from "@/hooks/useHoldableStepper";
import { useDebounce } from "@/hooks/useDebounce";
import { useT } from "@/lib/i18n/LocaleProvider";

interface QuantityDialogProps {
  ticket: TicketType;
  mode: "cart" | "buyNow";
  trigger: React.ReactNode;
  onConfirm: (qty: number) => void;
  canOpen?: () => boolean;
}

export function QuantityDialog({ ticket, mode, trigger, onConfirm, canOpen }: QuantityDialogProps) {
  const t = useT();
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);

  const max = ticket.available;
  const soldOut = max <= 0;

  const { startHold, stopHold } = useHoldableStepper(qty, setQty, {
    min: 1,
    max,
  });

  const debouncedQty = useDebounce(qty, 500);

  function handleConfirm() {
    onConfirm(qty);
    setQty(1);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && canOpen && !canOpen()) return;
        if (!nextOpen) setQty(1);
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger render={trigger as React.ReactElement} />

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === "buyNow" ? t("shop.buyNow") : t("shop.addToCart")}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p className="mb-0.5 font-bold text-[var(--konnit-ink)]">{ticket.name}</p>
          {ticket.age_group && (
            <p className="mb-3 text-xs text-[var(--konnit-muted)]">{ticket.age_group}</p>
          )}

          <div className="mb-4 flex items-center justify-between rounded-xl bg-[var(--konnit-pink-02)] p-3">
            <span className="text-sm text-slate-600">{t("shop.pricePerTicket")}</span>
            <span className="font-bold text-[var(--konnit-berry)]">
              {formatVND(ticket.current_price)}
            </span>
          </div>

          {/* Stepper */}
          <div className="mb-1 flex items-center justify-center gap-4">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                startHold(-1);
              }}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={(e) => {
                e.preventDefault();
                startHold(-1);
              }}
              onTouchEnd={stopHold}
              disabled={qty <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 disabled:opacity-40 hover:bg-slate-50 select-none"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-2xl font-black text-[var(--konnit-ink)]">
              {qty}
            </span>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                startHold(1);
              }}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={(e) => {
                e.preventDefault();
                startHold(1);
              }}
              onTouchEnd={stopHold}
              disabled={qty >= max}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 disabled:opacity-40 hover:bg-slate-50 select-none"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-4 text-center text-xs text-slate-400">{t("shop.spotsLeft").replace("{n}", String(max))}</p>

          {/* Tổng tạm tính */}
          <div className="mb-5 flex justify-between border-t border-slate-100 pt-3 text-sm">
            <span className="text-slate-500">{t("shop.subtotal")}</span>
            <span className="text-lg font-black text-[var(--konnit-berry)]">
              {formatVND(ticket.current_price * debouncedQty)}
            </span>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={soldOut}
            className="w-full bg-[var(--konnit-berry)] hover:bg-[var(--konnit-berry)]/90"
          >
            {mode === "buyNow" ? `${t("shop.buyNow")} →` : t("shop.addToCart")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
