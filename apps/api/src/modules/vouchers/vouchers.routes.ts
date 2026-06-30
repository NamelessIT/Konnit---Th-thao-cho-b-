import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../auth/auth.middleware';
import { requirePermission } from '../auth/access.middleware';
import { createVoucherSchema, updateVoucherSchema } from './vouchers.validation';
import * as ctrl from './vouchers.controller';

export const vouchersRoutes = Router();

vouchersRoutes.use(requireAuth);

vouchersRoutes.get('/', requirePermission('vouchers.read'), asyncHandler(ctrl.list));
vouchersRoutes.get('/:id', requirePermission('vouchers.read'), asyncHandler(ctrl.getById));
vouchersRoutes.post('/', requirePermission('vouchers.write'), validate(createVoucherSchema), asyncHandler(ctrl.create));
vouchersRoutes.patch('/:id', requirePermission('vouchers.write'), validate(updateVoucherSchema), asyncHandler(ctrl.update));
vouchersRoutes.delete('/:id', requirePermission('vouchers.delete'), asyncHandler(ctrl.remove));
