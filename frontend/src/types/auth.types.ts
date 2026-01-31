/**
 * Auth Types
 * Matches backend BetterAuth user schema
 */

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}
