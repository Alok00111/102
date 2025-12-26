const { pool } = require('../config/database');

/**
 * Admin Controller
 * Handles job approval, student management, and university dashboard
 */

// =====================================================
// JOB MANAGEMENT
// =====================================================

/**
 * Get all jobs for admin's university
 */
exports.getAllJobs = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT j.*, u.company_name as corporate_name, u.email as corporate_email
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.university_id = $1
    `;
        const params = [req.user.universityId];

        if (status) {
            query += ` AND j.status = $${params.length + 1}`;
            params.push(status);
        }

        query += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM jobs WHERE university_id = $1',
            [req.user.universityId]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
};

/**
 * Get pending jobs awaiting admin approval
 */
exports.getPendingJobs = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT j.*, u.company_name as corporate_name, u.email as corporate_email
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.university_id = $1 AND j.status = 'pending'
      ORDER BY j.created_at ASC
    `, [req.user.universityId]);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching pending jobs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending jobs' });
    }
};

/**
 * Get specific job details
 */
exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT j.*, u.company_name as corporate_name, u.email as corporate_email,
             uni.name as university_name
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN universities uni ON j.university_id = uni.id
      WHERE j.id = $1 AND j.university_id = $2
    `, [id, req.user.universityId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch job' });
    }
};

/**
 * Approve a pending job → status changes to 'live'
 */
exports.approveJob = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if job exists and is pending
        const checkResult = await pool.query(
            'SELECT id, status FROM jobs WHERE id = $1 AND university_id = $2',
            [id, req.user.universityId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (checkResult.rows[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve job with status: ${checkResult.rows[0].status}`
            });
        }

        // Approve the job
        const result = await pool.query(`
      UPDATE jobs
      SET status = 'live',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          published_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [req.user.id, id]);

        res.json({
            success: true,
            message: 'Job approved and is now live',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error approving job:', error);
        res.status(500).json({ success: false, message: 'Failed to approve job' });
    }
};

/**
 * Reject a pending job with reason
 */
exports.rejectJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        // Check if job exists and is pending
        const checkResult = await pool.query(
            'SELECT id, status FROM jobs WHERE id = $1 AND university_id = $2',
            [id, req.user.universityId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (checkResult.rows[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject job with status: ${checkResult.rows[0].status}`
            });
        }

        // Reject the job
        const result = await pool.query(`
      UPDATE jobs
      SET status = 'rejected',
          reviewed_by = $1,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = $2
      WHERE id = $3
      RETURNING *
    `, [req.user.id, reason, id]);

        res.json({
            success: true,
            message: 'Job rejected',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error rejecting job:', error);
        res.status(500).json({ success: false, message: 'Failed to reject job' });
    }
};

// =====================================================
// STUDENT MANAGEMENT
// =====================================================

/**
 * Get all students in admin's university
 */
exports.getAllStudents = async (req, res) => {
    try {
        const { verified, branch, graduation_year, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT id, email, first_name, last_name, phone, usn, branch,
             graduation_year, cgpa, is_verified, created_at
      FROM users
      WHERE university_id = $1 AND role = 'student'
    `;
        const params = [req.user.universityId];

        if (verified !== undefined) {
            query += ` AND is_verified = $${params.length + 1}`;
            params.push(verified === 'true');
        }

        if (branch) {
            query += ` AND branch = $${params.length + 1}`;
            params.push(branch);
        }

        if (graduation_year) {
            query += ` AND graduation_year = $${params.length + 1}`;
            params.push(parseInt(graduation_year));
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
};

/**
 * Get specific student details
 */
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, profile_picture_url,
             usn, branch, graduation_year, cgpa, resume_url, is_verified, created_at
      FROM users
      WHERE id = $1 AND university_id = $2 AND role = 'student'
    `, [id, req.user.universityId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get student's application count
        const appCount = await pool.query(
            'SELECT COUNT(*) FROM applications WHERE student_id = $1',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...result.rows[0],
                application_count: parseInt(appCount.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch student' });
    }
};

/**
 * Verify a student account
 */
exports.verifyStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      UPDATE users
      SET is_verified = true
      WHERE id = $1 AND university_id = $2 AND role = 'student'
      RETURNING id, email, first_name, last_name, is_verified
    `, [id, req.user.universityId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({
            success: true,
            message: 'Student verified successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error verifying student:', error);
        res.status(500).json({ success: false, message: 'Failed to verify student' });
    }
};

// =====================================================
// APPLICATIONS OVERVIEW
// =====================================================

/**
 * Get all applications for university jobs
 */
exports.getAllApplications = async (req, res) => {
    try {
        const { status, job_id, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT a.*, j.title as job_title, j.company_name,
             u.first_name, u.last_name, u.email, u.usn, u.branch
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.student_id = u.id
      WHERE j.university_id = $1
    `;
        const params = [req.user.universityId];

        if (status) {
            query += ` AND a.status = $${params.length + 1}`;
            params.push(status);
        }

        if (job_id) {
            query += ` AND a.job_id = $${params.length + 1}`;
            params.push(job_id);
        }

        query += ` ORDER BY a.applied_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
};

// =====================================================
// DASHBOARD & ANALYTICS
// =====================================================

/**
 * Get admin dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const universityId = req.user.universityId;

        // Get job counts by status
        const jobStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM jobs
      WHERE university_id = $1
      GROUP BY status
    `, [universityId]);

        // Get student count
        const studentCount = await pool.query(`
      SELECT COUNT(*) FROM users
      WHERE university_id = $1 AND role = 'student'
    `, [universityId]);

        // Get verified student count
        const verifiedStudentCount = await pool.query(`
      SELECT COUNT(*) FROM users
      WHERE university_id = $1 AND role = 'student' AND is_verified = true
    `, [universityId]);

        // Get application stats
        const applicationStats = await pool.query(`
      SELECT a.status, COUNT(*) as count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.university_id = $1
      GROUP BY a.status
    `, [universityId]);

        // Get recent pending jobs count
        const pendingJobs = jobStats.rows.find(s => s.status === 'pending');

        res.json({
            success: true,
            data: {
                jobs: {
                    byStatus: jobStats.rows.reduce((acc, row) => {
                        acc[row.status] = parseInt(row.count);
                        return acc;
                    }, {}),
                    pendingReview: pendingJobs ? parseInt(pendingJobs.count) : 0
                },
                students: {
                    total: parseInt(studentCount.rows[0].count),
                    verified: parseInt(verifiedStudentCount.rows[0].count)
                },
                applications: {
                    byStatus: applicationStats.rows.reduce((acc, row) => {
                        acc[row.status] = parseInt(row.count);
                        return acc;
                    }, {})
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
};

/**
 * Create university announcement
 */
exports.createAnnouncement = async (req, res) => {
    // TODO: Implement announcements table and logic
    res.status(501).json({
        success: false,
        message: 'Announcements feature coming soon'
    });
};
