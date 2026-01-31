import axios from 'axios';
import type {
  Product,
  ProductsResponse,
  ProductsQueryParams,
  ProductSearchParams,
  Category,
} from '../types/product.types';

/**
 * Product Service
 * Handles all product-related API calls to DummyJSON
 * API Reference: https://dummyjson.com/docs/products
 */

const DUMMYJSON_BASE_URL = 'https://dummyjson.com';

// Create a separate axios instance for DummyJSON API
const dummyJsonApi = axios.create({
  baseURL: DUMMYJSON_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Get all products with optional pagination and sorting
 */
export const getProducts = async (
  params: ProductsQueryParams = {}
): Promise<ProductsResponse> => {
  const queryString = buildQueryString(params);
  const response = await dummyJsonApi.get<ProductsResponse>(`/products${queryString}`);
  return response.data;
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: number): Promise<Product> => {
  const response = await dummyJsonApi.get<Product>(`/products/${id}`);
  return response.data;
};

/**
 * Search products by query string
 */
export const searchProducts = async (
  params: ProductSearchParams
): Promise<ProductsResponse> => {
  const { q, ...restParams } = params;
  const baseQuery = `?q=${encodeURIComponent(q)}`;
  
  const additionalParams = new URLSearchParams();
  if (restParams.limit !== undefined) {
    additionalParams.append('limit', restParams.limit.toString());
  }
  if (restParams.skip !== undefined) {
    additionalParams.append('skip', restParams.skip.toString());
  }
  if (restParams.sortBy) {
    additionalParams.append('sortBy', restParams.sortBy);
  }
  if (restParams.order) {
    additionalParams.append('order', restParams.order);
  }

  const additionalQuery = additionalParams.toString();
  const queryString = additionalQuery ? `${baseQuery}&${additionalQuery}` : baseQuery;

  const response = await dummyJsonApi.get<ProductsResponse>(`/products/search${queryString}`);
  return response.data;
};

/**
 * Get all product categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await dummyJsonApi.get<Category[]>('/products/categories');
  return response.data;
};

/**
 * Get category list (just names/slugs)
 */
export const getCategoryList = async (): Promise<string[]> => {
  const response = await dummyJsonApi.get<string[]>('/products/category-list');
  return response.data;
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: string,
  params: ProductsQueryParams = {}
): Promise<ProductsResponse> => {
  const queryString = buildQueryString(params);
  const response = await dummyJsonApi.get<ProductsResponse>(
    `/products/category/${encodeURIComponent(category)}${queryString}`
  );
  return response.data;
};
