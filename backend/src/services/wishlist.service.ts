/**
 * Wishlist Service
 * Handles business logic for wishlist operations
 */

import Wishlist, { IWishlistDocument, IWishlistItem } from '../models/wishlist.model';

export interface AddToWishlistInput {
  productId: number;
  title: string;
  price: number;
  thumbnail: string;
}

/**
 * Get wishlist by user ID
 */
export const getWishlist = async (userId: string): Promise<IWishlistDocument> => {
  return Wishlist.getOrCreate(userId);
};

/**
 * Add item to wishlist
 * If item already exists, do nothing (return existing wishlist)
 */
export const addToWishlist = async (
  userId: string,
  input: AddToWishlistInput
): Promise<{ wishlist: IWishlistDocument; added: boolean }> => {
  const wishlist = await Wishlist.getOrCreate(userId);
  
  // Check if item already exists in wishlist
  const existingItem = wishlist.items.find(
    (item) => item.productId === input.productId
  );

  if (existingItem) {
    // Item already exists
    return { wishlist, added: false };
  }

  // Add new item
  const newItem: IWishlistItem = {
    productId: input.productId,
    title: input.title,
    price: input.price,
    thumbnail: input.thumbnail,
    addedAt: new Date(),
  };
  wishlist.items.push(newItem);

  await wishlist.save();
  return { wishlist, added: true };
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = async (
  userId: string,
  productId: number
): Promise<IWishlistDocument | null> => {
  const wishlist = await Wishlist.findByUserId(userId);
  
  if (!wishlist) {
    return null;
  }

  const itemIndex = wishlist.items.findIndex(
    (item) => item.productId === productId
  );

  if (itemIndex === -1) {
    return null;
  }

  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();
  return wishlist;
};

/**
 * Clear all items from wishlist
 */
export const clearWishlist = async (userId: string): Promise<IWishlistDocument | null> => {
  const wishlist = await Wishlist.findByUserId(userId);
  
  if (!wishlist) {
    return null;
  }

  wishlist.items = [];
  await wishlist.save();
  return wishlist;
};

/**
 * Check if item exists in wishlist
 */
export const isInWishlist = async (
  userId: string,
  productId: number
): Promise<boolean> => {
  const wishlist = await Wishlist.findByUserId(userId);
  
  if (!wishlist) {
    return false;
  }

  return wishlist.items.some((item) => item.productId === productId);
};

/**
 * Get wishlist item count
 */
export const getWishlistItemCount = async (userId: string): Promise<number> => {
  const wishlist = await Wishlist.findByUserId(userId);
  return wishlist?.totalItems || 0;
};

/**
 * Move item from wishlist to cart
 * Returns the productId for cart service to add
 */
export const moveToCart = async (
  userId: string,
  productId: number
): Promise<IWishlistItem | null> => {
  const wishlist = await Wishlist.findByUserId(userId);
  
  if (!wishlist) {
    return null;
  }

  const itemIndex = wishlist.items.findIndex(
    (item) => item.productId === productId
  );

  if (itemIndex === -1) {
    return null;
  }

  // Get the item before removing - convert to plain object
  const wishlistItem = wishlist.items[itemIndex];
  const item: IWishlistItem = {
    productId: wishlistItem.productId,
    title: wishlistItem.title,
    price: wishlistItem.price,
    thumbnail: wishlistItem.thumbnail,
    addedAt: wishlistItem.addedAt,
  };
  
  // Remove from wishlist
  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  return item;
};
