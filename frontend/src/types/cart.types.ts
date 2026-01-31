/**
 * Cart Types
 * Matches backend cart model schema
 */

/**
 * Cart item interface
 */
export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
  title: string;
  thumbnail: string;
  addedAt: string;
}

/**
 * Cart interface
 */
export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add to cart request payload
 */
export interface AddToCartPayload {
  productId: number;
  quantity?: number;
  price: number;
  title: string;
  thumbnail: string;
}

/**
 * Update cart item request payload
 */
export interface UpdateCartItemPayload {
  quantity: number;
}

/**
 * Cart API response
 */
export interface CartResponse {
  status: 'success' | 'error';
  message?: string;
  data: Cart;
}

/**
 * Cart count response
 */
export interface CartCountResponse {
  status: 'success' | 'error';
  data: {
    count: number;
  };
}

/**
 * Cart item check response
 */
export interface CartItemCheckResponse {
  status: 'success' | 'error';
  data: {
    inCart: boolean;
    quantity?: number;
  };
}
