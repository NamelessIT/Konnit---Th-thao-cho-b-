import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { createVoucherSchema, updateVoucherSchema } from './vouchers.validation';
import * as ctrl from './vouchers.controller';

export const vouchersRoutes = Router();

vouchersRoutes.use(requireAuth);

vouchersRoutes.get('/', asyncHandler(ctrl.list));
vouchersRoutes.get('/:id', asyncHandler(ctrl.getById));
vouchersRoutes.post('/', requireRole('admin', 'editor'), validate(createVoucherSchema), asyncHandler(ctrl.create));
vouchersRoutes.patch('/:id', requireRole('admin', 'editor'), validate(updateVoucherSchema), asyncHandler(ctrl.update));
vouchersRoutes.delete('/:id', requireRole('admin'), asyncHandler(ctrl.remove));
