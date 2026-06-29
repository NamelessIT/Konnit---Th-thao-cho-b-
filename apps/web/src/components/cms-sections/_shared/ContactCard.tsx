import { cn } from "@/lib/utils";

interface ContactCardProps {
  /** Small uppercase label, e.g. "Parent Contact". */
  label?: string;
  /** Heading, e.g. "Join a first session". */
  title?: string;
  /** Phone number; rendered as a tel: link. */
  phone?: string;
  /** Optional QR / contact image; falls back to a "QR" placeholder. */
  qrImage?: string;
  className?: string;
}

/** Contact card with QR placeholder + phone link (demo `.contact-card` / `.qr-placeholder`). */
export function ContactCard({
  label,
  title,
  phone,
  qrImage,
  className,
}: ContactCardProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[96px_1fr] items-center gap-3.5 rounded-[var(--radius)] border border-[var(--line)] bg-white/85 p-3.5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="grid aspect-square w-24 place-items-center rounded-md border border-[var(--konnit-berry)]/20 bg-white p-2">
        {qrImage ? (
          <img
            src={qrImage}
            alt={title ?? "QR"}
            className="h-full w-full rounded object-cover"
          />
        ) : (
          <span className="rounded-md bg-white/90 px-1.5 py-1 text-[11px] font-extrabold leading-none text-[var(--konnit-berry)]">
            QR
          </span>
        )}
      </div>
      <div className="grid gap-1.5">
        {label && (
          <p className="text-xs font-extrabold uppercase leading-tight text-[var(--konnit-berry)]">
            {label}
          </p>
        )}
        {title && (
          <h3 className="text-[22px] font-extrabold leading-tight text-[var(--konnit-ink)]">
            {title}
          </h3>
        )}
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            // Phone-detection browser extensions inject attrs into tel: links → benign hydration diff.
            suppressHydrationWarning
            className="pill mt-0.5 bg-[var(--konnit-pink-02)]"
          >
            {phone}
          </a>
        )}
      </div>
    </div>
  );
}
