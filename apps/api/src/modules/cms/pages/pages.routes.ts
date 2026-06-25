import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { requireAuth, requireRole } from '../../auth/auth.middleware';
import { createPageSchema, updatePageSchema } from './pages.validation';
import * as ctrl from './pages.controller';

export const pagesRoutes = Router();

pagesRoutes.use(requireAuth);

pagesRoutes.get('/', asyncHandler(ctrl.list));
pagesRoutes.get('/:id', asyncHandler(ctrl.getById));
pagesRoutes.get('/:id/full', asyncHandler(ctrl.getWithSections));
pagesRoutes.post('/', requireRole('admin', 'editor'), validate(createPageSchema), asyncHandler(ctrl.create));
pagesRoutes.patch('/:id', requireRole('admin', 'editor'), validate(updatePageSchema), asyncHandler(ctrl.update));
pagesRoutes.delete('/:id', requireRole('admin'), asyncHandler(ctrl.remove));
pagesRoutes.post('/:id/publish', requireRole('admin', 'editor'), asyncHandler(ctrl.publish));
