import { Request, Response } from 'express';
import QRCode from 'qrcode';
import * as service from './tickets.service';
import { resolveLocale } from '../../services/i18n';

// ===== Public =====
export async function listPublic(req: Request, res: Response) {
  const locale = await resolveLocale(req.query.locale);
  res.json({ success: true, data: await service.listPublic(locale) });
}

/** Public — trả về ảnh PNG mã QR của vé (dùng trên trang biên nhận). */
export async function getQrImage(req: Request, res: Response) {
  const token = String(req.params.token);
  if (!token || token.length < 10) {
    res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token không hợp lệ' } });
    return;
  }
  const png = await QRCode.toBuffer(token, { width: 240, margin: 1, color: { dark: '#1a1a1a', light: '#ffffff' } });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // QR token bất biến
  res.send(png);
}

export async function getPublic(req: Request, res: Response) {
  const locale = await resolveLocale(req.query.locale);
  res.json({ success: true, data: await service.getPublicById(Number(req.params.id), locale) });
}

// ===== Admin =====
export async function list(req: Request, res: Response) {
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
  res.json({ success: true, data: await service.listAdmin(eventId) });
}

export async function getById(req: Request, res: Response) {
  res.json({ success: true, data: await service.getById(Number(req.params.id)) });
}

export async function create(req: Request, res: Response) {
  const data = await service.create(req.body, req.session.user!.id);
  res.status(201).json({ success: true, data });
}

export async function update(req: Request, res: Response) {
  const data = await service.update(Number(req.params.id), req.body, req.session.user!.id);
  res.json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.json({ success: true, data: null });
}
