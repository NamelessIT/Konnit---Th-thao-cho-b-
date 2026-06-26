import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { createEventSchema, updateEventSchema } from './events.validation';
import * as ctrl from './events.controller';

export const eventsRoutes = Router();

eventsRoutes.use(requireAuth);

eventsRoutes.get('/', asyncHandler(ctrl.list));
eventsRoutes.get('/:id', asyncHandler(ctrl.getById));
eventsRoutes.post('/', requireRole('admin', 'editor'), validate(createEventSchema), asyncHandler(ctrl.create));
eventsRoutes.patch('/:id', requireRole('admin', 'editor'), validate(updateEventSchema), asyncHandler(ctrl.update));
eventsRoutes.delete('/:id', requireRole('admin'), asyncHandler(ctrl.remove));
eventsRoutes.post('/:id/publish', requireRole('admin', 'editor'), asyncHandler(ctrl.publish));
