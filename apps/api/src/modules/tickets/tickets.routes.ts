import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { createTicketTypeSchema, updateTicketTypeSchema } from './tickets.validation';
import * as ctrl from './tickets.controller';

export const ticketTypesRoutes = Router();

ticketTypesRoutes.use(requireAuth);

ticketTypesRoutes.get('/', asyncHandler(ctrl.list));
ticketTypesRoutes.get('/:id', asyncHandler(ctrl.getById));
ticketTypesRoutes.post('/', requireRole('admin', 'editor'), validate(createTicketTypeSchema), asyncHandler(ctrl.create));
ticketTypesRoutes.patch('/:id', requireRole('admin', 'editor'), validate(updateTicketTypeSchema), asyncHandler(ctrl.update));
ticketTypesRoutes.delete('/:id', requireRole('admin'), asyncHandler(ctrl.remove));
