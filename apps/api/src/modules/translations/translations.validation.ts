import { z } from 'zod';

const entrySchema = z.object({
  module: z.string().min(1).max(50),
  entityId: z.number().int().positive(),
  field: z.string().min(1).max(50),
  locale: z.string().min(2).max(10),
  value: z.string().nullable(),
});

export const upsertTranslationsSchema = z.object({
  entries: z.array(entrySchema).min(1).max(500),
});
