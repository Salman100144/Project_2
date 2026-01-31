/**
 * Wishlist Controller
 * Handles HTTP requests for wishlist operations
 */

import { Request, Response, NextFunction } from 'express';
import * as wishlistService from '../services/wishlist.service';
import * as cartService from '../services/cart.service';

/**
 * GET /api/wishlist
 * Get current user's wishlist
 */
export const getWishlist = async (
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

    const wishlist = await wishlistService.getWishlist(userId);
    
    res.status(200).json({
      status: 'success',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlist/items
 * Add item to wishlist
 */
export const addToWishlist = async (
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

    const { productId, title, price, thumbnail } = req.body;

    // Validation
    if (!productId || !title || !price || !thumbnail) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required fields: productId, title, price, thumbnail',
      });
      return;
    }

    const { wishlist, added } = await wishlistService.addToWishlist(userId, {
      productId: Number(productId),
      title,
      price: Number(price),
      thumbnail,
    });

    res.status(200).json({
      status: 'success',
      message: added ? 'Item added to wishlist' : 'Item already in wishlist',
      data: wishlist,
      added,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist/items/:productId
 * Remove item from wishlist
 */
export const removeFromWishlist = async (
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

    const wishlist = await wishlistService.removeFromWishlist(userId, productId);

    if (!wishlist) {
      res.status(404).json({
        status: 'error',
        message: 'Wishlist or item not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Item removed from wishlist',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist
 * Clear all items from wishlist
 */
export const clearWishlist = async (
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

    const wishlist = await wishlistService.clearWishlist(userId);

    if (!wishlist) {
      res.status(404).json({
        status: 'error',
        message: 'Wishlist not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Wishlist cleared',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/wishlist/check/:productId
 * Check if item is in wishlist
 */
export const checkWishlistItem = async (
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

    const isInWishlist = await wishlistService.isInWishlist(userId, productId);

    res.status(200).json({
      status: 'success',
      data: { isInWishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/wishlist/count
 * Get wishlist item count
 */
export const getWishlistCount = async (
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

    const count = await wishlistService.getWishlistItemCount(userId);

    res.status(200).json({
      status: 'success',
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlist/move-to-cart/:productId
 * Move item from wishlist to cart
 */
export const moveToCart = async (
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

    // Get item from wishlist and remove it
    const item = await wishlistService.moveToCart(userId, productId);

    if (!item) {
      res.status(404).json({
        status: 'error',
        message: 'Wishlist or item not found',
      });
      return;
    }

    // Add item to cart
    const cart = await cartService.addToCart(userId, {
      productId: item.productId,
      quantity: 1,
      price: item.price,
      title: item.title,
      thumbnail: item.thumbnail,
    });

    // Get updated wishlist
    const wishlist = await wishlistService.getWishlist(userId);

    res.status(200).json({
      status: 'success',
      message: 'Item moved to cart',
      data: {
        cart,
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};
