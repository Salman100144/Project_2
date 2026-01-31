/**
 * Order Types (Frontend)
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
  timestamp: string;
  note?: string;
}

/**
 * Tracking information for shipped orders
 */
export interface TrackingInfo {
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Paginated orders response from API
 */
export interface PaginatedOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Query params for fetching orders
 */
export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
}
