import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../auth/auth.middleware';
import { requirePermission } from '../auth/access.middleware';
import { upsertTranslationsSchema } from './translations.validation';
import * as ctrl from './translations.controller';

// File dịch nhỏ → giữ trong memory rồi parse (xlsx/json).
const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const translationsRoutes = Router();

translationsRoutes.use(requireAuth);

translationsRoutes.get('/modules', requirePermission('translations.read'), asyncHandler(ctrl.modules));
translationsRoutes.get('/export', requirePermission('translations.read'), asyncHandler(ctrl.exportFile));
translationsRoutes.get('/', requirePermission('translations.read'), asyncHandler(ctrl.list));
translationsRoutes.put('/', requirePermission('translations.write'), validate(upsertTranslationsSchema), asyncHandler(ctrl.upsert));
translationsRoutes.post('/import', requirePermission('translations.import'), importUpload.single('file'), asyncHandler(ctrl.importFile));
