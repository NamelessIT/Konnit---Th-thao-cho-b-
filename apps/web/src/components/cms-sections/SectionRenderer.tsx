"use client";

import "@/components/cms-sections/registry";
import { cmsSectionRegistry } from "@konnit/ui";
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
  return (
    <>
      {sections.map((section) => {
        const entry = cmsSectionRegistry[section.component_type];
        const Component = entry?.styles[section.style_variant];

        if (!Component) {
          return (
            <UnsupportedSection
              key={section.id}
              contentJson={section.content_json}
              title={section.title}
              description={section.description}
            />
          );
        }

        return (
          <Component
            key={section.id}
            contentJson={section.content_json}
            title={section.title}
            description={section.description}
          />
        );
      })}
    </>
  );
}