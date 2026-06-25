import type { SectionProps } from "@konnit/ui";

export function CTAStyle3({ contentJson }: SectionProps) {
  const c = contentJson;
  if (!c.buttonLabel) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--konnit-pink-03)] bg-card/90 p-3 shadow-[0_-8px_24px_rgba(143,47,103,0.12)] backdrop-blur-md md:hidden">
      <a
        href={(c.buttonUrl as string) ?? "#"}
        className="btn-shine block w-full rounded-full bg-[var(--konnit-berry)] py-3.5 text-center font-semibold text-white"
      >
        {c.buttonLabel as string}
      </a>
    </div>
  );
}
