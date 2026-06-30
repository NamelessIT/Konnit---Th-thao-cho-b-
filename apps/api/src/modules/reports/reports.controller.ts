import { Request, Response } from 'express';
import * as service from './reports.service';

function parseEventId(req: Request): number | null {
  const raw = req.query.eventId;
  if (raw === undefined || raw === '' || raw === 'all') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function overview(req: Request, res: Response) {
  res.json({ success: true, data: await service.overview(parseEventId(req)) });
}

export async function checkinList(req: Request, res: Response) {
  res.json({ success: true, data: await service.checkinList(parseEventId(req)) });
}