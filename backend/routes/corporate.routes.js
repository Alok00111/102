const express = require('express');
const router = express.Router();
const corporateController = require('../controllers/corporate.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require corporate authentication
router.use(authenticate);
router.use(authorize('corporate'));

// =====================================================
// JOB POSTING & MANAGEMENT
// =====================================================

/**
 * POST /api/corporate/jobs
 * Create a new job posting (status: 'pending')
 */
router.post('/jobs', corporateController.createJob);

/**
 * GET /api/corporate/jobs
 * Get all jobs posted by this corporate
 */
router.get('/jobs', corporateController.getMyJobs);

/**
 * GET /api/corporate/jobs/:id
 * Get specific job details
 */
router.get('/jobs/:id', corporateController.getJobById);

/**
 * PUT /api/corporate/jobs/:id
 * Update job posting (only if still pending)
 */
router.put('/jobs/:id', corporateController.updateJob);

/**
 * DELETE /api/corporate/jobs/:id
 * Delete job posting
 */
router.delete('/jobs/:id', corporateController.deleteJob);

// =====================================================
// APPLICATION MANAGEMENT
// =====================================================

/**
 * GET /api/corporate/applications/:jobId
 * View all applications for a specific job
 */
router.get('/applications/:jobId', corporateController.getJobApplications);

/**
 * PUT /api/corporate/applications/:id/status
 * Update application status (shortlist, interview, offer, reject)
 */
router.put('/applications/:id/status', corporateController.updateApplicationStatus);

/**
 * GET /api/corporate/applications/:id
 * Get specific application details
 */
router.get('/application/:id', corporateController.getApplicationById);

// =====================================================
// UNIVERSITY DISCOVERY
// =====================================================

/**
 * GET /api/corporate/universities
 * List all universities to post jobs
 */
router.get('/universities', corporateController.getUniversities);

// =====================================================
// DASHBOARD
// =====================================================

/**
 * GET /api/corporate/dashboard/stats
 * Get corporate dashboard statistics
 */
router.get('/dashboard/stats', corporateController.getDashboardStats);

module.exports = router;
