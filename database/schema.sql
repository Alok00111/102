-- =====================================================
-- SCHEMA: Corporate-First Campus Placement Platform
-- Multi-tenant PostgreSQL Database Schema
-- Version: 1.0.0
-- =====================================================

-- Enable UUID extension for secure IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: universities
-- Supports multi-tenancy with unique tenant isolation
-- =====================================================
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS universities CASCADE;

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    short_code VARCHAR(20) NOT NULL UNIQUE,  -- e.g., 'IISC', 'RVCE'
    city VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    logo_url VARCHAR(500),
    website VARCHAR(255),
    established_year INTEGER,
    accreditation VARCHAR(100),  -- e.g., 'NAAC A++', 'NBA'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for tenant lookups
CREATE INDEX idx_universities_short_code ON universities(short_code);
CREATE INDEX idx_universities_city ON universities(city);

-- =====================================================
-- TABLE: users
-- Roles: 'student', 'corporate', 'admin' ONLY
-- Multi-tenant: Students/Admins linked to university
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'corporate', 'admin')),
    
    -- Personal Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url VARCHAR(500),
    
    -- University Linkage (NULL for corporate users)
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    
    -- Student-specific fields (NULL for non-students)
    usn VARCHAR(50),  -- University Seat Number
    branch VARCHAR(100),
    graduation_year INTEGER,
    cgpa DECIMAL(3, 2),
    resume_url VARCHAR(500),
    
    -- Corporate-specific fields (NULL for non-corporate)
    company_name VARCHAR(255),
    company_website VARCHAR(255),
    designation VARCHAR(100),
    company_logo_url VARCHAR(500),
    
    -- Account Status
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_university ON users(university_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_graduation_year ON users(graduation_year) WHERE role = 'student';

-- =====================================================
-- TABLE: jobs
-- Status flow: pending → approved/rejected → live
-- University isolation enforced
-- =====================================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Corporate who posted the job
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- University this job is posted for (multi-tenancy)
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    
    -- Job Details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url VARCHAR(500),
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('internship', 'full_time', 'part_time', 'contract')),
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT false,
    
    -- Compensation
    salary_min DECIMAL(12, 2),
    salary_max DECIMAL(12, 2),
    stipend DECIMAL(10, 2),  -- For internships
    currency VARCHAR(10) DEFAULT 'INR',
    
    -- Requirements
    required_skills TEXT[],
    min_cgpa DECIMAL(3, 2),
    allowed_branches TEXT[],
    graduation_years INTEGER[],  -- e.g., [2024, 2025]
    experience_required VARCHAR(100),
    
    -- Application Details
    application_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    vacancies INTEGER DEFAULT 1,
    application_link VARCHAR(500),  -- External link if applicable
    
    -- Status Flow: pending → approved/rejected → live
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected', 'live', 'closed', 'expired')),
    
    -- Admin Review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE  -- When status changed to 'live'
);

-- Indexes for efficient queries
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_university ON jobs(university_id);
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX idx_jobs_deadline ON jobs(application_deadline);
CREATE INDEX idx_jobs_university_status ON jobs(university_id, status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- =====================================================
-- TABLE: applications
-- Student job applications
-- =====================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Application Status
    status VARCHAR(30) NOT NULL DEFAULT 'applied' 
        CHECK (status IN ('applied', 'under_review', 'shortlisted', 'interview_scheduled', 
                          'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn')),
    
    -- Application Details
    cover_letter TEXT,
    resume_url VARCHAR(500),  -- Allow custom resume per application
    expected_salary DECIMAL(12, 2),
    
    -- Interview Details
    interview_date TIMESTAMP WITH TIME ZONE,
    interview_link VARCHAR(500),
    interview_notes TEXT,
    
    -- Offer Details
    offer_letter_url VARCHAR(500),
    offered_salary DECIMAL(12, 2),
    offer_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate applications
    UNIQUE(job_id, student_id)
);

-- Indexes for common queries
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_job_status ON applications(job_id, status);

-- =====================================================
-- TRIGGER: Update updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Schema created successfully! Tables: universities, users, jobs, applications';
END $$;
