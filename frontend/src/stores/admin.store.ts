/**
 * Admin Store
 * Manages admin panel state using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as adminService from '@/services/admin.service';
import type {
  DashboardStats,
  UserListItem,
  UserFilters,
  UserDetailResponse,
  AdminOrderItem,
  AdminOrderFilters,
  UpdateOrderStatusPayload,
  BulkUpdatePayload,
} from '@/types/admin.types';

interface AdminState {
  // Dashboard
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Users
  users: UserListItem[];
  usersTotal: number;
  usersPage: number;
  usersPages: number;
  usersLoading: boolean;
  usersError: string | null;
  userFilters: UserFilters;
  selectedUser: UserDetailResponse | null;
  selectedUserLoading: boolean;

  // Orders
  orders: AdminOrderItem[];
  ordersTotal: number;
  ordersPage: number;
  ordersPages: number;
  ordersLoading: boolean;
  ordersError: string | null;
  orderFilters: AdminOrderFilters;
  selectedOrder: AdminOrderItem | null;
  selectedOrderLoading: boolean;
  selectedOrders: string[]; // For bulk operations

  // Dashboard Actions
  fetchDashboardStats: () => Promise<void>;

  // User Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'customer' | 'admin') => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  setUserFilters: (filters: UserFilters) => void;
  clearSelectedUser: () => void;

  // Order Actions
  fetchOrders: (filters?: AdminOrderFilters) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, payload: UpdateOrderStatusPayload) => Promise<boolean>;
  bulkUpdateOrderStatus: (payload: BulkUpdatePayload) => Promise<boolean>;
  setOrderFilters: (filters: AdminOrderFilters) => void;
  clearSelectedOrder: () => void;
  toggleOrderSelection: (orderId: string) => void;
  selectAllOrders: () => void;
  clearOrderSelection: () => void;
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      // Initial State
      dashboardStats: null,
      dashboardLoading: false,
      dashboardError: null,

      users: [],
      usersTotal: 0,
      usersPage: 1,
      usersPages: 1,
      usersLoading: false,
      usersError: null,
      userFilters: { page: 1, limit: 20, sortBy: 'createdAt', order: 'desc' },
      selectedUser: null,
      selectedUserLoading: false,

      orders: [],
      ordersTotal: 0,
      ordersPage: 1,
      ordersPages: 1,
      ordersLoading: false,
      ordersError: null,
      orderFilters: { page: 1, limit: 20, sortBy: 'createdAt', order: 'desc' },
      selectedOrder: null,
      selectedOrderLoading: false,
      selectedOrders: [],

      // Dashboard Actions
      fetchDashboardStats: async () => {
        set({ dashboardLoading: true, dashboardError: null });
        try {
          const stats = await adminService.getDashboardStats();
          set({ dashboardStats: stats, dashboardLoading: false });
        } catch (error: any) {
          set({
            dashboardError: error.response?.data?.message || 'Failed to fetch dashboard stats',
            dashboardLoading: false,
          });
        }
      },

      // User Actions
      fetchUsers: async (filters?: UserFilters) => {
        const currentFilters = filters || get().userFilters;
        set({ usersLoading: true, usersError: null, userFilters: currentFilters });
        
        try {
          const response = await adminService.getUsers(currentFilters);
          set({
            users: response.users,
            usersTotal: response.total,
            usersPage: response.page,
            usersPages: response.pages,
            usersLoading: false,
          });
        } catch (error: any) {
          set({
            usersError: error.response?.data?.message || 'Failed to fetch users',
            usersLoading: false,
          });
        }
      },

      fetchUserById: async (userId: string) => {
        set({ selectedUserLoading: true });
        try {
          const user = await adminService.getUserById(userId);
          set({ selectedUser: user, selectedUserLoading: false });
        } catch (error: any) {
          set({ selectedUserLoading: false });
          throw error;
        }
      },

      updateUserRole: async (userId: string, role: 'customer' | 'admin') => {
        try {
          await adminService.updateUserRole(userId, role);
          // Refresh users list
          get().fetchUsers();
          // Update selected user if it's the same
          if (get().selectedUser?._id === userId) {
            set((state) => ({
              selectedUser: state.selectedUser ? { ...state.selectedUser, role } : null,
            }));
          }
          return true;
        } catch (error: any) {
          return false;
        }
      },

      deleteUser: async (userId: string) => {
        try {
          await adminService.deleteUser(userId);
          // Refresh users list
          get().fetchUsers();
          // Clear selected user if it's the same
          if (get().selectedUser?._id === userId) {
            set({ selectedUser: null });
          }
          return true;
        } catch (error: any) {
          return false;
        }
      },

      setUserFilters: (filters: UserFilters) => {
        set((state) => ({
          userFilters: { ...state.userFilters, ...filters },
        }));
      },

      clearSelectedUser: () => {
        set({ selectedUser: null });
      },

      // Order Actions
      fetchOrders: async (filters?: AdminOrderFilters) => {
        const currentFilters = filters || get().orderFilters;
        set({ ordersLoading: true, ordersError: null, orderFilters: currentFilters });
        
        try {
          const response = await adminService.getOrders(currentFilters);
          set({
            orders: response.orders,
            ordersTotal: response.total,
            ordersPage: response.page,
            ordersPages: response.pages,
            ordersLoading: false,
          });
        } catch (error: any) {
          set({
            ordersError: error.response?.data?.message || 'Failed to fetch orders',
            ordersLoading: false,
          });
        }
      },

      fetchOrderById: async (orderId: string) => {
        set({ selectedOrderLoading: true });
        try {
          const order = await adminService.getOrderById(orderId);
          set({ selectedOrder: order, selectedOrderLoading: false });
        } catch (error: any) {
          set({ selectedOrderLoading: false });
          throw error;
        }
      },

      updateOrderStatus: async (orderId: string, payload: UpdateOrderStatusPayload) => {
        try {
          const updatedOrder = await adminService.updateOrderStatus(orderId, payload);
          // Update in orders list
          set((state) => ({
            orders: state.orders.map((o) => (o._id === orderId ? updatedOrder : o)),
            selectedOrder: state.selectedOrder?._id === orderId ? updatedOrder : state.selectedOrder,
          }));
          // Refresh dashboard stats
          get().fetchDashboardStats();
          return true;
        } catch (error: any) {
          return false;
        }
      },

      bulkUpdateOrderStatus: async (payload: BulkUpdatePayload) => {
        try {
          await adminService.bulkUpdateOrderStatus(payload);
          // Refresh orders list
          get().fetchOrders();
          // Clear selection
          set({ selectedOrders: [] });
          // Refresh dashboard stats
          get().fetchDashboardStats();
          return true;
        } catch (error: any) {
          return false;
        }
      },

      setOrderFilters: (filters: AdminOrderFilters) => {
        set((state) => ({
          orderFilters: { ...state.orderFilters, ...filters },
        }));
      },

      clearSelectedOrder: () => {
        set({ selectedOrder: null });
      },

      toggleOrderSelection: (orderId: string) => {
        set((state) => ({
          selectedOrders: state.selectedOrders.includes(orderId)
            ? state.selectedOrders.filter((id) => id !== orderId)
            : [...state.selectedOrders, orderId],
        }));
      },

      selectAllOrders: () => {
        set((state) => ({
          selectedOrders: state.orders.map((o) => o._id),
        }));
      },

      clearOrderSelection: () => {
        set({ selectedOrders: [] });
      },
    }),
    { name: 'admin-store' }
  )
);
