import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../auth/auth.middleware';
import { requirePermission } from '../auth/access.middleware';
import { createLanguageSchema, updateLanguageSchema } from './languages.validation';
import * as ctrl from './languages.controller';

export const languagesRoutes = Router();

languagesRoutes.use(requireAuth);

languagesRoutes.get('/', requirePermission('languages.read'), asyncHandler(ctrl.list));
languagesRoutes.post('/', requirePermission('languages.write'), validate(createLanguageSchema), asyncHandler(ctrl.create));
languagesRoutes.patch('/:id', requirePermission('languages.write'), validate(updateLanguageSchema), asyncHandler(ctrl.update));
languagesRoutes.post('/:id/default', requirePermission('languages.write'), asyncHandler(ctrl.setDefault));
languagesRoutes.delete('/:id', requirePermission('languages.write'), asyncHandler(ctrl.remove));
