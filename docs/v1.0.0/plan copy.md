# Kế hoạch: Đối chiếu Konnit-client-demo ↔ codebase & sản xuất 3 tài liệu refactor

## Context

`Konnit-client-demo/` là bản thiết kế tham chiếu tĩnh (4 trang HTML + `styles.css` 32KB): `index.html` (home), `services.html`, `store.html`, `community.html`. Codebase hiện tại (`apps/web`) là một CMS page-builder Next.js với 10 section type / 26 style variant render qua registry.

Người dùng muốn: phân tích giao diện + màu của demo, đối chiếu codebase, đánh giá mức độ phù hợp và liệt kê những gì cần sửa, rồi tạo **3 tài liệu** trong `docs/v1.0.0/`:
- `review.md` — báo cáo đối chiếu thiết kế (audit + gap analysis)
- `refactor.md` — chiến lược refactor + cách tiếp cận maintainable
- `plan.md` — chia phase thực thi (file đã tồn tại, đang rỗng)

**Phạm vi đã chốt:** cả 4 trang demo · đổi font sang rounded playful · hướng tiếp cận do tôi đề xuất (maintainable nhất) · **giai đoạn này CHỈ tạo 3 docs, chưa đụng code.**

## Phát hiện chính (cơ sở cho 3 docs)

**1. Màu — ĐÃ KHỚP.** `apps/web/src/app/globals.css` đã import nguyên palette demo dưới tiền tố `--konnit-*`: berry `#8f2f67`, pink-01…05 (`#fff7fb`→`#f05fa7`), mint `#bff4df`/`#38a979`, sky `#cfeeff`/`#2f88b7`, sun `#ffe68a`/`#aa7a00`, ink `#342634`, muted `#6f6070`, radius 8px. Đã map sang token shadcn (`--primary`=berry, `--background`=pink-01) + dark mode + chart colors. → **Không cần refactor màu**, chỉ kiểm tra vài token phụ (`--line`, gradient panel).

**2. Font/weight — LỆCH (gap lớn nhất về cảm giác).** Demo dùng `ui-rounded, "Arial Rounded MT Bold"` + weight **900** xuyên suốt (heading, nav, button, pill) → cảm giác trẻ em bo tròn, đậm. Codebase dùng **Geist** (sans trung tính) + weight 600–700. → Đổi sang font rounded (vd Baloo 2 / Nunito / Quicksand qua `next/font`) + nâng weight heading/button lên 800–900.

**3. Section layout — CMS có "primitive" đúng nhưng style chưa khớp độ giàu của demo.** Đối chiếu (`registry.ts`, các `*Style*.tsx`):

| Demo (class) | Trang | CMS gần nhất | Khoảng cách |
|---|---|---|---|
| `.hero` (ảnh nền full-bleed + gradient overlay, canh trái) | tất cả | `hero` style_1 (blob, canh giữa) | layout khác hẳn → cần variant ảnh-nền-overlay |
| `.about-panel` (bullet + contact/QR card + trust pills) | home | `image_text` | thiếu QR/contact card + trust pill |
| `.service-grid` (icon tròn màu + gallery ảnh + pill tuổi + "Learn more") | home/services | `feature_grid` style_1 (chỉ icon+title+desc) | thiếu gallery, pill, link, icon màu theo nhóm |
| `.community-panel` (panel hồng + card đánh số 01/02/03 + gallery + CTA) | home/community | — | chưa có |
| `.product-card` (tag + gallery + age fit + safety note + view) | home/store | — | **schema field riêng** → nên là type mới |
| `.program-card` (split ảnh\|body + bullet) | services | `image_text` | cần variant split giàu hơn |
| `.flow-grid` (4 bước đánh số) | services | `feature_grid`/`schedule` | cần variant numbered-steps |
| `.kit-card` (facts `dl/dt/dd` + visual) | store | `feature_grid` | thiếu facts list |
| `.impact-grid` / `.experience-grid` | community | `feature_grid` | variant 3-col/5-col |
| `.store-cta-panel` / `.contact-panel` / `.mission-card` | store/services | `cta` | variant panel 2-cột |

**4. Kiến trúc — đủ tốt để mở rộng, không cần viết lại.** Registry pattern (`packages/ui/src/cms-registry.ts` + `apps/web/.../cms-sections/registry.ts`), `SectionProps`, model `contentJson.items[]`, field-editor động (`SectionEditor.tsx` `getFieldsForType`), fallback `UnsupportedSection` — tất cả đều extensible. Thêm variant/type mới ≈ thêm component + 1 dòng registry + (nếu cần) field mapping.

**5. Lưu ý thực thi:** `apps/web/AGENTS.md` cảnh báo đây là bản Next.js phi tiêu chuẩn — khi code phải đọc `node_modules/next/dist/docs/` trước. (Chỉ liên quan ở giai đoạn implement, không phải khi viết docs.)

## Hướng tiếp cận đề xuất (maintainable nhất) — đưa vào refactor.md

**"Extend, don't rewrite":**
- **Ưu tiên thêm STYLE VARIANT mới** cho type sẵn có khi layout demo map được vào primitive (hero, feature_grid, image_text, cta). Lý do: tận dụng registry + field-editor động, không cần đổi schema, không phá trang đã seed.
- **Giữ nguyên các `style_1` đang được seed dùng** (`apps/api/src/db/seed.ts`) — không sửa tại chỗ để tránh regression; thêm `style_4`, `style_5`… mới.
- **Chỉ thêm TYPE MỚI** cho `product` (Store) vì có bộ field riêng (tag, gallery, ageFit, safetyNote, price, viewLink) — tách type giúp editor sạch. Cân nhắc thêm `flow_steps` nếu numbered-step không gọn khi nhét vào feature_grid.
- **Tạo 1 component dùng chung** `Gallery`/`PhotoSlot` (placeholder ảnh nổi + animation `float-photo`) để các section tái sử dụng (DRY) thay vì lặp markup gallery.
- Bổ sung utility/animation còn thiếu vào `globals.css`: `float-photo` keyframe, pill `.trust-item`, contact/QR card (đối chiếu với `.rise-in`, `.hover-lift` đã có).

## Nội dung 3 tài liệu sẽ tạo trong `docs/v1.0.0/`

### `review.md` — Báo cáo đối chiếu thiết kế
1. Tổng quan demo (4 trang, design language: bo tròn, đậm, pastel pink/mint/sky/sun).
2. **Màu**: bảng đối chiếu token demo ↔ `--konnit-*` → kết luận ĐÃ KHỚP (kèm vài token cần xác nhận).
3. **Font/Typography**: lệch Geist ↔ rounded-900 → khuyến nghị đổi.
4. **Đối chiếu section theo trang** (dùng bảng ở mục 3 phần Phát hiện), mỗi mục: ảnh/đặc điểm demo → component CMS gần nhất → gap → mức độ phù hợp (Khớp / Cần variant / Chưa có / Cần type mới).
5. Đánh giá kiến trúc: điểm mạnh (registry, items model, fallback) + hạn chế (sponsor logo editor, chưa có image upload trong editor, chưa có rich-text).
6. Bảng tổng kết mức độ phù hợp tổng thể + danh sách "những gì cần chỉnh sửa".

### `refactor.md` — Chiến lược refactor
1. Nguyên tắc "Extend, don't rewrite" (mục Hướng tiếp cận ở trên).
2. Quy ước đặt tên variant mới + bảng map demo-class → (type, style_key) mới.
3. Danh sách type/variant/component cần thêm + field schema cho `product` (và `flow_steps` nếu chọn).
4. Thay đổi nền tảng: font (`layout.tsx` + `globals.css` token `--font-*`), weight scale, animation/util bổ sung, component `Gallery/PhotoSlot` dùng chung.
5. Cập nhật seed (`seed.ts`) để demo các section mới; cập nhật `SectionEditor` field mapping + `AddSectionDialog`.
6. Rủi ro & cách tránh regression (giữ style_1, fallback, kiểm thử trang đã seed).

### `plan.md` — Chia phase thực thi
- **Phase 0 — Nền tảng**: đổi font rounded (`apps/web/src/app/layout.tsx`, map `--font-sans/--font-heading` trong `globals.css`), nâng weight heading/button, bổ sung animation/util + token còn thiếu, tạo component `Gallery/PhotoSlot`. Không đổi logic section.
- **Phase 1 — Home (`index.html`)**: hero ảnh-nền-overlay (variant mới), about-panel (image_text variant + contact/QR/trust), service-grid (feature_grid variant giàu), community-panel, store preview (type `product`).
- **Phase 2 — Services (`services.html`)**: services-hero (board floating cards), program-grid (image_text split variant), flow-grid (numbered steps), mission-card / safety-panel / contact-panel (cta panel variants).
- **Phase 3 — Store (`store.html`)**: store-hero (kit scenes), category-filter chips, kit-grid (kit-card + facts), guide-grid, store-cta-panel.
- **Phase 4 — Community (`community.html`)**: community-hero board, impact-grid, experience-grid (5-col), event-gallery-panel, community-contact-panel.
- **Phase 5 — Hoàn thiện**: responsive breakpoints (đối chiếu media query demo: 1100/900/560px), seed dữ liệu trình diễn, đồng bộ editor (`SectionEditor`, `AddSectionDialog`), rà soát regression trang đã seed.
- Mỗi phase kèm: file đụng tới, tiêu chí "done", cách verify.

## Các file tham chiếu chính (cho khâu implement sau này)
- Tokens/font: `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`
- Registry: `apps/web/src/components/cms-sections/registry.ts`, `packages/ui/src/cms-registry.ts`
- Section components: `apps/web/src/components/cms-sections/<Type>Section/*Style*.tsx`
- Editor: `apps/web/src/components/cms/SectionEditor.tsx`, `AddSectionDialog.tsx`, `LivePreview.tsx`
- Render: `apps/web/src/components/cms-sections/SectionRenderer.tsx`, `apps/web/src/app/page.tsx`
- Seed/type: `apps/api/src/db/seed.ts`, `packages/types/src/cms-constants.ts`, `packages/types/src/cms.ts`
- Demo: `Konnit-client-demo/{index,services,store,community}.html` + `styles.css`

## Verification (giai đoạn này)
Vì giai đoạn này chỉ tạo tài liệu (không đụng code):
1. Xác nhận 3 file `docs/v1.0.0/{review,refactor,plan}.md` được tạo, nội dung khớp các mục trên.
2. Rà mọi class layout đặc thù trong 4 file HTML demo đều xuất hiện trong bảng đối chiếu của `review.md` (không sót section).
3. Mỗi mục "cần sửa" trong `review.md` đều có mục tương ứng trong `refactor.md` và được gán vào 1 phase trong `plan.md` (truy vết 1-1).
4. (Khi implement Phase sau) chạy app `apps/web`, mở builder + trang public, đối chiếu trực quan với HTML demo; đọc `node_modules/next/dist/docs/` trước khi code theo cảnh báo `AGENTS.md`.
