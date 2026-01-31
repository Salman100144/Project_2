/**
 * Cart Routes
 * API endpoints for cart operations
 * All routes require authentication
 * 
 * Routes:
 * - GET    /api/cart                  - Get user's cart
 * - POST   /api/cart/items            - Add item to cart
 * - PUT    /api/cart/items/:productId - Update item quantity
 * - DELETE /api/cart/items/:productId - Remove item from cart
 * - DELETE /api/cart                  - Clear cart
 * - GET    /api/cart/check/:productId - Check if item in cart
 * - GET    /api/cart/count            - Get cart item count
 */

import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(requireAuth);

// Cart operations
router.get('/', cartController.getCart);
router.delete('/', cartController.clearCart);
router.get('/count', cartController.getCartCount);
router.get('/check/:productId', cartController.checkCartItem);

// Cart item operations
router.post('/items', cartController.addToCart);
router.put('/items/:productId', cartController.updateCartItem);
router.delete('/items/:productId', cartController.removeFromCart);

export default router;
