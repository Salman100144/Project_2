import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Loader2 } from 'lucide-react';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute Component
 * Wraps routes that should only be accessible to non-authenticated users
 * Redirects to home if already authenticated (e.g., login/register pages)
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();

  // Show loading while checking auth status
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home (or intended destination) if already authenticated
  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export default GuestRoute;
