import { z } from 'zod';

export const checkinSchema = z.object({
  eventId: z.number().int().positive(),
  qrToken: z.string().min(1).max(100),
});