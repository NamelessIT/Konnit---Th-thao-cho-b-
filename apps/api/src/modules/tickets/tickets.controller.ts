import { Request, Response } from 'express';
import * as service from './tickets.service';

// ===== Public =====
export async function listPublic(_req: Request, res: Response) {
  res.json({ success: true, data: await service.listPublic() });
}

export async function getPublic(req: Request, res: Response) {
  res.json({ success: true, data: await service.getPublicById(Number(req.params.id)) });
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
