import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth';
import express from 'express';

const router = Router();

// Webhook route - must be before JSON parser (raw body needed for signature verification)
// Note: This should be mounted before express.json() middleware in the main app
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  OrderController.handleWebhook
);

// Protected routes - require authentication
router.post('/create-payment-intent', requireAuth, OrderController.createPaymentIntent);
router.post('/confirm', requireAuth, OrderController.confirmOrder);
router.get('/', requireAuth, OrderController.getUserOrders);
router.get('/:orderId', requireAuth, OrderController.getOrder);

export default router;
