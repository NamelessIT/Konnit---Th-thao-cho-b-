import { Request, Response } from 'express';
import * as service from './refunds.service';

// ===== User =====
export async function requestRefund(req: Request, res: Response) {
  const userId = req.session.publicUser!.id;
  const data = await service.requestRefund(String(req.params.code), userId, req.body.reason);
  res.status(201).json({ success: true, data });
}

// ===== Admin =====
export async function rejectRefund(req: Request, res: Response) {
  const adminId = req.session.user!.id;
  const data = await service.rejectRefund(String(req.params.code), adminId, req.body.reason);
  res.json({ success: true, data });
}

export async function approveRefund(req: Request, res: Response) {
  const adminId = req.session.user!.id;
  const data = await service.approveRefund(String(req.params.code), adminId);
  res.json({ success: true, data });
}

export async function startRefund(req: Request, res: Response) {
  const adminId = req.session.user!.id;
  const data = await service.startRefund(String(req.params.code), adminId, req.body.reason);
  res.json({ success: true, data });
}

export async function completeRefund(req: Request, res: Response) {
  const adminId = req.session.user!.id;
  const data = await service.completeRefund(String(req.params.code), adminId);
  res.json({ success: true, data });
}
