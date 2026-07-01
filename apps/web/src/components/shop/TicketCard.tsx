"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/shop/format";
import { useCartStore } from "@/store/cart";
import { QuantityDialog } from "@/components/shop/QuantityDialog";
import type { TicketType } from "@/lib/shop/types";

export function TicketCard({ ticket }: { ticket: TicketType }) {
  const router = useRouter();
  const { add, selectOnly } = useCartStore();  const soldOut = ticket.available === 0;
  function handleAddToCart(qty: number) {
    add(
      {
        ticketTypeId: ticket.id,
        name: ticket.name,
        eventName: ticket.event_name,
        eventSlug: ticket.event_slug,
        ageGroup: ticket.age_group,
        unitPrice: ticket.current_price,
      },
      qty,
    );
    toast.success(`Đã thêm ${qty} vé "${ticket.name}" vào giỏ`);
  }

  function handleBuyNow(qty: number) {
    add(
      {
        ticketTypeId: ticket.id,
        name: ticket.name,
        eventName: ticket.event_name,
        eventSlug: ticket.event_slug,
        ageGroup: ticket.age_group,
        unitPrice: ticket.current_price,
      },
      qty,
    );
    selectOnly(ticket.id);
    router.push("/thanh-toan");
  }

  return (
    <Card
      id={`ticket-${ticket.id}`}
      className="scroll-mt-28 flex flex-col overflow-hidden shadow-sm transition hover:shadow-md"
    >
      {/* Thân card click → chi tiết */}
      <a href={`/cua-hang/${ticket.id}`} className="flex-1 px-4">
        <CardHeader className="bg-[var(--konnit-pink-02)] pb-3 pt-5 rounded-lg">
          {ticket.is_early_bird && (
            <Badge className="mb-2 w-fit bg-orange-500 text-white">Early Bird</Badge>
          )}
          {soldOut && (
            <Badge variant="destructive" className="mb-2 w-fit">Hết suất</Badge>
          )}
          <h2 className="text-lg font-black text-[var(--konnit-ink)]">{ticket.name}</h2>
          {ticket.age_group && (
            <p className="text-sm text-[var(--konnit-muted)]">{ticket.age_group}</p>
          )}
        </CardHeader>

        <CardContent className="py-4">
          <p className="mb-3 line-clamp-2 text-sm text-slate-600">{ticket.description}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--konnit-berry)]">
              {formatVND(ticket.current_price)}
            </span>
            {ticket.is_early_bird && ticket.early_bird_price && (
              <span className="text-sm text-slate-400 line-through">
                {formatVND(ticket.price)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">Còn {ticket.available} suất</p>
        </CardContent>
      </a>

      {/* Footer: 2 nút — stopPropagation để không kích hoạt link thân card */}
      <CardFooter className="flex gap-2 pb-4" onClick={(e) => e.preventDefault()}>
        <QuantityDialog
          ticket={ticket}
          mode="cart"
          trigger={
            <Button
              variant="outline"
              className="flex-1"
              disabled={soldOut}
              onClick={(e) => e.preventDefault()}
            >
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Thêm giỏ
            </Button>
          }
          onConfirm={handleAddToCart}
        />
        <QuantityDialog
          ticket={ticket}
          mode="buyNow"
          trigger={
            <Button
              className="flex-1 bg-[var(--konnit-berry)] hover:bg-[var(--konnit-berry)]/90"
              disabled={soldOut}
              onClick={(e) => e.preventDefault()}
            >
              <Zap className="mr-1.5 h-4 w-4" />
              Mua ngay
            </Button>
          }
          onConfirm={handleBuyNow}
        />
      </CardFooter>
    </Card>
  );
}