# INSTRUCTOR — Hướng dẫn thực thi Konnit Phase 1

> **Tài liệu này dành cho bất kỳ ai (người hoặc AI agent) thực hiện code.**
> Đọc file này = biết nên làm gì, tạo file gì, ở đâu, theo thứ tự nào.
> Tham chiếu `plan.md` để hiểu WHY. File này chỉ nói WHAT và HOW.

---

## MỤC LỤC

- [A. Tổng quan nhanh](#a-tổng-quan-nhanh)
- [B. Chuẩn bị môi trường](#b-chuẩn-bị-môi-trường)
- [C. Task Group 1 — Khởi tạo monorepo](#c-task-group-1--khởi-tạo-monorepo) ✅ DONE
- [D. Task Group 2 — Backend: bootstrap API](#d-task-group-2--backend-bootstrap-api) ✅ DONE
- [E. Task Group 3 — Backend: database & auth](#e-task-group-3--backend-database--auth) ✅ DONE
- [F. Task Group 4 — Backend: CMS core API](#f-task-group-4--backend-cms-core-api) ✅ DONE
- [G. Task Group 5 — Backend: upload & audit](#g-task-group-5--backend-upload--audit) ✅ DONE
- [H. Task Group 6 — Frontend: bootstrap SSR + shadcn/ui](#h-task-group-6--frontend-bootstrap-ssr--shadcnui) ✅ DONE
- [I. Task Group 7 — Frontend: admin CMS UI](#i-task-group-7--frontend-admin-cms-ui)
- [J. Task Group 8 — Frontend: public CMS renderer](#j-task-group-8--frontend-public-cms-renderer)
- [K. Task Group 9 — Kết nối web tĩnh cũ](#k-task-group-9--kết-nối-web-tĩnh-cũ)
- [L. Task Group 10 — Test & QA](#l-task-group-10--test--qa)
- [M. Quy tắc chung khi code](#m-quy-tắc-chung-khi-code)

---

## A. Tổng quan nhanh

**Làm gì:** Xây Admin CMS Page Builder — admin tạo category → page → section (chọn component + style → sửa content) → publish → user xem trang.

**Stack:** Next.js App Router (TypeScript) + Express TypeScript API + PostgreSQL + shadcn/ui + Tailwind.

**Cấu trúc:**
```
/
├── apps/
│   ├── web/           ← FE (Next.js)
│   └── api/           ← BE (Express TS)
├── packages/
│   ├── ui/            ← shared UI components, CMS section registry
│   ├── types/         ← shared TS types
│   └── config/        ← shared eslint/tsconfig
├── static-legacy/     ← 4 file HTML/CSS tĩnh cũ (KHÔNG SỬA nội dung)
├── docs/              ← brief, plan
├── docker-compose.yml
├── .env.example
├── turbo.json
└── pnpm-workspace.yaml
```

**Thứ tự làm:** Task Group 1 → 2 → 3 → 4 → 5 (BE xong trước) → 6 → 7 → 8 (FE) → 9 → 10. Trong đó BE (2–5) và FE (6–8) CÓ THỂ làm song song nếu có 2 người/agent, miễn là BE Task 2 xong trước để FE có API gọi.

---

## B. Chuẩn bị môi trường

Trước khi bắt đầu code, đảm bảo có sẵn:

| Tool | Version | Kiểm tra |
|------|---------|----------|
| Node.js | ≥ 20 LTS | `node -v` |
| pnpm | ≥ 9 | `pnpm -v` (dùng pnpm cho monorepo) |
| PostgreSQL | ≥ 15 | `psql --version` hoặc chạy qua Docker |
| Docker + Docker Compose | latest | `docker compose version` (dùng cho Postgres dev) |
| Git | ≥ 2 | `git --version` |

---

## C. Task Group 1 — Khởi tạo monorepo ✅ DONE

### Mục tiêu
Tạo cấu trúc monorepo, workspace config, shared packages.

### Các file cần tạo

**1. Root files:**

| File | Nội dung |
|------|----------|
| `pnpm-workspace.yaml` | Khai báo `packages: ["apps/*", "packages/*"]` |
| `turbo.json` | Pipeline: `build`, `dev`, `lint`, `typecheck` |
| `package.json` | Root package, scripts: `dev`, `build`, `lint`, `db:init`, `db:seed` |
| `.gitignore` | `node_modules`, `.env`, `.env.local`, `dist`, `.next`, `.turbo`, `/uploads`, `*.log` |
| `.env.example` | `DATABASE_URL=postgresql://...`, `SESSION_SECRET=...`, `PORT_API=4000`, `PORT_WEB=3000`, `NEXT_PUBLIC_API_URL=http://localhost:4000` |
| `docker-compose.yml` | Service: `postgres` (image postgres:15, port 5432, volume), `redis` (tùy chọn) |
| `tsconfig.base.json` | Shared TS config: `strict: true`, path aliases |

**2. Di chuyển static cũ:**
- Tạo folder `static-legacy/`
- Copy `index.html`, `services.html`, `community.html`, `store.html`, `styles.css`, `assets/` vào đó
- **KHÔNG xóa** các file gốc cho đến khi FE serve được chúng

**3. Shared packages:**

| Path | File | Nội dung |
|------|------|----------|
| `packages/types/package.json` | | name `@konnit/types` |
| `packages/types/src/index.ts` | | Export tất cả types |
| `packages/types/src/cms.ts` | | Types: `Category`, `Page`, `Section`, `ComponentTemplate`, `ComponentStyle`, `SectionContentJson` |
| `packages/types/src/auth.ts` | | Types: `AdminUser`, `LoginRequest`, `LoginResponse`, `SessionUser` |
| `packages/types/src/api.ts` | | Types: `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError` |
| `packages/types/tsconfig.json` | | Extends base |
| `packages/config/eslint.js` | | Shared ESLint config |
| `packages/config/tsconfig.json` | | Base TS config |
| `packages/ui/package.json` | | name `@konnit/ui` |
| `packages/ui/src/cms-registry.ts` | | CMS section registry (xem mục H.3) |

### Acceptance
- [x] `pnpm install` chạy không lỗi. *(cần chạy sau khi user setup)*
- [x] `docker compose up -d` khởi Postgres. *(docker-compose.yml đã tạo)*
- [x] Workspace apps/web và apps/api nhận được packages. *(pnpm-workspace.yaml + package.json đã cấu hình)*

### Đã hoàn thành
- Tạo monorepo structure: `apps/api`, `apps/web`, `packages/types`, `packages/ui`, `packages/config`
- Root configs: `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `package.json`, `.env.example`, `docker-compose.yml`, `.gitignore`
- Shared types: `@konnit/types` — auth.ts, cms.ts, api.ts
- CMS registry: `@konnit/ui` — cms-registry.ts (10 component types + style variants)
- Di chuyển static HTML cũ → `static-legacy/`
- Archive source EJS monolith cũ → `_archive/`

---

## D. Task Group 2 — Backend: bootstrap API ✅ DONE

### Mục tiêu
Express TypeScript API chạy được, có health endpoint, error handler, logger.

### Cài packages (trong `apps/api`):
```bash
pnpm add express cors helmet compression dotenv pg zod bcrypt multer express-rate-limit cookie-parser express-session connect-pg-simple uuid pino pino-http
pnpm add -D typescript @types/node @types/express @types/cors @types/bcrypt @types/multer @types/express-session @types/connect-pg-simple @types/uuid tsx nodemon
```

### Các file cần tạo

```
apps/api/
├── package.json          # name: @konnit/api, scripts: dev, build, start, db:init, db:seed
├── tsconfig.json         # extends base, paths: @/*
├── nodemon.json          # exec: tsx, watch: src
├── src/
│   ├── server.ts         # import app, listen PORT_API
│   ├── app.ts            # express(), helmet, cors, compression, pino-http, cookie-parser,
│   │                     # session (connect-pg-simple), JSON body parser, routes, error handler
│   ├── config/
│   │   ├── env.ts        # dotenv, export typed env vars, validate required vars
│   │   └── db.ts         # pg.Pool from DATABASE_URL, export pool + query helper
│   ├── middleware/
│   │   ├── errorHandler.ts    # catch-all error middleware, log + return ApiError format
│   │   ├── validate.ts        # Zod validation middleware factory
│   │   ├── rateLimit.ts       # rate limit configs per group (login, mutation, public)
│   │   └── csrf.ts            # CSRF token middleware (nếu dùng cookie session)
│   ├── modules/
│   │   └── health/
│   │       └── health.routes.ts  # GET /api/health → { status: "ok", timestamp }
│   └── utils/
│       ├── logger.ts      # pino instance
│       └── asyncHandler.ts # wrap async route handler
```

### Acceptance
- [x] `pnpm --filter @konnit/api dev` → API chạy trên PORT_API. *(server.ts + app.ts đã tạo)*
- [x] `GET /api/health` trả `{ status: "ok" }`. *(health.routes.ts đã tạo)*
- [x] Request lỗi (404, validation) trả format `{ success: false, error: { code, message } }`. *(errorHandler.ts + validate.ts đã tạo)*
- [x] Log request ra console (pino-http). *(logger.ts + pinoHttp trong app.ts)*

### Đã hoàn thành
- `apps/api/src/server.ts`, `app.ts` — Express bootstrap với helmet, cors, compression, pino-http
- `config/env.ts` — typed env validation
- `config/db.ts` — pg.Pool
- `utils/logger.ts`, `utils/asyncHandler.ts`
- `middleware/errorHandler.ts` — AppError class + catch-all
- `middleware/validate.ts` — Zod validation middleware
- `middleware/rateLimit.ts` — login, mutation, public rate limiters
- `modules/health/health.routes.ts`
- `db/schema.sql` — TOÀN BỘ schema Phase 1 (8 bảng + indexes)
- `db/init.ts`, `db/seed.ts` — admin user + component templates/styles seed

---

## E. Task Group 3 — Backend: database & auth ✅ DONE

### Mục tiêu
Schema, seed, auth login/logout/me, middleware bảo vệ routes admin.

### Các file cần tạo

```
apps/api/src/
├── db/
│   ├── schema.sql         # TẤT CẢ bảng Phase 1 (xem dưới)
│   ├── seed.sql           # 1 admin user (email: admin@konnit.vn, password hash bcrypt "admin123")
│   │                      # Seed component templates + styles mặc định (10 types × 2-3 styles)
│   │                      # 1-2 category mẫu, 1 page mẫu, vài section mẫu
│   └── init.ts            # Script: đọc schema.sql + seed.sql, chạy qua pool
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts      # POST /api/admin/auth/login, POST .../logout, GET .../me
│   │   ├── auth.controller.ts  # handle login (validate email/pass, compare bcrypt, set session)
│   │   ├── auth.service.ts     # findUserByEmail, verifyPassword
│   │   └── auth.middleware.ts  # requireAuth (check session), requireRole('admin'|'editor')
│   └── users/
│       ├── users.model.ts      # SQL queries: findByEmail, findById, create
│       └── users.service.ts    # business logic wrapper
```

### Schema SQL chi tiết (viết vào `schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','editor','viewer','staff')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  is_deleted    BOOLEAN DEFAULT false
);

-- session table sẽ được connect-pg-simple tự tạo, hoặc tạo tay:
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    VARCHAR NOT NULL COLLATE "default",
  "sess"   JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

(Các bảng CMS ở Task Group 4)

### Seed SQL
- Hash password `admin123` bằng bcrypt (rounds=12). Có thể dùng script Node để generate hash rồi paste vào seed.sql, hoặc viết seed.ts dùng bcrypt runtime.
- **Khuyến nghị:** viết `seed.ts` thay vì `seed.sql` cho admin user (vì cần bcrypt runtime). Các data CMS template/style có thể dùng SQL thuần.

### Auth flow
1. `POST /api/admin/auth/login` → body: `{ email, password }` → validate Zod → tìm user → bcrypt.compare → set `req.session.user = { id, email, role, fullName }` → trả `{ success: true, user }`.
2. `POST /api/admin/auth/logout` → `req.session.destroy()` → trả `{ success: true }`.
3. `GET /api/admin/auth/me` → requireAuth → trả `req.session.user`.
4. `requireAuth` middleware: check `req.session.user`, không có → 401.
5. `requireRole(role)` middleware: check `req.session.user.role`, không đủ quyền → 403.

### Acceptance
- Login đúng email/pass → 200, set cookie session.
- Login sai → 401.
- `GET /api/admin/auth/me` có session → trả user, không session → 401.
- Logout → session bị hủy.
- Rate limit: > 10 login failed trong 15 phút → 429.

---

## F. Task Group 4 — Backend: CMS core API

### Mục tiêu
CRUD category, page, section. Public API. Đây là task LỚN NHẤT phía BE.

### Thêm bảng vào `schema.sql`

```sql
CREATE TABLE IF NOT EXISTS cms_categories (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  parent_id     INT REFERENCES cms_categories(id) ON DELETE SET NULL,
  sort_order    INT DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by    INT REFERENCES admin_users(id),
  updated_by    INT REFERENCES admin_users(id),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  is_deleted    BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS cms_pages (
  id              SERIAL PRIMARY KEY,
  category_id     INT NOT NULL REFERENCES cms_categories(id),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by      INT REFERENCES admin_users(id),
  updated_by      INT REFERENCES admin_users(id),
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT false,
  UNIQUE(category_id, slug)
);

CREATE TABLE IF NOT EXISTS cms_component_templates (
  id                  SERIAL PRIMARY KEY,
  type_key            TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  allowed_fields_json JSONB,
  status              TEXT NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  is_deleted          BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS cms_component_styles (
  id                  SERIAL PRIMARY KEY,
  template_id         INT NOT NULL REFERENCES cms_component_templates(id),
  style_key           TEXT NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  preview_image_path  TEXT,
  css_class           TEXT,
  status              TEXT NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  is_deleted          BOOLEAN DEFAULT false,
  UNIQUE(template_id, style_key)
);

CREATE TABLE IF NOT EXISTS cms_sections (
  id              SERIAL PRIMARY KEY,
  page_id         INT NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  template_id     INT REFERENCES cms_component_templates(id),
  style_id        INT REFERENCES cms_component_styles(id),
  component_type  TEXT NOT NULL,
  style_variant   TEXT NOT NULL,
  title           TEXT,
  description     TEXT,
  content_json    JSONB DEFAULT '{}',
  sort_order      INT DEFAULT 0,
  is_visible      BOOLEAN DEFAULT true,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by      INT REFERENCES admin_users(id),
  updated_by      INT REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT false
);

CREATE INDEX idx_sections_page_order ON cms_sections(page_id, sort_order) WHERE is_deleted = false;
CREATE INDEX idx_pages_category ON cms_pages(category_id) WHERE is_deleted = false;
CREATE INDEX idx_categories_slug ON cms_categories(slug) WHERE is_deleted = false;
```

### Các file cần tạo

```
apps/api/src/modules/cms/
├── cms.routes.ts           # mount tất cả sub-routes
├── categories/
│   ├── categories.routes.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   ├── categories.repository.ts   # SQL queries
│   └── categories.validation.ts   # Zod schemas
├── pages/
│   ├── pages.routes.ts
│   ├── pages.controller.ts
│   ├── pages.service.ts
│   ├── pages.repository.ts
│   └── pages.validation.ts
├── sections/
│   ├── sections.routes.ts
│   ├── sections.controller.ts
│   ├── sections.service.ts
│   ├── sections.repository.ts
│   └── sections.validation.ts
├── templates/
│   ├── templates.routes.ts
│   └── templates.repository.ts
└── public/
    ├── public-cms.routes.ts
    └── public-cms.controller.ts
```

### Logic quan trọng

**Category CRUD:**
- `slug` tự sinh từ `name` bằng `slugify`, cho sửa. Validate unique.
- `sort_order`: khi reorder, nhận array `[{id, sort_order}]`, update batch trong transaction.
- Delete: set `is_deleted = true`.
- Publish: set `status = 'published'`, `published_at = now()`.

**Page CRUD:**
- `slug` unique **trong cùng category** (composite unique `category_id + slug`).
- Publish: chỉ publish nếu category cha đã published. Hoặc tự publish category cha kèm.
- Preview: trả data page + sections (kể cả draft/hidden) cho admin xem trước.

**Section CRUD:**
- `POST /api/admin/cms/pages/:pageId/sections` → tạo section mới, `sort_order` = max + 1.
- `content_json`: lưu tất cả field data (title, description, content, note, image, cta, items...) dạng JSONB. Validate theo `component_type` dùng Zod schema tương ứng.
- Reorder: nhận array `[{id, sort_order}]`, update batch trong transaction.
- Duplicate: copy section, title + " (copy)", sort_order = sau section gốc.
- Toggle visible: flip `is_visible`.
- **Sanitize** mọi HTML trong `content_json` trước khi lưu. Dùng `sanitize-html` với allowlist tag an toàn.

**Public CMS API:**
- CHỈ trả data đã `published`, `is_visible = true`, `is_deleted = false`.
- `GET /api/public/cms/categories` → danh sách category published.
- `GET /api/public/cms/categories/:slug` → category + danh sách pages published.
- `GET /api/public/cms/pages/:categorySlug/:pageSlug` → page + sections (published, visible, ordered by sort_order).

### Seed data CMS templates

Seed 10 component templates + styles vào `cms_component_templates` và `cms_component_styles`:

```
hero          → style_1 (Banner lớn), style_2 (Split image/text), style_3 (Centered)
rich_text     → style_1 (Plain article), style_2 (Card content), style_3 (Highlighted block)
image_text    → style_1 (Image left), style_2 (Image right), style_3 (Image background)
feature_grid  → style_1 (3 cards), style_2 (Icon grid), style_3 (Horizontal list)
schedule      → style_1 (Timeline), style_2 (Table), style_3 (Card list)
faq           → style_1 (Accordion), style_2 (Two-column)
cta           → style_1 (Simple centered), style_2 (Colored card), style_3 (Sticky mobile)
sponsor       → style_1 (Logo grid), style_2 (Carousel)
note_alert    → style_1 (Info), style_2 (Warning), style_3 (Success)
ticket_preview→ style_1 (Price cards), style_2 (Compact table)
```

### Acceptance
- CRUD category qua API: tạo, sửa, xóa (soft), publish, reorder.
- CRUD page: tạo, sửa, xóa, publish/unpublish.
- CRUD section: tạo, sửa content_json, xóa, reorder, duplicate, toggle visible.
- Public API chỉ trả published + visible.
- Draft page/section ẩn khỏi public.
- `<script>` trong content_json bị strip.

---

## G. Task Group 5 — Backend: upload & audit

### Các file cần tạo

```
apps/api/src/modules/
├── uploads/
│   ├── uploads.routes.ts       # POST /api/admin/uploads, GET, DELETE
│   ├── uploads.controller.ts
│   └── uploads.service.ts
├── audit/
│   ├── audit.service.ts        # logAction(actorId, action, entityType, entityId, before, after, req)
│   └── audit.middleware.ts     # middleware tự ghi audit cho CMS mutations (optional)
```

**Schema (thêm vào schema.sql):**
```sql
CREATE TABLE IF NOT EXISTS uploads (
  id             SERIAL PRIMARY KEY,
  original_name  TEXT NOT NULL,
  file_name      TEXT UNIQUE NOT NULL,
  mime_type      TEXT NOT NULL,
  size_bytes     INT NOT NULL,
  path           TEXT NOT NULL,
  uploaded_by    INT REFERENCES admin_users(id),
  created_at     TIMESTAMPTZ DEFAULT now(),
  is_deleted     BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL PRIMARY KEY,
  actor_id    INT REFERENCES admin_users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   INT,
  before_json JSONB,
  after_json  JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

**Upload rules:**
- Dùng `multer` + `diskStorage`, lưu vào `/uploads/<year>/<month>/<uuid>-<originalname>`.
- Validate: mime chỉ cho `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `application/pdf`.
- Size limit: 5MB.
- File `.html`, `.js`, `.exe` → reject.
- Trả `{ id, url: "/uploads/..." }`.
- Serve static: `express.static('uploads')`.
- Delete: set `is_deleted = true` (không xóa file vật lý trong MVP).

**Audit:**
- Gọi `auditService.log(...)` trong controller sau mỗi mutation thành công (create, update, publish, unpublish, delete category/page/section, upload, login success/fail).
- Không cần UI audit log ở Phase 1 — chỉ lưu DB, query khi cần debug.

### Acceptance
- Upload ảnh jpg/png thành công, trả URL.
- Upload file .html → 400.
- File > 5MB → 400.
- Audit log table có record sau mỗi CRUD operation.

---

## H. Task Group 6 — Frontend: bootstrap SSR + shadcn/ui

### Mục tiêu
Next.js App Router chạy SSR, shadcn/ui hoạt động, layout public + admin.

### Setup

```bash
cd apps
pnpm create next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd web
pnpm add @konnit/types@workspace:* @konnit/ui@workspace:*
```

Sau đó:
```bash
npx shadcn@latest init
npx shadcn@latest add button card input textarea select checkbox radio-group dialog sheet tabs table badge alert form dropdown-menu popover command calendar accordion separator toast sidebar scroll-area
```

### Các file/folder cần tạo

```
apps/web/src/
├── app/
│   ├── layout.tsx              # root layout, font, metadata
│   ├── page.tsx                # trang chủ (có thể redirect hoặc render static-legacy)
│   ├── (public)/               # route group public
│   │   ├── layout.tsx          # public layout (header, footer)
│   │   ├── tin-tuc/
│   │   │   ├── page.tsx        # danh sách bài (nếu cần blog)
│   │   │   └── [slug]/page.tsx
│   │   └── c/
│   │       ├── [categorySlug]/
│   │       │   ├── page.tsx    # category page public
│   │       │   └── [pageSlug]/
│   │       │       └── page.tsx # CMS page render
│   ├── admin/
│   │   ├── layout.tsx          # admin layout (sidebar, topbar, auth guard)
│   │   ├── page.tsx            # dashboard
│   │   ├── login/page.tsx
│   │   └── cms/
│   │       ├── categories/
│   │       │   ├── page.tsx        # list
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/edit/page.tsx
│   │       ├── pages/
│   │       │   ├── page.tsx        # list
│   │       │   ├── new/page.tsx
│   │       │   ├── [id]/
│   │       │   │   ├── builder/page.tsx   # ← PAGE BUILDER (màn quan trọng nhất)
│   │       │   │   └── preview/page.tsx
│   │       └── uploads/page.tsx    # media library
├── components/
│   ├── ui/                     # shadcn/ui components (auto-generated, hạn chế sửa)
│   ├── common/                 # PageHeader, EmptyState, ConfirmDialog, LoadingButton
│   ├── layout/                 # PublicHeader, PublicFooter, AdminSidebar, AdminTopbar
│   ├── cms/
│   │   ├── CategoryList.tsx
│   │   ├── PageList.tsx
│   │   ├── SectionEditor.tsx       # right panel edit content
│   │   ├── SectionCard.tsx         # section trong canvas
│   │   ├── AddSectionDialog.tsx    # dialog chọn component type
│   │   ├── StylePicker.tsx         # chọn style variant
│   │   ├── PageBuilderCanvas.tsx   # canvas chính, drag & drop
│   │   └── PagePreview.tsx         # preview render
│   └── cms-sections/               # PUBLIC section renderers
│       ├── HeroSection/
│       │   ├── HeroStyle1.tsx
│       │   ├── HeroStyle2.tsx
│       │   └── HeroStyle3.tsx
│       ├── RichTextSection/
│       │   ├── RichTextStyle1.tsx
│       │   ├── RichTextStyle2.tsx
│       │   └── RichTextStyle3.tsx
│       ├── ImageTextSection/ ...
│       ├── FeatureGridSection/ ...
│       ├── ScheduleSection/ ...
│       ├── FAQSection/ ...
│       ├── CTASection/ ...
│       ├── SponsorSection/ ...
│       ├── NoteAlertSection/ ...
│       ├── TicketPreviewSection/ ...
│       ├── UnsupportedSection.tsx  # fallback khi type/style không tồn tại
│       └── SectionRenderer.tsx     # loop sections → lookup registry → render
├── lib/
│   ├── api-client.ts           # typed fetch wrapper, gọi BE API, handle errors
│   ├── auth.ts                 # client-side auth helpers (check session, redirect)
│   └── utils.ts                # format date, slugify, etc.
├── styles/
│   ├── globals.css             # Tailwind directives, CSS variables/design tokens Konnit
│   └── cms/                    # CSS modules cho section nếu Tailwind không đủ
│       ├── hero.module.css
│       └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useCmsPages.ts          # SWR/React Query hooks cho CMS data
│   └── useDebounce.ts
```

### API Client (`lib/api-client.ts`)
```ts
// Typed wrapper, base URL từ env NEXT_PUBLIC_API_URL
// Methods: get<T>(path), post<T>(path, body), patch<T>(path, body), delete<T>(path)
// Auto-include credentials (cookies)
// Handle 401 → redirect /admin/login
// Handle errors → throw typed ApiError
```

### Design tokens (`styles/globals.css`)
Kế thừa từ `styles.css` cũ: màu sắc, font, spacing thương hiệu Konnit. Map sang CSS variables để shadcn/ui dùng.

### Acceptance
- `pnpm --filter web dev` → Next.js chạy port 3000.
- shadcn Button/Card/Form render đúng.
- Có layout public (header/footer) và admin (sidebar) riêng.
- API client gọi được BE `/api/health`.

---

## I. Task Group 7 — Frontend: admin CMS UI

### Đây là task LỚN NHẤT phía FE. Chia nhỏ:

### 7.1. Login page
- Form email + password.
- Gọi `POST /api/admin/auth/login`.
- Thành công → redirect `/admin`.
- Lỗi → toast error.

### 7.2. Admin dashboard (`/admin`)
- Card thống kê: tổng category, tổng page, page published, page draft.
- Quick links: tạo category, tạo page.

### 7.3. Category CRUD (`/admin/cms/categories`)
- Table danh sách: name, slug, status, số page, created_at, actions (edit/delete/publish).
- Trang tạo/sửa: form name, slug (auto-gen + cho sửa), description, status.
- Delete: confirm dialog → soft delete.
- Publish: button → gọi API.

### 7.4. Page CRUD (`/admin/cms/pages`)
- Table: title, category, slug, status, sections count, updated_at, actions (builder/edit/preview/delete/publish).
- Trang tạo/sửa: form title, slug, category (select), description, seo_title, seo_description.

### 7.5. Page Builder (`/admin/cms/pages/[id]/builder`) — MÀN QUAN TRỌNG NHẤT

Layout 3 cột:

**Cột trái — Sidebar navigation:**
- Tree view: categories → pages.
- Search filter.
- Click page → load sections vào canvas.

**Cột giữa — Canvas:**
- Danh sách section cards, mỗi card hiện: component type icon, style name, title excerpt, badge visible/hidden.
- **Drag & drop** reorder (dùng `@dnd-kit/core` hoặc `react-beautiful-dnd`).
- Nút "+" ở cuối và giữa các section → mở `AddSectionDialog`.
- Click section card → mở edit ở right panel.
- Actions trên mỗi card: duplicate, hide/show, delete (confirm).

**Cột phải — Edit panel:**
- Hiện khi click 1 section.
- Component type + style (read-only hoặc cho đổi style).
- **Style picker**: grid card nhỏ với preview image, click chọn.
- Form fields tùy component type:
  - `title`: input text
  - `description`: textarea
  - `content`: rich text editor (Quill/TipTap/Editor.js)
  - `note`: textarea
  - `image`: upload picker (chọn từ media library hoặc upload mới)
  - `cta`: { label, url }
  - `items[]`: list có thêm/xóa/reorder (FAQ items, schedule items, feature items)

**Top bar:**
- Page title + status badge.
- Nút: `Save Draft` | `Preview` | `Publish` / `Unpublish`.
- Lock actions khi đang save (disable buttons, show spinner).
- Toast khi save thành công/thất bại.

**`AddSectionDialog`:**
- Bước 1: grid chọn component type (icon + label + mô tả ngắn). Lấy từ API `GET /api/admin/cms/component-templates`.
- Bước 2: grid chọn style variant (preview image + name). Lấy từ API `GET /api/admin/cms/component-styles?templateId=...`.
- Bước 3: tạo section mới → append vào canvas.

### 7.6. Page Preview (`/admin/cms/pages/[id]/preview`)
- Render giống public nhưng bao gồm cả draft/hidden sections (đánh dấu khác).
- Hoặc mở tab mới dùng query param `?preview=true&token=...`.

### 7.7. Media Library (`/admin/uploads`)
- Grid ảnh đã upload.
- Upload mới (drag & drop zone).
- Click chọn ảnh → copy URL hoặc dùng trong section editor.
- Delete ảnh (soft).

### Acceptance
- Login → dashboard → thấy stats.
- Tạo 4 category.
- Tạo page trong category 1.
- Mở builder → thêm 4 section (Hero style 1, RichText style 2, FeatureGrid style 1, FAQ style 2).
- Sửa title/description/content/note từng section.
- Kéo thả đổi thứ tự.
- Duplicate 1 section → xóa bản copy.
- Hide 1 section → thấy badge "hidden".
- Save draft → refresh → data còn.
- Preview → thấy render đúng.
- Publish → thấy badge "published".

---

## J. Task Group 8 — Frontend: public CMS renderer

### Section Registry (`packages/ui/src/cms-registry.ts` hoặc `components/cms-sections/registry.ts`)

```ts
import { HeroStyle1, HeroStyle2, HeroStyle3 } from './HeroSection';
// ... import tất cả

export const cmsSectionRegistry: Record<string, {
  label: string;
  styles: Record<string, React.ComponentType<SectionProps>>;
}> = {
  hero: {
    label: "Hero",
    styles: {
      style_1: HeroStyle1,
      style_2: HeroStyle2,
      style_3: HeroStyle3,
    },
  },
  rich_text: { ... },
  image_text: { ... },
  feature_grid: { ... },
  schedule: { ... },
  faq: { ... },
  cta: { ... },
  sponsor: { ... },
  note_alert: { ... },
  ticket_preview: { ... },
};
```

### SectionRenderer (`components/cms-sections/SectionRenderer.tsx`)
```
Nhận prop: sections[]
Loop theo sort_order:
  → lookup cmsSectionRegistry[section.component_type]
  → lookup .styles[section.style_variant]
  → nếu tìm thấy: render <Component contentJson={section.content_json} />
  → nếu không: render <UnsupportedSection />
```

### Public pages
- `/c/[categorySlug]` — gọi API `GET /api/public/cms/categories/:slug` → render danh sách page cards.
- `/c/[categorySlug]/[pageSlug]` — gọi API `GET /api/public/cms/pages/:categorySlug/:pageSlug` → render SectionRenderer.
- SEO: `<title>` từ `seo_title`, `<meta description>` từ `seo_description`.
- Mobile-first responsive.
- Error boundary bao SectionRenderer.

### Mỗi section component
- Nhận `contentJson` typed theo component type.
- Render HTML/JSX theo style.
- Ảnh dùng Next.js `<Image>` (hoặc `<img>` nếu domain không config).
- Rich text content render qua `dangerouslySetInnerHTML` **CHỈ với HTML đã sanitize phía BE**.
- Fallback: ảnh lỗi → placeholder, content rỗng → ẩn section hoặc hiện skeleton.

### Acceptance
- Mở `/c/:categorySlug/:pageSlug` → thấy đúng sections, đúng styles, đúng thứ tự.
- Section draft/hidden **không hiện** ở public.
- Category/page draft **không hiện** ở public.
- Mobile 360px hiển thị đẹp.
- `<script>` trong content không chạy.
- Component/style không tồn tại → fallback, không crash.

---

## K. Task Group 9 — Kết nối web tĩnh cũ

### Phương án
- Copy 4 file HTML + CSS + assets vào `static-legacy/`.
- Trong Next.js `next.config.ts`, thêm rewrite hoặc serve thư mục tĩnh:
  - Option A: Dùng `public/legacy/` folder của Next.js → copy static files vào `apps/web/public/legacy/`.
  - Option B: Thêm rewrite rules trong `next.config.ts` trỏ `/legacy/*` → static files.
  - Option C: Nginx reverse proxy `/legacy/*` → thư mục tĩnh, mọi thứ khác → Next.js.
- Thêm link "Tin tức" / "Sự kiện" vào nav trong 4 file HTML tĩnh (sửa TỐI THIỂU, chỉ thêm `<a>` tag vào nav).

### Acceptance
- Truy cập `/legacy/index.html` (hoặc route tương đương) → thấy trang tĩnh cũ.
- Trang tĩnh có link dẫn sang `/c/...` (CMS public).

---

## L. Task Group 10 — Test & QA

### BE tests (vitest + supertest)
- Auth: login success, login fail, unauthorized access.
- Category CRUD: create, read, update, soft delete, publish.
- Page CRUD + publish/unpublish.
- Section CRUD + reorder + duplicate + toggle visible.
- Public API: chỉ trả published data.
- Upload: valid file OK, invalid file rejected, oversized rejected.
- Sanitize: `<script>` bị strip trong content_json.

### FE tests
- Component test: SectionRenderer render đúng component/style.
- StylePicker chọn style đúng.
- Form edit fields.

### E2E (Playwright — nếu có thời gian)
- Login → tạo category → tạo page → builder: add 4 sections → save → publish → public page verify.

### Visual/UI QA checklist (kiểm tra thủ công)
- [ ] Mobile 360px, 390px
- [ ] Tablet 768px
- [ ] Desktop 1280px+
- [ ] Loading/empty/error states hiển thị đúng
- [ ] Title/description dài không vỡ layout
- [ ] Ảnh thiếu/ảnh lỗi có fallback
- [ ] Sticky CTA không che nội dung
- [ ] Spam click Save/Publish → UI lock, không duplicate data

---

## M. Quy tắc chung khi code

### PHẢI làm
1. **TypeScript strict** — không dùng `any` trừ khi thật sự cần.
2. **Validate input BE** bằng Zod ở mọi endpoint.
3. **Sanitize HTML** trước khi lưu DB (BE) — dùng `sanitize-html` với allowlist.
4. **Soft delete** — `is_deleted = true`, không DELETE cứng.
5. **Audit log** mọi mutation quan trọng.
6. **Error handling** — mọi route BE wrap `asyncHandler`, trả format thống nhất.
7. **Mobile-first** — design từ 360px lên.
8. **Lock UI action** — disable button khi request đang chạy.

### KHÔNG được làm
1. **KHÔNG cho admin nhập code/CSS tùy ý** — chỉ chọn component + style + content.
2. **KHÔNG sửa nội dung file HTML tĩnh cũ** trừ khi thêm link navigation.
3. **KHÔNG lưu secret/password/token** trong code, log, hoặc seed file commit.
4. **KHÔNG skip validation** — kể cả internal API calls.
5. **KHÔNG để FE gọi DB trực tiếp** — luôn qua BE API.
6. **KHÔNG dùng `dangerouslySetInnerHTML` với HTML chưa sanitize**.
7. **KHÔNG hard delete** data trong MVP.

### Convention
- File naming: `kebab-case.ts` cho modules, `PascalCase.tsx` cho React components.
- API response format: `{ success: boolean, data?: T, error?: { code: string, message: string } }`.
- Git branch (khi init git): `feature/cms-backend`, `feature/cms-frontend`, `feature/page-builder`.
- Commit message: `feat:`, `fix:`, `chore:`, `docs:` prefix.

---

> **Bắt đầu từ đâu?**
> 1. Task Group 1 (monorepo setup) — ai cũng phải làm trước.
> 2. Nếu 1 người: đi tuần tự 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10.
> 3. Nếu 2 người/agent: sau Task 1, chia BE (2→3→4→5) và FE (6→7→8) song song. FE dùng mock data / MSW cho đến khi BE API sẵn sàng.
