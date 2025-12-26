import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavLinks = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { to: '/dashboard', label: 'Overview', end: true },
                    { to: '/dashboard/jobs', label: 'Jobs' },
                    { to: '/dashboard/pending', label: 'Pending Approval' },
                    { to: '/dashboard/students', label: 'Students' }
                ];
            case 'corporate':
                return [
                    { to: '/dashboard', label: 'Overview', end: true },
                    { to: '/dashboard/jobs', label: 'My Jobs' },
                    { to: '/dashboard/post-job', label: 'Post New Job' },
                    { to: '/dashboard/applications', label: 'Applications' }
                ];
            case 'student':
                return [
                    { to: '/dashboard', label: 'Overview', end: true },
                    { to: '/dashboard/jobs', label: 'Browse Jobs' },
                    { to: '/dashboard/applications', label: 'My Applications' },
                    { to: '/dashboard/profile', label: 'Profile' }
                ];
            default:
                return [];
        }
    };

    const getRoleBadge = () => {
        const badges = {
            admin: 'University Admin',
            corporate: 'Recruiter',
            student: 'Student'
        };
        return badges[user?.role] || '';
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">Campus Placements</div>

                <nav className="sidebar-nav">
                    {getNavLinks().map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <div className="text-sm text-muted mb-sm">
                        {user?.firstName} {user?.lastName}
                    </div>
                    <div className="badge mb-md">{getRoleBadge()}</div>
                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
