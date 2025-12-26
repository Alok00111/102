const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Valid roles in the system - PC role removed
const VALID_ROLES = ['student', 'corporate', 'admin'];

/**
 * Authenticate middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verify user exists and is active
            const result = await pool.query(
                'SELECT id, email, role, university_id, is_active FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            const user = result.rows[0];

            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated.'
                });
            }

            // Validate role is still valid (in case of DB migration)
            if (!VALID_ROLES.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid user role.'
                });
            }

            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                universityId: user.university_id
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired.'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Authorize middleware - checks if user has required role(s)
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Validate allowedRoles don't include 'pc' (extra safety)
        const sanitizedRoles = allowedRoles.filter(role => VALID_ROLES.includes(role));

        if (!sanitizedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

/**
 * University isolation middleware - ensures users only access their own university data
 * Used for admin and student routes
 */
const enforceUniversityIsolation = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    // Corporate users are not tied to a university initially
    if (req.user.role === 'corporate') {
        return next();
    }

    if (!req.user.universityId) {
        return res.status(403).json({
            success: false,
            message: 'User is not associated with any university.'
        });
    }

    // Attach universityId to request for use in controllers
    req.universityId = req.user.universityId;
    next();
};

/**
 * Validate role - utility to check if a role is valid in the system
 * PC role is explicitly NOT valid
 */
const isValidRole = (role) => {
    return VALID_ROLES.includes(role);
};

module.exports = {
    authenticate,
    authorize,
    enforceUniversityIsolation,
    isValidRole,
    VALID_ROLES
};
