import { cn } from '@/lib/utils';
import type { StatusHistoryEntry, OrderStatus } from '@/types/order.types';
import { 
  Clock, 
  Package, 
  Truck, 
  CheckCircle,
  XCircle,
  Circle
} from 'lucide-react';

interface OrderTimelineProps {
  statusHistory: StatusHistoryEntry[];
  className?: string;
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return Clock;
    case 'processing':
      return Package;
    case 'shipped':
      return Truck;
    case 'delivered':
      return CheckCircle;
    case 'cancelled':
      return XCircle;
    default:
      return Circle;
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    case 'processing':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    case 'shipped':
      return 'text-purple-500 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800';
    case 'delivered':
      return 'text-green-500 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
    case 'cancelled':
      return 'text-red-500 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
  }
};

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Order Placed';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

export function OrderTimeline({ statusHistory, className }: OrderTimelineProps) {
  // Sort by timestamp descending (most recent first)
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (sortedHistory.length === 0) {
    return (
      <div className={cn('p-6 text-center text-muted-foreground', className)}>
        No status history available
      </div>
    );
  }

  return (
    <div className={cn('p-6', className)}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Order Timeline
      </h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

        {/* Timeline Items */}
        <div className="space-y-6">
          {sortedHistory.map((entry, index) => {
            const Icon = getStatusIcon(entry.status);
            const colorClasses = getStatusColor(entry.status);
            const { date, time } = formatDate(entry.timestamp);
            const isLatest = index === 0;

            return (
              <div
                key={`${entry.status}-${entry.timestamp}`}
                className={cn(
                  'relative flex gap-4 pl-12',
                  isLatest && 'animate-in fade-in slide-in-from-top-2'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-2',
                    colorClasses,
                    isLatest && 'ring-4 ring-offset-2 ring-offset-background'
                  )}
                  style={isLatest ? { 
                    boxShadow: '0 0 0 4px var(--ring-color, rgba(0,0,0,0.1))' 
                  } : undefined}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 pb-6',
                  index === sortedHistory.length - 1 && 'pb-0'
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div>
                      <p className={cn(
                        'font-medium',
                        isLatest && 'text-lg'
                      )}>
                        {getStatusLabel(entry.status)}
                      </p>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.note}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{date}</span>
                      <span className="mx-1">at</span>
                      <span>{time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
