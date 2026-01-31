/**
 * Product Types
 * Matches DummyJSON API product schema
 * API Reference: https://dummyjson.com/docs/products
 */

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMeta;
  images: string[];
  thumbnail: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductMeta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

/**
 * API Response Types
 */
export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

/**
 * Query Parameters for fetching products
 */
export interface ProductsQueryParams {
  limit?: number;
  skip?: number;
  select?: string[];
  sortBy?: 'title' | 'price' | 'rating' | 'stock' | 'discountPercentage';
  order?: 'asc' | 'desc';
}

export interface ProductSearchParams extends ProductsQueryParams {
  q: string;
}

/**
 * Computed price after discount
 */
export const getDiscountedPrice = (product: Product): number => {
  return product.price * (1 - product.discountPercentage / 100);
};
