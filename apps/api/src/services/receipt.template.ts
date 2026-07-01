export interface OrderForReceipt {
  order_code: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  voucher_code?: string;
  paid_at?: string | null;
  created_at: string;
  items: Array<{
    ticket_name: string;
    unit_price: number;
    attendee_name: string;
    shirt_size?: string | null;
    medal_name?: string | null;
    qr_token?: string;
    qrDataUri?: string;
  }>;
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildReceiptHtml(order: OrderForReceipt, receiptUrl: string): string {
  const dateStr = formatDate(order.paid_at ?? order.created_at);

  const itemRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:16px;border-bottom:1px solid #eeeeee;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;padding-right:16px;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333333;">${item.attendee_name}</p>
              <p style="margin:0 0 3px;font-size:12px;color:#888888;">${item.ticket_name}</p>
              ${item.shirt_size ? `<p style="margin:0 0 3px;font-size:12px;color:#888888;">Áo: <strong>${item.shirt_size}</strong></p>` : ''}
              ${item.medal_name ? `<p style="margin:0 0 3px;font-size:12px;color:#888888;">Huy chương: <strong>${item.medal_name}</strong></p>` : ''}
              <p style="margin:8px 0 0;font-size:14px;font-weight:900;color:#c0392b;">${formatVND(item.unit_price)}</p>
            </td>
            ${item.qrDataUri ? `
            <td style="vertical-align:top;text-align:center;width:120px;">
              <img src="${item.qrDataUri}" width="110" height="110"
                alt="QR check-in ${item.attendee_name}"
                style="display:block;border:1px solid #eeeeee;border-radius:6px;padding:4px;background:#fff;"/>
              <p style="margin:4px 0 0;font-size:9px;color:#cccccc;word-break:break-all;">
                ${item.qr_token ? item.qr_token.slice(0, 8) + '…' : ''}
              </p>
            </td>` : ''}
          </tr>
        </table>
      </td>
    </tr>`,
    )
    .join('');

  const discountRow =
    order.discount_amount > 0
      ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#27ae60;">Giảm giá</td>
          <td style="padding:6px 0;font-size:13px;color:#27ae60;text-align:right;">− ${formatVND(order.discount_amount)}</td>
        </tr>`
      : '';

  const subtotalRow =
    order.discount_amount > 0
      ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#666;">Tạm tính</td>
          <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;">${formatVND(order.subtotal)}</td>
        </tr>`
      : '';

  const voucherRow = order.voucher_code
    ? `<tr>
        <td style="padding:4px 0;font-size:13px;color:#888;">Mã voucher</td>
        <td style="padding:4px 0;font-size:13px;color:#27ae60;font-weight:600;">${order.voucher_code}</td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Biên nhận ${order.order_code} — Konnit</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
<tr><td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0"
  style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr>
    <td style="background:#c0392b;padding:36px 40px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Thể thao cho bé</p>
      <h1 style="margin:8px 0 0;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;">KONNIT</h1>
    </td>
  </tr>

  <!-- ORDER CODE -->
  <tr>
    <td style="padding:28px 40px 0;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:2px;color:#aaaaaa;text-transform:uppercase;">Biên nhận thanh toán</p>
      <h2 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#c0392b;letter-spacing:1px;">${order.order_code}</h2>
      <p style="margin:8px 0 0;font-size:13px;color:#888888;">${dateStr}</p>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:24px 40px;">
    <hr style="border:none;border-top:1px solid #eeeeee;margin:0;"/>
  </td></tr>

  <!-- CUSTOMER INFO -->
  <tr>
    <td style="padding:0 40px 24px;">
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#888888;letter-spacing:1.5px;text-transform:uppercase;">Thông tin người đặt</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#aaaaaa;width:130px;">Họ và tên</td>
          <td style="padding:4px 0;font-size:13px;color:#333333;font-weight:600;">${order.contact_name}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#aaaaaa;">Số điện thoại</td>
          <td style="padding:4px 0;font-size:13px;color:#333333;">${order.contact_phone}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#aaaaaa;">Email</td>
          <td style="padding:4px 0;font-size:13px;color:#333333;">${order.contact_email}</td>
        </tr>
        ${voucherRow}
      </table>
    </td>
  </tr>

  <!-- ITEMS -->
  <tr>
    <td style="padding:0 40px 24px;">
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#888888;letter-spacing:1.5px;text-transform:uppercase;">Vé đã đặt (${order.items.length} vé)</p>
      <table width="100%" cellpadding="0" cellspacing="0"
        style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;">
        <tbody>${itemRows}</tbody>
      </table>
      <p style="margin:10px 0 0;font-size:11px;color:#aaaaaa;text-align:center;">
        Quét mã QR khi làm thủ tục check-in tại sự kiện.
      </p>
    </td>
  </tr>

  <!-- TOTALS -->
  <tr>
    <td style="padding:0 40px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${subtotalRow}
        ${discountRow}
        <tr>
          <td colspan="2" style="padding-top:12px;">
            <hr style="border:none;border-top:2px solid #eeeeee;margin:0 0 12px;"/>
          </td>
        </tr>
        <tr>
          <td style="font-size:16px;font-weight:900;color:#333333;">Tổng cộng</td>
          <td style="font-size:20px;font-weight:900;color:#c0392b;text-align:right;">${formatVND(order.total)}</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="padding:0 40px 40px;text-align:center;">
      <p style="margin:0 0 18px;font-size:13px;color:#999999;">
        Bạn có thể xem lại biên nhận này bất kỳ lúc nào bằng mã đơn <strong style="color:#c0392b;">${order.order_code}</strong>
      </p>
      <a href="${receiptUrl}"
        style="display:inline-block;background:#c0392b;color:#ffffff;text-decoration:none;
               padding:14px 36px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
        Xem biên nhận trực tuyến
      </a>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
      <p style="margin:0;font-size:13px;color:#999999;">
        Cảm ơn bạn đã tin tưởng và đồng hành cùng <strong style="color:#333333;">Konnit</strong> 🏃
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#cccccc;">
        Email này được gửi tự động. Vui lòng không trả lời.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
