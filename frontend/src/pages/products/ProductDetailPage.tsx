import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductStore } from '@/stores/product.store';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDiscountedPrice } from '@/types/product.types';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  Shield, 
  RotateCcw,
  Loader2,
  Package,
  Plus,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  
  const { 
    selectedProduct: product, 
    isLoadingProduct, 
    error, 
    fetchProductById,
    clearSelectedProduct 
  } = useProductStore();

  // Cart state
  const { addToCart, isInCart, getCartItem, isUpdating: isCartUpdating } = useCartStore();
  const productInCart = product ? isInCart(product.id) : false;
  const cartItem = product ? getCartItem(product.id) : undefined;

  // Wishlist state
  const { toggleWishlist, isInWishlist, isUpdating: isWishlistUpdating } = useWishlistStore();
  const productInWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (id) {
      fetchProductById(parseInt(id));
    }
    
    return () => {
      clearSelectedProduct();
    };
  }, [id, fetchProductById, clearSelectedProduct]);

  const handleAddToCart = async () => {
    if (!product || productInCart || product.stock === 0) return;

    const discountedPrice = getDiscountedPrice(product);
    
    try {
      await addToCart({
        productId: product.id,
        quantity,
        price: discountedPrice,
        title: product.title,
        thumbnail: product.thumbnail,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    const discountedPrice = getDiscountedPrice(product);

    try {
      await toggleWishlist({
        productId: product.id,
        title: product.title,
        price: discountedPrice,
        thumbnail: product.thumbnail,
      });
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg font-medium text-destructive mb-4">
          {error || 'Product not found'}
        </p>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  const discountedPrice = getDiscountedPrice(product);
  const hasDiscount = product.discountPercentage > 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/products')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.images[0] || product.thumbnail}
              alt={product.title}
              className="h-full w-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                -{Math.round(product.discountPercentage)}% OFF
              </span>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer"
                >
                  <img
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <Link 
              to={`/products?category=${product.category}`}
              className="text-sm text-muted-foreground uppercase tracking-wide hover:text-primary"
            >
              {product.category}
            </Link>
            <h1 className="text-3xl font-bold mt-1">{product.title}</h1>
            {product.brand && (
              <p className="text-muted-foreground">by {product.brand}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              ${discountedPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {product.stock > 0 ? (
              <span className={product.stock < 10 ? 'text-orange-500' : 'text-green-500'}>
                {product.stock < 10 
                  ? `Only ${product.stock} left in stock` 
                  : `In Stock (${product.stock} available)`}
              </span>
            ) : (
              <span className="text-destructive">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Actions */}
          <div className="space-y-4">
            {/* Quantity Selector */}
            {!productInCart && product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Cart Info */}
            {productInCart && cartItem && (
              <p className="text-sm text-green-600">
                ✓ {cartItem.quantity} item(s) in your cart
              </p>
            )}

            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="flex-1" 
                disabled={product.stock === 0 || productInCart || isCartUpdating}
                onClick={handleAddToCart}
              >
                {isCartUpdating ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5 mr-2" />
                )}
                {product.stock === 0 
                  ? 'Out of Stock' 
                  : productInCart 
                    ? 'Added to Cart' 
                    : 'Add to Cart'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleToggleWishlist}
                disabled={isWishlistUpdating}
                className={cn(
                  productInWishlist && 'border-red-500 text-red-500 hover:bg-red-50'
                )}
              >
                {isWishlistUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart 
                    className={cn(
                      'h-5 w-5',
                      productInWishlist && 'fill-red-500 text-red-500'
                    )} 
                  />
                )}
              </Button>
            </div>
          </div>

          {/* Features */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{product.shippingInformation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{product.warrantyInformation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{product.returnPolicy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="grid gap-4">
            {product.reviews.map((review, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{review.reviewerName}</span>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
