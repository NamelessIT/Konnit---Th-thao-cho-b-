import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../auth/auth.middleware';
import { createEventSchema, updateEventSchema } from './events.validation';
import { requirePermission } from '../auth/access.middleware';
import * as ctrl from './events.controller';

export const eventsRoutes = Router();

eventsRoutes.use(requireAuth);

eventsRoutes.get('/', requirePermission('events.read'), asyncHandler(ctrl.list));
eventsRoutes.get('/:id', requirePermission('events.read'), asyncHandler(ctrl.getById));
eventsRoutes.post('/', requirePermission('events.write'), validate(createEventSchema), asyncHandler(ctrl.create));
eventsRoutes.patch('/:id', requirePermission('events.write'), validate(updateEventSchema), asyncHandler(ctrl.update));
eventsRoutes.delete('/:id', requirePermission('events.delete'), asyncHandler(ctrl.remove));
eventsRoutes.post('/:id/publish', requirePermission('events.publish'), asyncHandler(ctrl.publish));
