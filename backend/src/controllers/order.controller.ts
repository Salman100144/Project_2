import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { stripe } from '../config/stripe';
import { config } from '../config';

/**
 * Order Controller
 * Handles payment and order HTTP requests
 */
export class OrderController {
  /**
   * Create payment intent for checkout
   * POST /api/orders/create-payment-intent
   */
  static async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { shippingAddress } = req.body;

      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }

      const result = await OrderService.createPaymentIntent(userId, shippingAddress);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm order after payment success
   * POST /api/orders/confirm
   */
  static async confirmOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { paymentIntentId, shippingAddress } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ message: 'Payment intent ID is required' });
      }

      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }

      const order = await OrderService.createOrder(userId, paymentIntentId, shippingAddress);
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:orderId
   */
  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const orderId = req.params.orderId as string;
      const order = await OrderService.getOrderById(orderId, userId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all user orders with pagination
   * GET /api/orders
   * Query params: page, limit, status
   */
  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;

      // Validate status if provided
      if (status) {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Invalid status filter' });
        }
      }

      const result = await OrderService.getUserOrders(userId, page, limit, status as any);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status (Admin only)
   * PATCH /api/orders/:orderId/status
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const { status, note, trackingInfo } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const order = await OrderService.updateOrderStatus(orderId, { status, note, trackingInfo });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error: any) {
      if (error.message.includes('Invalid status transition')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Get all orders (Admin only)
   * GET /api/orders/admin/all
   */
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const result = await OrderService.getAllOrders(page, limit, status as any);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stripe webhook handler
   * POST /api/orders/webhook
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    const sig = req.headers['stripe-signature'];

    try {
      let event: any;

      if (config.stripeWebhookSecret && sig && typeof sig === 'string') {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          config.stripeWebhookSecret
        );
      } else {
        // For testing without webhook signature verification
        event = req.body;
      }

      await OrderService.handleWebhook(event);

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: `Webhook Error: ${error.message}` });
    }
  }
}

export default OrderController;
