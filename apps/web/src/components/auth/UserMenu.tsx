"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export function UserMenu() {
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const init = useAuth((s) => s.init);
  const signOut = useAuth((s) => s.signOut);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  if (!initialized) {
    return <span className="h-9 w-9 animate-pulse rounded-full bg-[var(--konnit-pink-02)]" />;
  }

  if (!user) {
    return (
      <Link
        href="/dang-nhap"
        className="inline-flex min-h-[40px] items-center rounded-2xl h-11 border border-[var(--konnit-berry)] px-3 text-sm font-bold text-[var(--konnit-berry)] hover:bg-[var(--konnit-pink-02)]"
      >
        Đăng nhập
      </Link>
    );
  }

  const initials = (user.fullName || user.email).slice(0, 1).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[var(--konnit-berry)] text-sm font-black text-white"
        aria-label="Tài khoản"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[var(--konnit-pink-03)] bg-white p-1 shadow-lg">
            <div className="truncate px-3 py-2 text-xs text-[var(--konnit-muted)]">
              {user.email}
            </div>
            <Link
              href="/tai-khoan"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--konnit-pink-01)]"
            >
              Tài khoản
            </Link>
            <Link
              href="/tai-khoan/don-hang"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--konnit-pink-01)]"
            >
              Lịch sử đơn
            </Link>
            <button
              onClick={async () => {
                await signOut();
                setOpen(false);
                router.push("/");
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  );
}