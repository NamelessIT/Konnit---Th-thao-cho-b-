import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../auth/auth.middleware';
import { requirePermission, requireSuperAdmin } from '../auth/access.middleware';
import * as ctrl from './orders.controller';

export const ordersRoutes = Router();

ordersRoutes.use(requireAuth);

ordersRoutes.get('/', requirePermission('orders.read_all'), asyncHandler(ctrl.listAdmin));
// Huỷ đơn — chỉ super admin (chủ hệ thống)
ordersRoutes.post('/:code/cancel', requireSuperAdmin, asyncHandler(ctrl.cancelAdmin));
