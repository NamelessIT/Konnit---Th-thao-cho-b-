import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { loginLimiter } from '../../middleware/rateLimit';
import { requireAuth } from './auth.middleware';
import { login, logout, me } from './auth.controller';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes = Router();

authRoutes.post('/login', loginLimiter, validate(loginSchema), asyncHandler(login));
authRoutes.post('/logout', asyncHandler(logout));
authRoutes.get('/me', requireAuth, asyncHandler(me));
