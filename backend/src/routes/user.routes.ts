import { Router } from 'express';
import { getMe, updateMe } from '../controllers';
import { requireAuth } from '../middleware';

const router = Router();

/**
 * User Routes
 * All routes here require authentication
 */

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', requireAuth, getMe);

// @route   PATCH /api/users/me
// @desc    Update current user profile
// @access  Private
router.patch('/me', requireAuth, updateMe);

export default router;
