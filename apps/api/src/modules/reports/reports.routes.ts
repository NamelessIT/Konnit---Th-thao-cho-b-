import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAdminAuth, requirePermission } from '../auth/access.middleware';
import * as ctrl from './reports.controller';

export const reportsRoutes = Router();

reportsRoutes.use(requireAdminAuth);
reportsRoutes.get('/overview', requirePermission('orders.read_all'), asyncHandler(ctrl.overview));
reportsRoutes.get('/checkin', requirePermission('tickets.checkin'), asyncHandler(ctrl.checkinList));