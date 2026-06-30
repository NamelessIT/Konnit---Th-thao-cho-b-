import { z } from 'zod';
import { CONTENT_STATUSES, GENDER_RESTRICTIONS } from '@konnit/types';

export const createTicketTypeSchema = z.object({
  eventId: z.number().int().positive(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  ageGroup: z.string().max(100).nullable().optional(),
  ageMin: z.number().int().min(0).max(120).nullable().optional(),
  ageMax: z.number().int().min(0).max(120).nullable().optional(),
  genderRestriction: z.enum(GENDER_RESTRICTIONS).optional(),
  price: z.number().int().min(0),
  earlyBirdPrice: z.number().int().min(0).nullable().optional(),
  earlyBirdUntil: z.string().min(1).nullable().optional(),
  quotaTotal: z.number().int().min(0),
  includesShirt: z.boolean().optional(),
  imagePath: z.string().max(1000).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(CONTENT_STATUSES).optional(),
});

export const updateTicketTypeSchema = createTicketTypeSchema.partial().omit({ eventId: true });
