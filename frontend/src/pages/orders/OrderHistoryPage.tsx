import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '@/stores/order.store';
import { OrderCard } from '@/components/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { OrderStatus } from '@/types/order.types';
import { 
  Package, 
  Loader2, 
  ShoppingBag,
  Filter,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterStatus = OrderStatus | 'all';

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function OrderHistoryPage() {
  const { orders, isLoading, error, fetchOrders } = useOrderStore();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.orderStatus === statusFilter;
  });

  // Sort orders by date (most recent first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Package className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-lg font-medium">Failed to load orders</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => fetchOrders()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order History</h1>
        <p className="text-muted-foreground">
          View and track all your orders
        </p>
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link to="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    'transition-all',
                    statusFilter === filter.value && 'shadow-md'
                  )}
                >
                  {filter.label}
                  {statusFilter === filter.value && filter.value !== 'all' && (
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter('all');
                      }}
                    />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Orders Count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {sortedOrders.length} of {orders.length} orders
          </p>

          {/* Orders List */}
          {sortedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">No orders found</p>
                <p className="text-muted-foreground text-sm">
                  No orders match the selected filter
                </p>
                <Button 
                  variant="link" 
                  onClick={() => setStatusFilter('all')}
                  className="mt-2"
                >
                  Clear filter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
