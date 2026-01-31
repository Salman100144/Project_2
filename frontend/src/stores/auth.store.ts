import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterCredentials, AuthError } from '../types/auth.types';
import * as authService from '../services/auth.service';

/**
 * Auth Store State Interface
 */
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: AuthError | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

/**
 * Auth Store
 * Manages authentication state using Zustand
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        error: null,

        /**
         * Login with email and password
         */
        login: async (credentials: LoginCredentials): Promise<boolean> => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authService.login(credentials);
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return true;
          } catch (error: any) {
            const authError: AuthError = {
              message: error.response?.data?.message || 'Login failed. Please try again.',
              code: error.response?.data?.code,
              status: error.response?.status,
            };
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: authError,
            });
            
            return false;
          }
        },

        /**
         * Register a new user
         */
        register: async (credentials: RegisterCredentials): Promise<boolean> => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await authService.register(credentials);
            
            // BetterAuth auto signs in after registration
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            return true;
          } catch (error: any) {
            const authError: AuthError = {
              message: error.response?.data?.message || 'Registration failed. Please try again.',
              code: error.response?.data?.code,
              status: error.response?.status,
            };
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: authError,
            });
            
            return false;
          }
        },

        /**
         * Logout the current user
         */
        logout: async (): Promise<void> => {
          set({ isLoading: true });
          
          try {
            await authService.logout();
          } catch (error) {
            // Even if logout fails on server, clear local state
            console.error('Logout error:', error);
          } finally {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        /**
         * Check if user is authenticated (on app load)
         */
        checkAuth: async (): Promise<void> => {
          // Don't check if already loading
          if (get().isLoading) return;
          
          set({ isLoading: true });
          
          try {
            const user = await authService.getCurrentUser();
            
            set({
              user,
              isAuthenticated: !!user,
              isLoading: false,
              isInitialized: true,
            });
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            });
          }
        },

        /**
         * Clear any auth errors
         */
        clearError: (): void => {
          set({ error: null });
        },

        /**
         * Set user directly (for session refresh, etc.)
         */
        setUser: (user: User | null): void => {
          set({
            user,
            isAuthenticated: !!user,
          });
        },
      }),
      {
        name: 'auth-storage',
        // Only persist certain fields
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');

export default useAuthStore;
