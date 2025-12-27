const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { isValidRole, VALID_ROLES } = require('../middleware/auth');

/**
 * Auth Controller (Full Version)
 * Updated to match the new simple Database Schema
 */

// ==========================================
// 1. REGISTER
// ==========================================
exports.register = async (req, res) => {
    try {
        const {
            email,
            password,
            role,
            firstName,
            lastName,
            universityId,
            // Optional fields
            usn,
            companyName,
            designation
        } = req.body;

        // Validate required fields
        if (!email || !password || !role || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, password, role, name'
            });
        }

        if (!isValidRole(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`
            });
        }

        // Check if email exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Combine Name
        const fullName = `${firstName} ${lastName}`.trim();

        // Insert User (Matched to your current DB columns)
        const result = await pool.query(`
            INSERT INTO users (
                name, email, password, role, university_id, 
                usn, company_name, designation
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, email, role, name
        `, [
            fullName,
            email.toLowerCase(),
            passwordHash,
            role,
            (role === 'corporate') ? null : universityId, // Corporate doesn't need Uni ID
            usn || null,
            companyName || null,
            designation || null
        ]);

        const user = result.rows[0];

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user, token }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

// ==========================================
// 2. LOGIN
// ==========================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        // Find user
        const result = await pool.query(`
            SELECT id, email, password, role, name, university_id 
            FROM users WHERE email = $1
        `, [email.toLowerCase()]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify Password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    universityId: user.university_id
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// ==========================================
// 3. GET CURRENT USER
// ==========================================
exports.getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.email, u.role, u.name, 
                   u.university_id, u.usn, u.company_name, u.designation,
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
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
};

// ==========================================
// 4. CHANGE PASSWORD
// ==========================================
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both passwords are required' });
        }

        // Get current password hash
        const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        
        // Verify old password
        const isValid = await bcrypt.compare(currentPassword, result.rows[0].password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        // Update DB
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHash, req.user.id]);

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

// ==========================================
// 5. REFRESH TOKEN
// ==========================================
exports.refreshToken = async (req, res) => {
    try {
        const token = jwt.sign(
            { userId: req.user.id, role: req.user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ success: true, data: { token } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to refresh token' });
    }
};

// ==========================================
// 6. UTILITIES (Logout / Forgot PW)
// ==========================================
exports.logout = async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
    res.status(501).json({ success: false, message: 'Feature coming soon' });
};

exports.resetPassword = async (req, res) => {
    res.status(501).json({ success: false, message: 'Feature coming soon' });
};