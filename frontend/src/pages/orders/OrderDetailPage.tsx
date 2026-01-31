import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/stores/order.store';
import { 
  OrderStatusTracker, 
  OrderTimeline, 
  TrackingInfo 
} from '@/components/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  Package,
  MapPin,
  Receipt,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentStatus } from '@/types/order.types';

const getPaymentStatusConfig = (status: PaymentStatus) => {
  switch (status) {
    case 'paid':
      return { 
        label: 'Paid', 
        color: 'text-green-600 dark:text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/30' 
      };
    case 'pending':
      return { 
        label: 'Pending', 
        color: 'text-yellow-600 dark:text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' 
      };
    case 'failed':
      return { 
        label: 'Failed', 
        color: 'text-red-600 dark:text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30' 
      };
    case 'refunded':
      return { 
        label: 'Refunded', 
        color: 'text-purple-600 dark:text-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30' 
      };
    default:
      return { 
        label: status, 
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30' 
      };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentOrder, isLoading, error, fetchOrder } = useOrderStore();

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-lg font-medium">Order not found</p>
        <p className="text-muted-foreground">{error || 'The order you are looking for does not exist.'}</p>
        <Button onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const paymentConfig = getPaymentStatusConfig(currentOrder.paymentStatus);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/orders')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Order Details</h1>
            <p className="text-muted-foreground">
              <span className="font-mono">#{currentOrder._id.slice(-8).toUpperCase()}</span>
              <span className="mx-2">•</span>
              <span>Placed on {formatDate(currentOrder.createdAt)}</span>
            </p>
          </div>
          <div className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
            paymentConfig.bgColor,
            paymentConfig.color
          )}>
            <CreditCard className="h-4 w-4" />
            Payment: {paymentConfig.label}
          </div>
        </div>
      </div>

      {/* Status Tracker */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Status
          </CardTitle>
        </CardHeader>
        <OrderStatusTracker currentStatus={currentOrder.orderStatus} />
      </Card>

      {/* Tracking Info (if shipped) */}
      {currentOrder.trackingInfo && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <TrackingInfo trackingInfo={currentOrder.trackingInfo} />
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items Ordered ({currentOrder.totalItems})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentOrder.items.map((item) => (
                <div 
                  key={item.productId} 
                  className="flex gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Link to={`/products/${item.productId}`}>
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/products/${item.productId}`}
                      className="font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <OrderTimeline statusHistory={currentOrder.statusHistory} />
          </Card>
        </div>

        {/* Right Column - Summary & Address */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${currentOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{currentOrder.shipping === 0 ? 'Free' : `$${currentOrder.shipping.toFixed(2)}`}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${currentOrder.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">{currentOrder.shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}{' '}
                  {currentOrder.shippingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">{currentOrder.shippingAddress.country}</p>
                {currentOrder.shippingAddress.phone && (
                  <p className="text-muted-foreground pt-2">
                    Phone: {currentOrder.shippingAddress.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/products">Continue Shopping</Link>
            </Button>
            {currentOrder.orderStatus !== 'cancelled' && currentOrder.orderStatus !== 'delivered' && (
              <p className="text-xs text-center text-muted-foreground">
                Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
