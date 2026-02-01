import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/order.store';
import { ShippingForm, PaymentForm, OrderSummary } from '@/components/checkout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Loader2, CheckCircle } from 'lucide-react';
import type { ShippingAddress } from '@/types/order.types';

type CheckoutStep = 'shipping' | 'payment' | 'processing';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [error, setError] = useState<string | null>(null);

  const { cart, isLoading: cartLoading, fetchCart } = useCartStore();
  const { 
    clientSecret, 
    shippingAddress,
    createPaymentIntent, 
    confirmOrder,
  } = useOrderStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0) && step !== 'processing') {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate, step]);

  const handleShippingSubmit = async (data: ShippingAddress) => {
    try {
      setError(null);
      await createPaymentIntent(data);
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to process shipping information');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setStep('processing');
      setError(null);
      const order = await confirmOrder(paymentIntentId);
      navigate(`/checkout/success?orderId=${order._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm order');
      setStep('payment');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some products to your cart before checking out.
        </p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'
          }`}>
            {step !== 'shipping' ? <CheckCircle className="h-5 w-5" /> : '1'}
          </div>
          <span className="ml-2 font-medium">Shipping</span>
        </div>
        <div className={`w-16 h-1 mx-4 ${step !== 'shipping' ? 'bg-primary' : 'bg-muted'}`} />
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'payment' || step === 'processing' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {step === 'processing' ? <CheckCircle className="h-5 w-5" /> : '2'}
          </div>
          <span className={`ml-2 font-medium ${step === 'shipping' ? 'text-muted-foreground' : ''}`}>Payment</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <ShippingForm 
              onSubmit={handleShippingSubmit}
              initialData={shippingAddress}
            />
          )}

          {step === 'payment' && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0f172a',
                  },
                },
              }}
            >
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-semibold">Processing your order...</h2>
              <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>

      {/* Test Card Info */}
      {step === 'payment' && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🧪 Test Mode - Use Test Card Numbers
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Card Number:</strong> 4242 4242 4242 4242</p>
            <p><strong>Expiry:</strong> Any future date (e.g., 12/34)</p>
            <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
            <p><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
