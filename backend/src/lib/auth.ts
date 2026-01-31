import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { config } from '../config';

/**
 * BetterAuth Configuration
 * 
 * This sets up authentication with:
 * - Email/Password authentication
 * - MongoDB for storing users and sessions
 * - Secure session management with HTTP-only cookies
 */

// Create a separate MongoDB client for BetterAuth
const client = new MongoClient(config.mongodbUri);
const db = client.db();

export const auth = betterAuth({
  // Database adapter - uses MongoDB
  database: mongodbAdapter(db),
  
  // Base URL for auth endpoints
  baseURL: `http://localhost:${config.port}`,
  
  // Secret key for signing tokens/sessions
  secret: config.authSecret,
  
  // Email & Password authentication
  emailAndPassword: {
    enabled: true,
    // Minimum password length
    minPasswordLength: 8,
    // Auto sign in after registration
    autoSignIn: true,
  },
  
  // Session configuration
  session: {
    // Session expires after 7 days
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    // Update session expiry on each request
    updateAge: 60 * 60 * 24, // 1 day in seconds
    // Use secure cookies
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
  
  // Trusted origins for CORS
  trustedOrigins: [config.frontendUrl],
  
  // Advanced options
  advanced: {
    // Use secure cookies in production
    useSecureCookies: config.nodeEnv === 'production',
    // Cookie prefix
    cookiePrefix: 'ecommerce',
  },
  
  // User schema - additional fields beyond email/password
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: false,
      },
      lastName: {
        type: 'string',
        required: false,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'customer',
      },
    },
  },
});

// Export types for use in controllers
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
