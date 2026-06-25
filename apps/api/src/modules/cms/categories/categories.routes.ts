import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { requireAuth, requireRole } from '../../auth/auth.middleware';
import { createCategorySchema, updateCategorySchema, reorderSchema } from './categories.validation';
import * as ctrl from './categories.controller';

export const categoriesRoutes = Router();

categoriesRoutes.use(requireAuth);

categoriesRoutes.get('/', asyncHandler(ctrl.list));
categoriesRoutes.get('/:id', asyncHandler(ctrl.getById));
categoriesRoutes.post('/', requireRole('admin', 'editor'), validate(createCategorySchema), asyncHandler(ctrl.create));
categoriesRoutes.patch('/:id', requireRole('admin', 'editor'), validate(updateCategorySchema), asyncHandler(ctrl.update));
categoriesRoutes.delete('/:id', requireRole('admin'), asyncHandler(ctrl.remove));
categoriesRoutes.post('/:id/publish', requireRole('admin', 'editor'), asyncHandler(ctrl.publish));
categoriesRoutes.put('/reorder', requireRole('admin', 'editor'), validate(reorderSchema), asyncHandler(ctrl.reorder));
