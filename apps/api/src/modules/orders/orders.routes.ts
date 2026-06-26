import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import * as ctrl from './orders.controller';

export const ordersRoutes = Router();

ordersRoutes.use(requireAuth);

ordersRoutes.get('/', requireRole('admin', 'editor', 'viewer', 'staff'), asyncHandler(ctrl.listAdmin));
