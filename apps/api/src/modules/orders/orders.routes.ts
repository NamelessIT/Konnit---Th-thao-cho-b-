import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../auth/auth.middleware';
import { requirePermission } from '../auth/access.middleware';
import * as ctrl from './orders.controller';

export const ordersRoutes = Router();

ordersRoutes.use(requireAuth);

ordersRoutes.get('/', requirePermission('orders.read_all'), asyncHandler(ctrl.listAdmin));
ordersRoutes.post(
  '/:code/confirm-payment',
  requirePermission('orders.confirm_payment'),
  asyncHandler(ctrl.confirmPayment),
);
// Huỷ đơn trực tiếp đã được thay bằng refund workflow (modules/refunds). Xem POST /:code/refund/*.
