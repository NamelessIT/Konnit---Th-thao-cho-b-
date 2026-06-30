"use client";

import "@/components/cms-sections/registry";
import { cmsSectionRegistry } from "@konnit/ui";
import { normalizeCmsAnchorId } from "@konnit/types";
import { UnsupportedSection } from "./UnsupportedSection";

interface SectionData {
  id: string;
  component_type: string;
  style_variant: string;
  title?: string | null;
  description?: string | null;
  content_json: Record<string, unknown>;
  sort_order: number;
}

interface Props {
  sections: SectionData[];
}

export function SectionRenderer({ sections }: Props) {
  const usedAnchors = new Set<string>();

  return (
    <>
      {sections.map((section) => {
        const entry = cmsSectionRegistry[section.component_type];
        const Component = entry?.styles[section.style_variant];
        const requestedAnchor = normalizeCmsAnchorId(
          section.content_json.anchorId,
        );
        const fallbackAnchor = `section-${section.id}`;
        const anchorId =
          requestedAnchor && !usedAnchors.has(requestedAnchor)
            ? requestedAnchor
            : fallbackAnchor;
        usedAnchors.add(anchorId);

        if (!Component) {
          return (
            <div key={section.id} id={anchorId} className="scroll-mt-24">
              <UnsupportedSection
                contentJson={section.content_json}
                title={section.title}
                description={section.description}
              />
            </div>
          );
        }

        return (
          <div key={section.id} id={anchorId} className="scroll-mt-24">
            <Component
              contentJson={section.content_json}
              title={section.title}
              description={section.description}
            />
          </div>
        );
      })}
    </>
  );
}
