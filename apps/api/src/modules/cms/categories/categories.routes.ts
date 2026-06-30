import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../auth/access.middleware';
import { createCategorySchema, updateCategorySchema, reorderSchema } from './categories.validation';
import * as ctrl from './categories.controller';

export const categoriesRoutes = Router();

categoriesRoutes.use(requireAuth);

categoriesRoutes.get('/', requirePermission('cms.read'), asyncHandler(ctrl.list));
categoriesRoutes.get('/:id', requirePermission('cms.read'), asyncHandler(ctrl.getById));
categoriesRoutes.post('/', requirePermission('cms.write'), validate(createCategorySchema), asyncHandler(ctrl.create));
categoriesRoutes.patch('/:id', requirePermission('cms.write'), validate(updateCategorySchema), asyncHandler(ctrl.update));
categoriesRoutes.delete('/:id', requirePermission('cms.delete'), asyncHandler(ctrl.remove));
categoriesRoutes.post('/:id/publish', requirePermission('cms.publish'), asyncHandler(ctrl.publish));
categoriesRoutes.put('/reorder', requirePermission('cms.write'), validate(reorderSchema), asyncHandler(ctrl.reorder));
