import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { RequireShopUser } from "@/components/auth/RequireShopUser";

export const metadata = { title: "Thanh toán — Konnit" };

export default function ThanhToanPage() {
  return (
    <RequireShopUser>
      <CheckoutForm />
    </RequireShopUser>
  );
}
