import { useEffect } from 'react';
import { useProductStore } from '@/stores/product.store';
import { ProductGrid, ProductFilters, ProductPagination } from '@/components/products';
import { Loader2 } from 'lucide-react';

export function ProductsPage() {
  const { products, isLoading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground">
          Browse our collection of products
        </p>
      </div>

      <ProductFilters />

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading products...</span>
        </div>
      ) : (
        <>
          <ProductGrid products={products} />
          <ProductPagination />
        </>
      )}
    </div>
  );
}

export default ProductsPage;
