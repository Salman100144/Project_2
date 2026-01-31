import { create } from 'zustand';
import { orderService } from '@/services/order.service';
import type { Order, ShippingAddress, CreatePaymentIntentResponse, OrdersQueryParams, OrderStatus } from '@/types/order.types';

interface OrderState {
  // Payment intent
  clientSecret: string | null;
  paymentIntentId: string | null;
  
  // Shipping
  shippingAddress: ShippingAddress | null;
  
  // Orders
  orders: Order[];
  currentOrder: Order | null;
  
  // Pagination
  totalOrders: number;
  currentPage: number;
  totalPages: number;
  statusFilter: OrderStatus | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setShippingAddress: (address: ShippingAddress) => void;
  createPaymentIntent: (shippingAddress: ShippingAddress) => Promise<CreatePaymentIntentResponse>;
  confirmOrder: (paymentIntentId: string) => Promise<Order>;
  fetchOrders: (params?: OrdersQueryParams) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<void>;
  setStatusFilter: (status: OrderStatus | null) => void;
  clearCheckout: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  clientSecret: null,
  paymentIntentId: null,
  shippingAddress: null,
  orders: [],
  currentOrder: null,
  totalOrders: 0,
  currentPage: 1,
  totalPages: 0,
  statusFilter: null,
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

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { statusFilter } = get();
      const queryParams: OrdersQueryParams = {
        ...params,
        status: params?.status ?? statusFilter ?? undefined,
      };
      const result = await orderService.getUserOrders(queryParams);
      set({ 
        orders: result.orders,
        totalOrders: result.total,
        currentPage: result.page,
        totalPages: result.pages,
        isLoading: false,
      });
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

  setStatusFilter: (status) => {
    set({ statusFilter: status });
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
