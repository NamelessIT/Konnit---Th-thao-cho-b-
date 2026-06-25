import { z } from 'zod';

export const createSectionSchema = z.object({
  templateId: z.number().int().positive(),
  styleId: z.number().int().positive(),
  componentType: z.string().min(1),
  styleVariant: z.string().min(1),
  title: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  contentJson: z.record(z.unknown()).optional(),
});

export const updateSectionSchema = z.object({
  title: z.string().max(500).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  contentJson: z.record(z.unknown()).optional(),
  isVisible: z.boolean().optional(),
  styleId: z.number().int().positive().optional(),
  styleVariant: z.string().min(1).optional(),
});

export const reorderSectionsSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    sortOrder: z.number().int().min(0),
  }),
);
