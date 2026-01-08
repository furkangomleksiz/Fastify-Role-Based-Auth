import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  allowedOrigins: string[];
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
};

// Validate required environment variables
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export default config;

