import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireUserAuth, requirePermission } from '../auth/access.middleware';
import * as ctrl from './user-orders.controller';

export const userOrdersRoutes = Router();

userOrdersRoutes.use(requireUserAuth);
userOrdersRoutes.get('/', requirePermission('orders.read_own', 'public'), asyncHandler(ctrl.list));
userOrdersRoutes.get('/:code', requirePermission('orders.read_own', 'public'), asyncHandler(ctrl.detail));