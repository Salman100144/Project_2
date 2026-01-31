import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key (starts with pk_test_)
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

if (!stripePublishableKey) {
  console.warn('⚠️ Stripe publishable key not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file');
}

export const stripePromise = loadStripe(stripePublishableKey);

export default stripePromise;
