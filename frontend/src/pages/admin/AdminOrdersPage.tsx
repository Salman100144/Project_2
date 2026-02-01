/**
 * Admin Orders Page
 * Order management for administrators
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAdminStore } from '@/stores/admin.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ShoppingCart,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  X,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order.types';
import type { AdminOrderItem, UpdateOrderStatusPayload } from '@/types/admin.types';

const statusConfig: Record<OrderStatus, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Pending' },
  processing: { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
};

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    orders,
    ordersTotal,
    ordersPage,
    ordersPages,
    ordersLoading,
    ordersError,
    orderFilters,
    selectedOrders,
    fetchOrders,
    updateOrderStatus,
    bulkUpdateOrderStatus,
    toggleOrderSelection,
    selectAllOrders,
    clearOrderSelection,
  } = useAdminStore();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [showStatusModal, setShowStatusModal] = useState<AdminOrderItem | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('processing');
  const [bulkNote, setBulkNote] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const filters = {
      status: (searchParams.get('status') as OrderStatus) || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: 20,
      sortBy: orderFilters.sortBy,
      order: orderFilters.order,
    };
    fetchOrders(filters);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleStatusFilter = (status: OrderStatus | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleDateFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    } else {
      params.delete('dateFrom');
    }
    if (dateTo) {
      params.set('dateTo', dateTo);
    } else {
      params.delete('dateTo');
    }
    params.set('page', '1');
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearDateFilters = () => {
    setDateFrom('');
    setDateTo('');
    const params = new URLSearchParams(searchParams);
    params.delete('dateFrom');
    params.delete('dateTo');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const openStatusModal = (order: AdminOrderItem) => {
    setShowStatusModal(order);
    setNewStatus(order.orderStatus);
    setStatusNote('');
    setTrackingCarrier(order.trackingInfo?.carrier || '');
    setTrackingNumber(order.trackingInfo?.trackingNumber || '');
    setEstimatedDelivery(order.trackingInfo?.estimatedDelivery || '');
  };

  const handleStatusUpdate = async () => {
    if (!showStatusModal) return;

    setStatusUpdateLoading(true);

    const payload: UpdateOrderStatusPayload = {
      status: newStatus,
      note: statusNote || undefined,
    };

    // Add tracking info if status is shipped
    if (newStatus === 'shipped') {
      payload.trackingInfo = {
        carrier: trackingCarrier || undefined,
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
      };
    }

    const success = await updateOrderStatus(showStatusModal._id, payload);
    setStatusUpdateLoading(false);

    if (success) {
      setShowStatusModal(null);
    } else {
      alert('Failed to update order status');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedOrders.length === 0) return;

    setBulkLoading(true);
    const success = await bulkUpdateOrderStatus({
      orderIds: selectedOrders,
      status: bulkStatus,
      note: bulkNote || undefined,
    });
    setBulkLoading(false);

    if (success) {
      setShowBulkModal(false);
      setBulkNote('');
    } else {
      alert('Failed to update orders');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const currentStatus = searchParams.get('status');
  const hasDateFilters = searchParams.get('dateFrom') || searchParams.get('dateTo');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedOrders.length} selected
            </span>
            <Button variant="outline" size="sm" onClick={clearOrderSelection}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setShowBulkModal(true)}>
              Bulk Update
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Date Filter Toggle */}
            <Button
              variant={hasDateFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {hasDateFilters ? 'Filters Active' : 'Date Filter'}
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!currentStatus ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(undefined)}
            >
              All
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={status}
                  variant={currentStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter(status as OrderStatus)}
                >
                  <Icon className={cn('h-4 w-4 mr-1', currentStatus !== status && config.color)} />
                  {config.label}
                </Button>
              );
            })}
          </div>

          {/* Date Filter Panel */}
          {showFilters && (
            <div className="flex flex-wrap items-end gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm">From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div>
                <Label className="text-sm">To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={handleDateFilter}>Apply</Button>
              {hasDateFilters && (
                <Button variant="ghost" onClick={clearDateFilters}>
                  Clear Dates
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Orders ({ordersTotal})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading && orders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ordersError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive">{ordersError}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={() => {
                    if (selectedOrders.length === orders.length) {
                      clearOrderSelection();
                    } else {
                      selectAllOrders();
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>

              {/* Orders */}
              <div className="space-y-4">
                {orders.map((order) => {
                  const config = statusConfig[order.orderStatus];
                  const Icon = config.icon;
                  const isSelected = selectedOrders.includes(order._id);

                  return (
                    <div
                      key={order._id}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                        isSelected && 'border-primary bg-primary/5'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="w-4 h-4 mt-1 rounded border-gray-300"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                                  config.bgColor,
                                  config.color
                                )}
                              >
                                <Icon className="h-3 w-3" />
                                {config.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {order.userName || order.userEmail || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(order.totalPrice)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.totalItems} items
                            </p>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex items-center gap-2 mt-3">
                          {order.items.slice(0, 4).map((item, index) => (
                            <img
                              key={index}
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-10 h-10 rounded object-cover border"
                              title={item.title}
                            />
                          ))}
                          {order.items.length > 4 && (
                            <span className="text-sm text-muted-foreground">
                              +{order.items.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Shipping Address Preview */}
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link to={`/admin/orders/${order._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStatusModal(order)}
                        >
                          Update Status
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {ordersPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {ordersPage} of {ordersPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(ordersPage - 1)}
                      disabled={ordersPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(ordersPage + 1)}
                      disabled={ordersPage >= ordersPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Update Order Status</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStatusModal(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Order #{showStatusModal._id.slice(-8)}
                </p>
                <p className="font-medium">
                  {showStatusModal.userName || showStatusModal.userEmail}
                </p>
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label>New Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setNewStatus(status as OrderStatus)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                          newStatus === status
                            ? 'border-primary bg-primary/10'
                            : 'hover:border-muted-foreground/50'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', config.color)} />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  placeholder="Add a note about this status change"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>

              {/* Tracking Info (for shipped status) */}
              {newStatus === 'shipped' && (
                <div className="space-y-3 p-4 rounded-lg bg-muted">
                  <Label className="font-medium">Tracking Information</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Carrier (e.g., UPS, FedEx)"
                      value={trackingCarrier}
                      onChange={(e) => setTrackingCarrier(e.target.value)}
                    />
                    <Input
                      placeholder="Tracking Number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Estimated Delivery"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowStatusModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleStatusUpdate}
                  disabled={statusUpdateLoading || newStatus === showStatusModal.orderStatus}
                >
                  {statusUpdateLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Bulk Update Orders</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBulkModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Update {selectedOrders.length} selected orders
              </p>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label>New Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setBulkStatus(status as OrderStatus)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                          bulkStatus === status
                            ? 'border-primary bg-primary/10'
                            : 'hover:border-muted-foreground/50'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', config.color)} />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="bulkNote">Note (Optional)</Label>
                <Input
                  id="bulkNote"
                  placeholder="Add a note for all orders"
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBulkUpdate}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Update {selectedOrders.length} Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
