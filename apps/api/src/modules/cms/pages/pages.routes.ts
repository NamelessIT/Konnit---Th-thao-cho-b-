import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../auth/access.middleware';
import { createPageSchema, updatePageSchema } from './pages.validation';
import * as ctrl from './pages.controller';

export const pagesRoutes = Router();

pagesRoutes.use(requireAuth);

pagesRoutes.get('/', requirePermission('cms.read'), asyncHandler(ctrl.list));
pagesRoutes.get('/:id', requirePermission('cms.read'), asyncHandler(ctrl.getById));
pagesRoutes.get('/:id/full', requirePermission('cms.read'), asyncHandler(ctrl.getWithSections));
pagesRoutes.post('/', requirePermission('cms.write'), validate(createPageSchema), asyncHandler(ctrl.create));
pagesRoutes.patch('/:id', requirePermission('cms.write'), validate(updatePageSchema), asyncHandler(ctrl.update));
pagesRoutes.delete('/:id', requirePermission('cms.delete'), asyncHandler(ctrl.remove));
pagesRoutes.post('/:id/publish', requirePermission('cms.publish'), asyncHandler(ctrl.publish));
