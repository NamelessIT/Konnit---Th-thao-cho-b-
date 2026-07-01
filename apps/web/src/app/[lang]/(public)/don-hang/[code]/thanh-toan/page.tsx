import { PaymentPanel } from "@/components/shop/PaymentPanel";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  return { title: `Thanh toán đơn ${code} — Konnit` };
}

export default async function OrderPaymentPage({ params }: Props) {
  const { code } = await params;

  return <PaymentPanel code={code} />;
}