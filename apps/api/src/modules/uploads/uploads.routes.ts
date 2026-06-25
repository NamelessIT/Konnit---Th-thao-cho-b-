import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { upload } from './uploads.service';
import * as ctrl from './uploads.controller';

export const uploadRoutes = Router();

uploadRoutes.use(requireAuth);

uploadRoutes.post('/', requireRole('admin', 'editor'), upload.single('file'), asyncHandler(ctrl.uploadFile));
uploadRoutes.get('/', asyncHandler(ctrl.list));
uploadRoutes.delete('/:id', requireRole('admin'), asyncHandler(ctrl.remove));
