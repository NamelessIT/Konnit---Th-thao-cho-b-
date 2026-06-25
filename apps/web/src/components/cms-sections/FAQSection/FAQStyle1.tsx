import type { SectionProps } from "@konnit/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Item { title?: string; description?: string }

export function FAQStyle1({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {((c.title as string) || title) && (
          <h2 className="mb-8 text-center text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <Accordion
          className="rise-in divide-y divide-[var(--konnit-pink-03)] overflow-hidden rounded-2xl border border-[var(--konnit-pink-03)] bg-card shadow-sm"
        >
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-none px-5">
              <AccordionTrigger className="text-left hover:text-[var(--konnit-berry)]">
                {item.title ?? `Câu hỏi ${i + 1}`}
              </AccordionTrigger>
              <AccordionContent className="text-[var(--konnit-muted)]">
                {item.description ?? ""}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
