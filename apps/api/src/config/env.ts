import 'dotenv/config';

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT_API: parseInt(process.env.PORT_API || '4000', 10),
  DATABASE_URL: required('DATABASE_URL'),
  SESSION_SECRET: required('SESSION_SECRET'),
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000',
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL || 'admin@konnit.local',
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD || 'Admin@123456',
  ADMIN_SEED_NAME: process.env.ADMIN_SEED_NAME || 'Konnit Admin',

  // Public web base URL (for redirect/return links)
  PUBLIC_WEB_URL: process.env.PUBLIC_WEB_URL || 'http://localhost:3000',

  // Order hold (slot reservation) window in minutes
  ORDER_HOLD_MINUTES: parseInt(process.env.ORDER_HOLD_MINUTES || '15', 10),
  REDIS_URL: process.env.REDIS_URL || '',
  PUBLIC_TICKETS_CACHE_TTL_SECONDS: parseInt(
    process.env.PUBLIC_TICKETS_CACHE_TTL_SECONDS || '30',
    10,
  ),

  // VNPay sandbox (https://sandbox.vnpayment.vn/apis/)
  VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE || '',
  VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET || '',
  VNPAY_URL:
    process.env.VNPAY_URL ||
    'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  VNPAY_RETURN_URL:
    process.env.VNPAY_RETURN_URL ||
    'http://localhost:4000/api/public/payments/vnpay/return',
  VNPAY_IPN_URL:
    process.env.VNPAY_IPN_URL ||
    'http://localhost:4000/api/public/payments/vnpay/ipn',

  // Email (dev: leave SMTP_HOST empty to use Ethereal/console transport)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  MAIL_FROM: process.env.MAIL_FROM || 'Konnit <noreply@konnit.local>',
} as const;
