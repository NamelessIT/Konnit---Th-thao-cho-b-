import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata = { title: "Đăng nhập — Konnit" };

export default function DangNhapPage() {
  return <AuthPanel titleKey="auth.loginTitle" subtitleKey="auth.loginSubtitle" />;
}