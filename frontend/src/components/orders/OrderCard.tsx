import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types/order.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ChevronRight, 
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  className?: string;
}

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return {
        icon: Clock,
        label: 'Pending',
        color: 'text-yellow-600 dark:text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      };
    case 'processing':
      return {
        icon: Package,
        label: 'Processing',
        color: 'text-blue-600 dark:text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      };
    case 'shipped':
      return {
        icon: Truck,
        label: 'Shipped',
        color: 'text-purple-600 dark:text-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      };
    case 'delivered':
      return {
        icon: CheckCircle,
        label: 'Delivered',
        color: 'text-green-600 dark:text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
      };
    case 'cancelled':
      return {
        icon: XCircle,
        label: 'Cancelled',
        color: 'text-red-600 dark:text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
      };
    default:
      return {
        icon: AlertCircle,
        label: status,
        color: 'text-gray-600 dark:text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function OrderCard({ order, className }: OrderCardProps) {
  const statusConfig = getStatusConfig(order.orderStatus);
  const StatusIcon = statusConfig.icon;

  // Show up to 3 item thumbnails
  const displayItems = order.items.slice(0, 3);
  const remainingItems = order.items.length - 3;

  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium text-sm">{order._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              statusConfig.bgColor,
              statusConfig.color
            )}>
              <StatusIcon className="h-4 w-4" />
              {statusConfig.label}
            </div>
          </div>

          {/* Items Preview */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-3">
              {displayItems.map((item, index) => (
                <div
                  key={item.productId}
                  className="relative h-14 w-14 rounded-lg border-2 border-background overflow-hidden bg-muted"
                  style={{ zIndex: displayItems.length - index }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {remainingItems > 0 && (
                <div
                  className="relative h-14 w-14 rounded-lg border-2 border-background bg-muted flex items-center justify-center"
                  style={{ zIndex: 0 }}
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    +{remainingItems}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {order.items.map(i => i.title).join(', ')}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-bold text-primary">${order.totalPrice.toFixed(2)}</p>
              </div>
            </div>
            
            <Button asChild variant="outline" size="sm">
              <Link to={`/orders/${order._id}`}>
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
