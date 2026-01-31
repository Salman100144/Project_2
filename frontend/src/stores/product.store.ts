import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  Product, 
  Category, 
  ProductsQueryParams 
} from '../types/product.types';
import * as productService from '../services/product.service';

/**
 * Product Store State Interface
 */
interface ProductState {
  // State
  products: Product[];
  selectedProduct: Product | null;
  categories: Category[];
  
  // Pagination
  total: number;
  skip: number;
  limit: number;
  currentPage: number;
  
  // Filters
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: ProductsQueryParams['sortBy'];
  sortOrder: 'asc' | 'desc';
  
  // Loading states
  isLoading: boolean;
  isLoadingProduct: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: (params?: ProductsQueryParams) => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductsByCategory: (category: string, params?: ProductsQueryParams) => Promise<void>;
  searchProducts: (query: string, params?: ProductsQueryParams) => Promise<void>;
  
  // Filter actions
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: ProductsQueryParams['sortBy'], order: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  
  // Utility actions
  clearSelectedProduct: () => void;
  clearFilters: () => void;
  clearError: () => void;
}

const DEFAULT_LIMIT = 12;

/**
 * Product Store
 * Manages product state using Zustand
 */
export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({
      // Initial State
      products: [],
      selectedProduct: null,
      categories: [],
      
      // Pagination
      total: 0,
      skip: 0,
      limit: DEFAULT_LIMIT,
      currentPage: 1,
      
      // Filters
      selectedCategory: null,
      searchQuery: '',
      sortBy: undefined,
      sortOrder: 'asc',
      
      // Loading states
      isLoading: false,
      isLoadingProduct: false,
      isLoadingCategories: false,
      error: null,

      /**
       * Fetch all products with optional params
       */
      fetchProducts: async (params?: ProductsQueryParams) => {
        set({ isLoading: true, error: null });
        
        try {
          const { limit, sortBy, sortOrder, currentPage } = get();
          
          const queryParams: ProductsQueryParams = {
            limit: params?.limit ?? limit,
            skip: params?.skip ?? (currentPage - 1) * limit,
            sortBy: params?.sortBy ?? sortBy,
            order: params?.order ?? sortOrder,
            ...params,
          };
          
          const response = await productService.getProducts(queryParams);
          
          set({
            products: response.products,
            total: response.total,
            skip: response.skip,
            limit: response.limit,
            isLoading: false,
            selectedCategory: null,
            searchQuery: '',
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch products',
          });
        }
      },

      /**
       * Fetch a single product by ID
       */
      fetchProductById: async (id: number) => {
        set({ isLoadingProduct: true, error: null });
        
        try {
          const product = await productService.getProductById(id);
          
          set({
            selectedProduct: product,
            isLoadingProduct: false,
          });
        } catch (error: any) {
          set({
            isLoadingProduct: false,
            error: error.message || 'Failed to fetch product',
          });
        }
      },

      /**
       * Fetch all categories
       */
      fetchCategories: async () => {
        set({ isLoadingCategories: true, error: null });
        
        try {
          const categories = await productService.getCategories();
          
          set({
            categories,
            isLoadingCategories: false,
          });
        } catch (error: any) {
          set({
            isLoadingCategories: false,
            error: error.message || 'Failed to fetch categories',
          });
        }
      },

      /**
       * Fetch products by category
       */
      fetchProductsByCategory: async (category: string, params?: ProductsQueryParams) => {
        set({ isLoading: true, error: null, selectedCategory: category });
        
        try {
          const { limit, sortBy, sortOrder, currentPage } = get();
          
          const queryParams: ProductsQueryParams = {
            limit: params?.limit ?? limit,
            skip: params?.skip ?? (currentPage - 1) * limit,
            sortBy: params?.sortBy ?? sortBy,
            order: params?.order ?? sortOrder,
            ...params,
          };
          
          const response = await productService.getProductsByCategory(category, queryParams);
          
          set({
            products: response.products,
            total: response.total,
            skip: response.skip,
            limit: response.limit,
            isLoading: false,
            searchQuery: '',
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch products by category',
          });
        }
      },

      /**
       * Search products
       */
      searchProducts: async (query: string, params?: ProductsQueryParams) => {
        set({ isLoading: true, error: null, searchQuery: query });
        
        try {
          const { limit, sortBy, sortOrder, currentPage } = get();
          
          const searchParams = {
            q: query,
            limit: params?.limit ?? limit,
            skip: params?.skip ?? (currentPage - 1) * limit,
            sortBy: params?.sortBy ?? sortBy,
            order: params?.order ?? sortOrder,
            ...params,
          };
          
          const response = await productService.searchProducts(searchParams);
          
          set({
            products: response.products,
            total: response.total,
            skip: response.skip,
            limit: response.limit,
            isLoading: false,
            selectedCategory: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to search products',
          });
        }
      },

      /**
       * Set selected category and fetch products
       */
      setSelectedCategory: (category: string | null) => {
        set({ selectedCategory: category, currentPage: 1 });
      },

      /**
       * Set search query
       */
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
      },

      /**
       * Set sorting options
       */
      setSorting: (sortBy: ProductsQueryParams['sortBy'], order: 'asc' | 'desc') => {
        set({ sortBy, sortOrder: order });
      },

      /**
       * Set current page for pagination
       */
      setPage: (page: number) => {
        set({ currentPage: page });
      },

      /**
       * Clear selected product
       */
      clearSelectedProduct: () => {
        set({ selectedProduct: null });
      },

      /**
       * Clear all filters
       */
      clearFilters: () => {
        set({
          selectedCategory: null,
          searchQuery: '',
          sortBy: undefined,
          sortOrder: 'asc',
          currentPage: 1,
        });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'product-store' }
  )
);
