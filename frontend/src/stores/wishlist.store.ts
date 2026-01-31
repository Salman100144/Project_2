import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Wishlist, WishlistItem, AddToWishlistPayload } from '../types/wishlist.types';
import * as wishlistService from '../services/wishlist.service';
import { useCartStore } from './cart.store';

/**
 * Wishlist Store State Interface
 */
interface WishlistState {
  // State
  wishlist: Wishlist | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (payload: AddToWishlistPayload) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  moveToCart: (productId: number) => Promise<void>;
  toggleWishlist: (payload: AddToWishlistPayload) => Promise<void>;
  
  // Utility actions
  isInWishlist: (productId: number) => boolean;
  getWishlistItem: (productId: number) => WishlistItem | undefined;
  clearError: () => void;
}

/**
 * Wishlist Store
 * Manages wishlist state using Zustand
 */
export const useWishlistStore = create<WishlistState>()(
  devtools(
    (set, get) => ({
      // Initial State
      wishlist: null,
      isLoading: false,
      isUpdating: false,
      error: null,

      /**
       * Fetch user's wishlist
       */
      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const wishlist = await wishlistService.getWishlist();
          set({ wishlist, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch wishlist';
          set({ error: message, isLoading: false });
        }
      },

      /**
       * Add item to wishlist
       * Returns true if item was added, false if already exists
       */
      addToWishlist: async (payload: AddToWishlistPayload) => {
        set({ isUpdating: true, error: null });
        
        try {
          const { wishlist, added } = await wishlistService.addToWishlist(payload);
          set({ wishlist, isUpdating: false });
          return added;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add to wishlist';
          set({ error: message, isUpdating: false });
          throw error;
        }
      },

      /**
       * Remove item from wishlist
       */
      removeFromWishlist: async (productId: number) => {
        set({ isUpdating: true, error: null });
        
        try {
          const wishlist = await wishlistService.removeFromWishlist(productId);
          set({ wishlist, isUpdating: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to remove from wishlist';
          set({ error: message, isUpdating: false });
          throw error;
        }
      },

      /**
       * Clear entire wishlist
       */
      clearWishlist: async () => {
        set({ isUpdating: true, error: null });
        
        try {
          const wishlist = await wishlistService.clearWishlist();
          set({ wishlist, isUpdating: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to clear wishlist';
          set({ error: message, isUpdating: false });
          throw error;
        }
      },

      /**
       * Move item from wishlist to cart
       */
      moveToCart: async (productId: number) => {
        set({ isUpdating: true, error: null });
        
        try {
          const { cart, wishlist } = await wishlistService.moveToCart(productId);
          set({ wishlist, isUpdating: false });
          // Update cart store with new cart data
          useCartStore.setState({ cart });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to move to cart';
          set({ error: message, isUpdating: false });
          throw error;
        }
      },

      /**
       * Toggle item in wishlist (add if not present, remove if present)
       */
      toggleWishlist: async (payload: AddToWishlistPayload) => {
        const { isInWishlist, removeFromWishlist, addToWishlist } = get();
        
        if (isInWishlist(payload.productId)) {
          await removeFromWishlist(payload.productId);
        } else {
          await addToWishlist(payload);
        }
      },

      /**
       * Check if product is in wishlist
       */
      isInWishlist: (productId: number) => {
        const { wishlist } = get();
        return wishlist?.items.some((item) => item.productId === productId) ?? false;
      },

      /**
       * Get wishlist item by product ID
       */
      getWishlistItem: (productId: number) => {
        const { wishlist } = get();
        return wishlist?.items.find((item) => item.productId === productId);
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'wishlist-store' }
  )
);

/**
 * Selector hooks for specific wishlist data
 */
export const useWishlist = () => useWishlistStore((state) => state.wishlist);
export const useWishlistItems = () => useWishlistStore((state) => state.wishlist?.items ?? []);
export const useWishlistCount = () => useWishlistStore((state) => state.wishlist?.totalItems ?? 0);
export const useWishlistLoading = () => useWishlistStore((state) => state.isLoading);
export const useWishlistUpdating = () => useWishlistStore((state) => state.isUpdating);
export const useWishlistError = () => useWishlistStore((state) => state.error);

export default useWishlistStore;
