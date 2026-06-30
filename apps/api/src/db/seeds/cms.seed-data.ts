export interface SeedSection {
  component_type: string;
  style_variant: string;
  title: string;
  description?: string | null;
  content_json: Record<string, unknown>;
}
export interface SeedPage {
  slug: string;
  title: string;
  description: string;
  sections: SeedSection[];
}

const HOME_LEAD2 =
  'konnit tạo ra những buổi chơi có định hướng cho trẻ dưới 7 tuổi, nơi con được thử vận động, giao tiếp và khám phá trong nhịp độ nhẹ nhàng.';

// Mailto/tel khớp static-legacy
const MAIL = 'mailto:hello@konnit.example';
const M_JOIN_FIRST = `${MAIL}?subject=Join%20a%20first%20Konnit%20session`;
const M_BOOK_FIRST = `${MAIL}?subject=Book%20a%20first%20Konnit%20session`;
const M_JOIN_COMMUNITY = `${MAIL}?subject=Join%20next%20Konnit%20community%20event`;
const askKit = (subject: string) => `${MAIL}?subject=Ask%20about%20${subject}`;

export const HOME_PAGE: SeedPage = {
  slug: 'home',
  title: 'Konnit – Học an toàn qua trò chơi',
  description: 'Nền tảng thể thao và hoạt động dành cho trẻ em Việt Nam',
  sections: [
    {
      component_type: 'hero',
      style_variant: 'style_4',
      title: 'Những chuyến phiêu lưu nhỏ an toàn cho bé mầm non.',
      description:
        'konnit đồng hành cùng trẻ dưới 7 tuổi và ba mẹ qua những trải nghiệm học mà chơi: đua xe thăng bằng, cắm trại mini và khám phá khoa học an toàn.',
      content_json: {
        title: 'Những chuyến phiêu lưu nhỏ an toàn cho bé mầm non.',
        description:
          'konnit đồng hành cùng trẻ dưới 7 tuổi và ba mẹ qua những trải nghiệm học mà chơi: đua xe thăng bằng, cắm trại mini và khám phá khoa học an toàn.',
        primaryCta: { label: 'Khám phá hoạt động', url: '/tin-tuc' },
        secondaryCta: { label: 'An toàn là ưu tiên', url: '#about' },
      },
    },
    {
      component_type: 'contact_panel',
      style_variant: 'style_2',
      title: 'Một nơi dịu dàng để con lớn lên dũng cảm.',
      description: HOME_LEAD2,
      content_json: {
        anchorId: 'about',
        eyebrow: 'Về chúng tôi',
        title: 'Một nơi dịu dàng để con lớn lên dũng cảm.',
        description: HOME_LEAD2,
        bullets: [
          'Thiết bị được chuẩn bị đúng cỡ trước mỗi hoạt động.',
          'Ba mẹ quan sát con với gợi ý rõ ràng từ người hướng dẫn.',
          'Mỗi bé được chọn thử thách phù hợp với mức tự tin hiện tại.',
        ],
        label: 'Buổi đầu tiên',
        contactTitle: 'Trò chuyện với konnit',
        phone: '+84 90 123 4567',
        trust: [
          { icon: '✓', label: 'An toàn trước tiên' },
          { icon: '♡', label: 'Chơi lịch sự' },
          { icon: '★', label: 'Vui vẻ thân thiện' },
        ],
      },
    },
    {
      component_type: 'feature_grid',
      style_variant: 'style_4',
      title: 'Các hoạt động học xoay quanh vận động, thiên nhiên và khám phá.',
      description:
        'Ba nhóm hoạt động chính giúp trẻ phát triển thể chất, cảm xúc xã hội và tư duy khám phá trong một lộ trình nhẹ nhàng.',
      content_json: {
        eyebrow: 'Hoạt động của chúng tôi',
        title: 'Các hoạt động học xoay quanh vận động, thiên nhiên và khám phá.',
        items: [
          { icon: '↗', tint: 'bike', title: 'Đua xe thăng bằng', description: 'Đường chạy nhỏ, trò chơi giữ thăng bằng và khoảnh khắc về đích để con tự tin hơn với vận động.', meta: '2.5–6 tuổi', linkLabel: 'Tìm hiểu thêm', linkUrl: '/services', photos: ['Đường đua xe', 'Kiểm tra mũ', 'Khoảnh khắc về đích'] },
          { icon: '⌂', tint: 'camp', title: 'Cắm trại mini', description: 'Dựng lều, quan sát thiên nhiên, làm việc nhóm và học các thói quen ngoài trời thật đơn giản.', meta: '3–6 tuổi', linkLabel: 'Tìm hiểu thêm', linkUrl: '/services', photos: ['Dựng lều', 'Dạo thiên nhiên', 'Trò chơi nhóm'] },
          { icon: '◌', tint: 'science', title: 'Khoa học vui', description: 'Bong bóng, màu sắc, nam châm, hạt giống và những câu hỏi nhỏ để con khám phá bằng tay.', meta: '4–6 tuổi', linkLabel: 'Tìm hiểu thêm', linkUrl: '/services', photos: ['Phòng màu sắc', 'Thử bong bóng', 'Theo dõi hạt mầm'] },
        ],
      },
    },
    {
      component_type: 'feature_grid',
      style_variant: 'style_5',
      title: 'Những ngày hội cộng đồng cho niềm vui tuổi thơ.',
      description:
        'Cộng đồng konnit cùng các thương hiệu địa phương tạo nên những ngày vui an toàn cho trẻ: khu chơi nhỏ, hoạt động sáng tạo, quà tặng và mẫu sản phẩm thân thiện với trẻ em.',
      content_json: {
        eyebrow: 'Cộng đồng của chúng tôi',
        title: 'Những ngày hội cộng đồng cho niềm vui tuổi thơ.',
        description:
          'Cộng đồng konnit cùng các thương hiệu địa phương tạo nên những ngày vui an toàn cho trẻ: khu chơi nhỏ, hoạt động sáng tạo, quà tặng và mẫu sản phẩm thân thiện với trẻ em.',
        primaryCta: { label: 'Xem hoạt động cộng đồng', url: '/community' },
        photos: ['Vòng tròn gia đình', 'Người bạn đầu tiên', 'Sự kiện cuối tuần'],
        items: [
          { icon: '01', title: 'Khoảnh khắc Ngày của bé', description: 'Những ngày hội nhỏ có trạm chơi, góc nhận quà và không gian để con gặp bạn mới thật tự nhiên.' },
          { icon: '02', title: 'Đồng hành thương hiệu địa phương', description: 'Mỗi sự kiện có 5–7 đối tác địa phương cùng chuẩn bị địa điểm, hoạt động và sản phẩm phù hợp cho trẻ.' },
          { icon: '03', title: 'Kết nối tử tế', description: 'Gia đình gặp nhau qua những trải nghiệm tử tế, nhẹ nhàng và không đặt nặng mua bán.' },
        ],
      },
    },
    {
      component_type: 'product',
      style_variant: 'style_1',
      title: 'Dụng cụ chỉn chu cho học và chơi an toàn.',
      description:
        'Khu cửa hàng giới thiệu các món đồ hỗ trợ hoạt động tại konnit và ở nhà. Đây là phần xem trước sản phẩm.',
      content_json: {
        eyebrow: 'Cửa hàng Konnit',
        title: 'Dụng cụ chỉn chu cho học và chơi an toàn.',
        description:
          'Khu cửa hàng giới thiệu các món đồ hỗ trợ hoạt động tại konnit và ở nhà. Đây là phần xem trước sản phẩm.',
        primaryCta: { label: 'Mở cửa hàng Konnit', url: '/cua-hang' },
        items: [
          { tag: 'An toàn', tint: 'pink', title: 'Bộ mũ bảo hộ & an toàn', description: 'Mũ bảo hộ, miếng dán tên và checklist an toàn trước giờ chơi.', ageFit: '2.5–6', safetyNote: 'cần kiểm tra vừa vặn', linkLabel: 'Xem sản phẩm', linkUrl: '/store#kits', photos: ['Ảnh sản phẩm', 'Chi tiết vừa vặn', 'Trọn bộ'] },
          { tag: 'Xe đạp', tint: 'sun', title: 'Phụ kiện xe thăng bằng', description: 'Chuông nhỏ, bảng tên và cọc đánh dấu đường chạy nhẹ nhàng.', ageFit: '3–6', safetyNote: 'chỉ cạnh mềm', linkLabel: 'Xem sản phẩm', linkUrl: '/store#kits', photos: ['Ảnh sản phẩm', 'Bảng tên', 'Cọc đường chạy'] },
          { tag: 'Cắm trại', tint: 'mint', title: 'Bộ cắm trại cơ bản', description: 'Tấm ngồi, đèn giả lập an toàn và thẻ nhiệm vụ khám phá thiên nhiên.', ageFit: '3–6', safetyNote: 'người lớn lắp trước', linkLabel: 'Xem sản phẩm', linkUrl: '/store#kits', photos: ['Ảnh sản phẩm', 'Thẻ nhiệm vụ', 'Đèn an toàn'] },
          { tag: 'Khoa học', tint: 'sky', title: 'Bộ khám phá khoa học', description: 'Ống quan sát, thẻ câu hỏi và vật liệu thí nghiệm đơn giản cho trẻ nhỏ.', ageFit: '4–6', safetyNote: 'chơi có hướng dẫn', linkLabel: 'Xem sản phẩm', linkUrl: '/store#kits', photos: ['Ảnh sản phẩm', 'Dụng cụ', 'Thẻ câu hỏi'] },
        ],
      },
    },
  ],
};

export const LANDING_PAGES: SeedPage[] = [
  {
    slug: 'services',
    title: 'Hoạt động — Konnit',
    description: 'Hoạt động học của Konnit — vận động, thiên nhiên và khoa học vui.',
    sections: [
      {
        component_type: 'hero',
        style_variant: 'style_5',
        title: 'Các hoạt động học xoay quanh vận động, thiên nhiên và khám phá.',
        content_json: {
          eyebrow: 'Hoạt động',
          title: 'Các hoạt động học xoay quanh vận động, thiên nhiên và khám phá.',
          description:
            'Ba nhóm hoạt động chính giúp trẻ phát triển thể chất, cảm xúc xã hội và tư duy khám phá trong một lộ trình nhẹ nhàng, luôn có người hướng dẫn và ba mẹ đồng hành.',
          primaryCta: { label: 'Tham gia buổi đầu tiên', url: M_JOIN_FIRST },
          secondaryCta: { label: 'Liên hệ konnit', url: '#contact' },
          items: [
            { icon: '↗', tint: 'bike', title: 'Vận động', subtitle: 'Thăng bằng, tập trung và can đảm' },
            { icon: '⌂', tint: 'camp', title: 'Thiên nhiên', subtitle: 'Thói quen ngoài trời và làm việc nhóm' },
            { icon: '◌', tint: 'science', title: 'Khám phá', subtitle: 'Câu hỏi, vật liệu và sự tò mò' },
          ],
        },
      },
      {
        component_type: 'image_text',
        style_variant: 'style_4',
        title: 'Ba cách để con học qua trải nghiệm.',
        content_json: {
          eyebrow: 'Tổng quan chương trình',
          title: 'Ba cách để con học qua trải nghiệm.',
          description:
            'Mỗi chương trình có nhịp chơi riêng, nhưng cùng chung nguyên tắc: an toàn trước, lời nói tử tế và niềm vui phù hợp với từng bé.',
          items: [
            { label: 'Vận động', tint: 'pink', title: 'Đua xe thăng bằng', description: 'Đường chạy nhỏ, trò chơi giữ thăng bằng và khoảnh khắc về đích để con tự tin hơn với vận động.', photos: ['Đường đua xe', 'Kiểm tra mũ', 'Khoảnh khắc về đích'], facts: [{ label: 'Độ tuổi', value: '2.5–6 tuổi' }, { label: 'Lợi ích cho ba mẹ', value: 'Thấy con tiến bộ về thăng bằng, tập trung và can đảm.' }, { label: 'Lưu ý an toàn', value: 'Kiểm tra mũ và làn chạy chậm mỗi lượt.' }, { label: 'Cách diễn ra buổi học', value: 'Khởi động, đường thăng bằng, lượt chạy có hướng dẫn và kết thúc nhẹ nhàng.' }] },
            { label: 'Thiên nhiên', tint: 'mint', title: 'Cắm trại mini', description: 'Dựng lều, quan sát thiên nhiên, làm việc nhóm và học các thói quen ngoài trời thật đơn giản.', photos: ['Dựng lều', 'Dạo thiên nhiên', 'Trò chơi nhóm'], facts: [{ label: 'Độ tuổi', value: '3–6 tuổi' }, { label: 'Lợi ích cho ba mẹ', value: 'Xây dựng sự tự lập qua thói quen nhẹ nhàng.' }, { label: 'Lưu ý an toàn', value: 'Khu có bóng mát, nghỉ uống nước và ranh giới rõ ràng.' }, { label: 'Cách diễn ra buổi học', value: 'Dựng lều, nhiệm vụ thiên nhiên nhỏ, chia sẻ và dọn dẹp.' }] },
            { label: 'Khám phá', tint: 'sky', title: 'Khoa học vui', description: 'Bong bóng, màu sắc, nam châm, hạt giống và những câu hỏi nhỏ để con khám phá bằng tay.', photos: ['Phòng màu sắc', 'Thử bong bóng', 'Theo dõi hạt mầm'], facts: [{ label: 'Độ tuổi', value: '4–6 tuổi' }, { label: 'Lợi ích cho ba mẹ', value: 'Nuôi dưỡng tò mò và quan sát kiên nhẫn.' }, { label: 'Lưu ý an toàn', value: 'Vật liệu an toàn cho trẻ và dọn dẹp có hướng dẫn.' }, { label: 'Cách diễn ra buổi học', value: 'Đặt câu hỏi, thí nghiệm bằng tay, quan sát và cùng nhìn lại.' }] },
          ],
        },
      },
      {
        component_type: 'flow_steps',
        style_variant: 'style_2',
        title: 'Nhịp học nhẹ nhàng từ lúc chào đến lúc nhìn lại.',
        content_json: {
          eyebrow: 'Một buổi học diễn ra thế nào',
          title: 'Nhịp học nhẹ nhàng từ lúc chào đến lúc nhìn lại.',
          items: [
            { step: '01', title: 'Chào & nhận chỗ', description: 'Con làm quen không gian, thiết bị và người hướng dẫn trước khi bắt đầu.' },
            { step: '02', title: 'Chơi có hướng dẫn', description: 'Hoạt động được chia thành thử thách nhỏ để trẻ thử từng bước.' },
            { step: '03', title: 'Ba mẹ quan sát', description: 'Ba mẹ có gợi ý quan sát về vận động, cảm xúc và giao tiếp của con.' },
            { step: '04', title: 'Nhìn lại & kết nối', description: 'Kết thúc nhẹ nhàng bằng ghi nhận, dọn dẹp và gợi ý buổi tiếp theo.' },
          ],
        },
      },
      {
        component_type: 'cta',
        style_variant: 'style_4',
        title: 'An toàn trước tiên để con thoải mái vui chơi.',
        content_json: {
          eyebrow: 'Cam kết an toàn',
          title: 'An toàn trước tiên để con thoải mái vui chơi.',
          description:
            'Mỗi buổi chơi đều bắt đầu bằng kiểm tra thiết bị, ranh giới rõ ràng, hướng dẫn nhẹ nhàng và tôn trọng nhịp riêng của từng bé.',
          chips: ['Thiết bị vừa cỡ', 'Thử thách theo nhịp của bé', 'Có người hướng dẫn', 'Lời chơi lịch sự'],
        },
      },
      {
        component_type: 'contact_panel',
        style_variant: 'style_1',
        title: 'Tham gia buổi đầu tiên',
        content_json: {
          anchorId: 'contact',
          label: 'Liên hệ phụ huynh',
          title: 'Tham gia buổi đầu tiên',
          phone: '+84 90 123 4567',
          description:
            'Gửi câu hỏi cho konnit để chọn hoạt động phù hợp với tuổi, mức tự tin và thời gian của gia đình.',
          primaryCta: { label: 'Tham gia buổi đầu tiên', url: M_JOIN_FIRST },
          secondaryCta: { label: 'Về trang chủ', url: '/' },
        },
      },
    ],
  },
  {
    slug: 'store',
    title: 'Cửa hàng Konnit',
    description: 'Các bộ dụng cụ sẵn sàng cho những chuyến phiêu lưu nhỏ an toàn — xem trước danh mục.',
    sections: [
      {
        component_type: 'hero',
        style_variant: 'style_5',
        title: 'Bộ dụng cụ sẵn sàng cho những chuyến phiêu lưu nhỏ an toàn.',
        content_json: {
          eyebrow: 'Cửa hàng Konnit',
          title: 'Bộ dụng cụ sẵn sàng cho những chuyến phiêu lưu nhỏ an toàn.',
          description:
            'Các bộ đồ chơi và dụng cụ được chọn để ba mẹ dễ chuẩn bị cho xe thăng bằng, cắm trại mini, khám phá khoa học và những buổi chơi an toàn tại nhà.',
          primaryCta: { label: 'Khám phá các bộ', url: '#kits' },
          secondaryCta: { label: 'Đặt buổi đầu tiên', url: M_BOOK_FIRST },
          items: [
            { icon: '◆', tint: 'bike', title: 'Vừa mũ bảo hộ', subtitle: 'Kiểm tra nhẹ trước mỗi lượt chạy' },
            { icon: '◆', tint: 'camp', title: 'Cắm trại mini', subtitle: 'Thói quen nhỏ cho chơi ngoài trời' },
            { icon: '◆', tint: 'science', title: 'Khoa học vui', subtitle: 'Dụng cụ khám phá có hướng dẫn' },
          ],
        },
      },
      {
        component_type: 'product',
        style_variant: 'style_2',
        title: 'Chọn theo hoạt động, độ tuổi và độ an toàn.',
        content_json: {
          anchorId: 'kits',
          eyebrow: 'Các bộ sẵn sàng để chơi',
          title: 'Chọn theo hoạt động, độ tuổi và độ an toàn.',
          description:
            'Đây là trang xem trước sản phẩm. Mỗi hành động sẽ gửi câu hỏi cho konnit, không có giỏ hàng, thanh toán hay tồn kho trực tuyến.',
          items: [
            { tag: 'An toàn', tint: 'pink', title: 'Bộ mũ bảo hộ & an toàn', description: 'Bộ chuẩn bị trước giờ chơi gồm mũ bảo hộ, miếng dán tên và thẻ kiểm tra an toàn ngắn gọn.', ageFit: '2.5–6 tuổi', safetyNote: 'Đo trước; cần kiểm tra vừa vặn trước khi chạy.', included: 'Hướng dẫn mũ, nhãn tên, checklist trước giờ chơi.', ctaLabel: 'Hỏi về bộ này', ctaUrl: askKit('Helmet%20and%20Safety%20Kit'), photos: ['Mũ bảo hộ', 'Nhãn tên', 'Checklist'] },
            { tag: 'Xe đạp', tint: 'sun', title: 'Phụ kiện xe thăng bằng', description: 'Phụ kiện nhỏ giúp con nhận biết xe của mình, luyện thăng bằng và chơi theo làn đường mềm.', ageFit: '3–6 tuổi', safetyNote: 'Chỉ cạnh mềm; dùng ở khu chơi tốc độ thấp.', included: 'Chuông, bảng tên, cọc mềm, thẻ đường chạy.', ctaLabel: 'Hỏi về bộ này', ctaUrl: askKit('Balance-Bike%20Accessories'), photos: ['Chuông', 'Bảng tên', 'Cọc mềm'] },
            { tag: 'Cắm trại', tint: 'mint', title: 'Bộ cắm trại cơ bản', description: 'Bộ cắm trại mini cho các hoạt động dựng lều, quan sát thiên nhiên và làm việc nhóm nhẹ nhàng.', ageFit: '3–6 tuổi', safetyNote: 'Người lớn lắp trước; giữ khu bóng mát và nghỉ uống nước.', included: 'Tấm ngồi, đèn an toàn, thẻ nhiệm vụ, cờ ranh giới.', ctaLabel: 'Hỏi về bộ này', ctaUrl: askKit('Camping%20Starter%20Kit'), photos: ['Tấm ngồi', 'Đèn an toàn', 'Thẻ nhiệm vụ'] },
            { tag: 'Khoa học', tint: 'sky', title: 'Bộ khám phá khoa học', description: 'Dụng cụ khám phá đơn giản để con quan sát, đặt câu hỏi và dọn dẹp sau mỗi thí nghiệm nhỏ.', ageFit: '4–6 tuổi', safetyNote: 'Chơi có hướng dẫn; tránh chi tiết nhỏ với trẻ nhỏ hơn.', included: 'Ống quan sát, dụng cụ an toàn, thẻ câu hỏi.', ctaLabel: 'Hỏi về bộ này', ctaUrl: askKit('Science%20Play%20Kit'), photos: ['Quan sát', 'Dụng cụ', 'Thẻ'] },
            { tag: 'Tại nhà', tint: 'pink', title: 'Gói thói quen chơi tại nhà', description: 'Gợi ý chơi 15 phút tại nhà để ba mẹ nối tiếp tinh thần konnit sau mỗi buổi trải nghiệm.', ageFit: '2.5–6 tuổi', safetyNote: 'Chọn từng hoạt động một và luôn có ba mẹ ở gần.', included: 'Thẻ thói quen, bảng sticker, túi gọn gàng.', ctaLabel: 'Hỏi về bộ này', ctaUrl: askKit('Home%20Play%20Routine%20Pack'), photos: ['Thói quen', 'Bảng sticker', 'Túi gọn gàng'] },
          ],
        },
      },
      {
        component_type: 'flow_steps',
        style_variant: 'style_2',
        title: 'Bắt đầu từ con, rồi chọn bộ phù hợp.',
        content_json: {
          eyebrow: 'Cách chọn',
          title: 'Bắt đầu từ con, rồi chọn bộ phù hợp.',
          items: [
            { step: '01', title: 'Độ tuổi và sự tự tin', description: 'Chọn bộ phù hợp với độ tuổi và mức tự tin hiện tại, không chỉ theo hoạt động con thích.' },
            { step: '02', title: 'Loại hoạt động', description: 'Xe thăng bằng cần kiểm tra vừa vặn; cắm trại cần thói quen ngoài trời; khoa học cần hướng dẫn gần.' },
            { step: '03', title: 'Độ an toàn', description: 'Ưu tiên kích cỡ, cạnh mềm, vật liệu an toàn và cách ba mẹ quan sát trong lúc con chơi.' },
            { step: '04', title: 'Dùng có hướng dẫn', description: 'Nếu chưa chắc, hãy hỏi konnit trước khi mua để chọn bộ dùng được cả ở lớp và tại nhà.' },
          ],
        },
      },
      {
        component_type: 'cta',
        style_variant: 'style_5',
        title: 'Gặp konnit trước khi chọn bộ.',
        content_json: {
          eyebrow: 'Cần một bước khởi đầu nhẹ nhàng?',
          title: 'Gặp konnit trước khi chọn bộ.',
          description:
            'Ba mẹ có thể đặt buổi đầu tiên để konnit quan sát hoạt động con thích, sau đó gợi ý bộ dụng cụ phù hợp hơn.',
          primaryCta: { label: 'Đặt buổi đầu tiên', url: M_BOOK_FIRST },
          secondaryCta: { label: 'Gọi +84 90 123 4567', url: 'tel:+84901234567' },
        },
      },
    ],
  },
  {
    slug: 'community',
    title: 'Cộng đồng — Konnit',
    description: 'Ngày hội cộng đồng Konnit — những ngày tử tế hơn cho trẻ em và gia đình.',
    sections: [
      {
        component_type: 'hero',
        style_variant: 'style_5',
        title: 'Một thế giới tử tế hơn cho trẻ, qua từng ngày hội cộng đồng.',
        content_json: {
          eyebrow: 'Cộng đồng',
          title: 'Một thế giới tử tế hơn cho trẻ, qua từng ngày hội cộng đồng.',
          description:
            'konnit cùng gia đình và các đối tác địa phương tạo ra những không gian an toàn, vui vẻ để trẻ được chơi, nhận quà nhỏ và cảm thấy mình thuộc về một cộng đồng tử tế.',
          primaryCta: { label: 'Tham gia sự kiện tới', url: '#join-next-event' },
          secondaryCta: { label: 'Xem hoạt động', url: '#activity-highlights' },
          items: [
            { icon: '01', tint: 'berry', title: 'Ngày của bé', subtitle: 'Trạm chơi, đón tiếp nhẹ nhàng và thời gian gia đình' },
            { icon: '02', tint: 'berry', title: 'Sự quan tâm địa phương', subtitle: '5–7 thương hiệu cùng tạo không gian tốt hơn' },
            { icon: '03', tint: 'berry', title: 'Quà nhỏ', subtitle: 'Mẫu sản phẩm thân thiện và bất ngờ dễ thương' },
          ],
        },
      },
      {
        component_type: 'cta',
        style_variant: 'style_5',
        title: 'Chúng tôi gắn kết các gia đình qua sự quan tâm, vui chơi và trách nhiệm chung.',
        content_json: {
          eyebrow: 'Sứ mệnh cộng đồng',
          title: 'Chúng tôi gắn kết các gia đình qua sự quan tâm, vui chơi và trách nhiệm chung.',
          description:
            'konnit tổ chức các hoạt động xã hội cho trẻ em, nơi những cộng tác viên và thương hiệu địa phương cùng đóng góp địa điểm, trò chơi, quà tặng và mẫu sản phẩm tốt cho trẻ.',
          noteLabel: 'Mục đích cộng đồng',
          note: 'Đây là không gian cộng đồng. Mục tiêu là tạo trải nghiệm vui, lịch sự, an toàn và ấm áp cho trẻ nhỏ cùng gia đình.',
        },
      },
      {
        component_type: 'flow_steps',
        style_variant: 'style_1',
        title: 'Hoạt động cộng đồng hào phóng, giản dị và đặt trẻ lên trước.',
        content_json: {
          anchorId: 'activity-highlights',
          eyebrow: 'Hoạt động nổi bật',
          title: 'Hoạt động cộng đồng hào phóng, giản dị và đặt trẻ lên trước.',
          items: [
            { step: '01', title: 'Ngày của bé cùng nhau', description: 'Một ngày gia đình với trạm chơi nhỏ, góc vận động, quà tặng và mẫu sản phẩm an toàn để trẻ khám phá cùng ba mẹ.' },
            { step: '02', title: 'Hợp tác thương hiệu địa phương', description: 'Mỗi sự kiện kết nối 5–7 thương hiệu địa phương cùng hỗ trợ địa điểm, hoạt động và những sản phẩm đặt trẻ em lên trước.' },
            { step: '03', title: 'Vài tháng một lần', description: 'Các khoảnh khắc cộng đồng được tổ chức khoảng mỗi 2–3 tháng, đủ đều đặn để mong chờ và đủ nhẹ nhàng để giữ sự tự nhiên.' },
          ],
        },
      },
      {
        component_type: 'image_text',
        style_variant: 'style_5',
        title: 'Nơi dành cho ảnh cộng đồng thật sau này.',
        content_json: {
          eyebrow: 'Thư viện sự kiện',
          title: 'Nơi dành cho ảnh cộng đồng thật sau này.',
          description:
            'Khu vực này dùng để đặt một ảnh lớn hoặc bộ ảnh nổi nhẹ ghi lại ngày hội, hoạt động, góc quà và khoảnh khắc gia đình.',
          photos: ['Ngày của bé', 'Góc quà tặng', 'Gia đình vui chơi'],
        },
      },
      {
        component_type: 'flow_steps',
        style_variant: 'style_3',
        title: 'Hành trình nhẹ nhàng qua ngày hội cộng đồng.',
        content_json: {
          eyebrow: 'Trải nghiệm của gia đình',
          title: 'Hành trình nhẹ nhàng qua ngày hội cộng đồng.',
          items: [
            { step: '01', title: 'Đến nơi an toàn', description: 'Gia đình được chào đón, hướng dẫn khu vực và biết nơi con có thể chơi an toàn.' },
            { step: '02', title: 'Khám phá hoạt động', description: 'Trẻ thử các trạm chơi nhẹ nhàng theo nhịp riêng, có người lớn quan sát gần.' },
            { step: '03', title: 'Nhận quà nhỏ', description: 'Con nhận quà nhỏ hoặc mẫu sản phẩm thân thiện với trẻ từ các đối tác phù hợp.' },
            { step: '04', title: 'Gặp gỡ gia đình', description: 'Ba mẹ có cơ hội trò chuyện với những gia đình cùng quan tâm đến tuổi thơ an toàn.' },
            { step: '05', title: 'Ra về vui vẻ', description: 'Mỗi gia đình rời đi với kỷ niệm đẹp, ảnh chụp và cảm giác được kết nối.' },
          ],
        },
      },
      {
        component_type: 'contact_panel',
        style_variant: 'style_1',
        title: 'Tham gia sự kiện cộng đồng tới',
        content_json: {
          anchorId: 'join-next-event',
          label: 'Liên hệ cộng đồng',
          title: 'Tham gia sự kiện cộng đồng tới',
          phone: '+84 90 123 4567',
          description:
            'Liên hệ konnit để nhận thông tin về ngày cộng đồng tiếp theo, cách tham gia cùng gia đình hoặc cách một thương hiệu địa phương có thể đóng góp tử tế.',
          primaryCta: { label: 'Tham gia sự kiện cộng đồng tới', url: M_JOIN_COMMUNITY },
          secondaryCta: { label: 'Về trang chủ', url: '/' },
        },
      },
    ],
  },
];