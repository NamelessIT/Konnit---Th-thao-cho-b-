import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../auth/auth.middleware';
import { requirePermission } from '../auth/access.middleware';
import { createTicketTypeSchema, updateTicketTypeSchema } from './tickets.validation';
import * as ctrl from './tickets.controller';

export const ticketTypesRoutes = Router();

ticketTypesRoutes.use(requireAuth);

ticketTypesRoutes.get('/', requirePermission('ticket_types.read'), asyncHandler(ctrl.list));
ticketTypesRoutes.get('/:id', requirePermission('ticket_types.read'), asyncHandler(ctrl.getById));
ticketTypesRoutes.post('/', requirePermission('ticket_types.write'), validate(createTicketTypeSchema), asyncHandler(ctrl.create));
ticketTypesRoutes.patch('/:id', requirePermission('ticket_types.write'), validate(updateTicketTypeSchema), asyncHandler(ctrl.update));
ticketTypesRoutes.delete('/:id', requirePermission('ticket_types.delete'), asyncHandler(ctrl.remove));
