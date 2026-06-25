import { z } from 'zod';

export const createPageSchema = z.object({
  categoryId: z.number().int().positive(),
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
});

export const updatePageSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  title: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).nullable().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
