import { z } from 'zod';
import {
  CMS_ANCHOR_ID_PATTERN,
  isSafeCmsUrl,
} from '@konnit/types';

const CMS_URL_KEYS = new Set(['url', 'buttonUrl', 'linkUrl', 'ctaUrl']);

function validateCmsContent(
  value: unknown,
  ctx: z.RefinementCtx,
  path: (string | number)[] = [],
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      validateCmsContent(item, ctx, [...path, index]),
    );
    return;
  }

  if (!value || typeof value !== 'object') return;

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPath = [...path, key];

    if (
      CMS_URL_KEYS.has(key) &&
      typeof nestedValue === 'string' &&
      nestedValue.trim() &&
      !isSafeCmsUrl(nestedValue)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: nestedPath,
        message:
          'Đường dẫn chỉ hỗ trợ route nội bộ, anchor, http(s), mailto hoặc tel.',
      });
    }

    if (
      key === 'anchorId' &&
      typeof nestedValue === 'string' &&
      nestedValue.trim() &&
      !CMS_ANCHOR_ID_PATTERN.test(nestedValue.trim().toLowerCase())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: nestedPath,
        message:
          'Mã neo phải bắt đầu bằng chữ thường và chỉ gồm chữ, số, dấu gạch ngang.',
      });
    }

    validateCmsContent(nestedValue, ctx, nestedPath);
  }
}

const contentJsonSchema = z.record(z.unknown()).superRefine(validateCmsContent);

export const createSectionSchema = z.object({
  templateId: z.number().int().positive(),
  styleId: z.number().int().positive(),
  componentType: z.string().min(1),
  styleVariant: z.string().min(1),
  title: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  contentJson: contentJsonSchema.optional(),
});

export const updateSectionSchema = z.object({
  title: z.string().max(500).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  contentJson: contentJsonSchema.optional(),
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
