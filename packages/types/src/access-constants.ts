// Catalog quyền/role dùng cho seed + tham chiếu. BE vẫn kiểm tra quyền từ DB.
// [key, resource, action, description]
export const ACCESS_PERMISSIONS = [
  ['access.manage', 'access', 'manage', 'Quản lý vai trò và phân quyền'],
  ['cms.read', 'cms', 'read', 'Xem nội dung CMS'],
  ['cms.write', 'cms', 'write', 'Tạo và sửa nội dung CMS'],
  ['cms.delete', 'cms', 'delete', 'Xóa nội dung CMS'],
  ['cms.publish', 'cms', 'publish', 'Xuất bản nội dung CMS'],
  ['events.read', 'events', 'read', 'Xem sự kiện'],
  ['events.write', 'events', 'write', 'Tạo và sửa sự kiện'],
  ['events.delete', 'events', 'delete', 'Xóa sự kiện'],
  ['events.publish', 'events', 'publish', 'Xuất bản sự kiện'],
  ['ticket_types.read', 'ticket_types', 'read', 'Xem loại vé'],
  ['ticket_types.write', 'ticket_types', 'write', 'Tạo và sửa loại vé'],
  ['ticket_types.delete', 'ticket_types', 'delete', 'Xóa loại vé'],
  ['vouchers.read', 'vouchers', 'read', 'Xem voucher'],
  ['vouchers.write', 'vouchers', 'write', 'Tạo và sửa voucher'],
  ['vouchers.delete', 'vouchers', 'delete', 'Xóa voucher'],
  ['orders.read_all', 'orders', 'read_all', 'Xem mọi đơn hàng'],
  ['orders.export', 'orders', 'export', 'Xuất dữ liệu đơn hàng'],
  ['orders.read_own', 'orders', 'read_own', 'Xem đơn hàng của chính mình'],
  ['orders.request_refund', 'orders', 'request_refund', 'Gửi yêu cầu hoàn tiền đơn của mình'],
  ['orders.manage_refunds', 'orders', 'manage_refunds', 'Duyệt/từ chối/hoàn tiền đơn hàng'],
  ['orders.confirm_payment', 'orders', 'confirm_payment', 'Xác nhận đã nhận chuyển khoản'],
  ['tickets.checkin', 'tickets', 'checkin', 'Check-in vé'],
  ['settings.read', 'settings', 'read', 'Xem cấu hình hệ thống'],
  ['settings.write', 'settings', 'write', 'Sửa cấu hình hệ thống'],
  ['profile.read', 'profile', 'read', 'Xem hồ sơ cá nhân'],
  ['profile.write', 'profile', 'write', 'Cập nhật hồ sơ cá nhân'],
] as const;

// [key, name, realm, description]
export const SYSTEM_ROLES = [
  ['super_admin', 'Super Admin', 'admin', 'Chủ hệ thống — cao nhất, duy nhất 1'],
  ['admin', 'Admin', 'admin', 'Quản trị viên — đủ quyền nhưng dưới super admin'],
  ['editor', 'Editor', 'admin', 'Quản lý nội dung và bán vé'],
  ['viewer', 'Viewer', 'admin', 'Chỉ xem dữ liệu vận hành'],
  ['checkin_staff', 'Check-in Staff', 'admin', 'Nhân viên check-in tại sự kiện'],
  ['customer', 'Customer', 'public', 'Người mua vé công khai'],
] as const;

const ALL_PERMISSION_KEYS = ACCESS_PERMISSIONS.map(([key]) => key as string);

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ALL_PERMISSION_KEYS,
  admin: ALL_PERMISSION_KEYS,
  editor: [
    'cms.read', 'cms.write', 'cms.publish',
    'events.read', 'events.write', 'events.publish',
    'ticket_types.read', 'ticket_types.write',
    'vouchers.read', 'vouchers.write',
    'orders.read_all', 'orders.export', 'orders.confirm_payment',
    'settings.read',
  ],
  viewer: [
    'cms.read', 'events.read', 'ticket_types.read',
    'vouchers.read', 'orders.read_all',
  ],
  checkin_staff: ['events.read', 'orders.read_all', 'tickets.checkin'],
  customer: ['profile.read', 'profile.write', 'orders.read_own', 'orders.request_refund'],
};

// Rank thứ bậc (mirror apps/api/.../access.middleware.ts ROLE_RANK)
export const ROLE_RANK: Record<string, number> = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  checkin_staff: 40,
  viewer: 20,
};