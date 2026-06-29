import { cn } from "@/lib/utils";

/** Rounded brand pill / tag label (demo `.eyebrow`, `.program-label`, `.product-tag`, `.trust-item`). */
export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("pill", className)}>{children}</span>;
}

/** Uppercase section eyebrow label (demo `.eyebrow`). */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}
