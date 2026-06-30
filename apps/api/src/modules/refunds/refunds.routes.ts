import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import {
  requireAdminAuth,
  requireUserAuth,
  requirePermission,
  requireOwnedOrder,
} from '../auth/access.middleware';
import * as v from './refunds.validation';
import * as ctrl from './refunds.controller';

// ===== User: gửi yêu cầu hoàn (mount tại /api/user/orders) =====
export const userRefundRoutes = Router();
userRefundRoutes.post(
  '/:code/refund-request',
  requireUserAuth,
  requirePermission('orders.request_refund', 'public'),
  requireOwnedOrder,
  validate(v.requestRefundSchema),
  asyncHandler(ctrl.requestRefund),
);

// ===== Admin: duyệt/từ chối/bắt đầu/hoàn tất (mount tại /api/admin/orders) =====
export const adminRefundRoutes = Router();
adminRefundRoutes.use(requireAdminAuth, requirePermission('orders.manage_refunds'));
adminRefundRoutes.post('/:code/refund/reject', validate(v.rejectRefundSchema), asyncHandler(ctrl.rejectRefund));
adminRefundRoutes.post('/:code/refund/approve', validate(v.approveRefundSchema), asyncHandler(ctrl.approveRefund));
adminRefundRoutes.post('/:code/refund/start', validate(v.startRefundSchema), asyncHandler(ctrl.startRefund));
adminRefundRoutes.post('/:code/refund/complete', validate(v.completeRefundSchema), asyncHandler(ctrl.completeRefund));
