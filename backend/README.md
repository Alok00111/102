# Campus Placement Platform - Backend

A **Corporate-First** campus placement platform built with Node.js, Express, and PostgreSQL.

## Architecture

```
Corporate Posts Job → Admin Approves → Students Apply
```

**Roles**: `student`, `corporate`, `admin` (PC role removed)

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
```bash
# Create PostgreSQL database
createdb campus_placement

# Run schema
psql -d campus_placement -f ../database/schema.sql

# Seed Bangalore universities
psql -d campus_placement -f ../database/seed_universities.sql
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `POST /api/auth/register` | Register user |
| Auth | `POST /api/auth/login` | Login |
| Corporate | `POST /api/corporate/jobs` | Create job (pending) |
| Admin | `PUT /api/admin/jobs/:id/approve` | Approve job → live |
| Student | `GET /api/student/jobs` | View live jobs |
| Student | `POST /api/student/jobs/:id/apply` | Apply to job |

## Database Tables

- `universities` - Multi-tenant support
- `users` - Students, Corporates, Admins
- `jobs` - Status: pending → approved/rejected → live
- `applications` - Student job applications
