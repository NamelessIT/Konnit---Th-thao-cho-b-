import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { requireAuth } from '../../auth/auth.middleware';
import { requirePermission } from '../../auth/access.middleware';
import {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
} from './sections.validation';
import * as ctrl from './sections.controller';

export const sectionsRoutes = Router({ mergeParams: true });

sectionsRoutes.use(requireAuth);

sectionsRoutes.get('/pages/:pageId/sections', requirePermission('cms.read'), asyncHandler(ctrl.listByPage));
sectionsRoutes.post('/pages/:pageId/sections', requirePermission('cms.write'), validate(createSectionSchema), asyncHandler(ctrl.create));
sectionsRoutes.put('/sections/reorder', requirePermission('cms.write'), validate(reorderSectionsSchema), asyncHandler(ctrl.reorder));
sectionsRoutes.get('/sections/:id', requirePermission('cms.read'), asyncHandler(ctrl.getById));
sectionsRoutes.patch('/sections/:id', requirePermission('cms.write'), validate(updateSectionSchema), asyncHandler(ctrl.update));
sectionsRoutes.delete('/sections/:id', requirePermission('cms.delete'), asyncHandler(ctrl.remove));
sectionsRoutes.post('/sections/:id/duplicate', requirePermission('cms.write'), asyncHandler(ctrl.duplicate));
sectionsRoutes.post('/sections/:id/toggle-visible', requirePermission('cms.write'), asyncHandler(ctrl.toggleVisible));
