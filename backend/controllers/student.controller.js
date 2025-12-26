const { pool } = require('../config/database');

/**
 * Student Controller
 * Handles job browsing, applications, and profile management
 */

// =====================================================
// JOB DISCOVERY
// =====================================================

/**
 * Get all live jobs for student's university
 */
exports.getLiveJobs = async (req, res) => {
    try {
        const { jobType, branch, skills, minSalary, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT j.id, j.title, j.company_name, j.company_logo_url, j.job_type,
             j.location, j.is_remote, j.salary_min, j.salary_max, j.stipend,
             j.required_skills, j.min_cgpa, j.allowed_branches, j.graduation_years,
             j.application_deadline, j.vacancies, j.created_at
      FROM jobs j
      WHERE j.university_id = $1 AND j.status = 'live'
        AND j.application_deadline > CURRENT_TIMESTAMP
    `;
        const params = [req.user.universityId];

        if (jobType) {
            query += ` AND j.job_type = $${params.length + 1}`;
            params.push(jobType);
        }

        if (branch) {
            query += ` AND ($${params.length + 1} = ANY(j.allowed_branches) OR j.allowed_branches IS NULL)`;
            params.push(branch);
        }

        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query += ` AND j.required_skills && $${params.length + 1}`;
            params.push(skillsArray);
        }

        if (minSalary) {
            query += ` AND (j.salary_min >= $${params.length + 1} OR j.stipend >= $${params.length + 1})`;
            params.push(parseInt(minSalary));
        }

        query += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count for pagination
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM jobs WHERE university_id = $1 AND status = 'live' AND application_deadline > CURRENT_TIMESTAMP`,
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
        console.error('Get jobs error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
};

/**
 * Get specific job details
 */
exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT j.*, uni.name as university_name
      FROM jobs j
      LEFT JOIN universities uni ON j.university_id = uni.id
      WHERE j.id = $1 AND j.university_id = $2 AND j.status = 'live'
    `, [id, req.user.universityId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if student has already applied
        const appCheck = await pool.query(
            'SELECT id, status FROM applications WHERE job_id = $1 AND student_id = $2',
            [id, req.user.id]
        );

        res.json({
            success: true,
            data: {
                ...result.rows[0],
                hasApplied: appCheck.rows.length > 0,
                applicationStatus: appCheck.rows[0]?.status || null
            }
        });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch job' });
    }
};

// =====================================================
// JOB APPLICATIONS
// =====================================================

/**
 * Apply to a job
 */
exports.applyToJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { coverLetter, resumeUrl, expectedSalary } = req.body;

        // Check if job exists, is live, and deadline hasn't passed
        const jobCheck = await pool.query(`
      SELECT id, title, company_name, min_cgpa, allowed_branches, graduation_years
      FROM jobs
      WHERE id = $1 AND university_id = $2 AND status = 'live'
        AND application_deadline > CURRENT_TIMESTAMP
    `, [id, req.user.universityId]);

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or application deadline has passed'
            });
        }

        const job = jobCheck.rows[0];

        // Check if already applied
        const existingApp = await pool.query(
            'SELECT id FROM applications WHERE job_id = $1 AND student_id = $2',
            [id, req.user.id]
        );

        if (existingApp.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Get student profile for eligibility check
        const studentResult = await pool.query(
            'SELECT cgpa, branch, graduation_year, resume_url FROM users WHERE id = $1',
            [req.user.id]
        );
        const student = studentResult.rows[0];

        // Check CGPA eligibility
        if (job.min_cgpa && student.cgpa < job.min_cgpa) {
            return res.status(403).json({
                success: false,
                message: `Minimum CGPA requirement: ${job.min_cgpa}. Your CGPA: ${student.cgpa}`
            });
        }

        // Check branch eligibility
        if (job.allowed_branches && !job.allowed_branches.includes(student.branch)) {
            return res.status(403).json({
                success: false,
                message: `This job is not open for ${student.branch} students`
            });
        }

        // Check graduation year eligibility
        if (job.graduation_years && !job.graduation_years.includes(student.graduation_year)) {
            return res.status(403).json({
                success: false,
                message: `This job is for ${job.graduation_years.join(', ')} graduates only`
            });
        }

        // Create application
        const result = await pool.query(`
      INSERT INTO applications (job_id, student_id, cover_letter, resume_url, expected_salary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, req.user.id, coverLetter || null, resumeUrl || student.resume_url, expectedSalary || null]);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Apply to job error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit application' });
    }
};

/**
 * Get all applications by this student
 */
exports.getMyApplications = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT a.*, j.title as job_title, j.company_name, j.company_logo_url,
             j.job_type, j.location, j.is_remote
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.student_id = $1
    `;
        const params = [req.user.id];

        if (status) {
            query += ` AND a.status = $${params.length + 1}`;
            params.push(status);
        }

        query += ` ORDER BY a.applied_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applications' });
    }
};

/**
 * Get specific application details
 */
exports.getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT a.*, j.title as job_title, j.company_name, j.company_logo_url,
             j.job_type, j.location, j.is_remote, j.description as job_description
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1 AND a.student_id = $2
    `, [id, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch application' });
    }
};

/**
 * Withdraw an application
 */
exports.withdrawApplication = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if application exists and is in a withdrawable state
        const appCheck = await pool.query(
            'SELECT status FROM applications WHERE id = $1 AND student_id = $2',
            [id, req.user.id]
        );

        if (appCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const nonWithdrawable = ['accepted', 'rejected', 'withdrawn'];
        if (nonWithdrawable.includes(appCheck.rows[0].status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot withdraw application with status: ${appCheck.rows[0].status}`
            });
        }

        // Update status to withdrawn
        await pool.query(
            "UPDATE applications SET status = 'withdrawn' WHERE id = $1",
            [id]
        );

        res.json({
            success: true,
            message: 'Application withdrawn successfully'
        });
    } catch (error) {
        console.error('Withdraw application error:', error);
        res.status(500).json({ success: false, message: 'Failed to withdraw application' });
    }
};

// =====================================================
// PROFILE MANAGEMENT
// =====================================================

/**
 * Get student profile
 */
exports.getProfile = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
             u.profile_picture_url, u.usn, u.branch, u.graduation_year,
             u.cgpa, u.resume_url, u.is_verified, u.created_at,
             uni.name as university_name, uni.short_code
      FROM users u
      LEFT JOIN universities uni ON u.university_id = uni.id
      WHERE u.id = $1
    `, [req.user.id]);

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

/**
 * Update student profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, branch, graduationYear, cgpa } = req.body;

        const result = await pool.query(`
      UPDATE users
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          branch = COALESCE($4, branch),
          graduation_year = COALESCE($5, graduation_year),
          cgpa = COALESCE($6, cgpa)
      WHERE id = $7
      RETURNING id, email, first_name, last_name, phone, branch, graduation_year, cgpa
    `, [firstName, lastName, phone, branch, graduationYear, cgpa, req.user.id]);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

/**
 * Upload resume
 */
exports.uploadResume = async (req, res) => {
    try {
        const { resumeUrl } = req.body;

        if (!resumeUrl) {
            return res.status(400).json({
                success: false,
                message: 'Resume URL is required'
            });
        }

        await pool.query(
            'UPDATE users SET resume_url = $1 WHERE id = $2',
            [resumeUrl, req.user.id]
        );

        res.json({
            success: true,
            message: 'Resume updated successfully'
        });
    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({ success: false, message: 'Failed to update resume' });
    }
};

// =====================================================
// DASHBOARD
// =====================================================

/**
 * Get student dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Application stats by status
        const appStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM applications
      WHERE student_id = $1
      GROUP BY status
    `, [req.user.id]);

        // Total live jobs available
        const liveJobs = await pool.query(`
      SELECT COUNT(*) FROM jobs
      WHERE university_id = $1 AND status = 'live'
        AND application_deadline > CURRENT_TIMESTAMP
    `, [req.user.universityId]);

        // Offers received
        const offers = appStats.rows.find(s => s.status === 'offered');

        res.json({
            success: true,
            data: {
                applications: {
                    byStatus: appStats.rows.reduce((acc, row) => {
                        acc[row.status] = parseInt(row.count);
                        return acc;
                    }, {}),
                    total: appStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
                },
                availableJobs: parseInt(liveJobs.rows[0].count),
                offers: offers ? parseInt(offers.count) : 0
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
};
