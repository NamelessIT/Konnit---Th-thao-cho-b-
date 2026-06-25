import { Request, Response } from 'express';
import * as service from './categories.service';

export async function list(_req: Request, res: Response) {
  const categories = await service.list();
  res.json({ success: true, data: categories });
}

export async function getById(req: Request, res: Response) {
  const category = await service.getById(Number(req.params.id));
  res.json({ success: true, data: category });
}

export async function create(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const category = await service.create(req.body, userId);
  res.status(201).json({ success: true, data: category });
}

export async function update(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const category = await service.update(Number(req.params.id), req.body, userId);
  res.json({ success: true, data: category });
}

export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.json({ success: true, data: null });
}

export async function publish(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const category = await service.publishCategory(Number(req.params.id), userId);
  res.json({ success: true, data: category });
}

export async function reorder(req: Request, res: Response) {
  await service.reorderCategories(req.body);
  res.json({ success: true, data: null });
}
