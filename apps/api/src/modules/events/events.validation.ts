import { z } from 'zod';

const isoDate = z.string().datetime({ offset: true }).or(z.string().min(1));

export const createEventSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  mapUrl: z.string().max(1000).nullable().optional(),
  startsAt: isoDate.nullable().optional(),
  registrationOpensAt: isoDate.nullable().optional(),
  registrationClosesAt: isoDate.nullable().optional(),
  bannerPath: z.string().max(1000).nullable().optional(),
  cmsPageId: z.number().int().positive().nullable().optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
