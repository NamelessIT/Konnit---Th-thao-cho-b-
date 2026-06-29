# Review — Đối chiếu thiết kế `Konnit-client-demo` ↔ Codebase

> Phiên bản: v1.0.0 · Phạm vi: 4 trang demo (home, services, store, community) đối chiếu với CMS page-builder `apps/web`.
> Tài liệu liên quan: [refactor.md](./refactor.md) (chiến lược) · [plan.md](./plan.md) (chia phase).

---

## 1. Tổng quan bản demo

`Konnit-client-demo/` là 4 trang HTML tĩnh dùng chung `styles.css` (1 file, ~1800 dòng):

| Trang | File | Vai trò |
|---|---|---|
| Home | `index.html` | Landing: hero, about, dịch vụ, cộng đồng, preview store |
| Our Business | `services.html` | Chi tiết 3 chương trình + quy trình buổi học + an toàn + liên hệ |
| Konnit Store | `store.html` | Catalog kit (preview, không giỏ hàng) + hướng dẫn chọn |
| Our Community | `community.html` | Sứ mệnh cộng đồng + hoạt động + gallery + trải nghiệm |

**Design language:** pastel (pink/mint/sky/sun), bo tròn, **đậm (weight 900)**, card mềm có shadow hồng (`rgba(143,47,103,*)`), nhiều “gallery ảnh nổi” placeholder có animation `float-photo`, pill bo tròn 999px, icon tròn màu theo nhóm hoạt động (bike/camp/science). Cảm giác **trẻ em – an toàn – thân thiện**.

---

## 2. Màu sắc — ✅ ĐÃ KHỚP (không cần refactor)

`apps/web/src/app/globals.css` đã import **nguyên** palette demo dưới tiền tố `--konnit-*` và map sang token shadcn.

| Token demo (`styles.css`) | Giá trị | Token codebase (`globals.css`) | Khớp |
|---|---|---|---|
| `--pink-01` | `#fff7fb` | `--konnit-pink-01` / `--background` | ✅ |
| `--pink-02` | `#ffe9f4` | `--konnit-pink-02` / `--secondary` | ✅ |
| `--pink-03` | `#ffd3e7` | `--konnit-pink-03` / `--accent` | ✅ |
| `--pink-05` | `#f05fa7` | `--konnit-pink-05` / `--ring` | ✅ |
| `--berry` | `#8f2f67` | `--konnit-berry` / `--primary` | ✅ |
| `--ink` | `#342634` | `--konnit-ink` / `--foreground` | ✅ |
| `--muted` | `#6f6070` | `--konnit-muted` / `--muted-foreground` | ✅ |
| `--mint` / `--mint-strong` | `#bff4df` / `#38a979` | `--konnit-mint*` | ✅ |
| `--sky` / `--sky-strong` | `#cfeeff` / `#2f88b7` | `--konnit-sky*` | ✅ |
| `--sun` / `--sun-strong` | `#ffe68a` / `#aa7a00` | `--konnit-sun*` | ✅ |
| `--radius` | `8px` | `--radius: 0.5rem` (8px) | ✅ |

**Cần xác nhận / bổ sung nhỏ:**
- `--line: rgba(143,47,103,0.14)` (đường viền) và `--shadow: 0 20px 60px rgba(143,47,103,0.13)` của demo — codebase có `--border` tương đương nhưng **chưa có token shadow chuẩn hồng**; nhiều card demo dùng `0 14px 40px rgba(143,47,103,0.08-0.15)`. → nên thêm 1-2 token shadow.
- Các **gradient panel** (vd `.about-panel`, `.mission-card`, `.store-cta-panel`: `linear-gradient(135deg, #fff, mint/pink ...)`) chưa có utility tương ứng — sẽ tạo khi build section.

> **Kết luận mục màu:** không cần refactor token màu; chỉ thêm token shadow + vài gradient utility khi dựng section.

---

## 3. Font & Typography — ⚠️ LỆCH (gap lớn nhất về “cảm giác”)

| Khía cạnh | Demo | Codebase | Đánh giá |
|---|---|---|---|
| Font family | `ui-rounded, "Arial Rounded MT Bold", system-ui` | **Geist** (`next/font/google`, `layout.tsx`) | ❌ Lệch — demo bo tròn, Geist geometric trung tính |
| Heading weight | **900** (`h1/h2/h3`) | 600–700 (`font-heading`=Geist, `letter-spacing -0.02em`) | ❌ Demo đậm hơn hẳn |
| Nav / button / pill | weight 800–900 | `font-medium`/`font-semibold` | ❌ |
| Heading scale | `clamp(42px,7vw,82px)` (h1), `clamp(31px,4.8vw,54px)` (h2) | có nhưng dùng tailwind text-3xl… | ⚠️ Cần đồng bộ scale |

→ **Khuyến nghị:** đổi sang font rounded playful qua `next/font` (gợi ý: **Baloo 2** / Nunito / Quicksand), map vào `--font-sans` + `--font-heading`, nâng weight heading/nav/button/pill lên **800–900**, đồng bộ heading scale theo `clamp()` của demo. Đây là thay đổi tác động lớn nhất tới độ giống demo.

---

## 4. Đối chiếu Section theo từng trang

Mức độ phù hợp: **✅ Khớp** · **🟡 Cần variant** (có primitive, thiếu độ giàu) · **🟠 Cần type mới** · **⬛ Shell/layout** (không phải CMS section).

### 4.1 Home (`index.html`)
| Section demo | CMS gần nhất | Khoảng cách | Mức độ |
|---|---|---|---|
| `site-header` (glass nav bo tròn, brand-mark tròn berry, pill nav, CTA) | layout shell | chưa style theo demo | ⬛ |
| `hero` (ảnh nền full-bleed + gradient overlay 2 lớp, text canh trái, 2 button) | `hero` style_1 (blob, canh giữa) | layout khác hẳn | 🟡 |
| `about-panel` (eyebrow + h2 + bullet points + contact/QR card + trust pills ✓♡★) | `image_text` | thiếu QR card + trust pills | 🟠 (→ `contact_panel`) |
| `service-grid` (3 card: icon tròn màu bike/camp/science + gallery ảnh + h3 + p + pill tuổi + “Learn more”) | `feature_grid` style_1 (chỉ icon+title+desc) | thiếu gallery, pill tuổi, link, icon màu | 🟡 |
| `community-panel` (panel nền hồng: heading + gallery + CTA \| 3 card đánh số 01/02/03) | — | chưa có panel + numbered | 🟡/🟠 |
| `store-grid` (4 product-card: tag + gallery + h3 + p + product-meta age/safety + “View item”) | — | schema field riêng | 🟠 (→ `product`) |
| `site-footer` (brand + tagline) | layout shell | chưa style | ⬛ |

### 4.2 Services (`services.html`)
| Section demo | CMS gần nhất | Khoảng cách | Mức độ |
|---|---|---|---|
| `services-hero` (copy + board chứa 3 `rhythm-card` nổi: icon + Movement/Nature/Discovery) | `hero` | layout split + floating cards | 🟡 |
| `program-grid` (3 `program-card`: split gallery \| body, label pill, h3, p, `detail-list` dl/dt/dd 4 dòng) | `image_text` | thiếu split + detail-list | 🟡 |
| `flow-grid` (4 `flow-card` đánh số 01–04: số tròn berry + h3 + p) | `feature_grid`/`schedule` | thiếu numbered step | 🟠 (→ `flow_steps`) |
| `safety-panel` (heading + `promise-grid` 2 cột các chip) | `cta`/`feature_grid` | panel + chip list | 🟡 |
| `contact-panel` (contact-card QR \| copy + 2 button) | — | giống about aside | 🟠 (→ `contact_panel`) |

### 4.3 Store (`store.html`)
| Section demo | CMS gần nhất | Khoảng cách | Mức độ |
|---|---|---|---|
| `store-hero` (copy + visual chứa 3 `kit-scene` nổi) | `hero` | giống services-hero | 🟡 (dùng chung variant split-board) |
| `category-filter` (nav chip Safety/Bike/Camp/Science/For Home) | — | anchor-nav chip | 🟡 (phụ trợ) |
| `kit-grid` (5 `kit-card`: tag + `kit-visual` + h3 + p + `kit-facts` dl 3 dòng + button “Ask about this kit”) | — | giống product nhưng có facts + CTA | 🟠 (→ `product` style_2) |
| `guide-grid` (4 `guide-card` đánh số 01–04) | `feature_grid` | numbered | 🟠 (→ `flow_steps`) |
| `store-cta-panel` (heading \| actions) | `cta` style_1 | panel 2 cột | 🟡 |

### 4.4 Community (`community.html`)
| Section demo | CMS gần nhất | Khoảng cách | Mức độ |
|---|---|---|---|
| `community-hero` (copy + board 3 `rhythm-card` đánh số) | `hero` | dùng chung variant split-board | 🟡 |
| `mission-card` (heading \| `mission-note` panel) | `cta`/`image_text` | panel 2 cột | 🟡 |
| `impact-grid` (3 `impact-card` đánh số + h3 + p) | `feature_grid` | numbered | 🟠 (→ `flow_steps`) |
| `event-gallery-panel` (heading \| gallery ảnh nổi lớn) | `image_text` | gallery panel | 🟡 |
| `experience-grid` (5 `flow-card` đánh số 01–05) | `feature_grid` | numbered 5 cột | 🟠 (→ `flow_steps`) |
| `community-contact-panel` (contact-card QR \| copy) | — | dùng chung `contact_panel` | 🟠 |

---

## 5. Mẫu lặp lại (cơ hội tái sử dụng — DRY)

Các pattern xuất hiện nhiều lần → nên tách thành **component / type dùng chung** thay vì dựng lại từng nơi:

1. **Gallery ảnh nổi** (`.activity-gallery`, `.product-gallery`, `.community-gallery`, `.kit-visual`, `.store-hero-visual` + `.photo-slot`/`.kit-object` + animation `float-photo`) → component `Gallery`/`PhotoSlot`. Dùng ở: service card, product/kit card, program card, event gallery, hero board.
2. **Card đánh số** (`.flow-card`, `.community-card`, `.guide-card`, `.impact-card`) → type `flow_steps`. Dùng ở: services flow, community experience/impact, store guide, home community.
3. **Contact/QR card** (`.contact-card` + `.qr-placeholder` + `.contact-link`) → type/component `contact_panel`. Dùng ở: home about, services contact, community contact.
4. **Facts list** (`.detail-list`, `.kit-facts` — `dl/dt/dd`) → component `FactsList`. Dùng ở: program card, kit card.
5. **Pill / label** (`.eyebrow`, `.program-label`, `.product-tag`, `.trust-item`, `.service-teaser-meta`) → util/class chung.
6. **Hero board nổi** (`.rhythm-card`, `.kit-scene` trong services/store/community hero) → variant hero split-board dùng `Gallery`-style cards.

---

## 6. Đánh giá kiến trúc CMS

**Điểm mạnh (tận dụng được):**
- Registry pattern rõ ràng (`packages/ui/src/cms-registry.ts` + `apps/web/src/components/cms-sections/registry.ts`): thêm variant/type = thêm component + 1 dòng đăng ký.
- Model `contentJson.items[]` linh hoạt cho mọi card/grid.
- Field-editor động (`SectionEditor.tsx` `getFieldsForType`) + `AddSectionDialog` (type → style).
- `SectionRenderer` có fallback `UnsupportedSection` → an toàn khi thêm dần.

**Hạn chế (ghi nhận, xử lý sau):**
- `sponsor` mới có `title/description`, **chưa có editor cho mảng logo**.
- **Chưa có upload ảnh trong section editor** — phải dán URL từ Media library thủ công (ảnh hưởng gallery của các section mới).
- **Chưa có rich-text editor** — `content` là HTML thô.
- `AddSectionDialog` chưa có ảnh preview cho style variant.

---

## 7. Tổng kết mức độ phù hợp & việc cần làm

**Tổng quan:** Nền tảng (màu, kiến trúc) **đã sẵn sàng ~70%**. Khoảng cách nằm ở **font/weight** và **độ giàu của section** (gallery, pill, numbered, facts, contact card, product).

**Danh sách “cần chỉnh sửa” (sẽ được gán phase trong [plan.md](./plan.md)):**
1. **Font**: đổi Geist → rounded playful + nâng weight 800–900 + đồng bộ heading scale.
2. **Token phụ**: thêm shadow hồng + vài gradient panel utility + animation `float-photo`, pill, contact card.
3. **Component dùng chung**: `Gallery`/`PhotoSlot`, `FactsList`, `ContactCard`, pill util.
4. **Type mới**: `product` (store/home), `flow_steps` (numbered), `contact_panel` (QR + copy + CTA).
5. **Style variant mới**: `hero` (image-overlay, split-board), `feature_grid` (rich service card, panel), `image_text` (program-split, gallery-panel), `cta` (panel 2 cột).
6. **Shell**: style `site-header` (glass nav, brand-mark) + `site-footer` theo demo.
7. **Seed + editor**: cập nhật `seed.ts` trình diễn section mới, field mapping `SectionEditor`, `AddSectionDialog`.
8. **Responsive**: đối chiếu breakpoint demo 1100 / 900 / 560px.

→ Chi tiết cách làm: [refactor.md](./refactor.md). Lộ trình theo phase: [plan.md](./plan.md).
