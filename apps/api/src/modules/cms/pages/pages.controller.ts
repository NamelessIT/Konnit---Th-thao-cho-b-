import { Request, Response } from 'express';
import * as service from './pages.service';

export async function list(req: Request, res: Response) {
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const pages = await service.list(categoryId);
  res.json({ success: true, data: pages });
}

export async function getById(req: Request, res: Response) {
  const page = await service.getById(Number(req.params.id));
  res.json({ success: true, data: page });
}

export async function getWithSections(req: Request, res: Response) {
  const page = await service.getWithSections(Number(req.params.id));
  res.json({ success: true, data: page });
}

export async function create(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const page = await service.create(req.body, userId);
  res.status(201).json({ success: true, data: page });
}

export async function update(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const page = await service.update(Number(req.params.id), req.body, userId);
  res.json({ success: true, data: page });
}

export async function remove(req: Request, res: Response) {
  await service.remove(Number(req.params.id));
  res.json({ success: true, data: null });
}

export async function publish(req: Request, res: Response) {
  const userId = req.session.user!.id;
  const page = await service.publishPage(Number(req.params.id), userId);
  res.json({ success: true, data: page });
}
