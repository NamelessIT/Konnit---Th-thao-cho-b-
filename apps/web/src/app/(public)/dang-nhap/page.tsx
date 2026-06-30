import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata = { title: "Đăng nhập — Konnit" };

export default function DangNhapPage() {
  return (
    <AuthPanel
      title="Đăng nhập Konnit"
      subtitle="Đăng nhập bằng Google để xem lịch sử đơn và vé điện tử của bạn."
    />
  );
}