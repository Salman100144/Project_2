import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  authSecret: process.env.AUTH_SECRET || 'default-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
} as const;
