import { Request, Response } from 'express';
import * as service from './orders.service';

export async function createPublic(req: Request, res: Response) {
  const userId = req.session.publicUser?.id ?? null;
  const data = await service.createOrder({ ...req.body, userId });
  res.status(201).json({ success: true, data });
}

export async function getPublic(req: Request, res: Response) {
  const data = await service.getOrderByCode(
    String(req.params.code),
    req.query.email ? String(req.query.email) : undefined,
  );
  if (!data) {
    res.status(404).json({
      success: false,
      error: { code: 'ORDER_NOT_FOUND', message: 'Đơn hàng không tồn tại' },
    });
    return;
  }
  res.json({ success: true, data });
}

export async function payPublic(req: Request, res: Response) {
  const method = req.body.method === 'card' || req.body.method === 'bank' ? req.body.method : 'qr';
  const data = await service.payOrder(String(req.params.code), method);
  res.json({ success: true, data });
}

export async function listAdmin(_req: Request, res: Response) {
  res.json({ success: true, data: await service.listAdminOrders() });
}

export async function cancelAdmin(req: Request, res: Response) {
  const adminId = req.session.user!.id;
  const data = await service.cancelOrder(String(req.params.code), adminId);
  res.json({ success: true, data });
}
