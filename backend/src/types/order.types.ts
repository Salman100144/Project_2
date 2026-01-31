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

// Order status flow: pending -> processing -> shipped -> delivered
// cancelled can happen at any point before delivered
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Status history entry for tracking order progress
 */
export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

/**
 * Tracking information for shipped orders
 */
export interface TrackingInfo {
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

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
  statusHistory: StatusHistoryEntry[];
  trackingInfo?: TrackingInfo;
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

/**
 * Payload for updating order status
 */
export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
  trackingInfo?: TrackingInfo;
}
