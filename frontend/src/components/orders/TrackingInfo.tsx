import { cn } from '@/lib/utils';
import type { TrackingInfo as TrackingInfoType } from '@/types/order.types';
import { 
  Truck, 
  ExternalLink,
  Calendar,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrackingInfoProps {
  trackingInfo?: TrackingInfoType;
  className?: string;
}

const formatEstimatedDelivery = (dateString?: string) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  let relativeText = '';
  if (diffDays === 0) {
    relativeText = 'Today';
  } else if (diffDays === 1) {
    relativeText = 'Tomorrow';
  } else if (diffDays > 0) {
    relativeText = `In ${diffDays} days`;
  } else {
    relativeText = 'Delivery expected';
  }

  return { formattedDate, relativeText };
};

// Generate tracking URL based on carrier (common carriers)
const getTrackingUrl = (carrier?: string, trackingNumber?: string) => {
  if (!carrier || !trackingNumber) return null;
  
  const carrierUrls: Record<string, string> = {
    'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  };
  
  const normalizedCarrier = carrier.toLowerCase().replace(/[^a-z]/g, '');
  return carrierUrls[normalizedCarrier] || null;
};

export function TrackingInfo({ trackingInfo, className }: TrackingInfoProps) {
  if (!trackingInfo || (!trackingInfo.carrier && !trackingInfo.trackingNumber && !trackingInfo.estimatedDelivery)) {
    return null;
  }

  const deliveryInfo = formatEstimatedDelivery(trackingInfo.estimatedDelivery);
  const trackingUrl = getTrackingUrl(trackingInfo.carrier, trackingInfo.trackingNumber);

  return (
    <div className={cn('p-6 bg-muted/30 rounded-lg', className)}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Truck className="h-5 w-5" />
        Shipping Information
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Carrier */}
        {trackingInfo.carrier && (
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carrier</p>
              <p className="font-medium">{trackingInfo.carrier}</p>
            </div>
          </div>
        )}

        {/* Tracking Number */}
        {trackingInfo.trackingNumber && (
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <p className="font-mono font-medium text-sm">{trackingInfo.trackingNumber}</p>
            </div>
          </div>
        )}

        {/* Estimated Delivery */}
        {deliveryInfo && (
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-medium">{deliveryInfo.relativeText}</p>
              <p className="text-xs text-muted-foreground">{deliveryInfo.formattedDate}</p>
            </div>
          </div>
        )}
      </div>

      {/* Track Package Button */}
      {trackingUrl && (
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
              Track Package
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
