import { Request, Response } from 'express';

/**
 * Auth Controller
 * Handles user-related endpoints that require authentication
 */

/**
 * Get current user profile
 * @route GET /api/users/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  // req.user is attached by requireAuth middleware
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }
  
  res.json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      // @ts-ignore - additional fields
      firstName: req.user.firstName,
      // @ts-ignore
      lastName: req.user.lastName,
      // @ts-ignore
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * Update user profile
 * @route PATCH /api/users/me
 * @access Private
 */
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  // This would update the user via BetterAuth
  // For now, just return the current user
  res.json({
    success: true,
    message: 'Profile update endpoint - implement with BetterAuth API',
    data: req.user,
  });
};
