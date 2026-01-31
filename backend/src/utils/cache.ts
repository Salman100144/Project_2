/**
 * Cache Utility
 * Simple in-memory cache with TTL support for product data
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class CacheStore {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number; // TTL in milliseconds

  constructor(defaultTTLSeconds: number = 300) {
    // Default 5 minutes TTL
    this.defaultTTL = defaultTTLSeconds * 1000;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get a cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    const expiry = Date.now() + ttl;
    
    this.cache.set(key, { data, expiry });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear entries matching a pattern
   */
  clearPattern(pattern: string): number {
    let cleared = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache TTL configuration (in seconds)
export const CACHE_TTL = {
  PRODUCTS: 300,      // 5 minutes - product listings
  PRODUCT_SINGLE: 600, // 10 minutes - single product details
  CATEGORIES: 3600,    // 1 hour - categories rarely change
  SEARCH: 180,         // 3 minutes - search results
};

// Export singleton instance
export const productCache = new CacheStore(CACHE_TTL.PRODUCTS);

// Generate cache keys
export const cacheKeys = {
  products: (params: string) => `products:${params}`,
  product: (id: number) => `product:${id}`,
  categories: () => 'categories',
  categoryList: () => 'category-list',
  search: (query: string, params: string) => `search:${query}:${params}`,
  categoryProducts: (category: string, params: string) => `category:${category}:${params}`,
};
