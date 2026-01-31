import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { OrderService } from '../services/order.service';
import { UserFilters, AdminOrderFilters } from '../types/admin.types';
import { OrderStatus } from '../types/order.types';

/**
 * Admin Controller
 * Handles admin panel HTTP requests
 */
export class AdminController {
  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard
   */
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get paginated user list
   * GET /api/admin/users
   * Query params: search, role, page, limit, sortBy, order
   */
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: UserFilters = {
        search: req.query.search as string,
        role: req.query.role as 'customer' | 'admin',
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: (req.query.sortBy as 'createdAt' | 'name' | 'email') || 'createdAt',
        order: (req.query.order as 'asc' | 'desc') || 'desc',
      };

      // Validate role if provided
      if (filters.role && !['customer', 'admin'].includes(filters.role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be "customer" or "admin"',
        });
      }

      const result = await AdminService.getUsers(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user details by ID
   * GET /api/admin/users/:userId
   */
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const user = await AdminService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   * PATCH /api/admin/users/:userId/role
   */
  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const { role } = req.body;

      // Prevent admin from changing their own role
      if (req.user?.id === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change your own role',
        });
      }

      if (!role || !['customer', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be "customer" or "admin"',
        });
      }

      const user = await AdminService.updateUserRole(userId, role);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
        message: `User role updated to ${role}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:userId
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;

      // Prevent admin from deleting themselves
      if (req.user?.id === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
      }

      const deleted = await AdminService.deleteUser(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      if (error.message.includes('Cannot delete user')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  // ==================== ORDER MANAGEMENT ====================

  /**
   * Get admin order list with filters
   * GET /api/admin/orders
   * Query params: status, userId, search, dateFrom, dateTo, page, limit, sortBy, order
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      const status = req.query.status as OrderStatus;

      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter',
        });
      }

      const filters: AdminOrderFilters = {
        status,
        userId: req.query.userId as string,
        search: req.query.search as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: (req.query.sortBy as 'createdAt' | 'totalPrice' | 'orderStatus') || 'createdAt',
        order: (req.query.order as 'asc' | 'desc') || 'desc',
      };

      const result = await AdminService.getAdminOrders(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order details by ID (admin view)
   * GET /api/admin/orders/:orderId
   */
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const order = await AdminService.getAdminOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   * PATCH /api/admin/orders/:orderId/status
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const { status, note, trackingInfo } = req.body;

      const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }

      // Validate tracking info if provided
      if (trackingInfo) {
        if (!trackingInfo.carrier || !trackingInfo.trackingNumber) {
          return res.status(400).json({
            success: false,
            message: 'Tracking info must include carrier and trackingNumber',
          });
        }
      }

      const order = await OrderService.updateOrderStatus(orderId, {
        status,
        note,
        trackingInfo,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.json({
        success: true,
        data: order,
        message: `Order status updated to ${status}`,
      });
    } catch (error: any) {
      if (error.message.includes('Invalid status transition')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Bulk update order status
   * POST /api/admin/orders/bulk-update
   */
  static async bulkUpdateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderIds, status, note } = req.body;

      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'orderIds must be a non-empty array',
        });
      }

      const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }

      const result = await AdminService.bulkUpdateOrderStatus({
        orderIds,
        status,
        note,
      });

      res.json({
        success: result.success,
        data: result,
        message: `Updated ${result.updated} orders, ${result.failed} failed`,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== PRODUCT MANAGEMENT ====================
  // Note: Since products come from DummyJSON API, we have limited CRUD capabilities
  // In a real app, you would implement full product CRUD against your own database

  /**
   * Product management placeholder - in a real app, this would manage products in your DB
   * For now, products are fetched from DummyJSON and cached
   * 
   * To implement full product management:
   * 1. Create a Product model in MongoDB
   * 2. Add product CRUD endpoints
   * 3. Update ProductService to use local DB or hybrid approach
   */
}

export default AdminController;
