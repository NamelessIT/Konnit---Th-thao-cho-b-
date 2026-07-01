import { Request, Response } from 'express';
import * as service from './languages.service';

// ===== Admin =====
export async function list(_req: Request, res: Response) {
  res.json({ success: true, data: await service.listAdmin() });
}

export async function create(req: Request, res: Response) {
  const data = await service.create(req.body);
  res.status(201).json({ success: true, data });
}

export async function update(req: Request, res: Response) {
  const data = await service.update(Number(req.params.id), req.body);
  res.json({ success: true, data });
}

export async function setDefault(req: Request, res: Response) {
  const data = await service.setDefault(Number(req.params.id));
  res.json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.json({ success: true, data: null });
}

// ===== Public =====
export async function listPublic(_req: Request, res: Response) {
  const langs = await service.listActive();
  res.json({
    success: true,
    data: langs.map((l) => ({
      code: l.code,
      name: l.name,
      native_name: l.native_name,
      is_default: l.is_default,
      sort_order: l.sort_order,
    })),
  });
}
