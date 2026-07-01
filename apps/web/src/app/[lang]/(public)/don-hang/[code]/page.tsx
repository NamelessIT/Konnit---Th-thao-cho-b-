import { OrderStatusPanel } from "@/components/shop/OrderStatusPanel";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  return { title: `Đơn hàng ${code} — Konnit` };
}

export default async function DonHangPage({ params }: Props) {
  const { code } = await params;

  return <OrderStatusPanel code={code} />;
}