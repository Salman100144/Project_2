import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Cart, CartItem, AddToCartPayload } from '../types/cart.types';
import * as cartService from '../services/cart.service';

/**
 * Cart Store State Interface
 */
interface CartState {
  // State
  cart: Cart | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Utility actions
  isInCart: (productId: number) => boolean;
  getCartItem: (productId: number) => CartItem | undefined;
  clearError: () => void;
}

/**
 * Cart Store
 * Manages cart state using Zustand
 */
export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      // Initial State
      cart: null,
      isLoading: false,
      isUpdating: false,
      error: null,

      /**
       * Fetch user's cart
       */
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const cart = await cartService.getCart();
          set({ cart, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch cart';
          set({ error: message, isLoading: false });
        }
      },

      /**
       * Add item to cart
       */
      addToCart: async (payload: AddToCartPayload) => {
        set({ isUpdating: true, error: null });
        
        try {
          const cart = await cartService.addToCart(payload);
          set({ cart, isUpdating: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add to cart';
          set({ error: message, isUpdating: false });
          throw error;
        }
      },

      /**
       * Update item quantity
       */
      updateQuantity: async (productId: number, quantity: number) => {
        set({ isUpdating: true, error: null });
        
        try {
          const cart = await cartService.updateCartItem(productId, { quantity });
          set({ cart, isUpdating: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update quantity';
          set({ error: message, isUpdating: false });
          throw error;
        }
      },

      /**
       * Remove item from cart
       */
      removeFromCart: async (productId: number) => {
        set({ isUpdating: true, error: null });
        
        try {
          const cart = await cartService.removeFromCart(productId);
          set({ cart, isUpdating: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to remove from cart';
          set({ error: message, isUpdating: false });
          throw error;
        }
      },

      /**
       * Clear entire cart
       */
      clearCart: async () => {
        set({ isUpdating: true, error: null });
        
        try {
          const cart = await cartService.clearCart();
          set({ cart, isUpdating: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to clear cart';
          set({ error: message, isUpdating: false });
          throw error;
        }
      },

      /**
       * Check if product is in cart
       */
      isInCart: (productId: number) => {
        const { cart } = get();
        return cart?.items.some((item) => item.productId === productId) ?? false;
      },

      /**
       * Get cart item by product ID
       */
      getCartItem: (productId: number) => {
        const { cart } = get();
        return cart?.items.find((item) => item.productId === productId);
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'cart-store' }
  )
);

/**
 * Selector hooks for specific cart data
 */
export const useCart = () => useCartStore((state) => state.cart);
export const useCartItems = () => useCartStore((state) => state.cart?.items ?? []);
export const useCartTotal = () => useCartStore((state) => state.cart?.totalPrice ?? 0);
export const useCartCount = () => useCartStore((state) => state.cart?.totalItems ?? 0);
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartUpdating = () => useCartStore((state) => state.isUpdating);
export const useCartError = () => useCartStore((state) => state.error);

export default useCartStore;
