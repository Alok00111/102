const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// =====================================================
// PUBLIC AUTHENTICATION ROUTES
// =====================================================

/**
 * POST /api/auth/register
 * Register a new user (student, corporate, admin)
 * Role 'pc' is NOT allowed
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * User login - returns JWT token
 * Only allows: student, corporate, admin roles
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * PUT /api/auth/reset-password
 * Reset password with token
 */
router.put('/reset-password', authController.resetPassword);

// =====================================================
// PROTECTED AUTHENTICATION ROUTES
// =====================================================

/**
 * POST /api/auth/logout
 * User logout - invalidates token
 */
router.post('/logout', authenticate, authController.logout);

/**
 * POST /api/auth/refresh-token
 * Refresh JWT token
 */
router.post('/refresh-token', authenticate, authController.refreshToken);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * PUT /api/auth/change-password
 * Change password (requires current password)
 */
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
