const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require student authentication
router.use(authenticate);
router.use(authorize('student'));

// =====================================================
// JOB DISCOVERY
// =====================================================

/**
 * GET /api/student/jobs
 * List all live jobs for student's university
 * Supports filtering by job_type, branch, skills
 */
router.get('/jobs', studentController.getLiveJobs);

/**
 * GET /api/student/jobs/:id
 * Get specific job details
 */
router.get('/jobs/:id', studentController.getJobById);

// =====================================================
// JOB APPLICATIONS
// =====================================================

/**
 * POST /api/student/jobs/:id/apply
 * Apply to a job
 */
router.post('/jobs/:id/apply', studentController.applyToJob);

/**
 * GET /api/student/applications
 * Get all applications by this student
 */
router.get('/applications', studentController.getMyApplications);

/**
 * GET /api/student/applications/:id
 * Get specific application details
 */
router.get('/applications/:id', studentController.getApplicationById);

/**
 * DELETE /api/student/applications/:id
 * Withdraw an application
 */
router.delete('/applications/:id', studentController.withdrawApplication);

// =====================================================
// PROFILE MANAGEMENT
// =====================================================

/**
 * GET /api/student/profile
 * Get student profile
 */
router.get('/profile', studentController.getProfile);

/**
 * PUT /api/student/profile
 * Update student profile
 */
router.put('/profile', studentController.updateProfile);

/**
 * POST /api/student/resume
 * Upload/update resume
 */
router.post('/resume', studentController.uploadResume);

// =====================================================
// DASHBOARD
// =====================================================

/**
 * GET /api/student/dashboard/stats
 * Get student dashboard statistics
 */
router.get('/dashboard/stats', studentController.getDashboardStats);

module.exports = router;
