const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// =====================================================
// JOB MANAGEMENT (Admin Review)
// =====================================================

/**
 * GET /api/admin/jobs
 * List all jobs for the admin's university
 */
router.get('/jobs', adminController.getAllJobs);

/**
 * GET /api/admin/jobs/pending
 * List pending jobs awaiting admin approval
 */
router.get('/jobs/pending', adminController.getPendingJobs);

/**
 * GET /api/admin/jobs/:id
 * Get specific job details
 */
router.get('/jobs/:id', adminController.getJobById);

/**
 * PUT /api/admin/jobs/:id/approve
 * Approve a pending job → status changes to 'live'
 */
router.put('/jobs/:id/approve', adminController.approveJob);

/**
 * PUT /api/admin/jobs/:id/reject
 * Reject a pending job with reason
 */
router.put('/jobs/:id/reject', adminController.rejectJob);

// =====================================================
// STUDENT MANAGEMENT
// =====================================================

/**
 * GET /api/admin/students
 * List all students in the admin's university
 */
router.get('/students', adminController.getAllStudents);

/**
 * GET /api/admin/students/:id
 * Get specific student details
 */
router.get('/students/:id', adminController.getStudentById);

/**
 * PUT /api/admin/students/:id/verify
 * Verify a student account
 */
router.put('/students/:id/verify', adminController.verifyStudent);

// =====================================================
// APPLICATIONS OVERVIEW
// =====================================================

/**
 * GET /api/admin/applications
 * View all applications for university jobs
 */
router.get('/applications', adminController.getAllApplications);

// =====================================================
// DASHBOARD & ANALYTICS
// =====================================================

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

/**
 * POST /api/admin/announcements
 * Post university announcement
 */
router.post('/announcements', adminController.createAnnouncement);

module.exports = router;
