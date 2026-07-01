"use client";

import { useState, useEffect, useRef } from "react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { Trash2, Plus, Minus, ShoppingCart, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/store/cart";
import { useBuyerStore } from "@/store/buyer";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatVND } from "@/lib/shop/format";
import { shopApi, VoucherValidationError } from "@/lib/shop/api";
import { useHoldableStepper } from "@/hooks/useHoldableStepper";
import { useDebounce } from "@/hooks/useDebounce";
import { useT } from "@/lib/i18n/LocaleProvider";

interface CartItemRowProps {
  item: CartItem;
  max: number;
  onRemove: (id: number) => void;
  onSetQty: (id: number, qty: number) => void;
  onToggleSelect: (id: number) => void;
}

function CartItemRow({
  item,
  max,
  onRemove,
  onSetQty,
  onToggleSelect,
}: CartItemRowProps) {
  const t = useT();
  const [localQty, setLocalQty] = useState(item.quantity);
  const debouncedQty = useDebounce(localQty, 350);

  useEffect(() => {
    setLocalQty(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      onSetQty(item.ticketTypeId, debouncedQty);
    }
  }, [debouncedQty, item.quantity, item.ticketTypeId, onSetQty]);

  const { startHold, stopHold } = useHoldableStepper(
    localQty,
    setLocalQty,
    { min: 1, max },
  );

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <input
        type="checkbox"
        checked={item.selected}
        onChange={() => onToggleSelect(item.ticketTypeId)}
        className="mt-1 h-4 w-4 rounded accent-[var(--konnit-berry)]"
      />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[var(--konnit-ink)]">{item.name}</p>
        <p className="text-xs text-[var(--konnit-muted)] truncate">
          {item.eventName}
          {item.ageGroup ? ` · ${item.ageGroup}` : ""}
        </p>
        <p className="mt-1 text-sm font-bold text-[var(--konnit-berry)]">
          {formatVND(item.unitPrice)} {t("shop.perTicket")}
        </p>
      </div>

      <div className="flex items-center gap-1">
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
          disabled={localQty <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 select-none disabled:opacity-40"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-6 text-center text-sm font-bold">{localQty}</span>
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
          disabled={localQty >= max}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 select-none disabled:opacity-40"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[var(--konnit-ink)]">
          {formatVND(item.unitPrice * debouncedQty)}
        </p>
        <button
          onClick={() => onRemove(item.ticketTypeId)}
          className="mt-1 text-slate-300 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function CartDetail() {
  const t = useT();
  const hasMounted = useHasMounted();
  const { items, voucher, remove, setQty, toggleSelect, setAllSelected, setVoucher } = useCartStore();
  const { buyer } = useBuyerStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Track ticket availability on mount to check max limits
  const [ticketMap, setTicketMap] = useState<Record<number, { available: number }>>({});

  useEffect(() => {
    shopApi.listTickets().then((tickets) => {
      const map: Record<number, { available: number }> = {};
      tickets.forEach((t) => {
        map[t.id] = { available: t.available };
      });
      setTicketMap(map);
    }).catch(console.error);
  }, []);

  const selectedItems = items.filter((i) => i.selected);

  // Instantly calculate the subtotal and quantity count
  const instantSubtotal = selectedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const instantCount = selectedItems.reduce((s, i) => s + i.quantity, 0);

  // Debounce the subtotal and selected items count by 500ms
  const subtotal = useDebounce(instantSubtotal, 500);
  const selectedCount = useDebounce(instantCount, 500);

  const discountAmount = voucher?.discount_amount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);
  const allChecked = items.length > 0 && items.every((i) => i.selected);

  // Re-apply coupon live when debounced subtotal changes
  const lastValidated = useRef({ code: "", subtotal: 0 });

  useEffect(() => {
    const code = voucher?.code;
    if (code) {
      if (
        lastValidated.current.code === code &&
        lastValidated.current.subtotal === subtotal
      ) {
        return;
      }
      shopApi
        .validateVoucher(code, subtotal)
        .then((result) => {
          if (result) {
            setVoucher(result);
            lastValidated.current = { code, subtotal };
          } else {
            setVoucher(null);
            setVoucherError(t("checkout.voucherExpired"));
          }
        })
        .catch((error) => {
          setVoucher(null);
          if (error instanceof VoucherValidationError) {
            setVoucherError(error.message);
          }
        });
    } else {
      lastValidated.current = { code: "", subtotal: 0 };
    }
  }, [subtotal, voucher?.code, setVoucher]);

  if (!hasMounted) return null;


  async function handleApplyVoucher() {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    setIsValidating(true);
    setVoucherError("");
    setVoucher(null);
    try {
      const result = await shopApi.validateVoucher(code, subtotal);
      if (result) {
        setVoucher(result);
        lastValidated.current = { code, subtotal };
      } else {
        setVoucherError(t("checkout.voucherInvalid"));
      }
    } catch (error) {
      setVoucherError(
        error instanceof VoucherValidationError
          ? error.message
          : t("checkout.voucherInvalid"),
      );
    } finally {
      setIsValidating(false);
    }
  }

  function handleRemoveVoucher() {
    setVoucher(null);
    setVoucherInput("");
    setVoucherError("");
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingCart className="h-16 w-16 text-slate-200" />
        <p className="text-lg font-bold text-[var(--konnit-ink)]">{t("shop.cartEmpty")}</p>
        <LocaleLink
          href="/cua-hang"
          className="rounded-2xl bg-[var(--konnit-berry)] px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          {t("shop.shopNow")}
        </LocaleLink>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-black text-[var(--konnit-ink)]">{t("shop.cart")}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* ── Danh sách vé ── */}
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => setAllSelected(e.target.checked)}
              className="h-4 w-4 rounded accent-[var(--konnit-berry)]"
            />
            {t("shop.selectAll")} ({items.length})
          </label>

          {items.map((item) => (
            <CartItemRow
              key={item.ticketTypeId}
              item={item}
              max={ticketMap[item.ticketTypeId]?.available ?? 999}
              onRemove={remove}
              onSetQty={setQty}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>

        {/* ── Cột phải: buyer cache + voucher + tổng ── */}
        <div className="space-y-3">
          {/* Buyer info cache */}
          {buyer.contactName && (
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                {t("shop.buyerInfo")}
              </p>
              <p className="text-sm font-bold text-[var(--konnit-ink)]">{buyer.contactName}</p>
              <p className="text-xs text-[var(--konnit-muted)]">{buyer.contactEmail}</p>
              <p className="text-xs text-[var(--konnit-muted)]">{buyer.contactPhone}</p>
            </div>
          )}

          {/* Voucher */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Tag className="h-3.5 w-3.5" /> {t("shop.voucherCode")}
            </p>
            {voucher ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-green-700">{voucher.code}</p>
                  <p className="text-xs text-green-600">
                    Giảm {formatVND(voucher.discount_amount)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveVoucher}
                  className="text-xs text-slate-400 hover:text-red-500 underline"
                >
                  {t("common.remove")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  value={voucherInput}
                  onChange={(e) =>
                    setVoucherInput(
                      e.target.value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20)
                    )
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                  placeholder={t("shop.voucherPlaceholder")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[var(--konnit-berry)]"
                />

                <Button
                  onClick={handleApplyVoucher}
                  disabled={isValidating || !voucherInput.trim()}
                  variant="outline"
                  className="w-full"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("common.apply")
                  )}
                </Button>
              </div>
            )}
            {voucherError && (
              <p className="mt-1.5 text-xs text-red-500">{voucherError}</p>
            )}
          </div>

          {/* Tóm tắt */}
          <div className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-[var(--konnit-ink)]">{t("shop.orderSummary")}</h2>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-500">{t("shop.selected")}</span>
              <span>{selectedCount}</span>
            </div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-500">{t("shop.subtotal")}</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            {voucher && (
              <div className="mb-2 flex justify-between text-sm text-green-600">
                <span>{t("shop.discount")}</span>
                <span>− {formatVND(discountAmount)}</span>
              </div>
            )}
            <div className="mb-4 flex justify-between border-t border-slate-100 pt-2">
              <span className="font-bold text-slate-700">{t("shop.total")}</span>
              <span className="text-xl font-black text-[var(--konnit-berry)]">
                {formatVND(total)}
              </span>
            </div>

            <LocaleLink
              href={voucher ? `/thanh-toan?voucher=${encodeURIComponent(voucher.code)}` : "/thanh-toan"}
              className={`block w-full rounded-xl py-2.5 text-center text-sm font-bold text-white transition ${
                selectedItems.length === 0
                  ? "pointer-events-none bg-slate-200"
                  : "bg-[var(--konnit-berry)] hover:opacity-90"
              }`}
            >
              {t("shop.checkout")}
            </LocaleLink>
            <LocaleLink
              href="/cua-hang"
              className="mt-3 block text-center text-xs text-[var(--konnit-muted)] hover:text-[var(--konnit-berry)]"
            >
              {t("shop.continueShopping")}
            </LocaleLink>
          </div>
        </div>
      </div>
    </main>
  );
}
