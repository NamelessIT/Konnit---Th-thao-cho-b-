import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAdminAuth, requirePermission } from '../auth/access.middleware';
import { checkinSchema } from './checkin.validation';
import * as ctrl from './checkin.controller';

export const checkinRoutes = Router();

checkinRoutes.use(requireAdminAuth);
checkinRoutes.post(
  '/checkin',
  requirePermission('tickets.checkin'),
  validate(checkinSchema),
  asyncHandler(ctrl.checkin),
);