import { z } from 'zod';

export const validateVoucherSchema = z.object({
  code: z.string().min(1).max(60),
  subtotal: z.number().int().min(0),
});

export const createVoucherSchema = z.object({
  code: z.string().min(1).max(60),
  description: z.string().max(500).nullable().optional(),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.number().min(0),
  minOrderAmount: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  startsAt: z.string().min(1).nullable().optional(),
  expiresAt: z.string().min(1).nullable().optional(),
  status: z.enum(['active', 'disabled']).optional(),
});

export const updateVoucherSchema = createVoucherSchema.partial();
