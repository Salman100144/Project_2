import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types/product.types';
import { getDiscountedPrice } from '@/types/product.types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discountedPrice = getDiscountedPrice(product);
  const hasDiscount = product.discountPercentage > 0;

  return (
    <Card className={cn('group overflow-hidden transition-all hover:shadow-lg', className)}>
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute top-2 right-2 rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 rounded-full bg-gray-500 px-2 py-1 text-xs font-semibold text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/products/${product.id}`}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviews?.length || 0} reviews)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ${discountedPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <Button 
          size="sm" 
          className="w-full mt-3"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
