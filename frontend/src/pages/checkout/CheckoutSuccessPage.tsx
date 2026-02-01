import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useOrderStore } from '@/stores/order.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const { currentOrder, fetchOrder, isLoading } = useOrderStore();

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      {/* Success Icon */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

      {/* Order Details */}
      {currentOrder && (
        <Card className="text-left mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <p className="font-mono font-medium">{currentOrder._id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">
                  {new Date(currentOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium capitalize">{currentOrder.orderStatus}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment:</span>
                <p className="font-medium capitalize text-green-600">
                  {currentOrder.paymentStatus}
                </p>
              </div>
            </div>

            <hr />

            {/* Items */}
            <div className="space-y-3">
              <h4 className="font-semibold">Items Ordered</h4>
              {currentOrder.items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-16 w-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <hr />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${currentOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{currentOrder.shipping === 0 ? 'Free' : `$${currentOrder.shipping.toFixed(2)}`}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${currentOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <hr />

            {/* Shipping Address */}
            <div>
              <h4 className="font-semibold mb-2">Shipping Address</h4>
              <div className="text-sm text-muted-foreground">
                <p>{currentOrder.shippingAddress.fullName}</p>
                <p>{currentOrder.shippingAddress.address}</p>
                <p>
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}{' '}
                  {currentOrder.shippingAddress.postalCode}
                </p>
                <p>{currentOrder.shippingAddress.country}</p>
                {currentOrder.shippingAddress.phone && (
                  <p>Phone: {currentOrder.shippingAddress.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link to="/orders">
            View All Orders
          </Link>
        </Button>
        <Button asChild>
          <Link to="/products">
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;
