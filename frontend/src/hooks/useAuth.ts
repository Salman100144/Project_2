import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

/**
 * useAuth Hook
 * 
 * Convenience hook that provides auth state and actions.
 * Also handles initial auth check on mount.
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  } = useAuthStore();

  // Check auth status on mount (only once)
  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    isAdmin: user?.role === 'admin',
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };
}

export default useAuth;
