import api from '../lib/axios';
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  User 
} from '../types/auth.types';

/**
 * Auth Service
 * Handles all authentication-related API calls
 */

/**
 * Register a new user
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/sign-up/email', credentials);
  return response.data;
};

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/sign-in/email', credentials);
  return response.data;
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  await api.post('/api/auth/sign-out');
};

/**
 * Get the current authenticated user
 * Uses BetterAuth's get-session endpoint which automatically reads cookies
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // BetterAuth's get-session endpoint returns user and session info
    const response = await api.get<{ user: User; session: any }>('/api/auth/get-session');
    return response.data?.user || null;
  } catch (error) {
    // User is not authenticated
    return null;
  }
};

/**
 * Get current session
 */
export const getSession = async (): Promise<AuthResponse | null> => {
  try {
    const response = await api.get<AuthResponse>('/api/auth/get-session');
    return response.data;
  } catch (error) {
    return null;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getSession,
};
