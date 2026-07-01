"use client";

import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import {
  normalizeCmsLinkValue,
  normalizeCmsUrl,
  type CmsLinkValue,
} from "@konnit/types";
import { LocaleLink } from "@/components/i18n/LocaleLink";

interface CmsLinkProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "target" | "rel"
  > {
  value: CmsLinkValue | unknown;
  children?: ReactNode;
}

export function CmsLink({ value, children, ...props }: CmsLinkProps) {
  const link = normalizeCmsLinkValue(value);
  const href = normalizeCmsUrl(link.url);
  const content = children ?? link.label;

  // URL trống/không hợp lệ (vd javascript:, "#", sai cú pháp): vẫn HIỆN nút nếu có nhãn,
  // nhưng render dạng tĩnh — bấm vào không điều hướng (không vứt nút đi khi mới điền nhãn).
  if (!href) {
    if (!content && !link.label) return null;
    return (
      <span
        {...(props as HTMLAttributes<HTMLSpanElement>)}
        role="button"
        aria-disabled="true"
      >
        {content || link.label}
      </span>
    );
  }

  const externalProps = link.newTab
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  if (href.startsWith("/")) {
    return (
      <LocaleLink href={href} {...externalProps} {...props}>
        {content}
      </LocaleLink>
    );
  }

  return (
    <a
      href={href}
      {...(href.startsWith("http")
        ? { rel: "noopener noreferrer", ...externalProps }
        : externalProps)}
      {...props}
    >
      {content}
    </a>
  );
}
