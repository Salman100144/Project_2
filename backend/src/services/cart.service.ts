/**
 * Cart Service
 * Handles business logic for cart operations
 */

import Cart, { ICartDocument, ICartItem } from '../models/cart.model';

export interface AddToCartInput {
  productId: number;
  quantity: number;
  price: number;
  title: string;
  thumbnail: string;
}

export interface UpdateCartItemInput {
  productId: number;
  quantity: number;
}

/**
 * Get cart by user ID
 */
export const getCart = async (userId: string): Promise<ICartDocument> => {
  return Cart.getOrCreate(userId);
};

/**
 * Add item to cart
 * If item already exists, increase quantity
 */
export const addToCart = async (
  userId: string,
  input: AddToCartInput
): Promise<ICartDocument> => {
  const cart = await Cart.getOrCreate(userId);
  
  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId === input.productId
  );

  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += input.quantity;
    // Update price in case it changed
    cart.items[existingItemIndex].price = input.price;
  } else {
    // Add new item
    const newItem: ICartItem = {
      productId: input.productId,
      quantity: input.quantity,
      price: input.price,
      title: input.title,
      thumbnail: input.thumbnail,
      addedAt: new Date(),
    };
    cart.items.push(newItem);
  }

  await cart.save();
  return cart;
};

/**
 * Update item quantity in cart
 */
export const updateCartItem = async (
  userId: string,
  input: UpdateCartItemInput
): Promise<ICartDocument | null> => {
  const cart = await Cart.findByUserId(userId);
  
  if (!cart) {
    return null;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId === input.productId
  );

  if (itemIndex === -1) {
    return null;
  }

  if (input.quantity <= 0) {
    // Remove item if quantity is 0 or less
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = input.quantity;
  }

  await cart.save();
  return cart;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (
  userId: string,
  productId: number
): Promise<ICartDocument | null> => {
  const cart = await Cart.findByUserId(userId);
  
  if (!cart) {
    return null;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId === productId
  );

  if (itemIndex === -1) {
    return null;
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  return cart;
};

/**
 * Clear all items from cart
 */
export const clearCart = async (userId: string): Promise<ICartDocument | null> => {
  const cart = await Cart.findByUserId(userId);
  
  if (!cart) {
    return null;
  }

  cart.items = [];
  await cart.save();
  return cart;
};

/**
 * Check if item exists in cart
 */
export const isInCart = async (
  userId: string,
  productId: number
): Promise<boolean> => {
  const cart = await Cart.findByUserId(userId);
  
  if (!cart) {
    return false;
  }

  return cart.items.some((item) => item.productId === productId);
};

/**
 * Get cart item count
 */
export const getCartItemCount = async (userId: string): Promise<number> => {
  const cart = await Cart.findByUserId(userId);
  return cart?.totalItems || 0;
};
