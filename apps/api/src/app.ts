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
import { publicAuthRoutes } from './modules/public-auth/routes';
import { userOrdersRoutes } from './modules/user-orders/user-orders.routes';
import { checkinRoutes } from './modules/checkin/checkin.routes';
import { accessRoutes } from './modules/access/access.routes';
import { reportsRoutes } from './modules/reports/reports.routes';
import { userRefundRoutes, adminRefundRoutes } from './modules/refunds/refunds.routes';
import { settingsRoutes } from './modules/settings/settings.routes';
import { languagesRoutes } from './modules/languages/languages.routes';
import { translationsRoutes } from './modules/translations/translations.routes';
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
app.use('/api/public/cms', publicCmsRoutes);
// Phase 1 — admin
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/cms', cmsRoutes);
app.use('/api/user/orders', userOrdersRoutes);
app.use('/api/user/orders', userRefundRoutes);
app.use('/api/admin/uploads', uploadRoutes);
app.use('/api/admin/tickets', checkinRoutes);
app.use('/api/admin/access', accessRoutes);

// Phase 2 — commerce
app.use('/api/admin/events', eventsRoutes);
app.use('/api/admin/ticket-types', ticketTypesRoutes);
app.use('/api/admin/vouchers', vouchersRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/orders', adminRefundRoutes);
app.use('/api/public/auth', publicAuthRoutes);
app.use('/api/public', publicShopRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/languages', languagesRoutes);
app.use('/api/admin/translations', translationsRoutes);

// Error handler (must be last)
app.use(errorHandler);
