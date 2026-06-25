import type { ComponentType } from 'react';
export { CMS_COMPONENT_TYPES, CMS_STYLE_VARIANTS } from '@konnit/types';

export interface SectionProps {
  contentJson: Record<string, any>;
  title?: string | null;
  description?: string | null;
}

export interface SectionRegistryEntry {
  label: string;
  fields: string[];
  styles: Record<string, ComponentType<SectionProps>>;
}

export const cmsSectionRegistry: Record<string, SectionRegistryEntry> = {};
