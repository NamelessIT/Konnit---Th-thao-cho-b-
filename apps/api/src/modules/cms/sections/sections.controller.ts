import { Request, Response } from 'express';
import * as service from './sections.service';

export async function listByPage(req: Request, res: Response) {
  const sections = await service.listByPage(Number(req.params.pageId));
  res.json({ success: true, data: sections });
}

export async function getById(req: Request, res: Response) {
  const section = await service.getById(Number(req.params.id));
  res.json({ success: true, data: section });
}

export async function create(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const section = await service.create(Number(req.params.pageId), req.body, userId);
  res.status(201).json({ success: true, data: section });
}

export async function update(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const section = await service.update(Number(req.params.id), req.body, userId);
  res.json({ success: true, data: section });
}

export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.json({ success: true, data: null });
}

export async function duplicate(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const section = await service.duplicate(Number(req.params.id), userId);
  res.status(201).json({ success: true, data: section });
}

export async function toggleVisible(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const section = await service.toggleVisible(Number(req.params.id), userId);
  res.json({ success: true, data: section });
}

export async function reorder(req: Request, res: Response) {
  await service.reorderSections(req.body);
  res.json({ success: true, data: null });
}
