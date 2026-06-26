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
import { eventsRoutes } from './modules/events/events.routes';
import { ticketTypesRoutes } from './modules/tickets/tickets.routes';
import { vouchersRoutes } from './modules/vouchers/vouchers.routes';
import { ordersRoutes } from './modules/orders/orders.routes';
import { publicShopRoutes } from './modules/commerce/public.routes';

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

// Phase 2 — commerce
app.use('/api/admin/events', eventsRoutes);
app.use('/api/admin/ticket-types', ticketTypesRoutes);
app.use('/api/admin/vouchers', vouchersRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/public', publicShopRoutes);

// Error handler (must be last)
app.use(errorHandler);
