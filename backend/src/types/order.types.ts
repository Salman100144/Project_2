/**
 * Order Types
 */

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  title: string;
  thumbnail: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentIntentId: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentIntentPayload {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentIntentId: string;
}
