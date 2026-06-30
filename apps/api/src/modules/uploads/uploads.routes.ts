import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../auth/auth.middleware';
import { requirePermission } from '../auth/access.middleware';
import { upload } from './uploads.service';
import * as ctrl from './uploads.controller';

export const uploadRoutes = Router();

uploadRoutes.use(requireAuth);

uploadRoutes.post('/', requirePermission('cms.write'), upload.single('file'), asyncHandler(ctrl.uploadFile));
uploadRoutes.get('/', requirePermission('cms.read'), asyncHandler(ctrl.list));
uploadRoutes.delete('/:id', requirePermission('cms.delete'), asyncHandler(ctrl.remove));
