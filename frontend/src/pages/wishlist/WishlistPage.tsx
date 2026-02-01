import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ArrowLeft,
  ShoppingBag,
  Loader2
} from 'lucide-react';

export function WishlistPage() {
  const { 
    wishlist, 
    isLoading, 
    isUpdating, 
    error,
    fetchWishlist, 
    removeFromWishlist, 
    moveToCart,
    clearWishlist 
  } = useWishlistStore();

  const { isInCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchWishlist}>Try Again</Button>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">
          Save items you love by clicking the heart icon on products.
        </p>
        <Button asChild>
          <Link to="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Explore Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/products" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold">My Wishlist ({wishlist.totalItems} items)</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.items.map((item) => {
          const inCart = isInCart(item.productId);
          
          return (
            <Card key={item.productId} className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="relative">
                <Link to={`/products/${item.productId}`}>
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromWishlist(item.productId)}
                  disabled={isUpdating}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <Link to={`/products/${item.productId}`}>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </Link>
                
                <p className="text-lg font-bold text-primary mb-4">
                  ${item.price.toFixed(2)}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => moveToCart(item.productId)}
                    disabled={isUpdating || inCart}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
                    {inCart ? 'In Cart' : 'Move to Cart'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => removeFromWishlist(item.productId)}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {wishlist.items.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={clearWishlist}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
