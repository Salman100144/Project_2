/**
 * Cart Controller
 * Handles HTTP requests for cart operations
 */

import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';

/**
 * GET /api/cart
 * Get current user's cart
 */
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const cart = await cartService.getCart(userId);
    
    res.status(200).json({
      status: 'success',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/items
 * Add item to cart
 */
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const { productId, quantity, price, title, thumbnail } = req.body;

    // Validation
    if (!productId || !price || !title || !thumbnail) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields: productId, price, title, thumbnail',
      });
      return;
    }

    const cart = await cartService.addToCart(userId, {
      productId: Number(productId),
      quantity: Number(quantity) || 1,
      price: Number(price),
      title,
      thumbnail,
    });

    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/cart/items/:productId
 * Update item quantity in cart
 */
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const productId = Number(req.params.productId);
    const { quantity } = req.body;

    if (isNaN(productId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid product ID',
      });
      return;
    }

    if (quantity === undefined) {
      res.status(400).json({
        status: 'error',
        message: 'Quantity is required',
      });
      return;
    }

    const cart = await cartService.updateCartItem(userId, {
      productId,
      quantity: Number(quantity),
    });

    if (!cart) {
      res.status(404).json({
        status: 'error',
        message: 'Cart or item not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart
 */
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const productId = Number(req.params.productId);

    if (isNaN(productId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid product ID',
      });
      return;
    }

    const cart = await cartService.removeFromCart(userId, productId);

    if (!cart) {
      res.status(404).json({
        status: 'error',
        message: 'Cart or item not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart
 * Clear all items from cart
 */
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const cart = await cartService.clearCart(userId);

    if (!cart) {
      res.status(404).json({
        status: 'error',
        message: 'Cart not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cart/check/:productId
 * Check if item is in cart
 */
export const checkCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const productId = Number(req.params.productId);

    if (isNaN(productId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid product ID',
      });
      return;
    }

    const isInCart = await cartService.isInCart(userId, productId);

    res.status(200).json({
      status: 'success',
      data: { isInCart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cart/count
 * Get cart item count
 */
export const getCartCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const count = await cartService.getCartItemCount(userId);

    res.status(200).json({
      status: 'success',
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};
