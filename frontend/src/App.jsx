import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import PendingJobs from './pages/admin/PendingJobs';
import AdminJobs from './pages/admin/Jobs';
import AdminStudents from './pages/admin/Students';

// Corporate pages
import CorporateDashboard from './pages/corporate/Dashboard';
import CorporateJobs from './pages/corporate/Jobs';
import PostJob from './pages/corporate/PostJob';
import CorporateApplications from './pages/corporate/Applications';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import BrowseJobs from './pages/student/BrowseJobs';
import MyApplications from './pages/student/MyApplications';
import StudentProfile from './pages/student/Profile';

import './index.css';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

// Dashboard router based on role
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return (
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="pending" element={<PendingJobs />} />
          <Route path="students" element={<AdminStudents />} />
        </Routes>
      );
    case 'corporate':
      return (
        <Routes>
          <Route index element={<CorporateDashboard />} />
          <Route path="jobs" element={<CorporateJobs />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="applications" element={<CorporateApplications />} />
        </Routes>
      );
    case 'student':
      return (
        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path="jobs" element={<BrowseJobs />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="profile" element={<StudentProfile />} />
        </Routes>
      );
    default:
      return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardRouter />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
