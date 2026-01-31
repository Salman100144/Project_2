/**
 * Product Service
 * Handles fetching products from DummyJSON API with caching layer
 */

import type {
  Product,
  ProductsResponse,
  ProductsQueryParams,
  ProductSearchParams,
  Category,
} from '../types/product.types';
import { productCache, cacheKeys, CACHE_TTL } from '../utils/cache';

const DUMMYJSON_BASE_URL = 'https://dummyjson.com';

/**
 * Build query string from params
 */
const buildQueryString = (params: ProductsQueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.skip !== undefined) {
    searchParams.append('skip', params.skip.toString());
  }
  if (params.select && params.select.length > 0) {
    searchParams.append('select', params.select.join(','));
  }
  if (params.sortBy) {
    searchParams.append('sortBy', params.sortBy);
  }
  if (params.order) {
    searchParams.append('order', params.order);
  }

  return searchParams.toString();
};

/**
 * Fetch wrapper with error handling
 */
const fetchFromDummyJSON = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${DUMMYJSON_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`DummyJSON API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
};

/**
 * Get all products with optional pagination and sorting
 * Results are cached for better performance
 */
export const getProducts = async (
  params: ProductsQueryParams = {}
): Promise<ProductsResponse> => {
  const queryString = buildQueryString(params);
  const cacheKey = cacheKeys.products(queryString);

  // Check cache first
  const cached = productCache.get<ProductsResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${cacheKey}`);
    return cached;
  }

  console.log(`[Cache MISS] ${cacheKey}`);
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
  const data = await fetchFromDummyJSON<ProductsResponse>(endpoint);

  // Store in cache
  productCache.set(cacheKey, data, CACHE_TTL.PRODUCTS);
  
  return data;
};

/**
 * Get a single product by ID
 * Single products cached longer as they change less frequently
 */
export const getProductById = async (id: number): Promise<Product> => {
  const cacheKey = cacheKeys.product(id);

  // Check cache first
  const cached = productCache.get<Product>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${cacheKey}`);
    return cached;
  }

  console.log(`[Cache MISS] ${cacheKey}`);
  const data = await fetchFromDummyJSON<Product>(`/products/${id}`);

  // Store in cache with longer TTL
  productCache.set(cacheKey, data, CACHE_TTL.PRODUCT_SINGLE);
  
  return data;
};

/**
 * Search products by query string
 */
export const searchProducts = async (
  params: ProductSearchParams
): Promise<ProductsResponse> => {
  const { q, ...restParams } = params;
  const queryString = buildQueryString(restParams);
  const cacheKey = cacheKeys.search(q, queryString);

  // Check cache first
  const cached = productCache.get<ProductsResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${cacheKey}`);
    return cached;
  }

  console.log(`[Cache MISS] ${cacheKey}`);
  const searchQuery = `q=${encodeURIComponent(q)}`;
  const fullQuery = queryString ? `${searchQuery}&${queryString}` : searchQuery;
  const data = await fetchFromDummyJSON<ProductsResponse>(`/products/search?${fullQuery}`);

  // Store in cache
  productCache.set(cacheKey, data, CACHE_TTL.SEARCH);
  
  return data;
};

/**
 * Get all product categories
 * Categories cached longest as they rarely change
 */
export const getCategories = async (): Promise<Category[]> => {
  const cacheKey = cacheKeys.categories();

  // Check cache first
  const cached = productCache.get<Category[]>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${cacheKey}`);
    return cached;
  }

  console.log(`[Cache MISS] ${cacheKey}`);
  const data = await fetchFromDummyJSON<Category[]>('/products/categories');

  // Store in cache with longest TTL
  productCache.set(cacheKey, data, CACHE_TTL.CATEGORIES);
  
  return data;
};

/**
 * Get category list (just names/slugs)
 */
export const getCategoryList = async (): Promise<string[]> => {
  const cacheKey = cacheKeys.categoryList();

  // Check cache first
  const cached = productCache.get<string[]>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${cacheKey}`);
    return cached;
  }

  console.log(`[Cache MISS] ${cacheKey}`);
  const data = await fetchFromDummyJSON<string[]>('/products/category-list');

  // Store in cache with longest TTL
  productCache.set(cacheKey, data, CACHE_TTL.CATEGORIES);
  
  return data;
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: string,
  params: ProductsQueryParams = {}
): Promise<ProductsResponse> => {
  const queryString = buildQueryString(params);
  const cacheKey = cacheKeys.categoryProducts(category, queryString);

  // Check cache first
  const cached = productCache.get<ProductsResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${cacheKey}`);
    return cached;
  }

  console.log(`[Cache MISS] ${cacheKey}`);
  const endpoint = `/products/category/${encodeURIComponent(category)}${queryString ? `?${queryString}` : ''}`;
  const data = await fetchFromDummyJSON<ProductsResponse>(endpoint);

  // Store in cache
  productCache.set(cacheKey, data, CACHE_TTL.PRODUCTS);
  
  return data;
};

/**
 * Clear all product cache
 * Useful for admin operations or manual refresh
 */
export const clearProductCache = (): { cleared: boolean; stats: { size: number } } => {
  productCache.clear();
  return {
    cleared: true,
    stats: productCache.getStats(),
  };
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return productCache.getStats();
};
