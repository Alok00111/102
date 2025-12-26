const { pool } = require('../config/database');

/**
 * Corporate Controller
 * Handles job posting, application management, and dashboard
 */

// =====================================================
// JOB MANAGEMENT
// =====================================================

/**
 * Create a new job posting
 */
exports.createJob = async (req, res) => {
    try {
        const {
            universityId,
            title,
            description,
            jobType,
            location,
            isRemote,
            salaryMin,
            salaryMax,
            stipend,
            requiredSkills,
            minCgpa,
            allowedBranches,
            graduationYears,
            experienceRequired,
            applicationDeadline,
            vacancies,
            applicationLink
        } = req.body;

        // Validate required fields
        if (!universityId || !title || !description || !jobType || !applicationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: universityId, title, description, jobType, applicationDeadline'
            });
        }

        // Verify university exists
        const uniCheck = await pool.query(
            'SELECT id FROM universities WHERE id = $1 AND is_active = true',
            [universityId]
        );

        if (uniCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'University not found or inactive'
            });
        }

        // Get corporate's company info
        const corpResult = await pool.query(
            'SELECT company_name, company_logo_url FROM users WHERE id = $1',
            [req.user.id]
        );

        const corporate = corpResult.rows[0];

        // Create job with status 'pending'
        const result = await pool.query(`
      INSERT INTO jobs (
        posted_by, university_id, title, description, company_name, company_logo_url,
        job_type, location, is_remote, salary_min, salary_max, stipend,
        required_skills, min_cgpa, allowed_branches, graduation_years,
        experience_required, application_deadline, vacancies, application_link,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'pending')
      RETURNING *
    `, [
            req.user.id,
            universityId,
            title,
            description,
            corporate.company_name,
            corporate.company_logo_url,
            jobType,
            location || null,
            isRemote || false,
            salaryMin || null,
            salaryMax || null,
            stipend || null,
            requiredSkills || null,
            minCgpa || null,
            allowedBranches || null,
            graduationYears || null,
            experienceRequired || null,
            applicationDeadline,
            vacancies || 1,
            applicationLink || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Job posted successfully. Pending admin approval.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ success: false, message: 'Failed to create job' });
    }
};

/**
 * Get all jobs posted by this corporate
 */
exports.getMyJobs = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT j.*, uni.name as university_name, uni.short_code
      FROM jobs j
      LEFT JOIN universities uni ON j.university_id = uni.id
      WHERE j.posted_by = $1
    `;
        const params = [req.user.id];

        if (status) {
            query += ` AND j.status = $${params.length + 1}`;
            params.push(status);
        }

        query += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
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
      SELECT j.*, uni.name as university_name, uni.short_code
      FROM jobs j
      LEFT JOIN universities uni ON j.university_id = uni.id
      WHERE j.id = $1 AND j.posted_by = $2
    `, [id, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Get application count
        const appCount = await pool.query(
            'SELECT COUNT(*) FROM applications WHERE job_id = $1',
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
        console.error('Get job error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch job' });
    }
};

/**
 * Update job posting (only if pending)
 */
exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if job exists and is pending
        const checkResult = await pool.query(
            'SELECT status FROM jobs WHERE id = $1 AND posted_by = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (checkResult.rows[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only update pending jobs'
            });
        }

        // Build update query dynamically
        const allowedFields = [
            'title', 'description', 'job_type', 'location', 'is_remote',
            'salary_min', 'salary_max', 'stipend', 'required_skills',
            'min_cgpa', 'allowed_branches', 'graduation_years',
            'experience_required', 'application_deadline', 'vacancies', 'application_link'
        ];

        const setClauses = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updates)) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            if (allowedFields.includes(snakeKey)) {
                setClauses.push(`${snakeKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(id, req.user.id);
        const result = await pool.query(`
      UPDATE jobs
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount} AND posted_by = $${paramCount + 1}
      RETURNING *
    `, values);

        res.json({
            success: true,
            message: 'Job updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ success: false, message: 'Failed to update job' });
    }
};

/**
 * Delete job posting
 */
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM jobs WHERE id = $1 AND posted_by = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete job' });
    }
};

// =====================================================
// APPLICATION MANAGEMENT
// =====================================================

/**
 * Get all applications for a specific job
 */
exports.getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Verify job belongs to this corporate
        const jobCheck = await pool.query(
            'SELECT id FROM jobs WHERE id = $1 AND posted_by = $2',
            [jobId, req.user.id]
        );

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        let query = `
      SELECT a.*, u.first_name, u.last_name, u.email, u.phone,
             u.usn, u.branch, u.graduation_year, u.cgpa, u.resume_url
      FROM applications a
      JOIN users u ON a.student_id = u.id
      WHERE a.job_id = $1
    `;
        const params = [jobId];

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
 * Update application status
 */
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, interviewDate, interviewLink, interviewNotes, offeredSalary, offerDeadline } = req.body;

        const validStatuses = ['under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'rejected'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
            });
        }

        // Verify application belongs to a job owned by this corporate
        const appCheck = await pool.query(`
      SELECT a.id FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1 AND j.posted_by = $2
    `, [id, req.user.id]);

        if (appCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const result = await pool.query(`
      UPDATE applications
      SET status = $1,
          interview_date = $2,
          interview_link = $3,
          interview_notes = $4,
          offered_salary = $5,
          offer_deadline = $6
      WHERE id = $7
      RETURNING *
    `, [status, interviewDate || null, interviewLink || null, interviewNotes || null, offeredSalary || null, offerDeadline || null, id]);

        res.json({
            success: true,
            message: 'Application status updated',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ success: false, message: 'Failed to update application' });
    }
};

/**
 * Get specific application details
 */
exports.getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT a.*, u.first_name, u.last_name, u.email, u.phone,
             u.usn, u.branch, u.graduation_year, u.cgpa, u.resume_url,
             j.title as job_title
      FROM applications a
      JOIN users u ON a.student_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1 AND j.posted_by = $2
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

// =====================================================
// UNIVERSITY DISCOVERY
// =====================================================

/**
 * List all universities
 */
exports.getUniversities = async (req, res) => {
    try {
        const { city, search } = req.query;

        let query = 'SELECT id, name, short_code, city, logo_url, website, accreditation FROM universities WHERE is_active = true';
        const params = [];

        if (city) {
            query += ` AND city = $${params.length + 1}`;
            params.push(city);
        }

        if (search) {
            query += ` AND (name ILIKE $${params.length + 1} OR short_code ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY name ASC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get universities error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch universities' });
    }
};

// =====================================================
// DASHBOARD
// =====================================================

/**
 * Get corporate dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Job stats by status
        const jobStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM jobs
      WHERE posted_by = $1
      GROUP BY status
    `, [req.user.id]);

        // Total applications across all jobs
        const appStats = await pool.query(`
      SELECT a.status, COUNT(*) as count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.posted_by = $1
      GROUP BY a.status
    `, [req.user.id]);

        // Universities posted to
        const uniCount = await pool.query(`
      SELECT COUNT(DISTINCT university_id)
      FROM jobs
      WHERE posted_by = $1
    `, [req.user.id]);

        res.json({
            success: true,
            data: {
                jobs: {
                    byStatus: jobStats.rows.reduce((acc, row) => {
                        acc[row.status] = parseInt(row.count);
                        return acc;
                    }, {}),
                    total: jobStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
                },
                applications: {
                    byStatus: appStats.rows.reduce((acc, row) => {
                        acc[row.status] = parseInt(row.count);
                        return acc;
                    }, {}),
                    total: appStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
                },
                universities: parseInt(uniCount.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
};
