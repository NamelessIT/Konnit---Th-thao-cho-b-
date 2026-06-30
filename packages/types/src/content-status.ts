// Dùng chung cho CMS category/page/section, event, ticket_type
export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const satisfies Record<string, ContentStatus>;
export const CONTENT_STATUS_LABELS_VI: Record<ContentStatus, string> = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  archived: 'Lưu trữ',
};

// Trạng thái tài khoản (admin_users / users)
export const ACCOUNT_STATUSES = ['active', 'disabled'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const satisfies Record<string, AccountStatus>;
export const ACCOUNT_STATUS_LABELS_VI: Record<AccountStatus, string> = {
  active: 'Hoạt động',
  disabled: 'Đã khoá',
};