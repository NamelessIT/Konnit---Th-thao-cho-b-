"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { RequireUser } from "@/components/account/RequireUser";
import { useAuth } from "@/store/auth";

export default function TaiKhoanPage() {
  return (
    <RequireUser>
      <AccountInner />
    </RequireUser>
  );
}

function AccountInner() {
  const user = useAuth((s) => s.user)!;
  const initials = (user.fullName || user.email).slice(0, 1).toUpperCase();

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-6 text-2xl font-black text-[var(--konnit-ink)]">Tài khoản</h1>
      <div className="rounded-2xl border border-[var(--konnit-pink-03)] bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-[var(--konnit-berry)] text-xl font-black text-white">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <div>
            <p className="font-bold text-[var(--konnit-ink)]">{user.fullName ?? "Người dùng Konnit"}</p>
            <p className="text-sm text-[var(--konnit-muted)]">{user.email}</p>
          </div>
        </div>
        <LocaleLink
          href="/tai-khoan/don-hang"
          className="mt-6 inline-block rounded-xl bg-[var(--konnit-berry)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          Xem lịch sử đơn →
        </LocaleLink>
      </div>
    </main>
  );
}