import { GoogleSignInButton } from "./GoogleSignInButton";

export function AuthPanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="mb-4 inline-grid h-12 w-12 place-items-center rounded-full bg-[var(--konnit-berry)] text-2xl font-black text-white">
        k
      </span>
      <h1 className="mb-2 text-2xl font-black text-[var(--konnit-ink)]">{title}</h1>
      <p className="mb-8 text-sm text-[var(--konnit-muted)]">{subtitle}</p>
      <GoogleSignInButton />
      <p className="mt-6 max-w-xs text-xs text-[var(--konnit-muted)]">
        Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Chính sách bảo mật của Konnit.
      </p>
    </main>
  );
}