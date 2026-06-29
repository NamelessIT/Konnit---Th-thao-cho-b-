export const CMS_COMPONENT_TYPES = [
  { typeKey: 'hero', label: 'Hero', fields: ['title', 'description', 'content', 'note', 'image', 'primaryCta', 'secondaryCta'] },
  { typeKey: 'rich_text', label: 'Nội dung văn bản', fields: ['title', 'description', 'content', 'note'] },
  { typeKey: 'image_text', label: 'Ảnh + Văn bản', fields: ['title', 'description', 'content', 'note', 'image', 'imagePosition'] },
  { typeKey: 'feature_grid', label: 'Feature Grid', fields: ['title', 'description', 'items'] },
  { typeKey: 'schedule', label: 'Lịch trình', fields: ['title', 'description', 'items'] },
  { typeKey: 'faq', label: 'FAQ', fields: ['title', 'description', 'items'] },
  { typeKey: 'cta', label: 'Call to Action', fields: ['title', 'description', 'buttonLabel', 'buttonUrl', 'note'] },
  { typeKey: 'sponsor', label: 'Nhà tài trợ', fields: ['title', 'description', 'logos'] },
  { typeKey: 'note_alert', label: 'Thông báo', fields: ['title', 'description', 'content', 'note', 'tone'] },
  { typeKey: 'ticket_preview', label: 'Bảng giá vé', fields: ['title', 'description', 'items', 'note'] },
  { typeKey: 'product', label: 'Sản phẩm', fields: ['title', 'description', 'items'] },
  { typeKey: 'contact_panel', label: 'Liên hệ', fields: ['title', 'description', 'label', 'phone', 'primaryCta', 'secondaryCta'] },
  { typeKey: 'flow_steps', label: 'Các bước (numbered)', fields: ['title', 'description', 'items'] },
] as const;

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
