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
} as const;
