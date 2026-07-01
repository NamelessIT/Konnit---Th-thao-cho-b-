/**
 * Registry các module có thể dịch: khoá module → bảng nguồn + các field dịch được.
 * Dùng cho export (lấy giá trị gốc) và validate import.
 */
export interface TranslatableModule {
  /** Bảng entity gốc trong DB (đã whitelist — không nhận input tùy ý). */
  table: string;
  /** Các field text được phép dịch. */
  fields: string[];
  /** Điều kiện WHERE bổ sung khi lấy source rows (vd lọc soft-delete). */
  where?: string;
  /** Nhãn hiển thị admin. */
  label: string;
}

export const TRANSLATABLE_MODULES: Record<string, TranslatableModule> = {
  events: {
    table: 'events',
    fields: ['name', 'description', 'location'],
    where: 'is_deleted = false',
    label: 'Sự kiện',
  },
  ticket_types: {
    table: 'ticket_types',
    fields: ['name', 'description', 'age_group'],
    where: 'is_deleted = false',
    label: 'Loại vé',
  },
  cms_pages: {
    table: 'cms_pages',
    fields: ['title', 'description', 'seo_title', 'seo_description'],
    where: 'is_deleted = false',
    label: 'Trang CMS',
  },
  cms_sections: {
    table: 'cms_sections',
    fields: ['title', 'description', 'content_json'],
    where: 'is_deleted = false',
    label: 'Section CMS',
  },
  vouchers: {
    table: 'vouchers',
    fields: ['description'],
    where: 'is_deleted = false',
    label: 'Voucher',
  },
};

export function isValidModule(module: string): module is keyof typeof TRANSLATABLE_MODULES {
  return Object.prototype.hasOwnProperty.call(TRANSLATABLE_MODULES, module);
}

export function isValidField(module: string, field: string): boolean {
  return isValidModule(module) && TRANSLATABLE_MODULES[module].fields.includes(field);
}
