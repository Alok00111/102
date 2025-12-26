const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { isValidRole, VALID_ROLES } = require('../middleware/auth');

/**
 * Auth Controller
 * Handles registration, login, password management
 * PC role is NOT allowed
 */

/**
 * Register a new user
 */
exports.register = async (req, res) => {
    try {
        const {
            email,
            password,
            role,
            firstName,
            lastName,
            phone,
            universityId,
            // Student fields
            usn,
            branch,
            graduationYear,
            // Corporate fields
            companyName,
            companyWebsite,
            designation
        } = req.body;

        // Validate required fields
        if (!email || !password || !role || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, password, role, firstName, lastName'
            });
        }

        // Validate role - PC role is NOT allowed
        if (!isValidRole(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`
            });
        }

        // Validate university for students and admins
        if ((role === 'student' || role === 'admin') && !universityId) {
            return res.status(400).json({
                success: false,
                message: 'University is required for students and admins'
            });
        }

        // Validate student-specific fields
        if (role === 'student' && (!usn || !branch || !graduationYear)) {
            return res.status(400).json({
                success: false,
                message: 'USN, branch, and graduation year are required for students'
            });
        }

        // Validate corporate-specific fields
        if (role === 'corporate' && (!companyName || !designation)) {
            return res.status(400).json({
                success: false,
                message: 'Company name and designation are required for corporate users'
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await pool.query(`
      INSERT INTO users (
        email, password_hash, role, first_name, last_name, phone,
        university_id, usn, branch, graduation_year,
        company_name, company_website, designation
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, email, role, first_name, last_name
    `, [
            email.toLowerCase(),
            passwordHash,
            role,
            firstName,
            lastName,
            phone || null,
            role === 'corporate' ? null : universityId,
            usn || null,
            branch || null,
            graduationYear || null,
            companyName || null,
            companyWebsite || null,
            designation || null
        ]);

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

/**
 * User login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const result = await pool.query(`
      SELECT id, email, password_hash, role, first_name, last_name,
             university_id, is_active, is_verified
      FROM users
      WHERE email = $1
    `, [email.toLowerCase()]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify role is valid (reject PC users even if they exist in DB)
        if (!isValidRole(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Your account role is no longer supported. Please contact support.'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    universityId: user.university_id,
                    isVerified: user.is_verified
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.phone,
             u.profile_picture_url, u.university_id, u.usn, u.branch,
             u.graduation_year, u.cgpa, u.resume_url, u.company_name,
             u.company_website, u.designation, u.is_verified,
             uni.name as university_name
      FROM users u
      LEFT JOIN universities uni ON u.university_id = uni.id
      WHERE u.id = $1
    `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user' });
    }
};

/**
 * Logout (client should discard token)
 */
exports.logout = async (req, res) => {
    // In a stateless JWT setup, logout is handled client-side
    // Could implement token blacklisting for enhanced security
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

/**
 * Refresh token
 */
exports.refreshToken = async (req, res) => {
    try {
        const token = jwt.sign(
            { userId: req.user.id, role: req.user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            data: { token }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ success: false, message: 'Failed to refresh token' });
    }
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res) => {
    // TODO: Implement email sending with reset token
    res.status(501).json({
        success: false,
        message: 'Password reset feature coming soon'
    });
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res) => {
    // TODO: Implement password reset with token verification
    res.status(501).json({
        success: false,
        message: 'Password reset feature coming soon'
    });
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Get user's current password hash
        const result = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [passwordHash, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};
