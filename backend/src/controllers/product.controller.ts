/**
 * Product Controller
 * Handles HTTP requests for product-related endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import type { ProductsQueryParams } from '../types/product.types';

/**
 * Parse query parameters from request
 */
const parseQueryParams = (query: Request['query']): ProductsQueryParams => {
  const params: ProductsQueryParams = {};

  if (query.limit) {
    params.limit = parseInt(query.limit as string, 10);
  }
  if (query.skip) {
    params.skip = parseInt(query.skip as string, 10);
  }
  if (query.select) {
    params.select = (query.select as string).split(',');
  }
  if (query.sortBy) {
    params.sortBy = query.sortBy as ProductsQueryParams['sortBy'];
  }
  if (query.order) {
    params.order = query.order as ProductsQueryParams['order'];
  }

  return params;
};

/**
 * GET /api/products
 * Get all products with optional pagination and sorting
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = parseQueryParams(req.query);
    const data = await productService.getProducts(params);
    
    res.status(200).json({
      status: 'success',
      data,
      cached: true, // Response may be from cache
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/search
 * Search products by query string
 */
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Search query (q) is required',
      });
      return;
    }

    const params = parseQueryParams(req.query);
    const data = await productService.searchProducts({ q, ...params });
    
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/categories
 * Get all product categories
 */
export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await productService.getCategories();
    
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/category-list
 * Get list of category names/slugs
 */
export const getCategoryList = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await productService.getCategoryList();
    
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/category/:category
 * Get products by category
 */
export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = req.params.category as string;
    const params = parseQueryParams(req.query);
    const data = await productService.getProductsByCategory(category, params);
    
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid product ID',
      });
      return;
    }

    const data = await productService.getProductById(id);
    
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/cache/clear
 * Clear product cache (admin only in production)
 */
export const clearCache = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = productService.clearProductCache();
    
    res.status(200).json({
      status: 'success',
      message: 'Product cache cleared',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/cache/stats
 * Get cache statistics
 */
export const getCacheStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = productService.getCacheStats();
    
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
