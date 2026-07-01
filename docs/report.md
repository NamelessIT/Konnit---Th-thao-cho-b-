# Konnit — Báo cáo đối chiếu Brief vs Codebase

> Ngày tạo: 2026-06-30  
> Nguồn: GitNexus index + đọc trực tiếp source code  
> Brief: `docs/Konnit-client-demo/Brief_Trang_Dang_Ky_Ban_Ve_Su_Kien.md`

---

## Tóm tắt nhanh

| Nhóm | Tổng | ✅ Xong | ⚠️ Một phần | ❌ Chưa làm |
|------|------|---------|------------|------------|
| **Must** (bắt buộc MVP) | 8 | 5 | 2 | 1 |
| **Should** (nên có) | 7 | 4 | 1 | 2 |
| **Could** (làm sau) | 2 | 0 | 0 | 2 |
| **Tổng cộng** | **17** | **9** | **3** | **5** |

---

## Checklist chi tiết

### MUST — Bắt buộc cho MVP

| Mã | Yêu cầu | Trạng thái | Ghi chú kỹ thuật |
|----|---------|-----------|-----------------|
| **FR-01** | Trang landing sự kiện có nội dung & nút mua vé | ✅ **Xong** | `/cua-hang/[id]` (ticket detail), `/cua-hang` (listing). Public API `GET /api/public/events/:slug`. CMS sections cho nội dung landing. |
| **FR-02** | Chọn nhiều loại vé / nhiều bé trong một đơn | ✅ **Xong** | `CheckoutForm` dùng `useFieldArray` — N bé N slot. `CartDetail` + `QuantityDialog`. `CreateOrderPayload.children: ChildInfo[]` gửi lên API. Backend tạo `order_items` riêng cho từng bé. |
| **FR-03** | Form thông tin tách phụ huynh / từng bé | ✅ **Xong** | `CheckoutFormData.contactName/Phone/Email/Address` = phụ huynh. `children[].attendeeName/Dob/Gender/shirtSize/medalName/healthNotes` = từng bé. `guardianName/guardianPhone` lưu vào DB. |
| **FR-05** | Checkbox cam kết miễn trừ trách nhiệm (bắt buộc) | ✅ **Xong** | `CheckoutFormData.agreed: boolean`. Backend `orders.service.ts` từ chối `TERMS_REQUIRED` nếu `agreedTerms !== true`. |
| **FR-07** | Đếm số suất còn lại + khóa khi hết | ✅ **Xong** | `quota_total`, `reserved_count`, `sold_count` trên `ticket_types`. Redis cache slot. `availableSlots()` trong `pricing.ts`. `expireHeldOrders()` giải phóng slot tự động. Lỗi `TICKET_SOLD_OUT` khi hết. |
| **FR-10** | Thanh toán online qua cổng nội địa | ⚠️ **Một phần** | API `POST /api/public/orders/:code/pay` tồn tại nhưng dùng **mock payment** (insert `DEV-${uuid}` vào `payments` rồi mark `paid` ngay). **VNPay chưa tích hợp thật**. Env `VNPAY_TMN_CODE / VNPAY_HASH_SECRET` chỉ là placeholder. |
| **FR-11** | Xử lý đơn pending / hết hạn giữ chỗ | ✅ **Xong** | `hold_expires_at` trên orders. `expireHeldOrders()` chạy trong mỗi giao dịch. Trạng thái `pending → expired`. Redis cache invalidated khi nhả slot. |
| **FR-12** | Email xác nhận + vé điện tử mã QR cho từng bé | ⚠️ **Một phần** | QR token (`qr_token`, ~120-bit base64url) được tạo và lưu vào bảng `tickets` sau `payOrder`. **Nhưng email KHÔNG được gửi** — không có code nodemailer/SMTP nào trong orders flow. Env `SMTP_HOST` cấu hình sẵn nhưng chưa gọi. Frontend có thể hiển thị QR từ API nhưng người dùng không nhận email. |
| **FR-14** | Admin: danh sách đăng ký, lọc, tìm kiếm | ✅ **Xong** | `AdminOrdersPage` tại `/admin/orders`. API `GET /api/admin/orders` (requirePermission `orders.read_all`). Hiển thị đầy đủ chi tiết từng bé trong đơn. |
| **FR-15** | Admin: xuất Excel/CSV danh sách & doanh thu | ❌ **Chưa làm** | **Không tìm thấy** trong codebase — không có thư viện xlsx/csv, không có endpoint export, không có nút Download trong admin pages. Đây là **Must** chưa implement. |

---

### SHOULD — Nên có

| Mã | Yêu cầu | Trạng thái | Ghi chú kỹ thuật |
|----|---------|-----------|-----------------|
| **FR-04** | Kiểm tra ngày sinh khớp nhóm tuổi của vé | ⚠️ **Một phần** | Data model có `age_min`, `age_max`, `age_group` trên `ticket_types`. Nhưng form `CheckoutForm` **chưa validate** ngày sinh → nhóm tuổi trước khi submit. Backend cũng chưa kiểm tra. |
| **FR-06** | Mua thêm tiện ích (áo, khắc tên huy chương, suất ăn…) | ❌ **Chưa làm** | `shirtSize` và `medalName` có trong từng bé (per-child), nhưng **không có module add-on riêng** (tiện ích mua thêm tách biệt, gắn theo đơn hoặc theo bé, có giá riêng). Brief yêu cầu màn "Tiện ích" riêng (bước 4). |
| **FR-08** | Mốc giá theo thời gian (early bird / thường) | ✅ **Xong** | `early_bird_price`, `early_bird_until` trên `ticket_types`. `currentPrice()` trong `pricing.ts` tự động chọn theo thời gian. `is_early_bird` flag trả về trong API. Admin có thể set qua `loai-ve` page. |
| **FR-09** | Mã giảm giá & giảm giá nhóm | ✅ **Xong** | `POST /api/public/vouchers/validate`. `evaluateVoucher()` hỗ trợ percent & fixed. Validate khi tạo đơn & khi pay. Đếm `used_count`. Admin quản lý vouchers. UI có ô nhập voucher trong checkout. |
| **FR-13** | Tra cứu đơn bằng mã đơn + email/SĐT (guest) | ✅ **Xong** | `GET /api/public/orders/:code?email=...`. Frontend: `/don-hang/[code]` hiển thị chi tiết đơn (bao gồm QR token). `OrderStatusPanel.tsx` cho trạng thái đơn. |
| **FR-16** | Admin: check-in bằng quét QR tại sự kiện | ✅ **Xong** | `CheckInPage` tại `/admin/check-in`. `checkInTicket()` trong `checkin.service.ts`. `POST /api/admin/tickets/checkin` (yêu cầu permission `tickets.checkin`). Chống dùng lại: kiểm tra `checked_in_at`. |
| **FR-17** | Admin: dashboard số vé bán / doanh thu theo loại | ✅ **Xong** | `ReportsPage` tại `/admin/bao-cao`. API `GET /api/admin/reports/overview` — revenue, ticketsTotal, ticketsCheckedIn, orders by status, byType breakdown. Tuy nhiên chưa có **biểu đồ theo thời gian** (timeseries). |

---

### COULD — Làm sau

| Mã | Yêu cầu | Trạng thái | Ghi chú kỹ thuật |
|----|---------|-----------|-----------------|
| **FR-18** | Song ngữ VI/EN | ❌ **Chưa làm** | Toàn bộ UI đang tiếng Việt thuần. Không có i18n framework. |
| **FR-19** | Xuất hóa đơn / biên nhận theo yêu cầu | ❌ **Chưa làm** | Không có module hóa đơn. |

---

## Tính năng đã implement nhưng không có trong brief

Các phần này được xây dựng ngoài scope brief, bổ sung giá trị cho hệ thống:

| Tính năng | Vị trí | Mô tả |
|-----------|--------|-------|
| **CMS đầy đủ** | `apps/api/src/modules/cms/`, `/admin/cms/` | Quản lý categories, pages, sections. Page builder. Upload ảnh. Render public với `CmsPageView`. |
| **Public Google Login** | `apps/api/src/modules/public-auth/`, `/dang-nhap/` | OAuth Google cho public user. Lưu `auth_identities`. Session riêng với admin. |
| **User orders (đã login)** | `apps/api/src/modules/user-orders/`, `/tai-khoan/don-hang/` | Public user xem lại lịch sử đơn sau khi login Google. |
| **Refund flow** | `apps/api/src/modules/refunds/` | `requestRefund()` + `releasePaidOrderResources()`. Super admin huỷ đơn. |
| **RBAC đầy đủ** | `apps/api/src/modules/access/` | 5 roles admin (super_admin, admin, editor, viewer, checkin_staff) + customer. Phân quyền granular từng permission. |
| **Audit log** | `apps/api/src/modules/audit/` | Ghi lại các thao tác nhạy cảm. |

---

## Phân tích độ ưu tiên các việc còn lại

### Cần làm ngay (blockers cho live)

1. **FR-10 — VNPay thật** (Must)  
   Hiện tại mock payment — không thể thu tiền thật. Cần tích hợp VNPay SDK, xử lý redirect + webhook return.

2. **FR-12 — Email gửi vé QR** (Must)  
   QR token đã có trong DB, chỉ cần gọi nodemailer sau `payOrder()`. Template email với từng QR riêng.

3. **FR-15 — Excel export** (Must)  
   Admin cần xuất file để in BIB, đặt áo. Thêm endpoint `GET /api/admin/reports/export?eventId=...` trả CSV/Excel với thư viện `exceljs` hoặc `papaparse`.

### Cần làm sớm (Should chưa xong)

4. **FR-04 — Age validation** (Should)  
   Thêm validate trong `CheckoutForm`: khi nhập ngày sinh bé, kiểm tra xem `ticketType.age_min/age_max` có khớp không, hiện cảnh báo.

5. **FR-06 — Add-ons** (Should)  
   Tạo module add-on: bảng `addon_types`, `order_addons`. Màn bước 4 trong checkout flow.

---

## Ghi chú kiến trúc quan trọng

- **Slot locking**: dùng `FOR UPDATE` + transaction để tránh race condition khi nhiều người mua cùng lúc. Đúng hướng.
- **Mock payment**: `payOrder()` hiện dùng `DEV-${randomUUID()}` — **phải thay toàn bộ** khi tích hợp VNPay thật.
- **QR token**: 20 ký tự base64url (~120-bit entropy) — đủ an toàn, không thể đoán được.
- **Email**: env `SMTP_HOST` → Ethereal test inbox khi rỗng. Cần thêm service `apps/api/src/services/mailer.ts` gọi sau payOrder.
- **Guardian/Emergency**: `guardian_name`, `guardian_phone` đã có trong schema orders và payload nhưng form `CheckoutForm` hiện chưa có field riêng để nhập (có trong type nhưng không render trong UI).
