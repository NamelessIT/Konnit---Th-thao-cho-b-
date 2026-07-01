"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import type { TicketType } from "@/lib/shop/types";
import { useRequireUser } from "@/hooks/useRequireUser";

export function AddToCartButton({ ticket, disabled }: { ticket: TicketType; disabled?: boolean }) {
  const [added, setAdded] = useState(false);
  const add = useCartStore((s) => s.add);
  const requireUser = useRequireUser();

  function handleAdd() {
    if (!requireUser()) return;

    add({
      ticketTypeId: ticket.id,
      name: ticket.name,
      eventName: ticket.event_name,
      eventSlug: ticket.event_slug,
      ageGroup: ticket.age_group,
      unitPrice: ticket.current_price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled}
      className="gap-2 bg-[var(--konnit-berry)] px-6 hover:bg-[var(--konnit-berry)]/90"
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {disabled ? "Hết suất" : added ? "Đã thêm!" : "Thêm vào giỏ"}
    </Button>
  );
}
