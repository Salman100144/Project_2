import { Request, Response, NextFunction } from 'express';
import { auth, Session } from '../lib';
import { fromNodeHeaders } from 'better-auth/node';

// Extend Express Request to include session
declare global {
  namespace Express {
    interface Request {
      session?: Session['session'];
      user?: Session['user'];
    }
  }
}

/**
 * Authentication Middleware
 * Attaches session and user to request if authenticated
 * Does NOT block unauthenticated requests
 */
export const attachSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    if (session) {
      req.session = session.session;
      req.user = session.user;
    }
    
    next();
  } catch (error) {
    // Continue without session on error
    next();
  }
};

/**
 * Require Authentication Middleware
 * Blocks unauthenticated requests with 401
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }
    
    req.session = session.session;
    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Require Admin Role Middleware
 * Blocks non-admin users with 403
 * Must be used after requireAuth
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }
  
  // Check if user has admin role
  // @ts-ignore - role is in additionalFields
  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }
  
  next();
};
