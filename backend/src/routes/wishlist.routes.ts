/**
 * Wishlist Routes
 * API endpoints for wishlist operations
 * All routes require authentication
 * 
 * Routes:
 * - GET    /api/wishlist                       - Get user's wishlist
 * - POST   /api/wishlist/items                 - Add item to wishlist
 * - DELETE /api/wishlist/items/:productId      - Remove item from wishlist
 * - DELETE /api/wishlist                       - Clear wishlist
 * - GET    /api/wishlist/check/:productId      - Check if item in wishlist
 * - GET    /api/wishlist/count                 - Get wishlist item count
 * - POST   /api/wishlist/move-to-cart/:productId - Move item to cart
 */

import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(requireAuth);

// Wishlist operations
router.get('/', wishlistController.getWishlist);
router.delete('/', wishlistController.clearWishlist);
router.get('/count', wishlistController.getWishlistCount);
router.get('/check/:productId', wishlistController.checkWishlistItem);

// Wishlist item operations
router.post('/items', wishlistController.addToWishlist);
router.delete('/items/:productId', wishlistController.removeFromWishlist);

// Move to cart
router.post('/move-to-cart/:productId', wishlistController.moveToCart);

export default router;
