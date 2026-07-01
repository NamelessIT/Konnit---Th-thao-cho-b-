import { CartDetail } from "@/components/shop/CartDetail";
import { RequireShopUser } from "@/components/auth/RequireShopUser";

export const metadata = { title: "Giỏ hàng — Konnit" };

export default function GioHangPage() {
  return (
    <RequireShopUser>
      <CartDetail />
    </RequireShopUser>
  );
}
