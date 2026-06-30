import { z } from 'zod';
import { CONTENT_STATUSES } from '@konnit/types';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  parentId: z.number().int().positive().nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  parentId: z.number().int().positive().nullable().optional(),
  status: z.enum(CONTENT_STATUSES).optional(),
});

export const reorderSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    sortOrder: z.number().int().min(0),
  }),
);
