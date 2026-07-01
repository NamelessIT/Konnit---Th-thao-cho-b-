import { z } from 'zod';

// Mã locale: 'vi', 'en', 'ja', 'pt-BR'...
const localeCode = z
  .string()
  .min(2)
  .max(10)
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Mã ngôn ngữ không hợp lệ (vd: vi, en, pt-BR)');

export const createLanguageSchema = z.object({
  code: localeCode,
  name: z.string().min(1).max(100),
  nativeName: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateLanguageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nativeName: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
