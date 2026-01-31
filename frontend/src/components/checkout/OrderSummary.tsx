import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Cart } from '@/types/cart.types';

interface OrderSummaryProps {
  cart: Cart;
  tax?: number;
  shipping?: number;
}

export function OrderSummary({ cart, tax = 0, shipping = 0 }: OrderSummaryProps) {
  const subtotal = cart.totalPrice;
  const calculatedTax = tax || subtotal * 0.1; // 10% tax if not provided
  const total = subtotal + calculatedTax + shipping;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-16 w-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <hr />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({cart.totalItems} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span>${calculatedTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className={shipping === 0 ? 'text-green-600' : ''}>
              {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <hr />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderSummary;
