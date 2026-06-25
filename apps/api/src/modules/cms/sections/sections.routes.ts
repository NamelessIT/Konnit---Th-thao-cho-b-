import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middleware/validate';
import { requireAuth, requireRole } from '../../auth/auth.middleware';
import {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
} from './sections.validation';
import * as ctrl from './sections.controller';

export const sectionsRoutes = Router({ mergeParams: true });

sectionsRoutes.use(requireAuth);

sectionsRoutes.get('/pages/:pageId/sections', asyncHandler(ctrl.listByPage));
sectionsRoutes.post(
  '/pages/:pageId/sections',
  requireRole('admin', 'editor'),
  validate(createSectionSchema),
  asyncHandler(ctrl.create),
);
sectionsRoutes.put(
  '/sections/reorder',
  requireRole('admin', 'editor'),
  validate(reorderSectionsSchema),
  asyncHandler(ctrl.reorder),
);
sectionsRoutes.get('/sections/:id', asyncHandler(ctrl.getById));
sectionsRoutes.patch(
  '/sections/:id',
  requireRole('admin', 'editor'),
  validate(updateSectionSchema),
  asyncHandler(ctrl.update),
);
sectionsRoutes.delete('/sections/:id', requireRole('admin'), asyncHandler(ctrl.remove));
sectionsRoutes.post(
  '/sections/:id/duplicate',
  requireRole('admin', 'editor'),
  asyncHandler(ctrl.duplicate),
);
sectionsRoutes.post(
  '/sections/:id/toggle-visible',
  requireRole('admin', 'editor'),
  asyncHandler(ctrl.toggleVisible),
);
