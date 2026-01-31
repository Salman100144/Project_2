import api from '@/lib/axios';
import type { 
  Order, 
  CreatePaymentIntentResponse, 
  ShippingAddress 
} from '@/types/order.types';

/**
 * Order Service
 * Handles payment and order API calls
 */
export const orderService = {
  /**
   * Create a payment intent for checkout
   */
  async createPaymentIntent(shippingAddress: ShippingAddress): Promise<CreatePaymentIntentResponse> {
    const response = await api.post<CreatePaymentIntentResponse>(
      '/api/orders/create-payment-intent',
      { shippingAddress }
    );
    return response.data;
  },

  /**
   * Confirm order after successful payment
   */
  async confirmOrder(paymentIntentId: string, shippingAddress: ShippingAddress): Promise<Order> {
    const response = await api.post<Order>('/api/orders/confirm', {
      paymentIntentId,
      shippingAddress,
    });
    return response.data;
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await api.get<Order>(`/api/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get all user orders
   */
  async getUserOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/api/orders');
    return response.data;
  },
};

export default orderService;
