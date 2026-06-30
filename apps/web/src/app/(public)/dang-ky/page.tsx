import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata = { title: "Đăng ký — Konnit" };

export default function DangKyPage() {
  return (
    <AuthPanel
      title="Tạo tài khoản Konnit"
      subtitle="Lần đầu đăng nhập Google sẽ tự tạo tài khoản cho bạn — không cần mật khẩu."
    />
  );
}