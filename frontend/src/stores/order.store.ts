import { create } from 'zustand';
import { orderService } from '@/services/order.service';
import type { Order, ShippingAddress, CreatePaymentIntentResponse } from '@/types/order.types';

interface OrderState {
  // Payment intent
  clientSecret: string | null;
  paymentIntentId: string | null;
  
  // Shipping
  shippingAddress: ShippingAddress | null;
  
  // Orders
  orders: Order[];
  currentOrder: Order | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setShippingAddress: (address: ShippingAddress) => void;
  createPaymentIntent: (shippingAddress: ShippingAddress) => Promise<CreatePaymentIntentResponse>;
  confirmOrder: (paymentIntentId: string) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  fetchOrder: (orderId: string) => Promise<void>;
  clearCheckout: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  clientSecret: null,
  paymentIntentId: null,
  shippingAddress: null,
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  setShippingAddress: (address) => {
    set({ shippingAddress: address });
  },

  createPaymentIntent: async (shippingAddress) => {
    set({ isLoading: true, error: null });
    try {
      const result = await orderService.createPaymentIntent(shippingAddress);
      set({ 
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        shippingAddress,
        isLoading: false,
      });
      return result;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create payment intent';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  confirmOrder: async (paymentIntentId) => {
    const { shippingAddress } = get();
    if (!shippingAddress) {
      throw new Error('Shipping address not set');
    }

    set({ isLoading: true, error: null });
    try {
      const order = await orderService.confirmOrder(paymentIntentId, shippingAddress);
      set({ 
        currentOrder: order,
        isLoading: false,
        // Clear checkout state
        clientSecret: null,
        paymentIntentId: null,
      });
      return order;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to confirm order';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await orderService.getUserOrders();
      set({ orders, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      set({ isLoading: false, error: message });
    }
  },

  fetchOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderService.getOrder(orderId);
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch order';
      set({ isLoading: false, error: message });
    }
  },

  clearCheckout: () => {
    set({
      clientSecret: null,
      paymentIntentId: null,
      shippingAddress: null,
      error: null,
    });
  },
}));

export default useOrderStore;
