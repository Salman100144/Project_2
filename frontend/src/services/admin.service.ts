/**
 * Admin Service
 * API calls for admin panel functionality
 */

import { api } from '@/lib/axios';
import type {
  DashboardStats,
  UserListResponse,
  UserFilters,
  UserDetailResponse,
  AdminOrderListResponse,
  AdminOrderFilters,
  AdminOrderItem,
  UpdateOrderStatusPayload,
  BulkUpdatePayload,
} from '@/types/admin.types';

const ADMIN_URL = '/api/admin';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get(`${ADMIN_URL}/dashboard`);
  return response.data.data;
};

// ==================== USER MANAGEMENT ====================

/**
 * Get paginated user list
 */
export const getUsers = async (filters: UserFilters = {}): Promise<UserListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.order) params.append('order', filters.order);

  const response = await api.get(`${ADMIN_URL}/users?${params.toString()}`);
  return response.data.data;
};

/**
 * Get user details by ID
 */
export const getUserById = async (userId: string): Promise<UserDetailResponse> => {
  const response = await api.get(`${ADMIN_URL}/users/${userId}`);
  return response.data.data;
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: 'customer' | 'admin'): Promise<UserDetailResponse> => {
  const response = await api.patch(`${ADMIN_URL}/users/${userId}/role`, { role });
  return response.data.data;
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`${ADMIN_URL}/users/${userId}`);
};

// ==================== ORDER MANAGEMENT ====================

/**
 * Get admin order list with filters
 */
export const getOrders = async (filters: AdminOrderFilters = {}): Promise<AdminOrderListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.search) params.append('search', filters.search);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.order) params.append('order', filters.order);

  const response = await api.get(`${ADMIN_URL}/orders?${params.toString()}`);
  return response.data.data;
};

/**
 * Get order details by ID
 */
export const getOrderById = async (orderId: string): Promise<AdminOrderItem> => {
  const response = await api.get(`${ADMIN_URL}/orders/${orderId}`);
  return response.data.data;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<AdminOrderItem> => {
  const response = await api.patch(`${ADMIN_URL}/orders/${orderId}/status`, payload);
  return response.data.data;
};

/**
 * Bulk update order status
 */
export const bulkUpdateOrderStatus = async (payload: BulkUpdatePayload): Promise<{ updated: number }> => {
  const response = await api.post(`${ADMIN_URL}/orders/bulk-update`, payload);
  return response.data.data;
};
