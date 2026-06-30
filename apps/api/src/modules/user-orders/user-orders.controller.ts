import { Request, Response } from 'express';
import * as service from './user-orders.service';

export async function list(req: Request, res: Response) {
  const userId = req.session.publicUser!.id;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  res.json({ success: true, data: await service.list(userId, { page, limit, status }) });
}

export async function detail(req: Request, res: Response) {
  const userId = req.session.publicUser!.id;
  const data = await service.detail(userId, String(req.params.code));
  if (!data) {
    res.status(404).json({
      success: false,
      error: { code: 'ORDER_NOT_FOUND', message: 'Đơn hàng không tồn tại' },
    });
    return;
  }
  res.json({ success: true, data });
}