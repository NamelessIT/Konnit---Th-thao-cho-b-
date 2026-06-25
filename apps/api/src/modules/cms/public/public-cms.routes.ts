import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { publicReadLimiter } from '../../../middleware/rateLimit';
import * as ctrl from './public-cms.controller';

export const publicCmsRoutes = Router();

publicCmsRoutes.use(publicReadLimiter);

publicCmsRoutes.get('/categories', asyncHandler(ctrl.listCategories));
publicCmsRoutes.get('/categories/:slug', asyncHandler(ctrl.getCategoryWithPages));
publicCmsRoutes.get('/pages/:categorySlug/:pageSlug', asyncHandler(ctrl.getPageWithSections));
