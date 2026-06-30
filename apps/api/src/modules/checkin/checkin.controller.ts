import { Request, Response } from 'express';
import * as service from './checkin.service';

export async function checkin(req: Request, res: Response) {
  const data = await service.checkInTicket({
    eventId: Number(req.body.eventId),
    qrToken: String(req.body.qrToken),
    adminId: req.session.user!.id,
    ip: req.ip,
    userAgent: req.get('user-agent') ?? undefined,
  });
  res.json({ success: true, data });
}