import { Request, Response } from 'express';
import * as service from './vouchers.service';

// ===== Public =====
export async function validatePublic(req: Request, res: Response) {
  const data = await service.validateForSubtotal(req.body.code, req.body.subtotal);
  res.json({ success: true, data });
}

// ===== Admin =====
export async function list(_req: Request, res: Response) {
  res.json({ success: true, data: await service.list() });
}

export async function getById(req: Request, res: Response) {
  res.json({ success: true, data: await service.getById(Number(req.params.id)) });
}

export async function create(req: Request, res: Response) {
  const data = await service.create(req.body, req.session.user!.id);
  res.status(201).json({ success: true, data });
}

export async function update(req: Request, res: Response) {
  const data = await service.update(Number(req.params.id), req.body);
  res.json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.json({ success: true, data: null });
}
