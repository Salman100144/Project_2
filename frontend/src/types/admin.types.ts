/**
 * Admin Types (Frontend)
 * Matches backend admin types
 */

import type { OrderStatus, PaymentStatus, ShippingAddress, OrderItem, StatusHistoryEntry, TrackingInfo } from './order.types';

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: RecentOrderSummary[];
  ordersByStatus: OrdersByStatus;
  revenueByMonth: RevenueByMonth[];
  topProducts: TopProduct[];
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
}

export interface RecentOrderSummary {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  totalPrice: number;
  orderStatus: OrderStatus;
  createdAt: string;
  itemCount: number;
}

export interface OrdersByStatus {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface RevenueByMonth {
  month: string; // Format: "YYYY-MM"
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: number;
  title: string;
  thumbnail: string;
  totalSold: number;
  totalRevenue: number;
}

/**
 * User Management Types
 */
export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  orderCount?: number;
  totalSpent?: number;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  pages: number;
}

export interface UserFilters {
  search?: string;
  role?: 'customer' | 'admin';
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'email';
  order?: 'asc' | 'desc';
}

export interface UserDetailResponse extends UserListItem {
  orders: {
    _id: string;
    totalPrice: number;
    orderStatus: OrderStatus;
    createdAt: string;
  }[];
}

/**
 * Admin Order Types
 */
export interface AdminOrderItem {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  statusHistory: StatusHistoryEntry[];
  trackingInfo?: TrackingInfo;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderListResponse {
  orders: AdminOrderItem[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminOrderFilters {
  status?: OrderStatus;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalPrice' | 'orderStatus';
  order?: 'asc' | 'desc';
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
  trackingInfo?: TrackingInfo;
}

export interface BulkUpdatePayload {
  orderIds: string[];
  status: OrderStatus;
  note?: string;
}
