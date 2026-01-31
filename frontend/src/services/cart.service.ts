import api from '../lib/axios';
import type {
  Cart,
  CartResponse,
  CartCountResponse,
  CartItemCheckResponse,
  AddToCartPayload,
  UpdateCartItemPayload,
} from '../types/cart.types';

/**
 * Cart Service
 * Handles all cart-related API calls
 */

/**
 * Get current user's cart
 */
export const getCart = async (): Promise<Cart> => {
  const response = await api.get<CartResponse>('/api/cart');
  return response.data.data;
};

/**
 * Add item to cart
 */
export const addToCart = async (payload: AddToCartPayload): Promise<Cart> => {
  const response = await api.post<CartResponse>('/api/cart/items', payload);
  return response.data.data;
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  productId: number,
  payload: UpdateCartItemPayload
): Promise<Cart> => {
  const response = await api.put<CartResponse>(
    `/api/cart/items/${productId}`,
    payload
  );
  return response.data.data;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (productId: number): Promise<Cart> => {
  const response = await api.delete<CartResponse>(`/api/cart/items/${productId}`);
  return response.data.data;
};

/**
 * Clear entire cart
 */
export const clearCart = async (): Promise<Cart> => {
  const response = await api.delete<CartResponse>('/api/cart');
  return response.data.data;
};

/**
 * Get cart item count
 */
export const getCartCount = async (): Promise<number> => {
  const response = await api.get<CartCountResponse>('/api/cart/count');
  return response.data.data.count;
};

/**
 * Check if item is in cart
 */
export const checkCartItem = async (
  productId: number
): Promise<{ inCart: boolean; quantity?: number }> => {
  const response = await api.get<CartItemCheckResponse>(
    `/api/cart/check/${productId}`
  );
  return response.data.data;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  checkCartItem,
};
