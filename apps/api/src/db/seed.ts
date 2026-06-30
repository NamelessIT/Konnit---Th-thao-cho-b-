/**
 * Seed data for development.
 * Creates admin user + CMS component templates/styles.
 * Usage: pnpm --filter @konnit/api db:seed
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import type { PoolClient } from 'pg';
import { pool } from '../config/db';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { CMS_COMPONENT_TYPES, CMS_STYLE_VARIANTS } from '@konnit/types';

const ACCESS_PERMISSIONS = [
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
  ['tickets.checkin', 'tickets', 'checkin', 'Check-in vé'],
  ['profile.read', 'profile', 'read', 'Xem hồ sơ cá nhân'],
  ['profile.write', 'profile', 'write', 'Cập nhật hồ sơ cá nhân'],
] as const;

const ACCESS_ROLES = [
  ['super_admin', 'Super Admin', 'admin', 'Chủ hệ thống — cao nhất, duy nhất 1'],
  ['admin', 'Admin', 'admin', 'Quản trị viên — đủ quyền nhưng dưới super admin'],
  ['editor', 'Editor', 'admin', 'Quản lý nội dung và bán vé'],
  ['viewer', 'Viewer', 'admin', 'Chỉ xem dữ liệu vận hành'],
  ['checkin_staff', 'Check-in Staff', 'admin', 'Nhân viên check-in tại sự kiện'],
  ['customer', 'Customer', 'public', 'Người mua vé công khai'],
] as const;

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ACCESS_PERMISSIONS.map(([key]) => key),
  // admin: đủ mọi quyền như super_admin (khác biệt nằm ở RANK + các hành động super-admin-only như huỷ đơn).
  admin: ACCESS_PERMISSIONS.map(([key]) => key),
  editor: [
    'cms.read', 'cms.write', 'cms.publish',
    'events.read', 'events.write', 'events.publish',
    'ticket_types.read', 'ticket_types.write',
    'vouchers.read', 'vouchers.write',
    'orders.read_all', 'orders.export',
  ],
  viewer: [
    'cms.read', 'events.read', 'ticket_types.read',
    'vouchers.read', 'orders.read_all',
  ],
  checkin_staff: ['events.read', 'orders.read_all', 'tickets.checkin'],
  customer: ['profile.read', 'profile.write', 'orders.read_own'],
};

async function seedAccessControl(client: PoolClient) {
  for (const [key, resource, action, description] of ACCESS_PERMISSIONS) {
    await client.query(
      `INSERT INTO permissions (key, resource, action, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE
       SET resource = EXCLUDED.resource,
           action = EXCLUDED.action,
           description = EXCLUDED.description`,
      [key, resource, action, description],
    );
  }

  for (const [key, name, realm, description] of ACCESS_ROLES) {
    await client.query(
      `INSERT INTO roles (key, name, realm, description, is_system)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (key) DO UPDATE
       SET name = EXCLUDED.name,
           realm = EXCLUDED.realm,
           description = EXCLUDED.description,
           is_system = true`,
      [key, name, realm, description],
    );
  }

  for (const [roleKey, permissionKeys] of Object.entries(ROLE_PERMISSIONS)) {
    await client.query(
      `DELETE FROM role_permissions
       WHERE role_id = (SELECT id FROM roles WHERE key = $1)`,
      [roleKey],
    );
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r
       CROSS JOIN permissions p
       WHERE r.key = $1 AND p.key = ANY($2::text[])
       ON CONFLICT DO NOTHING`,
      [roleKey, permissionKeys],
    );
  }

  // Backfill role mặc định CHỈ cho tài khoản chưa có role nào (tránh re-seed ghi đè
  // các admin tạo qua UI — vốn cũng có cột legacy role='admin').
  await client.query(`
    INSERT INTO admin_user_roles (admin_user_id, role_id)
    SELECT au.id, r.id
    FROM admin_users au
    JOIN roles r ON r.key = CASE au.role
      WHEN 'admin' THEN 'super_admin'
      WHEN 'editor' THEN 'editor'
      WHEN 'viewer' THEN 'viewer'
      WHEN 'staff' THEN 'checkin_staff'
    END
    WHERE au.is_deleted = false
      AND NOT EXISTS (
        SELECT 1 FROM admin_user_roles x WHERE x.admin_user_id = au.id
      )
    ON CONFLICT DO NOTHING
  `);

  await client.query(`
    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id
    FROM users u
    CROSS JOIN roles r
    WHERE r.key = 'customer' AND u.is_deleted = false
    ON CONFLICT DO NOTHING
  `);
}

export async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed admin user
    const hash = await bcrypt.hash(env.ADMIN_SEED_PASSWORD, 12);
    await client.query(
      `INSERT INTO admin_users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [env.ADMIN_SEED_EMAIL, hash, env.ADMIN_SEED_NAME],
    );
    logger.info(`Admin user seeded: ${env.ADMIN_SEED_EMAIL}`);

    // 2. Seed component templates + styles
    for (const tmpl of CMS_COMPONENT_TYPES) {
      const result = await client.query(
        `INSERT INTO cms_component_templates (type_key, name, allowed_fields_json)
         VALUES ($1, $2, $3)
         ON CONFLICT (type_key) DO UPDATE SET name = $2, allowed_fields_json = $3
         RETURNING id`,
        [tmpl.typeKey, tmpl.label, JSON.stringify(tmpl.fields)],
      );
      const templateId = result.rows[0].id;

      const styles = CMS_STYLE_VARIANTS[tmpl.typeKey] || [];
      for (const style of styles) {
        await client.query(
          `INSERT INTO cms_component_styles (template_id, style_key, name)
           VALUES ($1, $2, $3)
           ON CONFLICT (template_id, style_key) DO UPDATE SET name = $3`,
          [templateId, style.styleKey, style.name],
        );
      }
    }
    logger.info('Component templates and styles seeded.');

    // 3. Seed home page CMS content from static legacy
    const adminUserRes = await client.query(
      `SELECT id FROM admin_users WHERE email = $1 LIMIT 1`,
      [env.ADMIN_SEED_EMAIL],
    );
    const adminId = adminUserRes.rows[0]?.id ?? null;

    await seedAccessControl(client);
    logger.info('Roles and permissions seeded.');

    const catRes = await client.query(
      `INSERT INTO cms_categories (name, slug, description, status, published_at, created_by, updated_by)
       VALUES ('Trang chủ', 'landing', 'Nội dung trang chủ Konnit', 'published', now(), $1, $1)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [adminId],
    );
    const categoryId = catRes.rows[0].id;

    const pageRes = await client.query(
      `INSERT INTO cms_pages (category_id, title, slug, description, status, published_at, created_by, updated_by)
       VALUES ($1, 'Konnit – Safe Learning Through Play', 'home',
               'Nền tảng thể thao và hoạt động dành cho trẻ em Việt Nam',
               'published', now(), $2, $2)
       ON CONFLICT (category_id, slug) DO UPDATE SET title = EXCLUDED.title
       RETURNING id`,
      [categoryId, adminId],
    );
    const pageId = pageRes.rows[0].id;

    const lead2 = 'konnit tạo ra những buổi chơi có định hướng cho trẻ dưới 7 tuổi, nơi con được thử vận động, giao tiếp và khám phá trong nhịp độ nhẹ nhàng.';
    const homeSections = [
      {
        component_type: 'hero',
        style_variant: 'style_4',
        title: 'Safe little adventures for bright early learners.',
        description: 'konnit đồng hành cùng trẻ dưới 7 tuổi và ba mẹ qua những trải nghiệm học mà chơi: đua xe thăng bằng, cắm trại mini và khám phá khoa học an toàn.',
        sort_order: 1,
        content_json: {
          title: 'Safe little adventures for bright early learners.',
          description: 'konnit đồng hành cùng trẻ dưới 7 tuổi và ba mẹ qua những trải nghiệm học mà chơi: đua xe thăng bằng, cắm trại mini và khám phá khoa học an toàn.',
          primaryCta: { label: 'Khám phá hoạt động', url: '/cua-hang' },
          secondaryCta: { label: 'An toàn là ưu tiên', url: '#about' },
        },
      },
      {
        component_type: 'contact_panel',
        style_variant: 'style_2',
        title: 'A gentle place for kids to grow bravely.',
        description: lead2,
        sort_order: 2,
        content_json: {
          eyebrow: 'About Us',
          title: 'A gentle place for kids to grow bravely.',
          description: lead2,
          bullets: [
            'Thiết bị được chuẩn bị đúng cỡ trước mỗi hoạt động.',
            'Ba mẹ quan sát con với gợi ý rõ ràng từ người hướng dẫn.',
            'Mỗi bé được chọn thử thách phù hợp với mức tự tin hiện tại.',
          ],
          label: 'First session',
          contactTitle: 'Talk with konnit',
          phone: '+84 90 123 4567',
          trust: [
            { icon: '✓', label: 'Safety first' },
            { icon: '♡', label: 'Polite play' },
            { icon: '★', label: 'Friendly fun' },
          ],
        },
      },
      {
        component_type: 'feature_grid',
        style_variant: 'style_4',
        title: 'Learning services shaped around movement, nature, and discovery.',
        description: 'Ba nhóm hoạt động chính giúp trẻ phát triển thể chất, cảm xúc xã hội và tư duy khám phá trong một lộ trình nhẹ nhàng.',
        sort_order: 3,
        content_json: {
          eyebrow: 'Our Business',
          title: 'Learning services shaped around movement, nature, and discovery.',
          items: [
            { icon: '↗', tint: 'bike', title: 'Push-Bike Racing', description: 'Đường chạy nhỏ, trò chơi giữ thăng bằng và khoảnh khắc về đích để con tự tin hơn với vận động.', meta: '2.5–6 tuổi', linkLabel: 'Learn more', linkUrl: '#', photos: ['Push-bike track', 'Helmet check', 'Finish moment'] },
            { icon: '⌂', tint: 'camp', title: 'Mini Camping', description: 'Dựng lều, quan sát thiên nhiên, làm việc nhóm và học các thói quen ngoài trời thật đơn giản.', meta: '3–6 tuổi', linkLabel: 'Learn more', linkUrl: '#', photos: ['Tent setup', 'Nature walk', 'Team game'] },
            { icon: '◌', tint: 'science', title: 'Playful Science', description: 'Bong bóng, màu sắc, nam châm, hạt giống và những câu hỏi nhỏ để con khám phá bằng tay.', meta: '4–6 tuổi', linkLabel: 'Learn more', linkUrl: '#', photos: ['Color lab', 'Bubble test', 'Seed watch'] },
          ],
        },
      },
      {
        component_type: 'feature_grid',
        style_variant: 'style_5',
        title: 'Community days made for childhood joy.',
        description: 'Cộng đồng konnit cùng các thương hiệu địa phương tạo nên những ngày vui an toàn cho trẻ: khu chơi nhỏ, hoạt động sáng tạo, quà tặng và mẫu sản phẩm thân thiện với trẻ em.',
        sort_order: 4,
        content_json: {
          eyebrow: 'Our Community',
          title: 'Community days made for childhood joy.',
          description: 'Cộng đồng konnit cùng các thương hiệu địa phương tạo nên những ngày vui an toàn cho trẻ: khu chơi nhỏ, hoạt động sáng tạo, quà tặng và mẫu sản phẩm thân thiện với trẻ em.',
          primaryCta: { label: 'See Community Activities', url: '/tin-tuc' },
          photos: ['Family circle', 'First friend', 'Weekend event'],
          items: [
            { icon: '01', title: "Children's Day moments", description: 'Những ngày hội nhỏ có trạm chơi, góc nhận quà và không gian để con gặp bạn mới thật tự nhiên.' },
            { icon: '02', title: 'Local brand support', description: 'Mỗi sự kiện có 5–7 đối tác địa phương cùng chuẩn bị địa điểm, hoạt động và sản phẩm phù hợp cho trẻ.' },
            { icon: '03', title: 'Kind connection', description: 'Gia đình gặp nhau qua những trải nghiệm tử tế, nhẹ nhàng và không đặt nặng mua bán.' },
          ],
        },
      },
      {
        component_type: 'product',
        style_variant: 'style_1',
        title: 'Thoughtful gear for safe learning and play.',
        description: 'Khu cửa hàng giới thiệu các món đồ hỗ trợ hoạt động tại konnit và ở nhà. Đây là phần xem trước sản phẩm.',
        sort_order: 5,
        content_json: {
          eyebrow: 'Konnit Store',
          title: 'Thoughtful gear for safe learning and play.',
          description: 'Khu cửa hàng giới thiệu các món đồ hỗ trợ hoạt động tại konnit và ở nhà. Đây là phần xem trước sản phẩm.',
          primaryCta: { label: 'Open Konnit Store', url: '/cua-hang' },
          items: [
            { tag: 'Safety', tint: 'pink', title: 'Helmet & Safety Kit', description: 'Mũ bảo hộ, miếng dán tên và checklist an toàn trước giờ chơi.', ageFit: '2.5–6', safetyNote: 'fit check required', linkLabel: 'View item', linkUrl: '#', photos: ['Main product', 'Fit detail', 'Kit set'] },
            { tag: 'Bike', tint: 'sun', title: 'Balance-Bike Accessories', description: 'Chuông nhỏ, bảng tên và cọc đánh dấu đường chạy nhẹ nhàng.', ageFit: '3–6', safetyNote: 'soft edges only', linkLabel: 'View item', linkUrl: '#', photos: ['Main product', 'Name plate', 'Track cones'] },
            { tag: 'Camp', tint: 'mint', title: 'Camping Starter Kit', description: 'Tấm ngồi, đèn giả lập an toàn và thẻ nhiệm vụ khám phá thiên nhiên.', ageFit: '3–6', safetyNote: 'adult setup first', linkLabel: 'View item', linkUrl: '#', photos: ['Main product', 'Task cards', 'Safe light'] },
            { tag: 'Science', tint: 'sky', title: 'Science Play Kit', description: 'Ống quan sát, thẻ câu hỏi và vật liệu thí nghiệm đơn giản cho trẻ nhỏ.', ageFit: '4–6', safetyNote: 'guided play only', linkLabel: 'View item', linkUrl: '#', photos: ['Main product', 'Tools', 'Question cards'] },
          ],
        },
      },
    ];

    // Refresh the seed-managed home page sections so re-running db:seed renders the
    // current demo design. (Home is seed-managed; other pages are untouched.)
    await client.query(`DELETE FROM cms_sections WHERE page_id = $1`, [pageId]);
    for (const s of homeSections) {
      await client.query(
        `INSERT INTO cms_sections
           (page_id, component_type, style_variant, title, description, content_json, sort_order, status, created_by, updated_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'published',$8,$8)`,
        [pageId, s.component_type, s.style_variant, s.title, s.description,
         JSON.stringify(s.content_json), s.sort_order, adminId],
      );
    }
    logger.info('Home page CMS sections seeded.');

    // 3b. Seed Services / Store / Community landing pages (demo parity)
    const landingPages: {
      slug: string;
      title: string;
      description: string;
      sections: {
        component_type: string;
        style_variant: string;
        title: string;
        content_json: Record<string, unknown>;
      }[];
    }[] = [
      {
        slug: 'services',
        title: 'Our Business — Konnit',
        description: 'Konnit learning services — movement, nature, and playful science.',
        sections: [
          {
            component_type: 'hero',
            style_variant: 'style_5',
            title: 'Learning services shaped around movement, nature, and discovery.',
            content_json: {
              eyebrow: 'Our Business',
              title: 'Learning services shaped around movement, nature, and discovery.',
              description: 'Ba nhóm hoạt động chính giúp trẻ phát triển thể chất, cảm xúc xã hội và tư duy khám phá trong một lộ trình nhẹ nhàng, luôn có người hướng dẫn và ba mẹ đồng hành.',
              primaryCta: { label: 'Join a First Session', url: '#contact' },
              secondaryCta: { label: 'Contact konnit', url: '#contact' },
              items: [
                { icon: '↗', tint: 'bike', title: 'Movement', subtitle: 'Balance, focus, and courage' },
                { icon: '⌂', tint: 'camp', title: 'Nature', subtitle: 'Outdoor routines and teamwork' },
                { icon: '◌', tint: 'science', title: 'Discovery', subtitle: 'Questions, materials, and wonder' },
              ],
            },
          },
          {
            component_type: 'image_text',
            style_variant: 'style_4',
            title: 'Three ways for children to learn by doing.',
            content_json: {
              eyebrow: 'Program Overview',
              title: 'Three ways for children to learn by doing.',
              description: 'Mỗi chương trình có nhịp chơi riêng, nhưng cùng chung nguyên tắc: an toàn trước, lời nói tử tế và niềm vui phù hợp với từng bé.',
              items: [
                { label: 'Movement', tint: 'pink', title: 'Push-Bike Racing', description: 'Đường chạy nhỏ, trò chơi giữ thăng bằng và khoảnh khắc về đích để con tự tin hơn với vận động.', photos: ['Push-bike track', 'Helmet check', 'Finish moment'], facts: [{ label: 'Age fit', value: '2.5-6 years' }, { label: 'Parent benefit', value: 'See balance, focus, and courage grow.' }, { label: 'Safety note', value: 'Helmet check and soft-speed lanes every round.' }, { label: 'Session style', value: 'Warm-up game, balance track, guided turns, and calm finish.' }] },
                { label: 'Nature', tint: 'mint', title: 'Mini Camping', description: 'Dựng lều, quan sát thiên nhiên, làm việc nhóm và học các thói quen ngoài trời thật đơn giản.', photos: ['Tent setup', 'Nature walk', 'Team game'], facts: [{ label: 'Age fit', value: '3-6 years' }, { label: 'Parent benefit', value: 'Build independence with calm routines.' }, { label: 'Safety note', value: 'Shaded zones, water breaks, and clear boundaries.' }, { label: 'Session style', value: 'Tent routine, small nature mission, sharing task, and tidy close.' }] },
                { label: 'Discovery', tint: 'sky', title: 'Playful Science', description: 'Bong bóng, màu sắc, nam châm, hạt giống và những câu hỏi nhỏ để con khám phá bằng tay.', photos: ['Color lab', 'Bubble test', 'Seed watch'], facts: [{ label: 'Age fit', value: '4-6 years' }, { label: 'Parent benefit', value: 'Encourage curiosity and patient observation.' }, { label: 'Safety note', value: 'Child-safe materials and guided cleanup.' }, { label: 'Session style', value: 'Question prompt, hands-on test, observation, and simple reflection.' }] },
              ],
            },
          },
          {
            component_type: 'flow_steps',
            style_variant: 'style_2',
            title: 'A calm rhythm from hello to reflection.',
            content_json: {
              eyebrow: 'What A Session Looks Like',
              title: 'A calm rhythm from hello to reflection.',
              items: [
                { step: '01', title: 'Welcome & check-in', description: 'Con làm quen không gian, thiết bị và người hướng dẫn trước khi bắt đầu.' },
                { step: '02', title: 'Guided play', description: 'Hoạt động được chia thành thử thách nhỏ để trẻ thử từng bước.' },
                { step: '03', title: 'Parent observation', description: 'Ba mẹ có gợi ý quan sát về vận động, cảm xúc và giao tiếp của con.' },
                { step: '04', title: 'Reflection & contact', description: 'Kết thúc nhẹ nhàng bằng ghi nhận, dọn dẹp và gợi ý buổi tiếp theo.' },
              ],
            },
          },
          {
            component_type: 'cta',
            style_variant: 'style_4',
            title: 'Safety first, so children can play freely.',
            content_json: {
              eyebrow: 'Safety Promise',
              title: 'Safety first, so children can play freely.',
              description: 'Mỗi buổi chơi đều bắt đầu bằng kiểm tra thiết bị, ranh giới rõ ràng, hướng dẫn nhẹ nhàng và tôn trọng nhịp riêng của từng bé.',
              chips: ['Right-size equipment', 'Child-paced challenges', 'Guided supervision', 'Polite play language'],
            },
          },
          {
            component_type: 'contact_panel',
            style_variant: 'style_1',
            title: 'Join a first session',
            content_json: {
              label: 'Parent Contact',
              title: 'Join a first session',
              phone: '+84 90 123 4567',
              description: 'Gửi câu hỏi cho konnit để chọn hoạt động phù hợp với tuổi, mức tự tin và thời gian của gia đình.',
              primaryCta: { label: 'Join a First Session', url: '#' },
              secondaryCta: { label: 'Back to Home', url: '/' },
            },
          },
        ],
      },
      {
        slug: 'store',
        title: 'Konnit Store',
        description: 'Play-ready kits for safe little adventures — catalog preview.',
        sections: [
          {
            component_type: 'hero',
            style_variant: 'style_5',
            title: 'Play-ready kits for safe little adventures.',
            content_json: {
              eyebrow: 'Konnit Store',
              title: 'Play-ready kits for safe little adventures.',
              description: 'Các bộ đồ chơi và dụng cụ được chọn để ba mẹ dễ chuẩn bị cho xe thăng bằng, cắm trại mini, khám phá khoa học và những buổi chơi an toàn tại nhà.',
              primaryCta: { label: 'Explore kits', url: '#kits' },
              secondaryCta: { label: 'Book a first session', url: '#' },
              items: [
                { icon: '◆', tint: 'bike', title: 'Helmet fit', subtitle: 'Soft check before every ride' },
                { icon: '◆', tint: 'camp', title: 'Mini camp', subtitle: 'Small routines for outdoor play' },
                { icon: '◆', tint: 'science', title: 'Science play', subtitle: 'Guided discovery tools' },
              ],
            },
          },
          {
            component_type: 'product',
            style_variant: 'style_2',
            title: 'Choose by activity, age, and safety fit.',
            content_json: {
              eyebrow: 'Play-Ready Kits',
              title: 'Choose by activity, age, and safety fit.',
              description: 'Đây là trang xem trước sản phẩm. Mỗi hành động sẽ gửi câu hỏi cho konnit, không có giỏ hàng, thanh toán hay tồn kho trực tuyến.',
              items: [
                { tag: 'Safety', tint: 'pink', title: 'Helmet & Safety Kit', description: 'Bộ chuẩn bị trước giờ chơi gồm mũ bảo hộ, miếng dán tên và thẻ kiểm tra an toàn ngắn gọn.', ageFit: '2.5-6 years', safetyNote: 'Measure first; fit check required before riding.', included: 'Helmet guide, name labels, pre-play checklist.', ctaLabel: 'Ask about this kit', ctaUrl: '#', photos: ['Helmet', 'Name label', 'Checklist'] },
                { tag: 'Bike', tint: 'sun', title: 'Balance-Bike Accessories', description: 'Phụ kiện nhỏ giúp con nhận biết xe của mình, luyện thăng bằng và chơi theo làn đường mềm.', ageFit: '3-6 years', safetyNote: 'Soft edges only; use in low-speed play zones.', included: 'Bell, name plate, soft cones, track cards.', ctaLabel: 'Ask about this kit', ctaUrl: '#', photos: ['Bell', 'Name plate', 'Soft cones'] },
                { tag: 'Camp', tint: 'mint', title: 'Camping Starter Kit', description: 'Bộ cắm trại mini cho các hoạt động dựng lều, quan sát thiên nhiên và làm việc nhóm nhẹ nhàng.', ageFit: '3-6 years', safetyNote: 'Adult setup first; keep shaded zones and water breaks.', included: 'Sit mat, safe light, task cards, boundary flags.', ctaLabel: 'Ask about this kit', ctaUrl: '#', photos: ['Sit mat', 'Safe light', 'Task cards'] },
                { tag: 'Science', tint: 'sky', title: 'Science Play Kit', description: 'Dụng cụ khám phá đơn giản để con quan sát, đặt câu hỏi và dọn dẹp sau mỗi thí nghiệm nhỏ.', ageFit: '4-6 years', safetyNote: 'Guided play only; avoid small loose parts for younger kids.', included: 'Observation tube, safe tools, question cards.', ctaLabel: 'Ask about this kit', ctaUrl: '#', photos: ['Observe', 'Tools', 'Cards'] },
                { tag: 'For Home', tint: 'pink', title: 'Home Play Routine Pack', description: 'Gợi ý chơi 15 phút tại nhà để ba mẹ nối tiếp tinh thần konnit sau mỗi buổi trải nghiệm.', ageFit: '2.5-6 years', safetyNote: 'Pick one activity at a time and keep parent guidance close.', included: 'Routine cards, sticker chart, tidy pouch.', ctaLabel: 'Ask about this kit', ctaUrl: '#', photos: ['Routine', 'Sticker chart', 'Tidy pouch'] },
              ],
            },
          },
          {
            component_type: 'flow_steps',
            style_variant: 'style_2',
            title: 'Start with your child, then choose the kit.',
            content_json: {
              eyebrow: 'How to choose',
              title: 'Start with your child, then choose the kit.',
              items: [
                { step: '01', title: 'Age and confidence', description: 'Chọn bộ phù hợp với độ tuổi và mức tự tin hiện tại, không chỉ theo hoạt động con thích.' },
                { step: '02', title: 'Activity type', description: 'Xe thăng bằng cần kiểm tra vừa vặn; cắm trại cần thói quen ngoài trời; khoa học cần hướng dẫn gần.' },
                { step: '03', title: 'Safety fit', description: 'Ưu tiên kích cỡ, cạnh mềm, vật liệu an toàn và cách ba mẹ quan sát trong lúc con chơi.' },
                { step: '04', title: 'Guided use', description: 'Nếu chưa chắc, hãy hỏi konnit trước khi mua để chọn bộ dùng được cả ở lớp và tại nhà.' },
              ],
            },
          },
          {
            component_type: 'cta',
            style_variant: 'style_5',
            title: 'Meet konnit before choosing a kit.',
            content_json: {
              eyebrow: 'Need a gentle first step?',
              title: 'Meet konnit before choosing a kit.',
              description: 'Ba mẹ có thể đặt buổi đầu tiên để konnit quan sát hoạt động con thích, sau đó gợi ý bộ dụng cụ phù hợp hơn.',
              primaryCta: { label: 'Book a first session', url: '#' },
              secondaryCta: { label: 'Call +84 90 123 4567', url: 'tel:+84901234567' },
            },
          },
        ],
      },
      {
        slug: 'community',
        title: 'Our Community — Konnit',
        description: 'Konnit community days — kinder days for children and families.',
        sections: [
          {
            component_type: 'hero',
            style_variant: 'style_5',
            title: 'A kinder world for children, one community day at a time.',
            content_json: {
              eyebrow: 'Our Community',
              title: 'A kinder world for children, one community day at a time.',
              description: 'konnit cùng gia đình và các đối tác địa phương tạo ra những không gian an toàn, vui vẻ để trẻ được chơi, nhận quà nhỏ và cảm thấy mình thuộc về một cộng đồng tử tế.',
              primaryCta: { label: 'Join next event', url: '#join' },
              secondaryCta: { label: 'See activities', url: '#highlights' },
              items: [
                { icon: '01', tint: 'berry', title: "Children's Day", subtitle: 'Play stations, gentle hosting, and family time' },
                { icon: '02', tint: 'berry', title: 'Local care', subtitle: '5-7 brands helping create a better space' },
                { icon: '03', tint: 'berry', title: 'Small gifts', subtitle: 'Kid-friendly samples and thoughtful surprises' },
              ],
            },
          },
          {
            component_type: 'cta',
            style_variant: 'style_5',
            title: 'We gather families around care, play, and shared responsibility.',
            content_json: {
              eyebrow: 'Community Mission',
              title: 'We gather families around care, play, and shared responsibility.',
              description: 'konnit tổ chức các hoạt động xã hội cho trẻ em, nơi những cộng tác viên và thương hiệu địa phương cùng đóng góp địa điểm, trò chơi, quà tặng và mẫu sản phẩm tốt cho trẻ.',
              noteLabel: 'Community purpose',
              note: 'Đây là không gian cộng đồng. Mục tiêu là tạo trải nghiệm vui, lịch sự, an toàn và ấm áp cho trẻ nhỏ cùng gia đình.',
            },
          },
          {
            component_type: 'flow_steps',
            style_variant: 'style_1',
            title: 'Community activities that feel generous, simple, and child-first.',
            content_json: {
              eyebrow: 'Activity Highlights',
              title: 'Community activities that feel generous, simple, and child-first.',
              items: [
                { step: '01', title: "Children's Day Together", description: 'Một ngày gia đình với trạm chơi nhỏ, góc vận động, quà tặng và mẫu sản phẩm an toàn để trẻ khám phá cùng ba mẹ.' },
                { step: '02', title: 'Local Brand Collaboration', description: 'Mỗi sự kiện kết nối 5-7 thương hiệu địa phương cùng hỗ trợ địa điểm, hoạt động và những sản phẩm đặt trẻ em lên trước.' },
                { step: '03', title: 'Every Few Months', description: 'Các khoảnh khắc cộng đồng được tổ chức khoảng mỗi 2-3 tháng, đủ đều đặn để mong chờ và đủ nhẹ nhàng để giữ sự tự nhiên.' },
              ],
            },
          },
          {
            component_type: 'image_text',
            style_variant: 'style_5',
            title: 'A place for real community photos later.',
            content_json: {
              eyebrow: 'Event Gallery',
              title: 'A place for real community photos later.',
              description: 'Khu vực này dùng để đặt một ảnh lớn hoặc bộ ảnh nổi nhẹ ghi lại ngày hội, hoạt động, góc quà và khoảnh khắc gia đình.',
              photos: ["Children's Day", 'Gift corner', 'Family play'],
            },
          },
          {
            component_type: 'flow_steps',
            style_variant: 'style_3',
            title: 'A gentle path through the community day.',
            content_json: {
              eyebrow: 'What Families Experience',
              title: 'A gentle path through the community day.',
              items: [
                { step: '01', title: 'Arrive safely', description: 'Gia đình được chào đón, hướng dẫn khu vực và biết nơi con có thể chơi an toàn.' },
                { step: '02', title: 'Explore activities', description: 'Trẻ thử các trạm chơi nhẹ nhàng theo nhịp riêng, có người lớn quan sát gần.' },
                { step: '03', title: 'Receive small gifts', description: 'Con nhận quà nhỏ hoặc mẫu sản phẩm thân thiện với trẻ từ các đối tác phù hợp.' },
                { step: '04', title: 'Meet families', description: 'Ba mẹ có cơ hội trò chuyện với những gia đình cùng quan tâm đến tuổi thơ an toàn.' },
                { step: '05', title: 'Leave happy', description: 'Mỗi gia đình rời đi với kỷ niệm đẹp, ảnh chụp và cảm giác được kết nối.' },
              ],
            },
          },
          {
            component_type: 'contact_panel',
            style_variant: 'style_1',
            title: 'Join next community event',
            content_json: {
              label: 'Community Contact',
              title: 'Join next community event',
              phone: '+84 90 123 4567',
              description: 'Liên hệ konnit để nhận thông tin về ngày cộng đồng tiếp theo, cách tham gia cùng gia đình hoặc cách một thương hiệu địa phương có thể đóng góp tử tế.',
              primaryCta: { label: 'Join next community event', url: '#' },
              secondaryCta: { label: 'Back to Home', url: '/' },
            },
          },
        ],
      },
    ];

    for (const lp of landingPages) {
      const lpRes = await client.query(
        `INSERT INTO cms_pages (category_id, title, slug, description, status, published_at, created_by, updated_by)
         VALUES ($1, $2, $3, $4, 'published', now(), $5, $5)
         ON CONFLICT (category_id, slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
         RETURNING id`,
        [categoryId, lp.title, lp.slug, lp.description, adminId],
      );
      const lpId = lpRes.rows[0].id;
      await client.query(`DELETE FROM cms_sections WHERE page_id = $1`, [lpId]);
      for (let i = 0; i < lp.sections.length; i++) {
        const s = lp.sections[i];
        await client.query(
          `INSERT INTO cms_sections
             (page_id, component_type, style_variant, title, description, content_json, sort_order, status, created_by, updated_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'published',$8,$8)`,
          [lpId, s.component_type, s.style_variant, s.title, null,
           JSON.stringify(s.content_json), i + 1, adminId],
        );
      }
    }
    logger.info('Services / Store / Community landing pages seeded.');

    // 4. Seed a demo event + ticket types + a voucher (Phase 2)
    const eventRes = await client.query(
      `INSERT INTO events (name, slug, description, location, starts_at,
                           registration_opens_at, registration_closes_at, status, published_at)
       VALUES ($1,$2,$3,$4, now() + interval '30 days',
               now() - interval '1 day', now() + interval '25 days', 'published', now())
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [
        'Konnit Kids Run 2026',
        'konnit-kids-run-2026',
        'Giải chạy gia đình cho các bé Konnit — vận động vui khỏe cùng ba mẹ.',
        'Công viên Tao Đàn, TP.HCM',
      ],
    );
    const eventId = eventRes.rows[0].id;

    const ticketTypes = [
      { name: 'Vé thi đấu – Mầm', slug: 'mam', ageGroup: '2–3 tuổi', ageMin: 2, ageMax: 3, price: 250000, earlyBird: 200000, quota: 100, shirt: true },
      { name: 'Vé thi đấu – Chồi', slug: 'choi', ageGroup: '4–6 tuổi', ageMin: 4, ageMax: 6, price: 300000, earlyBird: 250000, quota: 100, shirt: true },
      { name: 'Vé trải nghiệm (Fun)', slug: 'fun', ageGroup: 'Mọi lứa', ageMin: 2, ageMax: 12, price: 150000, earlyBird: null, quota: 200, shirt: false },
    ];
    for (let i = 0; i < ticketTypes.length; i++) {
      const t = ticketTypes[i];
      await client.query(
        `INSERT INTO ticket_types (event_id, name, slug, age_group, age_min, age_max,
                                   price, early_bird_price, early_bird_until,
                                   quota_total, includes_shirt, sort_order, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now() + interval '10 days', $9,$10,$11,'published')
         ON CONFLICT (event_id, slug) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price`,
        [eventId, t.name, t.slug, t.ageGroup, t.ageMin, t.ageMax,
         t.price, t.earlyBird, t.quota, t.shirt, i],
      );
    }
    logger.info('Demo event + ticket types seeded.');

    await client.query(
      `INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_amount, max_uses, status)
       VALUES ('KONNIT10', 'Giảm 10% cho đơn đầu tiên', 'percent', 10, 0, 1000, 'active')
       ON CONFLICT (code) DO NOTHING`,
    );
    logger.info('Demo voucher seeded.');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Run standalone only when invoked directly (db:seed), not when imported by init.
if (process.argv[1] && process.argv[1].includes('seed')) {
  seed()
    .then(() => logger.info('Seed complete.'))
    .catch((err) => {
      logger.error(err, 'Seed failed');
      process.exit(1);
    });
}
