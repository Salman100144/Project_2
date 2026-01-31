/**
 * Admin Service
 * Handles admin panel business logic including dashboard stats,
 * user management, and order management
 */

import { OrderModel } from '../models/order.model';
import User, { IUserDocument } from '../models/user.model';
import {
  DashboardStats,
  RecentOrderSummary,
  OrdersByStatus,
  RevenueByMonth,
  TopProduct,
  UserListItem,
  UserListResponse,
  UserFilters,
  UserDetailResponse,
  AdminOrderFilters,
  AdminOrderListResponse,
  AdminOrderItem,
  BulkUpdateStatusPayload,
  BulkActionResponse,
} from '../types/admin.types';
import { OrderStatus } from '../types/order.types';

export class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    // Get date boundaries
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Run all queries in parallel for performance
    const [
      totalUsers,
      totalOrders,
      revenueAggregation,
      ordersByStatusAgg,
      recentOrders,
      revenueByMonthAgg,
      topProductsAgg,
      newUsersToday,
      ordersToday,
      revenueTodayAgg,
    ] = await Promise.all([
      // Total users count
      User.countDocuments(),
      
      // Total orders count
      OrderModel.countDocuments(),
      
      // Total revenue (from paid orders)
      OrderModel.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      
      // Orders by status
      OrderModel.aggregate([
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ]),
      
      // Recent orders (last 10)
      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Revenue by month (last 6 months)
      OrderModel.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$totalPrice' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      
      // Top selling products (by quantity)
      OrderModel.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            title: { $first: '$items.title' },
            thumbnail: { $first: '$items.thumbnail' },
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
      
      // New users today
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      
      // Orders today
      OrderModel.countDocuments({ createdAt: { $gte: startOfToday } }),
      
      // Revenue today
      OrderModel.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: startOfToday },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    // Process orders by status
    const ordersByStatus: OrdersByStatus = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    ordersByStatusAgg.forEach((item: { _id: OrderStatus; count: number }) => {
      if (item._id in ordersByStatus) {
        ordersByStatus[item._id] = item.count;
      }
    });

    // Get user info for recent orders
    const userIds = recentOrders.map((o: any) => o.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    const recentOrdersSummary: RecentOrderSummary[] = recentOrders.map((order: any) => {
      const user = userMap.get(order.userId);
      return {
        _id: order._id.toString(),
        userId: order.userId,
        userName: user?.name,
        userEmail: user?.email,
        totalPrice: order.totalPrice,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        itemCount: order.totalItems,
      };
    });

    // Process revenue by month
    const revenueByMonth: RevenueByMonth[] = revenueByMonthAgg.map((item: any) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.revenue,
      orderCount: item.orderCount,
    }));

    // Process top products
    const topProducts: TopProduct[] = topProductsAgg.map((item: any) => ({
      productId: item._id,
      title: item.title,
      thumbnail: item.thumbnail,
      totalSold: item.totalSold,
      totalRevenue: item.totalRevenue,
    }));

    return {
      totalUsers,
      totalOrders,
      totalRevenue: revenueAggregation[0]?.total || 0,
      pendingOrders: ordersByStatus.pending,
      processingOrders: ordersByStatus.processing,
      shippedOrders: ordersByStatus.shipped,
      deliveredOrders: ordersByStatus.delivered,
      cancelledOrders: ordersByStatus.cancelled,
      recentOrders: recentOrdersSummary,
      ordersByStatus,
      revenueByMonth,
      topProducts,
      newUsersToday,
      ordersToday,
      revenueToday: revenueTodayAgg[0]?.total || 0,
    };
  }

  /**
   * Get paginated user list with filters
   */
  static async getUsers(filters: UserFilters): Promise<UserListResponse> {
    const {
      search,
      role,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = filters;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (role) {
      query.role = role;
    }

    // Build sort
    const sortOptions: any = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Get order stats for each user
    const userIds = users.map((u: any) => u._id.toString());
    const orderStats = await OrderModel.aggregate([
      { $match: { userId: { $in: userIds }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]);
    const orderStatsMap = new Map(orderStats.map((s: any) => [s._id, s]));

    const userList: UserListItem[] = users.map((user: any) => {
      const stats = orderStatsMap.get(user._id.toString());
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        orderCount: stats?.orderCount || 0,
        totalSpent: stats?.totalSpent || 0,
      };
    });

    return {
      users: userList,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user details by ID including their orders
   */
  static async getUserById(userId: string): Promise<UserDetailResponse | null> {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id totalPrice orderStatus createdAt')
      .lean();

    const orderStats = await OrderModel.aggregate([
      { $match: { userId, paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]);

    return {
      _id: (user as any)._id.toString(),
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role,
      emailVerified: (user as any).emailVerified,
      image: (user as any).image,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
      orderCount: orderStats[0]?.orderCount || 0,
      totalSpent: orderStats[0]?.totalSpent || 0,
      orders: orders.map((o: any) => ({
        _id: o._id.toString(),
        totalPrice: o.totalPrice,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
      })),
    };
  }

  /**
   * Update user role
   */
  static async updateUserRole(
    userId: string,
    role: 'customer' | 'admin'
  ): Promise<UserListItem | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).lean();

    if (!user) return null;

    return {
      _id: (user as any)._id.toString(),
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role,
      emailVerified: (user as any).emailVerified,
      image: (user as any).image,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  }

  /**
   * Delete user (soft delete by marking inactive or hard delete)
   */
  static async deleteUser(userId: string): Promise<boolean> {
    // Check if user has orders
    const orderCount = await OrderModel.countDocuments({ userId });
    
    if (orderCount > 0) {
      // Soft delete - we don't actually delete, just prevent login
      // In a real app, you might set an 'isActive' field
      throw new Error('Cannot delete user with existing orders. Consider deactivating instead.');
    }

    const result = await User.findByIdAndDelete(userId);
    return !!result;
  }

  /**
   * Get admin order list with filters
   */
  static async getAdminOrders(filters: AdminOrderFilters): Promise<AdminOrderListResponse> {
    const {
      status,
      userId,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = filters;

    // Build query
    const query: any = {};
    
    if (status) {
      query.orderStatus = status;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = dateFrom;
      if (dateTo) query.createdAt.$lte = dateTo;
    }

    // Search by order ID handled separately
    if (search) {
      // Try to match order ID pattern
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search;
      }
    }

    // Build sort
    const sortOptions: any = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
      OrderModel.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(query),
    ]);

    // Get user info for orders
    const userIds = [...new Set(orders.map((o: any) => o.userId))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    // Filter by user email/name if search doesn't match order ID
    let filteredOrders = orders;
    if (search && !search.match(/^[0-9a-fA-F]{24}$/)) {
      const searchLower = search.toLowerCase();
      filteredOrders = orders.filter((order: any) => {
        const user = userMap.get(order.userId);
        return (
          user?.name?.toLowerCase().includes(searchLower) ||
          user?.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    const orderList: AdminOrderItem[] = filteredOrders.map((order: any) => {
      const user = userMap.get(order.userId);
      return {
        _id: order._id.toString(),
        userId: order.userId,
        userName: user?.name,
        userEmail: user?.email,
        items: order.items,
        totalItems: order.totalItems,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        totalPrice: order.totalPrice,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        trackingInfo: order.trackingInfo,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return {
      orders: orderList,
      total: search && !search.match(/^[0-9a-fA-F]{24}$/) ? filteredOrders.length : total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get order details for admin (doesn't require userId match)
   */
  static async getAdminOrderById(orderId: string): Promise<AdminOrderItem | null> {
    const order = await OrderModel.findById(orderId).lean();
    if (!order) return null;

    const user = await User.findById((order as any).userId).lean();

    return {
      _id: (order as any)._id.toString(),
      userId: (order as any).userId,
      userName: user ? (user as any).name : undefined,
      userEmail: user ? (user as any).email : undefined,
      items: (order as any).items,
      totalItems: (order as any).totalItems,
      subtotal: (order as any).subtotal,
      tax: (order as any).tax,
      shipping: (order as any).shipping,
      totalPrice: (order as any).totalPrice,
      orderStatus: (order as any).orderStatus,
      paymentStatus: (order as any).paymentStatus,
      shippingAddress: (order as any).shippingAddress,
      trackingInfo: (order as any).trackingInfo,
      createdAt: (order as any).createdAt,
      updatedAt: (order as any).updatedAt,
    };
  }

  /**
   * Bulk update order status
   */
  static async bulkUpdateOrderStatus(
    payload: BulkUpdateStatusPayload
  ): Promise<BulkActionResponse> {
    const { orderIds, status, note } = payload;
    
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // Define valid status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    for (const orderId of orderIds) {
      try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
          errors.push(`Order ${orderId} not found`);
          failed++;
          continue;
        }

        const currentStatus = order.orderStatus as OrderStatus;
        if (!validTransitions[currentStatus].includes(status)) {
          errors.push(`Order ${orderId}: Invalid transition from ${currentStatus} to ${status}`);
          failed++;
          continue;
        }

        await OrderModel.findByIdAndUpdate(orderId, {
          orderStatus: status,
          $push: {
            statusHistory: {
              status,
              timestamp: new Date(),
              note: note || `Bulk update: Order ${status}`,
            },
          },
        });

        updated++;
      } catch (error: any) {
        errors.push(`Order ${orderId}: ${error.message}`);
        failed++;
      }
    }

    return {
      success: failed === 0,
      updated,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export default AdminService;
