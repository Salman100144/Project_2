import Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { OrderModel } from '../models/order.model';
import Cart from '../models/cart.model';
import { CreateOrderPayload, Order, ShippingAddress, OrderStatus, UpdateOrderStatusPayload, TrackingInfo } from '../types/order.types';
import type { ICartItem } from '../models/cart.model';

/**
 * Order Service
 * Handles payment processing and order management
 */
export class OrderService {
  /**
   * Create a payment intent for checkout
   */
  static async createPaymentIntent(
    userId: string,
    shippingAddress: ShippingAddress
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    // Get user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals
    const subtotal = cart.totalPrice;
    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
    const shipping = 0; // Free shipping
    const totalPrice = subtotal + tax + shipping;

    // Convert to cents for Stripe (Stripe uses smallest currency unit)
    const amountInCents = Math.round(totalPrice * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        cartId: cart._id.toString(),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Create order after successful payment
   */
  static async createOrder(
    userId: string,
    paymentIntentId: string,
    shippingAddress: ShippingAddress
  ): Promise<Order> {
    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not completed');
    }

    // Check if order already exists for this payment
    const existingOrder = await OrderModel.findOne({ paymentIntentId });
    if (existingOrder) {
      const orderObj = existingOrder.toObject();
      return { ...orderObj, _id: orderObj._id.toString() } as Order;
    }

    // Get cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals
    const subtotal = cart.totalPrice;
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const shipping = 0;
    const totalPrice = subtotal + tax + shipping;

    // Create order
    const order = await OrderModel.create({
      userId,
      items: cart.items.map((item: ICartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        thumbnail: item.thumbnail,
      })),
      totalItems: cart.totalItems,
      subtotal,
      tax,
      shipping,
      totalPrice,
      shippingAddress,
      paymentIntentId,
      paymentStatus: 'paid',
      orderStatus: 'processing',
      statusHistory: [
        { status: 'pending', timestamp: new Date(), note: 'Order placed' },
        { status: 'processing', timestamp: new Date(), note: 'Payment confirmed' },
      ],
    });

    // Clear cart after successful order
    await Cart.findByIdAndUpdate(cart._id, {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });

    const orderObj = order.toObject();
    return { ...orderObj, _id: orderObj._id.toString() } as Order;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string, userId: string): Promise<Order | null> {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) return null;
    const orderObj = order.toObject();
    return { ...orderObj, _id: orderObj._id.toString() } as Order;
  }

  /**
   * Get all orders for a user with pagination
   */
  static async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ): Promise<{ orders: Order[]; total: number; page: number; pages: number }> {
    const query: any = { userId };
    if (status) {
      query.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(query),
    ]);

    return {
      orders: orders.map(order => ({ ...order, _id: order._id.toString() })) as Order[],
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update order status (admin function)
   */
  static async updateOrderStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload
  ): Promise<Order | null> {
    const { status, note, trackingInfo } = payload;

    // Validate status transition
    const order = await OrderModel.findById(orderId);
    if (!order) return null;

    // Define valid status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [], // Final state
      cancelled: [], // Final state
    };

    const currentStatus = order.orderStatus as OrderStatus;
    if (!validTransitions[currentStatus].includes(status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
    }

    // Build update object
    const updateData: any = {
      orderStatus: status,
      $push: {
        statusHistory: {
          status,
          timestamp: new Date(),
          note: note || `Order ${status}`,
        },
      },
    };

    // Add tracking info if provided (typically when shipping)
    if (trackingInfo) {
      updateData.trackingInfo = trackingInfo;
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, updateData, { new: true }).lean();
    if (!updatedOrder) return null;

    return { ...updatedOrder, _id: updatedOrder._id.toString() } as Order;
  }

  /**
   * Get all orders (admin function)
   */
  static async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus
  ): Promise<{ orders: Order[]; total: number; pages: number }> {
    const query = status ? { orderStatus: status } : {};
    
    const [orders, total] = await Promise.all([
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(query),
    ]);

    return {
      orders: orders.map(order => ({ ...order, _id: order._id.toString() })) as Order[],
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Payment successful - order will be created via API call
        console.log('Payment succeeded:', event.data.object);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        // Update order status if exists
        await OrderModel.findOneAndUpdate(
          { paymentIntentId: failedPayment.id },
          { paymentStatus: 'failed' }
        );
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}

export default OrderService;
