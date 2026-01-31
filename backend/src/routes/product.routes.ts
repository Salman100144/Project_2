/**
 * Product Routes
 * API endpoints for products with caching layer
 * 
 * Routes:
 * - GET /api/products - Get all products
 * - GET /api/products/search - Search products
 * - GET /api/products/categories - Get all categories
 * - GET /api/products/category-list - Get category names
 * - GET /api/products/category/:category - Get products by category
 * - GET /api/products/:id - Get single product
 * - POST /api/products/cache/clear - Clear cache
 * - GET /api/products/cache/stats - Get cache stats
 */

import { Router } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

// Cache management routes (should come before :id route)
router.get('/cache/stats', productController.getCacheStats);
router.post('/cache/clear', productController.clearCache);

// Product listing and search
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);

// Category routes
router.get('/categories', productController.getCategories);
router.get('/category-list', productController.getCategoryList);
router.get('/category/:category', productController.getProductsByCategory);

// Single product - must be last to avoid conflicts
router.get('/:id', productController.getProductById);

export default router;
