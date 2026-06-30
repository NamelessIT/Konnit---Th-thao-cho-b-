import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { loginLimiter } from '../../middleware/rateLimit';
import { googleLoginSchema } from './validation';
import * as controller from './controller';

export const publicAuthRoutes = Router();

publicAuthRoutes.post(
  '/google',
  loginLimiter,
  validate(googleLoginSchema),
  asyncHandler(controller.google),
);
publicAuthRoutes.get('/me', asyncHandler(controller.me));
publicAuthRoutes.post('/logout', asyncHandler(controller.logout));
