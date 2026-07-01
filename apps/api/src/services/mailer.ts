import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { env } from '../config/env';
import { getSmtp, getLogo } from '../modules/settings/settings.service';
import { buildReceiptHtml, type OrderForReceipt } from './receipt.template';

async function createTransporter(): Promise<{ transporter: nodemailer.Transporter; from: string }> {
  const db = await getSmtp().catch(() => null);

  const useDb = !!(db?.enabled && db.host);
  const host = useDb ? db!.host : env.SMTP_HOST;
  const port = useDb ? db!.port : env.SMTP_PORT;
  const secure = useDb ? db!.secure : false;
  const user = useDb ? db!.user : env.SMTP_USER;
  const pass = useDb ? db!.pass : env.SMTP_PASSWORD;
  const from =
    useDb && db!.fromEmail
      ? `${db!.fromName || 'Konnit'} <${db!.fromEmail}>`
      : env.MAIL_FROM;

  if (!host) {
    // Dev: Ethereal test inbox (no SMTP configured)
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return { transporter, from: `Konnit <${testAccount.user}>` };
  }

  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return { transporter, from };
}

async function sendMail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const { transporter, from } = await createTransporter();
  const info = await transporter.sendMail({ from, ...opts });
  // nodemailer.getTestMessageUrl tồn tại khi dùng Ethereal
  const preview = (nodemailer as unknown as { getTestMessageUrl?: (i: unknown) => string | false }).getTestMessageUrl?.(info);
  if (preview) {
    console.log(`[mailer] Preview: ${preview}`);
  }
}

export async function sendReceiptEmail(order: OrderForReceipt): Promise<void> {
  // Sinh QR data URI (base64 PNG) cho từng vé — embed inline trong email
  const itemsWithQr = await Promise.all(
    order.items.map(async (item) => {
      if (!item.qr_token) return item;
      const qrDataUri = await QRCode.toDataURL(item.qr_token, {
        width: 220,
        margin: 1,
        color: { dark: '#1a1a1a', light: '#ffffff' },
      }).catch(() => undefined);
      return { ...item, qrDataUri };
    }),
  );

  const receiptUrl = `${env.PUBLIC_WEB_URL}/don-hang/${order.order_code}/bien-nhan`;
  const logoUrl = await getLogo().then((s) => s.url).catch(() => null);
  const html = buildReceiptHtml({ ...order, items: itemsWithQr }, receiptUrl, logoUrl);
  await sendMail({
    to: order.contact_email,
    subject: `Biên nhận & Vé check-in đơn ${order.order_code} — Konnit`,
    html,
  });
}
