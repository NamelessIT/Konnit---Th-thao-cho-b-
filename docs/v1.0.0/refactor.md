# Refactor Strategy — Đưa thiết kế `Konnit-client-demo` vào CMS

> Phiên bản: v1.0.0 · Dựa trên [review.md](./review.md) · Lộ trình thực thi: [plan.md](./plan.md).

---

## 1. Nguyên tắc: “Extend, don’t rewrite”

Kiến trúc CMS hiện tại (registry + `contentJson.items[]` + field-editor động + fallback) đủ tốt để **mở rộng**. Vì vậy:

1. **Ưu tiên thêm STYLE VARIANT mới** cho type sẵn có khi layout demo map được vào primitive (`hero`, `feature_grid`, `image_text`, `cta`). Tận dụng registry + editor, không đổi schema.
2. **KHÔNG sửa tại chỗ các `style_1`** đang được seed dùng (`apps/api/src/db/seed.ts` — home page dùng hero/style_1, image_text/style_1, feature_grid/style_1 ×2, cta/style_1). Thêm `style_4`, `style_5`… để **tránh regression** trang đã publish.
3. **Chỉ thêm TYPE MỚI** khi schema field thực sự khác (product, contact_panel) hoặc khi tái sử dụng cao (flow_steps).
4. **Tách component dùng chung** cho pattern lặp (Gallery, FactsList, ContactCard, pill) — viết 1 lần, dùng nhiều section (DRY).
5. **Foundation trước, section sau**: font + token + animation + component dùng chung làm nền (Phase 0), rồi mới ráp section.

> ⚠️ **Trước khi code:** `apps/web/AGENTS.md` cảnh báo đây là bản Next.js phi tiêu chuẩn — đọc `node_modules/next/dist/docs/` trước khi viết code (đặc biệt khâu `next/font` ở Phase 0).

---

## 2. Quy ước & bảng map demo → (type, style)

Quy ước: variant mới đánh số tiếp theo trên type sẵn có (`style_4`, `style_5`…). Type mới đặt `snake_case`, đăng ký trong cả `packages/types/src/cms-constants.ts` (label + variants) và `apps/web/src/components/cms-sections/registry.ts` (component + fields).

| Demo (class) | Trang | Giải pháp | (type, style) |
|---|---|---|---|
| `hero` ảnh nền + overlay | home | variant | `hero` / `style_4` (image-overlay) |
| `services-hero` / `store-hero` / `community-hero` (copy + board nổi) | 3 trang | variant | `hero` / `style_5` (split-board) |
| `about-panel` aside + `contact-panel` + `community-contact-panel` | home/services/community | **type mới** | `contact_panel` / `style_1` |
| `service-grid` (card + gallery + pill + link) | home/services | variant | `feature_grid` / `style_4` (rich-card) |
| `community-panel` (panel hồng + numbered + gallery + CTA) | home/community | variant | `feature_grid` / `style_5` (numbered-panel) |
| `store-grid` product-card · `kit-grid` kit-card | home/store | **type mới** | `product` / `style_1` (grid compact), `style_2` (kit + facts + CTA) |
| `program-grid` program-card (split + detail-list) | services | variant | `image_text` / `style_4` (program-split) |
| `event-gallery-panel` (heading \| gallery) | community | variant | `image_text` / `style_5` (gallery-panel) |
| `flow-grid` · `experience-grid` · `guide-grid` · `impact-grid` (numbered) | services/community/store | **type mới** | `flow_steps` / `style_1` (3col), `style_2` (4col), `style_3` (5col) |
| `safety-panel` (heading + chip list) | services | variant | `cta` / `style_4` (panel + chips) |
| `mission-card` · `store-cta-panel` (heading \| actions/note) | community/store | variant | `cta` / `style_5` (panel 2 cột) |
| `category-filter` (anchor chips) | store | phụ trợ | gộp vào `product` catalog hoặc mini `nav_chips` (ưu tiên thấp) |
| `site-header` / `site-footer` | global | **shell** | layout (`layout.tsx`), không phải CMS section |

**Tổng kết:** +3 type mới (`product`, `flow_steps`, `contact_panel`) · +7 style variant · +shell styling.

---

## 3. Type mới — schema field

Thêm vào `packages/types/src/cms-constants.ts` (variants) và field mapping `SectionEditor.tsx`.

### 3.1 `product` (Store + Home store preview)
```
items: [{
  tag?: string          // "Safety" | "Bike" | "Camp" | "Science" | "For Home"
  title: string
  description?: string
  gallery?: string[]     // ảnh; rỗng → PhotoSlot placeholder
  ageFit?: string        // "2.5-6 years"
  safetyNote?: string
  included?: string      // style_2 (kit-facts)
  price?: string         // optional, demo chưa có giá
  ctaLabel?: string      // "Ask about this kit" / "View item"
  ctaUrl?: string
}]
```
- `style_1`: grid 4 cột compact (home `product-card`: tag + gallery + meta age/safety + link).
- `style_2`: grid 2 cột (store `kit-card`: tag + visual + `FactsList` + button primary).

### 3.2 `flow_steps` (numbered cards — tái sử dụng cao)
```
items: [{ step?: string; title: string; description?: string }]
// step rỗng → tự đánh số 01,02,03…
```
- `style_1` 3 cột (impact), `style_2` 4 cột (flow/guide), `style_3` 5 cột (experience). Số trong vòng tròn berry.

### 3.3 `contact_panel` (QR + copy + CTA)
```
contentJson: {
  label?: string         // "Parent Contact"
  title?: string         // "Join a first session"
  phone?: string         // "+84 90 123 4567"
  qrImage?: string       // rỗng → QR placeholder
  description?: string
  primaryCta?: {label,url}
  secondaryCta?: {label,url}
  bullets?: string[]      // about-panel: about-points
  trust?: {icon,label}[]  // about-panel: trust-strip pills
}
```
- `style_1`: contact card (QR) + copy + 2 CTA (services/community).
- `style_2`: about-panel (bullets + contact card + trust pills).

---

## 4. Thay đổi nền tảng (Phase 0)

### 4.1 Font
- `apps/web/src/app/layout.tsx`: thay `Geist`/`Geist_Mono` bằng font rounded qua `next/font/google` (Baloo 2 / Nunito / Quicksand), giữ `Geist_Mono` cho `--font-mono`.
- `globals.css`: map `--font-sans` + `--font-heading` → font mới; nâng weight heading (`h1..h4`) lên 800–900; đồng bộ heading scale theo `clamp()` demo (`h1: clamp(42px,7vw,82px)`, `h2: clamp(31px,4.8vw,54px)`).
- Button/Badge/nav/pill: nâng `font-weight` lên 800–900 (đối chiếu `button.tsx`, `badge.tsx`).

### 4.2 Token & utility (`globals.css`)
- Thêm token shadow hồng: `--shadow-card: 0 14px 40px rgba(143,47,103,0.09)`, `--shadow-float: 0 18px 44px rgba(143,47,103,0.14)`.
- Thêm gradient panel utility (vd `.panel-pink`, `.panel-mint`) tương ứng `linear-gradient(135deg, #fff, mint/pink)` ở `.about-panel`/`.mission-card`/`.store-cta-panel`.
- Thêm keyframe `float-photo` + class pill (`.pill`), contact card, brand-mark (vòng tròn berry chữ “k”). Tận dụng `.rise-in`, `.hover-lift` đã có.

### 4.3 Component dùng chung (`apps/web/src/components/cms-sections/_shared/`)
- `Gallery` + `PhotoSlot` — placeholder ảnh nổi (large + 2 small) + `float-photo`; nhận `images?: string[]`, fallback label placeholder.
- `FactsList` — render `dl/dt/dd` từ `{label,value}[]`.
- `ContactCard` — QR/ảnh + label + title + phone link.
- `Pill` / `Eyebrow` — nhãn bo tròn.

---

## 5. Đồng bộ editor & seed

- `packages/types/src/cms-constants.ts`: thêm label + variants cho 3 type mới và các style mới của type cũ.
- `apps/web/src/components/cms-sections/registry.ts`: import + đăng ký component mới; cập nhật mảng `fields` cho type mới.
- `apps/web/src/components/cms/SectionEditor.tsx`: thêm `getFieldsForType` cho `product`/`flow_steps`/`contact_panel`; mở rộng `ItemsEditor` cho field mới (tag, ageFit, safetyNote, step, gallery…).
- `apps/web/src/components/cms/AddSectionDialog.tsx`: tự nhận type/style mới qua API `templates` (cần seed template/style tương ứng ở DB).
- `apps/api/src/db/seed.ts`: thêm template + style records cho type/variant mới; thêm trang demo (services/store/community) dùng section mới để trình diễn.

---

## 6. Rủi ro & cách tránh regression

| Rủi ro | Phòng ngừa |
|---|---|
| Đổi font phá layout hiện có | Phase 0 tách riêng, kiểm tra trang `/` đã seed trước khi đi tiếp |
| Sửa `style_1` làm hỏng trang đã publish | **Không sửa** style_1; chỉ thêm variant mới |
| Section/style mới chưa có trong DB → `UnsupportedSection` | Seed template+style trước; fallback đã an toàn |
| Gallery cần ảnh nhưng editor chưa upload | `PhotoSlot` fallback placeholder; ảnh thật bổ sung sau (hạn chế đã ghi ở review §6) |
| Type mới lệch giữa `cms-constants` ↔ registry ↔ seed | Checklist đồng bộ 3 nơi mỗi khi thêm type (mục §5) |

---

## 7. Định nghĩa “Done” cho refactor
- 4 trang demo tái hiện được bằng section CMS (qua builder), khớp trực quan với HTML demo.
- Không section nào rơi vào `UnsupportedSection`.
- Trang `/` (đã seed) không regression sau đổi font/token.
- 3 type + 7 variant + component dùng chung được đăng ký đầy đủ ở cả `cms-constants`, `registry`, `seed`.
