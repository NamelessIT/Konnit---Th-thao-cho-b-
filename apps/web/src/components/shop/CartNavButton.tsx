"use client";

import { ShoppingCart } from "lucide-react";
import { LocaleLink } from "@/components/i18n/LocaleLink";

import { useHasMounted } from "@/hooks/useHasMounted";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface CartNavButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function CartNavButton({ className, showLabel = false }: CartNavButtonProps) {
  const hasMounted = useHasMounted();

  const totalQuantity = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  const displayQuantity = hasMounted ? totalQuantity : 0;

  return (
    <LocaleLink
      href="/gio-hang"
      aria-label="Giỏ hàng"
      className={cn(
        "relative inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600",
        className,
      )}
    >
      <ShoppingCart className="h-5 w-5" />

      {showLabel ? <span>Giỏ hàng</span> : null}

      {hasMounted && displayQuantity > 0 ? (
        <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow">
          {displayQuantity > 99 ? "99+" : displayQuantity}
        </span>
      ) : null}
    </LocaleLink>
  );
}