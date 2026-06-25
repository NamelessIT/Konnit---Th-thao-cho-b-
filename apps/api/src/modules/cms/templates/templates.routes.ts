import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { requireAuth } from '../../auth/auth.middleware';
import * as repo from './templates.repository';

export const templatesRoutes = Router();

templatesRoutes.use(requireAuth);

templatesRoutes.get('/', asyncHandler(async (_req, res) => {
  const data = await repo.findTemplatesWithStyles();
  res.json({ success: true, data });
}));
