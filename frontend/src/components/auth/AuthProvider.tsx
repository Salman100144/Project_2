import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 * Initializes auth state on app load
 * Checks if user has an existing session
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    // Check auth status on mount
    if (!isInitialized) {
      checkAuth();
    }
  }, [checkAuth, isInitialized]);

  return <>{children}</>;
}

export default AuthProvider;
