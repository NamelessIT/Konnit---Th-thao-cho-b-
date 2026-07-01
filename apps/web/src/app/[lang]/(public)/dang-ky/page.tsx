import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata = { title: "Đăng ký — Konnit" };

export default function DangKyPage() {
  return <AuthPanel titleKey="auth.signupTitle" subtitleKey="auth.signupSubtitle" />;
}