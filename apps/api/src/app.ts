import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { sessionMiddleware } from './config/session';
import { errorHandler } from './middleware/errorHandler';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { cmsRoutes } from './modules/cms/cms.routes';
import { publicCmsRoutes } from './modules/cms/public/public-cms.routes';
import { uploadRoutes } from './modules/uploads/uploads.routes';

export const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGINS.split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));
app.use(sessionMiddleware);

// Allow uploaded media to be embedded cross-origin (web runs on a different port).
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static('uploads'),
);

// Routes
app.use('/api', healthRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/cms', cmsRoutes);
app.use('/api/public/cms', publicCmsRoutes);
app.use('/api/admin/uploads', uploadRoutes);

// Error handler (must be last)
app.use(errorHandler);
