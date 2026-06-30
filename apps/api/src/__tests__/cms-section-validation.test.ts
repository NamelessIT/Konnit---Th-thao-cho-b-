import { describe, expect, it } from 'vitest';
import {
  createSectionSchema,
  updateSectionSchema,
} from '../modules/cms/sections/sections.validation';

const baseSection = {
  templateId: 1,
  styleId: 1,
  componentType: 'hero',
  styleVariant: 'style_4',
};

describe('CMS section link validation', () => {
  it.each([
    '/cua-hang',
    '/cua-hang#ticket-12',
    '#about',
    'https://konnit.example/path',
    'mailto:hello@konnit.example',
    'tel:+84901234567',
  ])('accepts safe URL %s', (url) => {
    const result = createSectionSchema.safeParse({
      ...baseSection,
      contentJson: { primaryCta: { label: 'Mở', url } },
    });
    expect(result.success).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '//evil.example/path',
    '#Invalid Anchor',
    'https://',
    'http://.',
  ])('rejects unsafe URL %s', (url) => {
    const result = updateSectionSchema.safeParse({
      contentJson: { items: [{ linkLabel: 'Mở', linkUrl: url }] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid anchor id', () => {
    const result = updateSectionSchema.safeParse({
      contentJson: { anchorId: 'Không hợp lệ' },
    });
    expect(result.success).toBe(false);
  });
});
