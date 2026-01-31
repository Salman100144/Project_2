import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order.types';
import { 
  Clock, 
  Package, 
  Truck, 
  CheckCircle,
  XCircle
} from 'lucide-react';

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
  className?: string;
}

/**
 * Order status flow: pending -> processing -> shipped -> delivered
 * cancelled can happen at any point
 */
const statusSteps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'pending', label: 'Pending', icon: Clock },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const getStatusIndex = (status: OrderStatus): number => {
  if (status === 'cancelled') return -1;
  return statusSteps.findIndex((step) => step.status === status);
};

export function OrderStatusTracker({ currentStatus, className }: OrderStatusTrackerProps) {
  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <div className={cn('p-6', className)}>
        <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <XCircle className="h-8 w-8 text-red-500" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
            <p className="text-sm text-red-600 dark:text-red-500">
              This order has been cancelled
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-6', className)}>
      {/* Desktop View */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          {/* Progress Line Background */}
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted -translate-y-1/2 mx-8" />
          
          {/* Progress Line Active */}
          <div 
            className="absolute left-0 top-1/2 h-1 bg-primary -translate-y-1/2 mx-8 transition-all duration-500"
            style={{ 
              width: currentIndex === 0 
                ? '0%' 
                : `calc(${(currentIndex / (statusSteps.length - 1)) * 100}% - 4rem)` 
            }}
          />

          {/* Status Steps */}
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div
                key={step.status}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20',
                    isPending && 'bg-background border-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium',
                    (isCompleted || isCurrent) && 'text-primary',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-3">
        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.status}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                isCurrent && 'bg-primary/10',
                isPending && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-primary border-primary text-primary-foreground',
                  isPending && 'bg-background border-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    'font-medium',
                    (isCompleted || isCurrent) && 'text-foreground',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-muted-foreground">Current status</p>
                )}
                {isCompleted && (
                  <p className="text-xs text-green-600">Completed</p>
                )}
              </div>
              {isCompleted && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
