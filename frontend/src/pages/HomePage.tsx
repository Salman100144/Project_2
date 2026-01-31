import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useProductStore } from '@/stores/product.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductGrid } from '@/components/products';
import { ArrowRight, Loader2 } from 'lucide-react';

export function HomePage() {
  const { user } = useAuthStore();
  const { products, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    // Fetch featured products (first 8)
    fetchProducts({ limit: 8 });
  }, [fetchProducts]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back, {user?.name}! 👋</CardTitle>
          <CardDescription>
            Discover amazing products at great prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Link to="/products">
              <Button>
                Browse All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground">Check out our latest arrivals</p>
          </div>
          <Link to="/products">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading products...</span>
          </div>
        ) : (
          <ProductGrid products={products.slice(0, 8)} />
        )}
      </section>
    </div>
  );
}

export default HomePage;
