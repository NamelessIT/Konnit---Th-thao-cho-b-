import { Request, Response } from 'express';
import * as service from './uploads.service';
import { AppError } from '../../middleware/errorHandler';

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) throw new AppError(400, 'NO_FILE', 'Không có file nào được upload');
  const userId = req.session.user!.id;
  const record = await service.saveRecord(req.file, userId);
  res.status(201).json({
    success: true,
    data: { id: record.id, url: `/${record.path}` },
  });
}

export async function list(_req: Request, res: Response) {
  const files = await service.findAll();
  res.json({ success: true, data: files });
}

export async function remove(req: Request, res: Response) {
  await service.softDelete(Number(req.params.id));
  res.json({ success: true, data: null });
}
