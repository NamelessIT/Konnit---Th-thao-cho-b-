import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAdminAuth, requirePermission } from '../auth/access.middleware';
import * as ctrl from './settings.controller';

/** Admin — cấu hình hệ thống (mount tại /api/admin/settings). */
export const settingsRoutes = Router();
settingsRoutes.use(requireAdminAuth);
settingsRoutes.get('/payment', requirePermission('settings.read'), asyncHandler(ctrl.getPayment));
settingsRoutes.put('/payment', requirePermission('settings.write'), asyncHandler(ctrl.updatePayment));
settingsRoutes.get('/smtp', requirePermission('settings.read'), asyncHandler(ctrl.getSmtpSettings));
settingsRoutes.put('/smtp', requirePermission('settings.write'), asyncHandler(ctrl.updateSmtpSettings));
