import { Router } from 'express';
import { categoriesRoutes } from './categories/categories.routes';
import { pagesRoutes } from './pages/pages.routes';
import { sectionsRoutes } from './sections/sections.routes';
import { templatesRoutes } from './templates/templates.routes';
import { statsRoutes } from './stats/stats.routes';

export const cmsRoutes = Router();

cmsRoutes.use('/stats', statsRoutes);
cmsRoutes.use('/categories', categoriesRoutes);
cmsRoutes.use('/pages', pagesRoutes);
cmsRoutes.use('/', sectionsRoutes);
cmsRoutes.use('/templates', templatesRoutes);
