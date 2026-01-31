/**
 * Wishlist Types
 * Matches backend wishlist model schema
 */

/**
 * Wishlist item interface
 */
export interface WishlistItem {
  productId: number;
  title: string;
  price: number;
  thumbnail: string;
  addedAt: string;
}

/**
 * Wishlist interface
 */
export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add to wishlist request payload
 */
export interface AddToWishlistPayload {
  productId: number;
  title: string;
  price: number;
  thumbnail: string;
}

/**
 * Wishlist API response
 */
export interface WishlistResponse {
  status: 'success' | 'error';
  message?: string;
  data: Wishlist;
  added?: boolean;
}

/**
 * Wishlist count response
 */
export interface WishlistCountResponse {
  status: 'success' | 'error';
  data: {
    count: number;
  };
}

/**
 * Wishlist item check response
 */
export interface WishlistItemCheckResponse {
  status: 'success' | 'error';
  data: {
    inWishlist: boolean;
  };
}

/**
 * Move to cart response
 */
export interface MoveToCartResponse {
  status: 'success' | 'error';
  message?: string;
  data: {
    cart: import('./cart.types').Cart;
    wishlist: Wishlist;
  };
}
