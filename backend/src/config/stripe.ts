import Stripe from 'stripe';
import { config } from './index';

if (!config.stripeSecretKey) {
  console.warn('⚠️ Stripe secret key not configured. Payment features will not work.');
}

export const stripe = new Stripe(config.stripeSecretKey || '', {
  typescript: true,
});

export default stripe;
