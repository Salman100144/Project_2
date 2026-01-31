import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  authSecret: process.env.AUTH_SECRET || 'default-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Stripe configuration
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
} as const;

export { stripe } from './stripe';
