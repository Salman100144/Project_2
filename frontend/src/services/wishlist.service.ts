import api from '../lib/axios';
import type {
  Wishlist,
  WishlistResponse,
  WishlistCountResponse,
  WishlistItemCheckResponse,
  MoveToCartResponse,
  AddToWishlistPayload,
} from '../types/wishlist.types';
import type { Cart } from '../types/cart.types';

/**
 * Wishlist Service
 * Handles all wishlist-related API calls
 */

/**
 * Get current user's wishlist
 */
export const getWishlist = async (): Promise<Wishlist> => {
  const response = await api.get<WishlistResponse>('/api/wishlist');
  return response.data.data;
};

/**
 * Add item to wishlist
 */
export const addToWishlist = async (
  payload: AddToWishlistPayload
): Promise<{ wishlist: Wishlist; added: boolean }> => {
  const response = await api.post<WishlistResponse>('/api/wishlist/items', payload);
  return {
    wishlist: response.data.data,
    added: response.data.added ?? true,
  };
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = async (productId: number): Promise<Wishlist> => {
  const response = await api.delete<WishlistResponse>(
    `/api/wishlist/items/${productId}`
  );
  return response.data.data;
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (): Promise<Wishlist> => {
  const response = await api.delete<WishlistResponse>('/api/wishlist');
  return response.data.data;
};

/**
 * Get wishlist item count
 */
export const getWishlistCount = async (): Promise<number> => {
  const response = await api.get<WishlistCountResponse>('/api/wishlist/count');
  return response.data.data.count;
};

/**
 * Check if item is in wishlist
 */
export const checkWishlistItem = async (productId: number): Promise<boolean> => {
  const response = await api.get<WishlistItemCheckResponse>(
    `/api/wishlist/check/${productId}`
  );
  return response.data.data.inWishlist;
};

/**
 * Move item from wishlist to cart
 */
export const moveToCart = async (
  productId: number
): Promise<{ cart: Cart; wishlist: Wishlist }> => {
  const response = await api.post<MoveToCartResponse>(
    `/api/wishlist/move-to-cart/${productId}`
  );
  return response.data.data;
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
  checkWishlistItem,
  moveToCart,
};
