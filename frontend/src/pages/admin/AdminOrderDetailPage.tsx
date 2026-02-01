/**
 * Admin Order Detail Page
 * Detailed view of a single order for admin
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminStore } from '@/stores/admin.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  User,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order.types';
import type { UpdateOrderStatusPayload } from '@/types/admin.types';

const statusConfig: Record<OrderStatus, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Pending' },
  processing: { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
};

export function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { selectedOrder, selectedOrderLoading, fetchOrderById, updateOrderStatus, clearSelectedOrder } = useAdminStore();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
    return () => clearSelectedOrder();
  }, [orderId, fetchOrderById, clearSelectedOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const openStatusModal = () => {
    if (!selectedOrder) return;
    setNewStatus(selectedOrder.orderStatus);
    setStatusNote('');
    setTrackingCarrier(selectedOrder.trackingInfo?.carrier || '');
    setTrackingNumber(selectedOrder.trackingInfo?.trackingNumber || '');
    setEstimatedDelivery(selectedOrder.trackingInfo?.estimatedDelivery || '');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    setStatusUpdateLoading(true);

    const payload: UpdateOrderStatusPayload = {
      status: newStatus,
      note: statusNote || undefined,
    };

    if (newStatus === 'shipped') {
      payload.trackingInfo = {
        carrier: trackingCarrier || undefined,
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
      };
    }

    const success = await updateOrderStatus(selectedOrder._id, payload);
    setStatusUpdateLoading(false);

    if (success) {
      setShowStatusModal(false);
    } else {
      alert('Failed to update order status');
    }
  };

  if (selectedOrderLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Order not found</p>
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const statusData = statusConfig[selectedOrder.orderStatus];
  const StatusIcon = statusData.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{selectedOrder._id.slice(-8)}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(selectedOrder.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
              statusData.bgColor,
              statusData.color
            )}
          >
            <StatusIcon className="h-4 w-4" />
            {statusData.label}
          </span>
          <Button onClick={openStatusModal}>Update Status</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {selectedOrder.totalItems} item{selectedOrder.totalItems !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>Status history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOrder.statusHistory.map((entry, index) => {
                  const config = statusConfig[entry.status];
                  const Icon = config.icon;
                  const isLast = index === selectedOrder.statusHistory.length - 1;

                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn('p-2 rounded-full', config.bgColor)}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>
                        {!isLast && (
                          <div className="w-0.5 flex-1 bg-muted mt-2" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium capitalize">{entry.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(entry.timestamp)}
                        </p>
                        {entry.note && (
                          <p className="text-sm mt-1 text-muted-foreground italic">
                            "{entry.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{selectedOrder.userName || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedOrder.userEmail || 'N/A'}</span>
              </div>
              <Link to={`/admin/users?search=${selectedOrder.userEmail}`}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Customer
                </Button>
              </Link>
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
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
              <p>{selectedOrder.shippingAddress.address}</p>
              <p>
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                {selectedOrder.shippingAddress.postalCode}
              </p>
              <p>{selectedOrder.shippingAddress.country}</p>
              {selectedOrder.shippingAddress.phone && (
                <p className="flex items-center gap-1 mt-2">
                  <Phone className="h-3 w-3" />
                  {selectedOrder.shippingAddress.phone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={cn(
                    'capitalize font-medium',
                    selectedOrder.paymentStatus === 'paid'
                      ? 'text-green-600'
                      : selectedOrder.paymentStatus === 'failed'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  )}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{formatCurrency(selectedOrder.totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {selectedOrder.trackingInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {selectedOrder.trackingInfo.carrier && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carrier</span>
                    <span>{selectedOrder.trackingInfo.carrier}</span>
                  </div>
                )}
                {selectedOrder.trackingInfo.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking #</span>
                    <span className="font-mono">{selectedOrder.trackingInfo.trackingNumber}</span>
                  </div>
                )}
                {selectedOrder.trackingInfo.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Delivery</span>
                    <span>
                      {new Date(selectedOrder.trackingInfo.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Update Order Status</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStatusModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
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
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleStatusUpdate}
                  disabled={statusUpdateLoading || newStatus === selectedOrder.orderStatus}
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
    </div>
  );
}

export default AdminOrderDetailPage;
