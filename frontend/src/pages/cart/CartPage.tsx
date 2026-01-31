import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  ShoppingBag,
  Loader2
} from 'lucide-react';

export function CartPage() {
  const { 
    cart, 
    isLoading, 
    isUpdating, 
    error,
    fetchCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchCart}>Try Again</Button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild>
          <Link to="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
        <h1 className="text-2xl font-bold">Shopping Cart ({cart.totalItems} items)</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <div className="flex">
                <Link 
                  to={`/products/${item.productId}`} 
                  className="shrink-0"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-32 w-32 object-cover"
                  />
                </Link>
                <CardContent className="flex-1 p-4">
                  <div className="flex justify-between">
                    <div>
                      <Link 
                        to={`/products/${item.productId}`}
                        className="font-semibold hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <p className="text-lg font-bold text-primary mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.productId)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={isUpdating}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="ml-auto font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={clearCart}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({cart.totalItems} items)</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${cart.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4 mr-2" />
                )}
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
