/**
 * Admin Types
 * Type definitions for admin panel functionality
 */

import { OrderStatus } from './order.types';

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
  createdAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  search?: string; // Search by name or email
  role?: 'customer' | 'admin';
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'email';
  order?: 'asc' | 'desc';
}

export interface UpdateUserRolePayload {
  role: 'customer' | 'admin';
}

export interface UserDetailResponse extends UserListItem {
  orders: {
    _id: string;
    totalPrice: number;
    orderStatus: OrderStatus;
    createdAt: Date;
  }[];
}

/**
 * Order Management Types for Admin
 */
export interface AdminOrderFilters {
  status?: OrderStatus;
  userId?: string;
  search?: string; // Search by order ID or user email
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalPrice' | 'orderStatus';
  order?: 'asc' | 'desc';
}

export interface AdminOrderListResponse {
  orders: AdminOrderItem[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminOrderItem {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
    title: string;
    thumbnail: string;
  }[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  trackingInfo?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery?: Date;
    trackingUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Bulk Action Types
 */
export interface BulkUpdateStatusPayload {
  orderIds: string[];
  status: OrderStatus;
  note?: string;
}

export interface BulkActionResponse {
  success: boolean;
  updated: number;
  failed: number;
  errors?: string[];
}
