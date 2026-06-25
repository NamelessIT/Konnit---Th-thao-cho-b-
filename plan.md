# Plan: Konnit — FE SSR TypeScript + BE API + CMS Page Builder + Bán vé sự kiện

## 0. Context

### Hiện trạng
Dự án `Konnit-client-demo` hiện là **website tĩnh thuần HTML/CSS** (4 trang: `index.html`, `services.html`, `community.html`, `store.html` + `styles.css` + 1 ảnh hero). Không có JS, build tool, backend, chưa init git.

### Mục tiêu tổng
Brief (`Brief_Trang_Dang_Ky_Ban_Ve_Su_Kien.docx`) mô tả hệ thống **đăng ký & bán vé sự kiện thể thao trẻ em/gia đình** đầy đủ: landing sự kiện, chọn vé nhiều bé/đơn, form tách phụ huynh/bé, thanh toán online, email vé QR, check-in, admin backoffice, xuất Excel, dashboard doanh thu. Tham chiếu mô hình iRace.vn / Enjoy Sport.

### Phân giai đoạn
- **Phase 1 — Web tĩnh + Admin CMS Page Builder.** Tách FE SSR TypeScript + BE API TypeScript. Admin tạo category → page → section (chọn component type + style variant, sửa content) → publish → user xem trang public. Chưa có sự kiện/bán vé.
- **Phase 2 — Sự kiện & bán vé** theo brief docx (landing sự kiện, luồng đăng ký nhiều bé, thanh toán, vé QR, check-in, admin nâng cao...). Tái sử dụng CMS builder để dựng landing sự kiện.

### Stack đã chốt
- **Frontend:** SSR React TypeScript (Next.js App Router) + shadcn/ui + Tailwind CSS
- **Backend:** Node.js Express TypeScript, API riêng
- **Database:** PostgreSQL (ORM: Prisma hoặc Drizzle)
- **Monorepo:** `/apps/web` (FE) + `/apps/api` (BE) + `/packages/ui` + `/packages/types`

---

## 1. Kiến trúc tổng thể

### 1.1. Monorepo structure
```
/ (project root)
  /apps
    /web                   # FE SSR TypeScript (Next.js App Router)
    /api                   # BE API TypeScript (Express)
  /packages
    /ui                    # shared: shadcn/ui wrappers, design tokens, CMS section registry
    /types                 # shared TypeScript types FE ↔ BE
    /config                # shared eslint/tsconfig/prettier
  /docs                    # brief, plan, technical notes
  /static-legacy           # 4 file HTML tĩnh cũ (giữ nguyên, serve qua FE hoặc riêng)
  docker-compose.yml       # Postgres + Redis (dev)
  .env.example
  turbo.json / pnpm-workspace.yaml
```

### 1.2. Data flow
```
FE SSR (Next.js)  --->  BE API (Express)  --->  PostgreSQL
      |                         |
      |                         +--> /uploads (local disk, sau chuyển S3/R2)
      |                         +--> Email service (Phase 2)
      |                         +--> Payment gateway webhook (Phase 2)
      |
      +--> shadcn/ui + CMS section registry (render component theo type + style)
```

FE **không** truy cập DB trực tiếp. Mọi data đi qua BE API.

### 1.3. Auth
- Admin auth: HttpOnly cookie session hoặc JWT HttpOnly cookie.
- Password hash: bcrypt hoặc argon2.
- CSRF protection cho admin mutation.
- Rate limit login.
- Audit log mọi hành động quan trọng.

### 1.4. Roles
- Phase 1: `admin` (toàn quyền), `editor` (CRUD CMS, upload, publish nếu được cấp), `viewer` (chỉ xem dashboard/preview).
- Phase 2 thêm: `staff` (chỉ check-in QR).

---

## 2. Database Schema — Phase 1

```sql
admin_users (id, email UNIQUE, password_hash, full_name, role, status, created_at, updated_at, is_deleted)

cms_categories (id, name, slug UNIQUE, description, parent_id NULL, sort_order, status, created_by, updated_by, published_at, created_at, updated_at, is_deleted)

cms_pages (id, category_id FK, title, slug UNIQUE per category, description, seo_title, seo_description, status, created_by, updated_by, published_at, created_at, updated_at, is_deleted)

cms_component_templates (id, type_key UNIQUE, name, description, allowed_fields_json, status, created_at, updated_at, is_deleted)

cms_component_styles (id, template_id FK, style_key UNIQUE per template, name, description, preview_image_path, css_class, status, created_at, updated_at, is_deleted)

cms_sections (id, page_id FK, template_id FK, style_id FK, component_type, style_variant, title, description, content_json JSONB, sort_order, is_visible, status, created_by, updated_by, created_at, updated_at, is_deleted)

uploads (id, original_name, file_name, mime_type, size_bytes, path, uploaded_by FK, created_at, is_deleted)

audit_logs (id, actor_id FK, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent, created_at)
```

Phase 2 thêm: `events`, `ticket_types`, `orders`, `registrations`, `add_ons`, `registration_add_ons`, `discount_codes`, `payments`, `qr_tickets`, `checkins`, `email_logs` — theo Mục 7 brief.

---

## 3. Phase 1 — CMS Page Builder (ƯU TIÊN CAO NHẤT)

### 3.1. Mục tiêu kết quả
Admin đăng nhập → tạo category (mục lục) → tạo page trong category → vào page builder thêm nhiều section → mỗi section chọn component type + style variant → sửa title/description/content/note → kéo thả sắp xếp → preview → publish → user public xem trang đúng nội dung, đúng style, đúng thứ tự.

### 3.2. Component types Phase 1
10 component phục vụ landing/content Konnit:

| # | Type | Fields | Styles |
|---|------|--------|--------|
| 1 | HeroSection | title, description, content, note, image, primaryCta, secondaryCta | banner lớn, split image/text, centered |
| 2 | RichTextSection | title, description, content (rich text), note | plain article, card content, highlighted block |
| 3 | ImageTextSection | title, description, content, note, image, imagePosition | image left, image right, image background |
| 4 | FeatureGridSection | title, description, items[] | 3 cards, icon grid, horizontal list |
| 5 | ScheduleSection | title, description, items[{time,title,description,note}] | timeline, table, card list |
| 6 | FAQSection | title, description, items[{question,answer}] | accordion, two-column FAQ |
| 7 | CTASection | title, description, buttonLabel, buttonUrl, note | simple centered, colored card, sticky mobile CTA |
| 8 | SponsorSection | title, description, logos[] | logo grid, carousel |
| 9 | NoteAlertSection | title, description, content, note, tone | info, warning, success |
| 10 | TicketPreviewSection | title, description, ticketRefs/manualItems, note | price cards, compact table |

Admin **không nhập code/CSS tùy ý**. Chỉ chọn component + style đã dev chuẩn bị sẵn. Nếu cần custom, chỉ chọn token/theme an toàn trong `content_json` (vd: `theme: "blue"`, `spacing: "lg"`).

### 3.3. FE Routes

**Public:**
```
/                                # trang chủ (tĩnh cũ hoặc CMS)
/tin-tuc                         # danh sách bài viết nếu cần blog
/tin-tuc/[slug]                  # chi tiết bài viết
/c/[categorySlug]                # category/mục lục public
/c/[categorySlug]/[pageSlug]     # page trong category (CMS render)
/su-kien                         # Phase 2: danh sách sự kiện
/su-kien/[eventSlug]             # Phase 2: landing sự kiện
/su-kien/[eventSlug]/dang-ky     # Phase 2: flow mua vé
```

**Admin:**
```
/admin/login
/admin                           # dashboard
/admin/cms/categories            # list
/admin/cms/categories/new
/admin/cms/categories/[id]/edit
/admin/cms/pages                 # list
/admin/cms/pages/new
/admin/cms/pages/[id]/builder    # page builder
/admin/cms/pages/[id]/preview
/admin/cms/components            # quản lý template registry
/admin/cms/styles                # quản lý style registry
/admin/uploads                   # media library
--- Phase 2 ---
/admin/events, /admin/orders, /admin/check-in, /admin/reports, /admin/discounts
```

### 3.4. BE API Endpoints Phase 1

**Auth:** `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me`

**Categories:** `GET|POST /api/admin/cms/categories`, `GET|PATCH|DELETE /api/admin/cms/categories/:id`, `POST .../publish`, `POST .../reorder`

**Pages:** `GET|POST /api/admin/cms/pages`, `GET|PATCH|DELETE /api/admin/cms/pages/:id`, `POST .../publish`, `POST .../unpublish`, `GET .../preview`

**Sections:** `GET|POST /api/admin/cms/pages/:pageId/sections`, `PATCH|DELETE /api/admin/cms/sections/:sectionId`, `POST .../reorder`, `POST .../duplicate`, `POST .../toggle-visible`

**Templates/Styles:** `GET /api/admin/cms/component-templates`, `GET /api/admin/cms/component-styles?templateId=...`

**Public CMS:** `GET /api/public/cms/categories`, `GET /api/public/cms/categories/:slug`, `GET /api/public/cms/pages/:categorySlug/:pageSlug`

**Uploads:** `POST|GET /api/admin/uploads`, `DELETE /api/admin/uploads/:id`

**Health:** `GET /api/health`

### 3.5. FE CMS Builder UI
Layout 3 cột (responsive):
```
[Left Sidebar]           [Canvas chính]              [Right Panel]
Categories/Pages         Danh sách section            Edit content/style
- Category 1             - Hero style 1               title
  - Page A               - RichText style 2           description
  - Page B               - FAQ style 1                content
- Category 2             - CTA style 3                note
                                                     image/cta/options
```

Tính năng UI: Search, Add Section dialog, Component type picker, Style picker (card preview), Right panel edit fields, Autosave draft / manual save, Preview (tab/modal), Publish button, Drag & drop reorder, Duplicate section, Hide/show section, Delete + confirm dialog, Badge trạng thái (draft/published/archived), Toast, Loading state, Lock action khi đang save/publish.

### 3.6. FE Component Registry
```ts
export const cmsSectionRegistry = {
  hero: {
    label: "Hero",
    styles: { style_1: HeroStyle1, style_2: HeroStyle2, style_3: HeroStyle3 },
    fields: ["title", "description", "content", "note", "image", "cta"],
  },
  rich_text: { ... },
  faq: { ... },
  // ...
}
```
Public renderer: loop sections theo sort_order → tìm component_type trong registry → tìm style_variant → render với content_json. Nếu component/style không tồn tại → render `UnsupportedSection` fallback.

---

## 4. Phase 2 — Sự kiện & bán vé (theo brief docx)

> Bắt đầu sau Phase 1 nghiệm thu. Tái sử dụng CMS builder để dựng landing sự kiện (Hero, Schedule, FAQ, TicketPreview, Sponsor...). Bám FR-01…FR-19 của brief.

- **2A — Landing sự kiện (FR-01, FR-07, FR-14):** Schema `events` + `ticket_types`. Admin tạo sự kiện (banner, ngày–giờ–địa điểm, bảng giá nhóm tuổi, early-bird, suất, hạn ĐK). Public `/su-kien/:slug`, nút "Mua vé" sticky, disable khi hết.
- **2B — Đăng ký nhiều bé/đơn (FR-02..FR-05):** Giỏ vé → form tách phụ huynh/từng bé → cam kết miễn trừ. Bảng `orders`, `registrations`. Guest checkout.
- **2C — Suất & giá (FR-07..FR-09):** Đếm suất real-time, chống oversell (transaction/giữ chỗ có hạn). Early-bird tự đổi. Mã giảm giá + nhóm.
- **2D — Thanh toán (FR-10, FR-11):** VNPay/MoMo/ZaloPay hoặc chuyển khoản + QR ngân hàng. Đơn pending tự hủy. Webhook idempotent.
- **2E — Vé QR & email (FR-12, FR-13):** Email xác nhận + vé QR riêng từng bé. Tra cứu đơn.
- **2F — Admin nâng cao (FR-14..FR-17):** Lọc/tìm, xuất Excel/CSV, dashboard doanh thu, check-in QR (chống dùng lại), phân quyền staff.
- **2G — Phụ (FR-18, FR-19):** Song ngữ, hóa đơn, Analytics/Pixel, nội dung pháp lý.

### Chống oversell (Phase 2)
- Tạo order pending → giữ chỗ tạm (thời gian cấu hình) → hết hạn tự release quota.
- Payment webhook success → chuyển paid (idempotent).
- Dùng DB transaction/lock, không chỉ check FE.

---

## 5. Production / Security

### Frontend
- Debounce search/filter. Throttle scroll/resize. Lock action save/publish/delete/payment. Disable button khi request đang chạy.
- Form dirty state, cảnh báo rời trang chưa save. Error boundary. Fallback UI component lỗi. Cache SSR public pages.

### Backend
- Helmet, CORS chặt theo domain FE. Rate limit theo nhóm endpoint.
- CSRF cho admin cookie auth. Input validation mọi endpoint (Zod). XSS sanitize rich text. Upload validate mime/size.
- Audit log. Error log. Request log. Soft delete. DB indexes (slug/status/category/sort_order).
- Transaction cho publish/reorder/order/payment. Redis cache nếu traffic lớn. Nginx reverse proxy + TLS.

---

## 6. Hosting đề xuất

### Option A — VPS (khuyến nghị khởi đầu, ~5–10$/tháng)
- Nginx reverse proxy → FE SSR (pm2) + BE API (pm2) + PostgreSQL + Redis nếu cần
- Domain: `konnit.vn` → FE, `api.konnit.vn` → BE, `dangky.konnit.vn` cho ticketing
- TLS qua Let's Encrypt. Toàn quyền dữ liệu.

### Option B — Managed (ít vận hành)
- FE: Vercel. BE: Railway/Render/Fly.io. DB: Neon/Supabase/Railway Postgres. Upload: S3/R2.

---

## 7. Acceptance Phase 1

- [ ] FE và BE tách riêng, chạy dev riêng được.
- [ ] FE dùng TypeScript SSR (Next.js) + shadcn/ui.
- [ ] Admin login được; chưa login truy cập admin bị chặn.
- [ ] Admin tạo/sửa/xóa/publish category.
- [ ] Admin tạo/sửa/xóa/publish page trong category.
- [ ] Admin vào page builder, thêm nhiều section, chọn component type + style variant.
- [ ] Admin sửa title/description/content/note từng section.
- [ ] Admin reorder/duplicate/hide/delete section.
- [ ] Admin preview trước khi publish.
- [ ] User public xem page đã publish đúng nội dung, đúng style, đúng thứ tự.
- [ ] Draft page không hiện ở public.
- [ ] UI mobile đẹp, không vỡ layout.
- [ ] Rich text/content sanitize, `<script>` không chạy.
- [ ] Upload ảnh validate mime/size, chặn file nguy hiểm.
- [ ] Audit log ghi create/update/publish/delete.
- [ ] Web tĩnh cũ vẫn truy cập được.

## 8. Verification end-to-end Phase 1

1. Chạy BE: `cd apps/api && npm install && npm run dev`
2. Chạy FE: `cd apps/web && npm install && npm run dev`
3. Login admin bằng tài khoản seed.
4. Tạo 4 categories.
5. Tạo page cho category 1.
6. Vào builder → add 4 sections: Hero style 1, RichText style 2, FeatureGrid style 3, FAQ style 1.
7. Sửa title/description/content/note từng section.
8. Save draft → Preview → Publish.
9. Mở public URL `/c/:categorySlug/:pageSlug` → kiểm tra nội dung + style.
10. Test mobile responsive (DevTools 360px/390px).
11. Thử `<script>alert(1)</script>` trong rich text → không chạy.
12. Thử spam click Save/Publish → UI lock, BE không tạo data lỗi.
