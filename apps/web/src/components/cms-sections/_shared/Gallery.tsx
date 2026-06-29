import { cn } from "@/lib/utils";

export type GalleryTint = "pink" | "mint" | "sky" | "sun";

export interface GalleryItem {
  /** Optional real image URL. When absent a labelled placeholder slot is shown. */
  src?: string;
  /** Caption shown on the slot (and used as alt text). */
  label?: string;
}

const TINT_GRADIENT: Record<GalleryTint, string> = {
  pink: "linear-gradient(135deg, var(--konnit-pink-03), var(--konnit-sun))",
  mint: "linear-gradient(135deg, var(--konnit-mint), var(--konnit-pink-02))",
  sky: "linear-gradient(135deg, var(--konnit-sky), var(--konnit-pink-03))",
  sun: "linear-gradient(135deg, var(--konnit-sun), var(--konnit-pink-03))",
};

/** Position presets matching the demo's `.photo-slot-large` + two `.photo-slot-small`. */
const SLOT_POSITION = [
  { top: 42, left: 18, width: "56%", height: 112 }, // large
  { top: 30, right: 18, width: "36%", height: 72, delay: "-1.4s" }, // small 1
  { bottom: 20, right: 18, width: "36%", height: 72, delay: "-2.8s" }, // small 2
] as const;

interface GalleryProps {
  /** Up to 3 slots: [large, small, small]. */
  items?: GalleryItem[];
  /** Floating caption in the top-left corner, e.g. "Activity photos". */
  caption?: string;
  /** Slot gradient family. */
  tint?: GalleryTint;
  /** Container height in px (demo uses 184). */
  height?: number;
  className?: string;
}

/**
 * Floating photo-placeholder gallery used across service/product/program/event sections.
 * Mirrors the demo `.activity-gallery` / `.photo-slot` markup (dashed frame + floating tiles).
 */
export function Gallery({
  items = [],
  caption,
  tint = "pink",
  height = 184,
  className,
}: GalleryProps) {
  const slots = items.slice(0, 3);
  // Always render 3 frames so empty galleries still show the demo layout.
  while (slots.length < 3) slots.push({});

  return (
    <div
      className={cn(
        "relative my-1.5 overflow-hidden rounded-[var(--radius)] border border-dashed border-[var(--konnit-berry)]/25",
        className,
      )}
      style={{
        height,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,233,244,0.72)), repeating-linear-gradient(135deg, rgba(143,47,103,0.05) 0 8px, transparent 8px 18px)",
      }}
    >
      {caption && (
        <span className="pill absolute left-3 top-3 z-[2] min-h-0 px-2 py-1.5 text-xs leading-none bg-white/85">
          {caption}
        </span>
      )}
      {slots.map((item, i) => {
        const { delay, ...pos } = SLOT_POSITION[i] as (typeof SLOT_POSITION)[number] & {
          delay?: string;
        };
        return (
          <div
            key={i}
            className="float-photo absolute grid place-items-end justify-items-start rounded-[var(--radius)] border-[3px] border-white/90 p-2.5 shadow-[var(--shadow-float)]"
            style={{
              ...pos,
              background: item.src ? undefined : TINT_GRADIENT[tint],
              animationDelay: delay,
            }}
          >
            {item.src ? (
              <img
                src={item.src}
                alt={item.label ?? ""}
                className="absolute inset-0 h-full w-full rounded-[5px] object-cover"
              />
            ) : item.label ? (
              <span className="max-w-full rounded-[var(--radius)] bg-white/85 px-2 py-1.5 text-[11px] font-extrabold leading-tight text-[var(--konnit-ink)]">
                {item.label}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
