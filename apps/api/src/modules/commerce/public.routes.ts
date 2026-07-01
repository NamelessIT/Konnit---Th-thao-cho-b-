import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { publicReadLimiter } from '../../middleware/rateLimit';
import * as eventsCtrl from '../events/events.controller';
import * as ticketsCtrl from '../tickets/tickets.controller';
import * as vouchersCtrl from '../vouchers/vouchers.controller';
import * as ordersCtrl from '../orders/orders.controller';
import * as settingsCtrl from '../settings/settings.controller';
import { validateVoucherSchema } from '../vouchers/vouchers.validation';

/** Public storefront read endpoints (events, ticket types, voucher validate). */
export const publicShopRoutes = Router();

publicShopRoutes.use(publicReadLimiter);

publicShopRoutes.get('/events/:slug', asyncHandler(eventsCtrl.getPublicBySlug));
publicShopRoutes.get('/ticket-types', asyncHandler(ticketsCtrl.listPublic));
publicShopRoutes.get('/ticket-types/:id', asyncHandler(ticketsCtrl.getPublic));
publicShopRoutes.post('/vouchers/validate', validate(validateVoucherSchema), asyncHandler(vouchersCtrl.validatePublic));
publicShopRoutes.post('/orders', asyncHandler(ordersCtrl.createPublic));
publicShopRoutes.get('/orders/:code', asyncHandler(ordersCtrl.getPublic));
publicShopRoutes.post('/orders/:code/pay', asyncHandler(ordersCtrl.payPublic));
publicShopRoutes.get('/settings/payment', asyncHandler(settingsCtrl.getPublicPayment));
publicShopRoutes.get('/settings/logo', asyncHandler(settingsCtrl.getLogoSettings));
publicShopRoutes.get('/tickets/qr/:token', asyncHandler(ticketsCtrl.getQrImage));
