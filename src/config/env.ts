import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  pocketbaseUrl: string;
  pocketbaseAdminEmail: string;
  pocketbaseAdminPassword: string;
  jwtSecret: string;
  allowedOrigins: string[];
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  pocketbaseUrl: process.env.POCKETBASE_URL || '',
  pocketbaseAdminEmail: process.env.POCKETBASE_ADMIN_EMAIL || '',
  pocketbaseAdminPassword: process.env.POCKETBASE_ADMIN_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || '',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
};

// Validate required environment variables
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

if (!config.pocketbaseUrl) {
  throw new Error('POCKETBASE_URL is required');
}

if (!config.pocketbaseAdminEmail || !config.pocketbaseAdminPassword) {
  throw new Error('POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD are required for superuser authentication');
}

export default config;

