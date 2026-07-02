export const CMS_COMPONENT_CONFIG = {
  hero: {
    label: 'Hero Banner',
    fields: ['anchorId', 'eyebrow', 'title', 'subtitle', 'description', 'content', 'note', 'image', 'primaryCta', 'secondaryCta'],
  },
  rich_text: {
    label: 'Nội dung văn bản',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'content', 'note'],
  },
  image_text: {
    label: 'Ảnh + Văn bản',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'content', 'note', 'image', 'imagePosition'],
  },
  feature_grid: {
    label: 'Lưới tính năng',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'items', 'primaryCta'],
  },
  schedule: {
    label: 'Lịch trình',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'items'],
  },
  faq: {
    label: 'Câu hỏi thường gặp',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'items'],
  },
  cta: {
    label: 'Kêu gọi hành động',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'buttonLabel', 'buttonUrl', 'primaryCta', 'secondaryCta', 'note'],
  },
  sponsor: {
    label: 'Nhà tài trợ',
    fields: ['anchorId', 'title', 'description', 'logos'],
  },
  note_alert: {
    label: 'Thông báo',
    fields: ['anchorId', 'title', 'description', 'content', 'note', 'tone'],
  },
  ticket_preview: {
    label: 'Bảng giá vé',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'items', 'note'],
  },
  product: {
    label: 'Sản phẩm',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'items', 'primaryCta'],
  },
  contact_panel: {
    label: 'Liên hệ',
    fields: ['anchorId', 'eyebrow', 'label', 'title', 'description', 'phone', 'qrData', 'qrImage', 'primaryCta', 'secondaryCta'],
  },
  flow_steps: {
    label: 'Các bước',
    fields: ['anchorId', 'eyebrow', 'title', 'description', 'items'],
  },
} as const;

export type CmsComponentType = keyof typeof CMS_COMPONENT_CONFIG;
export type CmsEditorField =
  (typeof CMS_COMPONENT_CONFIG)[CmsComponentType]['fields'][number];

export const CMS_COMPONENT_TYPES = Object.entries(CMS_COMPONENT_CONFIG).map(
  ([typeKey, config]) => ({
    typeKey: typeKey as CmsComponentType,
    label: config.label,
    fields: [...config.fields],
  }),
);

export const CMS_COMPONENT_LABELS: Record<CmsComponentType, string> =
  Object.fromEntries(
    Object.entries(CMS_COMPONENT_CONFIG).map(([typeKey, config]) => [
      typeKey,
      config.label,
    ]),
  ) as Record<CmsComponentType, string>;

// CTA field mà mỗi (component:style) thực sự render → editor chỉ hiện field đúng style,
// tránh "Nút chính/Nút phụ" hiển thị nhưng renderer không vẽ ra nút.
export const CMS_STYLE_CTA_FIELDS: Record<string, readonly string[]> = {
  'hero:style_4': ['primaryCta', 'secondaryCta'],
  'hero:style_5': ['primaryCta', 'secondaryCta'],
  'cta:style_1': ['buttonLabel', 'buttonUrl'],
  'cta:style_2': ['buttonLabel', 'buttonUrl'],
  'cta:style_3': ['buttonLabel', 'buttonUrl'],
  'cta:style_5': ['primaryCta', 'secondaryCta'],
  'feature_grid:style_5': ['primaryCta'],
  'product:style_1': ['primaryCta'],
  'product:style_2': ['primaryCta'],
  'contact_panel:style_1': ['primaryCta', 'secondaryCta'],
};

const CMS_CTA_FIELD_KEYS = new Set(['primaryCta', 'secondaryCta', 'buttonLabel', 'buttonUrl']);

export const CMS_STYLE_FIELD_OVERRIDES: Record<
  string,
  { omit?: readonly string[]; append?: readonly string[] }
> = {
  'image_text:style_5': {
    omit: ['image', 'imagePosition'],
    append: ['photos'],
  },
};

/** Bỏ các field nút mà style hiện tại KHÔNG render. */
export function cmsFieldsForStyle(
  componentType: string,
  styleVariant: string,
  fields: readonly string[],
): string[] {
  const supported = CMS_STYLE_CTA_FIELDS[`${componentType}:${styleVariant}`] ?? [];
  const override = CMS_STYLE_FIELD_OVERRIDES[`${componentType}:${styleVariant}`];
  const omitted = new Set(override?.omit ?? []);
  const filtered = fields.filter(
    (field) =>
      !omitted.has(field) &&
      (!CMS_CTA_FIELD_KEYS.has(field) || supported.includes(field)),
  );
  return [...new Set([...filtered, ...(override?.append ?? [])])];
}

export const CMS_EDITOR_FIELD_LABELS: Record<string, string> = {
  photos: 'Bộ ảnh',
  anchorId: 'Mã neo liên kết',
  eyebrow: 'Nhãn nhỏ phía trên',
  subtitle: 'Phụ đề',
  title: 'Tiêu đề',
  description: 'Mô tả',
  content: 'Nội dung',
  note: 'Ghi chú',
  image: 'Ảnh',
  imagePosition: 'Vị trí ảnh',
  primaryCta: 'Nút chính',
  secondaryCta: 'Nút phụ',
  buttonLabel: 'Nhãn nút',
  buttonUrl: 'Đường dẫn nút',
  items: 'Danh sách mục',
  tone: 'Màu sắc thông báo',
  logos: 'Logo nhà tài trợ',
  label: 'Nhãn nhỏ',
  phone: 'Số điện thoại',
  qrData: 'QR — nội dung/link để tạo mã quét',
  qrImage: 'QR — ảnh có sẵn (URL)',
};

export type CmsItemFieldKind = 'text' | 'csv' | 'facts' | 'ticketType';

export interface CmsItemFieldDefinition {
  key: string;
  placeholder: string;
  kind?: CmsItemFieldKind;
}

export const CMS_ITEM_FIELDS: Partial<
  Record<CmsComponentType, readonly CmsItemFieldDefinition[]>
> = {
  product: [
    { key: 'tag', placeholder: 'Nhãn (An toàn / Xe đạp / Cắm trại…)' },
    { key: 'title', placeholder: 'Tiêu đề' },
    { key: 'description', placeholder: 'Mô tả' },
    { key: 'tint', placeholder: 'Tông màu (pink / mint / sky / sun)' },
    { key: 'ageFit', placeholder: 'Độ tuổi (ví dụ 2.5–6 tuổi)' },
    { key: 'safetyNote', placeholder: 'Ghi chú an toàn' },
    { key: 'included', placeholder: 'Bao gồm' },
    { key: 'photos', placeholder: 'Ảnh — nhãn cách nhau dấu phẩy', kind: 'csv' },
    { key: 'ctaLabel', placeholder: 'Nhãn nút' },
    { key: 'ctaUrl', placeholder: 'Đường dẫn nút' },
    { key: 'linkLabel', placeholder: 'Nhãn liên kết' },
    { key: 'linkUrl', placeholder: 'Đường dẫn liên kết' },
  ],
  feature_grid: [
    { key: 'icon', placeholder: 'Biểu tượng / số (ví dụ ↗ hoặc 01)' },
    { key: 'tint', placeholder: 'Tông màu (bike / camp / science)' },
    { key: 'title', placeholder: 'Tiêu đề' },
    { key: 'description', placeholder: 'Mô tả' },
    { key: 'meta', placeholder: 'Nhãn phụ (ví dụ độ tuổi)' },
    { key: 'linkLabel', placeholder: 'Nhãn liên kết' },
    { key: 'linkUrl', placeholder: 'Đường dẫn liên kết' },
    { key: 'photos', placeholder: 'Ảnh — nhãn cách nhau dấu phẩy', kind: 'csv' },
  ],
  flow_steps: [
    { key: 'step', placeholder: 'Số bước (01, 02…) — bỏ trống để tự đánh' },
    { key: 'title', placeholder: 'Tiêu đề' },
    { key: 'description', placeholder: 'Mô tả' },
  ],
  schedule: [
    { key: 'time', placeholder: 'Thời gian (ví dụ 08:00 hoặc Ngày 1)' },
    { key: 'title', placeholder: 'Hoạt động' },
    { key: 'description', placeholder: 'Chi tiết' },
  ],
  faq: [
    { key: 'title', placeholder: 'Câu hỏi' },
    { key: 'description', placeholder: 'Trả lời' },
  ],
  image_text: [
    { key: 'label', placeholder: 'Nhãn (ví dụ Vận động)' },
    { key: 'tint', placeholder: 'Tông màu (pink / mint / sky / sun)' },
    { key: 'title', placeholder: 'Tiêu đề' },
    { key: 'description', placeholder: 'Mô tả' },
    { key: 'photos', placeholder: 'Ảnh — nhãn cách nhau dấu phẩy', kind: 'csv' },
    { key: 'facts', placeholder: 'Thông tin — mỗi dòng: nhãn | giá trị', kind: 'facts' },
  ],
  ticket_preview: [
    { key: 'ticketTypeId', placeholder: 'Chọn loại vé', kind: 'ticketType' },
    { key: 'title', placeholder: 'Tiêu đề (tự điền khi chọn vé)' },
    { key: 'price', placeholder: 'Giá hiển thị (tự điền)' },
    { key: 'description', placeholder: 'Mô tả' },
  ],
};

export const CMS_DEFAULT_ITEM_FIELDS: readonly CmsItemFieldDefinition[] = [
  { key: 'icon', placeholder: 'Biểu tượng' },
  { key: 'title', placeholder: 'Tiêu đề' },
  { key: 'description', placeholder: 'Mô tả' },
];

export interface CmsLinkValue {
  label: string;
  url: string;
  newTab?: boolean;
}

export const CMS_ANCHOR_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export function normalizeCmsAnchorId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const anchorId = value.trim().toLowerCase();
  return CMS_ANCHOR_ID_PATTERN.test(anchorId) ? anchorId : null;
}

export function normalizeCmsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  if (!url || /[\u0000-\u001f\u007f]/.test(url)) return null;

  if (url.startsWith('/')) {
    return url.startsWith('//') ? null : url;
  }

  if (url.startsWith('#')) {
    return normalizeCmsAnchorId(url.slice(1)) ? url : null;
  }

  if (/^tel:\+?[0-9().\s-]+$/i.test(url)) return url;
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url)) return url;

  if (/^https?:\/\//i.test(url)) {
    const UrlConstructor = (
      globalThis as unknown as {
        URL?: new (input: string) => {
          hostname: string;
          password: string;
          protocol: string;
          username: string;
        };
      }
    ).URL;
    if (!UrlConstructor) return null;

    try {
      const parsed = new UrlConstructor(url);
      const validHostname =
        /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i.test(
          parsed.hostname,
        ) || /^\[[0-9a-f:]+\]$/i.test(parsed.hostname);
      return validHostname &&
        !parsed.username &&
        !parsed.password &&
        (parsed.protocol === 'http:' || parsed.protocol === 'https:')
        ? url
        : null;
    } catch {
      return null;
    }
  }

  return null;
}

export function isSafeCmsUrl(value: unknown): value is string {
  return normalizeCmsUrl(value) !== null;
}

export function normalizeCmsLinkValue(value: unknown): CmsLinkValue {
  if (!value) return { label: '', url: '' };
  if (typeof value === 'string') {
    const [label = '', url = ''] = value.split('|').map((part) => part.trim());
    return { label, url };
  }
  if (typeof value !== 'object') return { label: '', url: '' };

  const link = value as Record<string, unknown>;
  return {
    label: typeof link.label === 'string' ? link.label : '',
    url: typeof link.url === 'string' ? link.url : '',
    ...(link.newTab === true ? { newTab: true } : {}),
  };
}

export const CMS_STYLE_VARIANTS: Record<string, { styleKey: string; name: string }[]> = {
  hero: [
    { styleKey: 'style_1', name: 'Banner lớn' },
    { styleKey: 'style_2', name: 'Split image/text' },
    { styleKey: 'style_3', name: 'Centered' },
    { styleKey: 'style_4', name: 'Image overlay' },
    { styleKey: 'style_5', name: 'Split board' },
  ],
  rich_text: [
    { styleKey: 'style_1', name: 'Plain article' },
    { styleKey: 'style_2', name: 'Card content' },
    { styleKey: 'style_3', name: 'Highlighted block' },
  ],
  image_text: [
    { styleKey: 'style_1', name: 'Image left' },
    { styleKey: 'style_2', name: 'Image right' },
    { styleKey: 'style_3', name: 'Image background' },
    { styleKey: 'style_4', name: 'Program split + facts' },
    { styleKey: 'style_5', name: 'Gallery panel' },
  ],
  feature_grid: [
    { styleKey: 'style_1', name: '3 cards' },
    { styleKey: 'style_2', name: 'Icon grid' },
    { styleKey: 'style_3', name: 'Horizontal list' },
    { styleKey: 'style_4', name: 'Service card (gallery + pill)' },
    { styleKey: 'style_5', name: 'Numbered panel' },
  ],
  schedule: [
    { styleKey: 'style_1', name: 'Timeline' },
    { styleKey: 'style_2', name: 'Table' },
    { styleKey: 'style_3', name: 'Card list' },
  ],
  faq: [
    { styleKey: 'style_1', name: 'Accordion' },
    { styleKey: 'style_2', name: 'Two-column' },
  ],
  cta: [
    { styleKey: 'style_1', name: 'Simple centered' },
    { styleKey: 'style_2', name: 'Colored card' },
    { styleKey: 'style_3', name: 'Sticky mobile CTA' },
    { styleKey: 'style_4', name: 'Panel + chips' },
    { styleKey: 'style_5', name: 'Panel 2 cột (note/actions)' },
  ],
  sponsor: [
    { styleKey: 'style_1', name: 'Logo grid' },
    { styleKey: 'style_2', name: 'Carousel' },
  ],
  note_alert: [
    { styleKey: 'style_1', name: 'Info' },
    { styleKey: 'style_2', name: 'Warning' },
    { styleKey: 'style_3', name: 'Success' },
  ],
  ticket_preview: [
    { styleKey: 'style_1', name: 'Price cards' },
    { styleKey: 'style_2', name: 'Compact table' },
  ],
  product: [
    { styleKey: 'style_1', name: 'Catalog grid (4-up)' },
    { styleKey: 'style_2', name: 'Kit card + facts' },
  ],
  contact_panel: [
    { styleKey: 'style_1', name: 'Card + actions' },
    { styleKey: 'style_2', name: 'About panel (bullets + trust)' },
  ],
  flow_steps: [
    { styleKey: 'style_1', name: '3 cột' },
    { styleKey: 'style_2', name: '4 cột' },
    { styleKey: 'style_3', name: '5 cột' },
  ],
};
