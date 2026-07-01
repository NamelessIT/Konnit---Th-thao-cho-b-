import { Request, Response } from 'express';
import * as service from './settings.service';

/** Admin — đọc cấu hình chuyển khoản (đầy đủ). */
export async function getPayment(_req: Request, res: Response) {
  res.json({ success: true, data: await service.getBankTransfer() });
}

/** Admin — cập nhật cấu hình chuyển khoản. */
export async function updatePayment(req: Request, res: Response) {
  const adminId = req.session.user!.id;
  const data = await service.updateBankTransfer(req.body ?? {}, adminId);
  res.json({ success: true, data });
}

/** Public — chỉ trả field an toàn để hiển thị ở bước thanh toán. */
export async function getPublicPayment(_req: Request, res: Response) {
  const cfg = await service.getBankTransfer();
  res.json({
    success: true,
    data: {
      qrImagePath: cfg.qrImagePath,
      accountName: cfg.accountName,
      accountNumber: cfg.accountNumber,
      bankName: cfg.bankName,
      note: cfg.note,
    },
  });
}

/** Admin — đọc cấu hình SMTP (pass bị mask). */
export async function getSmtpSettings(_req: Request, res: Response) {
  const cfg = await service.getSmtp();
  res.json({ success: true, data: { ...cfg, pass: cfg.pass ? '••••••' : '' } });
}

/** Admin — cập nhật cấu hình SMTP.
 *  Nếu client gửi lại sentinel '••••••' thì giữ nguyên mật khẩu cũ.
 */
export async function updateSmtpSettings(req: Request, res: Response) {
  const adminId = req.session.user!.id;
  const body: Partial<service.SmtpSettings> = req.body ?? {};
  if (body.pass === '••••••') {
    const existing = await service.getSmtp();
    body.pass = existing.pass;
  }
  const data = await service.updateSmtp(body, adminId);
  res.json({ success: true, data: { ...data, pass: data.pass ? '••••••' : '' } });
}
