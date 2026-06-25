import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { requireAuth } from '../../auth/auth.middleware';
import * as ctrl from './stats.controller';

export const statsRoutes = Router();

statsRoutes.use(requireAuth);

statsRoutes.get('/', asyncHandler(ctrl.getStats));
