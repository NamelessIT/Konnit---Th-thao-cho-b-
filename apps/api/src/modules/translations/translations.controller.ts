import { Request, Response } from 'express';
import * as service from './translations.service';
import { AppError } from '../../middleware/errorHandler';

export async function modules(_req: Request, res: Response) {
  res.json({ success: true, data: service.listModules() });
}

export async function list(req: Request, res: Response) {
  const module = String(req.query.module ?? '');
  if (!module) throw new AppError(400, 'MODULE_REQUIRED', 'Thiếu module');
  const entityId = req.query.entity_id ? Number(req.query.entity_id) : undefined;
  const locale = req.query.locale ? String(req.query.locale) : undefined;
  res.json({ success: true, data: await service.get(module, entityId, locale) });
}

export async function upsert(req: Request, res: Response) {
  const data = await service.upsertMany(req.body.entries, req.session.user!.id);
  res.json({ success: true, data });
}

export async function importFile(req: Request, res: Response) {
  if (!req.file) throw new AppError(400, 'FILE_REQUIRED', 'Thiếu file');
  const result = await service.importFile(req.file, req.session.user!.id);
  res.json({ success: true, data: result });
}

export async function exportFile(req: Request, res: Response) {
  const module = req.query.module ? String(req.query.module) : undefined;
  const locale = String(req.query.locale ?? '');
  const format = String(req.query.format ?? 'xlsx') === 'json' ? 'json' : 'xlsx';
  const { buffer, filename, contentType } = await service.exportFile(module, locale, format);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
}
