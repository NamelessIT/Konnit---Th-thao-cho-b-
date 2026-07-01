"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { useLocalizedHref } from "@/lib/i18n/LocaleProvider";

type LinkProps = React.ComponentProps<typeof Link>;

/** Như next/link nhưng tự thêm prefix locale hiện tại vào href nội bộ. */
export const LocaleLink = forwardRef<HTMLAnchorElement, LinkProps>(function LocaleLink(
  { href, ...rest },
  ref,
) {
  const localize = useLocalizedHref();
  const localized = typeof href === "string" ? localize(href) : href;
  return <Link ref={ref} href={localized} {...rest} />;
});
