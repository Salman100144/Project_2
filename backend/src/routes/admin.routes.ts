import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * Admin Routes
 * All routes require authentication and admin role
 * Base path: /api/admin
 */

// Apply auth middleware to all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// ==================== DASHBOARD ====================
/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Admin only
 */
router.get('/dashboard', AdminController.getDashboardStats);

// ==================== USER MANAGEMENT ====================
/**
 * @route   GET /api/admin/users
 * @desc    Get paginated user list with filters
 * @access  Admin only
 * @query   search, role, page, limit, sortBy, order
 */
router.get('/users', AdminController.getUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user details by ID
 * @access  Admin only
 */
router.get('/users/:userId', AdminController.getUserById);

/**
 * @route   PATCH /api/admin/users/:userId/role
 * @desc    Update user role (customer/admin)
 * @access  Admin only
 * @body    { role: 'customer' | 'admin' }
 */
router.patch('/users/:userId/role', AdminController.updateUserRole);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user (only if no orders exist)
 * @access  Admin only
 */
router.delete('/users/:userId', AdminController.deleteUser);

// ==================== ORDER MANAGEMENT ====================
/**
 * @route   GET /api/admin/orders
 * @desc    Get paginated order list with filters
 * @access  Admin only
 * @query   status, userId, search, dateFrom, dateTo, page, limit, sortBy, order
 */
router.get('/orders', AdminController.getOrders);

/**
 * @route   GET /api/admin/orders/:orderId
 * @desc    Get order details by ID
 * @access  Admin only
 */
router.get('/orders/:orderId', AdminController.getOrderById);

/**
 * @route   PATCH /api/admin/orders/:orderId/status
 * @desc    Update order status
 * @access  Admin only
 * @body    { status: OrderStatus, note?: string, trackingInfo?: TrackingInfo }
 */
router.patch('/orders/:orderId/status', AdminController.updateOrderStatus);

/**
 * @route   POST /api/admin/orders/bulk-update
 * @desc    Bulk update order status
 * @access  Admin only
 * @body    { orderIds: string[], status: OrderStatus, note?: string }
 */
router.post('/orders/bulk-update', AdminController.bulkUpdateOrderStatus);

export default router;
