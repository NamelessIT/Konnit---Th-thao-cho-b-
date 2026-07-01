"use client";

import Link from "next/link";
import { LogIn, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthGate } from "@/store/auth-gate";
import { useT, useLocalizedHref } from "@/lib/i18n/LocaleProvider";

export function AuthGateDialog() {
  const t = useT();
  const localizedHref = useLocalizedHref();
  const open = useAuthGate((state) => state.open);
  const message = useAuthGate((state) => state.message);
  const returnUrl = useAuthGate((state) => state.returnUrl);
  const hide = useAuthGate((state) => state.hide);
  const loginUrl = localizedHref(`/dang-nhap?returnUrl=${encodeURIComponent(returnUrl)}`);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && hide()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div className="bg-[var(--konnit-pink-02)] px-5 pb-4 pt-6">
          <span className="mb-4 inline-grid size-11 place-items-center rounded-full bg-[var(--konnit-berry)] text-white shadow-sm">
            <ShoppingCart className="size-5" />
          </span>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[var(--konnit-ink)]">
              {t("auth.gateTitle")}
            </DialogTitle>
            <DialogDescription className="leading-6 text-[var(--konnit-muted)]">
              {message}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="m-0 rounded-none border-0 bg-white px-5 py-4">
          <DialogClose render={<Button variant="outline" />}>{t("auth.later")}</DialogClose>
          <Button
            render={<Link href={loginUrl} onClick={hide} />}
            className="bg-[var(--konnit-berry)] hover:bg-[var(--konnit-berry)]/90"
          >
            <LogIn data-icon="inline-start" />
            {t("auth.login")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
