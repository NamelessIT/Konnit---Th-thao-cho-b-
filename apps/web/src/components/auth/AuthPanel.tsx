"use client";

import Image from "next/image";
import { ArrowLeft, ShieldCheck, TicketCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useT } from "@/lib/i18n/LocaleProvider";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function AuthPanel({
  titleKey = "auth.loginTitle",
  subtitleKey = "auth.loginSubtitle",
}: {
  titleKey?: string;
  subtitleKey?: string;
}) {
  const t = useT();

  return (
    <main className="flex min-h-[calc(100svh-100px)] items-center px-4 py-10 sm:px-6 lg:py-14">
      <Card className="mx-auto grid w-full max-w-5xl gap-0 overflow-hidden rounded-lg border bg-card py-0 shadow-[var(--shadow-panel)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[570px] overflow-hidden lg:block">
          <Image
            src="/legacy/assets/konnit-hero.png"
            alt="Trẻ em tham gia hoạt động trải nghiệm cùng Konnit"
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 0px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(52,38,52,0.04)_25%,rgba(52,38,52,0.84)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <span className="mb-4 inline-flex rounded-full bg-card/90 px-3 py-1.5 text-xs font-black uppercase text-primary">
              {t("auth.communityLabel")}
            </span>
            <h2 className="max-w-md text-3xl font-black leading-tight">
              {t("auth.tagline")}
            </h2>
            <div className="mt-6 flex gap-5 text-sm font-bold text-white/90">
              <span className="inline-flex items-center gap-2">
                <TicketCheck aria-hidden className="size-5 text-[var(--konnit-mint)]" />
                {t("auth.manageTickets")}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden className="size-5 text-[var(--konnit-mint)]" />
                {t("auth.secureWithGoogle")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex min-h-[520px] flex-col justify-center">
          <CardHeader className="gap-0 px-6 pt-10 sm:px-12 lg:px-14">
            <LocaleLink
              href="/"
              className="mb-10 inline-flex w-fit items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft aria-hidden className="size-4" />
              {t("common.home")}
            </LocaleLink>

            <div>
              <span className="mb-5 inline-grid size-12 place-items-center rounded-full bg-primary text-2xl font-black text-primary-foreground shadow-[inset_0_-4px_0_rgba(0,0,0,0.08)]">
                k
              </span>
              <p className="mb-2 text-sm font-black uppercase text-primary">
                {t("auth.accountLabel")}
              </p>
              <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
                {t(titleKey)}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                {t(subtitleKey)}
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-6 pt-8 sm:px-12 lg:px-14">
            <div className="rounded-lg border bg-secondary/40 px-4 py-5 sm:px-6">
              <GoogleSignInButton />
            </div>
          </CardContent>

          <CardFooter className="mt-6 items-start gap-2 rounded-b-lg bg-muted/50 px-6 py-5 text-xs leading-5 text-muted-foreground sm:px-12 lg:px-14">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-[var(--konnit-mint-strong)]" />
            <p>{t("auth.terms")}</p>
          </CardFooter>
        </div>
      </Card>
    </main>
  );
}
